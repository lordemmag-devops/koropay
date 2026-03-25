import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  getDashboard,
  getRoutes, createRoute, deleteRoute,
  startTrip, addPayment, endTrip, getTrips,
  getLevies, requestLevyPayment, verifyLevyOTP,
} from './driver.controller';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Driver
 *   description: Driver endpoints
 */

router.use(authenticate, authorize('driver'));

/**
 * @openapi
 * /driver/dashboard:
 *   get:
 *     tags: [Driver]
 *     summary: Get driver dashboard
 *     responses:
 *       200:
 *         description: Driver dashboard data
 */
router.get('/dashboard', getDashboard);

/**
 * @openapi
 * /driver/routes:
 *   get:
 *     tags: [Driver]
 *     summary: List driver routes
 *     responses:
 *       200:
 *         description: List of routes
 *   post:
 *     tags: [Driver]
 *     summary: Create a route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routeName, fare]
 *             properties:
 *               routeName:
 *                 type: string
 *               fare:
 *                 type: number
 *               dropPoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *     responses:
 *       201:
 *         description: Route created
 */
router.get('/routes', getRoutes);
router.post('/routes', createRoute);

/**
 * @openapi
 * /driver/routes/{id}:
 *   delete:
 *     tags: [Driver]
 *     summary: Delete a route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Route not found
 */
router.delete('/routes/:id', deleteRoute);

/**
 * @openapi
 * /driver/trips:
 *   get:
 *     tags: [Driver]
 *     summary: List driver trips
 *     responses:
 *       200:
 *         description: List of trips
 *   post:
 *     tags: [Driver]
 *     summary: Start a trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routeId]
 *             properties:
 *               routeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip started
 *       400:
 *         description: Already have an ongoing trip
 */
router.get('/trips', getTrips);
router.post('/trips', startTrip);

/**
 * @openapi
 * /driver/trips/{id}/payments:
 *   post:
 *     tags: [Driver]
 *     summary: Add a passenger payment to a trip
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
 *             required: [passengerName, passengerPhone, dropPoint]
 *             properties:
 *               passengerName:
 *                 type: string
 *               passengerPhone:
 *                 type: string
 *               dropPoint:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded
 *       404:
 *         description: Active trip not found
 */
router.post('/trips/:id/payments', addPayment);

/**
 * @openapi
 * /driver/trips/{id}/end:
 *   patch:
 *     tags: [Driver]
 *     summary: End a trip
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip ended
 *       404:
 *         description: Active trip not found
 */
router.patch('/trips/:id/end', endTrip);

/**
 * @openapi
 * /driver/levies:
 *   get:
 *     tags: [Driver]
 *     summary: List driver levy payments
 *     responses:
 *       200:
 *         description: List of levy payments
 */
router.get('/levies', getLevies);

/**
 * @openapi
 * /driver/levies/{id}/request-otp:
 *   post:
 *     tags: [Driver]
 *     summary: Request OTP for levy payment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP generated
 *       404:
 *         description: Pending levy not found
 */
router.post('/levies/:id/request-otp', requestLevyPayment);

/**
 * @openapi
 * /driver/levies/{id}/verify-otp:
 *   post:
 *     tags: [Driver]
 *     summary: Verify OTP and mark levy as paid
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
 *         description: Levy marked as paid
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: Pending levy not found
 */
router.post('/levies/:id/verify-otp', verifyLevyOTP);

export default router;
