import Vue from "vue";
import Vuex from "vuex";

// const axios = require("axios").default;

// var _timer = null;
// var _uptime = 0;

const _updateObject = function(dst, src) {
  for (var key in src) {
    dst[key] = src[key];
  }
};

const FSM = {
  INIT: {
    AUTHENTIFICATION: "authentification",
    REQUEST_USER_DATA: "getting user data",
    AUTHORIZATION: "authorization",
    CONNECTION: "connection",
  },
  NOT: {
    AUTHENTIFICATED: "not authentificated",
    AUTHORIZED: "not authorized",
  },
  DISCONNECTED: "mqtt disconnected",
  CONNECTED: "mqtt connected",
};

Vue.use(Vuex);
export default new Vuex.Store({
  strict: true,

  state: {
    application: {
      debug: true,
      version: "0.0.9 rc2",

      fsm_state: FSM.INIT.AUTHENTIFICATION,
    },

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

        // test data
        boolean_param: "",
        numeric_param: "",
        string_param: "",
      },
    },

    cloud: {
      name: "", // имя пользователя
      phone: "", // телефон в международном формате
      email: "", // электронная почта

      mqttClientId: "", // clientId для подключения к MQTT-брокеру
      mqttUsername: "", // username для авторизации на MQTT-брокере, 16 символов
      mqttPassword: "", // пароль для авторизации на MQTT-брокере, 16 символов

      mqtt_host: "sa100cloud.com",
      mqtt_path: "/wss",
      mqtt_port: 443,

      mqtt_instance: null,
      mqtt_message: {},
    },

    deviceList: [],
    currentDevice: {
      devId: null,
      type: null,
    },
  },

  getters: {
    debug: (state) => {
      return state.application.debug;
    },

    version: (state) => {
      return state.application.version;
    },

    // STATE -----------------------------------------------------------------
    application_fsm: (state) => {
      return { fsm: state.application.fsm_state, states: FSM };
    },

    is_authenticated: (state) => {
      return (
        state.application.fsm_state != FSM.INIT.AUTHENTIFICATION &&
        state.application.fsm_state != FSM.NOT.AUTHENTIFICATED
      );
    },

    is_authorized: (state) => {
      return (
        state.application.fsm_state != FSM.INIT.AUTHORIZATION &&
        state.application.fsm_state != FSM.NOT.AUTHORIZED
      );
    },

    // USER ------------------------------------------------------------------
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

    user_phone: (state) => {
      const user = state.user;
      return user.phone_verified ? user.phone : "";
    },

    user_picture: (state) => {
      const user = state.user;
      const g = user.given_name.split("")[0] || ".";
      const f = user.family_name.split("")[0] || ".";

      return {
        src: user.picture,
        alt: g.toUpperCase() + f.toUpperCase(),
      };
    },

    app_metadata: (state) => {
      return state.user.app_metadata;
    },

    user_metadata: (state) => {
      return state.user.user_metadata;
    },

    // CLOUD -----------------------------------------------------------------
    cloud: (state) => {
      return state.cloud;
    },

    mqtt_message: (state) => {
      return state.cloud.mqtt_message;
    },
  },

  mutations: {
    // AUTH ------------------------------------------------------------------
    setAuthenticated(state, data) {
      if (state.application.debug)
        window.console.log("setAuthenticated:", data);

      if ("authenticated" in data && data.authenticated == false) {
        window.console.log("NOT Authentivated!");
        state.application.fsm_state = FSM.NOT.AUTHENTIFICATED;
      } else {
        _updateObject(state.user, data);
        state.application.fsm_state = FSM.INIT.REQUEST_USER_DATA;
      }
    },

    setMetadata(state, data) {
      if ("app_metadata" in data) {
        if (state.application.debug) {
          window.console.log("setMetadata, app:", data.app_metadata);
        }
        _updateObject(state.user.app_metadata, data.app_metadata);
      }

      if ("user_metadata" in data) {
        if (state.application.debug) {
          window.console.log("setMetadata, user:", data.user_metadata);
        }

        const bast_token = state.user.user_metadata.bast_token;
        if (data.user_metadata.bast_token != bast_token) {
          state.application.fsm_state = FSM.INIT.AUTHORIZATION;
        }

        if (
          !("bast_token" in data.user_metadata) ||
          data.user_metadata.bast_token == ""
        ) {
          window.console.log("NOT Authorized!");
          state.application.fsm_state = FSM.NOT.AUTHORIZED;
        }

        _updateObject(state.user.user_metadata, data.user_metadata);
      }
    },

    setCloudData(state, data) {
      if (state.application.debug) {
        window.console.log("setCloudData:", data);
      }
      _updateObject(state.cloud, data);

      if (state.cloud.email) {
        if (state.application.debug)
          window.console.log("email updated:", state.cloud.email);

        state.user.email = state.cloud.email;
        state.user.email_verified = true;
      }

      if (state.cloud.phone) {
        if (state.application.debug)
          window.console.log("phone updated:", state.cloud.phone);

        state.user.phone = state.cloud.phone;
        state.user.phone_verified = true;
      }

      state.application.fsm_state = FSM.INIT.CONNECTION;
    },

    // MQTT ------------------------------------------------------------------
    mqttInstance(state, data) {
      if (state.application.debug) {
        window.console.log("mqttinstance:", data);
      }
      state.cloud.mqtt_instance = data;
    },

    MQTT_ONOPEN(state) {
      if (state.application.debug) {
        window.console.log("MQTT_ONOPEN");
      }
      state.application.fsm_state = FSM.CONNECTED;
    },

    MQTT_ONERROR(state) {
      if (state.application.debug) {
        window.console.log("MQTT_ONERROR");
      }
      state.application.fsm_state = FSM.DISCONNECTED;
    },

    MQTT_RECONNECT(state, event) {
      if (state.application.debug) {
        window.console.log("MQTT_RECONNECT", event);
      }
      state.application.fsm_state = FSM.DISCONNECTED;
    },

    MQTT_ONMESSAGE(state, message) {
      //state.mqtt.message = message;
      //const result = message.destinationName.match(/^(.+)\/(.+)\/(.+)/);
      Vue.set(state.cloud, "mqtt_message", {
        topic: message.destinationName,
        payload: message.payloadString,
      });

      const spl = message.destinationName.split("/", 4);
      //window.console.log("spl >>> ", spl);

      if (spl.length >= 3) {
        if (spl[2] === "status") {
          this.commit("setDeviceStatus", {
            type: spl[0],
            devId: spl[1],
            status: JSON.parse(state.mqtt.message.payload),
          });
        }

        if (spl[2] === "data") {
          // for (let k = 0; k < state.deviceList.length; k++) {
          //     if (state.deviceList[k].type == state.mqtt.message.type &&
          //         state.deviceList[k].devId == state.mqtt.message.devId) {

          //         //                    if (state.deviceList[k].data != data.data) {
          //         //state.deviceList[k].data = state.mqtt.message.payload;
          //         Vue.set(state.deviceList[k], 'data', state.mqtt.message.payload);
          //         window.console.log('data:', state.deviceList[k].data);
          //         //                  }
          //     }
          // }

          // window.console.log('data:', state.mqtt.message.payload);
          this.commit("setDeviceData", {
            type: spl[0],
            devId: spl[1],
            value: JSON.parse(message.payloadString),
          });
        }
      } else {
        window.console.log(
          "ERROR! topic:'" +
            message.destinationName +
            "', payload: '" +
            message.payloadString +
            "'"
        );
      }
    },

    // DEVICE ----------------------------------------------------------------
    setDeviceStatus(state, data) {
      if (state.application.debug) {
        window.console.log("setDeviceStatus:", data);
      }

      for (let k = 0; k < state.deviceList.length; k++) {
        if (
          state.deviceList[k].type == data.type &&
          state.deviceList[k].devId == data.devId
        ) {
          // window.console.log("Device:", state.deviceList[k]);
          if (state.deviceList[k].online != (data.status.state != "offline")) {
            state.deviceList[k].online = data.status.state != "offline";

            window.console.log(
              state.deviceList[k].type +
                "/" +
                state.deviceList[k].devId +
                " online: " +
                state.deviceList[k].online
            );
          }
        }
      }
    },

    setDeviceData(state, data) {
      if (state.application.debug) {
        window.console.log("setDeviceData:", data);
      }

      for (let k = 0; k < state.deviceList.length; k++) {
        if (
          state.deviceList[k].type == data.type &&
          state.deviceList[k].devId == data.devId
        ) {
          Vue.set(state.deviceList[k], "data", data.value);
          // window.console.log('data:', state.deviceList[k].data);
        }
      }
    },

    updateDeviceList(state, data) {
      // unvalidate list
      state.deviceList.forEach((item) => {
        item.checked = false;
      });

      for (let i = 0; i < data.length; i++) {
        let index = -1;

        for (let j = 0; j < state.deviceList.length; j++) {
          if (
            state.deviceList[j].type == data[i].type &&
            state.deviceList[j].devId == data[i].devId
          ) {
            index = j;
          }
        }

        if (index < 0) {
          data[i].checked = true;
          data[i].online = false;
          data[i].data = { inputs: 0, outputs: 0 };

          state.deviceList.push(data[i]);
          index = state.deviceList.length - 1;

          this.dispatch(
            "mqttSubscribe",
            state.deviceList[index].type +
              "/" +
              state.deviceList[index].devId +
              "/#"
          );
        } else {
          // Vue.set(state.deviceList[index], 'data', data);
          // Vue.set(state.deviceList[index], 'online', online);
          Vue.set(state.deviceList[index], "checked", true);

          this.dispatch(
            "mqttSubscribe",
            state.deviceList[index].type +
              "/" +
              state.deviceList[index].devId +
              "/#"
          );
          // window.console.log('updated: ',
          //     state.deviceList[index].type + '/' +
          //     state.deviceList[index].devId);
        }
      }

      // delete & unsubscribe
      for (let k = 0; k < state.deviceList.length; k++) {
        if (state.deviceList[k].checked == false) {
          this.dispatch(
            "mqttUnsubscribe",
            state.deviceList[k].type + "/" + state.deviceList[k].devId + "/#"
          );
          state.deviceList.splice(k);
        }
      }
    },
  },

  actions: {
    // requestCloudApi(context, req) {
    //   if (context.state.debug) window.console.log("requestCloudApi data:", req);
    //   if (!("url" in req)) {
    //     window.console.log("ERROR: 'url' required!");
    //     return;
    //   }
    //   if (!("method" in req)) {
    //     window.console.log("ERROR: 'method' required!");
    //     return;
    //   }
    //   axios({
    //     url: req.url,
    //     method: req.method,
    //     baseURL: context.state.cloud.baseURL,
    //     headers: "token" in req ? { Token: req.token } : null,
    //     data: "data" in req ? req.data : null,
    //   })
    //     .then((response) => {
    //       context.commit("_onCloudApiResponse", response);
    //       if (
    //         response.config.method === "post" &&
    //         response.config.url == "/cloud/user/authorize"
    //       ) {
    //         // authorize request sent. set timeout
    //         context.commit("_updateAuthorizeRequestTimeout", 5 * 60);
    //         setTimeout(function f() {
    //           context.commit("_updateAuthorizeRequestTimeout", -1);
    //           if (context.state.cloud.authorizeRequestTimeout)
    //             setTimeout(f, 1000);
    //         }, 1000);
    //       }
    //     })
    //     .catch((error) => window.console.log("requestCloudApi ERROR:", error));
    // },
    // startIntervalPeriodic(context, interval = 1) {
    //   if (_timer) clearInterval(_timer);
    //   if (context.state.debug)
    //     window.console.log("startIntervalPeriodic interval:", interval);
    //   _timer = setInterval(() => {
    //     if (_uptime % 15 == 0) {
    //       //this.dispatch("");
    //       window.console.log("uptime:", _uptime);
    //     }
    //     _uptime++;
    //   }, interval * 1000);
    // },
  },

  modules: {},
});
