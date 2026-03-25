import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Users,
  ChevronDown,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { mockTrips } from '../data/mock';

export default function Earnings() {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const totalEarnings = mockTrips.reduce((s, t) => s + t.totalAmount, 0);
  const totalTrips = mockTrips.length;
  const avgPerTrip = totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;
  const totalPassengers = mockTrips.reduce((s, t) => s + t.totalPassengers, 0);
  const maxEarning = Math.max(...mockTrips.map(t => t.totalAmount));

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Earnings</h1>
        <p className="text-surface-200/60">Track your income and trip performance</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-hover p-5">
          <Wallet className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-2xl font-bold text-white">₦{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Earnings</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-hover p-5">
          <TrendingUp className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-2xl font-bold text-white">{totalTrips}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Trips</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-5">
          <Wallet className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-white">₦{avgPerTrip.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Avg per Trip</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card-hover p-5">
          <Users className="w-5 h-5 text-rose-400 mb-3" />
          <p className="text-2xl font-bold text-white">{totalPassengers}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Passengers</p>
        </motion.div>
      </div>

      {/* Earnings per trip chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-1">Earnings per Trip</h2>
        <p className="text-sm text-surface-200/40 mb-6">Today's performance</p>
        <div className="flex items-end gap-6 h-32">
          {mockTrips.map((trip, i) => (
            <div key={trip.id} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-surface-200/40">₦{(trip.totalAmount / 1000).toFixed(1)}k</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(trip.totalAmount / maxEarning) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-emerald-400 min-h-[4px]"
              />
              <span className="text-[10px] text-surface-200/50 text-center truncate w-full">
                {trip.route.split(' → ')[0]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trip History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Trip History</h2>
          <p className="text-sm text-surface-200/50 mt-0.5">Click to see payment breakdown</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {mockTrips.map((trip, i) => (
            <div key={trip.id}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-emerald-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{trip.route}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-surface-200/40">
                        <Users className="w-3 h-3" /> {trip.totalPassengers}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-surface-200/40">
                        <Clock className="w-3 h-3" /> {new Date(trip.startTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs text-surface-200/30">₦{trip.fare}/passenger</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">₦{trip.totalAmount.toLocaleString()}</p>
                    <span className="badge-success text-[10px]">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> {trip.status}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-surface-200/30 transition-transform ${expandedTrip === trip.id ? 'rotate-180' : ''}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {expandedTrip === trip.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pl-20 space-y-2">
                      {trip.payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-white">{p.passengerName}</span>
                            {p.dropPoint && <span className="text-[10px] text-surface-200/30">• {p.dropPoint}</span>}
                          </div>
                          <span className="text-xs font-semibold text-white">₦{p.amount}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
