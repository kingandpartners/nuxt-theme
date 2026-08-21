<template>
  <div
    class="base-form-select base-form__field-wrap base-form__field-wrap--select input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <div class="base-form-select__select-wrap select-wrap">
      <select
        :id="name"
        ref="inputRef"
        :name="name"
        :required="required"
        :aria-describedby="`${name}-description`"
        v-bind="attributes"
        class="base-form-select__select select"
        @change="emit('update:modelValue', $event.target.value)"
      >
        <option value="">
          {{ placeholder || 'Select...' }}
        </option>

        <option
          v-for="(option, index) in options"
          :key="`select-option-${name}-${index}`"
          :value="option"
          :selected="modelValue === option"
        >
          {{ option }}
        </option>
      </select>

      <span
        class="base-form-select__select-icon select-icon svg"
        v-html="SelectArrow"
      ></span>
    </div>

    <label
      class="base-form-select__label label"
      :for="name"
    >
      {{ label }}
    </label>

    <div
      :id="`${name}-description`"
      class="base-form-select__description field-description"
    >
      <span
        v-if="errMsg"
        class="base-form-select__error-msg field-error"
      >
        {{ errMsg }}
      </span>
    </div>
  </div>
</template>

<script setup>
import SelectArrow from '!!shared/assets/icons/select-arrow.svg?raw';

const props = defineProps({
  placeholder: {
    type: String,
    required: false,
    default: '',
  },

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

const inputRef = ref(null);

const errMsg = ref('');

// Set the first time the field is validated -- on submit, or when the form
// walks its fields. Until then the field says nothing, because complaining
// about a field nobody has reached yet is noise.
const validated = ref(false);

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
    focusField,
  });
});

const validateField = () => {
  validated.value = true;

  const hasValue = !!props.modelValue;
  const isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : `Required`;

  return isValid;
};

// Once a field has been told it is wrong, it re-checks itself as the value
// changes: an error that survives being corrected reads as the form having
// stopped listening.
watch(() => props.modelValue, () => {
  if (validated.value) validateField();
});

const focusField = () => {
  inputRef.value.focus();
};
</script>
