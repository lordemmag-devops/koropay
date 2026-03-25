import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  role: 'admin' | 'driver' | 'agent';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
