import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, MapPin, Phone, Wallet, TrendingUp, Users, Calendar, CheckCircle2, AlertCircle, XCircle, WifiOff, Building2 } from 'lucide-react';
import { adminApi } from '../../utils/api';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminApi.getDriver(id)
      .then(setDriver)
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

  if (!driver) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-surface-200/50">Driver not found</p>
        <button onClick={() => navigate('/admin/drivers')} className="btn-primary mt-4">Back to Drivers</button>
      </div>
    );
  }

  const statusColor = driver.status === 'active' ? 'badge-success' : driver.status === 'offline' ? 'badge-warning' : 'badge-danger';
  const statusIcon = driver.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : driver.status === 'offline' ? <WifiOff className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />;

  const recentTrips = driver.trips ?? [];
  const allPayments = recentTrips.flatMap((t: any) => t.payments ?? []);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate('/admin/drivers')} className="flex items-center gap-2 text-surface-200/50 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Drivers
      </motion.button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-xl font-bold text-primary-300">
              {driver.user?.name?.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{driver.user?.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50"><Phone className="w-3.5 h-3.5" /> {driver.user?.phone}</span>
                <span className="flex items-center gap-1.5 text-sm text-surface-200/50"><Car className="w-3.5 h-3.5" /> {driver.vehiclePlate}</span>
                {driver.accountNumber && (
                  <span className="flex items-center gap-1.5 text-sm text-surface-200/50"><Building2 className="w-3.5 h-3.5" /> {driver.accountNumber} &bull; Bank {driver.bankCode}</span>
                )}
                {driver.user?.createdAt && (
                  <span className="flex items-center gap-1.5 text-sm text-surface-200/50">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(driver.user.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className={statusColor}>{statusIcon}<span className="capitalize">{driver.status}</span></span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Wallet, color: 'text-emerald-400', value: `₦${(driver.totalEarnings ?? 0).toLocaleString()}`, label: 'Total Earnings' },
          { icon: TrendingUp, color: 'text-primary-400', value: driver.totalTrips ?? 0, label: 'Total Trips' },
          { icon: Users, color: 'text-amber-400', value: allPayments.length, label: 'Total Passengers' },
          { icon: MapPin, color: 'text-rose-400', value: driver.route || '—', label: 'Current Route' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card-hover p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-xl font-bold text-white truncate">{stat.value}</p>
            <p className="text-xs text-surface-200/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Routes</h2>
          </div>
          <div className="p-5 space-y-4">
            {(driver.routes ?? []).length > 0 ? driver.routes.map((route: any) => (
              <div key={route.id}>
                <p className="text-sm font-medium text-white mb-1">{route.routeName}</p>
                <p className="text-xs text-emerald-400 font-semibold mb-3">Fixed fare: ₦{route.fare}</p>
                {(route.dropPoints ?? []).map((dp: any) => (
                  <div key={dp.id} className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-surface-800 border border-white/[0.08] flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-primary-400" />
                    </div>
                    <span className="text-xs text-surface-200/60">{dp.name}</span>
                  </div>
                ))}
              </div>
            )) : <p className="text-sm text-surface-200/40">No routes assigned</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card overflow-hidden">
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
                </tr>
              </thead>
              <tbody>
                {allPayments.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-surface-200/40">No transactions yet</td></tr>
                ) : allPayments.map((tx: any, i: number) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.03 }} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-400/15 flex items-center justify-center text-[10px] font-bold text-primary-300">
                          {tx.passengerName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
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
