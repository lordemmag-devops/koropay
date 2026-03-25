import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Car,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Define strict interfaces to resolve 'any' errors
interface Transaction {
  id: string;
  passengerName: string;
  amount: number;
  type: "passenger_payment" | "union_payment";
  status: "completed" | "pending" | "failed";
  timestamp: string;
  dropPoint?: string;
}

type FilterType = "all" | "passenger_payment" | "union_payment";
type FilterStatus = "all" | "completed" | "pending" | "failed";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        // Assuming the backend returns 'recentTransactions' as an array
        setTransactions(data.recentTransactions || []);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchTransactions();
  }, [user]);

  // Filtering logic
  const filtered = transactions.filter((tx) => {
    const matchSearch = tx.passengerName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalAmount = filtered.reduce((s, tx) => s + tx.amount, 0);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
        <p className="text-surface-200/60">All payments across the system</p>
      </motion.div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="input-field pl-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-surface-800/80 rounded-xl border border-white/[0.06]">
            <Filter className="w-4 h-4 text-surface-200/30 ml-2" />
            {(["all", "passenger_payment", "union_payment"] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t
                      ? "bg-primary-600 text-white"
                      : "text-surface-200/50 hover:text-white"
                  }`}
                >
                  {t === "all"
                    ? "All"
                    : t === "passenger_payment"
                      ? "Fares"
                      : "Levies"}
                </button>
              ),
            )}
          </div>

          {/* Status Filter Implementation */}
          <div className="flex items-center gap-1 p-1 bg-surface-800/80 rounded-xl border border-white/[0.06]">
            {(["all", "completed", "pending", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  statusFilter === s
                    ? "bg-primary-600 text-white"
                    : "text-surface-200/50 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 glass-card mb-4">
        <span className="text-sm text-surface-200/50">
          {filtered.length} transactions
        </span>
        <span className="text-sm font-bold text-white">
          Total: ₦{totalAmount.toLocaleString()}
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          tx.type === "passenger_payment"
                            ? "bg-primary-400/15 text-primary-300"
                            : "bg-emerald-400/15 text-emerald-300"
                        }`}
                      >
                        {tx.passengerName[0]}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {tx.passengerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        tx.type === "passenger_payment"
                          ? "text-primary-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {tx.type === "passenger_payment" ? (
                        <Car className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {tx.type === "passenger_payment" ? "Fare" : "Levy"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">
                    ₦{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === "completed" ? (
                      <span className="badge-success flex items-center w-fit">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                      </span>
                    ) : tx.status === "pending" ? (
                      <span className="badge-warning flex items-center w-fit">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    ) : (
                      <span className="badge-danger flex items-center w-fit">
                        <XCircle className="w-3 h-3 mr-1" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/40">
                    {new Date(tx.timestamp).toLocaleString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-surface-200/30"
                  >
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
