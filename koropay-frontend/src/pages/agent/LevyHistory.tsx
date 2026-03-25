import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Car, KeyRound, Clock } from 'lucide-react';
import { agentApi } from '../../utils/api';

export default function LevyHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentApi.getHistory()
      .then(setHistory)
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

  // Group by date
  const grouped: Record<string, any[]> = {};
  history.forEach(entry => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  });

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Levy History</h1>
        <p className="text-surface-200/60">Complete OTP-verified collection records</p>
      </motion.div>

      {Object.keys(grouped).length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Clock className="w-8 h-8 text-surface-200/15 mx-auto mb-2" />
          <p className="text-sm text-surface-200/40">No collection history yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, entries], di) => {
            const dayTotal = entries.reduce((s, e) => s + e.amount, 0);
            return (
              <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.1 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-surface-200/30" />
                    <span className="text-sm font-medium text-surface-200/60">{date}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">₦{dayTotal.toLocaleString()}</span>
                </div>

                <div className="glass-card overflow-hidden divide-y divide-white/[0.04]">
                  {entries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: di * 0.1 + 0.1 + i * 0.03 }}
                      className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{entry.driver?.user?.name ?? 'Unknown Driver'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Car className="w-3 h-3 text-surface-200/25" />
                            <span className="text-xs text-surface-200/40 font-mono">{entry.driver?.vehiclePlate ?? '—'}</span>
                            <span className="text-xs text-surface-200/20">•</span>
                            <KeyRound className="w-3 h-3 text-surface-200/25" />
                            <span className="text-xs text-surface-200/40">OTP Verified</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">₦{entry.amount}</p>
                        <p className="text-xs text-surface-200/30">
                          {new Date(entry.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
