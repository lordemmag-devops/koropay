import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { interswitchClient, getBanks } from '../../config/interswitch';
import { AuthRequest } from '../../types';

// ─── Send OTP via Interswitch Safetoken ──────────────────────────────────────

export const sendSafetoken = async (phone: string): Promise<string> => {
  const client = await interswitchClient();
  const { data } = await client.post('/api/v1/safetoken/generate-and-send', {
    customerId: phone,
    mobileNumber: phone,
    notificationMethod: 'SMS',
  });
  return data.otp || data.token || '';
};

// ─── Verify Transaction ───────────────────────────────────────────────────────

export const verifyTransaction = async (req: Request, res: Response): Promise<void> => {
  const { transactionRef } = req.params;

  try {
    const client = await interswitchClient();
    const { data } = await client.get(
      `/api/v1/purchases?transactionReference=${transactionRef}&amount=0`
    );

    res.json({
      success: data.responseCode === '00',
      responseCode: data.responseCode,
      responseDescription: data.responseDescription,
      amount: data.amount / 100,
      transactionRef: data.transactionReference,
      paymentChannel: data.paymentInstrumentType || 'card',
    });
  } catch (err: any) {
    res.status(502).json({ message: 'Transaction verification failed', error: err?.response?.data || err.message });
  }
};

// ─── Confirm & Record Trip Payment ───────────────────────────────────────────

export const confirmTripPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { tripId, passengerName, passengerPhone, dropPoint, transactionRef, paymentChannel } = req.body;

  try {
    const client = await interswitchClient();
    const { data } = await client.get(
      `/api/v1/purchases?transactionReference=${transactionRef}&amount=0`
    );

    if (data.responseCode !== '00') {
      res.status(400).json({ message: 'Payment not successful', responseCode: data.responseCode });
      return;
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, status: 'ongoing' } });
    if (!trip) { res.status(404).json({ message: 'Active trip not found' }); return; }

    const amount = data.amount / 100;

    const [payment] = await prisma.$transaction([
      prisma.tripPayment.create({
        data: {
          tripId,
          passengerName,
          passengerPhone,
          amount,
          dropPoint,
          status: 'completed',
          interswitchRef: transactionRef,
          paymentChannel: paymentChannel || data.paymentInstrumentType || 'card',
        },
      }),
      prisma.trip.update({
        where: { id: tripId },
        data: { totalPassengers: { increment: 1 }, totalAmount: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          tripId,
          passengerName,
          amount,
          type: 'passenger_payment',
          status: 'completed',
          dropPoint,
          interswitchRef: transactionRef,
          paymentChannel: paymentChannel || data.paymentInstrumentType || 'card',
        },
      }),
    ]);

    res.status(201).json(payment);
  } catch (err: any) {
    res.status(502).json({ message: 'Failed to confirm payment', error: err?.response?.data || err.message });
  }
};

// ─── Get Supported Banks ─────────────────────────────────────────────────────

export const getSupportedBanks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const banks = await getBanks();
    res.json(banks);
  } catch (err: any) {
    res.status(502).json({ message: 'Failed to fetch banks', error: err?.response?.data || err.message });
  }
};

// ─── Resolve Driver by USSD Code ─────────────────────────────────────────────

export const resolveDriverByCode = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;
  const driverCode = String(code).padStart(4, '0');
  try {
    const driver = await prisma.driver.findUnique({
      where: { ussdCode: driverCode },
      include: { user: true, routes: { include: { dropPoints: true } } },
    });
    if (!driver) { res.status(404).json({ message: 'Driver not found for this code' }); return; }
    res.json({ driverId: driver.id, driverName: driver.user.name, vehiclePlate: driver.vehiclePlate, ussdCode: driver.ussdCode, routes: driver.routes });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to resolve driver', error: err.message });
  }
};

// ─── Initiate USSD Payment ────────────────────────────────────────────────────

