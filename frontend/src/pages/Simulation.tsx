import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { ParkingLotsTable } from '@/components/parking/ParkingLotsTable';
import { ViolationsTable } from '@/components/parking/ViolationsTable';
import { PollingIndicator } from '@/components/parking/PollingIndicator';
import { CongestionHeatmap } from '@/components/parking/CongestionHeatmap';
import { usePolling } from '@/hooks/usePolling';
import { getLots } from '@/api/lots.api';
import { getViolations } from '@/api/violations.api';
import { ParkingLotWithStatus, Violation } from '@/types/parking';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Car } from 'lucide-react';

export default function Simulation() {
  const navigate = useNavigate();

  const {
    data: lots,
    isLoading: lotsLoading,
    lastUpdated,
  } = usePolling<ParkingLotWithStatus[]>({
    fetcher: getLots,
    interval: 3000,
  });

  const {
    data: violations,
  } = usePolling<Violation[]>({
    fetcher: () => getViolations('active'),
    interval: 3000,
  });

  const activeLots =
    lots?.filter(l => l.status === 'violating').length ?? 0;

  return (
    <DashboardLayout>
      <Header
        title="Live Simulation"
        subtitle="Real-time system behavior from CV + backend"
        actions={
          <PollingIndicator
            lastUpdated={lastUpdated}
            isLoading={lotsLoading}
            interval={3000}
          />
        }
      />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Car className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold font-mono">
              {lots?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Lots</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-status-violating/10">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-status-violating" />
            <p className="text-xl font-bold font-mono text-status-violating">
              {activeLots}
            </p>
            <p className="text-xs text-muted-foreground">Violating</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold font-mono">
              {violations?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Active Events</p>
          </div>
        </div>

        {/* Congestion Heatmap */}
        {lots && <CongestionHeatmap lots={lots} />}

        {/* Live Lots Table */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Live Parking Lot Status</h2>

          {lotsLoading || !lots ? (
            <Skeleton className="h-64" />
          ) : (
            <ParkingLotsTable
              lots={lots}
              onLotClick={(lotId) => {
                const lot = lots.find(l => l.id === lotId);
                if (lot?.activeViolation) {
                  navigate(`/violations/${lot.activeViolation.id}`);
                }
              }}
            />
          )}
        </div>

        {/* Active Violations */}
        {violations && violations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-violating" />
              Active Violations ({violations.length})
            </h2>

            <ViolationsTable
              violations={violations}
              onViolationClick={(id) => navigate(`/violations/${id}`)}
              compact
            />
          </div>
        )}

        {/* Empty State */}
        {violations?.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                No active violations right now.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
