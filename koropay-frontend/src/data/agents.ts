export interface AgentRecord {
  id: string;
  name: string;
  phone: string;
  location: string;
  checkpoint: string;
  fee: number;
  status: 'active' | 'inactive';
  totalCollected: number;
  totalScans: number;
  joinedDate: string;
}

export const mockAgents: AgentRecord[] = [
  {
    id: 'AG-001',
    name: 'Ibrahim Sule',
    phone: '08099887766',
    location: 'Ojuelegba Under Bridge',
    checkpoint: 'Ojuelegba Checkpoint',
    fee: 500,
    status: 'active',
    totalCollected: 245000,
    totalScans: 490,
    joinedDate: '2026-01-10',
  },
  {
    id: 'AG-002',
    name: 'Blessing Okoro',
    phone: '07044556677',
    location: 'Yaba Bus Terminal',
    checkpoint: 'Yaba Tollgate',
    fee: 350,
    status: 'active',
    totalCollected: 178500,
    totalScans: 510,
    joinedDate: '2026-01-22',
  },
  {
    id: 'AG-003',
    name: 'Aliyu Danjuma',
    phone: '09033221100',
    location: 'Maryland Mall Junction',
    checkpoint: 'Maryland Checkpoint',
    fee: 450,
    status: 'active',
    totalCollected: 162000,
    totalScans: 360,
    joinedDate: '2026-02-05',
  },
  {
    id: 'AG-004',
    name: 'Funke Adeyemi',
    phone: '08166554433',
    location: 'Oshodi Underbridge',
    checkpoint: 'Oshodi Checkpoint',
    fee: 400,
    status: 'inactive',
    totalCollected: 56000,
    totalScans: 140,
    joinedDate: '2026-03-01',
  },
];
