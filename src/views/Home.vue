<template>
  <div class="home">
    <b-container class="d-flex justify-content-center my-3">
      <img v-if="isAuthenticated" alt="USER" :src="userPicture" />
    </b-container>

    <!-- 

    <div>
      <pre>{{ JSON.stringify($auth.user.data, null, 2) }}</pre>
    </div> -->
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},

  computed: {
    isAuthenticated() {
      return !this.$auth.loading && this.$auth.isAuthenticated;
    },

    userPicture() {
      if (this.isAuthenticated) return this.$auth.user.picture;
      else return "";
    },

    userData() {
      if (this.$root.$data.userData) return this.$root.$data.userData;
      else return null;
    },
  },
};
</script>
