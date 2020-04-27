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
  console.log("notificationclose:", notification);
});

self.addEventListener("notificationclick", function(e) {
  var notification = e.notification;
  var action = e.action;

  console.log("notificationclick: ", action);
  console.log("notification:", notification);

  if (action === "close") {
    notification.close();
  } else if (action === "explore") {
    notification.close();
    clients.openWindow(notification.data.url);
  } else {
    notification.close();
  }

  //TODO: some other actions...
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
