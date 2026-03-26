import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
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

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'koropay-backend' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/payment', paymentRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../koropay-frontend/dist');
  console.log('Frontend dist path:', frontendDist);
  console.log('Frontend dist exists:', fs.existsSync(frontendDist));
  app.use(express.static(frontendDist));
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    docs: '/api/docs',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`KoroPay backend running on port ${PORT}`));

export default app;
