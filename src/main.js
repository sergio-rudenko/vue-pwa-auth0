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

if (Notification) {
  if (Notification.permission === "blocked") {
    /* the user has previously denied push. Can't reprompt. */
    console.log("Notification permission blocked: ", status);
  } else {
    Notification.requestPermission(function(status) {
      console.log("Notification permission status:", status);
    });
  }
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
