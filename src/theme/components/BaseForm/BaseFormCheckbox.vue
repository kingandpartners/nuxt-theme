<template>
  <div
    class="base-form-checkbox base-form__field-wrap base-form__field-wrap--checkbox input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <div class="base-form-checkbox__wrap">
      <input
        :id="name"
        ref="inputRef"
        class="base-form-checkbox__checkbox checkbox"
        type="checkbox"
        :name="name"
        :required="required"
        :aria-describedby="`${name}-description`"
        v-bind="attributes"
        @change="emit('update:modelValue', !modelValue)"
      >

      <label
        class="base-form-checkbox__label checkbox-label"
        :for="name"
      >
        <div class="base-form-checkbox__control checkbox-control">
          <span
            class="base-form-checkbox__check svg"
            v-html="CheckMark"
          ></span>
        </div>

        <span class="base-form-checkbox__label-text">
          {{ label }}
        </span>
      </label>
    </div>

    <div
      :id="`${name}-description`"
      class="base-form-checkbox__description field-description"
    >
      <span
        v-if="errMsg"
        class="base-form-checkbox__error-msg field-error"
      >
        {{ errMsg }}
      </span>
    </div>
  </div>
</template>

<script setup>
import CheckMark from '!!shared/assets/icons/check-mark.svg?raw';

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

  errMsg.value = isValid ? '' : `*Required`;

  return isValid;
};

const focusField = () => {
  inputRef.value.focus();
};
</script>
