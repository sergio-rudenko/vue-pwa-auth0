const axios = require("axios").default;
const baseURL = "https://sa100cloud.com/cloud"; //FIXME!

const _requestLkApi = (req) => {
  window.console.log("API[/cloud] req:", req);

  if (!("url" in req)) {
    window.console.log("API[/cloud] ERROR: 'url' required!");
    throw "ERROR: 'url' required!";
  }

  if (!("method" in req)) {
    window.console.log("API[/cloud] ERROR: 'method' required!");
    throw "ERROR: 'method' required!";
  }

  return axios({
    url: req.url,
    method: req.method,
    baseURL: baseURL,
    headers: "token" in req ? { Token: req.token } : null,
    data: "data" in req ? req.data : null,
  });
  //  .then((response) => {
  //    context.commit("_onCloudApiResponse", response);

  //    if (
  //      response.config.method === "post" &&
  //      response.config.url == "/cloud/user/authorize"
  //    ) {
  //      // authorize request sent. set timeout
  //      context.commit("_updateAuthorizeRequestTimeout", 5 * 60);

  //      setTimeout(function f() {
  //        context.commit("_updateAuthorizeRequestTimeout", -1);
  //        if (context.state.cloud.authorizeRequestTimeout) setTimeout(f, 1000);
  //      }, 1000);
  //    }
  //  })
  //  .catch((error) => window.console.log("requestCloudApi ERROR:", error));
};

export const registerUser = (name, phone, email = "") => {
  // window.console.log("request");
  const request = {
    url: "/user/registration",
    method: "post",
    data: {
      name: name,
      phone: phone,
      email: email,
    },
  };

  return _requestLkApi(request);
};

export const authorizeUser = (userId) => {
  // window.console.log("request");
  const request = {
    url: "/user/authorize",
    method: "post",
    data: {
      userId: userId,
    },
  };

  return _requestLkApi(request);
};

export const confirmCode = (phone, code) => {
  // window.console.log("request");
  const request = {
    url: "/user/code",
    method: "post",
    data: {
      userId: phone,
      code: code,
    },
  };

  return _requestLkApi(request);
};

export const getCloudUserData = (token) => {
  // window.console.log("request");
  const request = {
    url: "/user/user",
    method: "get",
    token: token,
  };

  return _requestLkApi(request);
};

export const getCloudUserDevices = (token) => {
  // window.console.log("request");
  const request = {
    url: "/user/devices",
    method: "get",
    token: token,
  };

  return _requestLkApi(request);
};
