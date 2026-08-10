import bcrypt from "bcryptjs";
import { agentsRepository } from "./agents.repository.js";

export class AgentsService {
  private formatAgent(agent: any) {
    return {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      isOnline: agent.isOnline,
      departmentId: agent.departmentId,
      departmentName: agent.department?.name ?? null,
    };
  }

  async list() {
    const agents = await agentsRepository.findAll();
    return agents.map((agent) => this.formatAgent(agent));
  }

  async create(data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    departmentId?: string | null;
  }) {
    const rawPassword = data.password || "123456";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const agent = await agentsRepository.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      departmentId: data.departmentId,
    });

    return this.formatAgent(agent);
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      departmentId?: string | null;
      isOnline?: boolean;
    }
  ) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const agent = await agentsRepository.update(id, updateData);
    return this.formatAgent(agent);
  }

  async delete(id: string) {
    await agentsRepository.delete(id);
    return { success: true, message: "Atendente removido com sucesso" };
  }
}

export const agentsService = new AgentsService();
