import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';

export async function getStudentProgress(studentId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // XP по дням
  const xpEvents = await prisma.xpEvent.findMany({
    where: {
      studentId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Топтау по күн
  const xpByDay = new Map<string, number>();
  for (const event of xpEvents) {
    const day = event.createdAt.toISOString().split('T')[0];
    xpByDay.set(day, (xpByDay.get(day) || 0) + event.amount);
  }

  const xpChart = Array.from(xpByDay.entries())
    .map(([date, xp]) => ({ date, xp }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Дұрыс/қате жауаптар
  const attempts = await prisma.attempt.findMany({
    where: { studentId, createdAt: { gte: since } },
  });

  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const wrongCount = attempts.filter((a) => a.isCorrect === false).length;

  // Тақырып бойынша нәтиже
  const attemptsWithTopic = await prisma.attempt.findMany({
    where: { studentId, createdAt: { gte: since } },
    include: {
      task: {
        include: {
          level: {
            include: { topic: true },
          },
        },
      },
    },
  });

  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const attempt of attemptsWithTopic) {
    const topic = attempt.task.level.topic.title;
    if (!byTopic.has(topic)) {
      byTopic.set(topic, { correct: 0, total: 0 });
    }
    const stats = byTopic.get(topic)!;
    stats.total++;
    if (attempt.isCorrect) stats.correct++;
  }

  const topicChart = Array.from(byTopic.entries()).map(([topic, stats]) => ({
    topic,
    correct: stats.correct,
    total: stats.total,
    percent: Math.round((stats.correct / stats.total) * 100),
  }));

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  return {
    summary: {
      xp: student?.xp || 0,
      level: student?.level || 1,
      totalAttempts: attempts.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      accuracy: attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0,
    },
    xpChart,
    answersChart: {
      correct: correctCount,
      wrong: wrongCount,
    },
    topicChart,
  };
}

export async function getTeacherAnalytics(teacherId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Мұғалімнің курстары
  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      topics: {
        include: {
          levels: {
            include: { tasks: { select: { id: true } } },
          },
        },
      },
    },
  });

  const taskIds = courses.flatMap((c) =>
    c.topics.flatMap((t) => t.levels.flatMap((l) => l.tasks.map((task) => task.id)))
  );

  // Барлық әрекеттер
  const attempts = await prisma.attempt.findMany({
    where: {
      taskId: { in: taskIds },
      createdAt: { gte: since },
    },
  });

  const uniqueStudents = new Set(attempts.map((a) => a.studentId));

  // Тапсырма бойынша статистика
  const byTask = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    if (!byTask.has(attempt.taskId)) {
      byTask.set(attempt.taskId, { correct: 0, total: 0 });
    }
    const stats = byTask.get(attempt.taskId)!;
    stats.total++;
    if (attempt.isCorrect) stats.correct++;
  }

  const taskChart = Array.from(byTask.entries())
    .map(([taskId, stats]) => ({
      taskId,
      correct: stats.correct,
      total: stats.total,
      percent: Math.round((stats.correct / stats.total) * 100),
    }))
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 10);

  return {
    summary: {
      totalCourses: courses.length,
      totalTasks: taskIds.length,
      activeStudents: uniqueStudents.size,
      totalAttempts: attempts.length,
      correctRate:
        attempts.length > 0
          ? Math.round((attempts.filter((a) => a.isCorrect).length / attempts.length) * 100)
          : 0,
    },
    hardestTasks: taskChart,
  };
}

export async function getAdminAnalytics() {
  const [users, students, teachers, courses, tasks, attempts, xpEvents] = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.course.count(),
    prisma.task.count(),
    prisma.attempt.count(),
    prisma.xpEvent.count(),
  ]);

  const activeToday = await prisma.student.count({
    where: {
      lastActive: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  return {
    users,
    students,
    teachers,
    courses,
    tasks,
    attempts,
    xpEvents,
    activeToday,
  };
}