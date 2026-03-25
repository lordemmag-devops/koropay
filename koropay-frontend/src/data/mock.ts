import type { Route, Transaction, Trip, LevySetting, UnionPayment } from '../types';

export const mockRoutes: Route[] = [
  {
    id: '1',
    driverId: 'd1',
    routeName: 'Ojuelegba → Yaba',
    fare: 300,
    dropPoints: [
      { id: 'dp1', routeId: '1', name: 'Lawanson Junction' },
      { id: 'dp2', routeId: '1', name: 'Tejuosho Market' },
      { id: 'dp3', routeId: '1', name: 'Yaba Bus Stop' },
    ],
  },
  {
    id: '2',
    driverId: 'd1',
    routeName: 'CMS → Lekki Phase 1',
    fare: 500,
    dropPoints: [
      { id: 'dp4', routeId: '2', name: 'Ozumba Mbadiwe' },
      { id: 'dp5', routeId: '2', name: 'Victoria Island' },
      { id: 'dp6', routeId: '2', name: 'Lekki Phase 1' },
    ],
  },
];

export const mockTrips: Trip[] = [
  {
    id: 'trip-001',
    driverId: 'd1',
    route: 'Ojuelegba → Yaba',
    fare: 300,
    totalPassengers: 5,
    totalAmount: 1500,
    totalLevies: 500,
    status: 'completed',
    startTime: '2026-03-23T07:00:00Z',
    endTime: '2026-03-23T08:30:00Z',
    payments: [
      { id: 'tp1', passengerName: 'Adebayo Ogunlesi', passengerPhone: '08011112222', amount: 300, dropPoint: 'Yaba Bus Stop', status: 'completed', timestamp: '2026-03-23T07:10:00Z' },
      { id: 'tp2', passengerName: 'Chioma Eze', passengerPhone: '08033334444', amount: 300, dropPoint: 'Tejuosho Market', status: 'completed', timestamp: '2026-03-23T07:15:00Z' },
      { id: 'tp3', passengerName: 'Fatima Abubakar', passengerPhone: '08055556666', amount: 300, dropPoint: 'Lawanson Junction', status: 'completed', timestamp: '2026-03-23T07:22:00Z' },
      { id: 'tp4', passengerName: 'Emeka Obi', passengerPhone: '08077778888', amount: 300, dropPoint: 'Yaba Bus Stop', status: 'completed', timestamp: '2026-03-23T07:30:00Z' },
      { id: 'tp5', passengerName: 'Amina Yusuf', passengerPhone: '08099990000', amount: 300, dropPoint: 'Tejuosho Market', status: 'completed', timestamp: '2026-03-23T07:45:00Z' },
    ],
  },
  {
    id: 'trip-002',
    driverId: 'd1',
    route: 'CMS → Lekki Phase 1',
    fare: 500,
    totalPassengers: 3,
    totalAmount: 1500,
    totalLevies: 350,
    status: 'completed',
    startTime: '2026-03-23T09:00:00Z',
    endTime: '2026-03-23T10:15:00Z',
    payments: [
      { id: 'tp6', passengerName: 'Bola Tinubu Jr.', passengerPhone: '08012340001', amount: 500, dropPoint: 'Lekki Phase 1', status: 'completed', timestamp: '2026-03-23T09:10:00Z' },
      { id: 'tp7', passengerName: 'Ngozi Okafor', passengerPhone: '08012340002', amount: 500, dropPoint: 'Victoria Island', status: 'completed', timestamp: '2026-03-23T09:20:00Z' },
      { id: 'tp8', passengerName: 'Kemi Adeola', passengerPhone: '08012340003', amount: 500, dropPoint: 'Lekki Phase 1', status: 'completed', timestamp: '2026-03-23T09:35:00Z' },
    ],
  },
  {
    id: 'trip-003',
    driverId: 'd1',
    route: 'Ojuelegba → Yaba',
    fare: 300,
    totalPassengers: 4,
    totalAmount: 1200,
    totalLevies: 0,
    status: 'completed',
    startTime: '2026-03-23T11:00:00Z',
    endTime: '2026-03-23T12:00:00Z',
    payments: [
      { id: 'tp9', passengerName: 'Segun Adeyemi', passengerPhone: '08012340004', amount: 300, status: 'completed', timestamp: '2026-03-23T11:08:00Z' },
      { id: 'tp10', passengerName: 'Hauwa Bello', passengerPhone: '08012340005', amount: 300, dropPoint: 'Lawanson Junction', status: 'completed', timestamp: '2026-03-23T11:15:00Z' },
      { id: 'tp11', passengerName: 'Olu Bankole', passengerPhone: '08012340006', amount: 300, dropPoint: 'Yaba Bus Stop', status: 'completed', timestamp: '2026-03-23T11:25:00Z' },
      { id: 'tp12', passengerName: 'Aisha Mohammed', passengerPhone: '08012340007', amount: 300, status: 'completed', timestamp: '2026-03-23T11:40:00Z' },
    ],
  },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', userId: 'p1', passengerName: 'Adebayo Ogunlesi', amount: 300, type: 'passenger_payment', status: 'completed', timestamp: '2026-03-23T07:10:00Z', tripId: 'trip-001', dropPoint: 'Yaba Bus Stop' },
  { id: 't2', userId: 'p2', passengerName: 'Chioma Eze', amount: 300, type: 'passenger_payment', status: 'completed', timestamp: '2026-03-23T07:15:00Z', tripId: 'trip-001', dropPoint: 'Tejuosho Market' },
  { id: 't3', userId: 'p3', passengerName: 'Fatima Abubakar', amount: 300, type: 'passenger_payment', status: 'pending', timestamp: '2026-03-23T07:22:00Z', tripId: 'trip-001', dropPoint: 'Lawanson Junction' },
  { id: 't4', userId: 'p4', passengerName: 'Emeka Obi', amount: 300, type: 'passenger_payment', status: 'completed', timestamp: '2026-03-23T07:30:00Z', tripId: 'trip-001', dropPoint: 'Yaba Bus Stop' },
  { id: 't5', userId: 'p5', passengerName: 'Amina Yusuf', amount: 300, type: 'passenger_payment', status: 'failed', timestamp: '2026-03-23T07:45:00Z', tripId: 'trip-001', dropPoint: 'Tejuosho Market' },
  { id: 't6', userId: 'a1', passengerName: 'NURTW - Ojuelegba', amount: 500, type: 'union_payment', status: 'completed', timestamp: '2026-03-23T07:00:00Z' },
  { id: 't7', userId: 'p6', passengerName: 'Bola Tinubu Jr.', amount: 500, type: 'passenger_payment', status: 'completed', timestamp: '2026-03-23T09:10:00Z', tripId: 'trip-002', dropPoint: 'Lekki Phase 1' },
  { id: 't8', userId: 'p7', passengerName: 'Ngozi Okafor', amount: 500, type: 'passenger_payment', status: 'completed', timestamp: '2026-03-23T09:20:00Z', tripId: 'trip-002', dropPoint: 'Victoria Island' },
];

