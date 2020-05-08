<template>
  <div class="content">
    <div>
      <img
        height="128"
        width="128"
        :alt="user_picture.alt"
        :src="user_picture.src"
      />
      <h2>{{ user_name }}</h2>
      <p v-if="user_email !== ''">
        email: <strong>{{ user_email }}</strong>
      </p>
      <p v-if="user_phone !== ''">
        phone: <strong>{{ user_phone }}</strong>
      </p>

      <p v-if="cloud.mqttUsername !== ''">
        MQTT user: <strong>{{ cloud.mqttUsername }}</strong>
      </p>
      <p v-if="cloud.mqttPassword !== ''">
        MQTT pass: <strong>{{ cloud.mqttPassword }}</strong>
      </p>

      <p v-if="cloud.mqtt_message !== {}">
        msg: <strong>{{ JSON.stringify(cloud.mqtt_message, null, 2) }}</strong>
      </p>
    </div>

    <!-- <div>
      <pre>{{ JSON.stringify($store.state.user, null, 2) }}</pre>
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters([
      "is_authorized",
      "user_name",
      "user_email",
      "user_phone",
      "user_picture",
      "user_metadata",
      "cloud",
    ]),
  },

  data: () => {
    return {};
  },
};
</script>

<style scoped>
.content {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 10px;
}
</style>
