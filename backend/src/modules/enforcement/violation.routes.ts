import { FastifyInstance } from "fastify";
import { listViolations } from "./violation.read.service";

export async function violationRoutes(app: FastifyInstance) {
  app.get("/api/violations", async (req) => {
    const { status } = req.query as { status?: string };
    return listViolations(status);
  });
}
