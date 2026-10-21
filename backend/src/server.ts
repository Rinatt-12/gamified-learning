import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/prisma.js';

async function start() {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`\n🚀 Сервер іске қосылды: http://localhost:${env.PORT}`);
    console.log(`📊 Орта: ${env.NODE_ENV}`);
    console.log(`🌐 Frontend: ${env.FRONTEND_URL}\n`);
  });
}

start().catch((err) => {
  console.error('❌ Сервер қатесі:', err);
  process.exit(1);
});