import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface PollingIndicatorProps {
  lastUpdated: Date | null;
  isLoading?: boolean;
  interval?: number;
  className?: string;
}

export function PollingIndicator({ 
  lastUpdated, 
  isLoading = false, 
  interval = 5000,
  className 
}: PollingIndicatorProps) {
  return (
    <div className={cn(
      'flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground',
      className
    )}>
      <RefreshCw className={cn(
        'h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0',
        isLoading && 'animate-spin'
      )} />
      <span className="hidden sm:inline">
        {isLoading ? (
          'Updating...'
        ) : lastUpdated ? (
          `Updated ${format(lastUpdated, 'HH:mm:ss')}`
        ) : (
          'Waiting for data...'
        )}
      </span>
      <span className="sm:hidden">
        {isLoading ? '...' : lastUpdated ? format(lastUpdated, 'HH:mm') : '...'}
      </span>
      <span className="text-muted-foreground/60 hidden md:inline">
        (every {interval / 1000}s)
      </span>
    </div>
  );
}