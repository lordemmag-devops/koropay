import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Trash2, CheckCircle2, XCircle, Edit3, Save, X } from 'lucide-react';
import { adminApi } from '../../utils/api';

export default function LevySettings() {
  const [levies, setLevies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLevies = () =>
    adminApi.getLevySettings()
      .then(setLevies)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchLevies(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createLevySetting({ levyName: newName, amount: Number(newAmount), location: newLocation });
      setNewName(''); setNewAmount(''); setNewLocation('');
      setShowForm(false);
      fetchLevies();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await adminApi.updateLevySetting(id, { active: !active });
      setLevies(levies.map(l => l.id === id ? { ...l, active: !active } : l));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteLevi = async (id: string) => {
    try {
      await adminApi.deleteLevySetting(id);
      setLevies(levies.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const saveEdit = async (id: string) => {
    try {
      await adminApi.updateLevySetting(id, { amount: Number(editAmount) });
      setLevies(levies.map(l => l.id === id ? { ...l, amount: Number(editAmount) } : l));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalActive = levies.filter(l => l.active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Levy Settings</h1>
          <p className="text-surface-200/60">Define and manage union levy prices centrally</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Levy
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <p className="text-sm text-white font-medium">Centrally controlled pricing</p>
          <p className="text-xs text-surface-200/40">Levy amounts set here are used by all agents.</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-lg font-bold text-white">{totalActive}</p>
          <p className="text-xs text-surface-200/40">Active levies</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleCreate} className="glass-card p-6 mb-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Levy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">Levy Name</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. NURTW Daily Levy" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40">₦</span>
                  <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="500" className="input-field pl-8" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-2">Location (optional)</label>
                <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Ojuelegba Checkpoint" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">{submitting ? 'Creating...' : 'Create Levy'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {levies.map((levy, i) => (
          <motion.div key={levy.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className={`glass-card-hover p-5 transition-opacity ${!levy.active ? 'opacity-50' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${levy.active ? 'bg-emerald-500/15' : 'bg-surface-800'}`}>
                  {levy.active ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-surface-200/30" />}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{levy.levyName}</p>
                  {levy.location && <p className="text-xs text-surface-200/40 mt-0.5">{levy.location}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {editingId === levy.id ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-24 sm:w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-200/40 text-sm">₦</span>
                      <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="input-field pl-7 text-sm py-2" autoFocus />
                    </div>
                    <button onClick={() => saveEdit(levy.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-surface-200/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-bold text-white">₦{levy.amount.toLocaleString()}</span>
                    <button onClick={() => { setEditingId(levy.id); setEditAmount(String(levy.amount)); }} className="text-surface-200/30 hover:text-primary-400 transition-colors"><Edit3 className="w-4 h-4" /></button>
                  </>
                )}

                <button onClick={() => toggleActive(levy.id, levy.active)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${levy.active ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-surface-800 text-surface-200/40 hover:bg-surface-700'}`}>
                  {levy.active ? 'Active' : 'Inactive'}
                </button>

                <button onClick={() => deleteLevi(levy.id)} className="text-surface-200/20 hover:text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
