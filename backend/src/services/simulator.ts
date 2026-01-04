export class Simulator {
  constructor(private prisma: any, private ruleEngine: any) {}

  async start(scenario: string) {
    console.log("Simulation started:", scenario);
  }

  stop() {
    console.log("Simulation stopped");
  }
}
