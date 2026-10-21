import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';
import { CreateTeamInput } from './teams.schema.ts';

export async function listTeams() {
  const teams = await prisma.team.findMany({
    orderBy: { totalXp: 'desc' },
    include: {
      _count: { select: { students: true } },
    },
  });
  return teams;
}

export async function getTeamById(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      students: {
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { xp: 'desc' },
      },
      members: {
        include: {
          student: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!team) throw new AppError(404, 'Команда табылмады');
  return team;
}

export async function createTeam(input: CreateTeamInput, studentId: string) {
  // Студент бұрыннан командада ма?
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new AppError(404, 'Студент табылмады');
  if (student.teamId) {
    throw new AppError(400, 'Сіз бұрыннан командадасыз');
  }

  // Команда аты бірегей ме?
  const existing = await prisma.team.findUnique({
    where: { name: input.name },
  });
  if (existing) {
    throw new AppError(400, 'Бұл атпен команда бар');
  }

  // Транзакция: команда жасау + студентті қосу
  const team = await prisma.$transaction(async (tx) => {
    const newTeam = await tx.team.create({
      data: {
        name: input.name,
        description: input.description,
        avatarUrl: input.avatarUrl,
      },
    });

    await tx.student.update({
      where: { id: studentId },
      data: { teamId: newTeam.id },
    });

    await tx.teamMember.create({
      data: {
        teamId: newTeam.id,
        studentId,
        role: 'LEADER',
      },
    });

    return newTeam;
  });

  return team;
}

export async function joinTeam(teamId: string, studentId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError(404, 'Команда табылмады');

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new AppError(404, 'Студент табылмады');
  if (student.teamId) {
    throw new AppError(400, 'Сіз бұрыннан командадасыз');
  }

  await prisma.$transaction([
    prisma.student.update({
      where: { id: studentId },
      data: { teamId },
    }),
    prisma.teamMember.create({
      data: {
        teamId,
        studentId,
        role: 'MEMBER',
      },
    }),
  ]);

  return { message: 'Командаға қосылдыңыз' };
}

export async function leaveTeam(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new AppError(404, 'Студент табылмады');
  if (!student.teamId) {
    throw new AppError(400, 'Сіз командада емессіз');
  }

  await prisma.$transaction([
    prisma.student.update({
      where: { id: studentId },
      data: { teamId: null },
    }),
    prisma.teamMember.deleteMany({
      where: { studentId, teamId: student.teamId },
    }),
  ]);

  return { message: 'Командадан шықтыңыз' };
}

export async function getMyTeam(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      team: {
        include: {
          students: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!student) throw new AppError(404, 'Студент табылмады');
  return student.team;
}