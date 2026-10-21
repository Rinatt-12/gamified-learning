import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Trophy } from 'lucide-react';
import apiClient from '../../lib/axios';
import Loading from '../../components/ui/Loading';

export default function TeacherStudents() {
  const { data: students, isLoading } = useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/users/students');
      return data.value || data;
    },
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🎓 Студенттер</h1>
        <p className="text-slate-500 mt-1">Барлық студенттер тізімі (XP бойынша)</p>
      </div>

      <div className="card">
        <div className="space-y-2">
          {students?.map((s: any, index: number) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
            >
              <span className="text-sm font-bold text-slate-500 w-8 text-center">
                #{index + 1}
              </span>

              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {s.user.name[0]}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900">{s.user.name}</p>
                <p className="text-xs text-slate-500">
                  {s.group || 'Топ жоқ'} • {s.specialty || 'Мамандық жоқ'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-yellow-600">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  {s.xp} XP
                </p>
                <p className="text-xs text-slate-500">Level {s.level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}