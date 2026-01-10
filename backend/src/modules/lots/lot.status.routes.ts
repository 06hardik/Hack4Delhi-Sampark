import { FastifyInstance } from "fastify";
import { listLotsWithStatus } from "./lot.status.service";

export async function lotStatusRoutes(app: FastifyInstance) {
  app.get("/api/lots/with-status", async () => {
    return listLotsWithStatus();
  });
}
