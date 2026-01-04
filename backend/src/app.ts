import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { RuleEngine } from './services/ruleEngine';
import { Simulator } from './services/simulator';

const app = express();
const prisma = new PrismaClient();
const ruleEngine = new RuleEngine(prisma);
const simulator = new Simulator(prisma, ruleEngine);

app.use(cors());
app.use(express.json());

// Get all parking lots with current status
app.get('/api/lots', async (req, res) => {
  const lots = await prisma.parkingLot.findMany({
    include: {
      countEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
      violations: { where: { status: 'active' } }
    }
  });
  
  const lotsWithStatus = lots.map(lot => {
    const currentCount = lot.countEvents[0]?.vehicleCount || 0;
    const activeViolation = lot.violations[0];
    const utilization = (currentCount / lot.allowedCapacity) * 100;
    
    let status = 'compliant';
    if (activeViolation) {
      const graceExpired = new Date(activeViolation.startedAt.getTime() + lot.gracePeriodMinutes * 60000) < new Date();
      status = graceExpired ? 'violating' : 'grace_period';
    } else if (currentCount > lot.allowedCapacity) {
      status = 'grace_period';
    }
    
    return { ...lot, currentCount, utilization, status, activeViolation };
  });
  
  res.json(lotsWithStatus);
});

// Ingest count event
app.post('/api/events/count', async (req, res) => {
  const { lotId, vehicleCount, source = 'sensor' } = req.body;
  
  const event = await prisma.countEvent.create({
    data: { lotId, vehicleCount, source }
  });
  
  await ruleEngine.processCountEvent(lotId, vehicleCount);
  res.json(event);
});

// Get violations
app.get('/api/violations', async (req, res) => {
  const { status, lotId } = req.query;
  const violations = await prisma.violation.findMany({
    where: {
      ...(status && { status: status as string }),
      ...(lotId && { lotId: lotId as string })
    },
    include: { lot: true, evidence: true },
    orderBy: { startedAt: 'desc' }
  });
  res.json(violations);
});

// Get violation by ID
app.get('/api/violations/:id', async (req, res) => {
  const violation = await prisma.violation.findUnique({
    where: { id: req.params.id },
    include: { lot: true, evidence: { orderBy: { capturedAt: 'asc' } } }
  });
  res.json(violation);
});

// Start simulation
app.post('/api/simulate/start', async (req, res) => {
  const { scenario } = req.body;
  await simulator.start(scenario);
  res.json({ running: true, scenario });
});

// Stop simulation
app.post('/api/simulate/stop', async (req, res) => {
  simulator.stop();
  res.json({ running: false });
});

// Analytics endpoints
app.get('/api/analytics/chronic-offenders', async (req, res) => {
  const offenders = await prisma.violation.groupBy({
    by: ['lotId'],
    _count: { id: true },
    _sum: { durationMinutes: true, penaltyAmount: true }
  });
  res.json(offenders);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));