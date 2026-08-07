<!-- eslint-disable vue/component-name-in-template-casing -->
<template>
  <div
    class="modal-dialog"
    :class="[modifierClass ? `${modifierClass}__modal-dialog` : '']"
  >
    <div
      ref="modalElem"
      class="modal-dialog__container"
      :class="[modifierClass ? `${modifierClass}__modal-container` : '']"
      role="dialog"
      aria-modal="true"
      :aria-label="label"
    >
      <slot></slot>
    </div>

    <div
      ref="underlayElem"
      class="modal-dialog__underlay"
      :class="[modifierClass ? `${modifierClass}__modal-underlay` : '']"
    ></div>
  </div>
</template>

<script setup>
import { AccessibilityHelper } from '@kingandpartners/nuxt-platform/helpers/accessibilityHelper.js';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },

  animationDuration: {
    type: Number,
    default: 500,
  },

  modifierClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['modalClosed']);

const modalElem = ref(null);
const underlayElem = ref(null);

const isOpen = ref(false);
const triggerBtn = ref(null);

let focusTrap = null;

onMounted(() => {
  if (!modalElem.value) return;
  focusTrap = new AccessibilityHelper().buildFocusTrap([modalElem.value]);
});

const toggleModal = (btn = null) => {
  if (isOpen.value) {
    closeModal();
  } else {
    openModal(btn);
  }
};

const openModal = (btn = null) => {
  if (!underlayElem.value || !modalElem.value) return;

  underlayElem.value.classList.add('open');
  modalElem.value.classList.add('open');

  setTimeout(() => {
    underlayElem.value.classList.add('show');
    modalElem.value.classList.add('show');
    document.body.classList.add('overflow-hidden');
    document.addEventListener('click', handleBodyClick);
    document.addEventListener('keydown', handleEscapePress);
    if (focusTrap) focusTrap.set();
  }, 0);

  if (btn) triggerBtn.value = btn;
  isOpen.value = true;
};

const closeModal = () => {
  if (!underlayElem.value || !modalElem.value) return;

  modalElem.value.classList.remove('show');
  underlayElem.value.classList.remove('show');
  document.body.classList.remove('overflow-hidden');
  document.removeEventListener('click', handleBodyClick);
  document.removeEventListener('keydown', handleEscapePress);
  if (focusTrap) focusTrap.unset();

  setTimeout(() => {
    modalElem.value.classList.remove('open');
    underlayElem.value.classList.remove('open');

    if (triggerBtn.value) {
      triggerBtn.value?.focus();
      triggerBtn.value = null;
    }
  }, props.animationDuration);

  isOpen.value = false;
  emit('modalClosed');
};

const handleBodyClick = ({ target }) => {
  if (!modalElem.value) return;

  if (!modalElem.value.contains(target)) {
    // Stacked modals check, don't close if clicking inside another modal
    const parentModal = modalElem.value.closest('.modal-dialog');
    const targetParentModal = target.closest('.modal-dialog');
    if (parentModal !== targetParentModal) return;

    closeModal();
  }
};

const handleEscapePress = ({ keyCode }) => {
  if (keyCode !== 27) return;

  // Stacked modals check, don't close if calculator/disclaimer is opened over unit modal
  const openModals = document.querySelectorAll('[role="dialog"][aria-modal="true"].open');
  if (openModals.length > 1 && modalElem.value?.classList?.contains('availability-listing-modal__modal-container')) return;

  closeModal();
};

defineExpose({
  toggleModal,
  openModal,
  closeModal,
});
</script>

<style lang="scss">
  @forward './ModalDialog.scss';
</style>
