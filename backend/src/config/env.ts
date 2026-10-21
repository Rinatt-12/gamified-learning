import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@learning.kz',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin123!',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin',
};

// Міндетті айнымалыларды тексеру
const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ ${key} .env файлында жоқ!`);
  }
}