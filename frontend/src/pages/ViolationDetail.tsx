import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/parking/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getViolationById,
  getViolationEvidence
} from '@/api/violations.api';
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
  if (minutes < 60) return `${minutes} minutes`;
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
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const v = await getViolationById(id);
        const e = await getViolationEvidence(id);
        setViolation(v);
        setEvidence(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Violation Details" />
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  if (!violation) {
    return (
      <DashboardLayout>
        <Header title="Violation Not Found" />
        <div className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <Button onClick={() => navigate('/violations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
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
          <Button variant="outline" size="sm" onClick={() => navigate('/violations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="p-3 md:p-6 space-y-6">
        <StatusBadge
          status={isActive ? 'violating' : 'compliant'}
          showPulse={isActive}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {evidence.map(ev => (
            <EvidenceCard key={ev.id} evidence={ev} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
