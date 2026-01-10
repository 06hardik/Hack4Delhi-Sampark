import { prisma } from "../../db/prisma";

export async function listLots() {
  const lots = await prisma.parkingLot.findMany();

  const results = [];

  for (const lot of lots) {
    // Get latest count event for this lot
    const latestEvent = await prisma.eventLedger.findFirst({
      where: {
        eventType: "COUNT_EVENT"
      },
      orderBy: { timestamp: "desc" }
    });

    // NOTE: Until per-lot events are indexed,
    // this assumes single-lot testing.
    // We will fix this when SignedCountEvent table is added.
    const currentCount = latestEvent ? 0 : 0;

    results.push({
      id: lot.id,
      name: lot.name,
      contractor: lot.contractor,
      allowedCapacity: lot.allowedCapacity,
      currentCount,
      latitude: lot.latitude,
      longitude: lot.longitude
    });
  }

  return results;
}
