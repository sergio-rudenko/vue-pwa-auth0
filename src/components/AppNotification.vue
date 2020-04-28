<template>
  <b-media class="px-0">
    <template v-slot:aside>
      <b-img alt="icon" width="64" height="64" :src="icon" />
    </template>

    <div class="row no-gutters text-truncate">
      <strong>{{ title }}</strong>
    </div>

    <div v-if="body !== null" class="row no-gutters text-wrap">
      {{ body }}
    </div>

    <div class="row no-gutters notification-tag">tag: [ {{ tag }} ]</div>
  </b-media>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  computed: {
    icon() {
      return "options" in this.data &&
        "icon" in this.data.options &&
        this.data.options.icon !== ""
        ? this.data.options.icon
        : require("@/assets/logo.png");
    },

    title() {
      return "title" in this.data && this.data.title !== ""
        ? this.data.title
        : "[ no title ]";
    },

    body() {
      return "body" in this.data.options && this.data.options.body !== ""
        ? this.data.options.body
        : null;
    },

    tag() {
      return "tag" in this.data.options && this.data.options.tag !== ""
        ? this.data.options.tag
        : "none";
    },
  },
};
</script>

<style scoped>
.notification-tag {
  font: 0.66rem/1.5 var(--font-family-sans-serif);
}
</style>
