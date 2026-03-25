import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Shield, Phone, User, MapPin, MoreVertical, CheckCircle2, XCircle, X, QrCode, Lock, Building2 } from 'lucide-react';
import { adminApi, paymentApi } from '../../utils/api';

const FALLBACK_BANKS = [
  { bankCode: '044', bankName: 'Access Bank' },
  { bankCode: '023', bankName: 'Citibank' },
  { bankCode: '050', bankName: 'EcoBank' },
  { bankCode: '011', bankName: 'First Bank' },
  { bankCode: '214', bankName: 'First City Monument Bank (FCMB)' },
  { bankCode: '070', bankName: 'Fidelity Bank' },
  { bankCode: '058', bankName: 'Guaranty Trust Bank (GTBank)' },
  { bankCode: '030', bankName: 'Heritage Bank' },
  { bankCode: '301', bankName: 'Jaiz Bank' },
  { bankCode: '082', bankName: 'Keystone Bank' },
  { bankCode: '526', bankName: 'Moniepoint MFB' },
  { bankCode: '076', bankName: 'Polaris Bank' },
  { bankCode: '101', bankName: 'Providus Bank' },
  { bankCode: '221', bankName: 'Stanbic IBTC Bank' },
  { bankCode: '068', bankName: 'Standard Chartered Bank' },
  { bankCode: '232', bankName: 'Sterling Bank' },
  { bankCode: '100', bankName: 'Suntrust Bank' },
  { bankCode: '032', bankName: 'Union Bank' },
  { bankCode: '033', bankName: 'United Bank for Africa (UBA)' },
  { bankCode: '215', bankName: 'Unity Bank' },
  { bankCode: '035', bankName: 'Wema Bank' },
  { bankCode: '057', bankName: 'Zenith Bank' },
  { bankCode: '627', bankName: 'Kuda MFB' },
  { bankCode: '090405', bankName: 'Opay' },
  { bankCode: '090110', bankName: 'PalmPay' },
];

export default function AgentManagement() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [banks, setBanks] = useState<{ bankCode: string; bankName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCheckpoint, setNewCheckpoint] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBankCode, setNewBankCode] = useState('');

  const fetchAgents = (q?: string) =>
    adminApi.getAgents(q)
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchAgents(); }, []);
  useEffect(() => {
    paymentApi.getBanks()
      .then(data => setBanks(data.length > 0 ? data : FALLBACK_BANKS))
      .catch(() => setBanks(FALLBACK_BANKS));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchAgents(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createAgent({ name: newName, phone: newPhone, password: newPassword, checkpoint: newCheckpoint, location: newLocation, accountNumber: newAccountNumber, bankCode: newBankCode });
      setNewName(''); setNewPhone(''); setNewPassword(''); setNewCheckpoint(''); setNewLocation(''); setNewAccountNumber(''); setNewBankCode('');
      setShowAddModal(false);
      fetchAgents();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateAgentStatus(id, status);
      setAgents(agents.map(a => a.id === id ? { ...a, status } : a));
    } catch (err: any) {
      alert(err.message);
    }
    setMenuOpen(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Agents</h1>
          <p className="text-surface-200/60">{agents.length} checkpoint agents registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Onboard Agent
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, checkpoint, or location..." className="input-field pl-11" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, i) => (
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
                  <p className="text-white font-semibold text-sm">{agent.user?.name}</p>
                  <p className="text-xs text-surface-200/40">{agent.id} • {agent.user?.phone}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === agent.id ? null : agent.id); }} className="text-surface-200/30 hover:text-white transition-colors p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {menuOpen === agent.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-8 w-40 bg-surface-800 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-10" onClick={e => e.stopPropagation()}>
                      {agent.status === 'active'
                        ? <button onClick={() => toggleStatus(agent.id, 'inactive')} className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-white/[0.04] transition-colors">Deactivate</button>
                        : <button onClick={() => toggleStatus(agent.id, 'active')} className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/[0.04] transition-colors">Activate</button>
                      }
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
                  <p className="text-sm font-bold text-white">₦{(agent.totalCollected ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-200/40">Scans</p>
                  <p className="text-sm font-bold text-white">{agent.totalScans ?? 0}</p>
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

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-card p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Onboard New Agent</h2>
                <button onClick={() => setShowAddModal(false)} className="text-surface-200/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddAgent} className="space-y-4">
                {[
                  { label: 'Agent Name', value: newName, setter: setNewName, placeholder: "Agent's full name", icon: User, type: 'text' },
                  { label: 'Phone Number', value: newPhone, setter: setNewPhone, placeholder: '080XXXXXXXX', icon: Phone, type: 'tel' },
                  { label: 'Login Password', value: newPassword, setter: setNewPassword, placeholder: 'Set login password', icon: Lock, type: 'password' },
                  { label: 'Checkpoint Name', value: newCheckpoint, setter: setNewCheckpoint, placeholder: 'e.g. Ojuelegba Checkpoint', icon: Shield, type: 'text' },
                  { label: 'Location', value: newLocation, setter: setNewLocation, placeholder: 'e.g. Ojuelegba Under Bridge', icon: MapPin, type: 'text' },
                  { label: 'Account Number', value: newAccountNumber, setter: setNewAccountNumber, placeholder: '0123456789', icon: Building2, type: 'text' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium text-surface-200/70 mb-2">{field.label}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                      <input type={field.type} value={field.value} onChange={(e) => field.setter(e.target.value)} placeholder={field.placeholder} className="input-field pl-11" required />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-surface-200/70 mb-2">Bank</label>
                  <select value={newBankCode} onChange={(e) => setNewBankCode(e.target.value)} className="input-field" required>
                    <option value="">Select bank...</option>
                    {banks.map(b => (
                      <option key={b.bankCode} value={b.bankCode}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full btn-primary mt-2 disabled:opacity-60">
                  {submitting ? 'Onboarding...' : 'Onboard Agent'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
