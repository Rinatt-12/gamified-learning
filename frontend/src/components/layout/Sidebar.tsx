import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Users,
  User,
  BarChart3,
  GraduationCap,
  Ticket,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export default function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/student/courses', icon: BookOpen, label: t('nav.courses') },
    { to: '/student/leaderboard', icon: Trophy, label: t('nav.leaderboard') },
    { to: '/student/teams', icon: Users, label: t('nav.teams') },
    { to: '/student/profile', icon: User, label: t('nav.profile') },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/teacher/students', icon: GraduationCap, label: t('nav.students') },
    { to: '/teacher/analytics', icon: BarChart3, label: t('nav.analytics') },
    { to: '/teacher/profile', icon: User, label: t('nav.profile') },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/admin/users', icon: Users, label: t('nav.users') },
    { to: '/admin/invites', icon: Ticket, label: t('nav.invites') },
    { to: '/admin/analytics', icon: BarChart3, label: t('nav.analytics') },
  ];

  const links =
    user?.role === 'ADMIN' ? adminLinks : user?.role === 'TEACHER' ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <ShieldCheck className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="font-bold text-lg">Gamified</h1>
          <p className="text-xs text-slate-400">Learning System</p>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/student' || link.to === '/teacher' || link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}