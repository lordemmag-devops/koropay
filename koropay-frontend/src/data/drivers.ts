export interface DriverRecord {
  id: string;
  name: string;
  phone: string;
  vehiclePlate: string;
  route: string;
  status: 'active' | 'offline' | 'suspended';
  totalEarnings: number;
  totalTrips: number;
  joinedDate: string;
}

export const mockDrivers: DriverRecord[] = [
  {
    id: 'd1',
    name: 'Ade Ogunbiyi',
    phone: '08012345678',
    vehiclePlate: 'ABC-123-XY',
    route: 'Ojuelegba → Yaba',
    status: 'active',
    totalEarnings: 87500,
    totalTrips: 142,
    joinedDate: '2026-01-15',
  },
  {
    id: 'd2',
    name: 'Musa Ibrahim',
    phone: '08098765432',
    vehiclePlate: 'LND-456-KJ',
    route: 'CMS → Lekki Phase 1',
    status: 'active',
    totalEarnings: 64200,
    totalTrips: 98,
    joinedDate: '2026-02-03',
  },
  {
    id: 'd3',
    name: 'Chidi Nwosu',
    phone: '07033445566',
    vehiclePlate: 'KTU-789-AB',
    route: 'Ikeja → Maryland',
    status: 'offline',
    totalEarnings: 51800,
    totalTrips: 76,
    joinedDate: '2026-02-20',
  },
  {
    id: 'd4',
    name: 'Tunde Bakare',
    phone: '09011223344',
    vehiclePlate: 'EPE-321-CD',
    route: 'Mile 2 → Oshodi',
    status: 'active',
    totalEarnings: 93100,
    totalTrips: 167,
    joinedDate: '2026-01-08',
  },
  {
    id: 'd5',
    name: 'Yemi Alade',
    phone: '08155667788',
    vehiclePlate: 'IKJ-654-EF',
    route: 'Berger → Ojota',
    status: 'suspended',
    totalEarnings: 12400,
    totalTrips: 23,
    joinedDate: '2026-03-10',
  },
  {
    id: 'd6',
    name: 'Kola Adenuga',
    phone: '07066778899',
    vehiclePlate: 'MUS-987-GH',
    route: 'Iyana Oworo → Ketu',
    status: 'active',
    totalEarnings: 45600,
    totalTrips: 61,
    joinedDate: '2026-02-14',
  },
];
