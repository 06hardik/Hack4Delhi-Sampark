import { prisma } from "../../db/prisma";

type SimulatedEvent = {
  lotId: string;
  count: number;
};

export async function simulateScenario(
  scenario: string,
  events: SimulatedEvent[]
) {
  const results = [];

  for (const e of events) {
    const lot = await prisma.parkingLot.findUnique({
      where: { id: e.lotId }
    });

    if (!lot) continue;

    if (e.count > lot.allowedCapacity) {
      const excess = e.count - lot.allowedCapacity;

      results.push({
        lotId: lot.id,
        allowedCapacity: lot.allowedCapacity,
        simulatedCount: e.count,
        excess,
        estimatedPenalty: excess * 50, // deterministic rule
        status: "violating"
      });
    }
  }

  return {
    scenario,
    simulatedViolations: results
  };
}
