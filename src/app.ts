import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/tasks.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorMiddleware);

export default app;
