<template>
  <div
    class="component component--spacer spacer"
    :style="spacingCssVars"
  ></div>
</template>

<script setup>
const props = defineProps({
  component: {
    type: Object,
    default: () => ({}),
  },
});

const spacingCssVars = computed(() => {
  const {
    desktop_spacing,
    tablet_spacing,
    mobile_spacing,
  } = props?.component;

  const spaceTop = mobile_spacing || 0;
  const spaceTopTablet = tablet_spacing || 0;
  const spaceTopDesktop = desktop_spacing || 0;

  return {
    '--space-top': `${spaceTop}px`,
    '--space-top-tablet': `${spaceTopTablet}px`,
    '--space-top-desktop': `${spaceTopDesktop}px`,
  };
});
</script>

<style lang="scss">
  @forward './Spacer.scss';
</style>
