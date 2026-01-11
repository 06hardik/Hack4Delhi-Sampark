export function ensureLotExists(lotId: string) {
  const existing = lots.find(l => l.id === lotId);
  if (!existing) {
    lots.push({
      id: lotId,
      name: lotId,
      contractor: "CV",
      allowedCapacity: 100,
      currentCount: 0,
      latitude: 0,
      longitude: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
