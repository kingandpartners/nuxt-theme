<template>
  <picture v-if="image">
    <source
      v-for="(source, index) in imageSources"
      :key="`image-source-${index}`"
      :media="source.media"
      :srcset="source.src"
    >

    <img
      :src="image?.url"
      :alt="image?.alt"
      :class="modifierClass ? `${modifierClass}__img` : 'img'"
      :width="image?.width"
      :height="image?.height"
      :loading="loading"
    >
  </picture>
</template>

<script setup>
const props = defineProps({
  image: {
    type: Object,
    required: true,
  },

  tabletImage: {
    type: Object,
  },

  mobileImage: {
    type: Object,
  },

  desktopBreakpoint: {
    type: String,
    default: '(min-width: 1024px)',
  },

  tabletBreakpoint: {
    type: String,
    default: '(min-width: 768px)',
  },

  mobileBreakpoint: {
    type: String,
    default: '(max-width: 767px)',
  },

  loading: {
    type: String,
    default: 'lazy',
  },

  modifierClass: {
    type: String,
    default: '',
  },
});

const isSingleImage = computed(() => {
  const { tabletImage, mobileImage } = props;
  return !(tabletImage || mobileImage);
});

const imageSources = computed(() => {
  const sources = [{ media: props.desktopBreakpoint, src: props.image?.url }];

  if (isSingleImage.value) {
    if (props.image?.sizes?.large) sources.push({ media: props.tabletBreakpoint, src: props.image?.sizes?.large });
    if (props.image?.sizes?.medium_large) sources.push({ media: props.mobileBreakpoint, src: props.image?.sizes?.medium_large });
  }

  if (props.tabletImage) sources.push({ media: props.tabletBreakpoint, src: props.tabletImage?.url });
  if (props.mobileImage) sources.push({ media: props.mobileBreakpoint, src: props.mobileImage?.url });

  return sources;
});
</script>
