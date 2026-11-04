<template>
  <div
    ref="comboBoxContainerRef"
    class="base-form-combo-box base-form__field-wrap base-form__field-wrap--combo-box input-wrap combo-box"
    :class="{
      'has-error': !!errMsg,
      'has-value': !!modelValue,
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
      :aria-describedby="`${name}-description`"
      :aria-invalid="errMsg ? 'true' : undefined"
      @click.prevent="handleToggleClick"
      @keydown="handleToggleKeypress"
    >
      <!-- With floatingLabel, the label stays on the page beside the value, so
      a consumer can float it. It's aria-hidden because the button's
      aria-label already names the field. -->
      <span
        v-if="floatingLabel"
        class="combo-box__label label"
        aria-hidden="true"
        v-text="label"
      ></span>

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

    <div
      :id="`${name}-description`"
      class="base-form-combo-box__description field-description"
    >
      <span
        v-if="errMsg"
        class="base-form-combo-box__error-msg field-error"
      >
        {{ errMsg }}
      </span>
    </div>
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

  // Renders the label in its own element that stays after a selection, instead
  // of the value replacing it, so it can be styled as a floating label.
  floatingLabel: {
    type: Boolean,
    required: false,
    default: false,
  },

  requiredErrorMessage: {
    type: String,
    required: false,
    default: `Required`,
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

// Set the first time the field is validated, as in the other BaseForm fields.
const validated = ref(false);

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
    focusField,
  });
});

const triggerButtonText = computed(() => (props.floatingLabel ? props.modelValue : props.modelValue || props.label));

const triggerButtonLabel = computed(() => `${props.label} ${props.modelValue || ''}`);

const setOptionRef = (el, index) => {
  optionRefs.value[index] = el;
};

const validateField = () => {
  validated.value = true;

  const hasValue = !!props.modelValue;
  const isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : props.requiredErrorMessage;

  return isValid;
};

// Arrow keys choose an option without going through handleOptionClick, so
// without this an error outlived the value that corrected it.
watch(() => props.modelValue, () => {
  if (validated.value) validateField();
});

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
