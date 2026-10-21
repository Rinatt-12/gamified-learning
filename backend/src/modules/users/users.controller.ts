import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service.ts';
import { updateProfileSchema } from './users.schema.ts';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await usersService.getProfile(req.user!.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updated = await usersService.updateProfile(req.user!.id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function listStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const students = await usersService.listStudents();
    res.json(students);
  } catch (error) {
    next(error);
  }
}