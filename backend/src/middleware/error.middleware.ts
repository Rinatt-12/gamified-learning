import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Қате:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Валидация қатесі', details: err });
  }

  return res.status(500).json({ 
    error: 'Сервер қатесі',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Маршрут табылмады: ${req.method} ${req.path}` });
}