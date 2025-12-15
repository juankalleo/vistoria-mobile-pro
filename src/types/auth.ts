export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: 'admin' | 'inspector' | 'user';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface VerificationCode {
  code: string;
  expiresAt: string;
  attempts: number;
  verified: boolean;
}

export interface PendingRegistration {
  email?: string;
  phone?: string;
  name: string;
  passwordHash: string;
  verificationCode: VerificationCode;
  createdAt: string;
}

export interface SyncQueue {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  tableName: 'vistorias' | 'users';
  recordId: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
  attempts: number;
}
