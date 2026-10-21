import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    inviteCode: '',
    email: '',
    password: '',
    name: '',
    group: '',
    specialty: '',
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(t('auth.registerSuccess'));
      navigate('/student');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Тіркелу қатесі');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">🎮 Тіркелу</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Invite код арқылы тіркеліңіз
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('auth.inviteCode')} *
            </label>
            <input
              type="text"
              value={form.inviteCode}
              onChange={(e) => update('inviteCode', e.target.value)}
              className="input"
              placeholder="STUDENT-2026-XXXXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('auth.name')} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="Аты-жөніңіз"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="student@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('auth.password')} *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="input"
              placeholder="•••••••• (кемінде 6 таңба)"
              minLength={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('auth.group')}
              </label>
              <input
                type="text"
                value={form.group}
                onChange={(e) => update('group', e.target.value)}
                className="input"
                placeholder="ИС-21"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('auth.specialty')}
              </label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => update('specialty', e.target.value)}
                className="input"
                placeholder="Инженерия"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.registerButton')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}