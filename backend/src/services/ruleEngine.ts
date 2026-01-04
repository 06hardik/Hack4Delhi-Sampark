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
        // Start new violation tracking
        this.activeViolations.set(lotId, { startedAt: new Date(), maxExcess: excess });
        
        // Create violation record after grace period
        setTimeout(async () => {
          const current = this.activeViolations.get(lotId);
          if (current) {
            await this.prisma.violation.create({
              data: {
                lotId,
                startedAt: current.startedAt,
                maxExcess: current.maxExcess,
                allowedCapacity: lot.allowedCapacity,
                peakCount: lot.allowedCapacity + current.maxExcess,
                ruleVersion: 'v1.0',
                status: 'active'
              }
            });
          }
        }, lot.gracePeriodMinutes * 60000);
      } else if (excess > existing.maxExcess) {
        existing.maxExcess = excess;
      }
    } else {
      // Resolve violation if exists
      const existing = this.activeViolations.get(lotId);
      if (existing) {
        const duration = Math.floor((Date.now() - existing.startedAt.getTime()) / 60000);
        const penalty = existing.maxExcess * (duration / 60) * lot.penaltyRatePerHour;
        
        await this.prisma.violation.updateMany({
          where: { lotId, status: 'active' },
          data: { endedAt: new Date(), durationMinutes: duration, penaltyAmount: penalty, status: 'resolved' }
        });
        
        this.activeViolations.delete(lotId);
      }
    }
  }
  
  generateEvidenceHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}