<template>
  <vue-phone-number-input v-model="rawPhone"
                          :translations="phoneInputTranslations"
                          :default-country-code="null"
                          no-use-browser-locale
                          :preferred-countries="preferredCountries"
                          :error="error"
                          :required="required"
                          :disabled="disabled"
                          @update="onUpdate"
                          @phone-number-blur="onBlur"
  />
</template>

<script>
import VuePhoneNumberInput from 'vue-phone-number-input';

export default {
  name: 'phone-number-input',
  props: {
    value: String,
    error: Boolean,
    required: Boolean,
    disabled: Boolean,
  },
  components: {
    'vue-phone-number-input': VuePhoneNumberInput,
  },
  data() {
    return {
      phoneInputTranslations: {
        countrySelectorLabel: 'Код',
        countrySelectorError: 'Ошибка',
        phoneNumberLabel: 'Введите номер',
        example: 'Пример:'
      },
      preferredCountries: ['KZ', 'KG', 'RU', 'UA', 'GE', 'UZ'],
      rawPhone: null,
      fullPhone: {},
    }
  },
  created() {
    if (this.value) this.rawPhone = this.value;
  },
  watch: {
    value: function (newValue) {
      this.rawPhone = newValue;
    }
  },
  methods: {
    onUpdate(e) {
      if (!e.phoneNumber?.length) return this.$emit('input', null);
      this.fullPhone = e;
      this.$emit('input', e.formattedNumber);
      this.$emit('update', this.fullPhone);
    },
    onBlur() {
      this.$emit('change', this.fullPhone);
    },
  }
}
</script>