import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../lib/axios';
import Loading from '../../components/ui/Loading';

export default function TeacherDashboard() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'teacher'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/analytics/teacher/me');
      return data;
    },
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">👨‍🏫 {t('nav.dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-500">Курстар</p>
          <p className="text-3xl font-bold text-blue-600">{data?.summary?.totalCourses || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Тапсырмалар</p>
          <p className="text-3xl font-bold text-purple-600">{data?.summary?.totalTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Белсенді студенттер</p>
          <p className="text-3xl font-bold text-green-600">{data?.summary?.activeStudents || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Дұрыс жауап %</p>
          <p className="text-3xl font-bold text-orange-600">{data?.summary?.correctRate || 0}%</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">📊 Қиын тапсырмалар</h2>
        {data?.hardestTasks?.length === 0 ? (
          <p className="text-slate-500">Әзірге деректер жоқ</p>
        ) : (
          <div className="space-y-2">
            {data?.hardestTasks?.map((task: any) => (
              <div key={task.taskId} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 flex-1 font-mono">{task.taskId}</span>
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${task.percent}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right">{task.percent}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}