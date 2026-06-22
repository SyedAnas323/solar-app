import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const bootstrapEmail = process.env.ADMIN_EMAIL || "admin@solarpro.com";
const bootstrapPassword = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  await prisma.package.createMany({
    data: [
      { name: "Starter 3kW", capacity: 3, systemType: "on-grid", panelBrand: "Longi", panelWatts: 550, panelCount: 6, inverterMake: "Growatt", batteryKwh: null, basePrice: 255000 },
      { name: "Family 5kW", capacity: 5, systemType: "on-grid", panelBrand: "JA Solar", panelWatts: 560, panelCount: 9, inverterMake: "Huawei", batteryKwh: null, basePrice: 425000 },
      { name: "Hybrid 8kW", capacity: 8, systemType: "hybrid", panelBrand: "Canadian Solar", panelWatts: 570, panelCount: 14, inverterMake: "Solis", batteryKwh: 10, basePrice: 840000 },
      { name: "Business 10kW", capacity: 10, systemType: "off-grid", panelBrand: "Trina", panelWatts: 580, panelCount: 18, inverterMake: "Inverex", batteryKwh: 15, basePrice: 1300000 },
      { name: "Premium 15kW", capacity: 15, systemType: "hybrid", panelBrand: "Canadian Solar", panelWatts: 600, panelCount: 25, inverterMake: "Fronius", batteryKwh: 20, basePrice: 1650000 },
    ],
    skipDuplicates: true,
  });

  const existingAdmin = await prisma.adminCredential.findFirst({ orderBy: { createdAt: "asc" } });
  if (!existingAdmin) {
    await prisma.adminCredential.create({
      data: {
        email: bootstrapEmail,
        passwordHash: await bcrypt.hash(bootstrapPassword, 10),
      },
    });
  }
}

main().finally(async () => prisma.$disconnect());
