import { PrismaClient } from "../../src/generated/prisma/index.js";

const prisma = new PrismaClient();

export const flowIntegrationRepository = {
  async createFixture() {
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const department = await prisma.department.create({ data: { name: `Flow Test ${suffix}` } });
    const contact = await prisma.contact.create({ data: { phone: `test-${suffix}`, name: "Teste integrado" } });
    const agent = await prisma.agent.create({ data: { name: "Flow Test", email: `flow-${suffix}@test.local`, role: "ADMIN" } });
    const definition = await prisma.flowDefinition.create({ data: { name: `Flow Test ${suffix}`, greeting: "Olá", menuMessage: "Escolha", options: [] } });
    const revision = await prisma.flowRevision.create({ data: { flowDefinitionId: definition.id, version: 1, status: "PUBLISHED", publishedAt: new Date() } });
    const entry = await prisma.flowNode.create({ data: { flowRevisionId: revision.id, stableKey: "entry", type: "ENTRY", name: "Entrada" } });
    const decision = await prisma.flowNode.create({ data: { flowRevisionId: revision.id, stableKey: "decision", type: "DECISION", name: "Decisão", content: "Escolha" } });
    const route = await prisma.flowNode.create({ data: { flowRevisionId: revision.id, stableKey: "route", type: "ROUTE", name: "Suporte", departmentId: department.id } });
    const triage = await prisma.flowNode.create({ data: { flowRevisionId: revision.id, stableKey: "triage", type: "TRIAGE", name: "Triagem", content: "Dados", config: { responseKey: "details" } } });
    const handoff = await prisma.flowNode.create({ data: { flowRevisionId: revision.id, stableKey: "handoff", type: "HANDOFF", name: "Fila", departmentId: department.id } });
    await prisma.flowTransition.createMany({ data: [
      { flowRevisionId: revision.id, fromNodeId: entry.id, toNodeId: decision.id },
      { flowRevisionId: revision.id, fromNodeId: decision.id, toNodeId: route.id, optionKey: "support", label: "Suporte" },
      { flowRevisionId: revision.id, fromNodeId: route.id, toNodeId: triage.id },
      { flowRevisionId: revision.id, fromNodeId: triage.id, toNodeId: handoff.id },
    ] });
    const conversation = await prisma.conversation.create({ data: { contactId: contact.id, flowRevisionId: revision.id, currentFlowNodeId: decision.id, currentStep: "FLOW_V2" } });
    return { department, contact, agent, definition, revision, entry, decision, route, triage, handoff, conversation };
  },
  async getConversation(id) { return prisma.conversation.findUnique({ where: { id } }); },
  async updateConversation(id, data) { return prisma.conversation.update({ where: { id }, data }); },
  async addRouteDecision(fixture) {
    await prisma.flowTransition.deleteMany({ where: { flowRevisionId: fixture.revision.id, fromNodeId: fixture.route.id, toNodeId: fixture.triage.id } });
    const decision = await prisma.flowNode.create({ data: {
      flowRevisionId: fixture.revision.id,
      stableKey: "support-submenu",
      type: "DECISION",
      name: "Assunto de suporte",
      content: "Qual assunto descreve melhor sua necessidade?",
      config: {
        parentRouteId: fixture.route.id,
        decisionScope: "ROUTE",
        decisionOptions: [
          { optionKey: "support-password", label: "Acesso e senha" },
          { optionKey: "support-network", label: "Rede e Internet" },
        ],
      },
    } });
    await prisma.flowTransition.createMany({ data: [
      { flowRevisionId: fixture.revision.id, fromNodeId: fixture.route.id, toNodeId: decision.id },
      { flowRevisionId: fixture.revision.id, fromNodeId: decision.id, toNodeId: fixture.triage.id, optionKey: "support-password", label: "Acesso e senha", sortOrder: 0 },
      { flowRevisionId: fixture.revision.id, fromNodeId: decision.id, toNodeId: fixture.triage.id, optionKey: "support-network", label: "Rede e Internet", sortOrder: 1 },
    ] });
    return decision;
  },
  async cleanup(fixture) {
    await prisma.conversation.deleteMany({ where: { id: fixture.conversation.id } });
    await prisma.contact.deleteMany({ where: { id: fixture.contact.id } });
    await prisma.flowDefinition.deleteMany({ where: { id: fixture.definition.id } });
    await prisma.agent.deleteMany({ where: { id: fixture.agent.id } });
    await prisma.department.deleteMany({ where: { id: fixture.department.id } });
  },
};

process.on("exit", () => { void prisma.$disconnect(); });
