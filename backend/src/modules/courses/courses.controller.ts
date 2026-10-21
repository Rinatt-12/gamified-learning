import { Request, Response, NextFunction } from 'express';
import * as coursesService from './courses.service.ts';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await coursesService.listCourses();
    res.json(courses);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    res.json(course);
  } catch (error) {
    next(error);
  }
}

export async function getLevel(req: Request, res: Response, next: NextFunction) {
  try {
    const level = await coursesService.getLevelTasks(req.params.levelId);
    res.json(level);
  } catch (error) {
    next(error);
  }
}