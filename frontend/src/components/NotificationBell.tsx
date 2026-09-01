import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Inbox, Volume2, VolumeX, X } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { OPEN_NOTIFICATIONS_EVENT, useNotifications } from "@/hooks/use-notifications";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { playNotificationSound } from "@/hooks/use-attention-notifications";
import { Checkbox } from "@/components/ui/checkbox";
import type { AgentNotification } from "@/types";

const notificationTypeLabel: Record<string, string> = {
  NEW_QUEUE_CONVERSATION: "Novo chamado na fila",
  NEW_MESSAGE: "Nova mensagem",
  ASSIGNED_CONVERSATION: "Atendimento assumido",
  CONVERSATION_DELEGATED: "Chamado delegado para você",
  DELEGATION_RESPONSE: "Resposta da delegação",
  INACTIVITY_CONTINUED: "Chamado retomado pelo cliente",
  UNRESOLVED_REMINDER: "Chamado aguardando atenção",
};

function relativeTime(value: string) {
  const age = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(age / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function NotificationItem({ notification, onOpen, onDismiss }: { notification: AgentNotification; onOpen: () => void; onDismiss: () => void }) {
  const unread = !notification.readAt && !notification.dismissedAt;
  return (
    <div
      className={`notification-item ${unread ? "is-unread" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}
    >
      <div className="notification-item-icon" aria-hidden="true"><Bell /></div>
      <div className="notification-item-copy">
        <div className="notification-item-topline">
          <strong>{notification.title || notificationTypeLabel[notification.type] || "Atualização de atendimento"}</strong>
          {unread ? <span className="notification-unread-dot" aria-label="Não lida" /> : <Check data-icon="inline-end" aria-label="Lida" />}
        </div>
        <p>{notification.body}</p>
        <span>{relativeTime(notification.createdAt)}</span>
      </div>
      {
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-destructive"
          aria-label="Dispensar notificação"
          title="Fechar notificação"
          onClick={(event) => { event.stopPropagation(); onDismiss(); }}
        >
          <X />
        </Button>
      }
    </div>
  );
}

export function NotificationBell() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);
  const { notifications, unreadCount, isLoading, isError, markAllRead, dismiss } = useNotifications(true);
  const { preference, updatePreference } = useNotificationPreferences(true);
  const visibleNotifications = notifications.filter((notification) => !notification.dismissedAt);

  useEffect(() => {
    const readPermission = () => {
      setPermission(typeof Notification === "undefined" ? "denied" : Notification.permission);
    };
    readPermission();
    window.addEventListener("focus", readPermission);
    return () => window.removeEventListener("focus", readPermission);
  }, []);

  useEffect(() => {
    const openNotifications = () => setOpen(true);
    window.addEventListener(OPEN_NOTIFICATIONS_EVENT, openNotifications);
    return () => window.removeEventListener(OPEN_NOTIFICATIONS_EVENT, openNotifications);
  }, []);

  const toggleSound = (checked: boolean) => {
    setPreferenceMessage(null);
    updatePreference.mutate({ soundEnabled: checked });
  };

  const toggleBrowserNotifications = async (checked: boolean) => {
    setPreferenceMessage(null);
    if (!checked) {
      updatePreference.mutate({ browserEnabled: false });
      return;
    }
    if (typeof Notification === "undefined") {
      setPreferenceMessage("Este navegador não oferece notificações nativas. O sino e o título da aba continuam disponíveis.");
      updatePreference.mutate({ browserEnabled: false });
      return;
    }
    try {
      const nextPermission = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      setPermission(nextPermission);
      if (nextPermission === "granted") {
        updatePreference.mutate({ browserEnabled: true });
        setPreferenceMessage("Notificações do navegador ativadas.");
      } else if (nextPermission === "denied") {
        updatePreference.mutate({ browserEnabled: false });
        setPreferenceMessage("As notificações estão bloqueadas. Libere-as nas configurações do navegador para ativá-las.");
      } else {
        updatePreference.mutate({ browserEnabled: false });
      }
    } catch {
      updatePreference.mutate({ browserEnabled: false });
      setPreferenceMessage("Não foi possível solicitar a permissão neste navegador.");
    }
  };

  const testSound = async () => {
    const played = await playNotificationSound();
    setPreferenceMessage(played ? "Som de teste reproduzido." : "O navegador bloqueou o som. Clique novamente ou verifique o volume do dispositivo.");
  };

  const openNotification = (notification: AgentNotification) => {
    // Opening a notification acknowledges it and removes it from the active feed.
    dismiss.mutate(notification.id);
    setOpen(false);
    if (notification.conversationId) setLocation(`/conversation/${notification.conversationId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="notification-bell" aria-label={unreadCount ? `${unreadCount} notificações não lidas` : "Notificações"} data-testid="button-notifications" />}
      >
        <Bell data-icon="inline-start" />
        {unreadCount > 0 ? <span className="notification-bell-badge" aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="notification-popover">
        <div className="notification-popover-heading">
          <div className="flex flex-col gap-1">
            <PopoverTitle>Notificações</PopoverTitle>
            <PopoverDescription>Novos chamados e conversas que precisam de atenção.</PopoverDescription>
          </div>
          <Button variant="ghost" size="icon-xs" aria-label="Marcar todas como lidas" title="Marcar todas como lidas" disabled={!unreadCount || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            <CheckCheck />
          </Button>
        </div>
        {isLoading ? <div className="notification-loading" aria-live="polite">Carregando notificações…</div> : null}
        {isError ? <div className="notification-error" role="status">Não foi possível carregar as notificações.</div> : null}
        {!isLoading && !isError && visibleNotifications.length === 0 ? (
          <Empty className="notification-empty">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
              <EmptyTitle>Tudo em dia</EmptyTitle>
              <EmptyDescription>Você não tem novas notificações.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {visibleNotifications.length > 0 ? (
          <div className="notification-list" role="list">
            {visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={() => openNotification(notification)}
                onDismiss={() => dismiss.mutate(notification.id)}
              />
            ))}
          </div>
        ) : null}
        {visibleNotifications.some((notification) => notification.conversationId) ? (
          <div className="notification-popover-footer"><ExternalLink data-icon="inline-start" /> Clique para abrir o atendimento</div>
        ) : null}
        <div className="notification-preferences" aria-label="Preferências de notificações">
          <div className="notification-preferences-title">Preferências de alerta</div>
          <label className="notification-preference-row">
            {preference.soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            <span className="notification-preference-copy">
              <strong>Som de novas notificações</strong>
              <small>Reproduzir um alerta quando a aba estiver em segundo plano.</small>
            </span>
            <Checkbox
              checked={preference.soundEnabled}
              disabled={updatePreference.isPending}
              onCheckedChange={(checked) => toggleSound(Boolean(checked))}
              aria-label="Ativar som de novas notificações"
            />
          </label>
          <div className="notification-preference-actions">
            <Button type="button" variant="outline" size="sm" onClick={() => void testSound()}>
              <Volume2 data-icon="inline-start" /> Testar som
            </Button>
            <label className="notification-preference-toggle">
              <span>Notificações do navegador</span>
              <Checkbox
                checked={preference.browserEnabled && permission === "granted"}
                disabled={updatePreference.isPending}
                onCheckedChange={(checked) => void toggleBrowserNotifications(Boolean(checked))}
                aria-label="Ativar notificações do navegador"
              />
            </label>
          </div>
          <div className="notification-preference-status" aria-live="polite">
            {preferenceMessage || (updatePreference.isError
              ? "Não foi possível salvar a preferência. Tente novamente."
              : permission === "granted"
              ? "Permissão do navegador: permitida."
              : permission === "denied"
                ? "Permissão do navegador: bloqueada nas configurações."
                : "Permissão do navegador: ainda não solicitada.")}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
