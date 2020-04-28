import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,

  state: {
    debug: true,
    version: "0.0.6 rc6",

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
      user_metadata: {},
    },
  },

  getters: {
    version: (state) => {
      return state.version;
    },

    user: (state) => {
      return state.user;
    },

    app_metadata: (state) => {
      return state.user.app_metadata;
    },

    user_metadata: (state) => {
      return state.user.user_metadata;
    },
  },

  mutations: {
    setUser(state, data) {
      if (state.debug) window.console.log("setUser:", data);
      for (var key in data) {
        if (state.debug) window.console.log(("key:", key));
        state.user[key] = data[key];
      }
    },

    setUserData(state, data) {
      if (state.debug) window.console.log("setUserData:", data);
      for (var key in data) {
        if (state.debug) window.console.log(("key:", key));
        state.user[key] = data[key];
      }
    },
  },

  actions: {},
  modules: {},
});
