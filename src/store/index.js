import Vue from "vue";
import Vuex from "vuex";

const axios = require("axios").default;

var _timer = null;
var _uptime = 0;

const _updateObject = function(source, destination) {
  for (var key in source) {
    destination[key] = source[key];
  }
};

Vue.use(Vuex);
export default new Vuex.Store({
  strict: true,

  state: {
    debug: true,
    version: "0.0.6 rc8",

    user: {
      picture: "",
      nickname: "",
      given_name: "",
      family_name: "",
      email: "",
      email_verified: false,
      phone: "",
      phone_verified: false,
      app_metadata: {},
      user_metadata: {
        bast_token: "",
      },
    },

    cloud: {
      name: "", // имя пользователя
      phone: "", // телефон в международном формате
      email: "", // электронная почта
      mqttClientId: "", // clientId для подключения к MQTT-брокеру
      mqttUsername: "", // username для авторизации на MQTT-брокере, 16 символов
      mqttPassword: "", // пароль для авторизации на MQTT-брокере, 16 символов
    },
  },

  getters: {
    version: (state) => {
      return state.version;
    },

    user: (state) => {
      return state.user;
    },

    user_name: (state) => {
      var result = "";
      const user = state.user;

      if (user.given_name) result += user.given_name;
      if (user.family_name) result += " " + user.family_name;

      if (result === "" && user.name) {
        result += user.name;
      }

      if (result === "" && user.nickname) {
        result += user.nickname;
      }
      return result ? result : "Пользователь";
    },

    user_email: (state) => {
      const user = state.user;
      return user.email_verified ? user.email : "";
    },

    app_metadata: (state) => {
      return state.user.app_metadata;
    },

    user_metadata: (state) => {
      return state.user.user_metadata;
    },

    cloud: (state) => {
      return state.cloud;
    },
  },

  mutations: {
    setUserData(state, data) {
      if (state.debug) window.console.log("setUserData:", data);
      _updateObject(data, state.user);
    },

    setCloudData(state, data) {
      if (state.debug) window.console.log("setCloudData:", data);
      _updateObject(data, state.cloud);
    },
  },

  actions: {
    requestCloudApi(context, req) {
      if (context.state.debug) window.console.log("requestCloudApi data:", req);

      if (!("url" in req)) {
        window.console.log("ERROR: 'url' required!");
        return;
      }

      if (!("method" in req)) {
        window.console.log("ERROR: 'method' required!");
        return;
      }

      axios({
        url: req.url,
        method: req.method,
        baseURL: context.state.cloud.baseURL,
        headers: "token" in req ? { Token: req.token } : null,
        data: "data" in req ? req.data : null,
      })
        .then((response) => {
          context.commit("_onCloudApiResponse", response);

          if (
            response.config.method === "post" &&
            response.config.url == "/cloud/user/authorize"
          ) {
            // authorize request sent. set timeout
            context.commit("_updateAuthorizeRequestTimeout", 5 * 60);

            setTimeout(function f() {
              context.commit("_updateAuthorizeRequestTimeout", -1);
              if (context.state.cloud.authorizeRequestTimeout)
                setTimeout(f, 1000);
            }, 1000);
          }
        })
        .catch((error) => window.console.log("requestCloudApi ERROR:", error));
    },

    startIntervalPeriodic(context, interval = 1) {
      if (_timer) clearInterval(_timer);

      if (context.state.debug)
        window.console.log("startIntervalPeriodic interval:", interval);

      _timer = setInterval(() => {
        if (_uptime % 15 == 0) {
          //this.dispatch("");
          window.console.log("uptime:", _uptime);
        }
        _uptime++;
      }, interval * 1000);
    },
  },
  modules: {},
});
