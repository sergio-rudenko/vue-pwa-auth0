import { isUndefined } from "util";

const MQTT = {
  HOST: "sa100cloud.com",
  PATH: "/mqtt",
  PORT: 1883,
};

/**
 * Client Id
 */
const _client_id = [...Array(16)]
  .map(() => (~~(Math.random() * 36)).toString(36))
  .join("");

/**
 * connect
 */
export const mqttConnect = (store, on_message) => {
  const debug = store.state.application.debug;
  const mqtt = store.state.cloud.mqtt;

  if (
    !isUndefined(window.Paho.MQTT.Client) &&
    mqtt.username != "" &&
    mqtt.password != ""
  ) {
    if (debug) {
      window.console.log(
        "MQTT: connecting to '" +
          mqtt.host +
          mqtt.path +
          "' as " +
          mqtt.username +
          " , id:" +
          _client_id
      );
    }

    store.commit(
      "mqttInstance",
      new window.Paho.MQTT.Client(
        mqtt.host || MQTT.HOST,
        mqtt.port || MQTT.PORT,
        mqtt.path || MQTT.PATH,
        _client_id
      )
    );

    mqtt.instance.connect({
      timeout: 300,
      useSSL: true,
      userName: mqtt.username,
      password: mqtt.password,
      cleanSession: false,
      keepAliveInterval: 60,

      onSuccess: () => {
        store.commit("MQTT_ONOPEN");
      },
      onFailure: () => {
        store.commit("MQTT_ONERROR");
      },
    });

    mqtt.instance.onConnectionLost = (res) => {
      store.commit("MQTT_RECONNECT", res);
    };

    mqtt.instance.onMessageArrived = (msg) => {
      // store.dispatch("async_MQTT_ONMESSAGE", msg);
      //store.commit("MQTT_ONMESSAGE", msg);
      on_message(msg);
    };
  } else {
    window.console.log("mqttConnect: ERROR!", mqtt);
  }
};

// export const mqttSubscribe = (instance, filter) => {
//   instance.subscribe(filter, {
//     onSuccess: () =>
//       window.console.log("subscribe to '" + filter + "': SUCCESS"),
//     onFailure: () =>
//       window.console.log("subscribe to '" + filter + "': FAILED!"),
//   });
// };

// export const mqttUnsubscribe = (instance, filter) => {
//   instance.subscribe(filter, {
//     onSuccess: () =>
//       window.console.log("unsubscribe from '" + filter + "': SUCCESS"),
//     onFailure: () =>
//       window.console.log("unsubscribe from '" + filter + "': FAILED!"),
//   });
// };

export const mqttSendMessage = (instance, data) => {
  var msg = new window.Paho.MQTT.Message(data.payload);

  msg.destinationName = data.topic;
  msg.retained = data.retain || false;
  msg.qos = data.qos || 0;

  instance.send(msg);
};

export const mqttHeartbeat = (store, user_id) => {
  const instance = store.state.cloud.mqtt.instance;
  if (instance != null && instance.isConnected()) {
    mqttSendMessage(instance, {
      topic: "status/" + user_id + "/" + _client_id,
      payload: JSON.stringify({
        user_id: atob(user_id), //FIXME
        time_t: Math.trunc(new Date().getTime() / 1000),
      }),
      retain: false,
      qos: 1,
    });
  } else {
    mqttConnect(store);
  }
};
