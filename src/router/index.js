import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

import { authenGuard } from "../auth/authService";
import Profile from "../views/Profile.vue";

// import ExternalApiView from "../views/ExternalApi.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Cloud::BAST",
    component: Home,
  },
  {
    path: "/authenticate",
    name: "Аутентификация",
    component: () => import("../views/Authenticate.vue"),
  },
  {
    path: "/authorize",
    name: "Авторизация",
    component: () => import("../views/Authorize.vue"),
    beforeEnter: authenGuard,
  },
  {
    path: "/profile",
    name: "Пользователь",
    component: Profile,
    beforeEnter: authenGuard,
  },
  {
    path: "/settings",
    name: "Настройки",
    component: () => import("../views/Settings.vue"),
  },

  {
    path: "/testing",
    name: "Тестирование",
    component: () => import("../views/Testing.vue"),
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },

  // {
  //   path: "/external-api",
  //   name: "external-api",
  //   component: ExternalApiView,
  //   beforeEnter: authGuard
  // }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
