import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../lib/axios';
import Loading from '../../components/ui/Loading';
import { Users, GraduationCap, BookOpen, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/analytics/admin');
      return data;
    },
  });

  if (isLoading) return <Loading />;

  const stats = [
    { label: 'Қолданушылар', value: data?.users || 0, icon: Users, color: 'blue' },
    { label: 'Студенттер', value: data?.students || 0, icon: GraduationCap, color: 'green' },
    { label: 'Курстар', value: data?.courses || 0, icon: BookOpen, color: 'purple' },
    { label: 'Бүгін белсенді', value: data?.activeToday || 0, icon: Activity, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">👑 {t('nav.dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-10 h-10 text-${stat.color}-500 opacity-30`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-500">Мұғалімдер</p>
          <p className="text-2xl font-bold text-slate-900">{data?.teachers || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Тапсырмалар</p>
          <p className="text-2xl font-bold text-slate-900">{data?.tasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Әрекеттер</p>
          <p className="text-2xl font-bold text-slate-900">{data?.attempts || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">XP оқиғалары</p>
          <p className="text-2xl font-bold text-slate-900">{data?.xpEvents || 0}</p>
        </div>
      </div>
    </div>
  );
}