import { FastifyInstance } from "fastify";
import { listLots } from "./lot.read.service";

export async function lotRoutes(app: FastifyInstance) {
  app.get("/api/lots", async () => {
    return listLots();
  });
}
