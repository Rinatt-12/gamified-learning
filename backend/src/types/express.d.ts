import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'STUDENT' | 'TEACHER' | 'ADMIN';
        studentId?: string;
        teacherId?: string;
        adminId?: string;
      };
    }
  }
}

export {};