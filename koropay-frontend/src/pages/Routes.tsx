import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Trash2,
  ChevronRight,
  Route as RouteIcon,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Routes() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [newFare, setNewFare] = useState("");
  const [newDropPoints, setNewDropPoints] = useState<{ name: string }[]>([
    { name: "" },
  ]);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/driver/routes", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setRoutes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchRoutes();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/driver/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        routeName: newRouteName,
        fare: newFare,
        dropPoints: newDropPoints.filter((dp) => dp.name),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setNewRouteName("");
      setNewFare("");
      setNewDropPoints([{ name: "" }]);
      fetchRoutes();
    }
  };

  const deleteRoute = async (id: string) => {
    await fetch(`http://localhost:5000/api/driver/routes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    fetchRoutes();
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-primary-500" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Routes</h1>
          <p className="text-surface-200/60">
            Manage your routes and fixed fares
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Route
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-8 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                placeholder="Route Name"
                className="input-field"
                required
              />
              <input
                type="number"
                value={newFare}
                onChange={(e) => setNewFare(e.target.value)}
                placeholder="Fare (₦)"
                className="input-field"
                required
              />
            </div>
            {newDropPoints.map((dp, i) => (
              <input
                key={i}
                type="text"
                value={dp.name}
                onChange={(e) => {
                  const updated = [...newDropPoints];
                  updated[i].name = e.target.value;
                  setNewDropPoints(updated);
                }}
                placeholder={`Stop ${i + 1}`}
                className="input-field mb-2"
              />
            ))}
            <button
              type="button"
              onClick={() => setNewDropPoints([...newDropPoints, { name: "" }])}
              className="text-primary-400 text-sm mb-4"
            >
              + Add Stop
            </button>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Create
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

      <div className="space-y-4">
        {routes.map((route) => (
          <div key={route.id} className="glass-card overflow-hidden">
            <button
              onClick={() =>
                setExpandedRoute(expandedRoute === route.id ? null : route.id)
              }
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-4">
                <RouteIcon className="w-5 h-5 text-primary-400" />
                <div>
                  <h3 className="text-white font-semibold">
                    {route.routeName}
                  </h3>
                  <p className="text-sm text-surface-200/50">
                    {route.dropPoints.length} stops
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-emerald-400">
                  ₦{route.fare}
                </span>
                <ChevronRight
                  className={expandedRoute === route.id ? "rotate-90" : ""}
                />
              </div>
            </button>
            {expandedRoute === route.id && (
              <div className="p-5 border-t border-white/5 bg-white/[0.02]">
                {route.dropPoints.map((dp: any) => (
                  <div
                    key={dp.id}
                    className="text-sm text-surface-200/70 py-1 flex items-center gap-2"
                  >
                    <MapPin className="w-3 h-3" /> {dp.name}
                  </div>
                ))}
                <button
                  onClick={() => deleteRoute(route.id)}
                  className="text-rose-400 text-xs mt-4 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
