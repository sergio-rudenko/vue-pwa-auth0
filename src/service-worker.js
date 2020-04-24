// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
self.addEventListener("message", (e) => {
  if (!e.data) {
    return;
  }

  // is it old? new? TODO: found out it
  if (e.data.type === "SKIP_WAITING") {
    console.log("'.data.type === SKIP_WAITING' received!");
    self.skipWaiting();
  } //---------------------------------

  switch (e.data) {
    case "skipWaiting":
      console.log("'skipWaiting' received!");
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});

/**
 * notification events
 */
self.addEventListener("notificationclose", function(event) {
  var notification = event.notification;
  var primaryKey = notification.data.primaryKey;

  console.log("Closed notification: " + primaryKey);
});

self.addEventListener("notificationclick", function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  var action = e.action;

  if (action === "close") {
    notification.close();
    console.log('onclick: "close" ' + primaryKey);
  } else {
    notification.close();
    console.log('onclick: "' + action + '" ' + primaryKey);
    clients.openWindow("http://www.example.com");
  }
});

workbox.core.clientsClaim(); // Vue CLI 4 and Workbox v4, else
// workbox.clientsClaim(); // Vue CLI 3 and Workbox v3.

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
