
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import { app } from "@/lib/firebase"; // Your main firebase config
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";

const db = getFirestore(app);

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return;

  const messaging = getMessaging(app);
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.log("Cannot request permission, no user is signed in.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Get the token
      const currentToken = await getToken(messaging, {
        vapidKey: "BNDJn4j1MgfBXc6z3x3FLL0xBTrhNrBf6SUVNogHtEdmjn8RD6yNVQHU46hTC007qDChCGYdW8YQh6ojW6N7zLQ", // You need to generate this in Firebase Console
      });

      if (currentToken) {
        console.log("FCM Token:", currentToken);
        // Save the token to Firestore
        const tokenRef = doc(db, `users/${currentUser.uid}/tokens/${currentToken}`);
        await setDoc(tokenRef, { token: currentToken, createdAt: new Date() });
        console.log("FCM token saved to Firestore.");
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Unable to get permission to notify.");
    }
  } catch (error) {
    console.error("An error occurred while requesting permission ", error);
  }
};

export const onMessageListener = (callback: (payload: MessagePayload) => void) => {
    if (typeof window === 'undefined') {
        // Return a no-op function for SSR
        return () => {};
    }
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log("New message received. ", payload);
      callback(payload);
    });
};
