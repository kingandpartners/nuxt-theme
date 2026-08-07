<template>
  <div class="component component--video video">
    <video
      v-bind="{ ...$attrs, ...attributes }"
      ref="video"
      playsinline
      muted
      :poster="videoOptions.poster?.url"
      class="video__video"
      :class="!!modifierClass && `${modifierClass}__video`"
      @ended="handleVideoEnd"
    >
      <template v-if="eagerLoad && !isSingleVideo">
        <source
          v-for="(source, index) in videoSources"
          :key="`video-source-${index}`"
          :media="source.media"
          :src="source.src"
          :type="source.type"
          :codecs="source.codecs"
        >
      </template>

      <template v-else>
        <source
          v-if="!!videoOptions.video?.url || !!videoOptions.tabletVideo?.url || !!videoOptions.mobileVideo?.url"
          :src="eagerLoad ? videoOptions.video?.url : ''"
          type="video/mp4"
        >

        <source
          v-if="!!videoOptions.mov?.url || !!videoOptions.tabletMov?.url || !!videoOptions.mobileMov?.url"
          :src="eagerLoad ? videoOptions.mov?.url : ''"
          type="video/mp4; codecs=hvc1"
          codecs="hvc1"
        >

        <source
          v-if="!!videoOptions.webm?.url || !!videoOptions.tabletWebm?.url || !!videoOptions.mobileWebm?.url"
          :src="eagerLoad ? videoOptions.webm?.url : ''"
          type="video/webm"
        >
      </template>
    </video>

    <button
      v-if="isLoaded && !disableControls"
      :aria-label="isPaused ? 'Play video' : 'Pause video'"
      class="video__control-btn"
      :class="[
        {
          'enable-ctrl-btn-bg': enableControlBtnBg,
          'enable-ctrl-btn-light': enableControlBtnLight,
        },
        !!modifierClass && `${modifierClass}__control-btn`,
      ]"
      @click="toggleVideo"
    >
      <span
        v-if="isPaused"
        class="video__icon video__icon--play svg svg--align-height"
        aria-hidden="true"
        v-html="PlayIcon"
      >
      </span>

      <span
        v-else
        class="video__icon video__icon--pause svg svg--align-height"
        aria-hidden="true"
        v-html="PauseIcon"
      >
      </span>
    </button>
  </div>
</template>

<script setup>
import PauseIcon from '!!shared/assets/icons/video-pause.svg?raw';
import PlayIcon from '!!shared/assets/icons/video-play.svg?raw';

import debounce from 'debounce';

