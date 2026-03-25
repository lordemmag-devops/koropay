import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MapPin,
  Trash2,
  ChevronRight,
  Route as RouteIcon,
  Wallet,
} from 'lucide-react';
import { mockRoutes } from '../data/mock';
import type { Route } from '../types';

export default function Routes() {
  const [routes, setRoutes] = useState<Route[]>(mockRoutes);
  const [showForm, setShowForm] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newFare, setNewFare] = useState('');
  const [newDropPoints, setNewDropPoints] = useState<{ name: string }[]>([
    { name: '' },
  ]);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(routes[0]?.id ?? null);

  const addDropPointField = () => {
    setNewDropPoints([...newDropPoints, { name: '' }]);
  };

  const removeDropPointField = (index: number) => {
    setNewDropPoints(newDropPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: Route = {
      id: Date.now().toString(),
      driverId: 'd1',
      routeName: newRouteName,
      fare: Number(newFare),
      dropPoints: newDropPoints
        .filter(dp => dp.name)
        .map((dp, i) => ({
          id: `new-${Date.now()}-${i}`,
          routeId: Date.now().toString(),
          name: dp.name,
        })),
    };
    setRoutes([...routes, newRoute]);
    setNewRouteName('');
    setNewFare('');
    setNewDropPoints([{ name: '' }]);
    setShowForm(false);
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Routes</h1>
          <p className="text-surface-200/60">Manage your routes and fixed fares</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Route
        </button>
      </motion.div>

      {/* New Route Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-8 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Create New Route</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">
                  Route Name
                </label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Oshodi → Yaba"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">
                  Fixed Fare (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40">₦</span>
                  <input
                    type="number"
                    value={newFare}
                    onChange={(e) => setNewFare(e.target.value)}
                    placeholder="300"
                    className="input-field pl-8"
                    required
                  />
                </div>
                <p className="text-[11px] text-surface-200/30 mt-1">Same fare for all passengers on this route</p>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium text-surface-200/70">Drop Points</label>
                  <span className="text-xs text-surface-200/30 ml-2">(optional, for record-keeping)</span>
                </div>
                <button
                  type="button"
                  onClick={addDropPointField}
                  className="text-primary-400 text-sm hover:text-primary-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Stop
                </button>
              </div>
              <div className="space-y-3">
                {newDropPoints.map((dp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-center"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={dp.name}
                      onChange={(e) => {
                        const updated = [...newDropPoints];
                        updated[i].name = e.target.value;
                        setNewDropPoints(updated);
                      }}
                      placeholder="Stop name (e.g. Lawanson Junction)"
                      className="input-field flex-1"
                    />
                    {newDropPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDropPointField(i)}
                        className="text-surface-200/30 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Route
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Routes List */}
      <div className="space-y-4">
        {routes.map((route, ri) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ri * 0.1 }}
            className="glass-card-hover overflow-hidden"
          >
            <button
              onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-emerald-500/20 flex items-center justify-center">
                  <RouteIcon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{route.routeName}</h3>
                  <p className="text-sm text-surface-200/50">
                    {route.dropPoints.length} stops
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
                    ₦{route.fare}
                  </span>
                  <span className="text-xs text-surface-200/30">fixed fare</span>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-surface-200/30 transition-transform duration-300 ${
                    expandedRoute === route.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {expandedRoute === route.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-white/[0.04]">
                    <div className="pt-4 space-y-3">
                      {route.dropPoints.map((dp, i) => (
                        <div key={dp.id} className="flex items-center gap-4">
                          <div className="relative flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-surface-800 border border-white/[0.1] flex items-center justify-center">
                              <MapPin className="w-3.5 h-3.5 text-primary-400" />
                            </div>
                            {i < route.dropPoints.length - 1 && (
                              <div className="w-[2px] h-6 bg-gradient-to-b from-primary-500/20 to-transparent mt-1" />
                            )}
                          </div>
                          <span className="text-sm text-white">{dp.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => deleteRoute(route.id)}
                        className="text-sm text-surface-200/30 hover:text-rose-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Route
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
