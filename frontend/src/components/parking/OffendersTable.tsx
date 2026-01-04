import { ChronicOffender } from '@/types/parking';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrendingUp, Building2 } from 'lucide-react';

interface OffendersTableProps {
  offenders: ChronicOffender[];
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

export function OffendersTable({ offenders, className }: OffendersTableProps) {
  if (offenders.length === 0) {
    return (
      <div className={cn('rounded border bg-white p-6 md:p-8 text-center', className)}>
        <TrendingUp className="h-8 w-8 md:h-10 md:w-10 mx-auto text-muted-foreground/50 mb-2 md:mb-3" />
        <p className="text-xs md:text-sm text-muted-foreground">No violation history</p>
      </div>
    );
  }

  // Calculate max values for relative bar widths
  const maxHours = Math.max(...offenders.map(o => o.totalViolationHours));
  const maxPenalties = Math.max(...offenders.map(o => o.totalPenalties));

  return (
    <div className={cn('rounded border bg-white overflow-x-auto', className)}>
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Parking Lots</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center whitespace-nowrap">Violations</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Total Hours</TableHead>
            <TableHead className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Total Penalties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offenders.map((offender) => (
            <TableRow key={offender.contractor}>
              <TableCell>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium truncate">{offender.lots.length} MCD Lots</span>
                  </div>
                  <div className="text-[9px] md:text-[10px] text-muted-foreground truncate max-w-[150px] md:max-w-none">
                    {offender.lots.slice(0, 2).join(' • ')}
                    {offender.lots.length > 2 && ` +${offender.lots.length - 2} more`}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center text-xs md:text-sm font-medium">
                {offender.totalViolations}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="flex-1 h-1 md:h-1.5 bg-muted rounded overflow-hidden min-w-[40px]">
                    <div
                      className="h-full bg-status-violating rounded transition-all"
                      style={{ width: `${(offender.totalViolationHours / maxHours) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] md:text-xs min-w-[32px] md:min-w-[40px] text-right">
                    {formatHours(offender.totalViolationHours)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="flex-1 h-1 md:h-1.5 bg-muted rounded overflow-hidden min-w-[40px]">
                    <div
                      className="h-full bg-primary rounded transition-all"
                      style={{ width: `${(offender.totalPenalties / maxPenalties) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] md:text-xs min-w-[48px] md:min-w-[56px] text-right font-medium">
                    {formatCurrency(offender.totalPenalties)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
