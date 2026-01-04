-- CreateTable
CREATE TABLE "ParkingLot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allowedCapacity" INTEGER NOT NULL,
    "penaltyRatePerHour" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRule" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "allowedCapacity" INTEGER NOT NULL,
    "penaltyRatePerHour" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountEvent" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleCount" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'sensor',

    CONSTRAINT "CountEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "maxExcess" INTEGER NOT NULL,
    "allowedCapacity" INTEGER NOT NULL,
    "peakCount" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ruleVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "vehicleCount" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sha256Hash" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "lotSection" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractRule_lotId_effectiveFrom_idx" ON "ContractRule"("lotId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "CountEvent_lotId_timestamp_idx" ON "CountEvent"("lotId", "timestamp");

-- CreateIndex
CREATE INDEX "Violation_lotId_status_idx" ON "Violation"("lotId", "status");

-- CreateIndex
CREATE INDEX "Violation_startedAt_idx" ON "Violation"("startedAt");

-- CreateIndex
CREATE INDEX "Evidence_violationId_idx" ON "Evidence"("violationId");

-- AddForeignKey
ALTER TABLE "ContractRule" ADD CONSTRAINT "ContractRule_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountEvent" ADD CONSTRAINT "CountEvent_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
