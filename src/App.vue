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
import { getCloudData } from "@/cloud/cloudService";

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
  },

  computed: {
    ...mapGetters(["application_fsm"]),

    auth0User() {
      return this.$auth.user;
    },

    isReady() {
      const FSM = this.application_fsm.states;
      const fsm_state = this.application_fsm.fsm;
      window.console.log("FSM:", fsm_state);

      return (
        fsm_state == FSM.NOT.AUTHENTIFICATED ||
        fsm_state == FSM.NOT.AUTHORIZED ||
        fsm_state == FSM.INIT.CONNECTION
      );
    },
  },

  watch: {
    auth0User: function(user) {
      // window.console.log("auth0User", user);
      if (this.$auth.isAuthenticated) {
        this.$store.commit("setAuthenticated", user);
      } else {
        this.$store.commit("setAuthenticated", {
          authenticated: false,
        });
      }
    },

    application_fsm: function(value) {
      const FSM = value.states;

      switch (value.fsm) {
        case FSM.INIT.REQUEST_USER_DATA:
          {
            const authService = this.$auth;
            const user_id = authService.user.sub;
            const url = authService._data.auth0Client.options.audience;

            getUserData(url, user_id)
              .then((data) => {
                this.$store.commit("setMetadata", data);
              })
              .catch((err) => window.console.log("ERROR:", err.response)); //FIXME!
          }
          break;

        case FSM.INIT.AUTHORIZATION:
          {
            const metadata = this.$store.state.user.user_metadata;
            const token = metadata.bast_token;

            getCloudData(token)
              .then((response) => {
                this.$store.commit("setCloudData", response.data);
              })
              .catch((err) => window.console.log("ERROR:", err.response)); //FIXME!
          }
          break;

        case FSM.INIT.CONNECTION:
          {
            window.console.log("MQTT...");
          }
          break;
      }
      // window.console.log("state:", state);
    },
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
