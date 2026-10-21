import { groq, GROQ_MODEL } from './groq.client.ts';
import {
  SYSTEM_PROMPT,
  mistakeAdvicePrompt,
  weakTopicsPrompt,
  nextTaskPrompt,
  generateTestPrompt,
} from './ai.prompts.ts';
import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';

export async function getMistakeAdvice(
  studentId: string,
  taskId: string,
  studentAnswer: string
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError(404, 'Тапсырма табылмады');

  const prompt = mistakeAdvicePrompt({
    taskTitle: task.title,
    taskDescription: task.description || '',
    correctAnswer: task.correctAnswer || '',
    studentAnswer,
    explanation: task.explanation || undefined,
  });

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 500,
  });

  const advice = completion.choices[0]?.message?.content || 'Кеңес алу мүмкін болмады';

  await prisma.aiAnalysis.create({
    data: {
      type: 'MISTAKE_ADVICE',
      input: { taskId, studentAnswer },
      output: { advice },
      model: GROQ_MODEL,
      studentId,
    },
  });

  await prisma.errorHistory.create({
    data: {
      studentId,
      taskId,
      mistake: studentAnswer,
      aiAdvice: advice,
    },
  });

  return { advice };
}

export async function getWeakTopics(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { name: true } } },
  });

  if (!student) throw new AppError(404, 'Студент табылмады');

  const wrongAttempts = await prisma.attempt.findMany({
    where: { studentId, isCorrect: false },
    include: {
      task: {
        include: {
          level: { include: { topic: true } },
        },
      },
    },
  });

  if (wrongAttempts.length === 0) {
    return {
      advice: 'Сізде қате жоқ! Жалғастырыңыз 🎉',
      wrongTasks: [],
    };
  }

  const grouped = new Map<string, { title: string; topic: string; count: number }>();
  for (const attempt of wrongAttempts) {
    const task = attempt.task;
    const topic = task.level.topic.title;
    const key = `${task.id}`;
    if (grouped.has(key)) {
      grouped.get(key)!.count++;
    } else {
      grouped.set(key, { title: task.title, topic, count: 1 });
    }
  }

  const wrongTasks = Array.from(grouped.values());
  const prompt = weakTopicsPrompt({
    studentName: student.user.name,
    wrongTasks,
  });

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    model: GROQ_MODEL,
    temperature: 0.6,
    max_tokens: 600,
  });

  const advice = completion.choices[0]?.message?.content || '';

  await prisma.aiAnalysis.create({
    data: {
      type: 'WEAK_TOPICS',
      input: { wrongTasks },
      output: { advice },
      model: GROQ_MODEL,
      studentId,
    },
  });

  return { advice, wrongTasks };
}

export async function getNextTaskRecommendation(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true } },
      attempts: { where: { isCorrect: true }, select: { taskId: true } },
    },
  });

  if (!student) throw new AppError(404, 'Студент табылмады');

  const completedTaskIds = student.attempts.map((a) => a.taskId);

  const availableTasks = await prisma.task.findMany({
    where: { id: { notIn: completedTaskIds } },
    include: { level: { include: { topic: true } } },
    take: 20,
  });

  if (availableTasks.length === 0) {
    return {
      taskId: null,
      reason: 'Барлық тапсырмалар орындалды! 🎉',
    };
  }

  const prompt = nextTaskPrompt({
    studentName: student.user.name,
    level: student.level,
    completedTasks: completedTaskIds.slice(0, 10),
    availableTasks: availableTasks.map((t) => ({
      id: t.id,
      title: t.title,
      topic: t.level.topic.title,
    })),
  });

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    model: GROQ_MODEL,
    temperature: 0.5,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  let result: { taskId: string | null; reason: string };
  try {
    result = JSON.parse(raw);
  } catch {
    result = {
      taskId: availableTasks[0].id,
      reason: 'Келесі тапсырма ретінде ұсынылады',
    };
  }

  await prisma.aiAnalysis.create({
    data: {
      type: 'NEXT_TASK',
      input: { completedCount: completedTaskIds.length },
      output: result,
      model: GROQ_MODEL,
      studentId,
    },
  });

  return result;
}

export async function generateTest(input: { topic: string; level: string; count: number }) {
  const prompt = generateTestPrompt(input);

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 3000,
  });

  const raw = completion.choices[0]?.message?.content || '[]';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch {
    throw new AppError(500, 'AI жауабы дұрыс форматта емес');
  }

  return { questions };
}