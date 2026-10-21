export const SYSTEM_PROMPT = `Сен — Android әзірлеу пәнінің AI мұғалімісің.
Студенттерге қазақ тілінде көмектесесің.
Жауаптарың қысқа, нақты, достық үнде болуы керек.
Тек Android, Kotlin, Java, мобильді әзірлеу туралы сұрақтарға жауап бер.`;

export function mistakeAdvicePrompt(params: {
  taskTitle: string;
  taskDescription: string;
  correctAnswer: string;
  studentAnswer: string;
  explanation?: string;
}) {
  return `Студент "${params.taskTitle}" тапсырмасында қателесті.
Тапсырма: ${params.taskDescription}
Дұрыс жауап: ${params.correctAnswer}
Студенттің жауабы: ${params.studentAnswer}
${params.explanation ? `Түсіндірме: ${params.explanation}` : ''}

Студентке 2-3 сөйлеммен:
1. Неге қате екенін түсіндір
2. Дұрыс жауаптың себебін айт
3. Кеңес бер

Қазақ тілінде, достық үнде.`;
}

export function weakTopicsPrompt(params: {
  studentName: string;
  wrongTasks: Array<{ title: string; topic: string; count: number }>;
}) {
  return `Студент: ${params.studentName}

Қателескен тақырыптар:
${params.wrongTasks.map((t) => `- ${t.topic}: "${t.title}" (${t.count} рет)`).join('\n')}

Осы деректерге қарап:
1. Ең әлсіз 2-3 тақырыпты анықта
2. Әр тақырыпқа 1 кеңес бер
3. Оқу жоспарын ұсын (қысқа)

Қазақ тілінде.`;
}

export function nextTaskPrompt(params: {
  studentName: string;
  level: number;
  completedTasks: string[];
  availableTasks: Array<{ id: string; title: string; topic: string }>;
}) {
  return `Студент: ${params.studentName} (Level ${params.level})
Орындаған тапсырмалар: ${params.completedTasks.join(', ') || 'жоқ'}

Қолжетімді тапсырмалар:
${params.availableTasks.map((t) => `- ${t.id}: "${t.title}" (${t.topic})`).join('\n')}

Ең қисынды келесі 1 тапсырманы таңда. Себебін қысқа түсіндір.
JSON форматта жауап бер:
{"taskId": "...", "reason": "..."}`;
}

export function generateTestPrompt(params: {
  topic: string;
  level: string;
  count: number;
}) {
  return `Android әзірлеу пәні бойынша "${params.topic}" тақырыбында, "${params.level}" деңгейінде ${params.count} тест сұрағын жаса.

Әр сұрақ:
- 4 жауап нұсқасы (a, b, c, d)
- 1 дұрыс жауап
- Қысқа түсіндірме

Тек JSON массив қайтар, басқа мәтін жоқ:
[
  {
    "title": "Сұрақ мәтіні",
    "options": [
      {"id": "a", "text": "..."},
      {"id": "b", "text": "..."},
      {"id": "c", "text": "..."},
      {"id": "d", "text": "..."}
    ],
    "correctAnswer": "a",
    "explanation": "Түсіндірме"
  }
]

Қазақ тілінде.`;
}