import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Car, KeyRound } from 'lucide-react';

const historyByDate = [
  {
    date: 'Today — March 23, 2026',
    total: 2500,
    entries: [
      { id: 'l1', driverName: 'Musa Ibrahim', plate: 'LND-456-KJ', amount: 500, time: '08:15 AM', method: 'OTP Verified' },
      { id: 'l2', driverName: 'Tunde Bakare', plate: 'EPE-321-CD', amount: 500, time: '07:50 AM', method: 'OTP Verified' },
      { id: 'l3', driverName: 'Ade Ogunbiyi', plate: 'ABC-123-XY', amount: 500, time: '09:10 AM', method: 'OTP Verified' },
      { id: 'l4', driverName: 'Kola Adenuga', plate: 'MUS-987-GH', amount: 500, time: '09:38 AM', method: 'OTP Verified' },
      { id: 'l5', driverName: 'Chidi Nwosu', plate: 'KTU-789-AB', amount: 500, time: '10:05 AM', method: 'OTP Verified' },
    ],
  },
  {
    date: 'Yesterday — March 22, 2026',
    total: 3500,
    entries: [
      { id: 'l6', driverName: 'Emeka Obi', plate: 'OGU-111-AA', amount: 500, time: '07:50 AM', method: 'OTP Verified' },
      { id: 'l7', driverName: 'Bola Adewale', plate: 'SUR-222-BB', amount: 500, time: '08:20 AM', method: 'OTP Verified' },
      { id: 'l8', driverName: 'Yusuf Garba', plate: 'ABJ-333-CC', amount: 500, time: '09:00 AM', method: 'OTP Verified' },
      { id: 'l9', driverName: 'Ade Ogunbiyi', plate: 'ABC-123-XY', amount: 500, time: '09:45 AM', method: 'OTP Verified' },
      { id: 'l10', driverName: 'Femi Kuti', plate: 'LAG-444-DD', amount: 500, time: '10:30 AM', method: 'OTP Verified' },
      { id: 'l11', driverName: 'Ngozi Okafor', plate: 'PH-555-EE', amount: 500, time: '11:15 AM', method: 'OTP Verified' },
      { id: 'l12', driverName: 'Tunde Bakare', plate: 'EPE-321-CD', amount: 500, time: '12:00 PM', method: 'OTP Verified' },
    ],
  },
];

export default function LevyHistory() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Levy History</h1>
        <p className="text-surface-200/60">Complete OTP-verified collection records</p>
      </motion.div>

      <div className="space-y-8">
        {historyByDate.map((day, di) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: di * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-surface-200/30" />
                <span className="text-sm font-medium text-surface-200/60">{day.date}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">₦{day.total.toLocaleString()}</span>
            </div>

            <div className="glass-card overflow-hidden divide-y divide-white/[0.04]">
              {day.entries.map((entry, i) => (
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
                      <p className="text-sm font-medium text-white">{entry.driverName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Car className="w-3 h-3 text-surface-200/25" />
                        <span className="text-xs text-surface-200/40 font-mono">{entry.plate}</span>
                        <span className="text-xs text-surface-200/20">•</span>
                        <KeyRound className="w-3 h-3 text-surface-200/25" />
                        <span className="text-xs text-surface-200/40">{entry.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">₦{entry.amount}</p>
                    <p className="text-xs text-surface-200/30">{entry.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
