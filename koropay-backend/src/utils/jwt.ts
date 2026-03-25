import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

const secret = process.env.JWT_SECRET as string;
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, secret) as AuthPayload;
};

export const generateOTP = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};
