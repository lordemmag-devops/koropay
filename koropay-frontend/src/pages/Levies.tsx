import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
} from 'lucide-react';
import { mockUnionPayments } from '../data/mock';
import type { UnionPayment } from '../types';

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function Levies() {
  const [payments, setPayments] = useState<UnionPayment[]>(mockUnionPayments);
  const [activeOtp, setActiveOtp] = useState<{ id: string; otp: string } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  const paidPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalPaid = paidPayments.reduce((s, p) => s + p.amount, 0);

  const handlePayNow = (id: string) => {
    const otp = generateOTP();
    setActiveOtp({ id, otp });
    setOtpInput('');
    setOtpError(false);
  };

  const handleVerify = () => {
    if (!activeOtp) return;
    if (otpInput === activeOtp.otp) {
      setPayments(payments.map(p =>
        p.id === activeOtp.id ? { ...p, status: 'paid' as const, timestamp: new Date().toISOString() } : p
      ));
      setActiveOtp(null);
      setOtpInput('');
      setOtpError(false);
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Levies</h1>
        <p className="text-surface-200/60">Union levy payments</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-hover p-5">
          <Wallet className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-2xl font-bold text-white">₦{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Paid</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-hover p-5">
          <AlertCircle className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Pending</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-5">
          <Shield className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-2xl font-bold text-white">{payments.length}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Levies</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Unpaid Levies</h2>
            <p className="text-sm text-surface-200/50 mt-0.5">{pendingPayments.length} pending</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pendingPayments.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">All levies paid!</p>
              </div>
            ) : (
              pendingPayments.map(p => (
                <div key={p.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{p.levyName}</p>
                      <p className="text-xs text-surface-200/40 mt-0.5">{p.agentName}</p>
                    </div>
                    <span className="text-lg font-bold text-amber-400">₦{p.amount}</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeOtp?.id === p.id ? (
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
                            <span className="text-xs font-medium text-primary-400">OTP sent to your phone</span>
                          </div>
                          <p className="text-[10px] text-surface-200/30">
                            Demo OTP: <span className="font-mono font-bold text-primary-300">{activeOtp.otp}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="Enter OTP"
                            className={`input-field flex-1 text-center font-mono text-lg tracking-widest ${otpError ? 'border-rose-500/50' : ''}`}
                          />
                          <button
                            onClick={handleVerify}
                            disabled={otpInput.length < 4}
                            className="btn-primary px-5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Verify
                          </button>
                        </div>
                        {otpError && (
                          <p className="text-xs text-rose-400 text-center">Invalid OTP</p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.button
                        key="pay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => handlePayNow(p.id)}
                        className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5"
                      >
                        <Wallet className="w-4 h-4" /> Pay Now
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Paid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Paid Levies</h2>
            <p className="text-sm text-surface-200/50 mt-0.5">{paidPayments.length} completed</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {paidPayments.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-surface-200/15 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">No payments yet</p>
              </div>
            ) : (
              paidPayments.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.levyName}</p>
                      <p className="text-xs text-surface-200/40">{p.agentName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">₦{p.amount}</p>
                    <p className="text-xs text-surface-200/30">
                      {new Date(p.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
