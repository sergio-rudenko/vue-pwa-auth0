<template>
  <div class="content">
    <img
      src="@/assets/logo.png"
      alt="LOGO"
      width="64"
      height="64"
      class="mb-4"
    />
    <h3>Не выполнен вход в аккаунт.</h3>
    <p>
      Пожалуйста, воспользуйтесь кнопкой в меню или
      <b-link to="/profile">ссылкой на профиль пользователя</b-link>
    </p>
  </div>
</template>

<script>
export default {
  computed: {
    isAuthenticated() {
      return this.$auth.isAuthenticated;
    },
  },

  watch: {
    isAuthenticated: function(value) {
      if (value) this.$router.push("/");
    },
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
  margin-top: 32px;
}
</style>
