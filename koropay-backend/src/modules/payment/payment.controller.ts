import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { interswitchClient } from '../../config/interswitch';
import { AuthRequest } from '../../types';

// ─── Initiate Payment ─────────────────────────────────────────────────────────

export const initiatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, customerId, customerEmail, description, redirectUrl } = req.body;

  try {
    const client = await interswitchClient();
    const { data } = await client.post('/api/v2/purchases', {
      merchantCode: process.env.INTERSWITCH_MERCHANT_CODE,
      payableCode: process.env.INTERSWITCH_PAYABLE_CODE,
      amount: Math.round(Number(amount) * 100), // convert to kobo
      redirectUrl,
      customerId,
      customerEmail,
      description,
      currency: 'NGN',
    });

    res.status(201).json({
      transactionRef: data.transactionReference,
      paymentUrl: data.redirectUrl || data.checkoutUrl,
      raw: data,
    });
  } catch (err: any) {
    res.status(502).json({ message: 'Payment initiation failed', error: err?.response?.data || err.message });
  }
};

// ─── Verify Transaction ───────────────────────────────────────────────────────

export const verifyTransaction = async (req: Request, res: Response): Promise<void> => {
  const { transactionRef } = req.params;

  try {
    const client = await interswitchClient();
    const { data } = await client.get(
      `/api/v1/purchases?transactionReference=${transactionRef}&amount=0`
    );

    const isSuccessful = data.responseCode === '00';

    res.json({
      success: isSuccessful,
      responseCode: data.responseCode,
      responseDescription: data.responseDescription,
      amount: data.amount / 100, // convert back from kobo
      transactionRef: data.transactionReference,
      paymentChannel: data.paymentInstrumentType || 'card',
      raw: data,
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
