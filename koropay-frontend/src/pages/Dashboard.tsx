import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Play, Wallet, Shield, ArrowRight, CheckCircle2, Clock, Users, Phone } from 'lucide-react';
import { driverApi } from '../utils/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverApi.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingLevies = data?.pendingLevies ?? 0;
  const totalEarnings = data?.totalEarnings ?? 0;
  const totalTrips = data?.totalTrips ?? 0;
  const totalPassengers = data?.totalPassengers ?? 0;
  const trips = data?.trips ?? [];
  const vehiclePlate: string = data?.driver?.vehiclePlate ?? '';
  const ussdCode = vehiclePlate.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();

  const actionCards = [
    { title: 'Set Route', desc: 'Define your route and fare', icon: MapPin, color: 'from-primary-400/20 to-primary-600/20', iconColor: 'text-primary-400', path: '/driver/routes' },
    { title: 'Start Trip', desc: 'Begin a new trip', icon: Play, color: 'from-emerald-400/20 to-emerald-600/20', iconColor: 'text-emerald-400', path: '/driver/trip' },
    { title: 'Earnings', desc: `₦${totalEarnings.toLocaleString()} today`, icon: Wallet, color: 'from-amber-400/20 to-amber-600/20', iconColor: 'text-amber-400', path: '/driver/earnings' },
    { title: 'Levies', desc: pendingLevies > 0 ? `${pendingLevies} pending` : 'All paid', icon: Shield, color: 'from-rose-400/20 to-rose-600/20', iconColor: 'text-rose-400', path: '/driver/levies', badge: pendingLevies > 0 ? pendingLevies : undefined },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Driver Dashboard</h1>
        <p className="text-surface-200/60">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {actionCards.map((card) => (
          <motion.div
            key={card.title}
            variants={item}
            onClick={() => navigate(card.path)}
            className="glass-card-hover p-6 cursor-pointer group relative"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-surface-200/50 mt-0.5">{card.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.badge && (
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {card.badge}
                  </span>
                )}
                <ArrowRight className="w-5 h-5 text-surface-200/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-xs text-surface-200/40 mb-0.5">Your Passenger USSD Code</p>
            <p className="text-lg font-bold text-white font-mono">*384*{ussdCode}#</p>
            <p className="text-xs text-surface-200/40">Display this on your dashboard for passengers</p>
          </div>
        </div>
        <span className="text-2xl font-black text-primary-400 font-mono">{ussdCode}</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <Wallet className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">₦{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-surface-200/40">Today's Earnings</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Play className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{totalTrips}</p>
          <p className="text-xs text-surface-200/40">Trips Today</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{totalPassengers}</p>
          <p className="text-xs text-surface-200/40">Passengers</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Shield className="w-5 h-5 text-rose-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{pendingLevies}</p>
          <p className="text-xs text-surface-200/40">Pending Levies</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Recent Trips</h2>
          <p className="text-sm text-surface-200/50 mt-0.5">Your trip history today</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {trips.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-surface-200/15 mx-auto mb-2" />
              <p className="text-sm text-surface-200/40">No trips today yet</p>
            </div>
          ) : trips.map((trip: any, i: number) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{trip.route?.routeName ?? trip.routeId}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-surface-200/40">
                      <Users className="w-3 h-3" /> {trip.totalPassengers} passengers
                    </span>
                    <span className="flex items-center gap-1 text-xs text-surface-200/40">
                      <Clock className="w-3 h-3" /> {new Date(trip.startTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-400">₦{trip.totalAmount.toLocaleString()}</p>
                <span className="badge-success text-[10px]">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> {trip.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
