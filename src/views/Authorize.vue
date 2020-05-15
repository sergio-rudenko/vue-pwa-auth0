<template>
  <div class="content">
    <img
      src="@/assets/logo.png"
      alt="LOGO"
      width="64"
      height="64"
      class="mb-4"
    />

    <div v-if="timeout_value === 0">
      <p>
        Авторизация пользователя <br />
        по номеру телефона
      </p>
      <input-user-phone
        :phone="user_phone"
        v-on:action="authorizeCloudUser($event)"
      />
    </div>

    <div v-else>
      <p class="px-4">
        Введите код для подтверждения авторизации, полученный на номер
        <strong>{{ user_phone }}</strong> в СМС от bast.ru
      </p>
      <input-sms-code v-on:action="confirmSmsCode($event)" />
      <p class="mt-4" v-if="timeoutHumanReadable !== ''">
        Повторная отправка кода <br />будет доступна через <br />
        <strong>{{ timeoutHumanReadable }}</strong>
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { updateUserData } from "@/auth/authService";
import { registerUser, authorizeUser, confirmCode } from "@/cloud/lkService";

import InputUserPhone from "@/components/InputUserPhone.vue";
import InputSmsCode from "@/components/InputSmsCode.vue";

export default {
  components: {
    InputUserPhone,
    InputSmsCode,
  },

  methods: {
    _onSuccess(result) {
      const authService = this.$auth;
      const user_id = authService.user.sub;
      const url = authService._data.auth0Client.options.audience;

      updateUserData(url, user_id, {
        bastLkToken: result.headers["token"],
        nested: {
          nested_num: 123,
        },
      }).then((data) => {
        // window.console.log("data:", data);
        this.$store.commit("setUserData", data);
      });

      // window.console.log("code confirmed!", result);
      this.$store.commit("setCloudData", result.data);
    },

    authorizeCloudUser(user_phone) {
      this.user_phone = user_phone;

      authorizeUser(user_phone)
        .then(() => {
          this.startTimer(this.timeout);
        })
        .catch((error) => {
          // window.console.log("error:", error);
          if (error.response.status == 400) {
            // window.console.log("error reason:", error.response.data);
            this.registerCloudUser(
              this.user_name,
              this.user_phone,
              this.user_email
            );
          }
        });
    },

    registerCloudUser(user_name, user_phone, user_email) {
      //9888945082
      registerUser(user_name, user_phone, user_email)
        .then(() => {
          this.startTimer(this.timeout);
        })
        .catch((error) => {
          window.console.log("error:", error);
          window.console.log("response:", error.response);
        });
    },

    confirmSmsCode(code) {
      // CORS!!! add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range,Token' always;
      confirmCode(this.user_phone, code)
        .then((result) => {
          const authService = this.$auth;
          const user_id = authService.user.sub;
          const url = authService._data.auth0Client.options.audience;

          updateUserData(url, user_id, {
            // save authorization token
            bast_token: result.headers["token"],
          }).then((data) => {
            // window.console.log("data:", data);
            this.$store.commit("setAuthMetadata", data);
          });
          // window.console.log("code confirmed!", result);
          this.$store.commit("setCloudUserData", result.data);
        })
        .catch((error) => window.console.log("error:", error));
    },

    startTimer(value) {
      const self = this;

      if (self.timer) clearTimeout(self.timer);
      self.timeout_value = value;

      self.timer = setTimeout(function f() {
        self.timeout_value--;
        if (self.timeout_value) setTimeout(f, 1000);
      }, 1000);
    },
  },

  computed: {
    ...mapGetters([
      "is_authenticated",
      "is_authorized",
      "user_name",
      "user_email",
      "user",
    ]),

    timeoutHumanReadable() {
      var result = "";
      if (this.timeout_value > 0) {
        const minutes = Math.floor(this.timeout_value / 60);
        const seconds = this.timeout_value - minutes * 60;

        result += minutes ? minutes + " мин. " : "";
        result += (seconds ? seconds : "00") + " сек.";
      }
      return result;
    },
  },

  watch: {
    is_authenticated: function(value) {
      if (!value) this.$router.push("/");
    },

    is_authorized: function(value) {
      if (value) this.$router.push("/");
    },
  },

  data: () => {
    return {
      timeout: 300,

      timer: null,
      timeout_value: 0,

      user_phone: "",
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
  margin-top: 32px;
}
</style>
