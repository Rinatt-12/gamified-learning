import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/auth.store';
import Loading from '../../components/ui/Loading';

export default function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.me,
  });

  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGroup(profile.student?.group || '');
      setSpecialty(profile.student?.specialty || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () => usersApi.updateMe({ name, group, specialty }),
    onSuccess: (data) => {
      toast.success('Профиль жаңартылды');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          phone: data.phone,
          name: data.name,
          avatarUrl: data.avatarUrl,
          role: data.role,
        });
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Қате'),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">👤 Профиль</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
            {profile?.name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name}</h2>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Level {profile?.student?.level} • {profile?.student?.xp} XP
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Аты-жөні</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Топ</label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Мамандық</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline mr-1" />
            {updateMutation.isPending ? 'Сақталуда...' : 'Сақтау'}
          </button>
        </div>
      </div>
    </div>
  );
}