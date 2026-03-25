import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Wallet, TrendingUp, ArrowUpRight, Car, Receipt, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../utils/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { totalDrivers = 0, totalAgents = 0, activeDrivers = 0, activeAgents = 0, totalRevenue = 0, totalLeviesCollected = 0, recentTransactions = [] } = data ?? {};

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-surface-200/60">System overview and key metrics</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <motion.div variants={item} className="glass-card-hover p-6 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" /> {activeDrivers} active
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{totalDrivers}</p>
          <p className="text-sm text-surface-200/50 mt-1">Total Drivers</p>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-6 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" /> {activeAgents} active
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{totalAgents}</p>
          <p className="text-sm text-surface-200/50 mt-1">Total Agents</p>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-6 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-surface-200/50 mt-1">Total Driver Revenue</p>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-6 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">₦{totalLeviesCollected.toLocaleString()}</p>
          <p className="text-sm text-surface-200/50 mt-1">Total Levies Collected</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <p className="text-sm text-surface-200/50 mt-0.5">Latest payment activity across the system</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-surface-200/40">No transactions yet</td></tr>
                ) : recentTransactions.map((tx: any, i: number) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4"><span className="text-sm font-medium text-white">{tx.passengerName}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tx.type === 'passenger_payment' ? 'text-primary-400' : 'text-emerald-400'}`}>
                        {tx.type === 'passenger_payment' ? <Car className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {tx.type === 'passenger_payment' ? 'Fare' : 'Levy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">₦{tx.amount}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'completed' && <span className="badge-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</span>}
                      {tx.status === 'pending' && <span className="badge-warning"><AlertCircle className="w-3 h-3 mr-1" /> Pending</span>}
                      {tx.status === 'failed' && <span className="badge-danger"><XCircle className="w-3 h-3 mr-1" /> Failed</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-5">
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-surface-200/50 mb-4">System Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Active Drivers', value: activeDrivers, total: totalDrivers, color: 'bg-emerald-500' },
                { label: 'Active Agents', value: activeAgents, total: totalAgents, color: 'bg-primary-500' },
              ].map(stat => {
                const pct = stat.total > 0 ? Math.round((stat.value / stat.total) * 100) : 0;
                return (
                  <div key={stat.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-200/60">{stat.label}</span>
                      <span className="text-white font-medium">{stat.value}/{stat.total}</span>
                    </div>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6, duration: 0.8 }} className={`h-full rounded-full ${stat.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-surface-200/50 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Total Revenue</p>
                  <p className="text-xs text-surface-200/40">₦{(totalRevenue + totalLeviesCollected).toLocaleString()} combined</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
