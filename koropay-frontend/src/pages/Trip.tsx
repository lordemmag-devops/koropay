import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Clock, Users, Wallet, CheckCircle2, ArrowRight } from 'lucide-react';
import { driverApi } from '../utils/api';

const simulatedPassengers = [
  { name: 'Adebayo Ogunlesi', phone: '08011112222', drop: 'Yaba Bus Stop' },
  { name: 'Chioma Eze', phone: '08033334444', drop: 'Tejuosho Market' },
  { name: 'Fatima Abubakar', phone: '08055556666', drop: 'Lawanson Junction' },
  { name: 'Emeka Obi', phone: '08077778888' },
  { name: 'Amina Yusuf', phone: '08099990000', drop: 'Yaba Bus Stop' },
  { name: 'Segun Adeyemi', phone: '08012340001' },
  { name: 'Hauwa Bello', phone: '08012340002', drop: 'Tejuosho Market' },
];

type TripState = 'idle' | 'active' | 'summary';

export default function Trip() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [state, setState] = useState<TripState>('idle');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [_passengerIndex, setPassengerIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    driverApi.getRoutes().then(setRoutes).catch(console.error);
  }, []);

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  useEffect(() => {
    if (state === 'active') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      scheduleNextPayment();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (paymentRef.current) clearTimeout(paymentRef.current);
    };
  }, [state]);

  const scheduleNextPayment = () => {
    const delay = 3000 + Math.random() * 5000;
    paymentRef.current = setTimeout(() => {
      setPassengerIndex(prev => {
        const idx = prev;
        if (idx < simulatedPassengers.length && currentTrip) {
          const p = simulatedPassengers[idx];
          driverApi.addPayment(currentTrip.id, {
            passengerName: p.name,
            passengerPhone: p.phone,
            dropPoint: p.drop,
          }).then(payment => {
            setPayments(prev => [{ ...payment, passengerName: p.name, passengerPhone: p.phone, dropPoint: p.drop }, ...prev]);
          }).catch(console.error);
          if (idx + 1 < simulatedPassengers.length) scheduleNextPayment();
        }
        return idx + 1;
      });
    }, delay);
  };

  const handleStart = async () => {
    if (!selectedRouteId) return;
    try {
      const trip = await driverApi.startTrip(selectedRouteId);
      setCurrentTrip(trip);
      setPayments([]);
      setElapsed(0);
      setPassengerIndex(0);
      setState('active');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEnd = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (paymentRef.current) clearTimeout(paymentRef.current);
    try {
      if (currentTrip) await driverApi.endTrip(currentTrip.id);
    } catch (err: any) {
      console.error(err);
    }
    setState('summary');
  };

  const handleReset = () => {
    setState('idle');
    setPayments([]);
    setElapsed(0);
    setPassengerIndex(0);
    setSelectedRouteId('');
    setCurrentTrip(null);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const totalAmount = payments.reduce((s, p) => s + (p.amount ?? selectedRoute?.fare ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Trip</h1>
        <p className="text-surface-200/60">
          {state === 'idle' ? 'Start a new trip' : state === 'active' ? 'Trip in progress' : 'Trip summary'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto">
            <div className="glass-card p-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <Play className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-6">Start New Trip</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-surface-200/70 mb-2">Select Route</label>
                <select value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)} className="input-field">
                  <option value="">Choose a route...</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.routeName} — ₦{r.fare}</option>
                  ))}
                </select>
              </div>

              {selectedRoute && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-surface-200/50">Route</span>
                    <span className="text-sm text-white font-medium">{selectedRoute.routeName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-surface-200/50">Fixed Fare</span>
                    <span className="text-lg font-bold text-emerald-400">₦{selectedRoute.fare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-surface-200/50">Drop Points</span>
                    <span className="text-sm text-surface-200/60">{selectedRoute.dropPoints?.length ?? 0} stops</span>
                  </div>
                </motion.div>
              )}

              <button onClick={handleStart} disabled={!selectedRouteId} className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                <Play className="w-5 h-5" /> Start Trip
              </button>
            </div>
          </motion.div>
        )}

        {state === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-400">Trip in Progress</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedRoute?.routeName}</h2>
                  <p className="text-sm text-surface-200/40 mt-0.5">Fare: ₦{selectedRoute?.fare} per passenger</p>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold font-mono text-white">{formatTime(elapsed)}</p>
                    <p className="text-xs text-surface-200/40">Elapsed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-white">{payments.length}</p>
                    <p className="text-xs text-surface-200/40">Passengers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-emerald-400">₦{totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-surface-200/40">Collected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Live Payments</h3>
                  <p className="text-sm text-surface-200/40 mt-0.5">Passengers paying in real-time</p>
                </div>
                <span className="badge-success">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" /> Live
                </span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {payments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="w-8 h-8 text-surface-200/15 mx-auto mb-2" />
                    <p className="text-sm text-surface-200/40">Waiting for passengers...</p>
                  </div>
                ) : payments.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -30, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                    animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                    transition={{ duration: 0.5 }}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {p.passengerName?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{p.passengerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-surface-200/40">{p.passengerPhone}</span>
                          {p.dropPoint && <><span className="text-xs text-surface-200/20">•</span><span className="text-xs text-surface-200/40">{p.dropPoint}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">₦{p.amount ?? selectedRoute?.fare}</p>
                      <span className="badge-success text-[10px]"><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Paid</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button onClick={handleEnd} className="w-full py-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/25 transition-all flex items-center justify-center gap-2">
              <Square className="w-5 h-5" /> End Trip
            </button>
          </motion.div>
        )}

        {state === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Trip Complete!</h2>
                <p className="text-sm text-surface-200/50 mt-1">{selectedRoute?.routeName}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-white/[0.04]">
                  <Users className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{payments.length}</p>
                  <p className="text-xs text-surface-200/40">Passengers</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/[0.04]">
                  <Wallet className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-emerald-400">₦{totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-surface-200/40">Total Earned</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/[0.04]">
                  <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{formatTime(elapsed)}</p>
                  <p className="text-xs text-surface-200/40">Duration</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-sm font-medium text-surface-200/50 mb-3">Passengers</p>
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm text-white">{p.passengerName}</span>
                      {p.dropPoint && <span className="text-xs text-surface-200/30">• {p.dropPoint}</span>}
                    </div>
                    <span className="text-sm font-semibold text-white">₦{p.amount ?? selectedRoute?.fare}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleReset} className="w-full btn-primary flex items-center justify-center gap-2 py-3.5">
                Start Another Trip <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
