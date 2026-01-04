import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { ParkingLotsTable } from '@/components/parking/ParkingLotsTable';
import { StatsCard } from '@/components/parking/StatsCard';
import { PollingIndicator } from '@/components/parking/PollingIndicator';
import { usePolling } from '@/hooks/usePolling';
import { parkingService } from '@/services/parkingService';
import { ParkingLotWithStatus, AggregateStats } from '@/types/parking';
import { 
  Car, 
  AlertTriangle, 
  IndianRupee
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Overview() {
  const navigate = useNavigate();

  const { 
    data: lots, 
    isLoading: lotsLoading, 
    lastUpdated 
  } = usePolling<ParkingLotWithStatus[]>({
    fetcher: parkingService.getLots,
    interval: 5000,
  });

  const { 
    data: stats, 
    isLoading: statsLoading 
  } = usePolling<AggregateStats>({
    fetcher: parkingService.getAggregateStats,
    interval: 5000,
  });

  // Simulate tick during simulation
  useEffect(() => {
    const simState = parkingService.getSimulationState();
    if (simState.isRunning) {
      const interval = setInterval(() => {
        parkingService.simulateTick();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleLotClick = useCallback((lotId: string) => {
    const lot = lots?.find(l => l.id === lotId);
    if (lot?.activeViolation) {
      navigate(`/violations/${lot.activeViolation.id}`);
    }
  }, [lots, navigate]);

  return (
    <DashboardLayout>
      <Header 
        title="Overview" 
        subtitle="Real-time parking capacity monitoring"
        actions={
          <PollingIndicator 
            lastUpdated={lastUpdated} 
            isLoading={lotsLoading}
          />
        }
      />
      
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
          {statsLoading || !stats ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 md:h-28" />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Total Lots"
                value={lots?.length || 5}
                icon={Car}
                variant="default"
              />
              <StatsCard
                title="Active Violations"
                value={stats.activeViolations}
                subtitle={`${stats.violationsToday} today`}
                icon={AlertTriangle}
                variant={stats.activeViolations > 0 ? 'danger' : 'default'}
              />
              <StatsCard
                title="Penalties (Month)"
                value={`₹${stats.totalPenaltiesAssessed.toLocaleString('en-IN')}`}
                subtitle={`${stats.violationsThisMonth} violations`}
                icon={IndianRupee}
                className="col-span-2 sm:col-span-1"
              />
            </>
          )}
        </div>

        {/* Lots Table */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Parking Lots</h2>
          {lotsLoading || !lots ? (
            <Skeleton className="h-96" />
          ) : (
            <ParkingLotsTable 
              lots={lots} 
              onLotClick={handleLotClick}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}