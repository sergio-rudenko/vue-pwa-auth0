import { getInstance } from "./index";

export const authGuard = (to, from, next) => {
  //   window.console.log("authGuard:");
  const authService = getInstance();

  const fn = () => {
    // If the user is authenticated, continue with the route
    if (authService.isAuthenticated) {
      return next();
    }

    // Otherwise, log in
    authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!authService.loading) {
    return fn();
  }

  // Watch for the loading property to change before we check isAuthenticated
  authService.$watch("loading", (loading) => {
    if (loading === false) {
      return fn();
    }
  });
};

export const getUserData = (url, user_id) => {
  // console.log("getUserData:", url, user_id);

  const authService = getInstance();
  const params =
    "fields=last_ip%2Clast_login%2Clogins_count%2Cidentities%2Capp_metadata%2Cuser_metadata&include_fields=true";

  return authService
    .getTokenSilently()
    .then((accessToken) =>
      fetch(url + "users/" + user_id + "?" + params, {
        method: "GET",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
      })
    )
    .then((result) => result.json())
    .then((data) => {
      // console.log("GET:", data);
      return data;
    });
};
