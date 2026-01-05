import { Timestamp } from 'firebase/firestore';

export interface Property {
  id: string;
  name: string;
  address: string;
}

export interface Unit {
  id: string;
  name: string;
  propertyId: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  // Denormalized and optional fields for display purposes
  propertyId?: string;
  unitId?: string;
  propertyName?: string;
  unitName?: string;
  phone?: string;
}

export interface Payment {
  id: string;
  userId: string; // For authorization
  tenantId: string;
  propertyId: string;
  unitId: string;
  amount: number;
  date: Timestamp;
  type: 'rent' | 'deposit' | 'other';
  receiptNumber?: string;
  balanceAfterPayment?: number;
  // Denormalized fields for easy display
  tenantName?: string;
  unitName?: string;
  propertyName?: string;
}