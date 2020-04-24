/* eslint-disable no-console */

import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    // registered() {
    //   console.log("Service worker has been registered.");
    // },
    registered(registration) {
      let period = 60 * 5; //FIXME! 1h in production
      console.log(
        "Service worker has been registered, check for updates every " +
          period +
          " sec."
      );
      setInterval(() => {
        registration.update();
      }, 1000 * period); // ms
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    // updated() {
    //   console.log("New content is available; please refresh.");
    // },
    updated(registration) {
      let eventName = "swUpdated";
      console.log(
        "New content is available; please refresh. Generated '" +
          eventName +
          "' event"
      );
      document.dispatchEvent(
        new CustomEvent(eventName, { detail: registration })
      );
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    },
  });
}
