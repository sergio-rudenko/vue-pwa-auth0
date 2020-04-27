<template>
  <div id="app">
    <navigation title="CLOUD::BAST" />
    <router-view />

    <!-- <b-container class="d-flex justify-content-center my-3">
      <b-button size="sm" @click="myAction">
        DEBUG: action
      </b-button>
    </b-container> -->
  </div>
</template>

<script>
import { getUserData } from "@/auth/authService";
import Navigation from "@/components/Navigation.vue";

export default {
  components: {
    Navigation,
  },

  methods: {
    myAction() {
      window.console.log("previous_version", "0.0.X");
      localStorage.setItem("previous_version", "0.0.X");
    },
  },

  computed: {
    isAuthenticated() {
      return this.$auth.isAuthenticated;
    },

    auth0User() {
      return this.$auth.user;
    },
  },

  watch: {
    auth0User: function(user) {
      // window.console.log("auth0User", user);

      if (this.isAuthenticated) {
        this.$store.commit("setUser", user);

        const authService = this.$auth;

        const user_id = authService.user.sub;
        const url = authService._data.auth0Client.options.audience;

        getUserData(url, user_id).then((data) => {
          // window.console.log("data:", data);
          this.$store.commit("setUserData", data);
        });
      }
    },

    isAuthenticated: function(authenticated) {
      window.console.log("isAuthenticated:", authenticated);
    },
  },

  data: () => {
    return {};
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
</style>
