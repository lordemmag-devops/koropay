import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Car,
  MapPin,
  Phone,
  Wallet,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  WifiOff,
} from 'lucide-react';
import { mockDrivers } from '../../data/drivers';
import { mockTransactions } from '../../data/mock';
import { mockRoutes } from '../../data/mock';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const driver = mockDrivers.find(d => d.id === id);

  if (!driver) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-surface-200/50">Driver not found</p>
        <button onClick={() => navigate('/admin/drivers')} className="btn-primary mt-4">Back to Drivers</button>
      </div>
    );
  }

  // Driver's transactions (simulated)
  const driverTransactions = mockTransactions.filter(tx =>
    tx.type === 'passenger_payment'
  ).map((tx, i) => ({
    ...tx,
    id: `${driver.id}-tx-${i}`,
  }));

  const driverRoutes = mockRoutes.filter(r => r.driverId === 'd1');

  const statusColor = driver.status === 'active' ? 'badge-success'
    : driver.status === 'offline' ? 'badge-warning'
    : 'badge-danger';

  const statusIcon = driver.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
    : driver.status === 'offline' ? <WifiOff className="w-3.5 h-3.5 mr-1" />
    : <XCircle className="w-3.5 h-3.5 mr-1" />;

  // Simulated daily earnings for past 7 days
  const dailyEarnings = [
    { day: 'Mon', amount: 3200 },
    { day: 'Tue', amount: 4500 },
    { day: 'Wed', amount: 2800 },
    { day: 'Thu', amount: 5100 },
    { day: 'Fri', amount: 6200 },
    { day: 'Sat', amount: 4800 },
    { day: 'Sun', amount: 2450 },
  ];
  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/admin/drivers')}
        className="flex items-center gap-2 text-surface-200/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Drivers
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-xl font-bold text-primary-300">
              {driver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{driver.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                  <Phone className="w-3.5 h-3.5" /> {driver.phone}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                  <Car className="w-3.5 h-3.5" /> {driver.vehiclePlate}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(driver.joinedDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <span className={statusColor}>
            {statusIcon}
            <span className="capitalize">{driver.status}</span>
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-hover p-5">
          <Wallet className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-xl font-bold text-white">₦{driver.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Earnings</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-hover p-5">
          <TrendingUp className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-xl font-bold text-white">{driver.totalTrips}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Trips</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-5">
          <Users className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-xl font-bold text-white">{driverTransactions.length}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Passengers Today</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card-hover p-5">
          <MapPin className="w-5 h-5 text-rose-400 mb-3" />
          <p className="text-xl font-bold text-white">{driver.route}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Current Route</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Weekly Earnings</h2>
          <p className="text-sm text-surface-200/40 mb-6">Last 7 days performance</p>
          <div className="flex items-end gap-3 h-40">
            {dailyEarnings.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-surface-200/40">₦{(d.amount / 1000).toFixed(1)}k</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.amount / maxEarning) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 min-h-[4px]"
                />
                <span className="text-xs text-surface-200/50">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Route Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Routes</h2>
          </div>
          <div className="p-5 space-y-4">
            {driverRoutes.length > 0 ? driverRoutes.map(route => (
              <div key={route.id}>
                <p className="text-sm font-medium text-white mb-3">{route.routeName}</p>
                <p className="text-xs text-emerald-400 font-semibold mb-3">Fixed fare: ₦{route.fare}</p>
                {route.dropPoints.map((dp) => (
                  <div key={dp.id} className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-surface-800 border border-white/[0.08] flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-primary-400" />
                    </div>
                    <span className="text-xs text-surface-200/60">{dp.name}</span>
                  </div>
                ))}
              </div>
            )) : (
              <p className="text-sm text-surface-200/40">No routes assigned</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden mt-6"
      >
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <p className="text-sm text-surface-200/40 mt-0.5">All passenger payments for this driver</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Passenger</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Drop Point</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {driverTransactions.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.03 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-400/15 flex items-center justify-center text-[10px] font-bold text-primary-300">
                        {tx.passengerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm text-white">{tx.passengerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/60">{tx.dropPoint || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">₦{tx.amount}</td>
                  <td className="px-6 py-4">
                    {tx.status === 'completed' && <span className="badge-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</span>}
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
