import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ identifier, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(t('auth.loginSuccess'));

      // Рөлге қарай бағыттау
      if (data.user.role === 'ADMIN') navigate('/admin');
      else if (data.user.role === 'TEACHER') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Кіру қатесі');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">🎮 Gamified Learning</h1>
          <p className="text-slate-500 mt-2">Android әзірлеуді үйрен</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input"
              placeholder="student1@learning.kz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            {t('auth.register')}
          </Link>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-600">
          <p className="font-semibold mb-1">📋 Тестілік аккаунттар:</p>
          <p>Admin: admin@learning.kz / Admin123!</p>
          <p>Teacher: teacher@learning.kz / Teacher123!</p>
          <p>Student: student1@learning.kz / Student123!</p>
        </div>
      </div>
    </div>
  );
}