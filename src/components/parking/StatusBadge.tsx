import { cn } from '@/lib/utils';
import { ComplianceStatus } from '@/types/parking';

interface StatusBadgeProps {
  status: ComplianceStatus;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<ComplianceStatus, { label: string; className: string }> = {
  compliant: {
    label: 'Compliant',
    className: 'bg-status-compliant/10 text-status-compliant border border-status-compliant/30',
  },
  violating: {
    label: 'Violating',
    className: 'bg-status-violating/10 text-status-violating border border-status-violating/30',
  },
};

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function StatusBadge({ status, showPulse = false, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded',
        sizeConfig[size],
        config.className,
        className
      )}
    >
      {showPulse && status === 'violating' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {config.label}
    </span>
  );
}
