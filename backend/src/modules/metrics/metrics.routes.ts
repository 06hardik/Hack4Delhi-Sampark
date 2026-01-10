import { FastifyInstance } from "fastify";
import { getGlobalMetrics } from "./metrics.service";

export async function metricsRoutes(app: FastifyInstance) {
  app.get("/api/metrics/global", async () => {
    return getGlobalMetrics();
  });
}
