<template>
  <div
    class="base-form-date-input base-form__field-wrap base-form__field-wrap--date-input input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <input
      :id="name"
      ref="inputRef"
      class="base-form-date-input__input input"
      :class="{ 'is-safari-desktop': isSafariDesktop }"
      type="date"
      :name="name"
      :value="modelValue"
      :required="required"
      :aria-describedby="`${name}-description`"
      v-bind="attributes"
      @input="emit('update:modelValue', $event.target.value)"
    >

    <label
      class="base-form-date-input__label label"
      :for="name"
    >
      {{ label }}
    </label>

    <div
      :id="`${name}-description`"
      class="base-form-date-input__description field-description"
    >
      <span
        v-if="errMsg"
        class="base-form-date-input__error-msg field-error"
      >
        {{ errMsg }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
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

  minimumDate: {
    required: false,
  },

  maximumDate: {
    required: false,
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
const isSafariDesktop = ref(false);

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
    focusField,
  });

  setIsSafariDesktop();
});

const validateField = () => {
  const hasValue = !!props.modelValue;
  let isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : `Please enter a value`;

  if (hasValue) {
    const isMinimumValid = isMinimumDateValid();
    const isMaximumValid = isMaximumDateValid();
    isValid = isMinimumValid && isMaximumValid;

    if (!isMinimumValid) {
      errMsg.value = props.minimumDate.errMsg;
    } else if (!isMaximumValid) {
      errMsg.value = props.maximumDate.errMsg;
    } else {
      errMsg.value = '';
    }
  }

  return isValid;
};

const isMinimumDateValid = () => {
  if (!props.minimumDate) return true;

  const dateValue = new Date(`${props.modelValue}T00:00:00`);
  return dateValue >= props.minimumDate.date;
};

const isMaximumDateValid = () => {
  if (!props.maximumDate) return true;

  const dateValue = new Date(`${props.modelValue}T00:00:00`);
  return dateValue <= props.maximumDate.date;
};

const focusField = () => {
  inputRef.value.focus();
};

const setIsSafariDesktop = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
  const isDesktop = !/iphone|ipad|ipod|mobile/.test(ua);

  isSafariDesktop.value = isSafari && isDesktop;
};
</script>
