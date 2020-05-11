<template>
  <div class="home">
    <b-container> </b-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  components: {},

  beforeMount() {
    this.checkRedirect();
  },

  methods: {
    checkRedirect() {
      if (!this.is_authenticated) {
        window.console.log("Isn`t authenticated, redirecting...");
        this.$router.push("/authenticate");
      } else if (!this.is_authorized) {
        window.console.log("Isn`t authorized, redirecting...");
        this.$router.push("/authorize");
      }
    },
  },

  computed: {
    ...mapGetters(["is_authenticated", "is_authorized", "mqtt"]),
  },

  watch: {
    is_authenticated: function(value) {
      if (!value) this.checkRedirect();
    },

    is_authorized: function(value) {
      if (!value) this.checkRedirect();
    },
  },

  data: () => {
    return {};
  },
};
</script>
