'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, orderBy, limit, getDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from '@/components/ui/combobox';
import { toast } from 'sonner';

interface Tenant {
    id: string;
    name: string;
    propertyName: string;
    unitName: string;
    balance: number;
    userId: string;
    propertyId: string;
}

async function getNextReceiptNumber(userId: string) {
  const paymentsQuery = query(
    collection(db, 'payments'), 
    where('userId', '==', userId), 
    orderBy('receiptNumber', 'desc'), 
    limit(1)
  );
  const snapshot = await getDocs(paymentsQuery);
  if (snapshot.empty) {
    return 1; // Start from 1 if no payments exist
  }
  const lastPayment = snapshot.docs[0].data();
  return lastPayment.receiptNumber + 1;
}

export default function AddPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Rent');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const fetchTenants = async () => {
      if (user) {
        const q = query(collection(db, 'tenants'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const tenantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tenant[];
        setTenants(tenantsData);
      }
    };
    fetchTenants();
  }, [user]);

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    setSelectedTenant(tenant || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedTenant || !amount) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const paymentAmount = parseFloat(amount);
      const receiptNumber = await getNextReceiptNumber(user.uid);

      // Get the latest tenant data before calculating the new balance
      const tenantRef = doc(db, 'tenants', selectedTenant.id);
      const tenantSnap = await getDoc(tenantRef);
      const currentTenantData = tenantSnap.data();
      const currentBalance = currentTenantData?.balance || 0;
      const balanceAfterPayment = currentBalance - paymentAmount;
      
      // 1. Add payment record with the new balance
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        tenantId: selectedTenant.id,
        propertyId: selectedTenant.propertyId,
        amount: paymentAmount,
        type: paymentType,
        date: new Date(paymentDate),
        createdAt: new Date(),
        receiptNumber,
        balanceAfterPayment, // Save the calculated balance
      });

      // 2. Update tenant's balance
      await updateDoc(tenantRef, {
        balance: increment(-paymentAmount)
      });

      toast.success('Payment recorded successfully!');
      router.push('/payments');
    } catch (error) {
      console.error("Error recording payment: ", error);
      toast.error('Failed to record payment. Please try again.');
    }
  };
  
  const tenantOptions = tenants.map(tenant => ({
    value: tenant.id,
    label: `${tenant.name} (${tenant.propertyName} - ${tenant.unitName})`,
  }));

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Record New Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="tenant" className="font-semibold">Tenant</label>
                <Combobox
                    data-testid="tenant-combobox"
                    options={tenantOptions}
                    value={selectedTenant ? selectedTenant.id : ''}
                    onChange={handleTenantChange}
                    placeholder="Select a tenant"
                    searchPlaceholder="Search tenants..."
                    emptyText="No tenants found."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="amount" className="font-semibold">Amount</label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1000.00" required />
                </div>
                <div className="space-y-2">
                    <label htmlFor="payment-type" className="font-semibold">Payment Type</label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Rent">Rent</SelectItem>
                            <SelectItem value="Deposit">Security Deposit</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="payment-date" className="font-semibold">Payment Date</label>
                <Input id="payment-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Record Payment</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
