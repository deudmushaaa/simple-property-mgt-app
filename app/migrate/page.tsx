'use client';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';

const migratePayments = async (currentUserUid: string) => {
  if (!currentUserUid) {
    toast.error('You must be logged in to migrate data.');
    return;
  }

  const paymentsRef = collection(db, 'payments');
  const snapshot = await getDocs(paymentsRef);

  let updatedCount = 0;

  for (const paymentDoc of snapshot.docs) {
    const paymentData = paymentDoc.data();

    // Only migrate if data is missing
    if (!paymentData.tenantName || !paymentData.userId || !paymentData.propertyName) {
      
      try {
        // Fetch Tenant Info
        const tenantSnap = await getDoc(doc(db, 'tenants', paymentData.tenantId));
        const tenantData = tenantSnap.exists() ? tenantSnap.data() : {};

        // Fetch Property Info
        const propertyId = paymentData.propertyId || tenantData.propertyId;
        let propertyName = 'N/A';
        
        if (propertyId) {
          const propertySnap = await getDoc(doc(db, 'properties', propertyId));
          propertyName = propertySnap.exists() ? propertySnap.data()?.name : 'N/A';
        }

        // Update the Payment with all missing info (Denormalize)
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          userId: currentUserUid,        // CRITICAL: For your security rules
          tenantName: tenantData.name || 'N/A',
          propertyName: propertyName,
          propertyId: propertyId || null
        });

        updatedCount++;
      } catch (err) {
        console.error(`Failed to migrate payment ${paymentDoc.id}`, err);
        toast.error(`Failed to migrate payment ${paymentDoc.id}. See console for details.`);
      }
    }
  }

  toast.success(`Migration complete! Updated ${updatedCount} records.`);
};

export default function MigratePage() {
    const { user } = useAuth();

    const handleMigration = () => {
        if (user) {
            migratePayments(user.uid);
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-4">Data Migration</h1>
            <p className="mb-4">Click the button below to update your existing payment records with the necessary data for the new security rules. This is a one-time operation.</p>
            <Button onClick={handleMigration}>Migrate Payments</Button>
        </div>
    )
}
