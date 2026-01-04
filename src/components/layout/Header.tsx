import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
  return (
    <header className={cn(
      'min-h-14 border-b border-border bg-white flex items-center justify-between px-4 md:px-6 py-2',
      className
    )}>
      <div className="min-w-0 flex-1 pl-10 md:pl-0">
        <h1 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {actions}
        
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground h-8 w-8 md:h-9 md:w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-status-violating text-[10px] font-medium flex items-center justify-center text-white">
            3
          </span>
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 md:h-9 md:w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
