import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal } from 'lucide-react';
import apiClient from '../../lib/axios';
import Loading from '../../components/ui/Loading';

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/leaderboard/global');
      return data;
    },
  });

  if (isLoading) return <Loading />;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-3xl">🥉</span>;
    return <span className="text-lg font-bold text-slate-500 w-8 text-center">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🏆 Рейтинг</h1>
        <p className="text-slate-500 mt-1">Жалпы рейтинг (XP бойынша)</p>
      </div>

      <div className="card">
        <div className="space-y-2">
          {leaderboard?.map((entry: any) => (
            <div
              key={entry.studentId}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-slate-50'
              }`}
            >
              <div className="w-12 flex justify-center">{getRankIcon(entry.rank)}</div>

              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {entry.name?.[0]}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900">{entry.name}</p>
                <p className="text-xs text-slate-500">
                  {entry.group || 'Топ жоқ'} • Level {entry.level}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600">{entry.xp} XP</p>
                {entry.team && (
                  <p className="text-xs text-slate-500">{entry.team.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}