import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});


async function main() {
  const lots = [
    {
      name: "MCD Parking — Asaf Ali Road, Near Delhi Police Help Center, Turkman Gate, Delhi",
      allowedCapacity: 120,
      penaltyRatePerHour: 500,
      latitude: 28.6406,
      longitude: 77.2401,
    },
    {
      name: "MCD Car Parking — Qulab Colony, GB Road, Nabi Karim, Paharganj, Delhi",
      allowedCapacity: 80,
      penaltyRatePerHour: 400,
      latitude: 28.6512,
      longitude: 77.2180,
    },
    {
      name: "MCD Scooter Parking — Qutub Road Market, Dangarmal Surana Marg, Narain, Delhi",
      allowedCapacity: 200,
      penaltyRatePerHour: 300,
      latitude: 28.6429,
      longitude: 77.2150,
    },
    {
      name: "MCD Parking — Padam Singh Road, Near Siam International Hotel, West Extension Area, Karol Bagh, Delhi",
      allowedCapacity: 150,
      penaltyRatePerHour: 450,
      latitude: 28.6519,
      longitude: 77.1905,
    },
    {
      name: "MCD Authorized Lot Parking — State Bank of India, Edayazham, New Delhi",
      allowedCapacity: 100,
      penaltyRatePerHour: 350,
      latitude: 28.6127,
      longitude: 77.2273,
    },
  ];

  for (const lot of lots) {
    await prisma.parkingLot.create({ data: lot });
  }

  console.log("MCD Delhi parking lots seed data created!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
