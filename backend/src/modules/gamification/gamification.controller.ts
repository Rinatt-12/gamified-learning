import { Request, Response, NextFunction } from 'express';
import { getGamificationStats } from '../../services/gamification.service.ts';

export async function myStats(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) {
      return res.status(403).json({ error: 'Тек студенттер' });
    }
    const stats = await getGamificationStats(studentId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}