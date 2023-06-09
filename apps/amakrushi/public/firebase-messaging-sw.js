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

messaging.setBackgroundMessageHandler((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
    tag: "notification",
    vibrate: [200, 100, 200],
    renotify: true,
    data: {
      url: payload.notification.click_action,
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

//Code for adding event on click of notification
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = event.notification.data.url;

  // Check if the URL is defined and not empty
  if (url && url.length > 0) {
    event.waitUntil(
      clients.openWindow(url).then(function (windowClient) {
        // Check if the window was successfully opened
        if (windowClient) {
          windowClient.focus();
        } else {
          // Opening the URL in a new window/tab failed, redirecting the current window instead
          self.clients.openWindow(url);
        }
      })
    );
  }
});


