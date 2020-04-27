<template>
  <b-container class="bg-primary text-light">
    <b-media v-if="isAuthenticated" class="px-2">
      <template v-slot:aside>
        <b-avatar
          class="my-3"
          size="4rem"
          :text="userPicture === '' ? userPictureAlt : ''"
          :src="userPicture"
        ></b-avatar>
      </template>

      <div
        class="row no-gutters justify-content-between align-items-center mt-3"
      >
        <div class="col-9">
          <div class="text-truncate">
            <strong>{{ userFullName }}</strong>
          </div>
        </div>
        <!-- <div class="col-2 justify-content-end mr-1">
                  <b-icon icon="pencil" />
                </div> -->
      </div>

      <div
        v-if="userEmail !== ''"
        class="row no-gutters justify-content-between"
      >
        <div class="text-truncate">
          {{ userEmail }}
        </div>
      </div>

      <div
        v-if="userPhone !== ''"
        class="row no-gutters justify-content-between mb-2"
      >
        <div class="text-truncate">
          {{ userPhone }}
        </div>
      </div>
    </b-media>

    <div class="row no-gutters py-3">
      <b-button v-if="isAuthenticated" @click="logout" variant="warning" block>
        Выйти из аккаунта
      </b-button>
      <b-button v-else @click="login" variant="success" block>
        Вход в аккаунт
      </b-button>
    </div>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {},

  methods: {
    login() {
      window.console.log("login");
      this.$auth.loginWithRedirect();
    },

    logout() {
      window.console.log("logout...");
      this.$auth.logout({
        returnTo: window.location.origin,
      });
    },
  },

  computed: {
    ...mapGetters(["user"]),

    isAuthenticated() {
      return this.$auth.isAuthenticated;
    },

    userPicture() {
      var result = "";
      const user = this.user;
      if (user.picture) {
        result = user.picture;
      }
      return result;
    },

    userPictureAlt() {
      const user = this.user;
      const n = user.given_name.split("")[0] || ".";
      const f = user.family_name.split("")[0] || ".";

      return n.toUpperCase() + f.toUpperCase();
    },

    userFullName() {
      var result = "";
      const user = this.user;
      if (user.given_name) result += user.given_name;
      if (user.family_name) result += " " + user.family_name;

      if (result === "" && user.nickname) {
        result += user.nickname;
      }
      return result;
    },

    userEmail() {
      var result = "";
      const user = this.user;
      if (user.email_verified) {
        result = user.email;
      }
      return result;
    },

    userPhone() {
      return "";
    },
  },

  data: () => {
    return {};
  },
};
</script>
