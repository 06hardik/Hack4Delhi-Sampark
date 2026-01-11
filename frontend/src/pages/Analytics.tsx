import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { OffendersTable } from '@/components/parking/OffendersTable';
import { ViolationHeatmap } from '@/components/parking/ViolationHeatmap';
import { StatsCard } from '@/components/parking/StatsCard';
import { ViolationsTable } from '@/components/parking/ViolationsTable';
import { PollingIndicator } from '@/components/parking/PollingIndicator';
import { usePolling } from '@/hooks/usePolling';
import {
  getAggregateStats,
  getChronicOffenders,
  getHeatmapData,
} from '@/api/stats.api';
import { getViolations } from '@/api/violations.api';
import {
  ChronicOffender,
  ViolationHeatmapData,
  AggregateStats,
  Violation,
} from '@/types/parking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  AlertTriangle,
  BarChart3,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

export default function Analytics() {
  const navigate = useNavigate();

  const { data: offenders } = usePolling<ChronicOffender[]>({
    fetcher: getChronicOffenders,
    interval: 30000,
  });

  const { data: heatmapData } = usePolling<ViolationHeatmapData[]>({
    fetcher: getHeatmapData,
    interval: 30000,
  });

  const { data: stats, lastUpdated } = usePolling<AggregateStats>({
    fetcher: getAggregateStats,
    interval: 10000,
  });

  const { data: violations } = usePolling<Violation[]>({
    fetcher: () => getViolations('resolved'),
    interval: 30000,
  });

  const lotChartData =
    violations?.reduce((acc, v) => {
      const name = v.lotName.split('—')[0];
      const existing = acc.find((x) => x.name === name);
      if (existing) {
        existing.violations++;
        existing.penalties += v.penaltyAmount;
      } else {
        acc.push({ name, violations: 1, penalties: v.penaltyAmount });
      }
      return acc;
    }, [] as { name: string; violations: number; penalties: number }[]) || [];

  return (
    <DashboardLayout>
      <Header
        title="Analytics"
        subtitle="Violation patterns and trends"
        actions={
          <PollingIndicator
            lastUpdated={lastUpdated}
            isLoading={!stats}
            interval={10000}
          />
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          ) : (
            <>
              <StatsCard title="Today" value={stats.violationsToday} icon={AlertTriangle} />
              <StatsCard title="This Week" value={stats.violationsThisWeek} icon={Calendar} />
              <StatsCard title="This Month" value={stats.violationsThisMonth} icon={TrendingUp} />
              <StatsCard
                title="Total Penalties"
                value={`₹${stats.totalPenaltiesAssessed.toLocaleString('en-IN')}`}
                icon={IndianRupee}
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <BarChart3 className="inline mr-2" />
              Violations by Lot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={lotChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="violations" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {heatmapData && <ViolationHeatmap data={heatmapData} />}

        {offenders && <OffendersTable offenders={offenders} />}

        {violations && (
          <ViolationsTable
            violations={violations.slice(0, 5)}
            onViolationClick={(id) => navigate(`/violations/${id}`)}
            compact
          />
        )}
      </div>
    </DashboardLayout>
  );
}
