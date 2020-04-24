<template>
  <div>
    <b-navbar toggleable="true" type="dark" variant="primary">
      <b-icon
        icon="list"
        scale="2.5"
        class="text-light"
        @click="sidebarActive = true"
      />
      <b-navbar-brand href="#">
        {{ logo }}
      </b-navbar-brand>

      <!-- TODO: CloudIndicator -->
      <b-iconstack font-scale="2.5">
        <b-icon stacked icon="cloud" scale="0.75" variant="secondary"></b-icon>
        <b-icon stacked icon="slash-circle" variant="warning"></b-icon>
      </b-iconstack>
    </b-navbar>

    <b-sidebar v-model="sidebarActive" no-header backdrop>
      <template v-slot:default>
        <auth-user-card />
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
    logo: {
      type: String,
      required: true,
    },
  },

  methods: {
    showRefreshUI(e) {
      this.registration = e.detail;
      this.updateExists = true;
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
  },

  data: () => {
    return {
      sidebarActive: false,

      refreshing: false,
      registration: null,
      updateExists: false,
    };
  },
};
</script>
