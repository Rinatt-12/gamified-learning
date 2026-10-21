import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';
import { UpdateProfileInput } from './users.schema.ts';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          streak: true,
          team: true,
          achievements: {
            include: { achievement: true },
            orderBy: { unlockedAt: 'desc' },
            take: 10,
          },
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
    createdAt: user.createdAt,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      avatarUrl: input.avatarUrl,
      phone: input.phone,
      student: input.group || input.specialty
        ? {
            update: {
              group: input.group,
              specialty: input.specialty,
            },
          }
        : undefined,
    },
    include: { student: true },
  });

  return user;
}

export async function listStudents() {
  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      team: true,
    },
    orderBy: { xp: 'desc' },
  });

  return students;
}