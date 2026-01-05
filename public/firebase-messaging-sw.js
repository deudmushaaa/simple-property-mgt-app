
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXbdTHViCcuXW8askMq9jGif_25TcvHJU",
    authDomain: "karibu-fd600.firebaseapp.com",
    projectId: "karibu-fd600",
    storageBucket: "karibu-fd600.appspot.com",
    messagingSenderId: "231172732564",
    appId: "1:231172732564:web:386cdc5e62eecae254e681",
    measurementId: "G-R5XNV1ZR50"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png", // Make sure you have this icon in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
