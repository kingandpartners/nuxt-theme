<template>
  <section class="component component--logo logo">
    <Image
      v-if="logo.image"
      :image="logo.image"
      modifier-class="logo"
      loading="eager"
    />
  </section>
</template>

<script setup>
const props = defineProps({
  component: {
    type: Object,
    default: () => ({}),
  },
});

const logo = computed(() => {
  const {
    image,
  } = props?.component || {};

  return {
    image: image || false,
  };
});
</script>

<style lang="scss">
  @forward './Logo.scss';
</style>
