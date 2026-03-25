import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Clock,
  Send,
  KeyRound,
  Car,
  AlertCircle,
} from 'lucide-react';

interface DriverEntry {
  id: string;
  name: string;
  phone: string;
  plate: string;
  route: string;
  levyStatus: 'unpaid' | 'pending_otp' | 'paid';
  otp?: string;
  paidAt?: string;
}

const initialDrivers: DriverEntry[] = [
  { id: 'd1', name: 'Ade Ogunbiyi', phone: '08012345678', plate: 'ABC-123-XY', route: 'Ojuelegba → Yaba', levyStatus: 'unpaid' },
  { id: 'd2', name: 'Musa Ibrahim', phone: '08098765432', plate: 'LND-456-KJ', route: 'CMS → Lekki Phase 1', levyStatus: 'paid', paidAt: '08:15 AM' },
  { id: 'd3', name: 'Chidi Nwosu', phone: '07033445566', plate: 'KTU-789-AB', route: 'Ikeja → Maryland', levyStatus: 'unpaid' },
  { id: 'd4', name: 'Tunde Bakare', phone: '09011223344', plate: 'EPE-321-CD', route: 'Mile 2 → Oshodi', levyStatus: 'paid', paidAt: '07:50 AM' },
  { id: 'd5', name: 'Kola Adenuga', phone: '07066778899', plate: 'MUS-987-GH', route: 'Iyana Oworo → Ketu', levyStatus: 'unpaid' },
  { id: 'd6', name: 'Yemi Alade', phone: '08155667788', plate: 'IKJ-654-EF', route: 'Berger → Ojota', levyStatus: 'unpaid' },
];

const LEVY_FEE = 500;

function generateOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function AgentDashboard() {
  const [drivers, setDrivers] = useState<DriverEntry[]>(initialDrivers);
  const [search, setSearch] = useState('');
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState<string | null>(null);

  const paidDrivers = drivers.filter(d => d.levyStatus === 'paid');
  const unpaidDrivers = drivers.filter(d => d.levyStatus !== 'paid');
  const todayTotal = paidDrivers.length * LEVY_FEE;

  const filtered = drivers.filter(d =>
    d.plate.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequestPayment = (driverId: string) => {
    const otp = generateOTP();
    setDrivers(drivers.map(d =>
      d.id === driverId ? { ...d, levyStatus: 'pending_otp' as const, otp } : d
    ));
    setOtpError(null);
  };

  const handleVerifyOTP = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const entered = otpInput[driverId] || '';

    if (driver?.otp && entered === driver.otp) {
      const now = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
      setDrivers(drivers.map(d =>
        d.id === driverId ? { ...d, levyStatus: 'paid' as const, paidAt: now, otp: undefined } : d
      ));
      setOtpInput(prev => {
        const updated = { ...prev };
        delete updated[driverId];
        return updated;
      });
      setOtpError(null);
      setJustPaid(driverId);
      setTimeout(() => setJustPaid(null), 3000);
    } else {
      setOtpError(driverId);
      setTimeout(() => setOtpError(null), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Checkpoint Dashboard</h1>
        <p className="text-surface-200/60">Ojuelegba Checkpoint • AG-001</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-hover p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">₦{todayTotal.toLocaleString()}</p>
          <p className="text-sm text-surface-200/50 mt-1">Today's Collection</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-hover p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-white">{paidDrivers.length} <span className="text-sm font-normal text-surface-200/40">/ {drivers.length}</span></p>
          <p className="text-sm text-surface-200/50 mt-1">Drivers Paid</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">₦{LEVY_FEE}</p>
          <p className="text-sm text-surface-200/50 mt-1">Levy Per Driver</p>
        </motion.div>
      </div>

      {/* Search by plate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver by plate number or name..."
            className="input-field pl-11"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unpaid Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Unpaid Drivers</h2>
              <p className="text-sm text-surface-200/50 mt-0.5">{unpaidDrivers.length} awaiting payment</p>
            </div>
            <span className="badge-warning">
              <AlertCircle className="w-3 h-3 mr-1" /> {unpaidDrivers.length} pending
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(search ? filtered.filter(d => d.levyStatus !== 'paid') : unpaidDrivers).map((driver) => (
              <motion.div
                key={driver.id}
                layout
                className="p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-sm font-bold text-amber-400">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{driver.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Car className="w-3 h-3 text-surface-200/30" />
                        <span className="text-xs text-surface-200/40 font-mono">{driver.plate}</span>
                        <span className="text-xs text-surface-200/20">•</span>
                        <span className="text-xs text-surface-200/40">{driver.route}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white">₦{LEVY_FEE}</span>
                </div>

                <AnimatePresence mode="wait">
                  {driver.levyStatus === 'unpaid' && (
                    <motion.button
                      key="request"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleRequestPayment(driver.id)}
                      className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5"
                    >
                      <Send className="w-4 h-4" />
                      Request Payment (Send OTP)
                    </motion.button>
                  )}

                  {driver.levyStatus === 'pending_otp' && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <KeyRound className="w-3.5 h-3.5 text-primary-400" />
                          <span className="text-xs font-medium text-primary-400">OTP sent to {driver.phone}</span>
                        </div>
                        <p className="text-[10px] text-surface-200/30">
                          Demo OTP: <span className="font-mono font-bold text-primary-300">{driver.otp}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput[driver.id] || ''}
                          onChange={(e) => setOtpInput({ ...otpInput, [driver.id]: e.target.value })}
                          placeholder="Enter 4-digit OTP"
                          className={`input-field flex-1 text-center font-mono text-lg tracking-widest ${
                            otpError === driver.id ? 'border-rose-500/50 shake' : ''
                          }`}
                        />
                        <button
                          onClick={() => handleVerifyOTP(driver.id)}
                          disabled={!otpInput[driver.id] || otpInput[driver.id].length < 4}
                          className="btn-primary px-5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Verify
                        </button>
                      </div>

                      {otpError === driver.id && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-rose-400 text-center"
                        >
                          Invalid OTP. Try again.
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {(search ? filtered.filter(d => d.levyStatus !== 'paid') : unpaidDrivers).length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/30 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">All drivers have paid!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Paid Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Paid Drivers</h2>
              <p className="text-sm text-surface-200/50 mt-0.5">{paidDrivers.length} confirmed today</p>
            </div>
            <span className="badge-success">
              <CheckCircle2 className="w-3 h-3 mr-1" /> {paidDrivers.length} paid
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(search ? filtered.filter(d => d.levyStatus === 'paid') : paidDrivers).map((driver) => (
              <motion.div
                key={driver.id}
                layout
                initial={justPaid === driver.id ? { opacity: 0, scale: 0.95, backgroundColor: 'rgba(16, 185, 129, 0.1)' } : {}}
                animate={{ opacity: 1, scale: 1, backgroundColor: 'transparent' }}
                transition={{ duration: 0.5 }}
                className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{driver.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-200/40 font-mono">{driver.plate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">₦{LEVY_FEE}</p>
                  <p className="text-xs text-surface-200/30">{driver.paidAt}</p>
                </div>
              </motion.div>
            ))}

            {paidDrivers.length === 0 && (
              <div className="p-8 text-center">
                <Clock className="w-10 h-10 text-surface-200/15 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">No payments yet today</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
