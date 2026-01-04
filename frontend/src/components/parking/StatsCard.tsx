import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'border-border bg-white',
  success: 'border-status-compliant/30 bg-white',
  warning: 'border-status-compliant/30 bg-white',
  danger: 'border-status-violating/30 bg-white',
};

const iconVariantStyles = {
  default: 'text-primary bg-muted',
  success: 'text-status-compliant bg-status-compliant/10',
  warning: 'text-status-compliant bg-status-compliant/10',
  danger: 'text-status-violating bg-status-violating/10',
};

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      'rounded border p-3 md:p-4 transition-colors min-w-0',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide truncate">{title}</p>
          <p className="text-lg md:text-xl font-semibold text-foreground truncate">{value}</p>
          {subtitle && (
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'p-1.5 md:p-2 rounded flex-shrink-0',
            iconVariantStyles[variant]
          )}>
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-[10px] md:text-xs flex-wrap">
          <span className={cn(
            'font-medium',
            trend.isPositive ? 'text-status-compliant' : 'text-status-violating'
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
