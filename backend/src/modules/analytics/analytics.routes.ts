import { FastifyInstance } from "fastify";
import { getViolationHeatmap } from "./heatmap.service";
import { getChronicOffenders } from "./chronic-offenders.service";

export async function analyticsRoutes(app: FastifyInstance) {
  app.get("/api/analytics/heatmap", async (req) => {
    const { days } = req.query as { days?: string };
    return getViolationHeatmap(days ? Number(days) : 7);
  });

  app.get("/api/analytics/chronic-offenders", async () => {
    return getChronicOffenders();
  });
}
