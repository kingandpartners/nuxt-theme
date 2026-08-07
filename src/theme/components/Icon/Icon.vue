<template>
  <span
    v-if="icon?.raw"
    class="svg"
    v-html="accessibleIcon || icon?.raw"
  ></span>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: Object,
    required: true,
  },

  title: {
    type: String,
    default: '',
  },

  isDecorative: {
    type: Boolean,
    default: false,
  },
});

const accessibleIcon = ref(null);

onMounted(() => {
  setAccessibleIcon();
});

const setAccessibleIcon = () => {
  if (!props.icon) return;

  accessibleIcon.value = getAccessibleIcon(
    props.icon,
    props.title,
    props.isDecorative,
  );
};

const getAccessibleIcon = (svg, title, isDecorative) => {
  if (!svg?.raw) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg.raw, 'image/svg+xml');
  const icon = doc.querySelector('svg');

  if (title) {
    const titleElem = document.createElement('title');
    const sanitizedTitle = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueTitleId = `title-${sanitizedTitle}-${Date.now()}`;

    titleElem.id = uniqueTitleId;
    titleElem.textContent = title;

    if (!icon.querySelector('title')) {
      icon.prepend(titleElem);
    } else {
      icon.querySelector('title').textContent = title;
      icon.querySelector('title').id = uniqueTitleId;
    }

    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-labelledby', uniqueTitleId);
  }

  if (isDecorative) {
    icon.setAttribute('role', 'presentation');
    icon.setAttribute('aria-hidden', 'true');
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(icon);
};
</script>
