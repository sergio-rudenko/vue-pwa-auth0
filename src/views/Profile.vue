<template>
  <div class="content">
    <div>
      <img
        height="128"
        width="128"
        :alt="user_picture.alt"
        :src="user_picture.src"
      />
      <h2>{{ user_name }}</h2>
      <p v-if="user_email !== ''">
        email: <strong>{{ user_email }}</strong>
      </p>
      <p v-if="user_phone !== ''">
        phone: <strong>{{ user_phone }}</strong>
      </p>

      <b-button v-if="!is_authorized" variant="warning" :to="'/authorize'">
        Авторизация
      </b-button>

      <p v-if="mqtt.username !== ''">
        MQTT user: <strong>{{ mqtt.username }}</strong>
      </p>
      <p v-if="mqtt.password !== ''">
        MQTT pass: <strong>{{ mqtt.password }}</strong>
      </p>
    </div>

    <b-button v-if="is_authenticated" @click="logout" variant="warning">
      Выйти из аккаунта
    </b-button>
    <!-- <b-button v-else @click="login" variant="success">
      Вход в аккаунт
    </b-button> -->
    <!-- <div>
      <pre>{{ JSON.stringify($store.state.user, null, 2) }}</pre>
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  methods: {
    login() {
      window.console.log("login");
      this.$auth.loginWithRedirect();
      //this.$auth.loginWithPopup();
    },

    logout() {
      window.console.log("logout...");
      this.$auth.logout({
        returnTo: window.location.origin,
      });
    },
  },

  computed: {
    ...mapGetters([
      "is_authenticated",
      "is_authorized",
      "user_name",
      "user_email",
      "user_phone",
      "user_picture",
      "user_metadata",
      "mqtt",
    ]),
  },

  data: () => {
    return {};
  },
};
</script>

<style scoped>
.content {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 10px;
}
</style>
