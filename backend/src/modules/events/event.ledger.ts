export interface EventRecord {
  lotId: string;
  timestamp: Date;
  count: number;
  raw: unknown;
}

class EventLedger {
  private events: EventRecord[] = [];

  append(event: EventRecord) {
    this.events.push(event);
  }

  getByLot(lotId: string) {
    return this.events.filter(e => e.lotId === lotId);
  }
}

export const eventLedger = new EventLedger();
