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
import { getCloudUserData, getCloudUserDevices } from "@/cloud/cloudService";

import { mqttConnect, mqttHeartbeat } from "@/mqtt/mqttService";

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

    // MQTT
    initMqttConnection() {
      if (this.mqtt.instance === null) {
        mqttConnect(this.$store, this.onMqttMessage);
        setInterval(() => {
          /* Heartbeat/Reconnect */
          mqttHeartbeat(this.$store, btoa(this.user_phone));
        }, 5000); //FOXME: interval
      }
    },

    onMqttMessage(msg) {
      // if (this.$store.state.application.debug) {
      //   window.console.log("msg:", msg);
      // }

      let parts = null;
      /**
       * Device status
       * example: 'FF00/NTdHEDI5MTA8AEoA/status'
       */
      const device_status_topic = /^(.+)\/(.+)\/status$/;
      parts = String(msg.destinationName).match(device_status_topic);
      if (parts) {
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
        // window.console.log(`device ${parts[1]}/${parts[2]} data`);
        this.$store.commit("setDeviceData", {
          type: parts[1],
          devId: parts[2],
          value: JSON.parse(msg.payloadString),
        });
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
    ]),

    auth0User() {
      return this.$auth.user;
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
