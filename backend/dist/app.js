"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const ruleEngine_1 = require("./services/ruleEngine");
const simulator_1 = require("./services/simulator");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const ruleEngine = new ruleEngine_1.RuleEngine(prisma);
const simulator = new simulator_1.Simulator(prisma, ruleEngine);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        // No grace period - immediate violation if over capacity
        const status = (activeViolation || currentCount > lot.allowedCapacity) ? 'violating' : 'compliant';
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
            ...(status && { status: status }),
            ...(lotId && { lotId: lotId })
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
// Start simulation (Rush Hour only)
app.post('/api/simulate/start', async (req, res) => {
    const { scenario } = req.body;
    if (scenario !== 'rush_hour') {
        return res.status(400).json({ error: 'Only rush_hour scenario is supported' });
    }
    await simulator.start(scenario);
    res.json({ running: true, scenario });
});
// Stop simulation
app.post('/api/simulate/stop', async (req, res) => {
    simulator.stop();
    res.json({ running: false });
});
// Analytics endpoints
app.get('/api/analytics/lot-summary', async (req, res) => {
    const summary = await prisma.violation.groupBy({
        by: ['lotId'],
        _count: { id: true },
        _sum: { durationMinutes: true, penaltyAmount: true }
    });
    res.json(summary);
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