export const initiateUssdPayment = async (req: Request, res: Response): Promise<void> => {
  const { driverCode, routeId, passengerPhone, passengerBankCode, dropPoint } = req.body;

  try {
    // Resolve driver from ussdCode
    const driver = await prisma.driver.findUnique({
      where: { ussdCode: String(driverCode).padStart(4, '0') },
      include: { user: true },
    });
    if (!driver) { res.status(404).json({ message: 'Driver not found for this code' }); return; }

    // Find or auto-create an ongoing trip for this driver on this route
    let trip = await prisma.trip.findFirst({
      where: { driverId: driver.id, routeId, status: 'ongoing' },
      include: { driver: true },
    });

    if (!trip) {
      const route = await prisma.route.findFirst({ where: { id: routeId, driverId: driver.id } });
      if (!route) { res.status(404).json({ message: 'Route not found for this driver' }); return; }
      trip = await prisma.trip.create({
        data: { driverId: driver.id, routeId: route.id, fare: route.fare },
        include: { driver: true },
      });
    }

    if (!trip) { res.status(404).json({ message: 'Could not start trip' }); return; }

    const { accountNumber: driverAccount, bankCode: driverBankCode } = trip.driver;
    if (!driverAccount || !driverBankCode) {
      res.status(400).json({ message: 'Driver has no bank account on file' });
      return;
    }

    // Mock: passenger name and transfer ref (funds transfer + name enquiry APIs not subscribed)
    const passengerName = `Passenger ${passengerPhone.slice(-4)}`;
    const transferRef = `KP-${Date.now()}-${trip.id.slice(-6)}`;

    const [payment] = await prisma.$transaction([
      prisma.tripPayment.create({
        data: {
          tripId: trip.id,
          passengerName,
          passengerPhone,
          amount: trip.fare,
          dropPoint,
          status: 'completed',
          interswitchRef: transferRef,
          paymentChannel: 'ussd',
        },
      }),
      prisma.trip.update({
        where: { id: trip.id },
        data: { totalPassengers: { increment: 1 }, totalAmount: { increment: trip.fare } },
      }),
      prisma.transaction.create({
        data: {
          tripId: trip.id,
          passengerName,
          amount: trip.fare,
          type: 'passenger_payment',
          status: 'completed',
          dropPoint,
          interswitchRef: transferRef,
          paymentChannel: 'ussd',
        },
      }),
    ]);

    res.status(201).json({ ...payment, passengerName, interswitchRef: transferRef });
  } catch (err: any) {
    res.status(502).json({ message: 'Payment failed', error: err?.response?.data || err.message });
  }
};

// ─── Confirm & Record Union/Levy Payment ─────────────────────────────────────

export const confirmLevyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { paymentId, transactionRef, paymentChannel } = req.body;

  try {
    const client = await interswitchClient();
    const { data } = await client.get(
      `/api/v1/purchases?transactionReference=${transactionRef}&amount=0`
    );

    if (data.responseCode !== '00') {
      res.status(400).json({ message: 'Payment not successful', responseCode: data.responseCode });
      return;
    }

    const payment = await prisma.unionPayment.findFirst({ where: { id: paymentId, status: 'pending' } });
    if (!payment) { res.status(404).json({ message: 'Pending levy payment not found' }); return; }

    const [updated] = await prisma.$transaction([
      prisma.unionPayment.update({
        where: { id: paymentId },
        data: {
          status: 'paid',
          otp: null,
          interswitchRef: transactionRef,
          paymentChannel: paymentChannel || data.paymentInstrumentType || 'card',
        },
      }),
      prisma.agent.update({
        where: { id: payment.agentId },
        data: { totalCollected: { increment: payment.amount }, totalScans: { increment: 1 } },
      }),
      prisma.transaction.create({
        data: {
          passengerName: `Levy - ${payment.levyName}`,
          amount: payment.amount,
          type: 'union_payment',
          status: 'completed',
          interswitchRef: transactionRef,
          paymentChannel: paymentChannel || data.paymentInstrumentType || 'card',
        },
      }),
    ]);

    res.json(updated);
  } catch (err: any) {
    res.status(502).json({ message: 'Failed to confirm levy payment', error: err?.response?.data || err.message });
  }
};
