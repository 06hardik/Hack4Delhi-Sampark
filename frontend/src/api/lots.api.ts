import { api } from "./client";
import { ParkingLotWithStatus } from "@/types/parking";

export const getLots = () =>
  api<ParkingLotWithStatus[]>("/lots");
