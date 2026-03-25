import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Car, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Define the shape of our API data to fix TypeScript errors
interface LevyEntry {
  id: string;
  amount: number;
  timestamp: string;
  status: string;
  driver: {
    vehiclePlate: string;
    user: {
      name: string;
    };
  };
}

interface GroupedHistory {
  date: string;
  total: number;
  entries: LevyEntry[];
}

export default function LevyHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<GroupedHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Integrated backend endpoint for agent history
        const res = await fetch("http://localhost:5000/api/agent/history", {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch collection history");

        const data = await res.json();
        setHistory(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchHistory();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-rose-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-primary-400 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Levy History</h1>
        <p className="text-surface-200/60">
          Complete OTP-verified collection records
        </p>
      </motion.div>

      <div className="space-y-8">
        {history.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-surface-200/10 mx-auto mb-4" />
            <p className="text-surface-200/40">
              No collection records found yet.
            </p>
          </div>
        ) : (
          history.map((day, di) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-surface-200/30" />
                  <span className="text-sm font-medium text-surface-200/60">
                    {day.date}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  ₦{day.total.toLocaleString()}
                </span>
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
                        <p className="text-sm font-medium text-white">
                          {entry.driver.user.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Car className="w-3 h-3 text-surface-200/25" />
                          <span className="text-xs text-surface-200/40 font-mono">
                            {entry.driver.vehiclePlate}
                          </span>
                          <span className="text-xs text-surface-200/20">•</span>
                          <KeyRound className="w-3 h-3 text-surface-200/25" />
                          <span className="text-xs text-surface-200/40">
                            OTP Verified
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        ₦{entry.amount}
                      </p>
                      <p className="text-xs text-surface-200/30">
                        {new Date(entry.timestamp).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
