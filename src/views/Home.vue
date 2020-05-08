<template>
  <div class="home">
    <b-container>
      <b-form>
        <P class="pt-3 mb-2">Телефон:</P>
        <b-input-group class="mb-3">
          <template v-slot:prepend>
            <!-- <b-dropdown id="dropdown-left" text="RU" v-model="metadata">
              <b-dropdown-item>+7</b-dropdown-item>
              <b-dropdown-item>+380</b-dropdown-item>
            </b-dropdown> -->
            <b-form-select
              :options="countries"
              text-field="value.prefix"
              v-model="phone_metadata"
            />
          </template>
          <b-form-input
            v-model="phone_data"
            :state="phoneNumber !== null"
            :formatter="formatPhoneData"
            lazy-formatter
          ></b-form-input>
        </b-input-group>

        <b-form-group
          label="Текст:"
          description="Короткое сообщение для другого пользователя"
          style="border-bottom: 1px solid rgba(0, 0, 0, 0.125);"
          class="pb-3"
        >
          <b-form-input
            v-model="message"
            type="text"
            required
            placeholder="Значение не задано..."
            :state="message !== ''"
          ></b-form-input>
        </b-form-group>

        <div class="py-4">
          <b-button
            class="mr-2"
            variant="primary"
            :disabled="phoneNumber === null || message === ''"
            @click="onSubmit"
          >
            Отправить
          </b-button>
          <b-button
            class="mr-2"
            variant="danger"
            :disabled="false"
            @click="onReset"
          >
            Сбросить
          </b-button>
        </div>
      </b-form>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

// import { updateUserData } from "@/auth/authService";

export default {
  name: "Home",
  components: {},

  beforeMount() {
    this.checkRedirect();
  },

  methods: {
    checkRedirect() {
      if (!this.is_authenticated) {
        window.console.log("Isn`t authenticated, redirecting...");
        this.$router.push("/authenticate");
      } else if (!this.is_authorized) {
        window.console.log("Isn`t authorized, redirecting...");
        this.$router.push("/authorize");
      }
    },

    onSubmit() {
      window.console.log("onSubmit");
    },

    onReset() {
      window.console.log("onReset");
    },

    formatPhoneData(value) {
      var result = value;

      if (this.phoneNumber) {
        const re = this.phone_metadata.re;
        const parts = value.match(re);
        if (parts) {
          result = `(${parts[1]}) ${parts[2]} ${parts[3]}-${parts[4]}`;
        }
      }
      return result;
    },
  },

  computed: {
    ...mapGetters(["is_authenticated", "is_authorized"]),

    phoneNumber() {
      var result = "";
      const re = this.phone_metadata.re;
      const parts = this.phone_data.match(re);

      if (parts) {
        for (var i = 1; i < parts.length; i++) {
          result += parts[i];
        }
        result = this.phone_metadata.prefix + result;
      }
      return result ? result : null;
    },
  },

  watch: {
    is_authenticated: function(value) {
      if (!value) this.checkRedirect();
    },

    is_authorized: function(value) {
      if (!value) this.checkRedirect();
    },
  },

  data: () => {
    return {
      message: "",

      countries: [
        {
          text: "Россия",
          value: {
            prefix: "+7",
            re: /^[(]?([0-9]{3})[)]?[-\s.]?([0-9]{3})[-\s.]?([0-9]{2})[-\s.]?([0-9]{2})$/i,
          },
        },
        { text: "Украина", value: { prefix: "+380", re: /^\d{10}$/ } },
      ],
      // state: false,
      phone_data: "",
      phone_metadata: {
        prefix: "+7",
        re: /^[(]?([0-9]{3})[)]?[-\s.]?([0-9]{3})[-\s.]?([0-9]{2})[-\s.]?([0-9]{2})$/i,
      },
    };
  },
};
</script>

<style scoped>
.content {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 10px;
}
</style>
