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
// Lifted verbatim from validate.js 0.13.1 (validators.email.PATTERN), which
// this component used to depend on for exactly this one check. Keeping the
// pattern byte-for-byte means no address that used to validate stops doing so.
//
// The dependency was dropped because it is a 2019 UMD bundle whose CommonJS
// exports are invisible to esbuild -- it wraps everything in an IIFE that takes
// `module` and `exports` as arguments -- so the default import resolves to
// undefined in a dev server and takes the whole page down with it.
const EMAIL_PATTERN = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

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
    isValid = EMAIL_PATTERN.test(props.modelValue);
    errMsg.value = isValid ? '' : 'Invalid email';
  }

  return isValid;
};

const focusField = () => {
  inputRef.value.focus();
};
</script>