export const mockLevySettings: LevySetting[] = [
  { id: 'ls1', levyName: 'NURTW Daily Levy', amount: 500, location: 'Ojuelegba Checkpoint', active: true },
  { id: 'ls2', levyName: 'Police Checkpoint Fee', amount: 350, location: 'Yaba Tollgate', active: true },
  { id: 'ls3', levyName: 'LASTMA Levy', amount: 450, location: 'Maryland Checkpoint', active: true },
  { id: 'ls4', levyName: 'VIO Inspection Fee', amount: 400, location: 'Oshodi Checkpoint', active: false },
];

export const mockUnionPayments: UnionPayment[] = [
  { id: 'up1', driverId: 'd1', agentId: 'AG-001', agentName: 'NURTW - Ojuelegba', levyName: 'NURTW Daily Levy', amount: 500, status: 'paid', timestamp: '2026-03-23T07:00:00Z' },
  { id: 'up2', driverId: 'd1', agentId: 'AG-002', agentName: 'Police - Yaba', levyName: 'Police Checkpoint Fee', amount: 350, status: 'paid', timestamp: '2026-03-23T09:30:00Z' },
  { id: 'up3', driverId: 'd1', agentId: 'AG-003', agentName: 'LASTMA - Maryland', levyName: 'LASTMA Levy', amount: 450, status: 'pending', timestamp: '2026-03-23T11:30:00Z' },
];

export const todayStats = {
  totalEarnings: 4200,
  totalTrips: 3,
  totalPassengers: 12,
  pendingPayments: 1,
  completedPayments: 10,
  unionPayments: 1300,
};
