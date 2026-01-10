import { prisma } from "../../db/prisma";

export async function listViolations(status?: string) {
  return prisma.violation.findMany({
    where: status ? { status } : undefined,
    orderBy: { openedAt: "desc" }
  });
}
