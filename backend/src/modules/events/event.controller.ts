import { FastifyRequest, FastifyReply } from "fastify";
import { validateCountEvent } from "./event.validator";
import { sha256 } from "../../utils/hashing";

export async function ingestEvent(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const event = validateCountEvent(req.body);

    const payloadHash = sha256(JSON.stringify(event));

    // TEMP: no DB yet, just acknowledge
    reply.code(202).send({
      status: "ACCEPTED",
      payloadHash
    });
  } catch (err: any) {
    reply.code(400).send({
      error: err.message
    });
  }
}
