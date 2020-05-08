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
export const mqttConnect = (store) => {
  const cloud = store.state.cloud;

  if (
    !isUndefined(window.Paho.MQTT.Client) &&
    cloud.mqttUsername != "" &&
    cloud.mqttPassword != ""
  ) {
    window.console.log(
      "MQTT: connecting to '" +
        cloud.mqtt_host +
        cloud.mqtt_path +
        "' as " +
        cloud.mqttUsername +
        " , id:" +
        _client_id
    );

    var connectOptions = {
      timeout: 300,
      useSSL: true,
      userName: cloud.mqttUsername,
      password: cloud.mqttPassword,
      cleanSession: false,
      keepAliveInterval: 60,

      onSuccess: () => {
        store.commit("MQTT_ONOPEN");
      },
      onFailure: () => {
        store.commit("MQTT_ONERROR");
      },
    };

    store.commit(
      "mqttInstance",
      new window.Paho.MQTT.Client(
        cloud.mqtt_host || MQTT.HOST,
        cloud.mqtt_port || MQTT.PORT,
        cloud.mqtt_path || MQTT.PATH,
        _client_id
      )
    );

    cloud.mqtt_instance.connect(connectOptions);

    cloud.mqtt_instance.onMessageArrived = (msg) => {
      store.commit("MQTT_ONMESSAGE", msg);
    };

    cloud.mqtt_instance.onConnectionLost = (res) => {
      store.commit("MQTT_RECONNECT", res);
      // setTimeout(() => {
      //     window.console.log('MQTT: Reconnect attempt');
      //     this.dispatch('mqttConnect');
      // }, 5000);
    };
  } else {
    window.console.log("mqttConnect: ERROR!", {
      user: cloud.mqttUsername,
      pass: cloud.mqttPassword,
    });
  }
};

export const mqttSubscribe = (instance, filter) => {
  instance.subscribe(filter, {
    onSuccess: () =>
      window.console.log("subscribe to '" + filter + "': SUCCESS"),
    onFailure: () =>
      window.console.log("subscribe to '" + filter + "': FAILED!"),
  });
};

export const mqttUnsubscribe = (instance, filter) => {
  instance.subscribe(filter, {
    onSuccess: () =>
      window.console.log("unsubscribe from '" + filter + "': SUCCESS"),
    onFailure: () =>
      window.console.log("unsubscribe from '" + filter + "': FAILED!"),
  });
};

export const mqttSendMessage = (instance, data) => {
  var msg = new window.Paho.MQTT.Message(data.payload);

  msg.destinationName = data.topic;
  msg.retained = data.retain || false;
  msg.qos = data.qos || 0;

  instance.send(msg);
};

export const mqttHeartbeat = (store, user_id) => {
  const instance = store.state.cloud.mqtt_instance;
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
