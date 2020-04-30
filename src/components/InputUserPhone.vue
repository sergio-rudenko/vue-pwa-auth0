<template>
  <b-container class="user-input">
    <b-input-group prepend="Страна : " class="my-3">
      <b-form-select :options="countries" v-model="phone_metadata">
      </b-form-select>
    </b-input-group>

    <b-input-group :prepend="phone_metadata.prefix" class="my-3">
      <b-form-input v-model="phone_data"></b-form-input>
    </b-input-group>

    <b-input-group class="pt-4">
      <b-button
        block
        variant="primary"
        :disabled="phoneNumber === null"
        @click="$emit('action', ($event.phone = phoneNumber))"
      >
        Запросить код
      </b-button>
    </b-input-group>
  </b-container>
</template>

<script>
const countries_data = [
  {
    text: "Россия",
    value: {
      prefix: "+7",
      re: /^[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{2,4}[-\s.]?[0-9]{2}$/im,
    },
  },
  { text: "Украина", value: { prefix: "+380", re: /^\d{10}$/ } },
];

export default {
  props: {
    phone: {
      type: String,
      required: true,
    },
  },

  computed: {
    countries() {
      return countries_data;
    },

    phoneNumber() {
      var result = "";
      const re = this.phone_metadata.re;
      const parts = this.phone_data.match(re);
      if (parts) for (var i = 1; i < parts.length; i++) result += parts[i];
      return result ? this.phone_metadata.prefix + result : null;
    },
  },

  data: () => {
    return {
      phone_data: "",
      phone_metadata: {
        prefix: "+7",
        re: /^[(]?([0-9]{3})[)]?[-\s.]?([0-9]{3})[-\s.]?([0-9]{2})[-\s.]?([0-9]{2})$/i,
      },
    };
  },
};
</script>

<style scoped>
.user-input {
  width: 75%;
  max-width: 350px;
}
</style>
