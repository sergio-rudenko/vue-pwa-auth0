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
          <b-button size="sm" @click="reload()">
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
    reload() {
      window.location.reload();
    },
  },

  computed: {
    ...mapGetters(["version"]),
  },

  data: () => {
    return {
      sidebarActive: false,
    };
  },
};
</script>
