import { FastifyInstance } from "fastify";
import { getLotHistory } from "./lot.history.service";

export async function lotHistoryRoutes(app: FastifyInstance) {
  app.get("/api/lots/:lotId/history", async (req) => {
    const { lotId } = req.params as { lotId: string };
    return getLotHistory(lotId);
  });
}
