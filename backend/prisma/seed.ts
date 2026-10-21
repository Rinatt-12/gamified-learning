import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const Role = { ADMIN: 'ADMIN', TEACHER: 'TEACHER', STUDENT: 'STUDENT' } as const;
const TaskType = { QUIZ: 'QUIZ', PRACTICE: 'PRACTICE', THEORY: 'THEORY' } as const;

async function main() {
  console.log('🌱 Seed деректер жасалуда...');

  // ==================== ADMIN ====================
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@learning.kz' },
    update: {},
    create: {
      email: 'admin@learning.kz',
      password: adminPassword,
      name: 'Басты Админ',
      role: Role.ADMIN,
      admin: {
        create: {},
      },
    },
  });
  console.log('✅ Admin:', adminUser.email);

  // ==================== TEACHER ====================
  const teacherPassword = await bcrypt.hash('Teacher123!', 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@learning.kz' },
    update: {},
    create: {
      email: 'teacher@learning.kz',
      password: teacherPassword,
      name: 'Айгүл Мұғалім',
      role: Role.TEACHER,
      teacher: {
        create: {
          bio: 'Android әзірлеу пәнінің мұғалімі',
        },
      },
    },
    include: { teacher: true },
  });
  console.log('✅ Teacher:', teacherUser.email);

  // ==================== COURSE ====================
  const course = await prisma.course.upsert({
    where: { id: 'android-course-001' },
    update: {},
    create: {
      id: 'android-course-001',
      title: 'Android ОЖ-да мобильді қосымшаларды әзірлеу',
      description:
        'Android платформасында мобильді қосымшаларды әзірлеуді үйрену. Kotlin, Jetpack Compose, Activity lifecycle, Intent, SQLite және т.б.',
      isPublished: true,
      teacherId: teacherUser.teacher!.id,
    },
  });
  console.log('✅ Course:', course.title);

  // ==================== TOPICS ====================
  const topicsData = [
    {
      id: 'topic-1',
      title: 'Android негіздері',
      description: 'Android Studio, жоба құрылымы, Kotlin негіздері',
      orderIndex: 1,
      icon: '📱',
    },
    {
      id: 'topic-2',
      title: 'UI және Activity',
      description: 'Activity lifecycle, Layout, Compose, Intent',
      orderIndex: 2,
      icon: '🎨',
    },
    {
      id: 'topic-3',
      title: 'Деректерді сақтау',
      description: 'SharedPreferences, SQLite, Room, API',
      orderIndex: 3,
      icon: '💾',
    },
  ];

  for (const t of topicsData) {
    await prisma.topic.upsert({
      where: { id: t.id },
      update: {},
      create: {
        ...t,
        courseId: course.id,
      },
    });
  }
  console.log('✅ 3 topic жасалды');

  // ==================== LEVELS ====================
  const levelsData = [
    { id: 'level-1-1', title: 'Android Studio орнату', topicId: 'topic-1', orderIndex: 1, xpReward: 50, isLocked: false },
    { id: 'level-1-2', title: 'Kotlin негіздері', topicId: 'topic-1', orderIndex: 2, xpReward: 50, isLocked: true },
    { id: 'level-1-3', title: 'Жоба құрылымы', topicId: 'topic-1', orderIndex: 3, xpReward: 60, isLocked: true },
    { id: 'level-2-1', title: 'Activity lifecycle', topicId: 'topic-2', orderIndex: 1, xpReward: 70, isLocked: true },
    { id: 'level-2-2', title: 'Layout және View', topicId: 'topic-2', orderIndex: 2, xpReward: 70, isLocked: true },
    { id: 'level-2-3', title: 'Intent және Navigation', topicId: 'topic-2', orderIndex: 3, xpReward: 80, isLocked: true },
    { id: 'level-2-4', title: 'Jetpack Compose', topicId: 'topic-2', orderIndex: 4, xpReward: 80, isLocked: true },
    { id: 'level-3-1', title: 'SharedPreferences', topicId: 'topic-3', orderIndex: 1, xpReward: 60, isLocked: true },
    { id: 'level-3-2', title: 'SQLite және Room', topicId: 'topic-3', orderIndex: 2, xpReward: 90, isLocked: true },
    { id: 'level-3-3', title: 'REST API және Retrofit', topicId: 'topic-3', orderIndex: 3, xpReward: 100, isLocked: true },
  ];

  for (const l of levelsData) {
    await prisma.level.upsert({
      where: { id: l.id },
      update: {},
      create: l,
    });
  }
  console.log('✅ 10 level жасалды');

  // ==================== TASKS ====================
  const tasksData = [
    {
      id: 'task-1-1-1',
      levelId: 'level-1-1',
      title: 'Android Studio дегеніміз не?',
      description: 'Android қосымшаларын әзірлеуге арналған ресми IDE',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Android үшін ресми IDE' },
        { id: 'b', text: 'Тек ойын әзірлеуге арналған' },
        { id: 'c', text: 'Тек веб-сайт жасауға арналған' },
        { id: 'd', text: 'Дерекқор басқару жүйесі' },
      ],
      correctAnswer: 'a',
      explanation: 'Android Studio — Google жасаған Android қосымшаларын әзірлеуге арналған ресми IDE.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-1-1-2',
      levelId: 'level-1-1',
      title: 'Android негізінде қандай тіл қолданылады?',
      description: 'Заманауи Android әзірлеудегі негізгі тіл',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Python' },
        { id: 'b', text: 'Kotlin' },
        { id: 'c', text: 'PHP' },
        { id: 'd', text: 'Ruby' },
      ],
      correctAnswer: 'b',
      explanation: 'Kotlin — Google ұсынған Android әзірлеуге арналған негізгі тіл.',
      xpReward: 10,
      orderIndex: 2,
    },
    {
      id: 'task-1-1-3',
      levelId: 'level-1-1',
      title: 'Gradle дегеніміз не?',
      description: 'Android жобада Gradle рөлі',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Build жүйесі' },
        { id: 'b', text: 'Дерекқор' },
        { id: 'c', text: 'Сурет редакторы' },
        { id: 'd', text: 'Ойын қозғалтқышы' },
      ],
      correctAnswer: 'a',
      explanation: 'Gradle — Android жобаларды құру (build) жүйесі.',
      xpReward: 10,
      orderIndex: 3,
    },
    {
      id: 'task-1-2-1',
      levelId: 'level-1-2',
      title: 'Kotlin-да айнымалы қалай жарияланады?',
      description: 'Kotlin синтаксисі',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'var x = 10' },
        { id: 'b', text: 'let x = 10' },
        { id: 'c', text: 'int x = 10' },
        { id: 'd', text: 'x := 10' },
      ],
      correctAnswer: 'a',
      explanation: 'Kotlin-да `var` (өзгеретін) және `val` (тұрақты) қолданылады.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-1-2-2',
      levelId: 'level-1-2',
      title: 'val және var айырмашылығы?',
      description: 'Kotlin айнымалы түрлері',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'val — өзгеретін, var — тұрақты' },
        { id: 'b', text: 'val — тұрақты, var — өзгеретін' },
        { id: 'c', text: 'Айырмашылығы жоқ' },
        { id: 'd', text: 'Екеуі де тұрақты' },
      ],
      correctAnswer: 'b',
      explanation: '`val` — read-only (тұрақты), `var` — mutable (өзгеретін).',
      xpReward: 10,
      orderIndex: 2,
    },
    {
      id: 'task-2-1-1',
      levelId: 'level-2-1',
      title: 'Activity lifecycle-те қанша негізгі кезең бар?',
      description: 'Activity өмірлік циклі',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '5' },
        { id: 'c', text: '7' },
        { id: 'd', text: '10' },
      ],
      correctAnswer: 'c',
      explanation: 'Activity lifecycle: onCreate, onStart, onResume, onPause, onStop, onDestroy, onRestart — 7 кезең.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-2-1-2',
      levelId: 'level-2-1',
      title: 'Activity бірінші рет қалай шақырылады?',
      description: 'Activity іске қосылуы',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'onCreate()' },
        { id: 'b', text: 'onStart()' },
        { id: 'c', text: 'onResume()' },
        { id: 'd', text: 'onDestroy()' },
      ],
      correctAnswer: 'a',
      explanation: '`onCreate()` — Activity жасалғанда бірінші шақырылады.',
      xpReward: 10,
      orderIndex: 2,
    },
    {
      id: 'task-2-1-3',
      levelId: 'level-2-1',
      title: 'onPause() қашан шақырылады?',
      description: 'Activity кідіртілуі',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Activity жабылғанда' },
        { id: 'b', text: 'Басқа Activity ашылғанда' },
        { id: 'c', text: 'Activity жасалғанда' },
        { id: 'd', text: 'Қосымша іске қосылғанда' },
      ],
      correctAnswer: 'b',
      explanation: '`onPause()` — Activity көрінбей қалғанда (басқа Activity ашылғанда) шақырылады.',
      xpReward: 10,
      orderIndex: 3,
    },
    {
      id: 'task-2-2-1',
      levelId: 'level-2-2',
      title: 'LinearLayout дегеніміз не?',
      description: 'Layout түрлері',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Элементтерді сызық бойымен орналастырады' },
        { id: 'b', text: 'Тек суреттер үшін' },
        { id: 'c', text: 'Дерекқор' },
        { id: 'd', text: 'API' },
      ],
      correctAnswer: 'a',
      explanation: '`LinearLayout` — элементтерді горизонталь немесе вертикаль сызық бойымен орналастырады.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-2-2-2',
      levelId: 'level-2-2',
      title: 'ConstraintLayout артықшылығы?',
      description: 'Заманауи Layout',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Күрделі layout-тарды тиімді жасайды' },
        { id: 'b', text: 'Тек суреттер үшін' },
        { id: 'c', text: 'Тек мәтін үшін' },
        { id: 'd', text: 'Ескірген' },
      ],
      correctAnswer: 'a',
      explanation: '`ConstraintLayout` — күрделі UI-ды тегіс (flat) иерархиямен жасауға мүмкіндік береді.',
      xpReward: 10,
      orderIndex: 2,
    },
    {
      id: 'task-2-3-1',
      levelId: 'level-2-3',
      title: 'Intent дегеніміз не?',
      description: 'Activity арасындағы байланыс',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Activity-лер арасындағы хабарлама' },
        { id: 'b', text: 'Дерекқор кестесі' },
        { id: 'c', text: 'Сурет форматы' },
        { id: 'd', text: 'Веб-сервер' },
      ],
      correctAnswer: 'a',
      explanation: '`Intent` — компоненттер арасындағы хабарлама (Activity, Service, Broadcast).',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-2-3-2',
      levelId: 'level-2-3',
      title: 'Explicit Intent дегеніміз?',
      description: 'Intent түрлері',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Нақты Activity-ді көрсетеді' },
        { id: 'b', text: 'Жалпы әрекетті сипаттайды' },
        { id: 'c', text: 'Тек дерекқор үшін' },
        { id: 'd', text: 'Тек веб үшін' },
      ],
      correctAnswer: 'a',
      explanation: '`Explicit Intent` — нақты компонентті (мысалы, `SecondActivity::class.java`) көрсетеді.',
      xpReward: 10,
      orderIndex: 2,
    },
    {
      id: 'task-2-4-1',
      levelId: 'level-2-4',
      title: 'Jetpack Compose дегеніміз не?',
      description: 'Заманауи UI framework',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Декларативті UI framework' },
        { id: 'b', text: 'Дерекқор' },
        { id: 'c', text: 'Веб-сервер' },
        { id: 'd', text: 'Ойын қозғалтқышы' },
      ],
      correctAnswer: 'a',
      explanation: '`Jetpack Compose` — Android үшін декларативті UI framework.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-3-1-1',
      levelId: 'level-3-1',
      title: 'SharedPreferences дегеніміз?',
      description: 'Қарапайым деректерді сақтау',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'Key-value деректерін сақтайды' },
        { id: 'b', text: 'Суреттерді сақтайды' },
        { id: 'c', text: 'Видео сақтайды' },
        { id: 'd', text: 'Дерекқор' },
      ],
      correctAnswer: 'a',
      explanation: '`SharedPreferences` — қарапайым key-value деректерін (параметрлер) сақтайды.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-3-2-1',
      levelId: 'level-3-2',
      title: 'Room дегеніміз?',
      description: 'SQLite үстіндегі библиотека',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'SQLite үстіндегі ORM' },
        { id: 'b', text: 'Веб-сервер' },
        { id: 'c', text: 'UI framework' },
        { id: 'd', text: 'Ойын қозғалтқышы' },
      ],
      correctAnswer: 'a',
      explanation: '`Room` — SQLite үстіндегі ORM (Object-Relational Mapping) библиотекасы.',
      xpReward: 10,
      orderIndex: 1,
    },
    {
      id: 'task-3-3-1',
      levelId: 'level-3-3',
      title: 'Retrofit дегеніміз?',
      description: 'REST API клиенті',
      type: TaskType.QUIZ,
      options: [
        { id: 'a', text: 'REST API клиенті' },
        { id: 'b', text: 'Дерекқор' },
        { id: 'c', text: 'UI framework' },
        { id: 'd', text: 'Ойын қозғалтқышы' },
      ],
      correctAnswer: 'a',
      explanation: '`Retrofit` — Android үшін REST API клиенті.',
      xpReward: 10,
      orderIndex: 1,
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: t as any,
    });
  }
  console.log(`✅ ${tasksData.length} task жасалды`);

  // ==================== ACHIEVEMENTS ====================
  const achievementsData = [
    {
      code: 'FIRST_TASK',
      title: 'Бірінші қадам',
      description: 'Бірінші тапсырманы орындадыңыз',
      icon: '🎯',
      xpReward: 20,
      condition: { type: 'TASKS_COMPLETED', value: 1 },
    },
    {
      code: 'TEN_TASKS',
      title: 'Он тапсырма',
      description: '10 тапсырманы орындадыңыз',
      icon: '🔥',
      xpReward: 50,
      condition: { type: 'TASKS_COMPLETED', value: 10 },
    },
    {
      code: 'LEVEL_5',
      title: 'Тәжірибелі',
      description: '5-деңгейге жеттіңіз',
      icon: '⭐',
      xpReward: 100,
      condition: { type: 'LEVEL_REACHED', value: 5 },
    },
    {
      code: 'STREAK_7',
      title: 'Апталық серпін',
      description: '7 күн қатарынан оқыдыңыз',
      icon: '📅',
      xpReward: 70,
      condition: { type: 'STREAK_DAYS', value: 7 },
    },
    {
      code: 'PERFECT_LEVEL',
      title: 'Мінсіз деңгей',
      description: 'Бір деңгейді қатесіз аяқтадыңыз',
      icon: '💎',
      xpReward: 50,
      condition: { type: 'PERFECT_LEVEL', value: 1 },
    },
  ];

  for (const a of achievementsData) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {},
      create: a as any,
    });
  }
  console.log(`✅ ${achievementsData.length} achievement жасалды`);

  // ==================== INVITE CODES ====================
  const inviteCodes = ['STUDENT-2026-001', 'STUDENT-2026-002', 'STUDENT-2026-003'];
  for (const code of inviteCodes) {
    await prisma.inviteCode.upsert({
      where: { code },
      update: {},
      create: {
        code,
        status: 'ACTIVE',
        createdBy: adminUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${inviteCodes.length} invite code жасалды`);

  // ==================== STUDENTS ====================
  const studentPassword = await bcrypt.hash('Student123!', 12);
  const studentsData = [
    { name: 'Асхат Студент', email: 'student1@learning.kz', group: 'ИС-21' },
    { name: 'Айнұр Студент', email: 'student2@learning.kz', group: 'ИС-21' },
    { name: 'Данияр Студент', email: 'student3@learning.kz', group: 'ИС-22' },
    { name: 'Мадина Студент', email: 'student4@learning.kz', group: 'ИС-22' },
    { name: 'Ержан Студент', email: 'student5@learning.kz', group: 'ИС-23' },
  ];

  for (const s of studentsData) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: studentPassword,
        name: s.name,
        role: Role.STUDENT,
        student: {
          create: {
            group: s.group,
            specialty: 'Бағдарламалық инженерия',
            courseYear: 2,
            xp: Math.floor(Math.random() * 200),
            level: 1,
          },
        },
      },
    });
  }
  console.log(`✅ ${studentsData.length} студент жасалды`);

  console.log('\n🎉 БАРЛЫҚ SEED ДЕРЕКТЕР ДАЙЫН!');
  console.log('\n📋 Кіру деректері:');
  console.log('   Admin:    admin@learning.kz / Admin123!');
  console.log('   Teacher:  teacher@learning.kz / Teacher123!');
  console.log('   Student:  student1@learning.kz / Student123!');
  console.log('\n📋 Invite кодтар:');
  inviteCodes.forEach((c) => console.log(`   ${c}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });