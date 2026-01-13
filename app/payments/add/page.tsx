'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, getYear } from 'date-fns';
import { toast } from 'sonner';
import { Tenant } from '@/lib/types';
import { paymentSchema, PaymentInput } from '@/lib/schemas';
import { ZodError } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AddPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState('Rent');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchTenants = async () => {
        const q = query(collection(db, 'tenants'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const tenantsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
        setTenants(tenantsData);
      };
      fetchTenants();
    }
  }, [user]);

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId) || null;
    setSelectedTenant(tenant);
  };

  const handleMonthToggle = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const selectCurrentMonth = () => {
    if (date) {
      const currentMonthName = format(date, 'MMMM');
      const currentYear = getYear(date);
      const monthWithYear = `${currentMonthName} ${currentYear}`;
      if (!selectedMonths.includes(monthWithYear)) {
        setSelectedMonths([monthWithYear]);
      }
    }
  };

  const clearMonths = () => {
    setSelectedMonths([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTenant || !date) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const tenantDocRef = doc(db, 'tenants', selectedTenant.id);
      const tenantDocSnap = await getDoc(tenantDocRef);
      if (!tenantDocSnap.exists()) {
        throw new Error('Selected tenant no longer exists.');
      }
      const currentTenantData = tenantDocSnap.data() as Tenant;

      if (!currentTenantData.propertyId) {
        throw new Error('Tenant does not have an associated property.');
      }

      const propertyDocRef = doc(db, 'properties', currentTenantData.propertyId);
      const propertyDocSnap = await getDoc(propertyDocRef);
      if (!propertyDocSnap.exists()) {
        throw new Error('Property associated with tenant not found.');
      }
      const propertyData = propertyDocSnap.data();

      const payload: PaymentInput = {
        amount: parseFloat(amount),
        date,
        type,
        months: selectedMonths,
        userId: user.uid,
        tenantId: selectedTenant.id,
        propertyId: currentTenantData.propertyId,
        tenantName: currentTenantData.name,
        propertyName: propertyData.name,
        unitName: currentTenantData.unitName || 'N/A',
      };

      paymentSchema.parse(payload);

      await addDoc(collection(db, 'payments'), {
        ...payload,
        createdAt: serverTimestamp(),
      });

      toast.success('Payment recorded successfully!');
      router.push('/payments');

    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((e: any) => e.message).join('\n');
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentYear = getYear(date || new Date());

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Record a New Payment</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
        <div className="space-y-2">
          <label htmlFor="tenant" className="text-sm font-medium">Tenant</label>
          <Select onValueChange={handleTenantChange} required>
            <SelectTrigger id="tenant">
              <SelectValue placeholder="Select a tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map(tenant => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.propertyName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">Amount (UGX)</label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g., 500000"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">Payment Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">Payment Type</label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">For Months</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {months.map(month => {
              const monthWithYear = `${month} ${currentYear}`;
              return (
                <Toggle
                  key={monthWithYear}
                  pressed={selectedMonths.includes(monthWithYear)}
                  onPressedChange={() => handleMonthToggle(monthWithYear)}
                  variant="outline"
                  className="flex-grow text-center"
                >
                  {month}
                </Toggle>
              );
            })}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={selectCurrentMonth} className="flex-grow">
              Select Current Month
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={clearMonths} className="flex-grow">
              Clear All
            </Button>
          </div>
          {selectedMonths.length > 0 && (
            <div className="pt-2">
              <p className='text-sm text-muted-foreground'>Selected:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMonths.map(m => <Badge key={m}>{m}</Badge>)}
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Recording...' : 'Record Payment'}
        </Button>
      </form>
    </div>
  );
}
