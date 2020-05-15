<template>
  <b-container class="bg-primary text-light">
    <b-media
      v-if="is_authenticated"
      class="px-2"
      vertical-align="center"
      style="font-size: 0.8rem;"
      no-body
      @click="navigateToProfile"
    >
      <b-media-aside vertical-align="center">
        <b-avatar
          class="my-3"
          size="3.6rem"
          variant="primary"
          badge-bottom
          badge-right
          badge-offset="-7px"
          badge-variant="danger"
          :badge="userBadge"
          :text="user_picture.alt"
          :src="user_picture.src"
          rounded
        ></b-avatar>
      </b-media-aside>

      <b-media-body class="mt-3 pl-2" style="width: 200px;">
        <div class="text-truncate">
          <strong>{{ user_name }}</strong>
        </div>
        <div v-if="user_email !== ''" class="text-truncate">
          {{ user_email }}
        </div>
        <div v-if="user_phone !== ''" class="text-truncate">
          {{ user_phone }}
        </div>
      </b-media-body>

      <!-- <template v-slot:aside> -->
      <!-- </template> -->

      <!-- <div
        class="row no-gutters justify-content-between align-items-center mt-3"
      >
        <div class="col-9 text-truncate">
          <strong>{{ user_name }}</strong>
        </div>
        <div class="col-2 justify-content-end mr-1">
          <b-icon icon="pencil" />
        </div>
      </div>

      <p v-if="user_email !== ''" class="text-truncate">
        {{ user_email }}
      </p>

      <p v-if="user_phone !== ''" class="text-truncate">
        {{ user_phone }}
      </p> -->
    </b-media>

    <!-- <div class="row no-gutters py-3">
      <b-button v-if="is_authenticated" @click="logout" variant="warning" block>
        Выйти из аккаунта
      </b-button>
      <b-button v-else @click="login" variant="success" block>
        Вход в аккаунт
      </b-button>
    </div> -->
  </b-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {},

  methods: {
    navigateToProfile() {
      if (this.$route.path !== "/profile") this.$router.push("/profile");
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
