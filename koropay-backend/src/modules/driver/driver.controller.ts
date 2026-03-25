import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types';

const getDriverId = async (userId: string): Promise<string | null> => {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  return driver?.id ?? null;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [trips, pendingLevies, driver] = await Promise.all([
    prisma.trip.findMany({
      where: { driverId, startTime: { gte: today } },
      include: { payments: true, route: true },
      orderBy: { startTime: 'desc' },
    }),
    prisma.unionPayment.count({ where: { driverId, status: 'pending' } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);

  const totalEarnings = trips.reduce((s, t) => s + t.totalAmount, 0);
  const totalPassengers = trips.reduce((s, t) => s + t.totalPassengers, 0);

  res.json({ trips, totalEarnings, totalTrips: trips.length, totalPassengers, pendingLevies, driver });
};

// ─── Routes ───────────────────────────────────────────────────────────────────

export const getRoutes = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const routes = await prisma.route.findMany({
    where: { driverId },
    include: { dropPoints: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(routes);
};

export const createRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const { routeName, fare, dropPoints } = req.body;

  const route = await prisma.route.create({
    data: {
      driverId,
      routeName,
      fare: Number(fare),
      dropPoints: {
        create: (dropPoints || []).map((dp: { name: string }) => ({ name: dp.name })),
      },
    },
    include: { dropPoints: true },
  });

  res.status(201).json(route);
};

export const deleteRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const route = await prisma.route.findFirst({ where: { id: String(req.params.id), driverId } });
  if (!route) { res.status(404).json({ message: 'Route not found' }); return; }

  await prisma.route.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
};

// ─── Trips ────────────────────────────────────────────────────────────────────

export const startTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const { routeId } = req.body;

  const route = await prisma.route.findFirst({ where: { id: String(routeId), driverId } });
  if (!route) { res.status(404).json({ message: 'Route not found' }); return; }

  const ongoing = await prisma.trip.findFirst({ where: { driverId, status: 'ongoing' } });
  if (ongoing) { res.status(400).json({ message: 'You already have an ongoing trip' }); return; }

  const trip = await prisma.trip.create({
    data: { driverId, routeId, fare: route.fare },
    include: { route: { include: { dropPoints: true } }, payments: true },
  });

  res.status(201).json(trip);
};

export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.id), driverId, status: 'ongoing' } });
  if (!trip) { res.status(404).json({ message: 'Active trip not found' }); return; }

  const { passengerName, passengerPhone, dropPoint } = req.body;

  const [payment] = await prisma.$transaction([
    prisma.tripPayment.create({
      data: { tripId: trip.id, passengerName, passengerPhone, amount: trip.fare, dropPoint, status: 'completed' },
    }),
    prisma.trip.update({
      where: { id: trip.id },
      data: { totalPassengers: { increment: 1 }, totalAmount: { increment: trip.fare } },
    }),
    prisma.transaction.create({
      data: { tripId: trip.id, passengerName, amount: trip.fare, type: 'passenger_payment', status: 'completed', dropPoint },
    }),
  ]);

  res.status(201).json(payment);
};

export const endTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.id), driverId, status: 'ongoing' } });
  if (!trip) { res.status(404).json({ message: 'Active trip not found' }); return; }

  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id: trip.id },
      data: { status: 'completed', endTime: new Date() },
      include: { payments: true, route: true },
    }),
    prisma.driver.update({
      where: { id: driverId },
      data: { totalEarnings: { increment: trip.totalAmount }, totalTrips: { increment: 1 } },
    }),
  ]);

  res.json(updatedTrip);
};

export const getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const trips = await prisma.trip.findMany({
    where: { driverId },
    include: { payments: true, route: true },
    orderBy: { startTime: 'desc' },
  });

  res.json(trips);
};

// ─── Levies ───────────────────────────────────────────────────────────────────

export const getLevies = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const levies = await prisma.unionPayment.findMany({
    where: { driverId },
    include: { agent: { include: { user: { select: { name: true } } } } },
    orderBy: { timestamp: 'desc' },
  });

  res.json(levies);
};

export const requestLevyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const levy = await prisma.unionPayment.findFirst({
    where: { id: String(req.params.id), driverId, status: 'pending' },
  });
  if (!levy) { res.status(404).json({ message: 'Pending levy not found' }); return; }

  const otp = String(Math.floor(1000 + Math.random() * 9000));

  const updated = await prisma.unionPayment.update({
    where: { id: levy.id },
    data: { otp },
  });

  // In production: send OTP via SMS. For now return it in response.
  res.json({ message: 'OTP generated', otp: updated.otp, levyId: updated.id });
};

export const verifyLevyOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = await getDriverId(req.user!.userId);
  if (!driverId) { res.status(404).json({ message: 'Driver profile not found' }); return; }

  const { otp } = req.body;

  const levy = await prisma.unionPayment.findFirst({
    where: { id: String(req.params.id), driverId, status: 'pending' },
  });

  if (!levy) { res.status(404).json({ message: 'Pending levy not found' }); return; }
  if (levy.otp !== otp) { res.status(400).json({ message: 'Invalid OTP' }); return; }

  const updated = await prisma.unionPayment.update({
    where: { id: levy.id },
    data: { status: 'paid', otp: null },
  });

  res.json(updated);
};
