import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';

export async function listCourses() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      teacher: { include: { user: { select: { name: true, avatarUrl: true } } } },
      topics: {
        include: {
          levels: {
            include: { tasks: { select: { id: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    coverUrl: course.coverUrl,
    teacher: course.teacher.user,
    topicsCount: course.topics.length,
    levelsCount: course.topics.reduce((acc, t) => acc + t.levels.length, 0),
    tasksCount: course.topics.reduce(
      (acc, t) => acc + t.levels.reduce((lacc, l) => lacc + l.tasks.length, 0),
      0
    ),
  }));
}

export async function getCourseById(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: { include: { user: { select: { name: true, avatarUrl: true } } } },
      topics: {
        orderBy: { orderIndex: 'asc' },
        include: {
          levels: {
            orderBy: { orderIndex: 'asc' },
            include: {
              tasks: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  xpReward: true,
                  orderIndex: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new AppError(404, 'Курс табылмады');
  }

  return course;
}

export async function getLevelTasks(levelId: string) {
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: {
      tasks: { orderBy: { orderIndex: 'asc' } },
      topic: { include: { course: { select: { id: true, title: true } } } },
    },
  });

  if (!level) {
    throw new AppError(404, 'Level табылмады');
  }

  return level;
}