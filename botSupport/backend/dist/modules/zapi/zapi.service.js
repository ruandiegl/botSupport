import { zApiRepository } from "./zapi.repository.js";
import { logger } from "../../shared/logger.js";
import { conversationEvents } from "../../shared/events.js";
function parseZApiError(status, data) {
    const rawMsg = data?.error || data?.message || data?.reason || "";
    if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("instance not found")) {
        return "Instância não encontrada na Z-API. Verifique se as credenciais configuradas no ambiente (.env) estão corretas e ativas no painel Z-API.";
    }
    if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("client-token")) {
        return "Client-Token da conta não configurado. Informe o Token de Segurança da Conta Z-API.";
    }
    if (typeof rawMsg === "string" && (rawMsg.toLowerCase().includes("token") || status === 401 || status === 403)) {
        return "Token de acesso inválido ou sem permissão.";
    }
    if (status === 404) {
        return "Instância não encontrada na Z-API (404).";
    }
    if (rawMsg) {
        return `Z-API: ${rawMsg} (HTTP ${status})`;
    }
    return `Erro HTTP ${status} ao comunicar com a Z-API.`;
}
export function parseIncomingMessage(payload) {
    if (payload?.type !== "ReceivedCallback" ||
        payload?.fromMe === true ||
        payload?.isGroup === true ||
        payload?.isNewsletter === true ||
        payload?.isStatusReply === true ||
        payload?.notification) {
        return null;
    }
    const phone = String(payload.phone || payload.senderPhone || payload.chatId || "").replace(/\D/g, "");
    if (!phone)
        return null;
    const buttonResponse = payload.buttonsResponseMessage;
    const listResponse = payload.listResponseMessage;
    const selectedOptionId = String(buttonResponse?.buttonId || listResponse?.selectedRowId || "").trim() || undefined;
    const content = String(buttonResponse?.message ||
        listResponse?.title ||
        listResponse?.message ||
        payload.text?.message ||
        (typeof payload.text === "string" ? payload.text : "") ||
        payload.body ||
        payload.caption ||
        (typeof payload.message === "string" ? payload.message : "") ||
        "Mensagem recebida").trim();
    return {
        phone,
        senderName: payload.senderName || payload.pushName || payload.chatName || payload.name || "Contato WhatsApp",
        content,
        selectedOptionId,
    };
}
function normalize(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .toLowerCase();
}
export function findSelectedOption(options, content, selectedOptionId) {
    if (selectedOptionId) {
        const numericIndex = Number(selectedOptionId) - 1;
        if (Number.isInteger(numericIndex) && options[numericIndex])
            return options[numericIndex];
    }
    const normalizedContent = normalize(content);
    return options.find((option, index) => {
        const normalizedLabel = normalize(option.label);
        return (normalizedContent === String(index + 1) ||
            normalizedContent === normalizedLabel ||
            normalizedLabel.includes(normalizedContent) ||
            normalizedContent.includes(normalizedLabel));
    });
}
export function buildButtonListPayload(phone, message, options) {
    return {
        phone,
        message,
        buttonList: {
            buttons: options.map((option, index) => ({
                id: String(index + 1),
                label: option.label,
            })),
        },
    };
}
export class ZApiService {
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 10 || cleaned.length === 11) {
            return `55${cleaned}`;
        }
        return cleaned;
    }
    async getConfig() {
        let dbConfig = await zApiRepository.getConfig();
        // Obter credenciais prioritariamente do ambiente (.env) se disponíveis
        const envInstanceId = process.env.ZAPI_INSTANCE_ID || "";
        const envToken = process.env.ZAPI_TOKEN || "";
        const envClientToken = process.env.ZAPI_CLIENT_TOKEN || "";
        const envWebhookUrl = process.env.ZAPI_WEBHOOK_URL || "http://localhost:3001/api/webhooks/z-api";
        if (!dbConfig) {
            dbConfig = await zApiRepository.upsertConfig({
                instanceId: envInstanceId,
                token: envToken,
                clientToken: envClientToken,
                webhookUrl: envWebhookUrl,
            });
        }
        else if (!dbConfig.instanceId || !dbConfig.token) {
            dbConfig = await zApiRepository.upsertConfig({
                instanceId: envInstanceId,
                token: envToken,
                clientToken: dbConfig.clientToken || envClientToken,
                webhookUrl: dbConfig.webhookUrl || envWebhookUrl,
            });
        }
        return {
            ...dbConfig,
            instanceId: dbConfig.instanceId || envInstanceId,
            token: dbConfig.token || envToken,
            clientToken: dbConfig.clientToken ?? envClientToken,
            webhookUrl: dbConfig.webhookUrl || envWebhookUrl,
        };
    }
    async checkStatus(overrideInstanceId, overrideToken) {
        const config = await this.getConfig();
        const instanceId = (overrideInstanceId !== undefined && overrideInstanceId !== "") ? overrideInstanceId : config.instanceId;
        const token = (overrideToken !== undefined && overrideToken !== "") ? overrideToken : config.token;
        if (!instanceId || !token) {
            return { connected: false, message: "Instância Z-API não configurada no servidor." };
        }
        try {
            const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                },
            });
            const data = (await response.json().catch(() => ({})));
            if (!response.ok) {
                const friendlyMessage = parseZApiError(response.status, data);
                return { connected: false, message: friendlyMessage, raw: data };
            }
            const connected = data.connected === true || data.status === "CONNECTED" || data.signed === true;
            return {
                connected,
                raw: data,
                message: connected
                    ? "WhatsApp Conectado e Operacional!"
                    : "WhatsApp Desconectado. Aponte a câmera do WhatsApp para o QR Code para conectar.",
            };
        }
        catch (err) {
            logger.error(err, "Erro ao consultar status da Z-API");
            return {
                connected: false,
                message: `Servidor inacessível: ${err.message || "Erro de conexão"}`,
            };
        }
    }
    async getQrCodeImage() {
        const config = await this.getConfig();
        if (!config.instanceId || !config.token) {
            return { connected: false, error: "Instância Z-API não configurada." };
        }
        // Checar primeiro se já está conectado
        const status = await this.checkStatus();
        if (status.connected) {
            return { connected: true, message: "WhatsApp já está conectado!" };
        }
        try {
            // Endpoint de imagem/base64 do QR Code da Z-API
            const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/qr-code/image`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                },
            });
            const data = (await response.json().catch(() => ({})));
            if (!response.ok) {
                // Tentar endpoint alternativo qr-code
                const altUrl = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/qr-code`;
                const altResponse = await fetch(altUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                    },
                });
                const altData = (await altResponse.json().catch(() => ({})));
                if (altResponse.ok && altData.value) {
                    const qrSrc = altData.value.startsWith("data:") ? altData.value : `data:image/png;base64,${altData.value}`;
                    return { connected: false, qrCode: qrSrc };
                }
                return { connected: false, error: parseZApiError(response.status, data) };
            }
            if (data.value) {
                const qrSrc = data.value.startsWith("data:") ? data.value : `data:image/png;base64,${data.value}`;
                return { connected: false, qrCode: qrSrc };
            }
            return { connected: false, error: "QR Code temporariamente indisponível na Z-API." };
        }
        catch (err) {
            logger.error(err, "Erro ao obter QR Code da Z-API");
            return { connected: false, error: `Falha ao buscar QR Code: ${err.message}` };
        }
    }
    async disconnect() {
        const config = await this.getConfig();
        if (!config.instanceId || !config.token) {
            throw new Error("Instância Z-API não configurada.");
        }
        try {
            const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/disconnect`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                },
            });
            const data = (await response.json().catch(() => ({})));
            if (!response.ok) {
                throw new Error(parseZApiError(response.status, data));
            }
            return { success: true, message: "WhatsApp desconectado com sucesso. Um novo QR Code pode ser gerado." };
        }
        catch (err) {
            logger.error(err, "Erro ao desconectar instância Z-API");
            throw new Error(err.message || "Erro ao desconectar WhatsApp.");
        }
    }
    async sendText(phone, text) {
        const config = await this.getConfig();
        if (!config.isActive || !config.instanceId || !config.token) {
            logger.warn("Z-API desativada ou sem credenciais. Mensagem não enviada.");
            return null;
        }
        const formattedPhone = this.formatPhone(phone);
        const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-text`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                },
                body: JSON.stringify({
                    phone: formattedPhone,
                    message: text,
                }),
            });
            const data = (await response.json().catch(() => ({})));
            if (!response.ok) {
                const errorMsg = parseZApiError(response.status, data);
                logger.error({ phone: formattedPhone, errorMsg }, "Erro retornado pela Z-API ao enviar texto");
                return { error: errorMsg };
            }
            logger.info({ phone: formattedPhone, data }, "Mensagem Z-API enviada com sucesso");
            return data;
        }
        catch (err) {
            logger.error(err, `Erro ao enviar mensagem Z-API para ${formattedPhone}`);
            return { error: err.message || "Falha na requisição Z-API" };
        }
    }
    async sendButtonList(phone, message, options) {
        const config = await this.getConfig();
        if (!config.isActive || !config.instanceId || !config.token)
            return null;
        const formattedPhone = this.formatPhone(phone);
        const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-button-list`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                },
                body: JSON.stringify(buildButtonListPayload(formattedPhone, message, options)),
            });
            const data = (await response.json().catch(() => ({})));
            if (!response.ok || data?.error || data?.success === false) {
                // Fallback para envio de mensagem em formato texto se o endpoint de botões/opções falhar
                logger.error({ error: parseZApiError(response.status, data) }, "Falha ao enviar botões Z-API.");
                const fallbackText = `${message}\n\n${options
                    .map((option, index) => `${index + 1}. ${option.label}`)
                    .join("\n")}`;
                return this.sendText(phone, fallbackText);
            }
            logger.info({ phone: formattedPhone, data }, "Botões Z-API enviados com sucesso");
            return data;
        }
        catch (err) {
            logger.error(err, "Falha ao enviar lista de opções Z-API. Usando fallback de texto.");
            const fallbackText = `${message}\n\n${options
                .map((option, index) => `${index + 1}. ${option.label}`)
                .join("\n")}`;
            return this.sendText(phone, fallbackText);
        }
    }
    async updateWebhookUrl(webhookUrl) {
        const config = await this.getConfig();
        if (!config.instanceId || !config.token) {
            throw new Error("Credenciais da Z-API não configuradas.");
        }
        let parsedWebhookUrl;
        try {
            parsedWebhookUrl = new URL(webhookUrl);
        }
        catch {
            throw new Error("Informe uma URL pública HTTPS válida para o webhook.");
        }
        if (parsedWebhookUrl.protocol !== "https:" ||
            ["localhost", "127.0.0.1"].includes(parsedWebhookUrl.hostname)) {
            throw new Error("A Z-API exige um webhook público HTTPS; localhost não recebe mensagens externas.");
        }
        const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/update-webhook-received`;
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
                },
                body: JSON.stringify({ value: webhookUrl }),
            });
            const data = (await response.json().catch(() => ({})));
            if (!response.ok) {
                const errorMsg = parseZApiError(response.status, data);
                throw new Error(errorMsg);
            }
            await zApiRepository.upsertConfig({
                instanceId: config.instanceId,
                token: config.token,
                webhookUrl,
            });
            return { success: true, message: "URL de Webhook registrada com sucesso na Z-API!" };
        }
        catch (err) {
            throw new Error(err.message || "Não foi possível registrar o webhook na Z-API.");
        }
    }
    async handleIncomingWebhook(payload) {
        logger.info({ payload }, "Webhook recebido da Z-API");
        const incoming = parseIncomingMessage(payload);
        if (!incoming)
            return { status: "ignored" };
        const phone = this.formatPhone(incoming.phone);
        let contact = await zApiRepository.findContactByPhone(phone);
        if (!contact)
            contact = await zApiRepository.createContact(phone, incoming.senderName);
        let activeConversation = await zApiRepository.findActiveConversationByContact(contact.id);
        const isNewConversation = !activeConversation;
        if (!activeConversation) {
            activeConversation = await zApiRepository.createConversation(contact.id, "BOT", "AWAITING_TEAM");
        }
        const conversationId = activeConversation.id;
        await zApiRepository.addMessage({
            conversationId,
            direction: "IN",
            senderType: "CLIENT",
            content: incoming.content,
        });
        conversationEvents.emit("conversation_updated", {
            conversationId,
            status: activeConversation.status,
        });
        const config = await this.getConfig();
        if (!config.isActive || !config.autoReply)
            return { status: "auto_reply_disabled" };
        if (activeConversation.status !== "BOT")
            return { status: "message_logged" };
        const flow = await zApiRepository.getLatestFlow();
        if (!flow)
            return { status: "no_flow_configured" };
        const options = flow.options || [];
        if (!options.length)
            return { status: "no_options_configured" };
        const selectedOption = isNewConversation
            ? undefined
            : findSelectedOption(options, incoming.content, incoming.selectedOptionId);
        if (selectedOption) {
            const department = await zApiRepository.getDepartmentById(selectedOption.departmentId);
            const teamName = selectedOption.label || department?.name || "Suporte";
            const replyMessage = `Você selecionou a equipe ${teamName}.\n\nPor favor, informe-nos Sua necessidade de suporte bem detalhada, para que possamos entrar em contato com você em breve.`;
            await zApiRepository.updateConversationStatus(conversationId, {
                status: "QUEUED",
                departmentId: selectedOption.departmentId,
                currentStep: "AWAITING_DETAILS",
            });
            await zApiRepository.addMessage({
                conversationId,
                direction: "OUT",
                senderType: "BOT",
                content: replyMessage,
            });
            await this.sendText(phone, replyMessage);
            conversationEvents.emit("conversation_updated", { conversationId, status: "QUEUED" });
            return { status: "routed_to_department", departmentId: selectedOption.departmentId };
        }
        const menuMessage = `${flow.greeting}\n\n${flow.menuMessage}`;
        await zApiRepository.addMessage({
            conversationId,
            direction: "OUT",
            senderType: "BOT",
            content: menuMessage,
        });
        const textResult = await this.sendText(phone, menuMessage);
        if (textResult?.error) {
            logger.error({ phone, error: textResult.error }, "Falha ao enviar saudação do bot");
        }
        const buttonMessage = "Escolha uma equipe para iniciar o atendimento:";
        await zApiRepository.addMessage({
            conversationId,
            direction: "OUT",
            senderType: "BOT",
            content: buttonMessage,
        });
        const buttonResult = await this.sendButtonList(phone, buttonMessage, options);
        if (buttonResult?.error) {
            logger.error({ phone, error: buttonResult.error }, "Falha ao enviar botões do bot");
        }
        conversationEvents.emit("conversation_updated", { conversationId, status: "BOT" });
        return { status: isNewConversation ? "welcome_sent" : "menu_resent" };
    }
}
export const zApiService = new ZApiService();
