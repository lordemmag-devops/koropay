import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Car,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface User {
  name: string;
}
interface Driver {
  id: string;
  vehiclePlate: string;
  user: User;
}
interface Payment {
  id: string;
  driverId: string;
  status: "pending" | "paid";
  amount: number;
  timestamp: string;
  driver: Driver;
}
interface DashboardData {
  todayTotal: number;
  paidCount: number;
  totalDrivers: number;
  allDrivers: Driver[];
  todayPayments: Payment[];
}

const API_BASE = "http://localhost:5000/api";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/agent/dashboard`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Could not fetch checkpoint data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchDashboard();
    return () => {
      if (errorTimeoutRef.current) window.clearTimeout(errorTimeoutRef.current);
    };
  }, [user?.token]);

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">
          Service Unavailable
        </h2>
        <p className="text-surface-200/50 mb-6 max-w-xs">{error}</p>
        <button
          onClick={fetchDashboard}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );

  const LEVY_FEE = user?.agent?.fee || 0;
  const filteredDrivers =
    data?.allDrivers?.filter(
      (d) =>
        d.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
        d.user.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">
          Checkpoint Dashboard
        </h1>
        <p className="text-surface-200/60">
          {user?.agent?.checkpoint} • {user?.agent?.location}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-6">
          <Wallet className="w-6 h-6 text-emerald-400 mb-4" />
          <p className="text-2xl font-bold text-white">
            ₦{(data?.todayTotal || 0).toLocaleString()}
          </p>
          <p className="text-sm text-surface-200/50 mt-1">Today's Collection</p>
        </div>
        <div className="glass-card p-6">
          <TrendingUp className="w-6 h-6 text-primary-400 mb-4" />
          <p className="text-2xl font-bold text-white">
            {data?.paidCount || 0} / {data?.totalDrivers || 0}
          </p>
          <p className="text-sm text-surface-200/50 mt-1">Drivers Paid</p>
        </div>
        <div className="glass-card p-6">
          <Clock className="w-6 h-6 text-amber-400 mb-4" />
          <p className="text-2xl font-bold text-white">₦{LEVY_FEE}</p>
          <p className="text-sm text-surface-200/50 mt-1">Levy Per Driver</p>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search driver plate or name..."
          className="input-field pl-11"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              Awaiting Payment
            </h2>
            <span className="text-xs text-surface-200/30">
              {filteredDrivers.length} visible
            </span>
          </div>
          <div className="divide-y divide-white/[0.04] min-h-[300px]">
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => {
                const pendingPayment = data?.todayPayments.find(
                  (p) => p.driverId === driver.id && p.status === "pending",
                );
                if (
                  data?.todayPayments.some(
                    (p) => p.driverId === driver.id && p.status === "paid",
                  )
                )
                  return null;

                return (
                  <div key={driver.id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold uppercase">
                          {driver.user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {driver.user.name}
                          </p>
                          <p className="text-xs text-surface-200/40">
                            {driver.vehiclePlate}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">
                        ₦{LEVY_FEE}
                      </span>
                    </div>
                    {!pendingPayment ? (
                      <button
                        onClick={() => fetchDashboard()}
                        className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Request Payment
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput[driver.id] || ""}
                          onChange={(e) =>
                            setOtpInput({
                              ...otpInput,
                              [driver.id]: e.target.value,
                            })
                          }
                          placeholder="OTP"
                          className="input-field flex-1 text-center font-mono tracking-widest"
                        />
                        <button
                          onClick={() => fetchDashboard()}
                          className="btn-primary px-5"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <Car className="w-10 h-10 text-surface-200/10 mb-2" />
                <p className="text-surface-200/30 text-sm">
                  No drivers found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">
              Recent Collections
            </h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data?.todayPayments.filter((p) => p.status === "paid").length >
            0 ? (
              data.todayPayments
                .filter((p) => p.status === "paid")
                .map((p) => (
                  <div
                    key={p.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {p.driver.user.name}
                        </p>
                        <p className="text-xs text-surface-200/40">
                          {p.driver.vehiclePlate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        ₦{p.amount}
                      </p>
                      <p className="text-xs text-surface-200/30">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-20 text-center text-surface-200/20 text-sm">
                No collections recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
