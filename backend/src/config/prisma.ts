import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

// Дайын болғанда хабарлау
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database қосылды');
  } catch (error) {
    console.error('❌ Database қатесі:', error);
    process.exit(1);
  }
}