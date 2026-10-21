import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service.ts';
import { analyticsQuerySchema } from './analytics.schema.ts';

export async function studentProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getStudentProgress(studentId, query.days);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function teacherAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherId = req.user!.teacherId;
    if (!teacherId) return res.status(403).json({ error: 'Тек мұғалімдер' });
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getTeacherAnalytics(teacherId, query.days);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function adminAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getAdminAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
}