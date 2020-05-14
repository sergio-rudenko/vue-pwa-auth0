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
      version: "0.1.1 /rc1/",

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
        bast_token: "", // LK Token
        jrnl_token: "", // Journalize service Token
        fwdb_token: "", // FirmwaareUpdate service Token

        // test data
        boolean_param: "",
        numeric_param: "",
        string_param: "",
      },
    },

    cloud: {
      user: {
        name: "", // имя пользователя
        phone: "", // телефон в международном формате
        email: "", // электронная почта
      },

      mqtt: {
        client_id: "", // clientId для подключения к MQTT-брокеру
        username: "", // username для авторизации на MQTT-брокере, 16 символов
        password: "", // пароль для авторизации на MQTT-брокере, 16 символов

        host: "sa100cloud.com",
        path: "/wss",
        port: 443,

        instance: null,
        is_connected: false,

        message: {},
      },

      devices: [],
      current_device_index: -1,

      journal: {
        token: "",
        token_dt: "",
        records: [],
        messages: [],
      },
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

    cloud_journal_token: (state) => {
      return state.cloud.journal.token;
    },

    cloud_messages: (state) => {
      return state.cloud.journal.messages;
    },

    devices: (state) => {
      return state.cloud.devices;
    },

    mqtt: (state) => {
      return state.cloud.mqtt;
    },

    is_mqtt_connected: (state) => {
      return state.cloud.mqtt.is_connected;
    },

    mqtt_message: (state) => {
      return state.cloud.mqtt.message;
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

    setAuthMetadata(state, data) {
      if (state.application.debug) window.console.log("setAuthMetadata:", data);

      if ("app_metadata" in data) {
        if (state.application.debug) {
          window.console.log("set app_metadata:", data.app_metadata);
        }
        _updateObject(state.user.app_metadata, data.app_metadata);
      }

      if ("user_metadata" in data) {
        if (state.application.debug) {
          window.console.log("set user_metadata:", data.user_metadata);
        }

        let new_token =
          "bast_token" in data.user_metadata
            ? data.user_metadata.bast_token
            : "";

        let old_token = state.user.user_metadata.bast_token;

        // NOTE! update BEFORE switch state
        _updateObject(state.user.user_metadata, data.user_metadata);

        if (new_token != old_token) {
          state.application.fsm_state = FSM.INIT.AUTHORIZATION;
        }

        if (new_token == "") {
          window.console.log("NOT Authorized!");
          state.application.fsm_state = FSM.NOT.AUTHORIZED;
        }
      }
    },

    setCloudUserData(state, data) {
      if (state.application.debug) {
        window.console.log("setCloudData:", data);
      }
      const cloud = state.cloud;
      cloud.user.name = data.name || "anonymous";

      if ("email" in data && data.email !== "") {
        cloud.user.email = data.email;
        state.user.email = data.email;
        state.user.email_verified = true;

        if (state.application.debug)
          window.console.log("email updated:", state.user.email);
      }
      if ("phone" in data && data.phone !== "") {
        cloud.user.phone = data.phone;
        state.user.phone = data.phone;
        state.user.phone_verified = true;

        if (state.application.debug)
          window.console.log("phone updated:", state.user.phone);
      }

      // mqtt credentials
      cloud.mqtt.client_id = data.mqttClientId;
      cloud.mqtt.username = data.mqttUsername;
      cloud.mqtt.password = data.mqttPassword;

      state.application.fsm_state = FSM.INIT.CONNECTION;
    },

    // MQTT ------------------------------------------------------------------
    mqttInstance(state, data) {
      if (state.application.debug) {
        window.console.log("mqttinstance:", data);
      }
      state.cloud.mqtt.instance = data;
    },

    mqttSubscribe(state, topic) {
      const instance = state.cloud.mqtt.instance;
      instance.subscribe(topic, {
        onSuccess: () =>
          window.console.log(`MQTT: subscribe to '${topic}': SUCCESS`),
        onFailure: () =>
          window.console.log(`MQTT: subscribe to '${topic}': FAILED!`),
      });
    },

    mqttUnsubscribe(state, topic) {
      const instance = state.cloud.mqtt.instance;
      instance.unsubscribe(topic, {
        onSuccess: () =>
          window.console.log(`MQTT: unsubscribe from '${topic}': SUCCESS`),
        onFailure: () =>
          window.console.log(`MQTT: unsubscribe from '${topic}': FAILED!`),
      });
    },

    MQTT_ONOPEN(state) {
      if (state.application.debug) {
        window.console.log("MQTT_ONOPEN");
      }
      state.cloud.mqtt.is_connected = true;
      state.application.fsm_state = FSM.CONNECTED;
    },

    MQTT_ONERROR(state) {
      if (state.application.debug) {
        window.console.log("MQTT_ONERROR");
      }
      state.cloud.mqtt.is_connected = false;
      state.application.fsm_state = FSM.DISCONNECTED;
    },

    MQTT_RECONNECT(state, event) {
      if (state.application.debug) {
        window.console.log("MQTT_RECONNECT", event);
      }
      state.cloud.mqtt.is_connected = false;
      state.application.fsm_state = FSM.DISCONNECTED;
    },

    // MQTT_ONMESSAGE(state, message) {
    //   if (state.application.debug) {
    //     window.console.log("MQTT_ONMESSAGE", message);
    //     // window.console.log("message.topic:", message.topic);
    //     // window.console.log("message.payload:", message.payload);
    //   }

    //   state.cloud.mqtt.message = {
    //     ...state.cloud.mqtt.message,
    //     topic: message.destinationName,
    //     payload: message.payloadString,
    //   };
    // },

    // CLOUD -----------------------------------------------------------------
    setCloudJournalToken(state, data) {
      if (state.application.debug) {
        window.console.log("setCloudJournalToken:", data);
      }

      state.cloud.journal.token = data;
      state.cloud.journal.token_dt = Date.now();
    },

    setJournalizedMessages(state, data) {
      if (state.application.debug) {
        window.console.log("setJournalizedMessages:", data);
      }

      const journal = state.cloud.journal;
      if (data) {
        Vue.set(journal, "messages", data);
      } else {
        Vue.set(journal, "messages", []);
      }
    },

    appendJournalizedMessage(state, data) {
      if (state.application.debug) {
        window.console.log("appendJournalizedMessage:", data);
      }
      const journal = state.cloud.journal;
      journal.messages.push(data);
    },

    // DEVICE ----------------------------------------------------------------
    appendCloudUserDevice(state, data) {
      const list = state.cloud.devices;
      list.push(data);

      const topic = data.type + "/" + data.devId + "/+"; // NOTE!: only one level
      this.commit("mqttSubscribe", topic);
    },

    removeCloudUserDevice(state, data) {
      const topic = data.type + "/" + data.devId + "/+"; // NOTE!
      this.commit("mqttUnsubscribe", topic);

      const list = state.cloud.devices;
      list.splice(list.indexOf(data), 1);
    },

    setDeviceStatus(state, data) {
      if (state.application.debug) {
        window.console.log("setDeviceStatus:", data);
      }

      const devices = state.cloud.devices;

      let device = devices.filter((device) => {
        return device.type == data.type && device.devId == data.devId;
      });

      if (device.length == 1) {
        // window.console.log("Device:", device[0]);
        const target = device[0];
        Vue.set(target, "status", data.status);
        Vue.set(target, "online", data.status.state != "offline");
      } else {
        window.console.log("Device select ERROR:", device);
      }
    },

    setDeviceData(state, data) {
      if (state.application.debug) {
        window.console.log("setDeviceData:", data);
      }

      const devices = state.cloud.devices;

      let device = devices.filter((device) => {
        return device.type == data.type && device.devId == data.devId;
      });

      if (device.length == 1) {
        // window.console.log("Device:", device[0]);
        const target = device[0];
        Vue.set(target, "data", data.value);
      } else {
        window.console.log("Device select ERROR:", device);
      }
    },
  },

  actions: {
    // async_MQTT_ONMESSAGE(context, message) {
    //   /**
    //    *
    //    */
    //   context.commit("MQTT_ONMESSAGE", message);
    // },

    setCloudUserDevices(context, data) {
      if (context.state.application.debug)
        window.console.log("setCloudUserDevices:", data);

      const list = context.state.cloud.devices;

      // append new devices
      for (let index in data) {
        // window.console.log("item:", index);
        let exist = list.filter(function(device) {
          return (
            device.type == data[index].type && device.devId == data[index].devId
          );
        });
        if (!exist.length) {
          context.commit("appendCloudUserDevice", data[index]);
        }
      }

      // remove old devices
      for (let index in list) {
        let exist = data.filter(function(item) {
          return (
            item.type == list[index].type && item.devId == list[index].devId
          );
        });
        if (!exist.length) {
          context.commit("removeCloudUserDevice", list[index]);
        }
      }
    },
  },

  modules: {},
});
