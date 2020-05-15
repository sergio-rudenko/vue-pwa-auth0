<template>
  <div>
    <div class="title">
      <h2>Уведомления:</h2>
    </div>

    <div
      class="m-2 pb-2"
      style="border-bottom: 1px solid rgba(0, 0, 0, 0.125);"
      v-for="(item, i) in notifications"
      @click="sendNotification(i)"
      :key="i"
    >
      <app-notification :data="item" />
    </div>
  </div>
</template>

<script>
import AppNotification from "@/components/AppNotification.vue";

export default {
  components: {
    AppNotification,
  },

  methods: {
    sendNotification(i) {
      // https://developer.mozilla.org/ru/docs/Web/API/ServiceWorkerRegistration/showNotification
      const app = this.$root.$children[0]; // for access App
      var notification = this.notifications[i];

      if (app.isNotificationPermitted) {
        navigator.serviceWorker.getRegistration().then(function(reg) {
          if (!notification.options.data) notification.options.data = {};
          notification.options.data.dateOfArrival = Date.now();
          notification.options.data.primaryKey = i;

          if (reg) {
            // window.console.log("reg:", reg);
            reg.showNotification(notification.title, notification.options);
          } else {
            app.showAlertNotification(notification);
          }
        });
      } else {
        app.showAlertNotification(notification);
      }
    },
  },

  computed: {},

  data: () => {
    return {
      notifications: [
        {
          title: "Hello World!",
          options: {
            body: "Some text in english",
            icon: require("@/assets/ionic-logo.png"),
            tag: "hello_world_message_EN",
          },
        },
        {
          title: "Здравствуй, Мир!",
          options: {
            body: "Сообщение на русском языке",
            icon: require("@/assets/html5-logo.png"),
            tag: "hello_world_message_RU",
          },
        },
        {
          title: "Многострочное сообщение...",
          options: {
            body:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
            Donec volutpat faucibus enim, ac rutrum neque vestibulum \
            rhoncus. Cras commodo ante id molestie vulputate. Pellentesque \
            blandit metus id lacus commodo consequat. Donec facilisis.",
            icon: require("@/assets/python-logo.png"),
          },
        },
        {
          title: "Две кнопки:",
          options: {
            body: "Переход на google.com и отмена",
            icon: require("@/assets/auth0-logo.png"),
            actions: [
              {
                action: "explore",
                title: "Google",
                icon: "images/checkmark.png",
              },
              {
                action: "close",
                title: "Закрыть",
                icon: "images/xmark.png",
              },
            ],
            data: {
              url: "https://www.google.com",
            },
          },
        },
        {
          title: "C вибрацией, 'Buzz! Buzz!'",
          options: {
            body: "Проверка заданной вибрации",
            icon: require("@/assets/logo.png"),
            vibrate: [200, 100, 200, 100, 200, 100, 200],
          },
        },
      ],
    };
  },
};
</script>

<style scoped>
.title {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
