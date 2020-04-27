<template>
  <div>
    <b-navbar toggleable="true" type="dark" variant="primary">
      <b-icon
        icon="list"
        scale="1.5"
        class="text-light"
        @click="sidebarActive = true"
      />
      <b-navbar-brand href="#">
        {{ $route.name }}
      </b-navbar-brand>

      <!-- TODO: CloudIndicator -->
      <b-icon icon="star" scale="1.25" variant="secondary" />
      <!-- <b-iconstack font-scale="2.5">
        <b-icon stacked icon="cloud" scale="0.75" variant="secondary"></b-icon>
        <b-icon stacked icon="slash-circle" variant="warning"></b-icon>
      </b-iconstack> -->
    </b-navbar>

    <b-sidebar v-model="sidebarActive" no-header backdrop>
      <template v-slot:default>
        <auth-user-card />

        <!-- TODO: menu component -->
        <b-list-group>
          <div v-for="(item, i) in menuItems" :key="i">
            <b-list-group-item
              v-if="item.type && item.type === 'header'"
              class="d-flex align-items-center"
            >
              <span
                class="py-0"
                style="font: 0.75rem/1.5 var(--font-family-sans-serif);"
              >
                {{ item.title }}
              </span>
            </b-list-group-item>

            <b-list-group-item
              v-else-if="item.path !== $route.path"
              style="border: 0px solid rgba(0, 0, 0, 0.125);"
              class="d-flex align-items-center"
              :disabled="item.disabled"
              :to="item.path"
            >
              <b-icon
                v-if="item.icon"
                :icon="item.icon"
                scale="1.2"
                variant="medium"
              ></b-icon>
              <span class="pl-3"> {{ item.title }}</span>
            </b-list-group-item>
          </div>
        </b-list-group>
      </template>

      <template v-slot:footer>
        <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
          <strong class="mr-auto">version: {{ version }}</strong>

          <b-button
            v-if="updateExists"
            @click="refreshApp"
            variant="success"
            size="sm"
          >
            New version available! <br />
            Click to update
          </b-button>

          <b-button v-else @click="reloadApp" size="sm">
            Releoad source
          </b-button>
        </div>
      </template>
    </b-sidebar>

    <b-alert
      v-model="updateAlertActive"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="info"
      dismissible
    >
      <b-container class="d-flex align-items-center">
        <strong class="mr-auto">Доступна новая версия</strong>
        <b-button @click="refreshApp" size="sm" variant="success">
          Обновить
        </b-button>
      </b-container>
    </b-alert>

    <b-alert
      v-model="newVersionAlertActive"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="success"
      dismissible
    >
      <b-container class="d-flex align-items-center">
        <strong class="mr-auto">Обновлено:</strong>
        v{{ oldVersion }} -> v{{ version }}
      </b-container>
    </b-alert>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import AuthUserCard from "@/components/AuthUserCard.vue";

export default {
  components: {
    AuthUserCard,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },

  methods: {
    showRefreshUI(e) {
      this.registration = e.detail;

      this.updateAlertActive = true;
      this.updateExists = true;

      if (Notification.permission === "granted") {
        navigator.serviceWorker.getRegistration().then(function(reg) {
          var options = {
            body: "Доступна новая версия. Обновмте приложение.",
            icon: "img/icons/android-chrome-192x192.png",
            vibrate: [100, 50, 100],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: 1,
            },
            // actions: [
            //   {
            //     action: "explore",
            //     title: "Explore this new world",
            //     icon: "images/checkmark.png",
            //   },
            //   {
            //     action: "close",
            //     title: "Close notification",
            //     icon: "images/xmark.png",
            //   },
            // ],
          };
          if (reg) reg.showNotification("Hello from vue pwa!", options);
        });
      }
    },

    refreshApp() {
      this.updateExists = false;
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      this.registration.waiting.postMessage("skipWaiting");
    },

    reloadApp() {
      window.location.reload();
    },
  },

  computed: {
    ...mapGetters(["version"]),
  },

  created() {
    document.addEventListener("swUpdated", this.showRefreshUI, { once: true });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.refreshing) return;
      this.refreshing = true;
      this.reloadApp();
    });

    this.oldVersion = localStorage.getItem("previous_version");
    if (this.oldVersion) {
      this.newVersionAlertActive = true;
      localStorage.removeItem("previous_version");
    }
  },

  data: () => {
    return {
      menuItems: [
        {
          title: "Меню приложения:",
          type: "header",
        },
        {
          title: "Главная",
          icon: "house",
          path: "/",
          disabled: false,
          divider: true,
        },
        {
          title: "Пользователь",
          icon: "people-circle",
          path: "/profile",
          disabled: false,
          divider: true,
        },
        {
          title: "Тестирование",
          icon: "tools",
          path: "/testing",
          disabled: false,
          divider: true,
        },
        {
          title: "Настройки",
          icon: "gear",
          path: "/settings",
          disabled: true,
          divider: true,
        },
        {
          title: "О программе",
          icon: "info-circle",
          path: "/about",
          disabled: false,
          divider: false,
        },
      ],

      sidebarActive: false,

      updateAlertActive: false,
      newVersionAlertActive: false,

      oldVersion: null,

      refreshing: false,
      registration: null,
      updateExists: false,
    };
  },
};
</script>
