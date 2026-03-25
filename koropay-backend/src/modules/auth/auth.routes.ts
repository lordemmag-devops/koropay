import { Router } from 'express';
import { register, login, me } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, driver, agent]
 *               vehiclePlate:
 *                 type: string
 *               route:
 *                 type: string
 *               checkpoint:
 *                 type: string
 *               location:
 *                 type: string
 *               fee:
 *                 type: number
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Phone number already registered
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token and user
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Current user profile
 *       404:
 *         description: User not found
 */
router.get('/me', authenticate, me);

export default router;
