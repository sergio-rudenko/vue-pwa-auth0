<template>
  <div id="app">
    <app-navigation title="CLOUD::BAST" />
    <router-view v-if="isReady" />

    <b-overlay :show="!isReady" spinner-variant="primary" spinner-type="grow">
      <div v-if="!isReady" class="content">
        <img
          src="@/assets/logo.png"
          alt="LOGO"
          width="256"
          height="256"
          class="mb-4"
        />
        <h3>Cloud::BAST.</h3>
        <p>
          Пожалуйста, воспользуйтесь кнопкой в меню или
          <b-link to="/profile">ссылкой на профиль пользователя</b-link>
        </p>
      </div>
    </b-overlay>

    <!-- <b-container class="d-flex justify-content-center my-3">
      <b-button size="sm" @click="myAction">
        DEBUG: action
      </b-button>
    </b-container> -->

    <!-- in app notification -->
    <b-alert
      dismissible
      v-model="alertNotification.visible"
      :variant="alertNotification.variant"
      class="position-fixed fixed-bottom m-0 px-0 py-2 rounded-2"
      style="z-index: 9999;"
    >
      <b-container fluid class="py-0 px-2">
        <app-notification :data="alertNotification.data" /> <br />
        <div
          v-if="'actions' in alertNotification.data.options"
          class="d-flex justify-content-center"
        >
          <b-row align-h="around">
            <b-col
              v-for="(button, i) in alertNotification.data.options.actions"
              :key="i"
              cols="5"
            >
              <b-button
                variant="info"
                class="mb-2 text-nowrap"
                @click="alertNotificationAction(button.action)"
                :title="button.title"
              >
                <!-- <b-icon icon="gear-fill" aria-hidden="true" /> -->
                <!-- <b-img src="@/assets/logo.png" alt="logo" /> -->
                {{ button.title }}
              </b-button>
            </b-col>
          </b-row>
        </div>
      </b-container>
    </b-alert>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { getUserData } from "@/auth/authService";
import { getCloudUserData, getCloudUserDevices } from "@/cloud/lkService";
import { getJournalizedMessages } from "@/cloud/jrService";

import {
  mqttConnect,
  mqttGetClientId,
  mqttSendMessage,
} from "@/mqtt/mqttService";

import AppNavigation from "@/components/AppNavigation.vue";
import AppNotification from "@/components/AppNotification.vue";

