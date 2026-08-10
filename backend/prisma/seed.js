"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Iniciando seed do banco de dados...");
    // Limpar tabelas existentes em ordem respeitando FKs
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.procedure.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.department.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.flowDefinition.deleteMany();
    // 1. Departamentos
    const deptGeral = await prisma.department.create({
        data: {
            name: "Suporte Geral",
            description: "Dúvidas gerais, acessos e suporte de Nível 1.",
        },
    });
    const deptRede = await prisma.department.create({
        data: {
            name: "Rede e Internet",
            description: "Conectividade, VPN, roteadores e infraestrutura de rede.",
        },
    });
    const deptAudio = await prisma.department.create({
        data: {
            name: "Áudio e Vídeo",
            description: "Equipamentos de estúdio, transmissões e suporte técnico audiovisual.",
        },
    });
    // 2. Procedimentos por Departamento
    await prisma.procedure.createMany({
        data: [
            {
                departmentId: deptGeral.id,
                title: "Reset de Senha de Domínio",
                content: "1. Verificar documento no sistema.\n2. Gerar senha provisória de 8 dígitos.\n3. Enviar SMS ou comunicar via ramal.",
                order: 1,
            },
            {
                departmentId: deptRede.id,
                title: "Diagnóstico Rápido de VPN",
                content: "1. Validar status do FortiClient.\n2. Confirmar IP da interface de rede (10.200.x.x).\n3. Testar ping para 10.200.0.1.",
                order: 1,
            },
            {
                departmentId: deptAudio.id,
                title: "Checagem de Transmissão ao Vivo",
                content: "1. Conferir entrada de áudio na mesa de som virtual.\n2. Checar bitrate no OBS (meta: 4500 kbps).\n3. Testar delay da transmissão.",
                order: 1,
            },
        ],
    });
    // 3. Atendentes
    const agentMarina = await prisma.agent.create({
        data: {
            id: "agent-marina",
            name: "Marina Costa",
            email: "marina.costa@torreforte.org",
            role: "SUPERVISOR",
            departmentId: deptGeral.id,
            isOnline: true,
        },
    });
    const agentJoao = await prisma.agent.create({
        data: {
            name: "João Silva",
            email: "joao.silva@torreforte.org",
            role: "ADMIN",
            departmentId: deptRede.id,
            isOnline: true,
        },
    });
    const agentCarlos = await prisma.agent.create({
        data: {
            name: "Carlos Eduardo",
            email: "carlos.eduardo@torreforte.org",
            role: "AGENT",
            departmentId: deptAudio.id,
            isOnline: false,
        },
    });
    // 4. Contatos de Exemplo
    const contact1 = await prisma.contact.create({
        data: {
            phone: "+55 11 98888-1111",
            name: "Pr. Roberto Alves",
        },
    });
    const contact2 = await prisma.contact.create({
        data: {
            phone: "+55 11 97777-2222",
            name: "Ana Maria de Jesus",
        },
    });
    const contact3 = await prisma.contact.create({
        data: {
            phone: "+55 11 96666-3333",
            name: "Lucas Mendonça",
        },
    });
    // 5. Conversas e Mensagens
    const conv1 = await prisma.conversation.create({
        data: {
            contactId: contact1.id,
            status: "QUEUED",
            departmentId: deptGeral.id,
            startedAt: new Date(Date.now() - 1000 * 60 * 15),
        },
    });
    await prisma.message.createMany({
        data: [
            {
                conversationId: conv1.id,
                direction: "IN",
                senderType: "CLIENT",
                content: "Olá! Não estou conseguindo acessar meu e-mail institucional.",
                createdAt: new Date(Date.now() - 1000 * 60 * 15),
            },
            {
                conversationId: conv1.id,
                direction: "OUT",
                senderType: "BOT",
                content: "Olá Pr. Roberto Alves! Sou o assistente GTF-Bot. Encaminhei sua solicitação para a fila do Suporte Geral.",
                createdAt: new Date(Date.now() - 1000 * 60 * 14),
            },
        ],
    });
    const conv2 = await prisma.conversation.create({
        data: {
            contactId: contact2.id,
            status: "IN_PROGRESS",
            departmentId: deptAudio.id,
            assignedAgentId: agentMarina.id,
            startedAt: new Date(Date.now() - 1000 * 60 * 45),
        },
    });
    await prisma.message.createMany({
        data: [
            {
                conversationId: conv2.id,
                direction: "IN",
                senderType: "CLIENT",
                content: "O áudio do microfone sem fio está falhando durante o ensaio.",
                createdAt: new Date(Date.now() - 1000 * 60 * 45),
            },
            {
                conversationId: conv2.id,
                direction: "OUT",
                senderType: "AGENT",
                senderAgentId: agentMarina.id,
                content: "*Marina Costa - Suporte T.I.*\nOlá Ana Maria! Vou te ajudar com as frequências do microfone agora.",
                createdAt: new Date(Date.now() - 1000 * 60 * 30),
            },
        ],
    });
    const conv3 = await prisma.conversation.create({
        data: {
            contactId: contact3.id,
            status: "BOT",
            startedAt: new Date(Date.now() - 1000 * 60 * 5),
        },
    });
    await prisma.message.create({
        data: {
            conversationId: conv3.id,
            direction: "IN",
            senderType: "CLIENT",
            content: "Boa tarde!",
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
        },
    });
    // 6. Fluxo Padrão do Bot
    await prisma.flowDefinition.create({
        data: {
            name: "Fluxo Padrão Torre Forte",
            greeting: "Olá! Seja bem-vindo ao atendimento de T.I. Torre Forte.",
            menuMessage: "Como podemos ajudar você hoje? Digite o número da opção desejada:",
            options: [
                {
                    label: "1. Suporte Geral e Senhas",
                    departmentId: deptGeral.id,
                    procedureMessage: "Estou te direcionando para a equipe de Suporte Geral...",
                },
                {
                    label: "2. Problemas com Internet e VPN",
                    departmentId: deptRede.id,
                    procedureMessage: "Estou te direcionando para a equipe de Rede e Conectividade...",
                },
                {
                    label: "3. Transmissão, Áudio e Estúdio",
                    departmentId: deptAudio.id,
                    procedureMessage: "Estou te direcionando para a equipe de Áudio e Vídeo...",
                },
            ],
        },
    });
    console.log("Seed concluído com sucesso!");
}
main()
    .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
