import { FastifyRequest, FastifyReply } from "fastify";
import { eventLedger } from "./event.ledger";

interface CountEventPayload {
  lotId: string;
  timestamp: string;
  count: number;
  source?: string;
  frameId?: string;
  confidence?: number;
}

export async function ingestEvent(
  request: FastifyRequest<{ Body: CountEventPayload }>,
  reply: FastifyReply
) {
  const { lotId, timestamp, count } = request.body;

  // Basic validation
  if (!lotId || !timestamp || typeof count !== "number") {
    return reply.status(400).send({ error: "lotId, timestamp and count are required" });
  }

  if (count < 0 || count > 10000) {
    return reply.status(400).send({ error: "count must be between 0 and 10000" });
  }

  const parsedTime = new Date(timestamp);
  if (isNaN(parsedTime.getTime())) {
    return reply.status(400).send({ error: "Invalid ISO8601 timestamp" });
  }

  // Save event (replace with real DB insert if needed)
  await request.server.eventLedger.append({
    lotId,
    timestamp: parsedTime,
    count,
    raw: request.body, // keep full payload for audit/debug
  });

  return reply.status(200).send({ status: "accepted" });
}
