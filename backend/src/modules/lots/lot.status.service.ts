import { prisma } from "../../db/prisma";

export async function listLotsWithStatus() {
  const lots = await prisma.parkingLot.findMany();

  const results = [];

  for (const lot of lots) {
    // Latest OPEN violation (if any)
    const activeViolation = await prisma.violation.findFirst({
      where: {
        lotId: lot.id,
        status: "OPEN"
      },
      orderBy: { openedAt: "desc" }
    });

    // Current count (TEMP = 0 until per-lot count events are indexed)
    const currentCount = 0;

    const utilizationPercent =
      (currentCount / lot.allowedCapacity) * 100;

    const status =
      activeViolation || currentCount > lot.allowedCapacity
        ? "violating"
        : "compliant";

    results.push({
      id: lot.id,
      name: lot.name,
      contractor: lot.contractor,
      allowedCapacity: lot.allowedCapacity,
      currentCount,
      utilizationPercent: Math.round(utilizationPercent),
      status,
      activeViolation: activeViolation
        ? {
            id: activeViolation.id,
            excessCount: activeViolation.excessCount,
            durationMin: activeViolation.durationMin
          }
        : null
    });
  }

  return results;
}
