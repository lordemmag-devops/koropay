import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { mockRoutes } from '../data/mock';
import { paymentApi } from '../utils/api';
import type { USSDStep, DropPoint } from '../types';

// Default bank code used for demo — in production this comes from the telecom USSD session
const DEMO_BANK_CODE = '044'; // Access Bank

export default function USSDSimulator() {
  const [step, setStep] = useState<USSDStep>('idle');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<DropPoint | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resolvedName, setResolvedName] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [error, setError] = useState('');

  const activeRoute = mockRoutes.find(r => r.id === selectedRoute);

  const reset = () => {
    setStep('idle');
    setSelectedRoute(null);
    setSelectedDrop(null);
    setPhoneNumber('');
    setResolvedName('');
    setPaymentRef('');
    setError('');
  };

  const handleDial = () => {
    if (phoneNumber.trim()) {
      setStep('select_route');
    }
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRoute(routeId);
    const route = mockRoutes.find(r => r.id === routeId);
    if (route && route.dropPoints.length > 0) {
      setStep('select_drop');
    } else {
      setStep('confirm_fare');
    }
  };

  const handleSelectDrop = (dp: DropPoint) => {
    setSelectedDrop(dp);
    setStep('confirm_fare');
  };

  const handleSkipDrop = () => {
    setSelectedDrop(null);
    setStep('confirm_fare');
  };

  const handleConfirm = async () => {
    setError('');
    setStep('processing');
    try {
      const result = await paymentApi.initiateUssdPayment({
        tripId: activeRoute!.id,
        passengerPhone: phoneNumber,
        passengerBankCode: DEMO_BANK_CODE,
        dropPoint: selectedDrop?.name,
      });
      setResolvedName(result.passengerName);
      setPaymentRef(result.interswitchRef || `KP-${Date.now().toString().slice(-8)}`);
      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setStep('confirm_fare');
    }
  };

  const renderScreen = () => {
    switch (step) {
      case 'idle':
        return (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-4 animate-pulse-glow">
                <Phone className="w-7 h-7 text-primary-400" />
              </div>
              <p className="text-white font-semibold text-center mb-1">Dial USSD Code</p>
              <p className="text-xs text-surface-200/40 text-center mb-6">Enter *384*KoroPay#</p>

              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="*384*772#"
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-center text-lg font-mono placeholder-surface-200/30 focus:outline-none focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="p-4">
              <button
                onClick={handleDial}
                disabled={!phoneNumber.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                Dial
              </button>
            </div>
          </motion.div>
        );

      case 'select_route':
        return (
          <motion.div
            key="route"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col h-full"
          >
            <div className="p-4 border-b border-white/[0.06]">
              <p className="text-xs text-surface-200/40 font-mono mb-1">KoroPay USSD</p>
              <p className="text-sm text-white">Select your route:</p>
            </div>
            <div className="flex-1 p-4 space-y-2">
              {mockRoutes.map((route, i) => (
                <button
                  key={route.id}
                  onClick={() => handleSelectRoute(route.id)}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all flex justify-between items-center"
                >
                  <span>
                    <span className="text-primary-400 font-mono text-sm mr-2">{i + 1}.</span>
                    <span className="text-white text-sm">{route.routeName}</span>
                  </span>
                  <span className="text-emerald-400 text-sm font-semibold">₦{route.fare}</span>
                </button>
              ))}
            </div>
            <div className="p-4">
              <button onClick={reset} className="w-full btn-ghost text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </motion.div>
        );

      case 'select_drop':
        return (
          <motion.div
            key="drop"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col h-full"
          >
            <div className="p-4 border-b border-white/[0.06]">
              <p className="text-xs text-surface-200/40 font-mono mb-1">{activeRoute?.routeName} • ₦{activeRoute?.fare}</p>
              <p className="text-sm text-white">Where are you dropping? <span className="text-surface-200/30">(optional)</span></p>
            </div>
            <div className="flex-1 p-4 space-y-2">
              {activeRoute?.dropPoints.map((dp, i) => (
                <button
                  key={dp.id}
                  onClick={() => handleSelectDrop(dp)}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                >
                  <span className="text-primary-400 font-mono text-sm mr-2">{i + 1}.</span>
                  <span className="text-white text-sm">{dp.name}</span>
                </button>
              ))}
              <button
                onClick={handleSkipDrop}
                className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] border-dashed transition-all"
              >
                <span className="text-surface-200/50 text-sm">Skip — I'll tell the driver</span>
              </button>
            </div>
            <div className="p-4">
              <button onClick={() => setStep('select_route')} className="w-full btn-ghost text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </motion.div>
        );

      case 'confirm_fare':
        return (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col h-full"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <p className="text-xs text-surface-200/40 mb-4">Confirm Payment</p>
              <div className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-surface-200/50">Route</span>
                  <span className="text-sm text-white font-medium">{activeRoute?.routeName}</span>
                </div>
                {selectedDrop && (
                  <div className="flex justify-between">
                    <span className="text-sm text-surface-200/50">Drop Point</span>
                    <span className="text-sm text-white font-medium">{selectedDrop.name}</span>
                  </div>
                )}
                <div className="border-t border-white/[0.06] pt-3 flex justify-between">
                  <span className="text-sm text-surface-200/50">Fare</span>
                  <span className="text-xl font-bold text-emerald-400">₦{activeRoute?.fare}</span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={handleConfirm}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                Pay ₦{activeRoute?.fare}
              </button>
              {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
              <button onClick={() => setStep('select_drop')} className="w-full btn-ghost text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full px-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-primary-400" />
            </motion.div>
            <p className="text-white font-semibold mt-4">Processing Payment...</p>
            <p className="text-xs text-surface-200/40 mt-1">Please wait</p>
          </motion.div>
        );

      case 'confirmation':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <p className="text-white font-bold text-lg">Payment Successful!</p>
            <p className="text-sm text-surface-200/50 mt-1 text-center">
              ₦{activeRoute?.fare} paid for {activeRoute?.routeName}
            </p>
            {resolvedName && (
              <p className="text-xs text-primary-300 mt-0.5">Passenger: {resolvedName}</p>
            )}
            {selectedDrop && (
              <p className="text-xs text-surface-200/30 mt-0.5">
                Drop: {selectedDrop.name}
              </p>
            )}
            <p className="text-xs text-surface-200/30 mt-1">
              Ref: {paymentRef}
            </p>
            <button
              onClick={reset}
              className="mt-6 btn-primary text-sm"
            >
              New Trip
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">USSD Simulator</h1>
        <p className="text-surface-200/60">Test the passenger payment flow</p>
      </motion.div>

      <div className="flex flex-col items-center">
        {/* Phone Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 to-emerald-500/20 rounded-[3rem] blur-2xl opacity-40" />

          <div className="relative w-[320px] h-[640px] bg-surface-900 rounded-[2.5rem] border-2 border-white/[0.1] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-surface-950 rounded-b-2xl z-10" />

            <div className="relative z-10 flex items-center justify-between px-8 pt-2 pb-1">
              <span className="text-[10px] text-surface-200/50 font-medium">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 rounded-sm bg-white/30" />
                <div className="w-1 h-2 rounded-sm bg-white/30" />
                <div className="w-1 h-2 rounded-sm bg-white/30" />
              </div>
            </div>

            <div className="h-[calc(100%-3rem)] pt-4">
              <AnimatePresence mode="wait">
                {renderScreen()}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 mt-8"
        >
          {(['idle', 'select_route', 'select_drop', 'confirm_fare', 'confirmation'] as const).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === s
                  ? 'w-8 bg-primary-500'
                  : (['idle', 'select_route', 'select_drop', 'confirm_fare', 'confirmation'] as const).indexOf(step as 'idle' | 'select_route' | 'select_drop' | 'confirm_fare' | 'confirmation') > i
                  ? 'w-1.5 bg-primary-500/50'
                  : 'w-1.5 bg-surface-700'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
