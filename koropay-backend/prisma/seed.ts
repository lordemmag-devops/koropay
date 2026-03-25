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
    { name: 'Ade Ogunbiyi', phone: '08012345678', plate: 'ABC-123-XY', route: 'Ojuelegba → Yaba', accountNumber: '0123456789', bankCode: '044', earnings: 87500, trips: 142 },
    { name: 'Musa Ibrahim', phone: '08098765432', plate: 'LND-456-KJ', route: 'CMS → Lekki Phase 1', accountNumber: '0987654321', bankCode: '058', earnings: 64200, trips: 98 },
    { name: 'Chidi Nwosu', phone: '07033445566', plate: 'KTU-789-AB', route: 'Ikeja → Maryland', accountNumber: '0112233445', bankCode: '033', earnings: 51800, trips: 76 },
    { name: 'Tunde Bakare', phone: '09011223344', plate: 'EPE-321-CD', route: 'Mile 2 → Oshodi', accountNumber: '0556677889', bankCode: '011', earnings: 93100, trips: 167 },
    { name: 'Yemi Alade', phone: '08155667788', plate: 'IKJ-654-EF', route: 'Berger → Ojota', accountNumber: '0334455667', bankCode: '057', earnings: 12400, trips: 23 },
    { name: 'Kola Adenuga', phone: '07066778899', plate: 'MUS-987-GH', route: 'Iyana Oworo → Ketu', accountNumber: '0778899001', bankCode: '044', earnings: 45600, trips: 61 },
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
            accountNumber: d.accountNumber,
            bankCode: d.bankCode,
            totalEarnings: d.earnings,
            totalTrips: d.trips,
          },
        },
      },
    });
  }

  // ─── Agents ───────────────────────────────────────────────────────────────
  const agentsData = [
    { name: 'Ibrahim Sule', phone: '08099887766', checkpoint: 'Ojuelegba Checkpoint', location: 'Ojuelegba Under Bridge', fee: 500, accountNumber: '0223344556', bankCode: '057', collected: 245000, scans: 490 },
    { name: 'Blessing Okoro', phone: '07044556677', checkpoint: 'Yaba Tollgate', location: 'Yaba Bus Terminal', fee: 350, accountNumber: '0445566778', bankCode: '033', collected: 178500, scans: 510 },
    { name: 'Aliyu Danjuma', phone: '09033221100', checkpoint: 'Maryland Checkpoint', location: 'Maryland Mall Junction', fee: 450, accountNumber: '0667788990', bankCode: '044', collected: 162000, scans: 360 },
    { name: 'Funke Adeyemi', phone: '08166554433', checkpoint: 'Oshodi Checkpoint', location: 'Oshodi Underbridge', fee: 400, accountNumber: '0889900112', bankCode: '058', collected: 56000, scans: 140 },
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
            accountNumber: a.accountNumber,
            bankCode: a.bankCode,
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

  // ─── Routes + Trips + Payments for demo driver (Ade Ogunbiyi) ─────────────
  const demoDriver = await prisma.driver.findFirst({ where: { user: { phone: '08012345678' } } });
  const demoAgent = await prisma.agent.findFirst({ where: { user: { phone: '08099887766' } } });

  if (demoDriver) {
    const route1 = await prisma.route.create({
      data: {
        driverId: demoDriver.id,
        routeName: 'Ojuelegba → Yaba',
        fare: 300,
        dropPoints: {
          create: [
            { name: 'Lawanson Junction' },
            { name: 'Tejuosho Market' },
            { name: 'Yaba Bus Stop' },
          ],
        },
      },
    });

    const route2 = await prisma.route.create({
      data: {
        driverId: demoDriver.id,
        routeName: 'CMS → Lekki Phase 1',
        fare: 500,
        dropPoints: {
          create: [
            { name: 'Ozumba Mbadiwe' },
            { name: 'Victoria Island' },
            { name: 'Lekki Phase 1' },
          ],
        },
      },
    });

    // Trip 1
    const trip1 = await prisma.trip.create({
      data: {
        driverId: demoDriver.id,
        routeId: route1.id,
        fare: 300,
        totalPassengers: 5,
        totalAmount: 1500,
        status: 'completed',
        startTime: new Date('2026-03-23T07:00:00Z'),
        endTime: new Date('2026-03-23T08:30:00Z'),
      },
    });

    const trip1Passengers = [
      { name: 'Adebayo Ogunlesi', phone: '08011112222', drop: 'Yaba Bus Stop', time: '2026-03-23T07:10:00Z' },
      { name: 'Chioma Eze', phone: '08033334444', drop: 'Tejuosho Market', time: '2026-03-23T07:15:00Z' },
      { name: 'Fatima Abubakar', phone: '08055556666', drop: 'Lawanson Junction', time: '2026-03-23T07:22:00Z' },
      { name: 'Emeka Obi', phone: '08077778888', drop: 'Yaba Bus Stop', time: '2026-03-23T07:30:00Z' },
      { name: 'Amina Yusuf', phone: '08099990000', drop: 'Tejuosho Market', time: '2026-03-23T07:45:00Z' },
    ];

    for (const p of trip1Passengers) {
      await prisma.tripPayment.create({
        data: { tripId: trip1.id, passengerName: p.name, passengerPhone: p.phone, amount: 300, dropPoint: p.drop, status: 'completed', paymentChannel: 'ussd', timestamp: new Date(p.time) },
      });
      await prisma.transaction.create({
        data: { tripId: trip1.id, passengerName: p.name, amount: 300, type: 'passenger_payment', status: 'completed', dropPoint: p.drop, paymentChannel: 'ussd', timestamp: new Date(p.time) },
      });
    }

    // Trip 2
    const trip2 = await prisma.trip.create({
      data: {
        driverId: demoDriver.id,
        routeId: route2.id,
        fare: 500,
        totalPassengers: 3,
        totalAmount: 1500,
        status: 'completed',
        startTime: new Date('2026-03-23T09:00:00Z'),
        endTime: new Date('2026-03-23T10:15:00Z'),
      },
    });

    const trip2Passengers = [
      { name: 'Ngozi Okafor', phone: '08012340002', drop: 'Victoria Island', time: '2026-03-23T09:10:00Z' },
      { name: 'Kemi Adeola', phone: '08012340003', drop: 'Lekki Phase 1', time: '2026-03-23T09:20:00Z' },
      { name: 'Segun Adeyemi', phone: '08012340004', drop: 'Lekki Phase 1', time: '2026-03-23T09:35:00Z' },
    ];

    for (const p of trip2Passengers) {
      await prisma.tripPayment.create({
        data: { tripId: trip2.id, passengerName: p.name, passengerPhone: p.phone, amount: 500, dropPoint: p.drop, status: 'completed', paymentChannel: 'ussd', timestamp: new Date(p.time) },
      });
      await prisma.transaction.create({
        data: { tripId: trip2.id, passengerName: p.name, amount: 500, type: 'passenger_payment', status: 'completed', dropPoint: p.drop, paymentChannel: 'ussd', timestamp: new Date(p.time) },
      });
    }

    // ─── Levy payments for demo driver ──────────────────────────────────────
    if (demoAgent) {
      await prisma.unionPayment.createMany({
        data: [
          { driverId: demoDriver.id, agentId: demoAgent.id, levyName: 'NURTW Daily Levy', amount: 500, status: 'paid', timestamp: new Date('2026-03-23T07:00:00Z') },
          { driverId: demoDriver.id, agentId: demoAgent.id, levyName: 'Police Checkpoint Fee', amount: 350, status: 'paid', timestamp: new Date('2026-03-23T09:30:00Z') },
          { driverId: demoDriver.id, agentId: demoAgent.id, levyName: 'LASTMA Levy', amount: 450, status: 'pending', timestamp: new Date('2026-03-23T11:30:00Z') },
        ],
      });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
