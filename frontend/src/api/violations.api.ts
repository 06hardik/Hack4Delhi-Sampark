import { api } from "./client";
import { Violation, Evidence } from "@/types/parking";

/**
 * Get violations
 * @param status optional: "active" | "resolved"
 */
export const getViolations = (status?: "active" | "resolved") => {
  const query = status ? `?status=${status}` : "";
  return api<Violation[]>(`/violations${query}`);
};

/**
 * Get single violation by ID
 */
export const getViolationById = (violationId: string) => {
  return api<Violation>(`/violations/${violationId}`);
};

/**
 * Get evidence for a violation
 */
export const getViolationEvidence = (violationId: string) => {
  return api<Evidence[]>(`/violations/${violationId}/evidence`);
};
