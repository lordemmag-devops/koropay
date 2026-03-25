import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { initiatePayment, verifyTransaction, confirmTripPayment, confirmLevyPayment } from './payment.controller';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Payment
 *   description: Interswitch payment endpoints
 */

/**
 * @openapi
 * /payment/initiate:
 *   post:
 *     tags: [Payment]
 *     summary: Initiate an Interswitch payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, customerId, customerEmail, redirectUrl]
 *             properties:
 *               amount:
 *                 type: number
 *               customerId:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *               description:
 *                 type: string
 *               redirectUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initiated, returns paymentUrl
 *       502:
 *         description: Interswitch error
 */
router.post('/initiate', authenticate, initiatePayment);

/**
 * @openapi
 * /payment/verify/{transactionRef}:
 *   get:
 *     tags: [Payment]
 *     summary: Verify an Interswitch transaction
 *     parameters:
 *       - in: path
 *         name: transactionRef
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction status
 *       502:
 *         description: Interswitch error
 */
router.get('/verify/:transactionRef', verifyTransaction);

/**
 * @openapi
 * /payment/confirm/trip:
 *   post:
 *     tags: [Payment]
 *     summary: Verify Interswitch transaction and record trip payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tripId, passengerName, passengerPhone, transactionRef]
 *             properties:
 *               tripId:
 *                 type: string
 *               passengerName:
 *                 type: string
 *               passengerPhone:
 *                 type: string
 *               dropPoint:
 *                 type: string
 *               transactionRef:
 *                 type: string
 *               paymentChannel:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment confirmed and recorded
 *       400:
 *         description: Payment not successful
 *       404:
 *         description: Active trip not found
 */
router.post('/confirm/trip', authenticate, confirmTripPayment);

/**
 * @openapi
 * /payment/confirm/levy:
 *   post:
 *     tags: [Payment]
 *     summary: Verify Interswitch transaction and confirm levy payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId, transactionRef]
 *             properties:
 *               paymentId:
 *                 type: string
 *               transactionRef:
 *                 type: string
 *               paymentChannel:
 *                 type: string
 *     responses:
 *       200:
 *         description: Levy payment confirmed
 *       400:
 *         description: Payment not successful
 *       404:
 *         description: Pending levy not found
 */
router.post('/confirm/levy', authenticate, confirmLevyPayment);

export default router;
