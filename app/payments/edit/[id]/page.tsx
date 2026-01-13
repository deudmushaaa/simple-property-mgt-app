'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

interface Tenant {
  id: string;
  name: string;
  propertyName: string;
  unitName: string;
}

export default function EditPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const { user } = useAuth();

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentAndTenants = async () => {
      if (user && id) {
        // Fetch payment data
        const paymentDocRef = doc(db, 'payments', id);
        const paymentDocSnap = await getDoc(paymentDocRef);

        if (paymentDocSnap.exists() && paymentDocSnap.data().userId === user.uid) {
          const paymentData = paymentDocSnap.data();
          setDate(paymentData.date.toDate().toISOString().split('T')[0]);
          setAmount(paymentData.amount);
          setType(paymentData.type);
          setTenantId(paymentData.tenantId);
        } else {
          toast.error('Payment not found or you don\'t have access.');
          router.push('/payments');
          return;
        }

        // Fetch tenants
        const tenantsQuery = query(collection(db, 'tenants'), where('userId', '==', user.uid));
        const tenantsSnapshot = await getDocs(tenantsQuery);
        const tenantsList = await Promise.all(tenantsSnapshot.docs.map(async (tenantDoc) => {
          const tenantData = tenantDoc.data();
          const propertyDoc = await getDoc(doc(db, 'properties', tenantData.propertyId));
          const propertyName = propertyDoc.exists() ? propertyDoc.data().name : 'N/A';
          return {
            id: tenantDoc.id,
            ...tenantData,
            propertyName
          } as Tenant;
        }));
        setTenants(tenantsList);
        setLoading(false);
      }
    };

    fetchPaymentAndTenants();
  }, [user, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      toast.error('You must be logged in to edit a payment.');
      return;
    }

    try {
      const paymentRef = doc(db, 'payments', id);
      await updateDoc(paymentRef, {
        date: Timestamp.fromDate(new Date(date)),
        amount: parseFloat(amount),
        type,
        tenantId,
      });

      toast.success('Payment updated successfully!');
      router.push('/payments');
    } catch (error) {
      console.error("Error updating payment: ", error);
      toast.error('Failed to update payment. Please try again.');
    }
  };

  const tenantOptions = tenants.map(tenant => ({
    value: tenant.id,
    label: `${tenant.name} (${tenant.propertyName} - ${tenant.unitName})`,
  }));

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="date">Payment Date</label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount">Amount</label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label>Tenant</label>
              <Combobox
                options={tenantOptions}
                value={tenantId}
                onChange={setTenantId}
                placeholder="Select tenant..."
                searchPlaceholder="Search tenants..."
                emptyText="No tenants found."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type">Payment Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
