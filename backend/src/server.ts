import app from './app.ts';
import { env } from './config/env.ts';
import { connectDB } from './config/prisma.ts';

async function start() {
  await connectDB();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Сервер іске қосылды: http://0.0.0.0:${env.PORT}`);
    console.log(`📊 Орта: ${env.NODE_ENV}`);
    console.log(`🌐 Frontend: ${env.FRONTEND_URL}\n`);
  });
}

start().catch((err) => {
  console.error('❌ Сервер қатесі:', err);
  process.exit(1);
});