import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,

  state: {
    debug: true,
    version: "0.0.5",

    user: {},
  },

  getters: {
    version: (state) => {
      return state.version;
    },

    user: (state) => {
      return state.user;
    },
  },

  mutations: {
    setUser(state, data) {
      if (state.debug) window.console.log("setUser:", data);
      state.user = data;
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
