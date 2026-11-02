<template>
  <div
    class="base-form-textarea base-form__field-wrap base-form__field-wrap--textarea input-wrap textarea-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <textarea
      :id="name"
      ref="inputRef"
      class="base-form-textarea__textarea textarea"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder || label"
      :required="required"
      :aria-describedby="`${name}-description`"
      v-bind="attributes"
      :maxlength="limit"
      @input="emit('update:modelValue', $event.target.value)"
    ></textarea>

    <label
      class="base-form-textarea__label label"
      :for="name"
    >
      {{ label }}
    </label>

    <div
      :id="`${name}-description`"
      class="base-form-textarea__description field-description"
    >
      <span
        v-if="errMsg"
        class="base-form-textarea__error-msg field-error"
      >
        {{ errMsg }}
      </span>

      <span
        v-if="limit"
        class="visually-hidden"
      >
        Up to {{ limit }} characters.
      </span>
    </div>

    <!-- The running count is visual only. Announcing it on every keystroke
    would talk over the typing; the limit itself is in the description, and
    the browser enforces it through maxlength. -->
    <span
      v-if="limit"
      class="base-form-textarea__count field-count"
      aria-hidden="true"
    >
      {{ characterCount }}/{{ limit }}
    </span>
  </div>
</template>

<script setup>
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

  // Caps the length and shows a count under the field ("0/200"). Without it
  // there's no count, as before. A maxlength passed in `attributes` counts too.
  maxlength: {
    type: Number,
    required: false,
    default: null,
  },

  modelValue: {
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const limit = computed(() => props.maxlength ?? (Number(props.attributes?.maxlength) || null));

// String length counts UTF-16 code units, the same unit maxlength enforces, so
// the count and the cap always agree.
const characterCount = computed(() => (props.modelValue ? String(props.modelValue).length : 0));

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

  errMsg.value = isValid ? '' : `Please enter a message`;

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
