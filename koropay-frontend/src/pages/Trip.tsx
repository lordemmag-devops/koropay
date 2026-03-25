import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";


interface Route {
  id: string;
  routeName: string;
  fare: number;
}

interface TripData {
  id: string;
  route?: {
    routeName: string;
  };
  fare: number;
  totalPassengers: number;
  totalAmount: number;
}

const API_BASE = "http://localhost:5000/api";

const simulatedPassengers = [
  { name: "Adebayo Ogunlesi", phone: "08011112222", drop: "Yaba Bus Stop" },
  { name: "Chioma Eze", phone: "08033334444", drop: "Tejuosho Market" },
  { name: "Fatima Abubakar", phone: "08055556666", drop: "Lawanson Junction" },
];

type TripState = "idle" | "active" | "summary";

export default function Trip() {
  const { user } = useAuth();
  const [state, setState] = useState<TripState>("idle");
  const [routes, setRoutes] = useState<Route[]>([]); // Replaced any[]
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null); // Replaced any
  const [payments, setPayments] = useState<any[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  // FIX: Use 'number' for browser-based timers instead of NodeJS.Timeout
  const timerRef = useRef<number | null>(null);
  const paymentRef = useRef<number | null>(null);

  const activeTripRef = useRef<TripData | null>(null); // Replaced any

  useEffect(() => {
    activeTripRef.current = activeTrip;
  }, [activeTrip]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver/routes`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setRoutes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch routes", err);
      }
    };
    if (user?.token) fetchRoutes();
  }, [user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (paymentRef.current) clearTimeout(paymentRef.current);
    };
  }, []);

  const scheduleNextPayment = useCallback(
    (index: number) => {
      if (index >= simulatedPassengers.length) return;

      // window.setTimeout ensures the return type is a number
      paymentRef.current = window.setTimeout(async () => {
        const p = simulatedPassengers[index];
        const currentTripId = activeTripRef.current?.id;

        if (!currentTripId) return;

        try {
          const res = await fetch(
            `${API_BASE}/driver/trips/${currentTripId}/payments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`,
              },
              body: JSON.stringify({
                passengerName: p.name,
                passengerPhone: p.phone,
                dropPoint: p.drop || "General",
              }),
            },
          );

          const newPayment = await res.json();
          if (res.ok) {
            setPayments((prev) => [newPayment, ...prev]);

            setActiveTrip((prev: TripData | null) => {
              if (!prev) return null;
              return {
                ...prev,
                totalPassengers: (prev.totalPassengers || 0) + 1,
                totalAmount: (prev.totalAmount || 0) + (prev.fare || 0),
              };
            });

            scheduleNextPayment(index + 1);
          }
        } catch (err) {
          console.error("Payment failed", err);
        }
      }, 5000);
    },
    [user?.token],
  );

  const handleStart = async () => {
    if (!selectedRouteId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ routeId: selectedRouteId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to start trip");

      setActiveTrip(data);
      setPayments([]);
      setElapsed(0);
      setState("active");

      if (timerRef.current) clearInterval(timerRef.current);
      // window.setInterval ensures the return type is a number
      timerRef.current = window.setInterval(
        () => setElapsed((e) => e + 1),
        1000,
      );

      scheduleNextPayment(0);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!activeTrip?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/trips/${activeTrip.id}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setActiveTrip(data);
        setState("summary");
        if (timerRef.current) clearInterval(timerRef.current);
        if (paymentRef.current) clearTimeout(paymentRef.current);
      } else {
        throw new Error(data.message || "Failed to end trip");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Design and JSX remain identical to your original code */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Trip</h1>
        <p className="text-surface-200/60">
          {state === "idle"
            ? "Start a new trip"
            : state === "active"
              ? "Trip in progress"
              : "Trip summary"}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" className="max-w-lg mx-auto">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <Play className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-6">
                Start New Trip
              </h2>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="input-field mb-6"
              >
                <option value="">Choose a route...</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeName} — ₦{r.fare}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStart}
                disabled={!selectedRouteId || loading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}{" "}
                Start Trip
              </button>
            </div>
          </motion.div>
        )}

        {state === "active" && (
          <motion.div key="active">
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-400">
                      Trip in Progress
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {activeTrip?.route?.routeName || "Active Route"}
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono text-white">
                      {formatTime(elapsed)}
                    </p>
                    <p className="text-xs text-surface-200/40">Elapsed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {activeTrip?.totalPassengers || 0}
                    </p>
                    <p className="text-xs text-surface-200/40">Passengers</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleEnd}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Square className="w-5 h-5" />
              )}{" "}
              End Trip
            </button>
          </motion.div>
        )}

        {state === "summary" && (
          <motion.div key="summary" className="max-w-2xl mx-auto">
            <div className="glass-card p-8 text-center">
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Trip Complete!</h2>
              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="bg-white/[0.04] p-4 rounded-xl">
                  <p className="text-xl font-bold text-white">
                    {activeTrip?.totalPassengers || 0}
                  </p>
                  <p className="text-xs text-surface-200/40">Passengers</p>
                </div>
                <div className="bg-white/[0.04] p-4 rounded-xl">
                  <p className="text-xl font-bold text-emerald-400">
                    ₦{activeTrip?.totalAmount || 0}
                  </p>
                  <p className="text-xs text-surface-200/40">Total Earned</p>
                </div>
                <div className="bg-white/[0.04] p-4 rounded-xl">
                  <p className="text-xl font-bold text-white">
                    {formatTime(elapsed)}
                  </p>
                  <p className="text-xs text-surface-200/40">Duration</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setState("idle");
                  setSelectedRouteId("");
                }}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
              >
                Start Another Trip <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
