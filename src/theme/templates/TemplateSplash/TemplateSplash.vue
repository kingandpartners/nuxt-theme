<template>
  <div class="template-container template-splash">
    <component
      :is="dynamicComponent(component)"
      v-for="(component, index) in components"
      :key="`template-splash-component-${index}`"
      :component="component"
    />
  </div>
</template>

<script setup>
import {
  Logo,
} from '#components';

defineProps({
  components: {
    type: Array,
    default: () => [],
  },
});

const { $componentName, $observerFadeIn } = useNuxtApp();

const componentMap = {
  Logo,
};

onMounted(() => {
  nextTick(() => $observerFadeIn());
});

const dynamicComponent = component => {
  const name = $componentName(component);
  return componentMap[name] || null;
};
</script>

<style lang="scss">
  @forward './TemplateSplash.scss';
</style>
