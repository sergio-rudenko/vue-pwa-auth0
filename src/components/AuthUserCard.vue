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
      if (this.user.picture) {
        result = this.user.picture;
      }
      return result;
    },

    userPictureAlt() {
      return "..";
    },

    userFullName() {
      var result = "";

      if (this.user.given_name) result += this.user.given_name;

      if (this.user.family_name) result += " " + this.user.family_name;

      if (result === "" && this.user.nickname) {
        result += this.user.nickname;
      }
      return result;
    },

    userEmail() {
      var result = "";
      if (this.user.email_verified) {
        result = this.user.email;
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
