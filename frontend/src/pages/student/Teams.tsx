import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, LogOut, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { teamsApi } from '../../api/teams.api';
import Loading from '../../components/ui/Loading';

export default function Teams() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');

  const { data: myTeam, isLoading: loadingMy } = useQuery({
    queryKey: ['myTeam'],
    queryFn: teamsApi.myTeam,
  });

  const { data: teams, isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: teamsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => teamsApi.create({ name: teamName, description: teamDesc }),
    onSuccess: () => {
      toast.success('Команда жасалды!');
      queryClient.invalidateQueries({ queryKey: ['myTeam'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreate(false);
      setTeamName('');
      setTeamDesc('');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Қате'),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => teamsApi.join(id),
    onSuccess: () => {
      toast.success('Командаға қосылдыңыз!');
      queryClient.invalidateQueries({ queryKey: ['myTeam'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Қате'),
  });

  const leaveMutation = useMutation({
    mutationFn: teamsApi.leave,
    onSuccess: () => {
      toast.success('Командадан шықтыңыз');
      queryClient.invalidateQueries({ queryKey: ['myTeam'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Қате'),
  });

  if (loadingMy || loadingTeams) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">👥 Командалар</h1>

      {myTeam ? (
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                {myTeam.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{myTeam.name}</h2>
                <p className="text-sm text-slate-600">{myTeam.description || 'Сипаттама жоқ'}</p>
              </div>
            </div>
            <button onClick={() => leaveMutation.mutate()} className="btn-secondary text-sm">
              <LogOut className="w-4 h-4 inline mr-1" />
              Шығу
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="font-bold text-yellow-600">{myTeam.totalXp} XP</span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Мүшелер ({myTeam.students?.length || 0}):</p>
            <div className="flex flex-wrap gap-2">
              {myTeam.students?.map((s: any) => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                    {s.user.name[0]}
                  </div>
                  <span>{s.user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-slate-600 mb-4">Сіз әзірге командада емессіз</p>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" />
            Команда жасау
          </button>
        </div>
      )}

      {showCreate && !myTeam && (
        <div className="card">
          <h3 className="font-bold mb-3">Жаңа команда</h3>
          <input
            type="text"
            placeholder="Команда аты (кемінде 3 таңба)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="input mb-2"
          />
          <input
            type="text"
            placeholder="Сипаттама (міндетті емес)"
            value={teamDesc}
            onChange={(e) => setTeamDesc(e.target.value)}
            className="input mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!teamName || createMutation.isPending}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Жасалуда...' : 'Жасау'}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">
              Болдырмау
            </button>
          </div>
        </div>
      )}

      {!myTeam && (
        <div className="card">
          <h3 className="font-bold mb-3">Барлық командалар</h3>
          {teams?.length === 0 ? (
            <p className="text-slate-500 text-sm">Әзірге командалар жоқ</p>
          ) : (
            <div className="space-y-2">
              {teams?.map((team: any) => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-xs text-slate-500">
                        {team._count?.students || 0} мүше • {team.totalXp} XP
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => joinMutation.mutate(team.id)}
                    disabled={joinMutation.isPending}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Қосылу
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}