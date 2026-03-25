import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, MapPin, Phone, Wallet, TrendingUp, Calendar, CheckCircle2, XCircle, KeyRound, Clock, Building2 } from 'lucide-react';
import { adminApi } from '../../utils/api';

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminApi.getAgent(id)
      .then(setAgent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-surface-200/50">Agent not found</p>
        <button onClick={() => navigate('/admin/agents')} className="btn-primary mt-4">Back to Agents</button>
      </div>
    );
  }

  const collections = (agent.unionPayments ?? []).filter((p: any) => p.status === 'paid');
  const todayTotal = collections.reduce((s: number, c: any) => s + c.amount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate('/admin/agents')} className="flex items-center gap-2 text-surface-200/50 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </motion.button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.user?.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50"><Phone className="w-3.5 h-3.5" /> {agent.user?.phone}</span>
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50"><MapPin className="w-3.5 h-3.5" /> {agent.location}</span>
                {agent.accountNumber && (
                  <span className="flex items-center gap-1.5 text-sm text-surface-200/50"><Building2 className="w-3.5 h-3.5" /> {agent.accountNumber} &bull; Bank {agent.bankCode}</span>
                )}
                {agent.user?.createdAt && (
                  <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(agent.user.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className={agent.status === 'active' ? 'badge-success' : 'badge-danger'}>
            {agent.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
            <span className="capitalize">{agent.status}</span>
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Wallet, color: 'text-emerald-400', value: `₦${(agent.totalCollected ?? 0).toLocaleString()}`, label: 'Total Collected' },
          { icon: TrendingUp, color: 'text-primary-400', value: agent.totalScans ?? 0, label: 'Total Verifications' },
          { icon: Clock, color: 'text-amber-400', value: `₦${todayTotal.toLocaleString()}`, label: "Today's Collection" },
          { icon: Shield, color: 'text-rose-400', value: `₦${agent.fee}`, label: 'Levy Fee' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card-hover p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-surface-200/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Checkpoint Info</h2>
          <div className="space-y-4">
            <div><p className="text-xs text-surface-200/40 mb-1">Checkpoint</p><p className="text-sm font-medium text-white">{agent.checkpoint}</p></div>
            <div><p className="text-xs text-surface-200/40 mb-1">Location</p><p className="text-sm font-medium text-white">{agent.location}</p></div>
            {agent.accountNumber && (
              <div><p className="text-xs text-surface-200/40 mb-1">Account Number</p><p className="text-sm font-medium text-white">{agent.accountNumber} &bull; Bank {agent.bankCode}</p></div>
            )}
            <div><p className="text-xs text-surface-200/40 mb-1">Levy Fee</p><p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-primary-400 bg-clip-text text-transparent">{agent.fee > 0 ? `₦${agent.fee}` : 'Not set'}</p></div>
            <div>
              <p className="text-xs text-surface-200/40 mb-1">Verification Method</p>
              <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-primary-400" /><p className="text-sm font-medium text-white">OTP-Based</p></div>
            </div>
            <div><p className="text-xs text-surface-200/40 mb-1">ID</p><p className="text-sm font-mono text-surface-200/60">{agent.id}</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Collection History</h2>
            <p className="text-sm text-surface-200/40 mt-0.5">{collections.length} drivers verified via OTP</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Levy</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-surface-200/40">No collections yet</td></tr>
                ) : collections.map((c: any, i: number) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.03 }} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-400/15 flex items-center justify-center text-[10px] font-bold text-primary-300">
                          {c.driver?.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm text-white">{c.driver?.user?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-200/60">{c.levyName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400">₦{c.amount}</td>
                    <td className="px-6 py-4 text-sm text-surface-200/40">
                      {new Date(c.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
