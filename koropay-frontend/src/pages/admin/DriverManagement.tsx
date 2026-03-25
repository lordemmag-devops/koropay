import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Car,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  WifiOff,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Define interfaces to resolve 'any' errors
interface DriverRecord {
  id: string;
  vehiclePlate: string;
  route: string;
  status: "active" | "offline" | "suspended";
  totalEarnings: number;
  totalTrips: number;
  user: {
    name: string;
    phone: string;
  };
}

export default function DriverManagement() {
  const navigate = useNavigate();
  const { user } = useAuth(); //
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newRoute, setNewRoute] = useState("");

  const fetchDrivers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/drivers", {
        headers: { Authorization: `Bearer ${user?.token}` },
      }); //
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchDrivers();
  }, [user]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          password: newPassword,
          role: "driver",
          vehiclePlate: newPlate,
          route: newRoute,
        }),
      }); //

      if (res.ok) {
        setShowAddModal(false);
        fetchDrivers();
        setNewName("");
        setNewPhone("");
        setNewPassword("");
        setNewPlate("");
        setNewRoute("");
      } else {
        const err = await res.json();
        alert(err.message || "Registration failed");
      }
    } catch (err) {
      alert("Network error occurred");
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "offline":
        return <WifiOff className="w-3.5 h-3.5" />;
      default:
        return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Drivers</h1>
          <p className="text-surface-200/60">
            {drivers.length} drivers registered
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Onboard Driver
        </button>
      </motion.div>

      {/* Search Input Implementation */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or plate..."
          className="input-field pl-11"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers
          .filter(
            (d) =>
              d.user.name.toLowerCase().includes(search.toLowerCase()) ||
              d.vehiclePlate.toLowerCase().includes(search.toLowerCase()),
          )
          .map((driver) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-hover p-5 relative cursor-pointer"
              onClick={() => navigate(`/admin/drivers/${driver.id}`)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-300 font-bold">
                  {driver.user.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold">{driver.user.name}</p>
                  <p className="text-xs text-surface-200/40">
                    {driver.user.phone}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-surface-200/60">
                  <Car className="w-3.5 h-3.5 text-surface-200/30" />{" "}
                  {driver.vehiclePlate}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-200/60">
                  <MapPin className="w-3.5 h-3.5 text-surface-200/30" />{" "}
                  {driver.route || "No route assigned"}
                </div>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-3">
                <div>
                  <p className="text-xs text-surface-200/40">Earnings</p>
                  <p className="text-sm font-bold text-white">
                    ₦{driver.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`badge-${driver.status === "active" ? "success" : "warning"} flex items-center gap-1 capitalize`}
                >
                  {statusIcon(driver.status)} {driver.status}
                </span>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Add Driver Modal Implementation */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Onboard New Driver
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-surface-200/30 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Driver's full name"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="080XXXXXXXX"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">
                    Login Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Set login password"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">
                    Vehicle Plate
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input
                      type="text"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      placeholder="ABC-123-XY"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">
                    Assigned Route
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input
                      type="text"
                      value={newRoute}
                      onChange={(e) => setNewRoute(e.target.value)}
                      placeholder="e.g. Oshodi → Yaba"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary mt-2">
                  Onboard Driver
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
