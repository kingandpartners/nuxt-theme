<template>
  <div
    class="base-form-input base-form__field-wrap base-form__field-wrap--input input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <input
      :id="name"
      ref="inputRef"
      class="base-form-input__input input"
      :type="type"
      :name="name"
      :placeholder="label"
      :required="required"
      :aria-describedby="`${name}-description`"
      v-bind="attributes"
      @input="emit('update:modelValue', $event.target.value)"
    >

    <label
      class="base-form-input__label label"
      :for="name"
    >
      {{ label }}
    </label>

    <div
      :id="`${name}-description`"
      class="base-form-input__description field-description"
    >
      <span
        v-if="description"
        class="base-form-input__description-text"
      >
        {{ description }}
      </span>

      <span
        v-if="errMsg"
        class="base-form-input__error-msg field-error"
      >
        {{ errMsg }}
      </span>
    </div>
  </div>
</template>

<script setup>
import validate from 'validate.js';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  label: {
    type: String,
    required: true,
  },

  required: {
    type: Boolean,
    required: false,
    default: false,
  },

  description: {
    type: String,
    required: false,
    default: '',
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
  let isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : props.requiredErrorMessage;

  if (props.type === 'email' && hasValue) {
    const emailValidation = validate.single(props.modelValue, { email: true });

    isValid = emailValidation === undefined;
    errMsg.value = isValid ? '' : 'Invalid email';
  }

  return isValid;
};

const focusField = () => {
  inputRef.value.focus();
};
</script>
