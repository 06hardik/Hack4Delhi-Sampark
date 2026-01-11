import Fastify from "fastify";
import cors from "@fastify/cors";
import { eventLedger } from "./modules/events/event.ledger";
import { eventRouter } from "./modules/events/event.routes";
// Event ingestion
import { ingestEvent } from "./modules/events/event.controller";

// Enforcement / violations
import { violationRoutes } from "./modules/enforcement/violation.routes";

// Lots
import { lotRoutes } from "./modules/lots/lot.routes";
import { lotStatusRoutes } from "./modules/lots/lot.status.routes";
import { lotHistoryRoutes } from "./modules/lots/lot.history.routes";

// Metrics
import { metricsRoutes } from "./modules/metrics/metrics.routes";

// Analytics
import { analyticsRoutes } from "./modules/analytics/analytics.routes";

// Simulation
import { simulationRoutes } from "./modules/simulation/simulation.routes";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });
  (app as any).eventLedger = eventLedger;

  // ---- Plugins ----
  app.register(cors, {
    origin: true,
  });

  // ---- Health Check ----
  app.get("/health", async () => {
    return { status: "OK" };
  });

  // // ---- Event Ingestion ----
  // app.post("/api/events/count", ingestEvent);

  // ---- APIs ----
  app.register(violationRoutes);
  app.register(lotRoutes);
  app.register(lotStatusRoutes);
  app.register(lotHistoryRoutes);
  app.register(metricsRoutes);
  app.register(analyticsRoutes);
  app.register(simulationRoutes);
  app.register(eventRouter, { prefix: "/api/events" });

  return app;
}
