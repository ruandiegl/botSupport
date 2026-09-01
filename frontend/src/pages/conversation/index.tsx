import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Check, Archive, Send, RefreshCw, CheckCircle2, Clock, UserRoundCheck, MessageCircleOff, Users } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import {
  useGetConversation,
  useMarkConversationRead,
  useSendMessage,
  useSendMedia,
  useAssumeConversation,
  useCloseConversation,
  useDelegateConversation,
  useEligibleAssignees,
  useLoadPreviousMessages,
} from "./hooks/use-conversation";
import { DetailPanel } from "./components/DetailPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShortcutPicker } from "./components/ShortcutPicker";
import { useAvailableShortcuts, useRegisterShortcutUse } from "./hooks/use-shortcuts";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatShortcutMessage } from "@/lib/utils";
import { useSocket } from "@/lib/socket-context";
import { useSocketEvent } from "@/lib/use-socket-events";
import { queryClient } from "@/lib/query-client";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageMedia } from "./components/MessageMedia";
import { DelegationDialog } from "./components/DelegationDialog";
import { SharedContactCard } from "./components/SharedContactCard";
import { ContactFormDialog } from "./components/ContactFormDialog";
import { ContactConversationsDialog } from "./components/ContactConversationsDialog";
import { ContactProfileDialog } from "./components/ContactProfileDialog";
import { MediaAttachmentPicker, type MediaAttachmentPickerHandle } from "./components/MediaAttachmentPicker";
import { MediaComposerDropZone } from "./components/MediaComposerDropZone";
import { OutgoingMediaCard } from "./components/OutgoingMediaCard";
import { mediaFileKind, mediaSizeError } from "./components/media-file";
import { NewConversationDialog } from "./components/NewConversationDialog";
import { renderEditedVideo, type VideoEdit } from "./components/video-processing";
import { useContact, useCreateContact, useCreateConversation, useUpdateContact, type ContactDetail } from "./hooks/use-contacts";
import { useListDepartments } from "../admin/departments/hooks/use-departments";
import type { ContactShare } from "@/types";

const timeLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

const dateLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
    : "";

const dayKey = (date: string) => new Date(date).toLocaleDateString("en-CA");

