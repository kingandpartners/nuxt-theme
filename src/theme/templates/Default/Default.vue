<template>
  <div class="default">
    <h1>Default Test: {{ post_title }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    post_title: {
      type: String,
      default: '',
    },
  },
};
</script>
