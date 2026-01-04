import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  BarChart3, 
  Zap,
  Car,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/violations', icon: AlertTriangle, label: 'Violations' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/simulation', icon: Zap, label: 'Simulation' },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      'h-screen bg-white border-r border-border flex flex-col transition-all duration-200 relative z-50',
      isCollapsed ? 'w-14' : 'w-56'
    )}>
      {/* Logo Header */}
      <div className={cn(
        'h-14 flex items-center border-b border-border px-3',
        isCollapsed ? 'justify-center' : 'gap-2'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary flex-shrink-0">
          <Car className="h-4 w-4 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-foreground truncate">ParkEnforce</span>
            <span className="text-[10px] text-muted-foreground truncate">MCD Capacity Monitor</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors',
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-muted',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle - hidden on mobile */}
      <div className="p-2 border-t border-border hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground hover:bg-muted h-8',
            isCollapsed && 'justify-center px-0'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
