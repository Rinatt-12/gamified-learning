import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';
import { hashPassword, comparePassword } from '../../utils/password.utils.ts';
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from '../../utils/jwt.utils.ts';
import { LoginInput, RegisterInput } from './auth.schema.ts';

async function buildTokenPayload(userId: string): Promise<TokenPayload> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: true,
      teacher: true,
      admin: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'Қолданушы табылмады');
  }

  return {
    userId: user.id,
    email: user.email || user.phone || '',
    role: user.role,
    studentId: user.student?.id,
    teacherId: user.teacher?.id,
    adminId: user.admin?.id,
  };
}

export async function login(input: LoginInput) {
  const { identifier, password } = input;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    throw new AppError(401, 'Email/телефон немесе пароль қате');
  }

  if (!user.isActive) {
    throw new AppError(403, 'Аккаунт бұғатталған');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new AppError(401, 'Email/телефон немесе пароль қате');
  }

  const payload = await buildTokenPayload(user.id);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function register(input: RegisterInput) {
  const { inviteCode, email, phone, password, name, group, specialty } = input;

  if (!email && !phone) {
    throw new AppError(400, 'Email немесе телефон қажет');
  }

  // Invite кодты тексеру
  const invite = await prisma.inviteCode.findUnique({
    where: { code: inviteCode },
  });

  if (!invite) {
    throw new AppError(404, 'Invite код табылмады');
  }
  if (invite.status !== 'ACTIVE') {
    throw new AppError(400, 'Invite код пайдаланылған немесе өшірілген');
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new AppError(400, 'Invite код мерзімі біткен');
  }

  // Email/телефон бос емес пе?
  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError(400, 'Бұл email тіркелген');
  }
  if (phone) {
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) throw new AppError(400, 'Бұл телефон тіркелген');
  }

  // Парольді хештеу
  const hashedPassword = await hashPassword(password);

  // Транзакция: user + student + invite update
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name,
        role: 'STUDENT',
        student: {
          create: {
            group,
            specialty,
            courseYear: 1,
          },
        },
      },
      include: { student: true },
    });

    await tx.inviteCode.update({
      where: { id: invite.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
        usedBy: user.id,
      },
    });

    return user;
  });

  const payload = await buildTokenPayload(result.id);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: result.id,
      email: result.email,
      phone: result.phone,
      name: result.name,
      role: result.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken: string) {
  const { verifyRefreshToken, generateAccessToken, generateRefreshToken } =
    await import('../../utils/jwt.utils.ts');

  let decoded: TokenPayload;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Refresh токен жарамсыз');
  }

  const payload = await buildTokenPayload(decoded.userId);
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          streak: true,
          team: true,
        },
      },
      teacher: true,
      admin: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'Қолданушы табылмады');
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    student: user.student,
    teacher: user.teacher,
    admin: user.admin,
  };
}