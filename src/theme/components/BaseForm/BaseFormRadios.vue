<template>
  <div
    class="base-form-radios base-form__field-wrap base-form__field-wrap--radios input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <fieldset class="base-form-radios__fieldset fieldset">
      <legend class="base-form-radios__legend legend">
        {{ label }}
      </legend>

      <div class="base-form-radios__options radio-options">
        <div
          v-for="(option, index) in options"
          :key="`radio-option-${name}-${index}`"
          class="base-form-radios__option radio-option"
        >
          <input
            :id="`radio-option-${name}-${index}`"
            class="base-form-radios__radio visually-hidden radio-input"
            type="radio"
            :name="name"
            :aria-describedby="`${name}-description`"
            v-bind="attributes"
            :value="option"
            :checked="modelValue === option"
            @change="emit('update:modelValue', $event.target.value)"
          >

          <label
            class="base-form-radios__label option-label"
            :for="`radio-option-${name}-${index}`"
          >
            <span class="base-form-radios__combobox radio-combobox"></span>

            {{ option }}
          </label>
        </div>
      </div>

      <div
        :id="`${name}-description`"
        class="base-form-radios__description field-description"
      >
        <span
          v-if="errMsg"
          class="base-form-radios__error-msg field-error"
        >
          {{ errMsg }}
        </span>
      </div>
    </fieldset>
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

const errMsg = ref('');

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
  });
});

const validateField = () => {
  const hasValue = !!props.modelValue;
  const isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : `*Required`;

  return isValid;
};
</script>
