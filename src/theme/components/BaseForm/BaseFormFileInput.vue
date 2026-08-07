<template>
  <div
    class="base-form-file-input base-form__field-wrap base-form__field-wrap--file-input input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <label
      :for="name"
      class="base-form-file-input__label label"
    >
      {{ label }}
    </label>

    <div class="base-form-file-input__input-wrap">
      <input
        :id="name"
        class="base-form-file-input__input"
        type="file"
        :name="name"
        :required="required"
        :accept="acceptableFileTypes"
        :aria-describedby="`${name}-description`"
        @change="updateFiles"
      >
    </div>

    <div
      :id="`${name}-description`"
      class="base-form-file-input__description"
    >
      <span v-if="sizeLimit">
        Max file size: <span class="base-form-file-input__size-limit-text">{{ sizeLimit }}</span>
      </span>

      <template v-if="errMsg">
        <br>

        <span class="base-form-file-input__error-msg field-error field-description">
          {{ errMsg }}
        </span>
      </template>
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

const acceptableFileTypes = computed(() => {
  if (!props?.attributes?.filetypes) return '';

  return props?.attributes?.filetypes
    .split('|')
    .map(ext => `.${ext}`)
    .join(',');
});

const sizeLimit = computed(() => {
  if (!props?.attributes?.limit) return '';

  return props?.attributes?.limit;
});

onMounted(() => {
  registerToForm?.({
    validateField,
  });
});

const updateFiles = ({ target }) => {
  const value = target.files[0] || '';
  emit('update:modelValue', value);
};

const validateField = () => {
  const hasValue = !!props.modelValue;
  let isValid = props.required ? hasValue : true;

  errMsg.value = isValid ? '' : `Please choose a file`;

  if (hasValue) {
    isValid = isValidateFileSizeLimit();
    errMsg.value = isValid ? '' : 'Selected file exceeds max limit';
  }

  return isValid;
};

const isValidateFileSizeLimit = () => {
  if (!sizeLimit.value) return true;

  const match = /^(\d+(?:\.\d+)?)\s*(kb|mb|gb)$/i.exec(sizeLimit.value.trim());
  if (!match) return true;

  const value = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
  };

  const byteLimit = value * multipliers[unit];

  const fileSize = props.modelValue?.size;
  if (!fileSize) return false;

  return fileSize <= byteLimit;
};
</script>
