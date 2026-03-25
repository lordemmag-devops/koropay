import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types';
import { sendSafetoken } from '../payment/payment.controller';

const getAgentId = async (userId: string): Promise<string | null> => {
  const agent = await prisma.agent.findUnique({ where: { userId } });
  return agent?.id ?? null;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const agentId = await getAgentId(req.user!.userId);
  if (!agentId) { res.status(404).json({ message: 'Agent profile not found' }); return; }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [agent, todayPayments, allDrivers] = await Promise.all([
    prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: { select: { name: true, phone: true } } },
    }),
    prisma.unionPayment.findMany({
      where: { agentId, timestamp: { gte: today } },
      include: { driver: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.driver.findMany({
      where: { status: 'active' },
      include: { user: { select: { name: true, phone: true } } },
    }),
  ]);

  const paidDriverIds = todayPayments.filter(p => p.status === 'paid').map(p => p.driverId);
  const todayTotal = todayPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  res.json({
    agent,
    todayTotal,
    paidCount: paidDriverIds.length,
    totalDrivers: allDrivers.length,
    todayPayments,
    allDrivers,
  });
};

// ─── Update Levy Fee ─────────────────────────────────────────────────────────

export const updateFee = async (req: AuthRequest, res: Response): Promise<void> => {
  const agentId = await getAgentId(req.user!.userId);
  if (!agentId) { res.status(404).json({ message: 'Agent profile not found' }); return; }

  const { fee } = req.body;
  if (!fee || isNaN(Number(fee)) || Number(fee) <= 0) {
    res.status(400).json({ message: 'Invalid fee amount' });
    return;
  }

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { fee: Number(fee) },
  });

  res.json(agent);
};

// ─── Request Payment from Driver (send OTP) ───────────────────────────────────

export const requestPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const agentId = await getAgentId(req.user!.userId);
  if (!agentId) { res.status(404).json({ message: 'Agent profile not found' }); return; }

  const { driverId } = req.body;

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) { res.status(404).json({ message: 'Agent not found' }); return; }

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { user: { select: { name: true, phone: true } } },
  });
  if (!driver) { res.status(404).json({ message: 'Driver not found' }); return; }

  // Check if already paid today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const alreadyPaid = await prisma.unionPayment.findFirst({
    where: { agentId, driverId, status: 'paid', timestamp: { gte: today } },
  });
  if (alreadyPaid) { res.status(400).json({ message: 'Driver already paid today' }); return; }

  const payment = await prisma.unionPayment.create({
    data: {
      driverId,
      agentId,
      levyName: agent.checkpoint,
      amount: agent.fee,
      status: 'pending',
    },
  });

  try {
    await sendSafetoken(driver.user.phone);
    await prisma.unionPayment.update({ where: { id: payment.id }, data: { otp: 'sent' } });
    res.status(201).json({ message: 'OTP sent to driver via SMS', paymentId: payment.id });
  } catch {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    await prisma.unionPayment.update({ where: { id: payment.id }, data: { otp } });
    res.status(201).json({ message: 'OTP generated (SMS fallback)', otp, paymentId: payment.id });
  }
};

// ─── Verify OTP & Mark Paid ───────────────────────────────────────────────────

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const agentId = await getAgentId(req.user!.userId);
  if (!agentId) { res.status(404).json({ message: 'Agent profile not found' }); return; }

  const { otp } = req.body;

  const payment = await prisma.unionPayment.findFirst({
    where: { id: String(req.params.id), agentId, status: 'pending' },
  });

  if (!payment) { res.status(404).json({ message: 'Pending payment not found' }); return; }
  if (payment.otp !== otp) { res.status(400).json({ message: 'Invalid OTP' }); return; }

  const [updated] = await prisma.$transaction([
    prisma.unionPayment.update({
      where: { id: payment.id },
      data: { status: 'paid', otp: null },
    }),
    prisma.agent.update({
      where: { id: agentId },
      data: { totalCollected: { increment: payment.amount }, totalScans: { increment: 1 } },
    }),
    prisma.transaction.create({
      data: {
        passengerName: `Levy - ${payment.levyName}`,
        amount: payment.amount,
        type: 'union_payment',
        status: 'completed',
      },
    }),
  ]);

  res.json(updated);
};

// ─── Levy History ─────────────────────────────────────────────────────────────

export const getLevyHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const agentId = await getAgentId(req.user!.userId);
  if (!agentId) { res.status(404).json({ message: 'Agent profile not found' }); return; }

  const history = await prisma.unionPayment.findMany({
    where: { agentId, status: 'paid' },
    include: { driver: { include: { user: { select: { name: true } } } } },
    orderBy: { timestamp: 'desc' },
  });

  res.json(history);
};
