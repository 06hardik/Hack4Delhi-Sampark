import { CountEventInput } from "./event.types";

export function validateCountEvent(payload: any): CountEventInput {
  if (!payload) throw new Error("Missing payload");

  const { lotId, timestamp, count, source } = payload;

  if (!lotId || typeof lotId !== "string")
    throw new Error("Invalid lotId");

  if (!timestamp || isNaN(Date.parse(timestamp)))
    throw new Error("Invalid timestamp");

  if (typeof count !== "number" || count < 0)
    throw new Error("Invalid count");

  if (!source || typeof source !== "string")
    throw new Error("Invalid source");

  return { lotId, timestamp, count, source };
}
