import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getDashboard, requestPayment, verifyPayment, getLevyHistory } from './agent.controller';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Agent
 *   description: Agent endpoints
 */

router.use(authenticate, authorize('agent'));

/**
 * @openapi
 * /agent/dashboard:
 *   get:
 *     tags: [Agent]
 *     summary: Get agent dashboard
 *     responses:
 *       200:
 *         description: Agent dashboard data
 */
router.get('/dashboard', getDashboard);

/**
 * @openapi
 * /agent/payments/request:
 *   post:
 *     tags: [Agent]
 *     summary: Request levy payment from a driver (sends OTP)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driverId]
 *             properties:
 *               driverId:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP sent to driver
 *       400:
 *         description: Driver already paid today
 *       404:
 *         description: Driver not found
 */
router.post('/payments/request', requestPayment);

/**
 * @openapi
 * /agent/payments/{id}/verify:
 *   post:
 *     tags: [Agent]
 *     summary: Verify OTP and mark payment as paid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified and marked as paid
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: Pending payment not found
 */
router.post('/payments/:id/verify', verifyPayment);

/**
 * @openapi
 * /agent/history:
 *   get:
 *     tags: [Agent]
 *     summary: Get agent levy collection history
 *     responses:
 *       200:
 *         description: List of paid levy payments
 */
router.get('/history', getLevyHistory);

export default router;
