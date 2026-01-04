import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lots = [
    { name: 'Downtown Plaza', contractor: 'CityPark Inc.', allowedCapacity: 100 },
    { name: 'Airport Terminal P1', contractor: 'AeroParking LLC', allowedCapacity: 500 },
    { name: 'Shopping Mall West', contractor: 'RetailPark Co.', allowedCapacity: 300 },
    { name: 'Hospital Visitor', contractor: 'HealthSpace', allowedCapacity: 150 },
    { name: 'University Main', contractor: 'EduPark Services', allowedCapacity: 400 },
    { name: 'Sports Arena', contractor: 'EventParking Pro', allowedCapacity: 800 },
    { name: 'Office Tower A', contractor: 'CorpPark Solutions', allowedCapacity: 200 },
    { name: 'Train Station', contractor: 'TransitPark', allowedCapacity: 250 },
  ];
  
  for (const lot of lots) {
    await prisma.parkingLot.create({ data: lot });
  }
  
  console.log('Seed data created!');
}

main().catch(console.error).finally(() => prisma.$disconnect());