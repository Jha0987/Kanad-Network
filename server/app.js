import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import config from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import siteRoutes from './routes/site.routes.js';
import alarmRoutes from './routes/alarm.routes.js';
import commissioningRoutes from './routes/commissioning.routes.js';
import configurationRoutes from './routes/configuration.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import auditRoutes from './routes/audit.routes.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api', limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/commissioning', commissioningRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audits', auditRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
