export interface CountEventInput {
  lotId: string;
  timestamp: string; // ISO string
  count: number;
  source: string;
}
