importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

// Set Firebase configuration, once available
self.addEventListener("fetch", () => {
  const urlParams = new URLSearchParams(location.search);
  self.firebaseConfig = Object.fromEntries(urlParams);
});

// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

// Initialize Firebase app
firebase.initializeApp(self.firebaseConfig || defaultConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const { title, body, image } = payload.notification;

  const notificationOptions = {
    body,
    icon: image,
    tag: "notification",
    vibrate: [200, 100, 200],
    renotify: true,
    data: {url: payload.data?.[`gcm.notification.data`]},
  };

  self.registration.showNotification(title, notificationOptions);
});

//Code for adding event on click of notification
self.addEventListener('notificationclick', (event) => {
  
  if (event.notification.data && event.notification.data.url) {
    self.clients.openWindow(event.notification.data.url);
  } else {
    self.clients.openWindow(event.currentTarget.origin);
  }
  
  // close notification after click
  event.notification.close();
});
