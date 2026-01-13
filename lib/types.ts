import { Timestamp } from 'firebase/firestore';

export interface Property {
  id: string;
  name: string;
  address: string;
  units?: string[];
}

export interface Unit {
  id: string;
  name: string;
  propertyId: string;
}

export interface Tenant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dueDay?: number;
  propertyId?: string;
  unitId?: string;
  propertyName?: string;
  unitName?: string;
}

export interface Payment {
  id: string;
  userId: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  amount: number;
  date: Timestamp;
  type: 'rent' | 'deposit' | 'other';
  months?: string[]; // Made optional as per mentor's advice
  receiptNumber?: string;
  tenantName?: string;
  propertyName?: string;
  unitName?: string;
  balanceAfterPayment?: number;
}
