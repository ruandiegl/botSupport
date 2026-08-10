import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando banco de dados e preparando ambiente de produção limpo...");

  // Limpar tabelas mantendo ordem de chave estrangeira
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.department.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.flowDefinition.deleteMany();
  await prisma.zApiConfig.deleteMany();

  // 1. Departamentos Reais da Operação
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

  // 2. Procedimentos Operacionais Padrão
  await prisma.procedure.createMany({
    data: [
      {
        departmentId: deptGeral.id,
        title: "Reset de Senha de Domínio",
        content: "1. Verificar documento no sistema.\n2. Gerar senha provisória de 8 dígitos.\n3. Comunicar solicitante.",
        order: 1,
      },
      {
        departmentId: deptRede.id,
        title: "Diagnóstico Rápido de VPN",
        content: "1. Validar status do FortiClient.\n2. Confirmar IP da interface (10.200.x.x).\n3. Testar ping para 10.200.0.1.",
        order: 1,
      },
      {
        departmentId: deptAudio.id,
        title: "Checagem de Transmissão ao Vivo",
        content: "1. Conferir entrada de áudio na mesa virtual.\n2. Checar bitrate no OBS (meta: 4500 kbps).\n3. Testar delay da transmissão.",
        order: 1,
      },
    ],
  });

  // 3. Atendentes de T.I. e Administrador
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);

  await prisma.agent.create({
    data: {
      name: "Administrador Sistema",
      email: "admin@torreforte.org",
      password: adminPasswordHash,
      role: "ADMIN",
      isOnline: true,
    },
  });

  await prisma.agent.create({
    data: {
      id: "agent-marina",
      name: "Marina Costa",
      email: "marina.costa@torreforte.org",
      password: adminPasswordHash,
      role: "SUPERVISOR",
      departmentId: deptGeral.id,
      isOnline: true,
    },
  });

  await prisma.agent.create({
    data: {
      name: "João Silva",
      email: "joao.silva@torreforte.org",
      password: adminPasswordHash,
      role: "ADMIN",
      departmentId: deptRede.id,
      isOnline: true,
    },
  });

  await prisma.agent.create({
    data: {
      name: "Carlos Eduardo",
      email: "carlos.eduardo@torreforte.org",
      password: adminPasswordHash,
      role: "AGENT",
      departmentId: deptAudio.id,
      isOnline: false,
    },
  });

  // 4. Fluxo Padrão do Bot
  await prisma.flowDefinition.create({
    data: {
      name: "Atendimento Suporte TI - Grupo GTF",
      greeting: "Olá, você está falando com Suporte TI - Grupo GTF! Qual sua necessidade?\n\nNós do Grupo GTF temos o prazer de atendê-lo(a).",
      menuMessage: "Para darmos início ao seu atendimento, precisamos que informe por qual equipe deseja ser atendido:",
      options: [
        {
          label: "Suporte",
          departmentId: deptGeral.id,
          procedureMessage: "Você selecionou a equipe Suporte.",
        },
        {
          label: "Rede / Internet",
          departmentId: deptRede.id,
          procedureMessage: "Você selecionou a equipe Rede / Internet.",
        },
        {
          label: "Áudio / Vídeo",
          departmentId: deptAudio.id,
          procedureMessage: "Você selecionou a equipe Áudio / Vídeo.",
        },
      ],
    },
  });

  // 5. Instância Z-API Base (Configurada no backend)
  if (process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN) {
    await prisma.zApiConfig.create({
      data: {
        instanceId: process.env.ZAPI_INSTANCE_ID,
        token: process.env.ZAPI_TOKEN,
        clientToken: process.env.ZAPI_CLIENT_TOKEN || "",
        webhookUrl: process.env.ZAPI_WEBHOOK_URL || "",
        isActive: true,
        autoReply: true,
      },
    });
  }

  console.log("Banco de dados limpo e populado com dados de produção reais!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