export default {
  components: {
    AppNavigation,
    AppNotification,
  },

  beforeMount() {
    // this.$store.dispatch("startIntervalPeriodic");
  },

  methods: {
    myAction() {
      window.console.log("DEBUG::myAction");
      this.alertNotification.visible = true;
    },

    showAlertNotification(msg) {
      this.alertNotification = {
        visible: true,
        variant: "info",
        data: { ...msg },
      };
    },

    alertNotificationAction(action, num) {
      window.console.log(action, num);
      if (action === "explore") {
        const alert = this.alertNotification;
        const options = alert.data.options;
        const url = "url" in options.data ? options.data.url : "";

        alert.visible = false;
        window.open(url, "_blank");
      }

      if (action === "close") {
        this.alertNotification.visible = false;
      }
    },

    // AUTH
    obtainUserData(url, id) {
      getUserData(url, id)
        .then((data) => {
          // window.console.log(JSON.stringify(data));
          this.$store.commit("setAuthMetadata", data);
        })
        .catch((err) => {
          window.console.log("ERROR:", err.response);
          setTimeout(() => this.obtainUserData(url, id), 5000);
        });
    },

    // CLOUD
    obtainCloudUserData() {
      const token = this.user_metadata.bast_token;
      getCloudUserData(token)
        .then((response) => {
          // window.console.log(JSON.stringify(response.data));
          this.$store.commit("setCloudUserData", response.data);
        })
        .catch((err) => {
          window.console.log("ERROR:", err.response);
          setTimeout(() => this.obtainCloudUserData(), 5000);
        });
    },

    obtainCloudUserDevices() {
      const token = this.user_metadata.bast_token;
      getCloudUserDevices(token)
        .then((response) => {
          // window.console.log(JSON.stringify(response.data));
          this.$store.dispatch("setCloudUserDevices", response.data);
        })
        .catch((err) => {
          window.console.log("ERROR:", err.response);
          setTimeout(() => this.obtainCloudUserDevices(), 5000);
        });
    },

    refreshJournalToken(id) {
      if (this.mqtt.instance.isConnected()) {
        const journal = this.cloud.journal;

        const token_delta = Date.now() - new Date(journal.token_dt);
        const token_expired = token_delta >= 45 * 60 * 1000; /* 45 min */

        if (journal.token == "" || token_expired) {
          mqttSendMessage(this.mqtt.instance, {
            topic: "status/" + id + "/journal/getJournalToken",
            payload: "",
            retain: false,
            qos: 1,
          });
        }
      }
    },

    // MQTT
    mqttHeartbeat(id) {
      if (this.mqtt.instance.isConnected()) {
        mqttSendMessage(this.mqtt.instance, {
          topic: "status/" + id + "/" + mqttGetClientId(),
          payload: JSON.stringify({
            user_id: id,
            time_t: Math.trunc(new Date().getTime() / 1000),
          }),
          retain: false,
          qos: 1,
        });
      }
    },

    initMqttConnection() {
      if (this.mqtt.instance === null) {
        mqttConnect(this.$store, this.onMqttMessage);
        setInterval(() => {
          const id = btoa(this.user_phone); //FIXME!

          /* Heartbeat/Reconnect */
          this.mqttHeartbeat(id);

          /* Journal Token Get/Refresh */
          this.refreshJournalToken(id);
        }, 5000); //FOXME: interval
      }
    },

    onMqttMessage(msg) {
      let parts = null;
      let processed = false;
      /**
       * Device status
       * example: 'FF00/NTdHEDI5MTA8AEoA/status'
       */
      const device_status_topic = /^(.+)\/(.+)\/status$/;
      parts = String(msg.destinationName).match(device_status_topic);
      if (parts) {
        processed = true;
        // window.console.log(`device ${parts[1]}/${parts[2]} status`);
        this.$store.commit("setDeviceStatus", {
          type: parts[1],
          devId: parts[2],
          status: JSON.parse(msg.payloadString),
        });
      }

      /**
       * Device data
       * example: 'FF00/NTdHEDI5MTA8AEoA/data'
       */
      const device_data_topic = /^(.+)\/(.+)\/data$/;
      parts = String(msg.destinationName).match(device_data_topic);
      if (parts) {
        processed = true;
        // window.console.log(`device ${parts[1]}/${parts[2]} data`);
        this.$store.commit("setDeviceData", {
          type: parts[1],
          devId: parts[2],
          value: JSON.parse(msg.payloadString),
        });
      }

      /**
       * Journalize service Token
       * example: 'status/Kzc5ODg4OTQ1MDgy/msg/journalToken'
       */
      const journal_token_topic = /^status\/(.+)\/msg\/journalToken$/;
      if (String(msg.destinationName).match(journal_token_topic)) {
        processed = true;
        this.$store.commit("setCloudJournalToken", msg.payloadString);
      }

      /**
       * Chat message
       * example: 'status/Kzc5ODg4OTQ1MDgy/msg/chat'
       */
      const chat_message_topic = /^status\/(.+)\/msg\/chat$/;
      if (String(msg.destinationName).match(chat_message_topic)) {
        processed = true;
        const now = new Date(Date.now());
        this.$store.commit("appendJournalizedMessage", {
          key: "chat",
          value: msg.payloadString,
          dt: now.toISOString(),
        });
      }

      /* does not processed */
      if (this.$store.state.application.debug && !processed) {
        window.console.log("unhandled msg:", msg);
        window.console.log("processed:", processed);
      }
    },
  },

  computed: {
    ...mapGetters([
      "application_fsm",

      "user_phone",
      "user_metadata",

      "mqtt",
      "mqtt_message",
      "is_mqtt_connected",

      "devices",

      "cloud",
      "cloud_journal_token",
      "cloud_messages",
    ]),

    auth0User() {
      return this.$auth.user;
    },

    isNotificationAvaliable() {
      return "Notification" in window;
    },

    isNotificationPermitted() {
      var result = false;
      if (this.isNotificationAvaliable) {
        window.console.log("Notify permission:", Notification.permission);
        result = Notification.permission === "granted";
      }
      return result;
    },

    isReady() {
      const FSM = this.application_fsm.states;
      const fsm_state = this.application_fsm.fsm;
      // window.console.log("FSM:", fsm_state);

      return (
        fsm_state != FSM.INIT.AUTHENTIFICATION &&
        fsm_state != FSM.INIT.REQUEST_USER_DATA &&
        fsm_state != FSM.INIT.AUTHORIZATION
      );
    },
  },

  watch: {
    auth0User: function(user) {
      const store = this.$store;
      const authService = this.$auth;
      // window.console.log("auth0User", user);
      if (authService.isAuthenticated) {
        store.commit("setAuthenticated", user);
      } else {
        store.commit("setAuthenticated", {
          authenticated: false,
        });
      }
    },

    application_fsm: function(value) {
      const FSM = value.states;

      switch (value.fsm) {
        case FSM.INIT.REQUEST_USER_DATA:
          {
            const user_id = this.$auth.user.sub;
            const url = this.$auth._data.auth0Client.options.audience;
            this.obtainUserData(url, user_id);
          }
          break;

        case FSM.INIT.AUTHORIZATION:
          {
            this.obtainCloudUserData();
          }
          break;

        case FSM.INIT.CONNECTION:
          {
            this.initMqttConnection();
          }
          break;

        case FSM.CONNECTED:
          {
            this.obtainCloudUserDevices();
          }
          break;
      }
      window.console.log("state:", value.fsm);
    },

    is_mqtt_connected: function(value) {
      if (value) {
        /**
         * Subscribe to intercom messages
         */
        const user_id = btoa(this.user_phone);
        const topic = "status/" + user_id + "/msg/#";
        this.$store.commit("mqttSubscribe", topic);
      }
    },

    cloud_journal_token: function(value) {
      /**
       * Get journalized messages from service
       */
      if (value && this.cloud_messages.length === 0) {
        getJournalizedMessages(value, btoa(this.user_phone))
          .then((response) => {
            // window.console.log(JSON.stringify(response.data));
            this.$store.commit("setJournalizedMessages", response.data);
          })
          .catch((err) => {
            if ("response" in err) window.console.log("ERROR:", err.response);
            else window.console.log("ERROR:", err);
            // setTimeout(() => this.obtainCloudUserDevices(), 5000);
          });
      }
      // window.console.log("cloud_journal_token:", value);
    },

    // devices: function(list, old) {
    //   window.console.log("devices current:", list);
    //   window.console.log("devices old:", old);
    //   // for (let index in list) {
    //   //   const topic = "status/" + user_id + "/msg/#";
    //   //   mqttSubscribe(this.mqtt.instance, topic);
    //   // }
    // },
  },

  data: () => {
    return {
      alertNotification: {
        visible: false,
        variant: "warning",
        data: {
          title: "",
          options: {},
        },
      },
    };
  },
};
</script>

