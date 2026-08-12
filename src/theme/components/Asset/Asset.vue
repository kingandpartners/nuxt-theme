<template>
  <div
    v-if="hasAsset"
    class="asset"
    :class="[
      `asset--${assetType}`,
      !!modifierClass && `${modifierClass}__asset`,
    ]"
  >
    <Video
      v-if="isVideo"
      :videoOptions="videoOptions"
      :loadType="loadType"
      :attributes="videoAttributes"
      :disableControls="disableControls"
      :enableControlBtnBg="enableControlBtnBg"
      :enableControlBtnLight="enableControlBtnLight"
      :modifierClass="modifierClass"
    />

    <Image
      v-else
      :image="asset?.image"
      :loading="loading"
      :modifierClass="modifierClass"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  /**
   * A single ACF `asset` field group: an `asset_type` toggle plus the image or
   * video files it selects between. Deliberately one asset — the responsive
   * variants come from the image's own WordPress sizes, not extra CMS fields.
   */
  asset: {
    type: Object,
    required: true,
  },

  // Image loading strategy — pass 'eager' for above-the-fold assets.
  loading: {
    type: String,
    default: 'lazy',
  },

  // Video loading strategy: 'lazy' defers until the video scrolls into view.
  loadType: {
    type: String,
    default: 'lazy',
  },

  // Video element attributes. Assets are usually background media, so this
  // autoplays on loop by default; Video always adds muted + playsinline.
  videoAttributes: {
    type: Object,
    default: () => ({ autoplay: true, loop: true }),
  },

  modifierClass: {
    type: String,
    default: '',
  },

  // Autoplaying video needs a pause control to satisfy WCAG 2.2.2, so only
  // disable the controls when the video is decorative and does not autoplay.
  disableControls: {
    type: Boolean,
    default: false,
  },

  enableControlBtnBg: {
    type: Boolean,
    default: false,
  },

  enableControlBtnLight: {
    type: Boolean,
    default: false,
  },
});

const hasVideoFile = computed(() => {
  const { video, webm } = props.asset || {};
  return !!(video?.url || webm?.url);
});

const hasImageFile = computed(() => !!props.asset?.image?.url);

// Fall back to whichever file is actually filled in when the editor has not
// set the toggle, so a half-configured asset still renders.
const assetType = computed(() => {
  const type = props.asset?.asset_type;
  if (type === 'video' && hasVideoFile.value) return 'video';
  if (type === 'image' && hasImageFile.value) return 'image';
  return hasVideoFile.value ? 'video' : 'image';
});

const isVideo = computed(() => assetType.value === 'video' && hasVideoFile.value);

const hasAsset = computed(() => isVideo.value || hasImageFile.value);

const videoOptions = computed(() => {
  const { video, webm, poster } = props.asset || {};
  return { video, webm, poster };
});
</script>

<style lang="scss">
  @forward './Asset.scss';
</style>
