export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'passenger' | 'agent';
}

export interface Driver {
  id: string;
  userId: string;
  vehiclePlate: string;
}

export interface Route {
  id: string;
  driverId: string;
  routeName: string;
  fare: number;
  dropPoints: DropPoint[];
}

export interface DropPoint {
  id: string;
  routeId: string;
  name: string;
}

export interface Trip {
  id: string;
  driverId: string;
  route: string;
  fare: number;
  totalPassengers: number;
  totalAmount: number;
  totalLevies: number;
  status: 'ongoing' | 'completed';
  startTime: string;
  endTime?: string;
  payments: TripPayment[];
}

export interface TripPayment {
  id: string;
  passengerName: string;
  passengerPhone: string;
  amount: number;
  dropPoint?: string;
  status: 'completed' | 'pending';
  timestamp: string;
}

export interface Transaction {
  id: string;
  userId: string;
  passengerName: string;
  amount: number;
  type: 'passenger_payment' | 'union_payment';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  tripId?: string;
  dropPoint?: string;
}

export interface Agent {
  id: string;
  name: string;
  location: string;
}

export interface LevySetting {
  id: string;
  levyName: string;
  amount: number;
  location?: string;
  active: boolean;
}

export interface UnionPayment {
  id: string;
  driverId: string;
  agentId: string;
  agentName: string;
  levyName: string;
  amount: number;
  status: 'pending' | 'paid';
  otp?: string;
  timestamp: string;
}

export type USSDStep = 'idle' | 'select_route' | 'select_drop' | 'confirm_fare' | 'processing' | 'confirmation';
