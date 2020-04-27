<template>
  <div>
    <div class="title">
      <h2>Уведомления:</h2>
    </div>

    <b-media
      class="mx-2 mb-2 pb-2"
      style="border-bottom: 1px solid rgba(0, 0, 0, 0.125);"
      v-for="(item, i) in notifications"
      @click="sendNotification(i)"
      :key="i"
    >
      <template v-slot:aside>
        <!-- <b-avatar class="my-3" size="4rem" :src="item.options.icon"></b-avatar> -->
        <b-img width="64" alt="img" :src="item.options.icon"></b-img>
      </template>

      <div class="row no-gutters justify-content-between align-items-center">
        <div class="col-9">
          <div class="text-truncate">
            <strong>{{ item.title }}</strong>
          </div>
        </div>
        <!-- <div class="col-2 justify-content-end mr-1">
                  <b-icon icon="pencil" />
                </div> -->
      </div>

      <div
        v-if="item.options.body !== ''"
        class="row no-gutters justify-content-between"
      >
        <div class="text-wrap">
          {{ item.options.body }}
        </div>
      </div>

      <div class="row no-gutters justify-content-between mb-2">
        <div
          class="text-truncate"
          style="font: 0.66rem/1.5 var(--font-family-sans-serif);"
          v-if="item.options.tag !== undefined"
        >
          tag: [{{ item.options.tag }}]
        </div>
      </div>
    </b-media>
  </div>
</template>

<script>
export default {
  methods: {
    sendNotification(i) {
      // https://developer.mozilla.org/ru/docs/Web/API/ServiceWorkerRegistration/showNotification
      if (Notification.permission === "granted") {
        var msg = this.notifications[i];

        window.console.log(msg.title);
        navigator.serviceWorker.getRegistration().then(function(reg) {
          if (!msg.options.data) msg.options.data = {};
          msg.options.data.dateOfArrival = Date.now();
          msg.options.data.primaryKey = i;

          if (reg) reg.showNotification(msg.title, msg.options);
        });
      } else window.console.log("permission:", Notification.permission);
    },
  },

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
