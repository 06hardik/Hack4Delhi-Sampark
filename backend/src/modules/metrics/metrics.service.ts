import { prisma } from "../../db/prisma";

export async function getGlobalMetrics() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(1);

  const [
    violationsToday,
    violationsThisWeek,
    violationsThisMonth,
    activeViolations,
    allLots,
    violatingLots,
    penalties
  ] = await Promise.all([
    prisma.violation.count({
      where: { openedAt: { gte: startOfToday } }
    }),
    prisma.violation.count({
      where: { openedAt: { gte: startOfWeek } }
    }),
    prisma.violation.count({
      where: { openedAt: { gte: startOfMonth } }
    }),
    prisma.violation.count({
      where: { status: "OPEN" }
    }),
    prisma.parkingLot.count(),
    prisma.violation.count({
      where: { status: "OPEN" },
      distinct: ["lotId"]
    }),
    prisma.violation.aggregate({
      _sum: { penalty: true }
    })
  ]);

  return {
    violationsToday,
    violationsThisWeek,
    violationsThisMonth,
    activeViolations,
    lotsViolating: violatingLots,
    lotsInCompliance: allLots - violatingLots,
    totalPenaltiesAssessed: penalties._sum.penalty ?? 0
  };
}
