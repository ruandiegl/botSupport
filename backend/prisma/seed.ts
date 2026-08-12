import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando banco de dados e preparando ambiente de produção limpo...");

  // Limpar tabelas mantendo ordem de chave estrangeira
  await prisma.shortcutAudit.deleteMany();
  await prisma.shortcut.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.department.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.flowDefinition.deleteMany();
  await prisma.zApiConfig.deleteMany();
  await prisma.rolePermission.deleteMany();

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
  const adminPasswordHash = bcrypt.hashSync("admin123", 12);

  const admin = await prisma.agent.create({
    data: {
      name: "Administrador Sistema",
      email: "admin@torreforte.org",
      password: adminPasswordHash,
      role: "ADMIN",
      isOnline: true,
    },
  });

  const marina = await prisma.agent.create({
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

  await prisma.shortcut.createMany({
    data: [
      { title: "Saudação inicial", message: "Olá! Estou acompanhando seu atendimento e vou ajudar com isso.", type: "GREETING", scope: "GLOBAL", sortOrder: 1, createdById: admin.id },
      { title: "Encerramento cordial", message: "Seu atendimento foi concluído. Se precisar de algo mais, estamos à disposição!", type: "CLOSING", scope: "GLOBAL", sortOrder: 2, createdById: admin.id },
      { title: "Validação de acesso", message: "Por favor, confirme seu nome completo e o equipamento em que o erro acontece.", type: "DEPARTMENT", scope: "DEPARTMENT", departmentId: deptGeral.id, sortOrder: 3, createdById: admin.id },
      { title: "Retorno em instantes", message: "Estou verificando os detalhes e retorno em instantes.", type: "PERSONAL", scope: "PERSONAL", ownerId: marina.id, sortOrder: 1, createdById: marina.id },
    ],
  });

  // 4. Fluxo Padrão do Bot
  const flowDefinition = await prisma.flowDefinition.create({
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

  const screenPaths = ["/", "/my-conversations", "/conversation/:id", "/admin/departments", "/admin/agents", "/admin/shortcuts", "/admin/flow", "/admin/zapi", "/admin/rbac"];
  const roleActions: Record<string, Record<string, string[]>> = {
    ADMIN: {
      conversations: ["view", "assume", "close", "send_message"], queue: ["view_all", "view_own"], agents: ["view", "create", "update", "delete"], departments: ["view", "create", "update", "delete"], shortcuts: ["view", "create", "update", "delete", "publish", "use"], flow: ["view", "edit", "publish"], zapi: ["view", "configure"], rbac: ["view", "manage"], reports: ["view"],
    },
    SUPERVISOR: { conversations: ["view", "assume", "close", "send_message"], queue: ["view_all", "view_own"], agents: ["view"], departments: ["view"], shortcuts: ["view", "create", "update", "use"], reports: ["view"] },
    AGENT: { conversations: ["view", "assume", "close", "send_message"], queue: ["view_own"], shortcuts: ["view", "create", "update", "delete", "use"] },
  };
  await prisma.rolePermission.createMany({
    data: Object.entries(roleActions).flatMap(([role, resources]) => [
      ...Object.entries(resources).map(([resource, actions]) => ({ role, resource, actions })),
      ...screenPaths.map((path) => ({ role, resource: `screen:${path}`, actions: role === "ADMIN" || ["/", "/my-conversations", "/conversation/:id", "/admin/shortcuts"].includes(path) ? ["view"] : [] })),
    ]),
  });

  const flowRevision = await prisma.flowRevision.create({ data: { flowDefinitionId: flowDefinition.id, version: 1, status: "PUBLISHED", schemaVersion: 2, publishedAt: new Date(), publishedById: admin.id } });
  const entry = await prisma.flowNode.create({ data: { flowRevisionId: flowRevision.id, stableKey: "entry", type: "ENTRY", name: "Entrada" } });
  const greeting = await prisma.flowNode.create({ data: { flowRevisionId: flowRevision.id, stableKey: "greeting", type: "MESSAGE", name: "Saudação", content: flowDefinition.greeting, sortOrder: 1 } });
  const decision = await prisma.flowNode.create({ data: { flowRevisionId: flowRevision.id, stableKey: "team-decision", type: "DECISION", name: "Escolha da equipe", content: flowDefinition.menuMessage, sortOrder: 2, config: { buttonMessage: "Escolha uma equipe para iniciar o atendimento:" } } });
  await prisma.flowTransition.createMany({ data: [{ flowRevisionId: flowRevision.id, fromNodeId: entry.id, toNodeId: greeting.id }, { flowRevisionId: flowRevision.id, fromNodeId: greeting.id, toNodeId: decision.id }] });
  const routeSeeds = [
    { key: "support", label: "Suporte", departmentId: deptGeral.id, triage: "Você selecionou a equipe Suporte.\nPor favor, informe-nos os dados abaixo para que possamos entrar em contato com você em breve:\n\nSeu nome\nSua emissora\nSua cidade/UF\nSua necessidade de suporte" },
    { key: "network", label: "Rede / Internet", departmentId: deptRede.id, triage: "Você selecionou a equipe Rede / Internet.\nInforme os detalhes necessários para o atendimento." },
    { key: "audio-video", label: "Áudio / Vídeo", departmentId: deptAudio.id, triage: "Você selecionou a equipe Áudio / Vídeo.\nInforme os detalhes necessários para o atendimento." },
  ];
  for (const [index, item] of routeSeeds.entries()) {
    const route = await prisma.flowNode.create({ data: { flowRevisionId: flowRevision.id, stableKey: `route-${item.key}`, type: "ROUTE", name: item.label, sortOrder: index, departmentId: item.departmentId } });
    const triage = await prisma.flowNode.create({ data: { flowRevisionId: flowRevision.id, stableKey: `triage-${item.key}`, type: "TRIAGE", name: `Triagem ${item.label}`, content: item.triage, config: { responseKey: "triageDetails" }, departmentId: item.departmentId } });
    const handoff = await prisma.flowNode.create({ data: { flowRevisionId: flowRevision.id, stableKey: `handoff-${item.key}`, type: "HANDOFF", name: `Encaminhar para ${item.label}`, sortOrder: 1, departmentId: item.departmentId } });
    await prisma.flowTransition.createMany({ data: [
      { flowRevisionId: flowRevision.id, fromNodeId: decision.id, toNodeId: route.id, optionKey: `team-${item.key}`, label: item.label, sortOrder: index },
      { flowRevisionId: flowRevision.id, fromNodeId: route.id, toNodeId: triage.id },
      { flowRevisionId: flowRevision.id, fromNodeId: triage.id, toNodeId: handoff.id },
    ] });
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
