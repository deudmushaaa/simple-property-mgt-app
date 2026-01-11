
import type { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '@/lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authorization.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { uid } = decodedToken;

  const {
    tenantId,
    propertyId,
    amount,
    type,
    date,
    months,
  } = req.body;

  if (!tenantId || !propertyId || !amount || !type || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const db = admin.firestore();

    // Denormalization: Fetch tenant and property names
    const tenantRef = db.collection('tenants').doc(tenantId);
    const propertyRef = db.collection('properties').doc(propertyId);

    const [tenantDoc, propertyDoc] = await Promise.all([
        tenantRef.get(),
        propertyRef.get(),
    ]);

    if (!tenantDoc.exists()) {
        return res.status(404).json({ message: 'Tenant not found' });
    }
    if (!propertyDoc.exists()) {
        return res.status(404).json({ message: 'Property not found' });
    }

    const tenantName = tenantDoc.data()?.name || 'N/A';
    const propertyName = propertyDoc.data()?.name || 'N/A';

    // 1. Get the next receipt number
    const paymentsQuery = db.collection('payments')
      .where('userId', '==', uid)
      .orderBy('receiptNumber', 'desc')
      .limit(1);
    const snapshot = await paymentsQuery.get();
    const lastPayment = snapshot.docs[0]?.data();
    const receiptNumber = (lastPayment?.receiptNumber || 0) + 1;

    // 2. Add payment record with denormalized data
    const paymentRef = await db.collection('payments').add({
      tenantId,
      propertyId,
      amount,
      type,
      date: new Date(date),
      userId: uid,
      receiptNumber,
      months,
      tenantName, // Denormalized field
      propertyName, // Denormalized field
      createdAt: new Date(),
    });

    // 3. Update tenant's balance
    await tenantRef.update({
      balance: admin.firestore.FieldValue.increment(-amount),
    });

    res.status(200).json({ id: paymentRef.id });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
