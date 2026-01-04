import { ParkingLotWithStatus } from '@/types/parking';
import { StatusBadge } from './StatusBadge';
import { UtilizationBar } from './UtilizationBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ParkingLotsTableProps {
  lots: ParkingLotWithStatus[];
  onLotClick?: (lotId: string) => void;
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function ParkingLotsTable({ lots, onLotClick, className }: ParkingLotsTableProps) {
  return (
    <div className={cn('rounded border bg-white overflow-x-auto', className)}>
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Lot Name</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center whitespace-nowrap">Capacity</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center whitespace-nowrap">Current</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[120px] md:w-[160px] whitespace-nowrap">Utilization</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center whitespace-nowrap">Status</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right whitespace-nowrap">Violation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lots.map((lot) => (
            <TableRow
              key={lot.id}
              className={cn(
                'cursor-pointer transition-colors',
                lot.status === 'violating' && 'bg-status-violating/5 hover:bg-status-violating/10'
              )}
              onClick={() => onLotClick?.(lot.id)}
            >
              <TableCell className="text-xs md:text-sm font-medium max-w-[150px] md:max-w-none truncate">{lot.name}</TableCell>
              <TableCell className="text-center text-xs md:text-sm">{lot.allowedCapacity}</TableCell>
              <TableCell className={cn(
                'text-center text-xs md:text-sm font-medium whitespace-nowrap',
                lot.currentCount > lot.allowedCapacity && 'text-status-violating'
              )}>
                {lot.currentCount}
                {lot.currentCount > lot.allowedCapacity && (
                  <span className="text-[10px] md:text-xs ml-1 text-status-violating">
                    (+{lot.currentCount - lot.allowedCapacity})
                  </span>
                )}
              </TableCell>
              <TableCell>
                <UtilizationBar 
                  utilization={lot.utilization} 
                  status={lot.status} 
                />
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge 
                  status={lot.status} 
                  showPulse={lot.status === 'violating'}
                  size="sm"
                />
              </TableCell>
              <TableCell className="text-right">
                {lot.activeViolation ? (
                  <div className="flex items-center justify-end gap-1 md:gap-1.5 text-xs md:text-sm whitespace-nowrap">
                    <AlertTriangle className="h-3 w-3 md:h-3.5 md:w-3.5 text-status-violating" />
                    <span className="text-status-violating text-[10px] md:text-xs font-medium">
                      {formatDuration(lot.activeViolation.durationMinutes)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs md:text-sm">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
