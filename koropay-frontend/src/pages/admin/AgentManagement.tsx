import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Shield,
  Phone,
  User,
  MapPin,
  MoreVertical,
  CheckCircle2,
  XCircle,
  X,
  QrCode,
  Wallet,
  Lock,
} from 'lucide-react';
import { mockAgents, type AgentRecord } from '../../data/agents';
import { useAuth } from '../../context/AuthContext';

export default function AgentManagement() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [agents, setAgents] = useState<AgentRecord[]>(mockAgents);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCheckpoint, setNewCheckpoint] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFee, setNewFee] = useState('');

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.checkpoint.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const agent: AgentRecord = {
      id: `AG-${String(agents.length + 1).padStart(3, '0')}`,
      name: newName,
      phone: newPhone,
      checkpoint: newCheckpoint,
      location: newLocation,
      fee: Number(newFee),
      status: 'active',
      totalCollected: 0,
      totalScans: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setAgents([agent, ...agents]);
    registerUser({ name: newName, phone: newPhone, password: newPassword, role: 'agent' });
    setNewName('');
    setNewPhone('');
    setNewPassword('');
    setNewCheckpoint('');
    setNewLocation('');
    setNewFee('');
    setShowAddModal(false);
  };

  const toggleStatus = (id: string, status: AgentRecord['status']) => {
    setAgents(agents.map(a =>
      a.id === id ? { ...a, status } : a
    ));
    setMenuOpen(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Agents</h1>
          <p className="text-surface-200/60">{agents.length} checkpoint agents registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Onboard Agent
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
            placeholder="Search by name, checkpoint, or location..."
            className="input-field pl-11"
          />
        </div>
      </motion.div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="glass-card-hover p-5 relative cursor-pointer"
            onClick={() => navigate(`/admin/agents/${agent.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{agent.name}</p>
                  <p className="text-xs text-surface-200/40">{agent.id} • {agent.phone}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === agent.id ? null : agent.id)}
                  className="text-surface-200/30 hover:text-white transition-colors p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {menuOpen === agent.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 top-8 w-40 bg-surface-800 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-10"
                    >
                      {agent.status === 'active' ? (
                        <button
                          onClick={() => toggleStatus(agent.id, 'inactive')}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-white/[0.04] transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus(agent.id, 'active')}
                          className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/[0.04] transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <QrCode className="w-3.5 h-3.5 text-surface-200/30" />
                <span className="text-surface-200/60">{agent.checkpoint}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-surface-200/30" />
                <span className="text-surface-200/60">{agent.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-surface-200/40">Collected</p>
                  <p className="text-sm font-bold text-white">₦{agent.totalCollected.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200/40">Scans</p>
                  <p className="text-sm font-bold text-white">{agent.totalScans}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200/40">Fee</p>
                  <p className="text-sm font-bold text-emerald-400">₦{agent.fee}</p>
                </div>
              </div>
              <span className={agent.status === 'active' ? 'badge-success' : 'badge-danger'}>
                {agent.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                <span className="capitalize">{agent.status}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Agent Modal */}
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
                <h2 className="text-xl font-bold text-white">Onboard New Agent</h2>
                <button onClick={() => setShowAddModal(false)} className="text-surface-200/30 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAgent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Agent Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Agent's full name" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="080XXXXXXXX" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Login Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Set login password" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Checkpoint Name</label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input type="text" value={newCheckpoint} onChange={(e) => setNewCheckpoint(e.target.value)} placeholder="e.g. Ojuelegba Checkpoint" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Ojuelegba Under Bridge" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Levy Fee (₦)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                    <input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} placeholder="500" className="input-field pl-11" required />
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary mt-2">
                  Onboard Agent
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
