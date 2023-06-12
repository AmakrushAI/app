importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js'
);

// Set Firebase configuration, once available
self.addEventListener('fetch', () => {
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
  console.log('Received background message ', payload);

  const { title, body, image } = payload.notification;

  const notificationOptions = {
    body,
    icon: image,
    tag: 'notification',
    vibrate: [200, 100, 200],
    renotify: true,
    data: { url: payload.data?.[`gcm.notification.data`] },
  };

  // Store the feature details in the notification payload
  notificationOptions.data.featureDetails =
    payload.data?.[`gcm.notification.featureDetails`];

  self.registration.showNotification(title, notificationOptions);
});

//Code for adding event on click of notification
self.addEventListener('notificationclick', (event) => {
  console.log('hi', event);
  if (event.notification.data && event.notification.data.url) {
    self.clients.openWindow(event.notification.data.url);
  } else {
    self.clients.openWindow(event.currentTarget.origin);
  }
  // Retrieve the feature details from the notification payload
  const featureDetails = event.notification.data.featureDetails;
  const parsedFeatureDetails = JSON.parse(featureDetails);
  if (
    featureDetails &&
    parsedFeatureDetails?.title &&
    parsedFeatureDetails?.description
  ) {
    // Store the feature details in IndexedDB
    storeFeatureDetails(featureDetails);
  }
  // close notification after click
  event.notification.close();
});

function storeFeatureDetails(details) {
  // Open IndexedDB database
  const request = self.indexedDB.open('featureDetailsDB', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    // Check if the object store already exists
    if (!db.objectStoreNames.contains('featureDetailsStore')) {
      // Create the object store
      db.createObjectStore('featureDetailsStore', {
        keyPath: 'id',
        autoIncrement: true,
      });
    }
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['featureDetailsStore'], 'readwrite');
    const objectStore = transaction.objectStore('featureDetailsStore');

    // Check if the entry exists
    const getRequest = objectStore.get(1);
    getRequest.onsuccess = (event) => {
      const existingEntry = event.target.result;

      if (existingEntry) {
        // Update the existing entry
        objectStore.put({ id: 1, details });
      } else {
        // Add a new entry
        objectStore.add({ id: 1, details });
      }
    };

    transaction.oncomplete = () => {
      db.close();
    };
  };
}