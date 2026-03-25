import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hash = (p: string) => bcrypt.hash(p, 10);

  // ─── Admin ────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { phone: '08000000000' },
    update: {},
    create: {
      name: 'Admin User',
      phone: '08000000000',
      password: await hash('admin123'),
      role: 'admin',
    },
  });

  // ─── Drivers ──────────────────────────────────────────────────────────────
  const driversData = [
    { name: 'Ade Ogunbiyi', phone: '08012345678', plate: 'ABC-123-XY', route: 'Ojuelegba → Yaba', earnings: 87500, trips: 142 },
    { name: 'Musa Ibrahim', phone: '08098765432', plate: 'LND-456-KJ', route: 'CMS → Lekki Phase 1', earnings: 64200, trips: 98 },
    { name: 'Chidi Nwosu', phone: '07033445566', plate: 'KTU-789-AB', route: 'Ikeja → Maryland', earnings: 51800, trips: 76 },
    { name: 'Tunde Bakare', phone: '09011223344', plate: 'EPE-321-CD', route: 'Mile 2 → Oshodi', earnings: 93100, trips: 167 },
    { name: 'Yemi Alade', phone: '08155667788', plate: 'IKJ-654-EF', route: 'Berger → Ojota', earnings: 12400, trips: 23 },
    { name: 'Kola Adenuga', phone: '07066778899', plate: 'MUS-987-GH', route: 'Iyana Oworo → Ketu', earnings: 45600, trips: 61 },
  ];

  for (const d of driversData) {
    await prisma.user.upsert({
      where: { phone: d.phone },
      update: {},
      create: {
        name: d.name,
        phone: d.phone,
        password: await hash('driver123'),
        role: 'driver',
        driver: {
          create: {
            vehiclePlate: d.plate,
            route: d.route,
            totalEarnings: d.earnings,
            totalTrips: d.trips,
          },
        },
      },
    });
  }

  // ─── Agents ───────────────────────────────────────────────────────────────
  const agentsData = [
    { name: 'Ibrahim Sule', phone: '08099887766', checkpoint: 'Ojuelegba Checkpoint', location: 'Ojuelegba Under Bridge', fee: 500, collected: 245000, scans: 490 },
    { name: 'Blessing Okoro', phone: '07044556677', checkpoint: 'Yaba Tollgate', location: 'Yaba Bus Terminal', fee: 350, collected: 178500, scans: 510 },
    { name: 'Aliyu Danjuma', phone: '09033221100', checkpoint: 'Maryland Checkpoint', location: 'Maryland Mall Junction', fee: 450, collected: 162000, scans: 360 },
    { name: 'Funke Adeyemi', phone: '08166554433', checkpoint: 'Oshodi Checkpoint', location: 'Oshodi Underbridge', fee: 400, collected: 56000, scans: 140 },
  ];

  for (const a of agentsData) {
    await prisma.user.upsert({
      where: { phone: a.phone },
      update: {},
      create: {
        name: a.name,
        phone: a.phone,
        password: await hash('agent123'),
        role: 'agent',
        agent: {
          create: {
            checkpoint: a.checkpoint,
            location: a.location,
            fee: a.fee,
            totalCollected: a.collected,
            totalScans: a.scans,
          },
        },
      },
    });
  }

  // ─── Levy Settings ────────────────────────────────────────────────────────
  const levies = [
    { levyName: 'NURTW Daily Levy', amount: 500, location: 'Ojuelegba Checkpoint', active: true },
    { levyName: 'Police Checkpoint Fee', amount: 350, location: 'Yaba Tollgate', active: true },
    { levyName: 'LASTMA Levy', amount: 450, location: 'Maryland Checkpoint', active: true },
    { levyName: 'VIO Inspection Fee', amount: 400, location: 'Oshodi Checkpoint', active: false },
  ];

  for (const l of levies) {
    await prisma.levySetting.create({ data: l });
  }

  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
