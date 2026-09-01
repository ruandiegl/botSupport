import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import type { AgentNotification, NotificationType } from "@/types";
import { NOTIFICATION_RECEIVED_EVENT, OPEN_NOTIFICATIONS_EVENT } from "@/hooks/use-notifications";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";

const CHANNEL_NAME = "gtfbot-notification-attention";
const CLAIM_PREFIX = "gtfbot-notification-claim:";
const CLAIM_TTL_MS = 10 * 60 * 1000;
const SOUND_COOLDOWN_MS = 1_500;
const DEFAULT_TITLE = "GTF-Bot — Operação Torre Forte";

const actionableTypes = new Set<NotificationType>([
  "NEW_QUEUE_CONVERSATION",
  "NEW_MESSAGE",
  "ASSIGNED_CONVERSATION",
  "CONVERSATION_DELEGATED",
  "DELEGATION_RESPONSE",
  "INACTIVITY_CONTINUED",
  "UNRESOLVED_REMINDER",
]);

const genericTitles: Partial<Record<NotificationType, string>> = {
  NEW_QUEUE_CONVERSATION: "Novo chamado na fila",
  NEW_MESSAGE: "Nova mensagem recebida",
  ASSIGNED_CONVERSATION: "Atendimento assumido",
  CONVERSATION_DELEGATED: "Chamado delegado para você",
  DELEGATION_RESPONSE: "Resposta da delegação",
  INACTIVITY_CONTINUED: "Chamado retomado pelo cliente",
  UNRESOLVED_REMINDER: "Chamado aguardando atenção",
};

const genericBodies: Partial<Record<NotificationType, string>> = {
  NEW_QUEUE_CONVERSATION: "Uma nova conversa aguarda atendimento.",
  NEW_MESSAGE: "Uma conversa recebeu uma nova mensagem.",
  ASSIGNED_CONVERSATION: "Um atendimento foi atribuído a você.",
  CONVERSATION_DELEGATED: "Um atendimento foi delegado para você.",
  DELEGATION_RESPONSE: "Uma delegação recebeu uma resposta.",
  INACTIVITY_CONTINUED: "O cliente escolheu continuar o atendimento.",
  UNRESOLVED_REMINDER: "Uma conversa precisa da sua atenção.",
};

type AttentionPayload = Pick<AgentNotification, "id" | "type" | "title" | "body" | "conversationId" | "createdAt" | "dedupeKey">;

type BroadcastMessage = {
  source: string;
  notification: AttentionPayload;
};

function isAwayFromTab() {
  if (typeof document === "undefined") return false;
  const hidden = document.visibilityState === "hidden";
  const unfocused = typeof document.hasFocus === "function" && !document.hasFocus();
  return hidden || unfocused;
}

function safeTitle(notification: AttentionPayload) {
  return genericTitles[notification.type] || notification.title || "Atualização de atendimento";
}

function safeBody(notification: AttentionPayload) {
  return genericBodies[notification.type] || "Uma conversa precisa da sua atenção.";
}

function toBroadcastPayload(notification: AgentNotification): AttentionPayload {
  return {
    id: notification.id,
    type: notification.type,
    title: safeTitle(notification),
    body: safeBody(notification),
    conversationId: notification.conversationId ?? null,
    createdAt: notification.createdAt,
    dedupeKey: notification.dedupeKey ?? null,
  };
}

function getTabId() {
  const fallback = () => {
    try {
      return `tab-${crypto.randomUUID()}`;
    } catch {
      return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  };
  try {
    const existing = sessionStorage.getItem("gtfbot-tab-id");
    if (existing) return existing;
    const id = fallback();
    sessionStorage.setItem("gtfbot-tab-id", id);
    return id;
  } catch {
    return fallback();
  }
}

function claimForExternalAlert(notification: AttentionPayload, tabId: string) {
  if (typeof localStorage === "undefined") return true;
  const claimKey = `${CLAIM_PREFIX}${notification.id || notification.dedupeKey || notification.createdAt}`;
  try {
    const now = Date.now();
    const current = localStorage.getItem(claimKey);
    const timestamp = current ? Number(current.split(":", 1)[0]) : 0;
    if (timestamp && now - timestamp < CLAIM_TTL_MS) return false;
    const token = `${now}:${tabId}`;
    localStorage.setItem(claimKey, token);
    // A read-after-write makes the common race between two open tabs resolve
    // to the tab whose token remains in storage.
    return localStorage.getItem(claimKey) === token;
  } catch {
    // Storage can be disabled in private browsing. Local alerts still work.
    return true;
  }
}

/** Play a short attention tone. The caller should invoke it from a user
 * gesture at least once to satisfy browser autoplay policies. */
export async function playNotificationSound() {
  if (typeof window === "undefined") return false;
  const AudioContextConstructor = window.AudioContext
    || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return false;

  try {
    const context = new AudioContextConstructor();
    if (context.state === "suspended") await context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.13);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.17);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
    oscillator.addEventListener("ended", () => { void context.close(); }, { once: true });
    return true;
  } catch {
    // A browser may reject audio until a user gesture. Do not affect alerts.
    return false;
  }
}

