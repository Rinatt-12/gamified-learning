import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { invitesApi } from '../../api/invites.api';
import Loading from '../../components/ui/Loading';

export default function AdminInvites() {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(3);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: invites, isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: invitesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => invitesApi.create({ count, expiresInDays }),
    onSuccess: (data) => {
      toast.success(`✅ ${data.invites.length} invite код жасалды!`);
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Қате'),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => invitesApi.revoke(id),
    onSuccess: () => {
      toast.success('Invite код өшірілді');
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Қате'),
  });

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Код көшірілді');
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function getStatusBadge(status: string) {
    if (status === 'ACTIVE') return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Белсенді</span>;
    if (status === 'USED') return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Қолданылды</span>;
    return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Мерзімі бітті</span>;
  }

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🎟️ Invite Кодтар</h1>
        <p className="text-slate-500 mt-1">Студенттерді тіркеу үшін код жасаңыз</p>
      </div>

      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h2 className="text-lg font-bold mb-3">Жаңа код жасау</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Саны</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              min={1}
              max={50}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Мерзімі (күн)</label>
            <input
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
              min={1}
              max={365}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="btn-primary w-full disabled:opacity-50"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              {createMutation.isPending ? 'Жасалуда...' : 'Жасау'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-3">Барлық кодтар ({invites?.length || 0})</h2>
        {invites?.length === 0 ? (
          <p className="text-slate-500 text-sm">Әзірге кодтар жоқ</p>
        ) : (
          <div className="space-y-2">
            {invites?.map((invite: any) => (
              <div key={invite.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Ticket className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-bold">{invite.code}</code>
                    {getStatusBadge(invite.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {invite.expiresAt && `Мерзімі: ${new Date(invite.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => copyCode(invite.code)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition"
                  title="Көшіру"
                >
                  {copiedCode === invite.code ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                {invite.status === 'ACTIVE' && (
                  <button
                    onClick={() => revokeMutation.mutate(invite.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition"
                    title="Өшіру"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}