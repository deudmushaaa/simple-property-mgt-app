importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAXbdTHViCcuXW8askMq9jGif_25TcvHJU",
  authDomain: "karibu-fd600.firebaseapp.com",
  projectId: "karibu-fd600",
  storageBucket: "karibu-fd600.appspot.com",
  messagingSenderId: "231172732564",
  appId: "1:231172732564:web:386cdc5e62eecae254e681",
  measurementId: "G-R5XNV1ZR50"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
