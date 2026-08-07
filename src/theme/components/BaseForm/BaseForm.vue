<template>
  <form
    class="base-form"
    novalidate
    @submit.prevent="submitForm"
  >
    <div class="base-form__container">
      <slot></slot>
    </div>

    <button
      class="base-form__submit submit-btn"
      type="submit"
      :disabled="isDisabled"
    >
      <span data-text="Submit">
        Submit
      </span>
    </button>
  </form>
</template>

<script setup>
defineProps({
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits([ 'submitForm', 'formValidationFailed', 'formValidationPassed' ]);

const fields = ref([]);

const registerToForm = field => {
  fields.value.push(field);
};

const submitForm = () => {
  const isValid = validateForm();
  if (isValid) emit('submitForm');
};

const validateForm = () => {
  const allFields = fields.value
    .filter(field => !!field.validateField)
    .map(field => ({ ...field, isValid: field.validateField() }));
  const allFieldsValid = allFields.every(({ isValid }) => isValid);

  if (!allFieldsValid) {
    const firstInvalidField = allFields.find(({ isValid }) => !isValid);
    if (firstInvalidField?.focusField) firstInvalidField.focusField();
    emit('formValidationFailed');
  } else {
    emit('formValidationPassed');
  }

  return allFieldsValid;
};

provide('registerToForm', registerToForm);
</script>
