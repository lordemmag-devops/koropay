import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, ArrowRight, Phone, Shield, Car, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('admin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles: { value: UserRole; label: string; icon: typeof User; desc: string }[] = [
    { value: 'admin', label: 'Admin', icon: Shield, desc: 'Manage drivers & agents' },
    { value: 'driver', label: 'Driver', icon: Car, desc: 'Routes & payments' },
    { value: 'agent', label: 'Agent', icon: User, desc: 'Levy collection' },
  ];

  const navigateByRole = (r: UserRole) => {
    switch (r) {
      case 'admin': navigate('/admin/dashboard'); break;
      case 'driver': navigate('/driver/dashboard'); break;
      case 'agent': navigate('/agent/dashboard'); break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) { setError('Please enter your phone number'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    try {
      await login(phone, password);
      navigateByRole(role);
    } catch (err: any) {
      setError(err.message || 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25"
          >
            <Bus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-1">KoroPay</h1>
          <p className="text-surface-200/50 text-sm">Digital transport payments made simple</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-200/70 mb-3">Login as</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                      role === r.value
                        ? 'bg-primary-600/15 border-primary-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <r.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${role === r.value ? 'text-primary-400' : 'text-surface-200/30'}`} />
                    <span className={`text-xs sm:text-sm font-medium block ${role === r.value ? 'text-white' : 'text-surface-200/50'}`}>{r.label}</span>
                    <span className={`text-[10px] block mt-0.5 sm:block ${role === r.value ? 'text-surface-200/50' : 'text-surface-200/25'} hidden`}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-200/70 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080XXXXXXXX"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-200/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-200/30 hover:text-surface-200/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Login as {roles.find(r => r.value === role)?.label}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-surface-200/30 mt-6">
          KoroPay — Transforming informal transport payments
        </p>
      </motion.div>
    </div>
  );
}
