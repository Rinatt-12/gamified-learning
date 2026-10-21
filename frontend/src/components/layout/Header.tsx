import { useState } from 'react';
import { LogOut, Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { toast } from 'sonner';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {}
    logout();
    toast.success('Шықтыңыз');
    navigate('/login');
  }

  const roleLabel =
    user?.role === 'ADMIN' ? '👑 Админ' : user?.role === 'TEACHER' ? '👨‍🏫 Мұғалім' : '🎓 Студент';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Сәлем,</span>
        <span className="font-semibold text-slate-900">{user?.name}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {roleLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] || '?'}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Шығу
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}