import { Request, Response, NextFunction } from 'express';
import * as teamsService from './teams.service.ts';
import { createTeamSchema } from './teams.schema.ts';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const teams = await teamsService.listTeams();
    res.json(teams);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const team = await teamsService.getTeamById(req.params.id);
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const data = createTeamSchema.parse(req.body);
    const team = await teamsService.createTeam(data, studentId);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
}

export async function join(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const result = await teamsService.joinTeam(req.params.id, studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function leave(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const result = await teamsService.leaveTeam(studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function myTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.studentId;
    if (!studentId) return res.status(403).json({ error: 'Тек студенттер' });
    const team = await teamsService.getMyTeam(studentId);
    res.json(team);
  } catch (error) {
    next(error);
  }
}