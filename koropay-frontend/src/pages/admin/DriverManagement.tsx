import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Car,
  Phone,
  User,
  MapPin,
  MoreVertical,
  CheckCircle2,
  XCircle,
  WifiOff,
  X,
  Lock,
} from 'lucide-react';
import { mockDrivers, type DriverRecord } from '../../data/drivers';
import { useAuth } from '../../context/AuthContext';

export default function DriverManagement() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [drivers, setDrivers] = useState<DriverRecord[]>(mockDrivers);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Add driver form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newRoute, setNewRoute] = useState('');

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
    d.route.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const driver: DriverRecord = {
      id: `d${Date.now()}`,
      name: newName,
      phone: newPhone,
      vehiclePlate: newPlate,
      route: newRoute,
      status: 'active',
      totalEarnings: 0,
      totalTrips: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setDrivers([driver, ...drivers]);
    registerUser({ name: newName, phone: newPhone, password: newPassword, role: 'driver' });
    setNewName('');
    setNewPhone('');
    setNewPassword('');
    setNewPlate('');
    setNewRoute('');
    setShowAddModal(false);
  };

  const toggleStatus = (id: string, status: DriverRecord['status']) => {
    setDrivers(drivers.map(d =>
      d.id === id ? { ...d, status } : d
    ));
    setMenuOpen(null);
  };

  const statusIcon = (status: DriverRecord['status']) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'offline': return <WifiOff className="w-3.5 h-3.5" />;
      case 'suspended': return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const statusClass = (status: DriverRecord['status']) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'offline': return 'badge-warning';
      case 'suspended': return 'badge-danger';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Drivers</h1>
          <p className="text-surface-200/60">{drivers.length} drivers registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Onboard Driver
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, plate, or route..."
            className="input-field pl-11"
          />
        </div>
      </motion.div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((driver, i) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="glass-card-hover p-5 relative cursor-pointer"
            onClick={() => navigate(`/admin/drivers/${driver.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-sm font-bold text-primary-300">
                  {driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{driver.name}</p>
                  <p className="text-xs text-surface-200/40">{driver.phone}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === driver.id ? null : driver.id)}
                  className="text-surface-200/30 hover:text-white transition-colors p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {menuOpen === driver.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 top-8 w-40 bg-surface-800 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-10"
                    >
                      {driver.status !== 'active' && (
                        <button
                          onClick={() => toggleStatus(driver.id, 'active')}
                          className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/[0.04] transition-colors"
                        >
                          Set Active
                        </button>
                      )}
                      {driver.status !== 'suspended' && (
                        <button
                          onClick={() => toggleStatus(driver.id, 'suspended')}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-white/[0.04] transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {driver.status !== 'offline' && (
                        <button
                          onClick={() => toggleStatus(driver.id, 'offline')}
                          className="w-full text-left px-4 py-2.5 text-sm text-amber-400 hover:bg-white/[0.04] transition-colors"
                        >
                          Set Offline
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-3.5 h-3.5 text-surface-200/30" />
                <span className="text-surface-200/60">{driver.vehiclePlate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-surface-200/30" />
                <span className="text-surface-200/60">{driver.route}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-surface-200/40">Earnings</p>
                  <p className="text-sm font-bold text-white">₦{driver.totalEarnings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200/40">Trips</p>
                  <p className="text-sm font-bold text-white">{driver.totalTrips}</p>
                </div>
              </div>
              <span className={statusClass(driver.status)}>
                {statusIcon(driver.status)}
                <span className="ml-1 capitalize">{driver.status}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Driver Modal */}
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
                <h2 className="text-xl font-bold text-white">Onboard New Driver</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-surface-200/30 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Full Name</label>
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
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Phone Number</label>
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
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Login Password</label>
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
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Vehicle Plate</label>
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
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Assigned Route</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input
                      type="text"
                      value={newRoute}
                      onChange={(e) => setNewRoute(e.target.value)}
                      placeholder="e.g. Ojuelegba → Yaba"
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
