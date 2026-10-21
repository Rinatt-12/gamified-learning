import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../lib/axios';
import XPBar from '../../components/ui/XPBar';
import Loading from '../../components/ui/Loading';

export default function StudentDashboard() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/gamification/me');
      return data;
    },
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🎓 {t('nav.dashboard')}</h1>
        <p className="text-slate-500 mt-1">Оқуды жалғастыр!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <XPBar
            current={data?.levelProgress?.current || 0}
            needed={data?.levelProgress?.needed || 100}
            percent={data?.levelProgress?.percent || 0}
            level={data?.level || 1}
          />
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <p className="text-sm text-slate-500">Streak</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {data?.streak?.currentDays || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">күн қатарынан</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">🏆 {t('dashboard.achievements')}</h2>
        {data?.achievements?.length === 0 ? (
          <p className="text-slate-500">Әзірге жетістіктер жоқ. Оқуды бастаңыз!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data?.achievements?.map((sa: any) => (
              <div
                key={sa.id}
                className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center"
              >
                <div className="text-3xl mb-1">{sa.achievement.icon}</div>
                <p className="text-sm font-semibold text-slate-900">{sa.achievement.title}</p>
                <p className="text-xs text-slate-500">{sa.achievement.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">📊 Соңғы XP</h2>
        {data?.recentXp?.length === 0 ? (
          <p className="text-slate-500">Әзірге XP жоқ</p>
        ) : (
          <div className="space-y-2">
            {data?.recentXp?.slice(0, 5).map((xp: any) => (
              <div key={xp.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{xp.reason}</span>
                <span className="font-bold text-yellow-600">+{xp.amount} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}