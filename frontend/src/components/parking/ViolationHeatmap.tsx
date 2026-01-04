import { ViolationHeatmapData } from '@/types/parking';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ViolationHeatmapProps {
  data: ViolationHeatmapData[];
  className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return 'bg-muted';
  const ratio = count / max;
  if (ratio < 0.25) return 'bg-primary/20';
  if (ratio < 0.5) return 'bg-primary/40';
  if (ratio < 0.75) return 'bg-status-violating/50';
  return 'bg-status-violating';
}

export function ViolationHeatmap({ data, className }: ViolationHeatmapProps) {
  const { grid, maxCount } = useMemo(() => {
    const grid: Record<string, number> = {};
    let maxCount = 0;
    
    data.forEach(d => {
      const key = `${d.dayOfWeek}-${d.hour}`;
      grid[key] = d.count;
      if (d.count > maxCount) maxCount = d.count;
    });
    
    return { grid, maxCount };
  }, [data]);

  return (
    <div className={cn('space-y-2 overflow-x-auto', className)}>
      {/* Hour labels */}
      <div className="flex pl-8 md:pl-10 min-w-[400px]">
        {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
          <div 
            key={hour} 
            className="flex-1 text-[8px] md:text-[10px] text-muted-foreground text-center"
          >
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      
      {/* Heatmap grid */}
      <div className="space-y-0.5 min-w-[400px]">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-1 md:gap-1.5">
            <span className="w-6 md:w-8 text-[9px] md:text-[10px] text-muted-foreground text-right flex-shrink-0">
              {day}
            </span>
            <div className="flex-1 flex gap-px">
              {HOURS.map(hour => {
                const count = grid[`${dayIndex}-${hour}`] || 0;
                return (
                  <div
                    key={hour}
                    className={cn(
                      'flex-1 h-4 md:h-5 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/20',
                      getIntensityClass(count, maxCount)
                    )}
                    title={`${day} ${hour}:00 - ${count} violation${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 md:gap-3 pt-2">
        <span className="text-[9px] md:text-[10px] text-muted-foreground">Less</span>
        <div className="flex gap-0.5">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-muted" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-primary/20" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-primary/40" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-status-violating/50" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-status-violating" />
        </div>
        <span className="text-[9px] md:text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
