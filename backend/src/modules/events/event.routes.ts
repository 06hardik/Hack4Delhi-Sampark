import { FastifyInstance } from "fastify";
import { ingestEvent } from "./event.controller";

export async function eventRouter(fastify: FastifyInstance) {
  fastify.post("/count", ingestEvent);
}
