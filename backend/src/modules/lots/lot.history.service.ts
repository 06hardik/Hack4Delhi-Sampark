import { prisma } from "../../db/prisma";

export async function getLotHistory(lotId: string) {
  const events = await prisma.eventLedger.findMany({
    where: {
      lotId,
      eventType: "COUNT_EVENT"
    },
    orderBy: {
      timestamp: "asc"
    },
    take: 100   // last 100 points (safe default)
  });

  return events.map(e => ({
    timestamp: e.timestamp,
    count: e.payload.count
  }));
}
