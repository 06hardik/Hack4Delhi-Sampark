import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { OffendersTable } from '@/components/parking/OffendersTable';
import { ViolationHeatmap } from '@/components/parking/ViolationHeatmap';
import { StatsCard } from '@/components/parking/StatsCard';
import { ViolationsTable } from '@/components/parking/ViolationsTable';
import { PollingIndicator } from '@/components/parking/PollingIndicator';
import { usePolling } from '@/hooks/usePolling';
import { parkingService } from '@/services/parkingService';
import { 
  ChronicOffender, 
  ViolationHeatmapData, 
  AggregateStats,
  Violation 
} from '@/types/parking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  AlertTriangle,
  BarChart3,
  Clock
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
  Cell
} from 'recharts';

const COLORS = ['hsl(210, 70%, 35%)', 'hsl(145, 55%, 38%)', 'hsl(40, 70%, 50%)', 'hsl(0, 60%, 50%)', 'hsl(280, 40%, 45%)'];

export default function Analytics() {
  const navigate = useNavigate();

  const { data: offenders, isLoading: offendersLoading } = usePolling<ChronicOffender[]>({
    fetcher: parkingService.getChronicOffenders,
    interval: 30000,
  });

  const { data: heatmapData, isLoading: heatmapLoading } = usePolling<ViolationHeatmapData[]>({
    fetcher: parkingService.getHeatmapData,
    interval: 30000,
  });

  const { data: stats, isLoading: statsLoading, lastUpdated } = usePolling<AggregateStats>({
    fetcher: parkingService.getAggregateStats,
    interval: 10000,
  });

  const { data: violations } = usePolling<Violation[]>({
    fetcher: () => parkingService.getViolations({ status: 'resolved' }),
    interval: 30000,
  });

  // Prepare chart data - by lot instead of contractor
  const lotChartData = violations?.reduce((acc, v) => {
    const lotName = v.lotName.split('—')[1]?.trim().split(',')[0] || v.lotName.substring(0, 15);
    const existing = acc.find(item => item.name === lotName);
    if (existing) {
      existing.violations++;
      existing.penalties += v.penaltyAmount;
    } else {
      acc.push({ name: lotName, violations: 1, penalties: v.penaltyAmount });
    }
    return acc;
  }, [] as { name: string; violations: number; penalties: number }[]) || [];

  const pieData = lotChartData.map(l => ({
    name: l.name,
    value: l.penalties,
  }));

  return (
    <DashboardLayout>
      <Header 
        title="Analytics" 
        subtitle="Violation patterns and parking lot performance"
        actions={
          <PollingIndicator 
            lastUpdated={lastUpdated} 
            isLoading={statsLoading}
            interval={10000}
          />
        }
      />
      
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {statsLoading || !stats ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 md:h-24" />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Today"
                value={stats.violationsToday}
                icon={AlertTriangle}
                variant={stats.violationsToday > 0 ? 'danger' : 'success'}
              />
              <StatsCard
                title="This Week"
                value={stats.violationsThisWeek}
                icon={Calendar}
              />
              <StatsCard
                title="This Month"
                value={stats.violationsThisMonth}
                icon={TrendingUp}
              />
              <StatsCard
                title="Total Penalties"
                value={`₹${stats.totalPenaltiesAssessed.toLocaleString('en-IN')}`}
                icon={IndianRupee}
              />
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3 md:gap-6">
          {/* Lot Violations Chart */}
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                Violations by Lot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              {offendersLoading ? (
                <Skeleton className="h-48 md:h-56" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={lotChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 88%)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 8, fill: 'hsl(220, 10%, 45%)' }}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: 'hsl(220, 10%, 45%)' }}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid hsl(220, 10%, 88%)',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar 
                      dataKey="violations" 
                      fill="hsl(210, 70%, 35%)" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Penalty Distribution */}
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                <IndianRupee className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                Penalty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              {offendersLoading ? (
                <Skeleton className="h-48 md:h-56" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Penalties']}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid hsl(220, 10%, 88%)',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-[9px] md:text-[10px]">
                    <div 
                      className="w-2 h-2 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[60px] md:max-w-[80px]">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader className="p-3 md:p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-semibold">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              Violation Frequency by Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {heatmapLoading || !heatmapData ? (
              <Skeleton className="h-48 md:h-56" />
            ) : (
              <ViolationHeatmap data={heatmapData} />
            )}
          </CardContent>
        </Card>

        {/* Violation Summary */}
        <div className="space-y-2 md:space-y-3">
          <h2 className="text-xs md:text-sm font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            Violation Summary
          </h2>
          {offendersLoading || !offenders ? (
            <Skeleton className="h-48 md:h-56" />
          ) : (
            <OffendersTable offenders={offenders} />
          )}
        </div>

        {/* Recent Resolved Violations */}
        <div className="space-y-2 md:space-y-3">
          <h2 className="text-xs md:text-sm font-semibold text-foreground">Recent Resolved Violations</h2>
          {!violations ? (
            <Skeleton className="h-48 md:h-56" />
          ) : (
            <ViolationsTable 
              violations={violations.slice(0, 5)} 
              onViolationClick={(id) => navigate(`/violations/${id}`)}
              compact
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
