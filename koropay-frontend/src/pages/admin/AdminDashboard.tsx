import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Wallet,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("API server is unreachable");
      setData(await res.json());
    } catch (err) {
      console.error(err);
      setError("Admin services are currently offline. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchAdminData();
  }, [user]);

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Admin Panel Error
        </h1>
        <p className="text-surface-200/50 mb-8">{error}</p>
        <button
          onClick={fetchAdminData}
          className="btn-primary py-3 px-8 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> Reconnect to System
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-surface-200/60">System overview and key metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <Users className="w-8 h-8 text-primary-400" />
            <span className="text-emerald-400 text-sm">
              {data.activeDrivers} active
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{data.totalDrivers}</p>
          <p className="text-sm text-surface-200/50 mt-1">Total Drivers</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span className="text-emerald-400 text-sm">
              {data.activeAgents} active
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{data.totalAgents}</p>
          <p className="text-sm text-surface-200/50 mt-1">Total Agents</p>
        </div>
        <div className="glass-card p-6">
          <Wallet className="w-8 h-8 text-amber-400 mb-4" />
          <p className="text-2xl font-bold text-white">
            ₦{data.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-surface-200/50 mt-1">Driver Earnings</p>
        </div>
        <div className="glass-card p-6">
          <TrendingUp className="w-8 h-8 text-rose-400 mb-4" />
          <p className="text-2xl font-bold text-white">
            ₦{data.totalLeviesCollected.toLocaleString()}
          </p>
          <p className="text-sm text-surface-200/50 mt-1">Levies Collected</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          {data.recentTransactions?.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-surface-200/40 uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.recentTransactions.map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="text-sm text-white hover:bg-white/[0.01]"
                  >
                    <td className="px-6 py-4">{tx.passengerName}</td>
                    <td className="px-6 py-4 capitalize">
                      {tx.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 font-bold">₦{tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className="badge-success">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <BarChart3 className="w-12 h-12 text-surface-200/5 mx-auto mb-4" />
              <p className="text-surface-200/40">
                No recent activity detected in the system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