<style lang="scss">
// Base grayscale colors definitions
$white: #fff !default;
$gray-100: #f8f9fa !default;
$gray-200: #e9ecef !default;
$gray-300: #dee2e6 !default;
$gray-400: #ced4da !default;
$gray-500: #adb5bd !default;
$gray-600: #6c757d !default;
$gray-700: #495057 !default;
$gray-800: #343a40 !default;
$gray-900: #212529 !default;
$black: #000 !default;

// Base colors definitions
$blue: #007bff !default;
$indigo: #6610f2 !default;
$purple: #6f42c1 !default;
$pink: #e83e8c !default;
$red: #dc3545 !default;
$orange: #fd7e14 !default;
$yellow: #ffc107 !default;
$green: #28a745 !default;
$teal: #20c997 !default;
$cyan: #17a2b8 !default;

// BASTION color scheme
$bastion-blue: #01488a !default;

// Theme color default definitions
$primary: $bastion-blue !default;
$secondary: $gray-600 !default;
$success: $green !default;
$info: $cyan !default;
$warning: $yellow !default;
$danger: $red !default;
$light: $gray-100 !default;
$dark: $gray-800 !default;

// This table defines the theme colors (variant names)
$theme-colors: () !default;
$theme-colors: map-merge(
  (
    "primary": $primary,
    "secondary": $secondary,
    "success": $success,
    "info": $info,
    "warning": $warning,
    "danger": $danger,
    "light": $light,
    "dark": $dark,
  ),
  $theme-colors
);

// Import Bootstrap and BootstrapVue source SCSS files
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";

// General style overrides and custom classes
body {
  margin: 0;
  font: 1rem/1.5 var(--font-family-sans-serif);
}

a {
  color: var(--blue);
}

.content {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 64px;
}
</style>
