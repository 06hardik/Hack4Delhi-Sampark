import { SimulationState, SimulationScenario } from '@/types/parking';
import { scenarioConfigs } from '@/data/seedData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Square, Zap, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface SimulationControlProps {
  state: SimulationState;
  onStart: (scenario: SimulationScenario) => void;
  onStop: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SimulationControl({ 
  state, 
  onStart, 
  onStop, 
  isLoading = false,
  className 
}: SimulationControlProps) {
  return (
    <div className={cn('rounded border bg-white p-3 md:p-4 space-y-3 md:space-y-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="h-4 w-4 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-xs md:text-sm truncate">Simulation Control</h3>
        </div>
        
        {state.isRunning && (
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-status-compliant" />
            </span>
            <span className="text-[10px] md:text-xs text-status-compliant font-medium">Running</span>
          </div>
        )}
      </div>
      
      {state.isRunning ? (
        <div className="space-y-3 md:space-y-4">
          {/* Active simulation info */}
          <div className="rounded bg-muted p-2 md:p-3 space-y-1.5 md:space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground">Scenario</span>
              <span className="text-[10px] md:text-xs font-medium truncate">
                {scenarioConfigs.find(s => s.id === state.scenario)?.name}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground">Started</span>
              <span className="text-[10px] md:text-xs">
                {state.startedAt && format(state.startedAt, 'HH:mm:ss')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground">Events</span>
              <span className="text-[10px] md:text-xs flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {state.eventsGenerated}
              </span>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={onStop}
            disabled={isLoading}
            className="w-full h-7 md:h-8 text-[10px] md:text-xs"
          >
            <Square className="h-3 w-3 mr-1.5 md:mr-2" />
            Stop Simulation
          </Button>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Start Rush Hour simulation to test high traffic patterns:
          </p>
          
          <Button
            variant="default"
            onClick={() => onStart('rush_hour')}
            disabled={isLoading}
            className="w-full h-9 md:h-10 text-xs md:text-sm"
          >
            Start Simulation
          </Button>
        </div>
      )}
    </div>
  );
}
