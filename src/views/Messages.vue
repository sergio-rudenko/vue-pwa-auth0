<template>
  <b-container>
    <b-list-group class="mt-2">
      <b-list-group-item
        v-for="(message, i) in decodedMessages"
        :key="i"
        class="my-1"
        button
      >
        <div class="d-flex w-100 justify-content-between">
          <b-icon
            :icon="message.inbound ? 'box-arrow-in-down' : 'box-arrow-up'"
            :variant="message.inbound ? 'primary' : 'danger'"
            scale="1.5"
          />
          <h6 class="mb-1">
            {{ message.inbound ? message.from : message.to }}
          </h6>
          <small class="text-muted" style="font-size: 0.7rem;">
            {{ message.datestring }}<br />
          </small>
        </div>
        <!-- <p class="mb-1">{{ message.from }} -> {{ message.to }}</p> -->
        <small class="text-muted">
          {{ message.type }} : {{ message.text }}
        </small>
      </b-list-group-item>
      <!-- <b-list-group-item>Vestibulum at eros</b-list-group-item> -->
    </b-list-group>

    <b-button id="show-btn">Open Modal</b-button>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["user_phone", "cloud_messages"]),

    decodedMessages() {
      return this.cloud_messages
        .map((msg) => {
          const date = new Date(msg.dt);
          const value = JSON.parse(msg.value);
          const from_id = "from_id" in value ? atob(value.from_id) : "";
          const to_id = "to_id" in value ? atob(value.to_id) : "";

          return msg.key == "chat" && "from_id" in value
            ? {
                ...value,

                inbound: to_id === this.user_phone,
                from: from_id,
                to: to_id,

                date: date,
                datestring:
                  date.getFullYear() +
                  "-" +
                  ("0" + (date.getMonth() + 1)).slice(-2) +
                  "-" +
                  ("0" + date.getDate()).slice(-2) +
                  " " +
                  ("0" + date.getHours()).slice(-2) +
                  ":" +
                  ("0" + date.getMinutes()).slice(-2),
              }
            : null;
        })
        .filter((msg) => {
          return msg !== null;
        });
    },
  },

  data: () => {
    return {};
  },
};
</script>

<style scoped></style>
