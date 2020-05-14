<template>
  <div class="home">
    <b-container>
      <div
        v-if="devices.length === 0"
        style="text-align: center; margin-top: 20vmin"
      >
        <h5>Нет подключенных устройств...</h5>

        <b-button class="mt-4" variant="primary" @click="onDeviceRequest">
          Запросить устройство
        </b-button>
        <!-- <p>
        Пожалуйста, воспользуйтесь кнопкой в меню или
        <b-link to="/profile">ссылкой на профиль пользователя</b-link>
      </p> -->
      </div>

      <b-list-group class="mt-2">
        <b-list-group-item
          v-for="(device, i) in devices"
          @click="onSelectDevice(device)"
          :disabled="!device.online"
          :key="i"
          class="my-1"
          button
        >
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ device.alias }}</h5>
            <small class="text-muted">{{ device.userRole }}</small>
          </div>

          <p class="mb-1">{{ device.type }}::{{ device.devId }}</p>
          <small class="text-muted">{{ device.description }}</small>
        </b-list-group-item>
        <!-- <b-list-group-item>Vestibulum at eros</b-list-group-item> -->
      </b-list-group>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { mqttSendMessage } from "@/mqtt/mqttService";

export default {
  name: "Home",
  components: {},

  beforeMount() {
    this.checkRedirect();
  },

  methods: {
    checkRedirect() {
      if (!this.is_authenticated) {
        window.console.log("Isn`t authenticated, redirecting...");
        this.$router.push("/authenticate");
      } else if (!this.is_authorized) {
        window.console.log("Isn`t authorized, redirecting...");
        this.$router.push("/authorize");
      }
    },

    onDeviceRequest() {
      // window.console.log("pressed");
      // window.console.log("onSubmit");
      const mqtt_instance = this.mqtt.instance;
      if (mqtt_instance.isConnected())
        mqttSendMessage(mqtt_instance, {
          topic: "status/" + btoa(this.user.phone) + "/msg/chat",
          payload: JSON.stringify({
            from_id: btoa(this.user.phone),
            to_id: btoa("+79185387721"),

            text: "DeviceRequest!",
            type: "manage",
          }),
        });
    },

    onSelectDevice(device) {
      window.console.log("selected:", device);
    },
  },

  computed: {
    ...mapGetters([
      "is_authenticated",
      "is_authorized",
      "devices",
      "user",
      "mqtt",
    ]),
  },

  watch: {
    is_authenticated: function(value) {
      if (!value) this.checkRedirect();
    },

    is_authorized: function(value) {
      if (!value) this.checkRedirect();
    },
  },

  data: () => {
    return {};
  },
};
</script>
