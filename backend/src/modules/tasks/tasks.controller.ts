import { Request, Response, NextFunction } from 'express';
import * as tasksService from './tasks.service.ts';
import { submitAttemptSchema } from './tasks.schema.ts';

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) {
      return res.status(403).json({ error: 'Тек студенттер' });
    }
    const task = await tasksService.getTask(req.params.id, studentId);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) {
      return res.status(403).json({ error: 'Тек студенттер' });
    }
    const data = submitAttemptSchema.parse(req.body);
    const result = await tasksService.submitAttempt(req.params.id, studentId, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function myAttempts(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) {
      return res.status(403).json({ error: 'Тек студенттер' });
    }
    const attempts = await tasksService.getAttempts(studentId);
    res.json(attempts);
  } catch (error) {
    next(error);
  }
}