<template>
  <div
    ref="comboBoxContainerRef"
    class="base-form-combo-box base-form__field-wrap base-form__field-wrap--combo-box input-wrap combo-box"
    :class="{
      'has-error': !!errMsg,
      'is-expanded': isExpanded,
    }"
  >
    <button
      :id="`${name}-trigger-bar`"
      ref="triggerRef"
      class="combo-box__btn"
      role="combobox"
      aria-haspopup="listbox"
      :aria-label="triggerButtonLabel"
      :aria-expanded="isExpanded ? 'true' : 'false'"
      :aria-controls="`${name}-listbox`"
      @click.prevent="handleToggleClick"
      @keydown="handleToggleKeypress"
    >
      <span
        class="combo-box__btn-text combo-box-text"
        v-text="triggerButtonText"
      ></span>

      <span
        class="combo-box__select-icon svg"
        v-html="SelectArrow"
      ></span>
    </button>

    <ul
      :id="`${name}-listbox`"
      class="combo-box__listbox"
      :class="{ 'scroll-box': options.length > 5 }"
      role="listbox"
      :aria-labelledby="`${name}-trigger-bar`"
    >
      <li
        v-for="(option, index) in options"
        :id="`${name}-listbox-option-${index}`"
        :key="`${name}-listbox-option-${index}`"
        :ref="el => setOptionRef(el, index)"
        class="combo-box__item"
        role="option"
        :aria-selected="modelValue === option"
        @click="() => handleOptionClick(option)"
      >
        <span
          class="combo-box__item-text combo-box-text"
          v-text="option"
        ></span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import SelectArrow from '!!theme/assets/icons/select-drop-arrow.svg?raw';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },

  label: {
    type: String,
    required: true,
  },

  options: {
    type: Array,
    default: () => [],
  },

  required: {
    type: Boolean,
    required: false,
    default: false,
  },

  attributes: {
    type: Object,
    required: false,
    default: () => {},
  },

  modelValue: {
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const comboBoxContainerRef = ref(null);
const triggerRef = ref(null);
const optionRefs = ref([]);

const isExpanded = ref(false);
const focusedOption = ref(null);
const errMsg = ref('');

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
    focusField,
  });
});

const triggerButtonText = computed(() => props.modelValue || props.label);

const triggerButtonLabel = computed(() => `${props.label} ${props.modelValue || ''}`);

const setOptionRef = (el, index) => {
  optionRefs.value[index] = el;
};

const validateField = () => {
  const hasValue = !!props.modelValue;
  const isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : `Required`;

  return isValid;
};

const focusField = () => {
  triggerRef.value.focus();
};

const handleToggleClick = () => {
  if (isExpanded.value) {
    closeOptions();
    focusField();
  } else {
    expandOptions();
  }
};

const expandOptions = () => {
  document.addEventListener('click', handleBodyClick);
  isExpanded.value = true;
};

const closeOptions = () => {
  document.removeEventListener('click', handleBodyClick);
  isExpanded.value = false;
  focusedOption.value = null;
  focusField();
};

const handleBodyClick = ({ target }) => {
  if (!comboBoxContainerRef.value) return;

  if (!comboBoxContainerRef.value.contains(target) && isExpanded.value) {
    closeOptions();
  }
};

const handleOptionClick = value => {
  emit('update:modelValue', value);
  closeOptions();
  nextTick(() => validateField());
};

const handleToggleKeypress = e => {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();

      if (isExpanded.value) {
        selectPreviousOption();
      } else {
        expandOptions();
        selectLastOption();
      }
      break;

    case 'ArrowDown':
      e.preventDefault();

      if (isExpanded.value) {
        selectNextOption();
      } else {
        expandOptions();
        selectFirstOption();
      }
      break;

    case 'Tab':
      closeOptions();
      break;

    case 'Escape':
      if (isExpanded.value) {
        e.preventDefault();
        closeOptions();
      }
      break;
  }
};

const selectOption = index => {
  const selectedOption = optionRefs.value[index];
  if (!selectedOption) return;

  triggerRef.value.setAttribute('aria-activedescendant', selectedOption.getAttribute('id'));

  const value = props.options[index];
  emit('update:modelValue', value);
};

const selectFirstOption = () => {
  selectOption(0);
  focusedOption.value = 0;
};

const selectLastOption = () => {
  const lastOptionIndex = props.options.length - 1;

  selectOption(lastOptionIndex);
  focusedOption.value = lastOptionIndex;
};

const selectNextOption = () => {
  if (focusedOption.value === null) {
    selectFirstOption();
    return;
  }

  const nextIndex = focusedOption.value + 1;
  const index = Math.min(nextIndex, props.options.length - 1);

  selectOption(index);
  focusedOption.value = index;
};

const selectPreviousOption = () => {
  if (focusedOption.value === null) {
    selectLastOption();
    return;
  }

  const prevIndex = focusedOption.value - 1;
  const index = Math.max(prevIndex, 0);

  selectOption(index);
  focusedOption.value = index;
};
</script>
