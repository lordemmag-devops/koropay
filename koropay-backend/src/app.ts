import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import driverRoutes from './modules/driver/driver.routes';
import agentRoutes from './modules/agent/agent.routes';
import paymentRoutes from './modules/payment/payment.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'koropay-backend' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/payment', paymentRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`KoroPay backend running on port ${PORT}`));

export default app;
