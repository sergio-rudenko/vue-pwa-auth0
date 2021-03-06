<template>
  <b-container>
    <b-form @submit="onSubmit" @reset="onReset">
      <b-form-group
        label="Строковый параметр:"
        description="Параметры синхронизируются для пользователей с одинаковым адресом электронной почты"
        style="border-bottom: 1px solid rgba(0, 0, 0, 0.125);"
        class="pb-3"
      >
        <b-form-input
          v-model="settings.string_param"
          type="text"
          required
          placeholder="Значение не задано..."
        ></b-form-input>
      </b-form-group>

      <b-form-group
        style="border-bottom: 1px solid rgba(0, 0, 0, 0.125);"
        class="pb-3"
      >
        <b-form-checkbox switch v-model="settings.boolean_param">
          Бинарный параметр
        </b-form-checkbox>
      </b-form-group>

      <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.125);" class="pb-3">
        <label for="range-1">Числовой параметр (min/max)</label>
        <b-form-input
          id="range-1"
          v-model="settings.numeric_param"
          type="range"
          min="0"
          max="128"
        ></b-form-input>
        <div class="mt-2">Значение: {{ settings.numeric_param }}</div>
      </div>

      <div class="py-4">
        <b-button
          class="mr-2"
          variant="primary"
          :disabled="!settingsChanged"
          @click="onSubmit"
        >
          Сохранить
        </b-button>
        <b-button
          class="mr-2"
          variant="danger"
          :disabled="!settingsChanged"
          @click="onReset"
        >
          Сбросить
        </b-button>
      </div>
    </b-form>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex";
import { updateUserData } from "@/auth/authService";

export default {
  methods: {
    getParamsFromUserData() {
      const metadata = this.user_metadata;
      this.settings = {
        boolean_param: metadata.boolean_param,
        numeric_param: metadata.numeric_param,
        string_param: metadata.string_param,
      };
    },

    onSubmit() {
      if (this.is_authenticated) {
        const authService = this.$auth;
        const user_id = authService.user.sub;
        const url = authService._data.auth0Client.options.audience;

        // clone metadata and update with changed values
        var metadata = { ...this.$store.state.user.user_metadata };
        for (var key in this.settings) metadata[key] = this.settings[key];

        updateUserData(url, user_id, metadata).then((data) => {
          // window.console.log("data:", data);
          this.$store.commit("setAuthMetadata", data);
        });
      }
    },

    onReset() {
      this.getParamsFromUserData();
    },
  },

  computed: {
    ...mapGetters(["user_metadata", "is_authenticated", "is_authorized"]),

    settingsChanged() {
      const settings = this.settings;
      const metadata = this.user_metadata;
      return (
        settings.boolean_param != metadata.boolean_param ||
        settings.numeric_param != metadata.numeric_param ||
        settings.string_param != metadata.string_param
      );
    },
  },

  watch: {
    user_metadata: function() {
      if (this.settingsChanged) this.getParamsFromUserData();
    },
  },

  created() {
    this.getParamsFromUserData();
  },

  data: () => {
    return {
      settings: {
        boolean_param: false,
        string_param: "",
        numeric_param: 0,
      },
      email: "",
      phone: "",
    };
  },
};
</script>
