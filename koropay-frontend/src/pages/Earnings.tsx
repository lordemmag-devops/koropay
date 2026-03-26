import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Users, ChevronDown, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { driverApi } from '../utils/api';

export default function Earnings() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  useEffect(() => {
    driverApi.getTrips()
      .then(setTrips)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalEarnings = trips.reduce((s, t) => s + t.totalAmount, 0);
  const totalTrips = trips.length;
  const avgPerTrip = totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;
  const totalPassengers = trips.reduce((s, t) => s + t.totalPassengers, 0);
  const maxEarning = trips.length > 0 ? Math.max(...trips.map(t => t.totalAmount)) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Earnings</h1>
        <p className="text-surface-200/60">Track your income and trip performance</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { icon: Wallet, color: 'text-emerald-400', value: `₦${totalEarnings.toLocaleString()}`, label: 'Total Earnings' },
          { icon: TrendingUp, color: 'text-primary-400', value: totalTrips, label: 'Total Trips' },
          { icon: Wallet, color: 'text-amber-400', value: `₦${avgPerTrip.toLocaleString()}`, label: 'Avg per Trip' },
          { icon: Users, color: 'text-rose-400', value: totalPassengers, label: 'Total Passengers' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card-hover p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-surface-200/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {trips.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">Earnings per Trip</h2>
          <p className="text-sm text-surface-200/40 mb-6">Performance overview</p>
          <div className="flex items-end gap-2 sm:gap-6 h-32 overflow-x-auto">
            {trips.map((trip, i) => (
              <div key={trip.id} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-surface-200/40">₦{(trip.totalAmount / 1000).toFixed(1)}k</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(trip.totalAmount / maxEarning) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-emerald-400 min-h-[4px]"
                />
                <span className="text-[10px] text-surface-200/50 text-center truncate w-full">
                  {(trip.route?.routeName ?? '').split(' → ')[0]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Trip History</h2>
          <p className="text-sm text-surface-200/50 mt-0.5">Click to see payment breakdown</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {trips.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-surface-200/15 mx-auto mb-2" />
              <p className="text-sm text-surface-200/40">No trips yet</p>
            </div>
          ) : trips.map((trip, i) => (
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
                    <p className="text-sm font-medium text-white">{trip.route?.routeName ?? trip.routeId}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-surface-200/40"><Users className="w-3 h-3" /> {trip.totalPassengers}</span>
                      <span className="flex items-center gap-1 text-xs text-surface-200/40"><Clock className="w-3 h-3" /> {new Date(trip.startTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-xs text-surface-200/30">₦{trip.fare}/passenger</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">₦{trip.totalAmount.toLocaleString()}</p>
                    <span className="badge-success text-[10px]"><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> {trip.status}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-surface-200/30 transition-transform ${expandedTrip === trip.id ? 'rotate-180' : ''}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {expandedTrip === trip.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-4 pl-20 space-y-2">
                      {(trip.payments ?? []).map((p: any) => (
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
