import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Wallet, TrendingUp, Clock, Send, KeyRound, Car, AlertCircle, Settings2 } from 'lucide-react';
import { agentApi } from '../../utils/api';

export default function AgentDashboard() {
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingOtp, setPendingOtp] = useState<Record<string, { paymentId: string; otp?: string }>>({});
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState<string | null>(null);
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState('');
  const [feeError, setFeeError] = useState('');
  const [feeSaving, setFeeSaving] = useState(false);

  const fetchDashboard = () =>
    agentApi.getDashboard()
      .then(setDashData)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchDashboard(); }, []);

  const allDrivers: any[] = dashData?.allDrivers ?? [];
  const todayPayments: any[] = dashData?.todayPayments ?? [];
  const todayTotal: number = dashData?.todayTotal ?? 0;
  const paidCount: number = dashData?.paidCount ?? 0;
  const levyFee: number = dashData?.agent?.fee ?? 0;

  const handleSaveFee = async () => {
    if (!feeInput || Number(feeInput) <= 0) { setFeeError('Enter a valid amount'); return; }
    setFeeSaving(true);
    setFeeError('');
    try {
      await agentApi.updateFee(Number(feeInput));
      setDashData((prev: any) => ({ ...prev, agent: { ...prev.agent, fee: Number(feeInput) } }));
      setEditingFee(false);
      setFeeInput('');
    } catch (err: any) {
      setFeeError(err.message);
    } finally {
      setFeeSaving(false);
    }
  };

  const paidDriverIds = new Set(todayPayments.filter(p => p.status === 'paid').map(p => p.driverId));

  const filtered = allDrivers.filter(d =>
    d.vehiclePlate?.toLowerCase().includes(search.toLowerCase()) ||
    d.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const unpaidDrivers = filtered.filter(d => !paidDriverIds.has(d.id));
  const paidDrivers = filtered.filter(d => paidDriverIds.has(d.id));

  const handleRequestPayment = async (driverId: string) => {
    try {
      const res = await agentApi.requestPayment(driverId);
      setPendingOtp(prev => ({ ...prev, [driverId]: { paymentId: res.paymentId, otp: res.otp } }));
      setOtpError(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyOTP = async (driverId: string) => {
    const entry = pendingOtp[driverId];
    if (!entry) return;
    const entered = otpInput[driverId] || '';
    try {
      await agentApi.verifyPayment(entry.paymentId, entered);
      setPendingOtp(prev => { const u = { ...prev }; delete u[driverId]; return u; });
      setOtpInput(prev => { const u = { ...prev }; delete u[driverId]; return u; });
      setOtpError(null);
      setJustPaid(driverId);
      setTimeout(() => setJustPaid(null), 3000);
      fetchDashboard();
    } catch {
      setOtpError(driverId);
      setTimeout(() => setOtpError(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Checkpoint Dashboard</h1>
        <p className="text-surface-200/60">{dashData?.agent?.checkpoint} • {dashData?.agent?.user?.name}</p>
      </motion.div>

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
          <p className="text-2xl font-bold text-white">{paidCount} <span className="text-sm font-normal text-surface-200/40">/ {allDrivers.length}</span></p>
          <p className="text-sm text-surface-200/50 mt-1">Drivers Paid</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{levyFee > 0 ? `₦${levyFee.toLocaleString()}` : <span className="text-surface-200/30 text-lg">Not set</span>}</p>
          <p className="text-sm text-surface-200/50 mt-1">Levy Per Driver</p>
        </motion.div>
      </div>

      {/* Levy Fee Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Levy Fee Setting</p>
              <p className="text-xs text-surface-200/40">Set the amount charged per driver at this checkpoint</p>
            </div>
          </div>
          {levyFee > 0 && !editingFee && (
            <span className="text-lg font-bold text-emerald-400">₦{levyFee.toLocaleString()}</span>
          )}
        </div>
        <AnimatePresence mode="wait">
          {editingFee || levyFee === 0 ? (
            <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={feeInput}
                  onChange={(e) => { setFeeInput(e.target.value); setFeeError(''); }}
                  placeholder="e.g. 500"
                  className={`input-field w-full ${feeError ? 'border-rose-500/50' : ''}`}
                  autoFocus
                />
                {feeError && <p className="text-xs text-rose-400 mt-1">{feeError}</p>}
              </div>
              <button onClick={handleSaveFee} disabled={feeSaving} className="btn-primary px-6 disabled:opacity-60">
                {feeSaving ? 'Saving...' : 'Save'}
              </button>
              {levyFee > 0 && (
                <button onClick={() => { setEditingFee(false); setFeeInput(''); setFeeError(''); }} className="px-4 py-2.5 text-sm text-surface-200/40 hover:text-white transition-colors">
                  Cancel
                </button>
              )}
            </motion.div>
          ) : (
            <motion.button key="change" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setFeeInput(String(levyFee)); setEditingFee(true); }} className="btn-ghost text-sm">
              Change Fee
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search driver by plate or name..." className="input-field pl-11" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Unpaid Drivers</h2>
              <p className="text-sm text-surface-200/50 mt-0.5">{unpaidDrivers.length} awaiting payment</p>
            </div>
            <span className="badge-warning"><AlertCircle className="w-3 h-3 mr-1" /> {unpaidDrivers.length} pending</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {unpaidDrivers.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/30 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">All drivers have paid!</p>
              </div>
            ) : unpaidDrivers.map((driver) => (
              <motion.div key={driver.id} layout className="p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-sm font-bold text-amber-400">
                      {driver.user?.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{driver.user?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Car className="w-3 h-3 text-surface-200/30" />
                        <span className="text-xs text-surface-200/40 font-mono">{driver.vehiclePlate}</span>
                        <span className="text-xs text-surface-200/20">•</span>
                        <span className="text-xs text-surface-200/40">{driver.route}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white">₦{levyFee}</span>
                </div>

                <AnimatePresence mode="wait">
                  {pendingOtp[driver.id] ? (
                    <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <KeyRound className="w-3.5 h-3.5 text-primary-400" />
                          <span className="text-xs font-medium text-primary-400">OTP sent to {driver.user?.phone}</span>
                        </div>
                        {pendingOtp[driver.id]?.otp && (
                          <p className="text-[10px] text-surface-200/30">
                            Demo OTP: <span className="font-mono font-bold text-primary-300">{pendingOtp[driver.id].otp}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput[driver.id] || ''}
                          onChange={(e) => setOtpInput({ ...otpInput, [driver.id]: e.target.value })}
                          placeholder="Enter 4-digit OTP"
                          className={`input-field flex-1 text-center font-mono text-lg tracking-widest ${otpError === driver.id ? 'border-rose-500/50' : ''}`}
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
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-400 text-center">
                          Invalid OTP. Try again.
                        </motion.p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.button
                      key="request"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleRequestPayment(driver.id)}
                      className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5"
                    >
                      <Send className="w-4 h-4" /> Request Payment (Send OTP)
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Paid Drivers</h2>
              <p className="text-sm text-surface-200/50 mt-0.5">{paidCount} confirmed today</p>
            </div>
            <span className="badge-success"><CheckCircle2 className="w-3 h-3 mr-1" /> {paidCount} paid</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {paidDrivers.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-10 h-10 text-surface-200/15 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">No payments yet today</p>
              </div>
            ) : paidDrivers.map((driver) => {
              const payment = todayPayments.find(p => p.driverId === driver.id && p.status === 'paid');
              return (
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
                      <p className="text-sm font-medium text-white">{driver.user?.name}</p>
                      <span className="text-xs text-surface-200/40 font-mono">{driver.vehiclePlate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">₦{payment?.amount ?? levyFee}</p>
                    <p className="text-xs text-surface-200/30">
                      {payment ? new Date(payment.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