const dayDividerLabel = (date: string) => {
  const value = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (value.toLocaleDateString("en-CA") === today.toLocaleDateString("en-CA")) return "Hoje";
  if (value.toLocaleDateString("en-CA") === yesterday.toLocaleDateString("en-CA")) return "Ontem";
  return value.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

function friendlyMediaError(error: unknown, file: File | null) {
  const raw = error instanceof Error ? error.message : String(error || "");
  const normalized = raw.toLowerCase();
  // Prefer the backend's message when it contains the effective configured
  // limit. This keeps environment-specific document/video limits accurate.
  if (/^(este arquivo|este documento|este vídeo|este áudio|o arquivo excede|a extensão não|não conseguimos confirmar)/i.test(raw)) return raw;
  const fileKind = file ? mediaFileKind(file) : null;
  const isVideo = fileKind === "VIDEO";
  const isDocument = fileKind === "DOCUMENT";
  if (/413|payload too large|grande demais|excede|size_limit|limite configurado/.test(normalized)) {
    return isVideo
      ? "Este vídeo é grande demais para enviar. O limite é 64 MB. Corte ou comprima o vídeo e tente novamente."
      : isDocument
        ? "Este documento é grande demais para enviar. Divida o arquivo ou reduza o conteúdo e tente novamente. Um ZIP também precisa respeitar o limite de documentos."
      : "Este arquivo é grande demais para enviar. Reduza o tamanho e tente novamente.";
  }
  if (/signature|conteúdo.*tipo|formato/.test(normalized)) {
    return isVideo
      ? "Não conseguimos reconhecer este vídeo. Use um arquivo MP4 ou WebM válido e tente novamente."
      : "Não conseguimos reconhecer o formato deste arquivo. Selecione-o novamente e tente outra vez.";
  }
  if (/type_not_allowed|tipo.*permitido/.test(normalized)) {
    return "Este formato não é aceito. Envie uma imagem, vídeo, áudio, documento compatível ou arquivo ZIP.";
  }
  return raw || "Não foi possível enviar a mídia. Tente novamente.";
}

export default function ConversationPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaEdit, setMediaEdit] = useState<VideoEdit | null>(null);
  const [mediaValidationError, setMediaValidationError] = useState<string | null>(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState<number | null>(null);
  const [mediaProcessing, setMediaProcessing] = useState(false);
  const [mediaProcessingProgress, setMediaProcessingProgress] = useState<number | null>(null);
  const mediaUploadAbortRef = useRef<AbortController | null>(null);
  const mediaUploadCancelledRef = useRef(false);
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);
  const [assumeConfirmOpen, setAssumeConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [delegationOpen, setDelegationOpen] = useState(false);
  const [delegationConfirmOpen, setDelegationConfirmOpen] = useState(false);
  const [delegationDraft, setDelegationDraft] = useState<{ agentId: string; reason?: string } | null>(null);
  const [selectedContactShare, setSelectedContactShare] = useState<ContactShare | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactConversationsOpen, setContactConversationsOpen] = useState(false);
  const [contactProfileOpen, setContactProfileOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileEditContact, setProfileEditContact] = useState<ContactDetail | null>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [newConversationPhone, setNewConversationPhone] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const mediaPickerRef = useRef<MediaAttachmentPickerHandle>(null);
  const previousMessagesHeightRef = useRef<number | null>(null);
  const lastReadAttemptRef = useRef<string | null>(null);
  const { activeAgent } = useActiveAgent();
  const { can, user } = useAuth();
  const { joinConversation, leaveConversation } = useSocket();

  const activeAgentId = activeAgent?.id || user?.id || "agent-marina";
  const activeAgentName = activeAgent?.name || user?.name || "Atendente";

  const { data: conversation, isLoading, isError, refetch } = useGetConversation(id);
  const activeAgentDeptName = activeAgent?.departmentName || (user as any)?.departmentName || conversation?.departmentName || "Suporte";
  const { data: availableShortcuts = [] } = useAvailableShortcuts(id, "", "ALL", can("shortcuts", "use"));
  const markAsRead = useMarkConversationRead(id);
  const sendMessage = useSendMessage(id);
  const sendMedia = useSendMedia(id);
  const assume = useAssumeConversation(id);
  const close = useCloseConversation(id);
  const canSendMedia = can("conversations", "send_media");
  const canDelegate = can("conversations", "delegate");
  const { data: assigneeData } = useEligibleAssignees(id, canDelegate);
  const delegate = useDelegateConversation(id);
  const loadPrevious = useLoadPreviousMessages(id);
  const registerShortcutUse = useRegisterShortcutUse();
  const canCreateContacts = can("contacts", "create");
  const canUpdateContacts = can("contacts", "update");
  const selectedContact = useContact(selectedContactShare?.canonicalContactId);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact(selectedContactShare?.canonicalContactId || "");
  const updateProfileContact = useUpdateContact(profileEditContact?.id || "");
  const createConversation = useCreateConversation();
  const { data: departments = [] } = useListDepartments();

  // Keep every hook above the loading/error branches. Calling this callback
  // only after the conversation has loaded changes the hook order when the
  // request resolves and crashes React on direct conversation links.
  const handleExternalMediaFile = useCallback((file: File) => {
    setMediaValidationError(null);
    mediaPickerRef.current?.openFile(file);
  }, []);

  const loadOlderMessages = useCallback(() => {
    const container = messagesRef.current;
    const pagination = conversation?.messagesPagination;
    if (!container || !pagination?.hasPrevious || !pagination.previousCursor || loadPrevious.isPending) return;
    previousMessagesHeightRef.current = container.scrollHeight;
    loadPrevious.mutate(
      { before: pagination.previousCursor },
      { onError: () => { previousMessagesHeightRef.current = null; } },
    );
  }, [conversation?.messagesPagination?.hasPrevious, conversation?.messagesPagination?.previousCursor, loadPrevious.isPending]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop <= 64) loadOlderMessages();
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadOlderMessages]);

  // Socket.IO: Entrar na sala da conversa para receber mensagens e atualizações em tempo real
  useEffect(() => {
    if (id) {
      joinConversation(id);
      return () => {
        leaveConversation(id);
      };
    }
  }, [id, joinConversation, leaveConversation]);

  // Escutar novas mensagens em tempo real no chat
  useSocketEvent("message:new", useCallback((data: any) => {
    if (data.conversationId === id) {
      const incoming = data.message;
      if (!incoming?.id) return;
      queryClient.setQueryData<any>(["conversation", id], (current: any) => {
        if (!current || current.messages?.some((item: any) => item.id === incoming.id)) return current;
        return {
          ...current,
          messages: [...(current.messages ?? []), incoming],
          lastMessage: incoming.content,
          lastActivityAt: incoming.createdAt,
          unreadCount: incoming.direction === "IN" ? (current.unreadCount ?? 0) + 1 : current.unreadCount,
        };
      });
    }
  }, [id]));

  useSocketEvent("conversation:updated", useCallback((data: any) => {
    if (data.conversationId === id) {
      // MESSAGE_RECEIVED/MESSAGE_SENT already arrive through message:new.
      // Avoid a second full detail refetch for the same logical event.
      if (!data.messageId && data.eventType !== "MESSAGE_RECEIVED" && data.eventType !== "MESSAGE_SENT") {
        queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      }
    }
  }, [id]));

  useSocketEvent("conversation:delegated", useCallback((data: any) => {
    if (data.conversationId === id) queryClient.invalidateQueries({ queryKey: ["conversation", id] });
  }, [id]));

  useSocketEvent("conversation:labels_updated", useCallback((data: any) => {
    if (data.conversationId === id) {
      queryClient.setQueryData<any>(["conversation", id], (current: any) => current ? { ...current, labels: data.labels || [] } : current);
    }
  }, [id]));

  useSocketEvent("media:expired", useCallback((data: any) => {
    if (data.conversationId === id) {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      queryClient.removeQueries({ queryKey: ["media-access", id] });
    }
  }, [id]));

  // A mídia só é considerada realmente entregue depois do DeliveryCallback
  // da Z-API. Em caso de rejeição posterior, o backend altera o registro para
  // FAILED e este evento atualiza imediatamente o cartão já aberto no chat.
  useSocketEvent("media:delivery", useCallback((data: any) => {
    if (data.conversationId === id) {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    }
  }, [id]));

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    if (previousMessagesHeightRef.current !== null) {
      const heightDelta = container.scrollHeight - previousMessagesHeightRef.current;
      container.scrollTop += heightDelta;
      previousMessagesHeightRef.current = null;
      return;
    }
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages?.length]);

  useEffect(() => {
    const unreadCount = conversation?.unreadCount ?? 0;
    if (!unreadCount) {
      lastReadAttemptRef.current = null;
      return;
    }

    const attemptKey = `${id}:${unreadCount}`;
    if (!id || lastReadAttemptRef.current === attemptKey) return;
    lastReadAttemptRef.current = attemptKey;
    markAsRead.mutate();
  }, [id, conversation?.unreadCount]);

  if (isLoading)
    return (
      <div className="content">
        <div className="panel loading">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );

  if (isError || !conversation)
    return (
      <div className="content">
        <div className="panel error-state">
          <RefreshCw size={24} />
          <h3>Não foi possível carregar a conversa</h3>
          <p className="subtle">Verifique se o backend está ativo e o banco de dados conectado.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );

  // Keep legacy group tickets in the same conversation workspace even when
  // their channel column predates the unified GROUP value.
  const isGroupConversation = conversation.channel === "GROUP"
    || Boolean(conversation.groupChatId || conversation.groupChatName);
  const conversationTitle = isGroupConversation ? (conversation.groupChatName || "Grupo do WhatsApp") : conversation.contact.name;
  const conversationSubtitle = isGroupConversation
    ? `Grupo · iniciado por ${conversation.contact.name} · ${conversation.contact.phone}`
    : `${conversation.contact.phone} · iniciou ${dateLabel(conversation.startedAt)}`;

  const send = async () => {
    if (mediaProcessing || sendMedia.isPending || sendMessage.isPending) return;
    if (mediaFile) {
      const selectedFile = mediaFile;
      const selectedEdit = mediaEdit;
      const clientMessageId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const uploadController = new AbortController();
      mediaUploadAbortRef.current = uploadController;
      mediaUploadCancelledRef.current = false;
      setMediaValidationError(null);
      setMediaUploadProgress(null);

      let fileToSend = selectedFile;
      if (selectedEdit) {
        setMediaProcessing(true);
        setMediaProcessingProgress(0);
        try {
          fileToSend = await renderEditedVideo(selectedFile, selectedEdit, {
            signal: uploadController.signal,
            onProgress: (progress) => setMediaProcessingProgress(progress),
          });
        } catch (error) {
          if (!uploadController.signal.aborted) {
            setMediaValidationError(error instanceof Error ? error.message : "Não foi possível preparar o vídeo editado. Tente novamente.");
          }
          mediaUploadAbortRef.current = null;
          return;
        } finally {
          setMediaProcessing(false);
          setMediaProcessingProgress(null);
        }
      }

      if (uploadController.signal.aborted) return;
      const fileSizeError = mediaSizeError(fileToSend);
      if (fileSizeError) {
        setMediaValidationError(fileSizeError);
        mediaUploadAbortRef.current = null;
        return;
      }

      setMediaUploadProgress(0);
      sendMedia.mutate({
        file: fileToSend,
        caption: message.trim(),
        clientMessageId,
        onProgress: (progress) => setMediaUploadProgress(progress),
        signal: uploadController.signal,
      }, {
        onSuccess: () => {
          setMessage("");
          setMediaFile(null);
          setMediaEdit(null);
          setMediaUploadProgress(null);
          mediaUploadAbortRef.current = null;
          if (selectedShortcutId) {
            registerShortcutUse.mutate({ id: selectedShortcutId, conversationId: id });
            setSelectedShortcutId(null);
          }
        },
        onError: () => {
          if (!mediaUploadCancelledRef.current) setMediaUploadProgress(null);
          mediaUploadAbortRef.current = null;
        },
      });
      return;
    }
    if (!message.trim()) return;
    const body = message.trim();
    sendMessage.mutate({ content: body }, {
      onSuccess: () => {
        setMessage("");
        if (selectedShortcutId) {
          registerShortcutUse.mutate({ id: selectedShortcutId, conversationId: id });
          setSelectedShortcutId(null);
        }
      },
    });
  };

  const cancelMediaUpload = () => {
    mediaUploadCancelledRef.current = true;
    mediaUploadAbortRef.current?.abort();
    mediaUploadAbortRef.current = null;
    setMediaProcessing(false);
    setMediaProcessingProgress(null);
    setMediaUploadProgress(null);
  };

  const handleMediaChange = (file: File | null, edit: VideoEdit | null = null) => {
    setMediaValidationError(null);
    setMediaFile(file);
    setMediaEdit(file ? edit : null);
  };

  const mediaError = sendMedia.isError && !mediaUploadCancelledRef.current
    ? friendlyMediaError(sendMedia.error, mediaFile)
    : null;

  const handleAssume = () => {
    setAssumeConfirmOpen(false);
    assume.mutate({ agentId: activeAgentId }, {
      onSuccess: () => {
        const greetingShortcut = availableShortcuts.find(
          (s) => s.type === "GREETING" && s.scope === "GLOBAL"
        );
        if (greetingShortcut) {
          const formatted = formatShortcutMessage(greetingShortcut.message, {
            agentName: activeAgentName,
            contactName: conversationTitle,
            departmentName: activeAgentDeptName,
          });
          setMessage(formatted);
          setSelectedShortcutId(greetingShortcut.id);
        }
      },
    });
  };

  const handleClose = async (reason: "NORMAL" | "INACTIVITY" | "SILENT" = "NORMAL") => {
    setCloseConfirmOpen(false);
    if (reason === "SILENT") {
      try {
        await close.mutateAsync({ reason: "SILENT" });
        setMessage("");
        setSelectedShortcutId(null);
      } catch {
        // A mensagem de erro da mutation permanece disponível no composer.
      }
      return;
    }
    let closingShortcut: any = null;
    if (reason === "INACTIVITY") {
      closingShortcut = availableShortcuts.find(
        (s) => s.type === "CLOSING" && (s.title.toLowerCase().includes("interação") || s.title.toLowerCase().includes("inativid")),
      );
    } else {
      closingShortcut = availableShortcuts.find(
        (s) => s.type === "CLOSING" && !s.title.toLowerCase().includes("interação") && !s.title.toLowerCase().includes("inativid"),
      );
    }

    const fallback = reason === "INACTIVITY"
      ? "Olá, {contactName}! Seu atendimento está sendo encerrado por falta de interação/resposta. Caso ainda precise de ajuda, envie uma nova mensagem para iniciar um novo atendimento. Obrigado!"
      : "Olá, {contactName}! Seu atendimento foi encerrado. Caso precise de algo mais, envie uma nova mensagem. Obrigado!";
    const closingMessage = formatShortcutMessage(closingShortcut?.message || fallback, {
      agentName: activeAgentName,
      contactName: conversationTitle,
      departmentName: activeAgentDeptName,
    });

    try {
      await sendMessage.mutateAsync({ content: closingMessage });
      if (closingShortcut) await registerShortcutUse.mutateAsync({ id: closingShortcut.id, conversationId: id });
      await close.mutateAsync({ reason });
      setMessage("");
      setSelectedShortcutId(null);
    } catch {
      // The mutation error is rendered next to the composer and the ticket is
      // intentionally kept open when its closing message cannot be delivered.
    }
  };

  const handleDelegationSubmit = (draft: { agentId: string; reason?: string }) => {
    setDelegationDraft(draft);
    setDelegationOpen(false);
    setDelegationConfirmOpen(true);
  };

  const handleDelegationConfirm = async () => {
    if (!delegationDraft) return;
    await delegate.mutateAsync(delegationDraft);
    setDelegationDraft(null);
    setDelegationConfirmOpen(false);
  };

  const openContactAdd = (share: ContactShare) => {
    setSelectedContactShare(share);
    setContactDialogOpen(true);
  };

  const openContactEdit = (share: ContactShare) => {
    setSelectedContactShare(share);
    setContactDialogOpen(true);
  };

  const submitContact = (data: any) => {
    if (selectedContactShare?.canonicalContactId) {
      updateContact.mutate(data, { onSuccess: () => { setContactDialogOpen(false); queryClient.invalidateQueries({ queryKey: ["conversation", id] }); } });
      return;
    }
    createContact.mutate(data, { onSuccess: () => { setContactDialogOpen(false); queryClient.invalidateQueries({ queryKey: ["conversation", id] }); } });
  };

  const openProfileEdit = (contact: ContactDetail) => {
    setContactProfileOpen(false);
    setProfileEditContact(contact);
    setProfileEditOpen(true);
  };

  const submitProfileContact = (data: any) => {
    if (!profileEditContact?.id) return;
    updateProfileContact.mutate(data, {
      onSuccess: () => {
        setProfileEditOpen(false);
        setProfileEditContact(null);
        queryClient.invalidateQueries({ queryKey: ["conversation", id] });
        queryClient.invalidateQueries({ queryKey: ["contact", profileEditContact.id] });
      },
    });
  };

  const openNewConversation = (share: ContactShare, phone: string) => {
    setSelectedContactShare(share);
    setNewConversationPhone(phone);
    setNewConversationOpen(true);
  };

  const submitNewConversation = (data: { phone: string; departmentId?: string }) => {
    if (!selectedContactShare?.canonicalContactId) return;
    createConversation.mutate({ contactId: selectedContactShare.canonicalContactId, ...data }, {
      onSuccess: (created) => { setNewConversationOpen(false); setLocation(`/conversation/${created.id}`); },
    });
  };

  return (
    <div className="content conversation-page">
      <section className="panel thread">
        <MediaComposerDropZone
          className="flex min-h-0 flex-1 flex-col"
          disabled={!canSendMedia || sendMessage.isPending || sendMedia.isPending || mediaProcessing}
          onFile={handleExternalMediaFile}
          onError={setMediaValidationError}
        >
        <div className="thread-head">
          <div className="contact-block">
            <Button
              variant="ghost"
              size="icon"
              className="icon-btn"
              onClick={() => setLocation("/")}
              data-testid="button-back-conversations"
            >
              <ArrowLeft size={16} />
            </Button>
            {isGroupConversation ? (
              <div className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 text-left">
                <div className="avatar coral" aria-hidden="true"><Users size={17} /></div>
                <span className="min-w-0">
                  <span className="block truncate text-[19px] font-semibold leading-tight">{conversationTitle}</span>
                  <span className="mt-1 block truncate text-[10px] text-muted-foreground">{conversationSubtitle}</span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="group flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setContactProfileOpen(true)}
                aria-label="Abrir perfil do contato"
              >
                <div className="avatar coral">{conversation.contact.initials}</div>
                <span className="min-w-0">
                  <span className="block truncate text-[19px] font-semibold leading-tight group-hover:text-primary">{conversation.contact.name}</span>
                  <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">{conversationSubtitle}</span>
                </span>
              </button>
            )}

          </div>

          <div className="thread-actions">
            {conversation.status === "OPEN" && (
              <Button
                variant="default"
                size="sm"
                disabled={assume.isPending}
                onClick={() => setAssumeConfirmOpen(true)}
                data-testid="button-assume-conversation"
              >
                <Check size={14} /> Assumir
              </Button>
            )}
            {conversation.status !== "CLOSED" && conversation.status !== "DRAFT" && (
              <Button
                variant="outline"
                size="sm"
                disabled={close.isPending}
                onClick={() => setCloseConfirmOpen(true)}
                data-testid="button-close-conversation"
              >
                <Archive size={14} /> Encerrar
              </Button>
            )}
            {canDelegate && conversation.status !== "CLOSED" && conversation.status !== "DRAFT" && (
              <Button
                variant="outline"
                size="sm"
                disabled={!assigneeData?.items?.length || delegate.isPending}
                onClick={() => setDelegationOpen(true)}
                data-testid="button-delegate-conversation"
              >
                <UserRoundCheck data-icon="inline-start" /> Delegar
              </Button>
            )}
          </div>
        </div>

        <div className="messages" ref={messagesRef}>
          {conversation.messagesPagination?.hasPrevious && conversation.messagesPagination.previousCursor ? (
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loadPrevious.isPending}
                onClick={loadOlderMessages}
              >
                {loadPrevious.isPending ? "Carregando..." : "Carregar mensagens anteriores"}
              </Button>
            </div>
          ) : null}
          {conversation.messages?.map((item, index) => {
            const previous = conversation.messages[index - 1];
            const showDayDivider = !previous || dayKey(previous.createdAt) !== dayKey(item.createdAt);
            return (
            <Fragment key={item.id}>
              {showDayDivider ? <div className="day-divider">{dayDividerLabel(item.createdAt)}</div> : null}
            <Message align={item.direction === "OUT" ? "end" : "start"}>
              <MessageContent>
                <Bubble
                  align={item.direction === "OUT" ? "end" : "start"}
                  variant={item.direction === "OUT" ? "default" : "secondary"}
                >
                  <BubbleContent className={isGroupConversation ? "group-message-content" : "flex flex-col gap-2"}>
                    {isGroupConversation ? (
                      <strong className={`group-message-sender${item.direction === "OUT" ? " group-message-sender-out" : ""}`}>
                        {item.senderName || (item.senderType === "BOT" ? "GTF-Bot" : "Participante")}
                      </strong>
                    ) : null}
                    {item.contactShare ? (
                      <SharedContactCard
                        share={item.contactShare}
                        canCreate={canCreateContacts}
                        canUpdate={canUpdateContacts}
                        onAdd={() => openContactAdd(item.contactShare!)}
                        onEdit={() => openContactEdit(item.contactShare!)}
                        onNewConversation={(phone) => openNewConversation(item.contactShare!, phone)}
                        onViewConversations={() => { setSelectedContactShare(item.contactShare!); setContactConversationsOpen(true); }}
                      />
                    ) : item.outgoingMedia ? (
                      <>
                        {!item.content.startsWith("[") ? <p className="whitespace-pre-wrap">{item.content}</p> : null}
                        <OutgoingMediaCard media={item.outgoingMedia} />
                      </>
                    ) : item.content ? <p className="whitespace-pre-wrap">{item.content}</p> : null}
                    {item.media && (
                      <MessageMedia conversationId={id} messageId={item.id} media={item.media} />
                    )}
                    {isGroupConversation ? (
                      <span className="group-message-meta">
                        {timeLabel(item.createdAt)}
                        {item.direction === "OUT" && item.externalMessageId ? <Check className="size-3" aria-hidden="true" /> : item.direction === "OUT" && item.messageType === "TEXT_FAILED" ? <span className="text-destructive">Falha no envio</span> : null}
                      </span>
                    ) : null}
                  </BubbleContent>
                </Bubble>
                {!isGroupConversation ? (
                  <MessageFooter>
                    {`${item.senderName || (item.senderType === "BOT" ? "GTF-Bot" : conversation.contact.name)}${item.senderDepartmentName ? ` · ${item.senderDepartmentName}` : ""} · ${timeLabel(item.createdAt)}`}
                  </MessageFooter>
                ) : null}
              </MessageContent>
            </Message>
            </Fragment>
            );
          })}
        </div>

          <div className="composer">
          <div className="composer-toolbar">
            {canSendMedia ? (
              <MediaAttachmentPicker
                ref={mediaPickerRef}
                file={mediaFile}
                onChange={handleMediaChange}
                caption={message}
                onCaptionChange={setMessage}
                uploadProgress={sendMedia.isPending ? mediaUploadProgress : null}
                processing={mediaProcessing}
                processingProgress={mediaProcessingProgress}
                onCancelUpload={cancelMediaUpload}
                onValidationError={setMediaValidationError}
                disabled={sendMessage.isPending || sendMedia.isPending || mediaProcessing}
              />
            ) : null}
            {can("shortcuts", "use") && (
              <ShortcutPicker 
                conversationId={id} 
                agentName={activeAgentName}
                contactName={conversation.contact.name}
                departmentName={activeAgentDeptName}
                onSelect={(shortcut) => { setMessage(shortcut.message); setSelectedShortcutId(shortcut.id); }} 
              />
            )}
            {can("shortcuts", "use") ? <span>Selecione uma mensagem pronta{canSendMedia ? ", anexe ou cole um arquivo" : ""}.</span> : canSendMedia ? <span>Anexe, cole ou solte um arquivo para enviar.</span> : null}
          </div>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder={mediaFile ? "Adicione uma legenda (opcional)…" : "Escreva uma resposta para o contato..."}
            data-testid="textarea-message"
          />
          <div className="composer-foot">
            <div>
              {mediaValidationError || sendMessage.isError || mediaError ? (
                <p className="text-sm text-destructive" role="alert">
                  {mediaValidationError || (sendMessage.error ? sendMessage.error.message : mediaError)}
                </p>
              ) : null}
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={send}
              disabled={(!message.trim() && !mediaFile) || sendMessage.isPending || sendMedia.isPending || mediaProcessing}
              data-testid="button-send-message"
            >
              <Send size={14} /> Enviar
            </Button>
          </div>
          </div>
        </MediaComposerDropZone>
      </section>

      <DetailPanel
        conversation={conversation}
        canUseShortcuts={can("shortcuts", "use")}
        canManageLabels={can("labels", "update")}
        agentDeptName={activeAgentDeptName}
        agentName={activeAgentName}
        onInsertShortcut={(shortcut) => {
          setMessage(shortcut.message);
          setSelectedShortcutId(shortcut.id);
        }}
      />
      <DelegationDialog
        open={delegationOpen}
        onOpenChange={setDelegationOpen}
        agents={assigneeData?.items || []}
        currentAgentId={conversation.assignedAgentId}
        isPending={delegate.isPending}
        error={delegate.error?.message}
        onSubmit={handleDelegationSubmit}
      />
      <ConfirmationDialog
        open={delegationConfirmOpen}
        onOpenChange={(open) => { if (!delegate.isPending) setDelegationConfirmOpen(open); }}
        tone="warning"
        title="Delegar este atendimento?"
        description="O atendente selecionado será o novo responsável e receberá uma notificação com acesso ao chamado."
        confirmLabel="Confirmar delegação"
        details={<strong>{assigneeData?.items.find((agent) => agent.id === delegationDraft?.agentId)?.name || "Atendente selecionado"}</strong>}
        onConfirm={handleDelegationConfirm}
        testId="button-confirm-delegate-conversation"
      />
      <ContactFormDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contact={selectedContact.data || null}
        share={selectedContactShare}
        isPending={createContact.isPending || updateContact.isPending}
        error={createContact.error?.message || updateContact.error?.message}
        onSubmit={submitContact}
      />
      <ContactConversationsDialog
        open={contactConversationsOpen}
        onOpenChange={setContactConversationsOpen}
        contactId={selectedContactShare?.canonicalContactId}
        contactName={selectedContactShare?.displayName || "Contato"}
      />
      <ContactProfileDialog
        open={contactProfileOpen}
        onOpenChange={setContactProfileOpen}
        contactId={conversation.contact.id}
        fallbackContact={conversation.contact}
        canUpdate={canUpdateContacts}
        onEdit={openProfileEdit}
        onViewConversations={() => {
          setContactProfileOpen(false);
          if (conversation.contact.id) {
            setSelectedContactShare({
              id: `profile-${conversation.contact.id}`,
              displayName: conversation.contact.name,
              phones: [conversation.contact.phone],
              canonicalContactId: conversation.contact.id,
            });
            setContactConversationsOpen(true);
          }
        }}
      />
      <ContactFormDialog
        open={profileEditOpen}
        onOpenChange={(value) => { if (!updateProfileContact.isPending) { setProfileEditOpen(value); if (!value) setProfileEditContact(null); } }}
        contact={profileEditContact}
        isPending={updateProfileContact.isPending}
        error={updateProfileContact.error?.message}
        onSubmit={submitProfileContact}
      />
      <NewConversationDialog
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        contactName={selectedContactShare?.displayName || "Contato"}
        phones={selectedContactShare?.phones || []}
        defaultPhone={newConversationPhone}
        departments={departments}
        isPending={createConversation.isPending}
        error={createConversation.error?.message}
        onSubmit={submitNewConversation}
      />
      <ConfirmationDialog
        open={assumeConfirmOpen}
        onOpenChange={setAssumeConfirmOpen}
        tone="warning"
        title="Assumir este atendimento?"
        description="Você passará a ser responsável pela conversa e a mensagem de saudação inicial será inserida no campo."
        confirmLabel="Assumir atendimento"
        details={<strong>{conversation.contact.name}</strong>}
        onConfirm={handleAssume}
        testId="button-confirm-assume-conversation"
      />
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-card text-card-foreground ring-border sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Archive className="size-4 text-warning" />
              Encerrar Atendimento
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Selecione o motivo do encerramento para o contato:
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
            <strong className="font-semibold">{conversation.contact.name}</strong>
            <span className="text-xs text-muted-foreground ml-2">({conversation.contact.phone})</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 my-1">
            <button
              type="button"
              disabled={close.isPending || sendMessage.isPending}
              onClick={() => handleClose("NORMAL")}
              className="flex items-start gap-3 p-3.5 text-left rounded-lg border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all group cursor-pointer"
              data-testid="button-close-normal"
            >
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <strong className="text-sm font-medium text-foreground group-hover:text-primary">
                    Encerramento Normal
                  </strong>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Padrão
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conclusão bem-sucedida do suporte com mensagem de agradecimento ao cliente.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={close.isPending || sendMessage.isPending}
              onClick={() => handleClose("INACTIVITY")}
              className="flex items-start gap-3 p-3.5 text-left rounded-lg border border-border bg-background hover:bg-muted hover:border-warning/50 transition-all group cursor-pointer"
              data-testid="button-close-inactivity"
            >
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <strong className="text-sm font-medium text-foreground group-hover:text-warning">
                    Encerramento por Falta de Interação
                  </strong>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Inatividade
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Encerra o chamado informando ao cliente que não houve resposta ou interação recente.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={close.isPending || sendMessage.isPending}
              onClick={() => handleClose("SILENT")}
              className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3.5 text-left transition-all hover:border-slate-400/60 hover:bg-muted cursor-pointer"
              data-testid="button-close-silent"
            >
              <div className="shrink-0 rounded-md bg-slate-500/10 p-2 text-slate-600 group-hover:bg-slate-500/20 dark:text-slate-300">
                <MessageCircleOff size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <strong className="text-sm font-medium text-foreground group-hover:text-primary">Encerramento silencioso</strong>
                  <span className="rounded border border-slate-400/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">Sem mensagem</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">Encerra o atendimento apenas no sistema, sem enviar mensagem ao cliente.</p>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
