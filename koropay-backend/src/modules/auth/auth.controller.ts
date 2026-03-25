import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { signToken } from '../../utils/jwt';
import { AuthRequest } from '../../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, password, role, vehiclePlate, route, checkpoint, location, fee } = req.body;

  if (!name || !phone || !password || !role) {
    res.status(400).json({ message: 'name, phone, password and role are required' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ message: 'Phone number already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      password: hashed,
      role,
      ...(role === 'driver' && {
        driver: {
          create: {
            vehiclePlate,
            route: route || '',
          },
        },
      }),
      ...(role === 'agent' && {
        agent: {
          create: {
            checkpoint: checkpoint || '',
            location: location || '',
            fee: Number(fee) || 0,
          },
        },
      }),
    },
    include: { driver: true, agent: true },
  });

  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      driver: user.driver,
      agent: user.agent,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400).json({ message: 'phone and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    include: { driver: true, agent: true },
  });

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      driver: user.driver,
      agent: user.agent,
    },
  });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { driver: true, agent: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    driver: user.driver,
    agent: user.agent,
  });
};
