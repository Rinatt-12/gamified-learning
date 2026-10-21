import { Request, Response, NextFunction } from 'express';
import * as leaderboardService from './leaderboard.service.ts';

export async function global(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const data = await leaderboardService.getGlobalLeaderboard(limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function course(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const data = await leaderboardService.getCourseLeaderboard(req.params.courseId, limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function team(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await leaderboardService.getTeamLeaderboard(limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
}