import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export class RuleEngine {
  private activeViolations = new Map<string, { startedAt: Date; maxExcess: number }>();
  
  constructor(private prisma: PrismaClient) {}
  
  async processCountEvent(lotId: string, vehicleCount: number) {
    const lot = await this.prisma.parkingLot.findUnique({ where: { id: lotId } });
    if (!lot) return;
    
    const excess = vehicleCount - lot.allowedCapacity;
    
    if (excess > 0) {
      const existing = this.activeViolations.get(lotId);
      
      if (!existing) {
        // Start new violation immediately (no grace period)
        this.activeViolations.set(lotId, { startedAt: new Date(), maxExcess: excess });
        
        // Create violation record immediately
        await this.prisma.violation.create({
          data: {
            lotId,
            startedAt: new Date(),
            maxExcess: excess,
            allowedCapacity: lot.allowedCapacity,
            peakCount: vehicleCount,
            ruleVersion: 'v2.3',
            status: 'active'
          }
        });
      } else if (excess > existing.maxExcess) {
        existing.maxExcess = excess;
        
        // Update peak count in active violation
        await this.prisma.violation.updateMany({
          where: { lotId, status: 'active' },
          data: { maxExcess: excess, peakCount: vehicleCount }
        });
      }
    } else {
      // Resolve violation if exists
      const existing = this.activeViolations.get(lotId);
      if (existing) {
        const duration = Math.floor((Date.now() - existing.startedAt.getTime()) / 60000);
        // Penalty calculation: excess vehicles × (duration in hours) × rate per hour (INR)
        const penalty = existing.maxExcess * (duration / 60) * lot.penaltyRatePerHour;
        
        await this.prisma.violation.updateMany({
          where: { lotId, status: 'active' },
          data: { 
            endedAt: new Date(), 
            durationMinutes: duration, 
            penaltyAmount: Math.round(penalty), // INR
            status: 'resolved' 
          }
        });
        
        this.activeViolations.delete(lotId);
      }
    }
  }
  
  generateEvidenceHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}