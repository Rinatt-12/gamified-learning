import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, BookOpen, Activity, UserCheck } from 'lucide-react';
import apiClient from '../../lib/axios';
import Loading from '../../components/ui/Loading';

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/analytics/admin');
      return data;
    },
  });

  if (isLoading) return <Loading />;

  const stats = [
    { label: 'Қолданушылар', value: data?.users || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Студенттер', value: data?.students || 0, icon: GraduationCap, color: 'text-green-600' },
    { label: 'Мұғалімдер', value: data?.teachers || 0, icon: UserCheck, color: 'text-purple-600' },
    { label: 'Курстар', value: data?.courses || 0, icon: BookOpen, color: 'text-orange-600' },
    { label: 'Тапсырмалар', value: data?.tasks || 0, icon: Activity, color: 'text-pink-600' },
    { label: 'Әрекеттер', value: data?.attempts || 0, icon: Activity, color: 'text-yellow-600' },
    { label: 'XP оқиғалары', value: data?.xpEvents || 0, icon: Activity, color: 'text-red-600' },
    { label: 'Бүгін белсенді', value: data?.activeToday || 0, icon: Activity, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📊 Аналитика</h1>
        <p className="text-slate-500 mt-1">Жалпы жүйе статистикасы</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}