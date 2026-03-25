import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  MapPin,
  Phone,
  Wallet,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  KeyRound,
  Clock,
} from 'lucide-react';
import { mockAgents } from '../../data/agents';

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = mockAgents.find(a => a.id === id);

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-surface-200/50">Agent not found</p>
        <button onClick={() => navigate('/admin/agents')} className="btn-primary mt-4">Back to Agents</button>
      </div>
    );
  }

  // Simulated collection history
  const collections = [
    { id: 'c1', driverName: 'Ade Ogunbiyi', plate: 'ABC-123-XY', amount: agent.fee, time: '08:15 AM', method: 'OTP Verified' },
    { id: 'c2', driverName: 'Musa Ibrahim', plate: 'LND-456-KJ', amount: agent.fee, time: '08:42 AM', method: 'OTP Verified' },
    { id: 'c3', driverName: 'Tunde Bakare', plate: 'EPE-321-CD', amount: agent.fee, time: '09:10 AM', method: 'OTP Verified' },
    { id: 'c4', driverName: 'Kola Adenuga', plate: 'MUS-987-GH', amount: agent.fee, time: '09:38 AM', method: 'OTP Verified' },
    { id: 'c5', driverName: 'Chidi Nwosu', plate: 'KTU-789-AB', amount: agent.fee, time: '10:05 AM', method: 'OTP Verified' },
    { id: 'c6', driverName: 'Yemi Alade', plate: 'IKJ-654-EF', amount: agent.fee, time: '10:33 AM', method: 'OTP Verified' },
  ];

  const todayTotal = collections.length * agent.fee;

  // Weekly collections
  const weeklyData = [
    { day: 'Mon', count: 8 },
    { day: 'Tue', count: 12 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 14 },
    { day: 'Fri', count: 10 },
    { day: 'Sat', count: 9 },
    { day: 'Sun', count: 5 },
  ];
  const maxCount = Math.max(...weeklyData.map(d => d.count));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/admin/agents')}
        className="flex items-center gap-2 text-surface-200/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                  <Phone className="w-3.5 h-3.5" /> {agent.phone}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                  <MapPin className="w-3.5 h-3.5" /> {agent.location}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(agent.joinedDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <span className={agent.status === 'active' ? 'badge-success' : 'badge-danger'}>
            {agent.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
            <span className="capitalize">{agent.status}</span>
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-hover p-5">
          <Wallet className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-xl font-bold text-white">₦{agent.totalCollected.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Collected</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-hover p-5">
          <TrendingUp className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-xl font-bold text-white">{agent.totalScans}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Verifications</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-5">
          <Clock className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-xl font-bold text-white">₦{todayTotal.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Today's Collection</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card-hover p-5">
          <Shield className="w-5 h-5 text-rose-400 mb-3" />
          <p className="text-xl font-bold text-white">₦{agent.fee}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Levy Fee</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Weekly Activity</h2>
          <p className="text-sm text-surface-200/40 mb-6">Drivers verified per day</p>
          <div className="flex items-end gap-3 h-40">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-surface-200/40">{d.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxCount) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 min-h-[4px]"
                />
                <span className="text-xs text-surface-200/50">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Checkpoint Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Checkpoint Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-surface-200/40 mb-1">Checkpoint</p>
              <p className="text-sm font-medium text-white">{agent.checkpoint}</p>
            </div>
            <div>
              <p className="text-xs text-surface-200/40 mb-1">Location</p>
              <p className="text-sm font-medium text-white">{agent.location}</p>
            </div>
            <div>
              <p className="text-xs text-surface-200/40 mb-1">Levy Fee</p>
              <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-primary-400 bg-clip-text text-transparent">₦{agent.fee}</p>
            </div>
            <div>
              <p className="text-xs text-surface-200/40 mb-1">Verification Method</p>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary-400" />
                <p className="text-sm font-medium text-white">OTP-Based</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-surface-200/40 mb-1">ID</p>
              <p className="text-sm font-mono text-surface-200/60">{agent.id}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Collections Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden mt-6"
      >
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Today's Collections</h2>
          <p className="text-sm text-surface-200/40 mt-0.5">{collections.length} drivers verified via OTP</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Driver</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Plate</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Method</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.03 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-400/15 flex items-center justify-center text-[10px] font-bold text-primary-300">
                        {c.driverName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-white">{c.driverName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/60 font-mono">{c.plate}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-400">₦{c.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-primary-400">
                      <KeyRound className="w-3 h-3" /> {c.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/40">{c.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
