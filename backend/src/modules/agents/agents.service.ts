import bcrypt from "bcryptjs";
import { agentsRepository } from "./agents.repository.js";
import type { CreateAgentInput, UpdateAgentInput } from "./agents.schemas.js";

export class AgentsService {
  private formatAgent(agent: {
    id: string; name: string; email: string; role: string; isOnline: boolean; isActive: boolean;
    departmentId: string | null; department?: { name: string } | null;
  }) {
    return {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      isOnline: agent.isOnline,
      isActive: agent.isActive,
      departmentId: agent.departmentId,
      departmentName: agent.department?.name ?? null,
    };
  }

  async list() {
    const agents = await agentsRepository.findAll();
    return agents.map((agent) => this.formatAgent(agent));
  }

  async create(data: CreateAgentInput) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const agent = await agentsRepository.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      departmentId: data.departmentId,
      isActive: data.isActive,
    });

    return this.formatAgent(agent);
  }

  async update(
    id: string,
    data: UpdateAgentInput,
    actorId: string,
  ) {
    if (data.isActive === false && id === actorId) {
      throw new Error("Você não pode desativar o próprio usuário.");
    }
    const current = await agentsRepository.findById(id);
    if (!current) throw new Error("Atendente não encontrado.");
    if (current.role === "ADMIN" && data.isActive === false && await agentsRepository.countActiveAdmins() <= 1) {
      throw new Error("Não é possível desativar o último administrador ativo.");
    }
    const agent = await agentsRepository.update(id, data);
    return this.formatAgent(agent);
  }

  async resetPassword(id: string, password: string) {
    const hash = await bcrypt.hash(password, 12);
    const agent = await agentsRepository.resetPassword(id, hash);
    return this.formatAgent(agent);
  }

  async delete(id: string, actorId: string) {
    if (id === actorId) throw new Error("Você não pode excluir o próprio usuário.");
    const current = await agentsRepository.findById(id);
    if (!current) throw new Error("Atendente não encontrado.");
    if (current.role === "ADMIN" && current.isActive && await agentsRepository.countActiveAdmins() <= 1) {
      throw new Error("Não é possível excluir o último administrador ativo.");
    }
    await agentsRepository.delete(id);
    return { success: true, message: "Atendente removido com sucesso" };
  }
}

export const agentsService = new AgentsService();
