import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  getDashboard,
  getDrivers, getDriver, createDriver, updateDriverStatus,
  getAgents, getAgent, createAgent, updateAgentStatus,
  getTransactions,
  getLevySettings, createLevySetting, updateLevySetting, deleteLevySetting,
} from './admin.controller';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

router.use(authenticate, authorize('admin'));

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard stats
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', getDashboard);

/**
 * @openapi
 * /admin/drivers:
 *   get:
 *     tags: [Admin]
 *     summary: List all drivers
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, plate or route
 *     responses:
 *       200:
 *         description: List of drivers
 *   post:
 *     tags: [Admin]
 *     summary: Create a driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, vehiclePlate]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               vehiclePlate:
 *                 type: string
 *               route:
 *                 type: string
 *     responses:
 *       201:
 *         description: Driver created
 *       409:
 *         description: Phone already registered
 */
router.get('/drivers', getDrivers);
router.post('/drivers', createDriver);

/**
 * @openapi
 * /admin/drivers/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a driver by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver details
 *       404:
 *         description: Driver not found
 */
router.get('/drivers/:id', getDriver);

/**
 * @openapi
 * /admin/drivers/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update driver status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Driver status updated
 */
router.patch('/drivers/:id/status', updateDriverStatus);

/**
 * @openapi
 * /admin/agents:
 *   get:
 *     tags: [Admin]
 *     summary: List all agents
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, checkpoint or location
 *     responses:
 *       200:
 *         description: List of agents
 *   post:
 *     tags: [Admin]
 *     summary: Create an agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, checkpoint, location, fee]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               checkpoint:
 *                 type: string
 *               location:
 *                 type: string
 *               fee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Agent created
 *       409:
 *         description: Phone already registered
 */
router.get('/agents', getAgents);
router.post('/agents', createAgent);

/**
 * @openapi
 * /admin/agents/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get an agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent details
 *       404:
 *         description: Agent not found
 */
router.get('/agents/:id', getAgent);

/**
 * @openapi
 * /admin/agents/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update agent status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Agent status updated
 */
router.patch('/agents/:id/status', updateAgentStatus);

/**
 * @openapi
 * /admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: List transactions
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, passenger_payment, union_payment]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, completed, pending, failed]
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', getTransactions);

/**
 * @openapi
 * /admin/levy-settings:
 *   get:
 *     tags: [Admin]
 *     summary: List levy settings
 *     responses:
 *       200:
 *         description: List of levy settings
 *   post:
 *     tags: [Admin]
 *     summary: Create a levy setting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [levyName, amount, location]
 *             properties:
 *               levyName:
 *                 type: string
 *               amount:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Levy setting created
 */
router.get('/levy-settings', getLevySettings);
router.post('/levy-settings', createLevySetting);

/**
 * @openapi
 * /admin/levy-settings/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a levy setting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Levy setting updated
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a levy setting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.patch('/levy-settings/:id', updateLevySetting);
router.delete('/levy-settings/:id', deleteLevySetting);

export default router;
