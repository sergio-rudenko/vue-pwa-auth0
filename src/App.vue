<template>
  <div id="app">
    <app-navigation title="CLOUD::BAST" />
    <router-view v-if="is_ready" />

    <b-overlay :show="!is_ready" spinner-variant="primary" spinner-type="grow">
      <div v-if="!is_ready" class="content">
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
import { getUserData } from "@/auth/authService";
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
    auth0User() {
      return this.$auth.user;
    },
  },

  watch: {
    auth0User: function(user) {
      // window.console.log("auth0User", user);

      if (this.$auth.isAuthenticated) {
        this.$store.commit("setUserData", user);

        const authService = this.$auth;

        const user_id = authService.user.sub;
        const url = authService._data.auth0Client.options.audience;

        getUserData(url, user_id).then((data) => {
          // window.console.log("data:", data);
          this.$store.commit("setUserData", data);
          this.is_ready = true;
        });
      } else {
        this.is_ready = !this.$auth.loading;
      }
    },
  },

  data: () => {
    return {
      is_ready: false,

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
