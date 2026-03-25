import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Car, Shield, CheckCircle2, AlertCircle, XCircle, Filter } from 'lucide-react';
import { adminApi } from '../../utils/api';

type FilterType = 'all' | 'passenger_payment' | 'union_payment';
type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const fetchTransactions = () => {
    setLoading(true);
    adminApi.getTransactions({ search: search || undefined, type: typeFilter, status: statusFilter })
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchTransactions, 300);
    return () => clearTimeout(t);
  }, [search, typeFilter, statusFilter]);

  const totalAmount = transactions.reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
        <p className="text-surface-200/60">All payments across the system</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="input-field pl-11" />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1 p-1 bg-surface-800/80 rounded-xl border border-white/[0.06]">
            <Filter className="w-4 h-4 text-surface-200/30 ml-2" />
            {(['all', 'passenger_payment', 'union_payment'] as const).map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-primary-600 text-white' : 'text-surface-200/50 hover:text-white'}`}>
                {t === 'all' ? 'All' : t === 'passenger_payment' ? 'Fares' : 'Levies'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 bg-surface-800/80 rounded-xl border border-white/[0.06]">
            {(['all', 'completed', 'pending', 'failed'] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-primary-600 text-white' : 'text-surface-200/50 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center justify-between px-6 py-3 glass-card mb-4">
        <span className="text-sm text-surface-200/50">{transactions.length} transactions</span>
        <span className="text-sm font-bold text-white">Total: ₦{totalAmount.toLocaleString()}</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Drop Point</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-surface-200/40">No transactions found</td></tr>
              ) : transactions.map((tx, i) => (
                <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.03 }} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.type === 'passenger_payment' ? 'bg-primary-400/15 text-primary-300' : 'bg-emerald-400/15 text-emerald-300'}`}>
                        {tx.passengerName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-white">{tx.passengerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tx.type === 'passenger_payment' ? 'text-primary-400' : 'text-emerald-400'}`}>
                      {tx.type === 'passenger_payment' ? <Car className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {tx.type === 'passenger_payment' ? 'Fare' : 'Levy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/60">{tx.dropPoint || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">₦{tx.amount}</td>
                  <td className="px-6 py-4">
                    {tx.status === 'completed' && <span className="badge-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</span>}
                    {tx.status === 'pending' && <span className="badge-warning"><AlertCircle className="w-3 h-3 mr-1" /> Pending</span>}
                    {tx.status === 'failed' && <span className="badge-danger"><XCircle className="w-3 h-3 mr-1" /> Failed</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/40">
                    {new Date(tx.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
