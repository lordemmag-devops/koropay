import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Smartphone,
  LogOut,
  Bus,
  Users,
  Shield,
  Receipt,
  History,
  Play,
  Wallet,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/drivers', icon: Users, label: 'Drivers' },
  { to: '/admin/agents', icon: Shield, label: 'Agents' },
  { to: '/admin/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/admin/levy-settings', icon: Settings, label: 'Levy Settings' },
];

const driverNav = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/driver/routes', icon: MapPin, label: 'Routes' },
  { to: '/driver/trip', icon: Play, label: 'Trip' },
  { to: '/driver/earnings', icon: Wallet, label: 'Earnings' },
  { to: '/driver/levies', icon: Shield, label: 'Levies' },
  { to: '/driver/ussd', icon: Smartphone, label: 'USSD Simulator' },
];

const agentNav = [
  { to: '/agent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agent/history', icon: History, label: 'Levy History' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNav
    : user?.role === 'driver' ? driverNav
    : agentNav;

  const roleLabel = user?.role === 'admin' ? 'Administrator'
    : user?.role === 'driver' ? 'Driver'
    : 'Checkpoint Agent';

  const roleColor = user?.role === 'admin' ? 'from-primary-500 to-purple-500'
    : user?.role === 'driver' ? 'from-primary-400 to-primary-600'
    : 'from-emerald-400 to-emerald-600';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 bottom-0 w-72 bg-surface-900/80 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col z-50"
    >
      {/* Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">KoroPay</h1>
            <p className="text-xs text-surface-200/60">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 m-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-sm font-bold text-white`}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-surface-200/50">{user?.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-surface-200/40 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
