"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simulator = void 0;
class Simulator {
    prisma;
    ruleEngine;
    constructor(prisma, ruleEngine) {
        this.prisma = prisma;
        this.ruleEngine = ruleEngine;
    }
    async start(scenario) {
        console.log("Simulation started:", scenario);
    }
    stop() {
        console.log("Simulation stopped");
    }
}
exports.Simulator = Simulator;