const props = defineProps({
  videoOptions: {
    type: Object,
    required: true,
  },

  loadType: {
    type: String,
    default: 'lazy',
  },

  attributes: {
    type: Object,
    default: () => ({}),
  },

  modifierClass: {
    type: String,
    default: '',
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

const emit = defineEmits([ 'videoLoaded', 'videoEnded' ]);

const video = ref(null);

const breakpoint = ref('desktop');
const isLoaded = ref(false);
const isPaused = ref(true);
const observer = ref(null);
const onResizeHandler = ref(null);

const eagerLoad = computed(() => props.loadType === 'eager');

const isSingleVideo = computed(() => {
  const { tabletVideo, mobileVideo } = props.videoOptions;
  return !(tabletVideo || mobileVideo);
});

const videoSources = computed(() => {
  if (isSingleVideo.value) return [];

  const sources = [];

  const {
    video,
    mov,
    webm,
    tabletVideo,
    tabletMov,
    tabletWebm,
    mobileVideo,
    mobileMov,
    mobileWebm,
  } = props.videoOptions;

  if (video?.url) sources.push({ media: props.desktopBreakpoint, src: video.url, type: 'video/mp4' });
  if (mov?.url) sources.push({ media: props.desktopBreakpoint, src: mov.url, type: 'video/mp4; codecs=hvc1', codecs: 'hvc1' });
  if (webm?.url) sources.push({ media: props.desktopBreakpoint, src: webm.url, type: 'video/webm' });
  if (tabletVideo?.url) sources.push({ media: props.tabletBreakpoint, src: tabletVideo.url, type: 'video/mp4' });
  if (tabletMov?.url) sources.push({ media: props.tabletBreakpoint, src: tabletMov.url, type: 'video/mp4; codecs=hvc1', codecs: 'hvc1' });
  if (tabletWebm?.url) sources.push({ media: props.tabletBreakpoint, src: tabletWebm.url, type: 'video/webm' });
  if (mobileVideo?.url) sources.push({ media: props.mobileBreakpoint, src: mobileVideo.url, type: 'video/mp4' });
  if (mobileMov?.url) sources.push({ media: props.mobileBreakpoint, src: mobileMov.url, type: 'video/mp4; codecs=hvc1', codecs: 'hvc1' });
  if (mobileWebm?.url) sources.push({ media: props.mobileBreakpoint, src: mobileWebm.url, type: 'video/webm' });

  return sources;
});

const hasTabletVideo = computed(() => {
  return [ 'tabletVideo', 'tabletWebm', 'tabletMov' ]
    .some(key => !!props.videoOptions[key]?.url);
});

const hasMobileVideo = computed(() => {
  return [ 'mobileVideo', 'mobileWebm', 'mobileMov' ]
    .some(key => !!props.videoOptions[key]?.url);
});

onMounted(() => {
  setBreakpoint();
  mountVideo();

  onResizeHandler.value = mountResizeHandler();
  window.addEventListener('resize', onResizeHandler.value);
});

onUnmounted(() => {
  if (!onResizeHandler.value) return;
  window.removeEventListener('resize', onResizeHandler.value);
});

const setBreakpoint = () => {
  const isDesktop = window.matchMedia(props.desktopBreakpoint).matches;
  const isTablet = window.matchMedia(props.tabletBreakpoint).matches;
  const isMobile = window.matchMedia(props.mobileBreakpoint).matches;
  let currentBreakpoint = 'desktop';

  if (isDesktop) {
    currentBreakpoint = 'desktop';
  } else if (isTablet && hasTabletVideo.value) {
    currentBreakpoint = 'tablet';
  } else if (isMobile && hasMobileVideo.value) {
    currentBreakpoint = 'mobile';
  }

  breakpoint.value = currentBreakpoint;
};

const mountVideo = () => {
  updatePoster();

  if (eagerLoad.value) {
    isLoaded.value = true;
    if (props.attributes.autoplay) playVideo();
  } else if (props.loadType === 'lazy') {
    observe();
  }
};

const updatePoster = () => {
  let poster = props.videoOptions.poster?.url;

  if (breakpoint.value === 'desktop' && props.videoOptions.poster) {
    poster = props.videoOptions.poster?.url;
  } else if (breakpoint.value === 'tablet' && props.videoOptions.tabletPoster) {
    poster = props.videoOptions.tabletPoster?.url;
  } else if (breakpoint.value === 'mobile' && props.videoOptions.mobilePoster) {
    poster = props.videoOptions.mobilePoster?.url;
  }

  if (poster) {
    video.value.setAttribute('poster', poster);
  }
};

const observe = () => {
  observer.value = new IntersectionObserver(onIntersection, {
    rootMargin: '250px',
    threshold: 0.01,
  });

  observer.value.observe(video.value);
};

const onIntersection = ([entry]) => {
  if (!entry.isIntersecting) return;

  load();
  observer.value.unobserve(video.value);
};

const load = async () => {
  if (isLoaded.value) return;

  const { mp4, webm, mov } = getSrc();

  if (eagerLoad.value) {
    const src = mp4 || mov || webm;
    video.value.src = src;
  } else {
    const mp4Source = video.value.querySelector('source[type="video/mp4"]');
    if (mp4Source && mp4) mp4Source.setAttribute('src', mp4);

    const movSource = video.value.querySelector('source[type="video/mp4; codecs=hvc1"]');
    if (movSource && mov) movSource.setAttribute('src', mov);

    const webmSource = video.value.querySelector('source[type="video/webm"]');
    if (webmSource && webm) webmSource.setAttribute('src', webm);
  }

  video.value.load();

  if (props.attributes.autoplay) {
    await video.value.play();
    isPaused.value = false;
  }

  isLoaded.value = true;
  emit('videoLoaded');
};

const getSrc = () => {
  const sources = {
    mp4: '',
    webm: '',
    mov: '',
  };

  if (breakpoint.value === 'desktop' && !!props.videoOptions.video?.url) {
    sources.mp4 = props.videoOptions.video.url;
  } else if (breakpoint.value === 'tablet' && !!props.videoOptions.tabletVideo?.url) {
    sources.mp4 = props.videoOptions.tabletVideo.url;
  } else if (breakpoint.value === 'mobile' && !!props.videoOptions.mobileVideo?.url) {
    sources.mp4 = props.videoOptions.mobileVideo.url;
  }

  if (breakpoint.value === 'desktop' && !!props.videoOptions.mov?.url) {
    sources.mov = props.videoOptions.mov.url;
  } else if (breakpoint.value === 'tablet' && !!props.videoOptions.tabletMov?.url) {
    sources.mov = props.videoOptions.tabletMov.url;
  } else if (breakpoint.value === 'mobile' && !!props.videoOptions.mobileMov?.url) {
    sources.mov = props.videoOptions.mobileMov.url;
  }

  if (breakpoint.value === 'desktop' && !!props.videoOptions.webm?.url) {
    sources.webm = props.videoOptions.webm.url;
  } else if (breakpoint.value === 'tablet' && !!props.videoOptions.tabletWebm?.url) {
    sources.webm = props.videoOptions.tabletWebm.url;
  } else if (breakpoint.value === 'mobile' && !!props.videoOptions.mobileWebm?.url) {
    sources.webm = props.videoOptions.mobileWebm.url;
  }

  return sources;
};

const onResize = () => {
  const prevBreakpoint = breakpoint.value;
  setBreakpoint();

  updatePoster();

  if (!isLoaded.value || prevBreakpoint === breakpoint.value) return;

  if (eagerLoad.value && isSingleVideo.value) return;

  isLoaded.value = false;
  load();
};

const mountResizeHandler = () => debounce(onResize, 300);

const toggleVideo = () => {
  if (!isLoaded.value) return;

  if (isPaused.value) {
    playVideo();
  } else {
    pauseVideo();
  }
};

const playVideo = () => {
  isPaused.value = false;
  return video.value.play();
};

const pauseVideo = () => {
  video.value.pause();
  isPaused.value = true;
};

const handleVideoEnd = () => {
  if (props.attributes.loop) return;
  isPaused.value = true;
  emit('videoEnded');
};

defineExpose({
  video,
  playVideo,
  pauseVideo,
  updatePoster,
});
</script>

<style lang="scss">
  @forward './Video.scss';
</style>
