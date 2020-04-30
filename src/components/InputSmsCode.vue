<template>
  <div>
    <b-container class="user-input">
      <code-input
        class="py-3 mx-auto"
        :fieldWidth="fieldWidth"
        :fieldHeight="fieldHeigth"
        v-on:change="onChange"
        v-on:complete="onComplete"
      />
      <b-input-group class="px-3">
        <b-button
          block
          variant="primary"
          :disabled="code == ''"
          @click="$emit('action', ($event.code = code))"
        >
          Подтвердить
        </b-button>
      </b-input-group>
    </b-container>
  </div>
</template>

<script>
import CodeInput from "vue-verification-code-input";

export default {
  components: {
    CodeInput,
  },

  methods: {
    onComplete(value) {
      this.code = value;
    },

    onChange() {
      this.code = "";
    },
  },

  data: () => {
    return {
      fieldWidth: 32,
      fieldHeigth: 48,

      code: "",
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
