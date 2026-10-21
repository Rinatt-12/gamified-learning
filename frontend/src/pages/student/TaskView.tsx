import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { tasksApi } from '../../api/tasks.api';
import apiClient from '../../lib/axios';
import Loading from '../../components/ui/Loading';

export default function TaskView() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId!),
    enabled: !!taskId,
  });

  const submitMutation = useMutation({
    mutationFn: (answer: string) => tasksApi.submit(taskId!, answer),
    onSuccess: (data) => {
      setResult(data);
      if (data.isCorrect) {
        toast.success(`🎉 Дұрыс! +${data.xp?.xpAdded || 0} XP`);
        if (data.xp?.leveledUp) {
          toast.success(`⭐ LEVEL UP! Деңгей ${data.xp.level}!`, { duration: 5000 });
        }
        queryClient.invalidateQueries({ queryKey: ['gamification'] });
      } else {
        toast.error('Қате жауап');
        fetchAIAdvice(selected);
      }
    },
  });

  async function fetchAIAdvice(wrongAnswer: string) {
    setLoadingAI(true);
    try {
      const { data } = await apiClient.post('/api/ai/mistake-advice', {
        taskId,
        answer: wrongAnswer,
      });
      setAiAdvice(data.advice);
    } catch {
      setAiAdvice('AI кеңес алу мүмкін болмады');
    } finally {
      setLoadingAI(false);
    }
  }

  function handleSubmit() {
    if (!selected) {
      toast.error('Жауап таңдаңыз');
      return;
    }
    submitMutation.mutate(selected);
  }

  if (isLoading) return <Loading />;
  if (!task) return <div>Тапсырма табылмады</div>;

  const options = (task.options as any[]) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Артқа
      </Link>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">
            {task.level?.course} / {task.level?.title}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-yellow-600">
            <Trophy className="w-4 h-4" />
            {task.xpReward} XP
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{task.title}</h1>
        <p className="text-slate-600 mb-6">{task.description}</p>

        <div className="space-y-2 mb-6">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !result && setSelected(opt.id)}
              disabled={!!result}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                selected === opt.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              } ${
                result && opt.id === task.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : ''
              } ${
                result && selected === opt.id && !result.isCorrect
                  ? 'border-red-500 bg-red-50'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700 w-6">{opt.id}.</span>
                <span className="text-slate-900">{opt.text}</span>
                {result && opt.id === task.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
                {result && selected === opt.id && !result.isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!selected || submitMutation.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Тексерілуде...' : 'Жауап беру'}
          </button>
        )}

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.isCorrect
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Дұрыс!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700">Қате</span>
                </>
              )}
            </div>
            {result.isCorrect && result.xp && (
              <p className="text-sm text-green-700">
                +{result.xp.xpAdded} XP қосылды
                {result.xp.leveledUp && ` • 🎉 Level ${result.xp.level}!`}
              </p>
            )}
            {result.explanation && (
              <p className="text-sm text-slate-700 mt-2">💡 {result.explanation}</p>
            )}
          </div>
        )}
      </div>

      {aiAdvice && (
        <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-purple-700">🤖 AI кеңес</span>
          </div>
          <p className="text-slate-700 whitespace-pre-wrap">{aiAdvice}</p>
        </div>
      )}

      {loadingAI && (
        <div className="card text-center">
          <p className="text-purple-600">🤖 AI кеңес дайындалып жатыр...</p>
        </div>
      )}

      {result && (
        <button
          onClick={() => navigate('/student/courses')}
          className="btn-secondary w-full"
        >
          Курстарға қайту
        </button>
      )}
    </div>
  );
}