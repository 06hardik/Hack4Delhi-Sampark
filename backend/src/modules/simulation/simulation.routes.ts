import { FastifyInstance } from "fastify";
import { simulateScenario } from "./simulation.service";

export async function simulationRoutes(app: FastifyInstance) {
  app.post("/api/simulate", async (req) => {
    const { scenario, events } = req.body as {
      scenario: string;
      events: { lotId: string; count: number }[];
    };

    return simulateScenario(scenario, events);
  });
}
