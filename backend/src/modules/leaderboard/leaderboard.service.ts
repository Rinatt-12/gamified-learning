import { prisma } from '../../config/prisma.ts';

export async function getGlobalLeaderboard(limit: number = 50) {
  const students = await prisma.student.findMany({
    take: limit,
    orderBy: { xp: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      team: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return students.map((s, index) => ({
    rank: index + 1,
    studentId: s.id,
    name: s.user.name,
    avatarUrl: s.user.avatarUrl,
    xp: s.xp,
    level: s.level,
    group: s.group,
    team: s.team,
  }));
}

export async function getCourseLeaderboard(courseId: string, limit: number = 50) {
  // Курстағы level ID-лерін алу
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      topics: {
        include: {
          levels: {
            include: {
              tasks: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!course) throw new Error('Курс табылмады');

  const taskIds = course.topics.flatMap((t) =>
    t.levels.flatMap((l) => l.tasks.map((task) => task.id))
  );

  // Курс тапсырмаларын орындаған студенттердің XP-ін есептеу
  const xpEvents = await prisma.xpEvent.groupBy({
    by: ['studentId'],
    where: {
      metadata: {
        path: ['taskId'],
        in: taskIds,
      },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });

  const studentIds = xpEvents.map((e) => e.studentId);
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      team: { select: { id: true, name: true } },
    },
  });

  const studentMap = new Map(students.map((s) => [s.id, s]));

  return xpEvents
    .map((e, index) => {
      const student = studentMap.get(e.studentId);
      if (!student) return null;
      return {
        rank: index + 1,
        studentId: student.id,
        name: student.user.name,
        avatarUrl: student.user.avatarUrl,
        xp: e._sum.amount || 0,
        level: student.level,
        group: student.group,
        team: student.team,
      };
    })
    .filter(Boolean);
}

export async function getTeamLeaderboard(limit: number = 20) {
  const teams = await prisma.team.findMany({
    take: limit,
    orderBy: { totalXp: 'desc' },
    include: {
      _count: { select: { students: true } },
    },
  });

  return teams.map((t, index) => ({
    rank: index + 1,
    teamId: t.id,
    name: t.name,
    avatarUrl: t.avatarUrl,
    totalXp: t.totalXp,
    membersCount: t._count.students,
  }));
}

// Команда XP-ін жаңарту (XP қосылғанда шақырылады)
export async function updateTeamXp(teamId: string) {
  const result = await prisma.student.aggregate({
    where: { teamId },
    _sum: { xp: true },
  });

  await prisma.team.update({
    where: { id: teamId },
    data: { totalXp: result._sum.xp || 0 },
  });
}