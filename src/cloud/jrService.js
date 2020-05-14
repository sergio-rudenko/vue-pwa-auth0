const axios = require("axios").default;
const baseURL = "https://sa100cloud.com/journal/api/v1"; //FIXME!

const _requestJournalizeApi = (req) => {
  window.console.log("API[/journal] req:", req);

  if (!("url" in req)) {
    window.console.log("API[/journal] ERROR: 'url' required!");
    throw "ERROR: 'url' required!";
  }

  if (!("method" in req)) {
    window.console.log("API[/journal] ERROR: 'method' required!");
    throw "ERROR: 'method' required!";
  }

  return axios({
    url: req.url,
    method: req.method,
    baseURL: baseURL,
    headers: "token" in req ? { "X-Token": req.token } : null,
    params: "params" in req ? req.params : null,
    data: "data" in req ? req.data : null,
  });
};

export const getJournalizedMessages = (token, id) => {
  // window.console.log("request");
  const request = {
    url: "/client/" + id + "/keys/chat",
    params: {
      dt_from: new Date(0),
      dt_to: Date.now(),
    },
    method: "get",
    token: token,
  };
  return _requestJournalizeApi(request);
};

// export const getJournalizedRecords = (token, id) => {
//   // window.console.log("request");
//   const request = {
//     url: "/cloud/user/devices",
//     method: "get",
//     token: token,
//   };
//   return _requestJournalizeApi(request);
// };
