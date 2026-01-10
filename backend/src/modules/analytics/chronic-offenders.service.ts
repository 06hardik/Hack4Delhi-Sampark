import { prisma } from "../../db/prisma";

export async function getChronicOffenders() {
  const violations = await prisma.violation.findMany({
    select: {
      lotId: true,
      durationMin: true,
      penalty: true,
      parkingLot: {
        select: {
          contractor: true
        }
      }
    }
  });

  const map: Record<string, {
    totalViolations: number;
    totalViolationMinutes: number;
    totalPenalties: number;
    lots: Set<string>;
  }> = {};

  for (const v of violations) {
    const contractor = v.parkingLot.contractor;

    if (!map[contractor]) {
      map[contractor] = {
        totalViolations: 0,
        totalViolationMinutes: 0,
        totalPenalties: 0,
        lots: new Set()
      };
    }

    map[contractor].totalViolations += 1;
    map[contractor].totalViolationMinutes += v.durationMin ?? 0;
    map[contractor].totalPenalties += v.penalty ?? 0;
    map[contractor].lots.add(v.lotId);
  }

  return Object.entries(map).map(([contractor, data]) => ({
    contractor,
    totalViolations: data.totalViolations,
    totalViolationHours: Number(
      (data.totalViolationMinutes / 60).toFixed(1)
    ),
    totalPenalties: data.totalPenalties,
    lots: Array.from(data.lots)
  }));
}
