
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

export async function GET() {
  try {
    // 1. Find users who should receive notifications
    const usersSnapshot = await db.collection("users").get();
    if (usersSnapshot.empty) {
      return NextResponse.json({ message: 'No users found to notify.' }, { status: 200 });
    }

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // 2. Check for tenants with overdue balances for this user
      const tenantsSnapshot = await db
        .collection("tenants")
        .where("userId", "==", userId)
        .where("balance", ">", 0)
        .get();

      if (tenantsSnapshot.empty) {
        console.log(`User ${userId} has no tenants with overdue balances.`);
        continue; // Move to the next user
      }

      const overdueCount = tenantsSnapshot.size;
      const tenantNames = tenantsSnapshot.docs.map(doc => doc.data().name).join(', ');

      // 3. Get the user's FCM tokens
      const tokensSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("tokens")
        .get();

      if (tokensSnapshot.empty) {
        console.log(`No notification tokens found for user ${userId}.`);
        continue; // Move to the next user
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      // 4. Construct the notification message
      const payload = {
        notification: {
          title: "Overdue Tenant Balances",
          body: `You have ${overdueCount} tenant(s) with overdue balances: ${tenantNames}.`,
        },
        webpush: {
          fcmOptions: {
            link: "/payments",
          },
        },
      };

      // 5. Send the notification to all of the user's tokens
      const response = await messaging.sendEachForMulticast({ tokens, ...payload });
      console.log(`Successfully sent notification to user ${userId}.`, response);

      // Optional: Clean up invalid tokens
      response.responses.forEach((result: admin.messaging.SendResponse, index: number) => {
        const error = result.error;
        if (error) {
          console.error(
            `Failed to send notification to token: ${tokens[index]}`,
            error
          );
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            // Remove the invalid token from the database
            db.collection("users").doc(userId).collection("tokens").doc(tokens[index]).delete();
          }
        }
      });
    }

    return NextResponse.json({ message: 'Notifications sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ message: 'Error sending notifications.' }, { status: 500 });
  }
}
