import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/parking/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { parkingService } from '@/services/parkingService';
import { Violation, Evidence } from '@/types/parking';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Clock, 
  Camera, 
  Hash, 
  MapPin, 
  IndianRupee,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyHash = async () => {
    await navigator.clipboard.writeText(evidence.sha256Hash);
    setCopied(true);
    toast({ title: 'Hash copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted relative">
        <img 
          src={evidence.imageUrl} 
          alt={`Evidence captured at ${format(evidence.capturedAt, 'HH:mm:ss')}`}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="absolute top-2 right-2 bg-white/90 rounded px-1.5 py-0.5 text-[10px] font-medium">
          {evidence.vehicleCount} vehicles
        </div>
      </div>
      <CardContent className="p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">
            {format(evidence.capturedAt, 'MMM d, yyyy HH:mm:ss')}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {evidence.metadata.cameraId}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          Section {evidence.metadata.lotSection}
        </div>
        <div className="flex items-center gap-1.5">
          <code className="flex-1 text-[10px] bg-muted p-1 rounded truncate">
            {evidence.sha256Hash.substring(0, 20)}...
          </code>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={copyHash}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ViolationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchViolation = async () => {
      setIsLoading(true);
      const data = await parkingService.getViolation(id);
      setViolation(data);
      setIsLoading(false);
    };

    fetchViolation();
    
    // Poll for active violations
    const interval = setInterval(fetchViolation, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Violation Details" />
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
          <Skeleton className="h-6 md:h-8 w-36 md:w-48" />
          <div className="grid md:grid-cols-2 gap-3 md:gap-6">
            <Skeleton className="h-48 md:h-56" />
            <Skeleton className="h-48 md:h-56" />
          </div>
          <Skeleton className="h-64 md:h-80" />
        </div>
      </DashboardLayout>
    );
  }

  if (!violation) {
    return (
      <DashboardLayout>
        <Header title="Violation Not Found" />
        <div className="p-3 md:p-6 text-center">
          <FileText className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground/50 mb-2 md:mb-3" />
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">The violation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/violations')} size="sm">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            Back to Violations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isActive = violation.status === 'active';
  const currentDuration = isActive 
    ? Math.floor((Date.now() - violation.startedAt.getTime()) / 60000)
    : violation.durationMinutes;

  return (
    <DashboardLayout>
      <Header 
        title={violation.lotName}
        subtitle="MCD Operated Parking"
        actions={
          <Button variant="outline" onClick={() => navigate('/violations')} size="sm" className="h-7 md:h-8 text-xs md:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
            Back
          </Button>
        }
      />
      
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Status Banner */}
        <div className={cn(
          'rounded border p-2 md:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2',
          isActive ? 'bg-status-violating/5 border-status-violating/30' : 'bg-muted'
        )}>
          <div className="flex items-center gap-2">
            <StatusBadge 
              status={isActive ? 'violating' : 'compliant'} 
              showPulse={isActive}
              size="md"
            />
            <span className="text-[10px] md:text-xs">
              {isActive ? 'This violation is currently active' : 'This violation has been resolved'}
            </span>
          </div>
          <span className="text-[9px] md:text-[10px] text-muted-foreground">
            ID: {violation.id}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 space-y-3 md:space-y-4">
              <div className="relative pl-4 md:pl-5 space-y-2.5 md:space-y-3">
                <div className="absolute left-1 md:left-1.5 top-1.5 bottom-1.5 w-px bg-border" />
                
                <div className="relative">
                  <div className="absolute left-[-13px] md:left-[-17px] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-status-violating" />
                  <div>
                    <p className="text-[10px] md:text-xs font-medium">Violation Started</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {format(violation.startedAt, 'MMM d, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-[-13px] md:left-[-17px] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-[10px] md:text-xs font-medium">Peak Excess</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {violation.peakCount} vehicles (+{violation.maxExcess} over capacity)
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className={cn(
                    'absolute left-[-13px] md:left-[-17px] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full',
                    isActive ? 'bg-muted-foreground' : 'bg-status-compliant'
                  )} />
                  <div>
                    <p className="text-[10px] md:text-xs font-medium">
                      {isActive ? 'Ongoing' : 'Violation Ended'}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {isActive 
                        ? `Duration: ${formatDuration(currentDuration)}`
                        : violation.endedAt && format(violation.endedAt, 'MMM d, yyyy HH:mm:ss')
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-[10px] md:text-xs">
                  <span className="text-muted-foreground">Total Duration</span>
                  <span className="font-medium">
                    {formatDuration(currentDuration)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penalty Card */}
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                <IndianRupee className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                Penalty Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 space-y-2 md:space-y-3">
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span className="text-muted-foreground">Allowed Capacity</span>
                  <span>{violation.allowedCapacity} vehicles</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span className="text-muted-foreground">Peak Count</span>
                  <span className="text-status-violating font-medium">
                    {violation.peakCount} vehicles
                  </span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span className="text-muted-foreground">Maximum Excess</span>
                  <span className="font-medium">
                    +{violation.maxExcess} vehicles
                  </span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{formatDuration(currentDuration)}</span>
                </div>
              </div>

              <div className="border-t pt-2 md:pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium">Total Penalty</span>
                  <span className="text-base md:text-lg font-bold">
                    {isActive ? (
                      <span className="text-muted-foreground text-xs md:text-sm">Calculating...</span>
                    ) : (
                      formatCurrency(violation.penaltyAmount)
                    )}
                  </span>
                </div>
                 <div className="mt-2 md:mt-3 p-2 md:p-3 bg-primary/5 border border-primary/20 rounded">
                  <p className="text-[10px] md:text-xs font-medium text-primary mb-1">Penalty Formula</p>
                  <code className="text-[10px] md:text-xs font-mono bg-white px-1.5 py-0.5 rounded border">
                    Max Excess × Duration (hrs) × Hourly Rate
                  </code>
                </div>
              </div>

              <div className="bg-muted rounded p-1.5 md:p-2">
                <div className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px]">
                  <Hash className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Rule Version:</span>
                  <code>{violation.ruleVersion}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evidence Gallery */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs md:text-sm font-semibold flex items-center gap-1.5 md:gap-2">
              <Camera className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              Evidence ({violation.evidence.length} items)
            </h2>
          </div>
          
          {violation.evidence.length === 0 ? (
            <Card className="p-4 md:p-6 text-center">
              <Camera className="h-8 w-8 md:h-10 md:w-10 mx-auto text-muted-foreground/50 mb-1.5 md:mb-2" />
              <p className="text-[10px] md:text-xs text-muted-foreground">No evidence captured yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {violation.evidence.map((ev) => (
                <EvidenceCard key={ev.id} evidence={ev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
