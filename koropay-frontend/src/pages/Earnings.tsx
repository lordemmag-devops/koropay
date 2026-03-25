import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Users,
  ChevronDown,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Define strict interfaces to resolve 'any' errors
interface Payment {
  id: string;
  passengerName: string;
  amount: number;
  dropPoint?: string;
}

interface Trip {
  id: string;
  totalAmount: number;
  totalPassengers: number;
  startTime: string;
  status: string;
  route: {
    routeName: string;
  };
  payments: Payment[];
}

interface DashboardData {
  trips: Trip[];
  totalEarnings: number;
  totalPassengers: number;
}

export default function Earnings() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/driver/dashboard", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch earnings", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchEarnings();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );

  const trips = data?.trips || [];
  const totalEarnings = data?.totalEarnings || 0;
  const totalTrips = trips.length;
  const avgPerTrip =
    totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;
  const totalPassengers = data?.totalPassengers || 0;

  // Math.max fails on empty arrays, so we provide a fallback [0]
  const maxEarning = Math.max(
    ...(trips.length > 0 ? trips.map((t) => t.totalAmount) : [0]),
    1,
  );

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Earnings</h1>
        <p className="text-surface-200/60">
          Track your income and trip performance
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <Wallet className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-2xl font-bold text-white">
            ₦{totalEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Earnings</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-2xl font-bold text-white">{totalTrips}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Trips</p>
        </div>
        <div className="glass-card p-5">
          <Wallet className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-white">
            ₦{avgPerTrip.toLocaleString()}
          </p>
          <p className="text-xs text-surface-200/40 mt-0.5">Avg per Trip</p>
        </div>
        <div className="glass-card p-5">
          <Users className="w-5 h-5 text-rose-400 mb-3" />
          <p className="text-2xl font-bold text-white">{totalPassengers}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Passengers</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-6">
          Today's Performance
        </h2>
        <div className="flex items-end gap-6 h-32">
          {trips
            .slice(0, 7)
            .reverse()
            .map((trip, i) => (
              <div
                key={trip.id}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] text-surface-200/40">
                  ₦{(trip.totalAmount / 1000).toFixed(1)}k
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(trip.totalAmount / maxEarning) * 100}%`,
                  }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-emerald-400 min-h-[4px]"
                />
                <span className="text-[10px] text-surface-200/50 truncate w-full text-center">
                  {trip.route?.routeName?.split(" ")[0] || "Trip"}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Trip History */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Trip History</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {trips.map((trip) => (
            <div key={trip.id}>
              <button
                onClick={() =>
                  setExpandedTrip(expandedTrip === trip.id ? null : trip.id)
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] text-left"
              >
                <div className="flex items-center gap-4">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {trip.route?.routeName || "Standard Route"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-surface-200/40">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {trip.totalPassengers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(trip.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">
                      ₦{trip.totalAmount.toLocaleString()}
                    </p>
                    <span className="text-[10px] uppercase text-surface-200/50">
                      {trip.status}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedTrip === trip.id ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              <AnimatePresence>
                {expandedTrip === trip.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-white/[0.02]"
                  >
                    <div className="px-6 pb-4 pl-20 space-y-2">
                      {trip.payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-xs py-1 text-surface-200/70"
                        >
                          <span>
                            {p.passengerName}{" "}
                            {p.dropPoint && `• ${p.dropPoint}`}
                          </span>
                          <span className="text-white">₦{p.amount}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {trips.length === 0 && (
            <div className="p-10 text-center text-surface-200/30 text-sm">
              No trips recorded for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
