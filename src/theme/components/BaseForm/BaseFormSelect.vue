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
          Select...
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

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
    focusField,
  });
});

const validateField = () => {
  const hasValue = !!props.modelValue;
  const isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : `Required`;

  return isValid;
};

const focusField = () => {
  inputRef.value.focus();
};
</script>
