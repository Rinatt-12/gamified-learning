import { Request, Response, NextFunction } from 'express';
import * as aiService from './ai.service.ts';
import { generateTestSchema } from './ai.schema.ts';

export async function mistakeAdvice(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const { taskId, answer } = req.body;
    const result = await aiService.getMistakeAdvice(studentId, taskId, answer);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function weakTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const result = await aiService.getWeakTopics(studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function nextTask(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const result = await aiService.getNextTaskRecommendation(studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateTest(req: Request, res: Response, next: NextFunction) {
  try {
    const data = generateTestSchema.parse(req.body);
    const result = await aiService.generateTest(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}