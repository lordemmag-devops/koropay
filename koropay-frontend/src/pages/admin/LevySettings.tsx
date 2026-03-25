import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Interface to resolve 'any' issues
interface LevySetting {
  id: string;
  levyName: string;
  amount: number;
  location?: string;
  active: boolean;
}

export default function LevySettings() {
  const { user } = useAuth();
  const [levies, setLevies] = useState<LevySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New levy form state
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Edit form state
  const [editAmount, setEditAmount] = useState("");

  const fetchLevies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/levy-settings", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      setLevies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch levies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchLevies();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/levy-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          levyName: newName,
          amount: Number(newAmount),
          location: newLocation,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setNewName("");
        setNewAmount("");
        setNewLocation("");
        fetchLevies();
      }
    } catch (err) {
      alert("Failed to create levy");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/admin/levy-settings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      fetchLevies();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const deleteLevy = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this levy?")) return;
    try {
      await fetch(`http://localhost:5000/api/admin/levy-settings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      fetchLevies();
    } catch (err) {
      alert("Failed to delete levy");
    }
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/levy-settings/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ amount: Number(editAmount) }),
        },
      );
      if (res.ok) {
        setEditingId(null);
        fetchLevies();
      }
    } catch (err) {
      alert("Failed to update amount");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500 w-10 h-10" />
      </div>
    );

  const totalActive = levies.filter((l) => l.active).length;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Levy Settings</h1>
          <p className="text-surface-200/60">
            Define and manage union levy prices centrally
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Add Levy"}
        </button>
      </motion.div>

      {/* Info Banner */}
      <div className="glass-card p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <p className="text-sm text-white font-medium">
            Centrally controlled pricing
          </p>
          <p className="text-xs text-surface-200/40">
            Levy amounts set here are used by all agents across the system.
          </p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-lg font-bold text-white">{totalActive}</p>
          <p className="text-xs text-surface-200/40">Active levies</p>
        </div>
      </div>

      {/* New Levy Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="glass-card p-6 mb-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Add New Levy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">
                  Levy Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. NURTW Daily Levy"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">
                  Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="500"
                    className="input-field pl-8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Oshodi Terminal"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Levy
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

      {/* Levy List */}
      <div className="space-y-3">
        {levies.map((levy, i) => (
          <motion.div
            key={levy.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card-hover p-5 transition-opacity ${!levy.active ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${levy.active ? "bg-emerald-500/15" : "bg-surface-800"}`}
                >
                  {levy.active ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-surface-200/30" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {levy.levyName}
                  </p>
                  {levy.location && (
                    <p className="text-xs text-surface-200/40 mt-0.5">
                      {levy.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {editingId === levy.id ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-200/40 text-sm">
                        ₦
                      </span>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="input-field pl-7 text-sm py-2"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => saveEdit(levy.id)}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-surface-200/30 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-bold text-white">
                      ₦{levy.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(levy.id);
                        setEditAmount(String(levy.amount));
                      }}
                      className="text-surface-200/30 hover:text-primary-400"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => toggleActive(levy.id, levy.active)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    levy.active
                      ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                      : "bg-surface-800 text-surface-200/40 hover:bg-surface-700"
                  }`}
                >
                  {levy.active ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => deleteLevy(levy.id)}
                  className="text-surface-200/20 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {levies.length === 0 && !loading && (
          <div className="text-center py-20 text-surface-200/30 border-2 border-dashed border-white/5 rounded-2xl">
            No levy settings found. Click "Add Levy" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