function createFaviconDataUri(count: number) {
  const label = count > 99 ? "99+" : String(count);
  const fontSize = label.length > 2 ? 18 : 23;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0d111d"/><path d="M13 13h20v20H13z" fill="#00f0ff"/><path d="M31 31h20v20H31z" fill="#0066ff"/><circle cx="45" cy="19" r="17" fill="#10b981"/><text x="45" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="#fff">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function updateTabIndicators(count: number, baseTitle: string, favicon: HTMLLinkElement | null, originalFavicon: string | null) {
  if (typeof document === "undefined") return;
  if (count > 0) {
    document.title = `(${count > 99 ? "99+" : count}) ${baseTitle}`;
    if (favicon) favicon.href = createFaviconDataUri(count);
  } else {
    document.title = baseTitle;
    if (favicon && originalFavicon) favicon.href = originalFavicon;
  }
}

export function useAttentionNotifications(enabled = true) {
  const [, setLocation] = useLocation();
  const { preference } = useNotificationPreferences(enabled);
  const [pendingCount, setPendingCount] = useState(0);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const tabIdRef = useRef<string>("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastAlertAtRef = useRef(0);
  const originalFaviconRef = useRef<string | null>(null);

  const testSound = useCallback(() => playNotificationSound(), []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof document === "undefined") {
      updateTabIndicators(0, DEFAULT_TITLE, null, null);
      setPendingCount(0);
      return;
    }

    const baseTitle = document.title.replace(/^\(\d+\+?\)\s+/, "") || DEFAULT_TITLE;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!originalFaviconRef.current) originalFaviconRef.current = favicon?.href || "/grupogtf-logo.svg";
    const originalFavicon = originalFaviconRef.current;
    tabIdRef.current = tabIdRef.current || getTabId();

    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;
        channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
          if (!event.data || event.data.source === tabIdRef.current) return;
          processIncoming(event.data.notification, true);
        };
      }
    } catch {
      channelRef.current = null;
    }

    const resetIndicators = () => {
      setPendingCount(0);
      updateTabIndicators(0, baseTitle, favicon, originalFavicon);
    };

    const processIncoming = (notification: AttentionPayload, remote: boolean) => {
      if (!notification?.id || !actionableTypes.has(notification.type)) return;
      if (seenIdsRef.current.has(notification.id)) return;
      seenIdsRef.current.add(notification.id);

      if (!remote) {
        channelRef.current?.postMessage({ source: tabIdRef.current, notification });
      }

      if (!isAwayFromTab()) return;
      setPendingCount((count) => {
        const next = count + 1;
        updateTabIndicators(next, baseTitle, favicon, originalFavicon);
        return next;
      });

      const browserAvailable = typeof Notification !== "undefined" && Notification.permission === "granted";
      const shouldNotify = preference.browserEnabled && browserAvailable;
      const shouldSound = preference.soundEnabled;
      if ((!shouldNotify && !shouldSound) || !claimForExternalAlert(notification, tabIdRef.current)) return;

      const now = Date.now();
      if (now - lastAlertAtRef.current < SOUND_COOLDOWN_MS) return;
      lastAlertAtRef.current = now;

      if (shouldSound) void playNotificationSound();
      if (shouldNotify) {
        try {
          const nativeNotification = new Notification(safeTitle(notification), {
            body: safeBody(notification),
            icon: "/grupogtf-logo.svg",
            tag: `gtfbot-${notification.id}`,
          });
          nativeNotification.onclick = () => {
            nativeNotification.close();
            window.focus();
            if (notification.conversationId) setLocation(`/conversation/${notification.conversationId}`);
            else window.dispatchEvent(new Event(OPEN_NOTIFICATIONS_EVENT));
          };
        } catch {
          // Permission can change between the feature check and construction.
        }
      }
    };

    const handleBrowserEvent = (event: Event) => {
      const notification = (event as CustomEvent<AgentNotification>).detail;
      if (notification) processIncoming(toBroadcastPayload(notification), false);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && document.hasFocus()) resetIndicators();
    };

    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, handleBrowserEvent);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", resetIndicators);
    return () => {
      window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, handleBrowserEvent);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", resetIndicators);
      channelRef.current?.close();
      channelRef.current = null;
      updateTabIndicators(0, baseTitle, favicon, originalFavicon);
      setPendingCount(0);
    };
    // Notification preferences are intentionally dependencies: changing a
    // switch updates future alerts without adding another socket listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, preference.browserEnabled, preference.soundEnabled, setLocation]);

  return { pendingCount, testSound };
}
