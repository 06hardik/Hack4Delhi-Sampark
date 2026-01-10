import { prisma } from "../../db/prisma";

export async function getViolationHeatmap(days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const violations = await prisma.violation.findMany({
    where: {
      openedAt: { gte: since }
    },
    select: {
      openedAt: true
    }
  });

  const bucket: Record<string, number> = {};

  for (const v of violations) {
    const date = new Date(v.openedAt);
    const dayOfWeek = date.getDay(); // 0–6
    const hour = date.getHours();    // 0–23
    const key = `${dayOfWeek}-${hour}`;

    bucket[key] = (bucket[key] || 0) + 1;
  }

  return Object.entries(bucket).map(([key, count]) => {
    const [dayOfWeek, hour] = key.split("-").map(Number);
    return { dayOfWeek, hour, count };
  });
}
