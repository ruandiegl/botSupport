import { prisma } from "../../shared/prisma.js";

export class RbacRepository {
  async findByRole(role: string) {
    return prisma.rolePermission.findMany({ where: { role }, orderBy: { resource: "asc" } });
  }

  async upsert(role: string, resource: string, actions: string[]) {
    return prisma.rolePermission.upsert({
      where: { role_resource: { role, resource } },
      create: { role, resource, actions },
      update: { actions },
    });
  }
}

export const rbacRepository = new RbacRepository();
