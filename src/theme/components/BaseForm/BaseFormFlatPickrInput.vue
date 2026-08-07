<template>
  <div
    ref="container"
    class="base-form-flatpickr-input base-form__field-wrap base-form__field-wrap--flatpickr-input input-wrap"
    :class="{ 'has-error': !!errMsg }"
  >
    <input
      :id="name"
      class="base-form-flatpickr-input__input input"
      type="text"
      :name="name"
      :required="required"
      :aria-describedby="`${name}-description`"
      :placeholder="name"
      readonly
      :value="modelValue"
      v-bind="attributes"
      @click="toggleCalendar"
    >

    <label
      class="base-form-flatpickr-input__label label"
      :for="name"
    >
      {{ label }}
    </label>

    <span
      class="base-form-flatpickr-input__cal-icon-wrap"
      aria-hidden="true"
    >
      <span
        class="base-form-flatpickr-input__cal-icon svg"
        v-html="Calendar"
      ></span>
    </span>

    <div
      :id="`${name}-description`"
      class="base-form-flatpickr-input__description field-description"
    >
      <span
        v-if="errMsg"
        class="base-form-flatpickr-input__error-msg field-error"
      >
        {{ errMsg }}
      </span>
    </div>

    <div
      class="base-form-flatpickr-input__calendar-popup"
      :class="{ show: calendarOpen }"
    >
      <flat-pickr
        ref="flatPickrRef"
        v-model="pickrDate"
        :config="{
          clickOpens: false,
          inline: true,
          minDate: 'today',
          monthSelectorType: 'static',
          yearSelectorType: 'static',
          dateFormat: 'M d, Y',
          onReady: setWidgetYear,
          onYearChange: setWidgetYear,
          onChange: flatpickrOnChange,
        }"
      />
    </div>
  </div>
</template>

<script setup>
import Calendar from '!!theme/assets/icons/calendar.svg?raw';

import flatPickr from 'vue-flatpickr-component';

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

const container = ref(null);
const flatPickrRef = ref(null);

const errMsg = ref('');
const calendarOpen = ref(false);
const pickrDate = ref(null);

const registerToForm = inject('registerToForm');

onMounted(() => {
  registerToForm?.({
    validateField,
  });
});

const toggleCalendar = () => {
  if (calendarOpen.value) {
    closeCalendar();
  } else {
    openCalendar();
  }
};

const openCalendar = () => {
  calendarOpen.value = true;
  document.addEventListener('click', handleBodyClick);
};

const closeCalendar = () => {
  calendarOpen.value = false;
  document.removeEventListener('click', handleBodyClick);
};

const handleBodyClick = ({ target }) => {
  if (!container.value.contains(target)) {
    closeCalendar();
  }
};

const setWidgetYear = (selectedDates, dateStr, instance) => {
  const container = instance?.calendarContainer;
  if (!container) return;

  const yearInputWrapper = container.querySelector('.flatpickr-current-month .numInputWrapper');
  if (!yearInputWrapper) return;

  yearInputWrapper.innerHTML = instance.currentYear;
};

const flatpickrOnChange = selectedDate => {
  const date = selectedDate[0];
  const value = date ? getDateInputFormat(date) : '';

  emit('update:modelValue', value);

  closeCalendar();
};

const getDateInputFormat = date => {
  const fp = flatPickrRef.value?.fp;
  if (!fp) return;

  return fp.formatDate(date, 'Y-m-d');
};

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

  const fp = flatPickrRef.value?.fp;
  if (!fp) return false;

  const selectedDates = fp.selectedDates || [];
  const dateValue = selectedDates[0];
  if (!dateValue) return false;

  const minDate = new Date(`${props.minimumDate.date}T00:00:00`);

  return dateValue > minDate;
};

const isMaximumDateValid = () => {
  if (!props.maximumDate) return true;

  const fp = flatPickrRef.value?.fp;
  if (!fp) return false;

  const selectedDates = fp.selectedDates || [];
  const dateValue = selectedDates[0];
  if (!dateValue) return false;

  const maxDate = new Date(`${props.maximumDate.date}T00:00:00`);

  return dateValue < maxDate;
};
</script>

<style lang="scss">
  @forward '!!theme/assets/scss/base/flat-pickr-calendar.scss';
</style>
