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
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setInstanceId(config.instanceId || "");
      setToken(config.token || "");
      setClientToken(config.clientToken || "");
      setWebhookUrl(config.webhookUrl || "");
      setIsActive(config.isActive ?? true);
      setAutoReply(config.autoReply ?? true);
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

  const handleSaveCredentials = () => {
    updateConfig.mutate(
      {
        instanceId: instanceId.trim(),
        token: token.trim(),
        clientToken: clientToken.trim(),
        webhookUrl: webhookUrl.trim(),
        isActive,
        autoReply,
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

  const handleDisconnect = () => {
    if (window.confirm("Deseja realmente desconectar a sessão atual do WhatsApp?")) {
      disconnectMutation.mutate();
    }
  };

  const handleRegisterWebhook = () => {
    setWebhook.mutate({ webhookUrl: webhookUrl.trim() });
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Administração / canal de atendimento</div>
          <h1>Conexão com WhatsApp (Z-API)</h1>
          <p className="subtle" style={{ marginTop: 9 }}>
            Conecte seu WhatsApp escaneando o QR Code abaixo ou valide as credenciais da sua instância Z-API.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-muted"
            onClick={() => {
              refetchConfig();
              refetchQr();
            }}
            data-testid="button-refresh-qr"
          >
            <RefreshCw size={15} className={isQrLoading ? "animate-spin" : ""} /> Atualizar Status
          </button>
        </div>
      </div>

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
                    background: "#e1f3ed",
                    display: "grid",
                    placeItems: "center",
                    color: "#2b8b75",
                  }}
                >
                  <CheckCircle2 size={44} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, marginBottom: 8, color: "#1e293b" }}>WhatsApp Conectado e Operacional!</h2>
                  <p className="subtle" style={{ maxWidth: 460, margin: "0 auto", fontSize: 13, lineHeight: 1.5 }}>
                    O número de WhatsApp da sua operação está autenticado e pronto. Todas as mensagens enviadas pelos clientes aparecerão em tempo real na fila do GTF-Bot.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                  <button
                    className="btn btn-danger"
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                    data-testid="button-disconnect-whatsapp"
                  >
                    <LogOut size={15} />
                    {disconnectMutation.isPending ? "Desconectando..." : "Desconectar WhatsApp / Ler Novo QR Code"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div className="panel-title" style={{ justifyContent: "center" }}>
                  <QrCode size={22} color="#e0573e" />
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
                    border: "2px dashed #cbd5e1",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    margin: "8px 0",
                    minWidth: 260,
                    minHeight: 260,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {isQrLoading ? (
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <RefreshCw size={30} className="animate-spin" color="#e0573e" />
                      <p className="subtle" style={{ marginTop: 12, fontSize: 12 }}>Consultando Z-API...</p>
                    </div>
                  ) : qrData?.qrCode ? (
                    <img
                      src={qrData.qrCode}
                      alt="QR Code WhatsApp"
                      style={{ width: 230, height: 230, display: "block" }}
                    />
                  ) : (
                    <div style={{ padding: 20, color: "#c95847", maxWidth: 360 }}>
                      <AlertCircle size={32} style={{ margin: "0 auto 8px" }} />
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Instância Z-API Inacessível</p>
                      <p style={{ fontSize: 12, color: "#607485", lineHeight: 1.4 }}>
                        {qrData?.error || "A Z-API informou que a instância não foi encontrada ou está inativa."}
                      </p>
                      <button
                        className="btn btn-muted"
                        style={{ marginTop: 14, fontSize: 11 }}
                        onClick={() => refetchQr()}
                      >
                        <RefreshCw size={13} /> Tentar Novamente
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className="procedure"
                  style={{
                    textAlign: "left",
                    maxWidth: 480,
                    width: "100%",
                    background: "#fffcf7",
                    border: "1px solid #eee5d8",
                    padding: 14,
                    borderRadius: 12,
                  }}
                >
                  <div className="procedure-title" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 6 }}>
                    <Smartphone size={15} color="#e0573e" /> Instruções de Conexão no Celular
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
                <Key size={18} color="#e0573e" />
                <h2>Credenciais da Instância Z-API</h2>
              </div>
              <p className="subtle" style={{ fontSize: 12, marginBottom: 14 }}>
                Insira ou confirme o ID e Token da sua instância Z-API. Se você gerou um novo token no painel da Z-API, atualize-o abaixo:
              </p>

              <div className="form-stack">
                <div className="field">
                  <label htmlFor="zapi-instance-id" style={{ fontSize: 11 }}>ID da Instância (Instance ID)</label>
                  <input
                    id="zapi-instance-id"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="Ex: 3F76E8DC789C31AF53FC1677F7E30103"
                    style={{ fontSize: 12 }}
                    data-testid="input-zapi-instance-id"
                  />
                </div>

                <div className="field">
                  <label htmlFor="zapi-token" style={{ fontSize: 11 }}>Token da Instância (Instance Token)</label>
                  <input
                    id="zapi-token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Ex: 19558090B4D4E3CDBCF6D8A0"
                    style={{ fontSize: 12 }}
                    data-testid="input-zapi-token"
                  />
                </div>

                <div className="field">
                  <label htmlFor="zapi-client-token" style={{ fontSize: 11 }}>Client Token (Segurança - Opcional)</label>
                  <input
                    id="zapi-client-token"
                    value={clientToken}
                    onChange={(e) => setClientToken(e.target.value)}
                    placeholder="Token de segurança da conta Z-API (se ativado)"
                    style={{ fontSize: 12 }}
                    data-testid="input-zapi-client-token"
                  />
                </div>

                <div style={{ display: "flex", gap: 16, margin: "4px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Integração Ativa
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={autoReply}
                      onChange={(e) => setAutoReply(e.target.checked)}
                    />
                    Autoresposta Bot
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
                  onClick={handleSaveCredentials}
                  disabled={updateConfig.isPending || !instanceId.trim() || !token.trim()}
                  data-testid="button-save-zapi"
                >
                  <Save size={15} />
                  {updateConfig.isPending ? "Salvando e Conectando..." : "Salvar Credenciais e Gerar QR Code"}
                </button>

                {saveSuccess && (
                  <p style={{ color: "#3a9b7c", fontSize: 11, textAlign: "center", marginTop: 4 }}>
                    ✓ Credenciais atualizadas com sucesso!
                  </p>
                )}
              </div>
            </div>

            {/* DIAGNÓSTICO & DICAS DE RESOLUÇÃO */}
            <div className="panel" style={{ padding: 20, background: "#f8fafc" }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>
                <HelpCircle size={17} color="#0284c7" />
                <h3 style={{ fontSize: 13 }}>Como Resolver "Instance Not Found"</h3>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                <li><b>1. Iniciar Instância:</b> Verifique se a sua instância no painel da Z-API está ativa e não pausada.</li>
                <li><b>2. Token Renovado:</b> Se você clicou em <i>"Gerar novo token"</i> na Z-API, cole o novo token no campo acima e clique em Salvar.</li>
                <li><b>3. Webhook:</b> Certifique-se de registrar a URL de webhook abaixo.</li>
              </ul>
            </div>

            {/* WEBHOOKS CARD */}
            <div className="panel" style={{ padding: 20 }}>
              <div className="panel-title" style={{ marginBottom: 10 }}>
                <Globe size={18} color="#3a9b7c" />
                <h3>Sincronização de Webhook</h3>
              </div>
              <div className="field">
                <label htmlFor="zapi-webhook-url" style={{ fontSize: 11 }}>URL do Webhook</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    id="zapi-webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    style={{ flex: 1, fontSize: 11 }}
                    data-testid="input-zapi-webhook-url"
                  />
                  <button className="btn btn-muted" onClick={handleCopyWebhook} style={{ padding: "6px 10px", fontSize: 11 }}>
                    <Copy size={13} /> {copied ? "OK!" : "Copiar"}
                  </button>
                </div>
              </div>

              {!isPublicHttpsWebhook && (
                <p style={{ color: "#c95847", fontSize: 11, marginTop: 7, lineHeight: 1.4 }}>
                  Informe uma URL pública HTTPS. A Z-API não consegue entregar mensagens em localhost.
                </p>
              )}

              <button
                className="btn btn-muted"
                style={{ width: "100%", marginTop: 12, justifyContent: "center", fontSize: 12 }}
                onClick={handleRegisterWebhook}
                disabled={setWebhook.isPending || !isPublicHttpsWebhook}
              >
                <Zap size={14} /> {setWebhook.isPending ? "Registrando..." : "Registrar Webhook na Z-API"}
              </button>

              {setWebhook.isSuccess && (
                <p style={{ color: "#3a9b7c", fontSize: 11, marginTop: 6, textAlign: "center" }}>
                  ✓ Webhook registrado com sucesso!
                </p>
              )}
              {setWebhook.isError && (
                <p style={{ color: "#c95847", fontSize: 11, marginTop: 6, textAlign: "center" }}>
                  {setWebhook.error instanceof Error ? setWebhook.error.message : "Falha ao registrar webhook."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
