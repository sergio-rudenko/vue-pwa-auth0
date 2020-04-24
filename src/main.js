import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

// Import the Auth0
import { domain, clientId, audience, scope } from "../auth-config.json";
import { Auth0Plugin } from "./auth";

// Install the authentication plugin here
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  scope,
  onRedirectCallback: (appState) => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  },
});

Vue.config.productionTip = false;

if (Notification.permission === "granted") {
  navigator.serviceWorker.getRegistration().then(function(reg) {
    var options = {
      body: "Это текст сообщения... / This is message text...",
      icon: "img/icons/android-chrome-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "Explore this new world",
          icon: "images/checkmark.png",
        },
        {
          action: "close",
          title: "Close notification",
          icon: "images/xmark.png",
        },
      ],
    };
    if (reg) reg.showNotification("Hello from vue pwa!", options);
  });
} else if (Notification.permission === "blocked") {
  /* the user has previously denied push. Can't reprompt. */
  Notification.requestPermission(function(status) {
    console.log("Notification permission status:", status);
  });
} else {
  Notification.requestPermission(function(status) {
    console.log("Notification permission status:", status);
  });
}

// if (Notification.permission == 'granted') {
//   navigator.serviceWorker.getRegistration().then(function(reg) {
//     reg.showNotification('Hello world!');
//   });
// }

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
