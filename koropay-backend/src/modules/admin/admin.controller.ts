import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalDrivers, totalAgents, activeDrivers, activeAgents, transactions, levies] =
    await Promise.all([
      prisma.driver.count(),
      prisma.agent.count(),
      prisma.driver.count({ where: { status: 'active' } }),
      prisma.agent.count({ where: { status: 'active' } }),
      prisma.transaction.findMany({ orderBy: { timestamp: 'desc' }, take: 10 }),
      prisma.unionPayment.aggregate({ _sum: { amount: true } }),
    ]);

  const revenue = await prisma.driver.aggregate({ _sum: { totalEarnings: true } });

  res.json({
    totalDrivers,
    totalAgents,
    activeDrivers,
    activeAgents,
    totalRevenue: revenue._sum.totalEarnings || 0,
    totalLeviesCollected: levies._sum.amount || 0,
    recentTransactions: transactions,
  });
};

// ─── Drivers ─────────────────────────────────────────────────────────────────

export const getDrivers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search } = req.query;

  const drivers = await prisma.driver.findMany({
    where: search
      ? {
          OR: [
            { user: { name: { contains: String(search), mode: 'insensitive' } } },
            { vehiclePlate: { contains: String(search), mode: 'insensitive' } },
            { route: { contains: String(search), mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { user: { select: { name: true, phone: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(drivers);
};

export const getDriver = async (req: AuthRequest, res: Response): Promise<void> => {
  const driver = await prisma.driver.findUnique({
    where: { id: String(req.params.id) },
    include: {
      user: { select: { name: true, phone: true, createdAt: true } },
      routes: { include: { dropPoints: true } },
      trips: { orderBy: { startTime: 'desc' }, take: 10, include: { payments: true } },
    },
  });

  if (!driver) {
    res.status(404).json({ message: 'Driver not found' });
    return;
  }

  res.json(driver);
};

export const createDriver = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, password, vehiclePlate, route } = req.body;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ message: 'Phone already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password || 'koropay123', 10);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      password: hashed,
      role: 'driver',
      driver: { create: { vehiclePlate, route: route || '' } },
    },
    include: { driver: true },
  });

  res.status(201).json(user);
};

export const updateDriverStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  const driver = await prisma.driver.update({
    where: { id: String(req.params.id) },
    data: { status },
  });

  res.json(driver);
};

// ─── Agents ──────────────────────────────────────────────────────────────────

export const getAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search } = req.query;

  const agents = await prisma.agent.findMany({
    where: search
      ? {
          OR: [
            { user: { name: { contains: String(search), mode: 'insensitive' } } },
            { checkpoint: { contains: String(search), mode: 'insensitive' } },
            { location: { contains: String(search), mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { user: { select: { name: true, phone: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(agents);
};

export const getAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  const agent = await prisma.agent.findUnique({
    where: { id: String(req.params.id) },
    include: {
      user: { select: { name: true, phone: true, createdAt: true } },
      unionPayments: {
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: { driver: { include: { user: { select: { name: true } } } } },
      },
    },
  });

  if (!agent) {
    res.status(404).json({ message: 'Agent not found' });
    return;
  }

  res.json(agent);
};

export const createAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, password, checkpoint, location, fee } = req.body;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ message: 'Phone already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password || 'koropay123', 10);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      password: hashed,
      role: 'agent',
      agent: { create: { checkpoint, location, fee: Number(fee) } },
    },
    include: { agent: true },
  });

  res.status(201).json(user);
};

export const updateAgentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  const agent = await prisma.agent.update({
    where: { id: String(req.params.id) },
    data: { status },
  });

  res.json(agent);
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, type, status } = req.query;

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(search && { passengerName: { contains: String(search), mode: 'insensitive' } }),
      ...(type && type !== 'all' && { type: String(type) as any }),
      ...(status && status !== 'all' && { status: String(status) as any }),
    },
    orderBy: { timestamp: 'desc' },
  });

  res.json(transactions);
};

// ─── Levy Settings ────────────────────────────────────────────────────────────

export const getLevySettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const levies = await prisma.levySetting.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(levies);
};

export const createLevySetting = async (req: AuthRequest, res: Response): Promise<void> => {
  const { levyName, amount, location } = req.body;

  const levy = await prisma.levySetting.create({
    data: { levyName, amount: Number(amount), location },
  });

  res.status(201).json(levy);
};

export const updateLevySetting = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, active } = req.body;

  const levy = await prisma.levySetting.update({
    where: { id: String(req.params.id) },
    data: {
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(active !== undefined && { active }),
    },
  });

  res.json(levy);
};

export const deleteLevySetting = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.levySetting.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
};
