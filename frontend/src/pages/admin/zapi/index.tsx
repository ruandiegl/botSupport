import { useState, useEffect } from "react";
import {
  QrCode,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Copy,
  Zap,
  Globe,
  Smartphone,
  AlertCircle,
  Key,
  Save,
  HelpCircle,
} from "lucide-react";
import {
  useGetZApiConfig,
  useUpdateZApiConfig,
  useGetZApiQrCode,
  useDisconnectZApi,
  useSetZApiWebhook,
} from "./hooks/use-zapi";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

function normalizeWebhookUrl(webhookUrl: string): string {
  const trimmed = webhookUrl.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    parsed.pathname = parsed.pathname.replace(/\/(?:message|delivery|status)\/?$/i, "");
    if (/\/webhooks\/zapi$/i.test(parsed.pathname)) {
      parsed.pathname = parsed.pathname.replace(/\/webhooks\/zapi$/i, "/webhooks/z-api");
    }
    if (parsed.pathname === "/" || parsed.pathname === "") {
      parsed.pathname = "/api/webhooks/z-api";
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export default function ZApiAdmin() {
  const { data: config, isLoading: isConfigLoading, refetch: refetchConfig } = useGetZApiConfig();
  const { data: qrData, isLoading: isQrLoading, refetch: refetchQr } = useGetZApiQrCode();
  const updateConfig = useUpdateZApiConfig();
  const disconnectMutation = useDisconnectZApi();
  const setWebhook = useSetZApiWebhook();

  const [instanceId, setInstanceId] = useState("");
  const [token, setToken] = useState("");
  const [clientToken, setClientToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [autoReply, setAutoReply] = useState(true);
  const [groupsEnabled, setGroupsEnabled] = useState(false);
  const [groupCooldownSeconds, setGroupCooldownSeconds] = useState(60);
  const [groupConfirmInGroup, setGroupConfirmInGroup] = useState(false);
  const [groupConfirmMessage, setGroupConfirmMessage] = useState("");
  const [groupConversationMode, setGroupConversationMode] = useState<"PRIVATE_LEGACY" | "IN_GROUP">("PRIVATE_LEGACY");
  const [groupResponseMode, setGroupResponseMode] = useState<"ANY_PARTICIPANT" | "ORIGIN_PARTICIPANT">("ANY_PARTICIPANT");
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [webhookConfirmOpen, setWebhookConfirmOpen] = useState(false);

  useEffect(() => {
    if (config) {
      setInstanceId(config.instanceId || "");
      setToken(config.token || "");
      setClientToken(config.clientToken || "");
      setWebhookUrl(normalizeWebhookUrl(config.webhookUrl || ""));
      setIsActive(config.isActive ?? true);
      setAutoReply(config.autoReply ?? true);
      setGroupsEnabled(config.groupsEnabled ?? false);
      setGroupCooldownSeconds(config.groupCooldownSeconds ?? 60);
      setGroupConfirmInGroup(config.groupConfirmInGroup ?? false);
      setGroupConfirmMessage(config.groupConfirmMessage || "");
      setGroupConversationMode(config.groupConversationMode ?? "PRIVATE_LEGACY");
      setGroupResponseMode(config.groupResponseMode ?? "ANY_PARTICIPANT");
    }
  }, [config]);

  const isConnected = qrData?.connected === true;
  const isPublicHttpsWebhook = (() => {
    try {
      const url = new URL(webhookUrl);
      return url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname);
    } catch {
      return false;
    }
  })();

  const handleSaveCredentials = async () => {
    await updateConfig.mutateAsync(
      {
        instanceId: instanceId.trim(),
        ...(token.trim() ? { token: token.trim() } : {}),
        ...(clientToken.trim() ? { clientToken: clientToken.trim() } : {}),
        webhookUrl: normalizeWebhookUrl(webhookUrl),
        isActive,
        autoReply,
        groupsEnabled,
        groupCooldownSeconds,
        groupConfirmInGroup,
        groupConfirmMessage: groupConfirmMessage.trim() || null,
        groupConversationMode,
        groupResponseMode,
      },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          refetchConfig();
          refetchQr();
        },
      }
    );
  };

  const handleDisconnect = async () => {
    await disconnectMutation.mutateAsync();
  };

  const handleRegisterWebhook = async () => {
    const normalizedWebhookUrl = normalizeWebhookUrl(webhookUrl);
    setWebhookUrl(normalizedWebhookUrl);
    await setWebhook.mutateAsync({ webhookUrl: normalizedWebhookUrl });
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(normalizeWebhookUrl(webhookUrl));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="content">
      <PageHeader
        eyebrow="Administração / canal de atendimento"
        title="Conexão com WhatsApp (Z-API)"
        description="Conecte seu WhatsApp escaneando o QR Code abaixo ou valide as credenciais da sua instância Z-API."
        action={<div style={{ display: "flex", gap: 10 }}>
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              refetchConfig();
              refetchQr();
            }}
            data-testid="button-refresh-qr"
          >
            <RefreshCw size={15} className={isQrLoading ? "animate-spin" : ""} /> Atualizar Status
          </Button>
        </div>}
      />

      {isConfigLoading ? (
        <div className="panel loading">
          <div className="skeleton short" />
          <div className="skeleton" />
        </div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: "1fr 400px" }}>
          {/* COLUNA ESQUERDA: LEITOR DE QR CODE */}
          <div className="panel" style={{ padding: 28, textAlign: "center" }}>
            {isConnected ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "grid",
                    placeItems: "center",
                    color: "#10b981",
                  }}
                >
                  <CheckCircle2 size={44} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, marginBottom: 8 }}>WhatsApp Conectado e Operacional!</h2>
                  <p className="subtle" style={{ maxWidth: 460, margin: "0 auto", fontSize: 13, lineHeight: 1.5 }}>
                    O número de WhatsApp da sua operação está autenticado e pronto. Todas as mensagens enviadas pelos clientes aparecerão em tempo real na fila do GTF-Bot.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDisconnectConfirmOpen(true)}
                    disabled={disconnectMutation.isPending}
                    data-testid="button-disconnect-whatsapp"
                  >
                    <LogOut size={15} />
                    {disconnectMutation.isPending ? "Desconectando..." : "Desconectar WhatsApp / Ler Novo QR Code"}
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div className="panel-title" style={{ justifyContent: "center" }}>
                  <QrCode size={22} />
                  <h2 style={{ fontSize: 20 }}>Conectar via QR Code</h2>
                </div>
                <p className="subtle" style={{ maxWidth: 480, fontSize: 13 }}>
                  Aponte a câmera do seu celular no WhatsApp para o QR Code abaixo para autorizar o GTF-Bot.
                </p>

                <div
                  style={{
                    background: "#fff",
                    padding: 18,
                    borderRadius: 18,
                    border: "2px dashed #262f45",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    margin: "8px 0",
                    minWidth: 260,
                    minHeight: 260,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {isQrLoading ? (
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <RefreshCw size={30} className="animate-spin" />
                      <p className="subtle" style={{ marginTop: 12, fontSize: 12 }}>Consultando Z-API...</p>
                    </div>
                  ) : qrData?.qrCode ? (
                    <img
                      src={qrData.qrCode}
                      alt="QR Code WhatsApp"
                      style={{ width: 230, height: 230, display: "block" }}
                    />
                  ) : (
                    <div style={{ padding: 20, color: "#f87171", maxWidth: 360 }}>
                      <AlertCircle size={32} style={{ margin: "0 auto 8px" }} />
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Instância Z-API Inacessível</p>
                      <p className="subtle" style={{ fontSize: 12, lineHeight: 1.4 }}>
                        {qrData?.error || "A Z-API informou que a instância não foi encontrada ou está inativa."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ marginTop: 14, fontSize: 11 }}
                        onClick={() => refetchQr()}
                      >
                        <RefreshCw size={13} /> Tentar Novamente
                      </Button>
                    </div>
                  )}
                </div>

                <div
                  className="procedure"
                  style={{
                    textAlign: "left",
                    maxWidth: 480,
                    width: "100%",
                    background: "#161b26",
                    border: "1px solid #262f45",
                    padding: 14,
                    borderRadius: 12,
                  }}
                >
                  <div className="procedure-title" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 6 }}>
                    <Smartphone size={15} /> Instruções de Conexão no Celular
                  </div>
                  <p style={{ fontSize: 12, marginBottom: 4 }}><b>1.</b> Abra o <b>WhatsApp</b> no celular da operação.</p>
                  <p style={{ fontSize: 12, marginBottom: 4 }}><b>2.</b> Toque no menu <b>Mais Opções (⋮)</b> ou <b>Configurações (⚙)</b>.</p>
                  <p style={{ fontSize: 12, marginBottom: 4 }}><b>3.</b> Selecione <b>Dispositivos Conectados</b> e toque em <b>Conectar um dispositivo</b>.</p>
                  <p style={{ fontSize: 12, marginBottom: 0 }}><b>4.</b> Aponta a câmera para a imagem do QR Code acima.</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: CREDENCIAIS & AJUDA Z-API */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="panel" style={{ padding: 22 }}>
              <div className="panel-title" style={{ marginBottom: 12 }}>
                <Key size={18} />
                <h2>Credenciais da Instância Z-API</h2>
              </div>
              <p className="subtle" style={{ fontSize: 12, marginBottom: 14 }}>
                Insira ou confirme o ID e Token da sua instância Z-API. Se você gerou um novo token no painel da Z-API, atualize-o abaixo:
              </p>

              <div className="form-stack">
                <div className="field">
                  <label htmlFor="zapi-instance-id" style={{ fontSize: 11 }}>ID da Instância (Instance ID)</label>
                  <Input
                    id="zapi-instance-id"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="Ex.: seu-id-de-instancia-zapi"
                    style={{ fontSize: 12 }}
                    data-testid="input-zapi-instance-id"
                  />
                </div>

                <div className="field">
                  <label htmlFor="zapi-token" style={{ fontSize: 11 }}>Token da Instância (Instance Token)</label>
                  <Input
                    id="zapi-token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={config?.hasToken ? "Token já configurado — informe apenas para substituir" : "Informe o token da instância"}
                    style={{ fontSize: 12 }}
                    data-testid="input-zapi-token"
                  />
                </div>

                <div className="field">
                  <label htmlFor="zapi-client-token" style={{ fontSize: 11 }}>Client Token (Segurança - Opcional)</label>
                  <Input
                    id="zapi-client-token"
                    value={clientToken}
                    onChange={(e) => setClientToken(e.target.value)}
                    placeholder={config?.hasClientToken ? "Client Token já configurado — informe apenas para substituir" : "Token de segurança da conta Z-API (se ativado)"}
                    style={{ fontSize: 12 }}
                    data-testid="input-zapi-client-token"
                  />
                </div>

                <div style={{ display: "flex", gap: 16, margin: "4px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={(checked) => setIsActive(checked === true)}
                    />
                    Integração Ativa
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <Checkbox
                      checked={autoReply}
                      onCheckedChange={(checked) => setAutoReply(checked === true)}
                    />
                    Autoresposta Bot
                  </label>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div><strong className="text-sm">Menções em grupos</strong><p className="text-xs text-muted-foreground">Registra o grupo e abre atendimento somente quando esta instância é mencionada.</p></div>
                    <Checkbox checked={groupsEnabled} onCheckedChange={(checked) => setGroupsEnabled(checked === true)} aria-label="Ativar atendimento por menção em grupos" />
                  </div>
                  <div className="grid gap-3">
                    <div className="field"><label htmlFor="zapi-instance-phone" style={{ fontSize: 11 }}>Número detectado da instância</label><Input id="zapi-instance-phone" value={config?.instancePhoneMasked || "Atualize o status para detectar"} readOnly disabled /></div>
                    <div className="field"><label htmlFor="group-cooldown" style={{ fontSize: 11 }}>Intervalo mínimo por participante (segundos)</label><Input id="group-cooldown" type="number" min={5} max={3600} value={groupCooldownSeconds} onChange={(event) => setGroupCooldownSeconds(Math.min(3600, Math.max(5, Number(event.target.value) || 60)))} disabled={!groupsEnabled} /></div>
                    <div className="field"><label htmlFor="group-message" style={{ fontSize: 11 }}>Mensagem de confirmação privada</label><Textarea id="group-message" value={groupConfirmMessage} onChange={(event) => setGroupConfirmMessage(event.target.value)} placeholder="Olá, {{nome}}! Recebemos sua solicitação no grupo {{grupo}}." disabled={!groupsEnabled} /></div>
                    <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <div className="field"><label htmlFor="group-mode" style={{ fontSize: 11 }}>Destino do atendimento</label><select id="group-mode" className="input" value={groupConversationMode} onChange={(event) => setGroupConversationMode(event.target.value as "PRIVATE_LEGACY" | "IN_GROUP")} disabled={!groupsEnabled}><option value="PRIVATE_LEGACY">Continuar no privado</option><option value="IN_GROUP">Continuar no grupo</option></select></div>
                      <div className="field"><label htmlFor="group-response-mode" style={{ fontSize: 11 }}>Quem pode responder</label><select id="group-response-mode" className="input" value={groupResponseMode} onChange={(event) => setGroupResponseMode(event.target.value as "ANY_PARTICIPANT" | "ORIGIN_PARTICIPANT")} disabled={!groupsEnabled}><option value="ANY_PARTICIPANT">Qualquer participante</option><option value="ORIGIN_PARTICIPANT">Somente solicitante</option></select></div>
                    </div>
                    <label className="flex items-center gap-2 text-xs"><Checkbox checked={groupConfirmInGroup} onCheckedChange={(checked) => setGroupConfirmInGroup(checked === true)} disabled={!groupsEnabled} />Confirmar também no grupo (opcional)</label>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
                  onClick={() => setSaveConfirmOpen(true)}
                  disabled={updateConfig.isPending || !instanceId.trim() || (!token.trim() && !config?.hasToken)}
                  data-testid="button-save-zapi"
                >
                  <Save size={15} />
                  {updateConfig.isPending ? "Salvando e Conectando..." : "Salvar Credenciais e Gerar QR Code"}
                </Button>

                {saveSuccess && (
                  <p style={{ color: "#10b981", fontSize: 11, textAlign: "center", marginTop: 4 }}>
                    ✓ Credenciais atualizadas com sucesso!
                  </p>
                )}
              </div>
            </div>

            {/* DIAGNÓSTICO & DICAS DE RESOLUÇÃO */}
            <div className="panel" style={{ padding: 20 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>
                <HelpCircle size={17} />
                <h3 style={{ fontSize: 13 }}>Como Resolver "Instance Not Found"</h3>
              </div>
              <ul className="subtle" style={{ paddingLeft: 16, margin: 0, fontSize: 11, lineHeight: 1.6 }}>
                <li><b>1. Iniciar Instância:</b> Verifique se a sua instância no painel da Z-API está ativa e não pausada.</li>
                <li><b>2. Token Renovado:</b> Se você clicou em <i>"Gerar novo token"</i> na Z-API, cole o novo token no campo acima e clique em Salvar.</li>
                <li><b>3. Webhook:</b> Certifique-se de registrar a URL de webhook abaixo.</li>
              </ul>
            </div>

            {/* WEBHOOKS CARD */}
            <div className="panel" style={{ padding: 20 }}>
              <div className="panel-title" style={{ marginBottom: 10 }}>
                <Globe size={18} color="#10b981" />
                <h3>Sincronização de Webhook</h3>
              </div>
              <div className="field">
                <label htmlFor="zapi-webhook-url" style={{ fontSize: 11 }}>URL do Webhook</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <Input
                    id="zapi-webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    style={{ flex: 1, fontSize: 11 }}
                    data-testid="input-zapi-webhook-url"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyWebhook}>
                    <Copy size={13} /> {copied ? "OK!" : "Copiar"}
                  </Button>
                </div>
              </div>

              {!isPublicHttpsWebhook && (
                <p style={{ color: "#f87171", fontSize: 11, marginTop: 7, lineHeight: 1.4 }}>
                  Informe uma URL pública HTTPS. A Z-API não consegue entregar mensagens em localhost.
                </p>
              )}

              <Button
                variant="default"
                size="lg"
                style={{ width: "100%", marginTop: 12, justifyContent: "center", fontSize: 12 }}
                onClick={() => setWebhookConfirmOpen(true)}
                disabled={setWebhook.isPending || !isPublicHttpsWebhook}
              >
                <Zap size={14} /> {setWebhook.isPending ? "Registrando..." : "Registrar Webhook na Z-API"}
              </Button>

              {setWebhook.isSuccess && (
                <p style={{ color: setWebhook.data?.warning ? "#f59e0b" : "#10b981", fontSize: 11, marginTop: 6, textAlign: "center" }}>
                  {setWebhook.data?.warning ? `⚠ ${setWebhook.data.warning}` : "✓ Webhooks de recebimento, entrega e status registrados com sucesso!"}
                </p>
              )}
              {setWebhook.isError && (
                <p style={{ color: "#f87171", fontSize: 11, marginTop: 6, textAlign: "center" }}>
                  {setWebhook.error instanceof Error ? setWebhook.error.message : "Falha ao registrar webhook."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        tone="warning"
        title="Salvar credenciais da Z-API?"
        description="A integração será reconfigurada e uma nova consulta de conexão será realizada."
        confirmLabel="Salvar credenciais"
        details={<span>Instância <strong>{instanceId ? `${instanceId.slice(0, 6)}••••${instanceId.slice(-4)}` : "não informada"}</strong></span>}
        onConfirm={handleSaveCredentials}
        testId="button-confirm-save-zapi"
      />
      <ConfirmationDialog
        open={disconnectConfirmOpen}
        onOpenChange={setDisconnectConfirmOpen}
        tone="danger"
        title="Desconectar o WhatsApp?"
        description="O canal deixará de receber e enviar mensagens até que um novo QR Code seja autenticado."
        confirmLabel="Desconectar WhatsApp"
        onConfirm={handleDisconnect}
        testId="button-confirm-disconnect-zapi"
      />
      <ConfirmationDialog
        open={webhookConfirmOpen}
        onOpenChange={setWebhookConfirmOpen}
        tone="warning"
        title="Registrar este webhook?"
        description="A Z-API passará a entregar os eventos da instância nesta URL."
        confirmLabel="Registrar webhook"
        details={<span className="break-all">{webhookUrl}</span>}
        onConfirm={handleRegisterWebhook}
        testId="button-confirm-webhook-zapi"
      />
    </div>
  );
}
