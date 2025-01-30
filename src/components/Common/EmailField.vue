<template>
  <label :for="resultId" class="email_field" :class="{'-empty': !this.fieldValue.length, '-error': error}">
    <input v-model="fieldValue"
           v-autowidth="{maxWidth: '100%', minWidth: '0', comfortZone: 0}"
           :id="resultId"
           class="email_field-input input-plain"
           :class="{'-error': error}"
           type="text"
           :disabled="disabled"
           :required="required"
           @change="onChange"
           @focus="onFocus"
    />
    <span class="email_field-domain">{{ emailDomain }}</span>
  </label>
</template>

<script>
import { emailDomain, generateRandomString } from '@/tools/tools';

export default {
  name: 'email-field',
  props: {
    value: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    id: String,
  },
  data() {
    return {
      resultId: this.id || generateRandomString(8),
    }
  },
  computed: {
    fieldValue: {
      get() {
        return this.value?.replace(emailDomain, '') || '';
      },
      set(value) {
        this.$emit('input', value + emailDomain);
      },
    },
    emailDomain() {
      return emailDomain;
    },
  },
  methods: {
    onChange(e) {
      this.$emit('change', e);
    },
    onFocus(e) {
      this.$emit('focus', e);
    },
  },
}
</script>