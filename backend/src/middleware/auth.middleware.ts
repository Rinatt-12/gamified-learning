import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  studentId?: string;
  teacherId?: string;
  adminId?: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен жоқ' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      studentId: decoded.studentId,
      teacherId: decoded.teacherId,
      adminId: decoded.adminId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Токен жарамсыз' });
  }
}

export function authorize(...roles: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Авторизация қажет' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Рұқсат жоқ' });
    }
    next();
  };
}