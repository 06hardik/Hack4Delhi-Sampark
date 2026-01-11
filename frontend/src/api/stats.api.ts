import { api } from './client';
import {
  AggregateStats,
  ChronicOffender,
  ViolationHeatmapData,
} from '@/types/parking';

export const getAggregateStats = () => {
  return api<AggregateStats>('/stats/aggregate');
};

export const getChronicOffenders = () => {
  return api<ChronicOffender[]>('/stats/offenders');
};

export const getHeatmapData = () => {
  return api<ViolationHeatmapData[]>('/stats/heatmap');
};
