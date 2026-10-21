import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.ts';
import { errorHandler, notFound } from './middleware/error.middleware.ts';
import authRoutes from './modules/auth/auth.routes.ts';
import usersRoutes from './modules/users/users.routes.ts';
import invitesRoutes from './modules/invites/invites.routes.ts';
import coursesRoutes from './modules/courses/courses.routes.ts';
import tasksRoutes from './modules/tasks/tasks.routes.ts';
import gamificationRoutes from './modules/gamification/gamification.routes.ts';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes.ts';
import teamsRoutes from './modules/teams/teams.routes.ts';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Тым көп сұраныс, кейінірек қайталаңыз',
});
app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: '🎮 Gamified Learning API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/invites', invitesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teams', teamsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;