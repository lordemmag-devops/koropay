import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Define strict interfaces to resolve 'any' errors and ensure type safety
interface LevyPayment {
  id: string;
  levyName: string;
  amount: number;
  status: "pending" | "paid";
  timestamp: string;
  agent: {
    user: {
      name: string;
    };
  };
}

export default function Levies() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<LevyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOtpId, setActiveOtpId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLevies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/driver/levies", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch levies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchLevies();
  }, [user?.token]);

  const handlePayNow = async (id: string) => {
    setSubmitting(true);
    try {
      // Backend triggers OTP generation and sends it (usually via SMS/Email simulation)
      const res = await fetch(
        `http://localhost:5000/api/driver/levies/${id}/request-otp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );

      if (res.ok) {
        setActiveOtpId(id);
        setOtpInput("");
        setOtpError(false);
      } else {
        alert("Failed to initiate payment request.");
      }
    } catch (err) {
      alert("Network error: Failed to request OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!activeOtpId || !otpInput) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/driver/levies/${activeOtpId}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ otp: otpInput }),
        },
      );

      if (res.ok) {
        setActiveOtpId(null);
        setOtpInput("");
        await fetchLevies(); // Refresh list to move item from pending to paid
      } else {
        setOtpError(true);
        setTimeout(() => setOtpError(false), 2000);
      }
    } catch (err) {
      setOtpError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500 w-10 h-10" />
      </div>
    );

  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const totalPaidAmount = paid.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Levies</h1>
        <p className="text-surface-200/60">Union levy payments and history</p>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <Wallet className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-2xl font-bold text-white">
            ₦{totalPaidAmount.toLocaleString()}
          </p>
          <p className="text-xs text-surface-200/40 mt-0.5">Total Paid</p>
        </div>
        <div className="glass-card p-5">
          <AlertCircle className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-white">{pending.length}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">Pending Payments</p>
        </div>
        <div className="glass-card p-5">
          <Shield className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-2xl font-bold text-white">{payments.length}</p>
          <p className="text-xs text-surface-200/40 mt-0.5">
            Total Assigned Levies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Levies Section */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">
              Pending Collections
            </h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pending.length === 0 ? (
              <div className="p-8 text-center text-surface-200/30 text-sm">
                No pending levies.
              </div>
            ) : (
              pending.map((p) => (
                <div key={p.id} className="p-5">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {p.levyName}
                      </p>
                      <p className="text-xs text-surface-200/40">
                        {p.agent?.user?.name || "Official Checkpoint"}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-amber-400">
                      ₦{p.amount}
                    </span>
                  </div>

                  {activeOtpId === p.id ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className={`input-field text-center font-mono text-lg tracking-widest pl-10 ${otpError ? "border-rose-500/50" : ""}`}
                          placeholder="Enter 4-digit OTP"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleVerify}
                          disabled={submitting || otpInput.length < 4}
                          className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            "Verify & Pay"
                          )}
                        </button>
                        <button
                          onClick={() => setActiveOtpId(null)}
                          className="px-4 border border-white/10 rounded-xl hover:bg-white/5 text-surface-200/50 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-xs text-rose-400 text-center animate-pulse">
                          Invalid OTP code. Please try again.
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePayNow(p.id)}
                      disabled={submitting}
                      className="w-full btn-primary py-2.5 flex justify-center items-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" /> Pay Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Paid Levies Section */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">
              Payment History
            </h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {paid.length === 0 ? (
              <div className="p-8 text-center text-surface-200/30 text-sm">
                No payment history found.
              </div>
            ) : (
              paid.map((p) => (
                <div
                  key={p.id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {p.levyName}
                      </p>
                      <p className="text-xs text-surface-200/40">
                        {p.agent?.user?.name || "Official Checkpoint"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">
                      ₦{p.amount}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-surface-200/30 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(p.timestamp).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      •{" "}
                      {new Date(p.timestamp).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
