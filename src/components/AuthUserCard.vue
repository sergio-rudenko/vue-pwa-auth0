<template>
  <b-container class="bg-primary text-light">
    <b-media v-if="is_authenticated" class="px-2">
      <template v-slot:aside>
        <b-avatar
          class="my-3"
          size="4rem"
          to="/profile"
          :badge="userBadge"
          badge-bottom
          badge-rigrht
          badge-offset="2px"
          variant="primary"
          badge-variant="danger"
          :text="user_picture.alt"
          :src="user_picture.src"
          rounded
        ></b-avatar>
      </template>

      <div
        class="row no-gutters justify-content-between align-items-center mt-3"
      >
        <div class="col-9">
          <div class="text-truncate">
            <strong>{{ user_name }}</strong>
          </div>
        </div>
        <!-- <div class="col-2 justify-content-end mr-1">
                  <b-icon icon="pencil" />
                </div> -->
      </div>

      <div
        v-if="user_email !== ''"
        class="row no-gutters justify-content-between"
      >
        <div class="text-truncate">
          {{ user_email }}
        </div>
      </div>

      <div
        v-if="user_phone !== ''"
        class="row no-gutters justify-content-between"
      >
        <div class="text-truncate">
          {{ user_phone }}
        </div>
      </div>
    </b-media>

    <div class="row no-gutters py-3">
      <b-button v-if="is_authenticated" @click="logout" variant="warning" block>
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
      "user_name",
      "user_email",
      "user_phone",
      "user_picture",
    ]),

    userBadge() {
      return null;
    },
  },

  data: () => {
    return {};
  },
};
</script>
