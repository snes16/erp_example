<template>
  <div class="password_field">
    <input
        v-model="inputValue"
        class="input-plain password_field-input"
        :class="disabled ? '' : '-editable_fields'"
        :type="currentType"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        @input="onInput"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
    />
    <i class="password_field-toggle glyphicon"
       :class="currentType === 'password' ? 'glyphicon-eye-open' : 'glyphicon-eye-close'"
       @click="toggleType"
    />
  </div>
</template>

<script>
export default {
  name: 'password-field',
  props: {
    value: String,
    placeholder: {
      type: String,
      default: 'Пароль'
    },
    autocomplete: {
      type: String,
      default: 'password'
    },
    disabled: Boolean
  },
  data() {
    return {
      currentType: 'password',
      inputValue: ''
    }
  },
  watch: {
    value: function (newValue) {
      if (newValue !== this.inputValue) this.inputValue = newValue;
    }
  },
  created() {
    this.inputValue = this.value;
  },
  methods: {
    onInput() {
      this.$emit('input', this.inputValue);
    },
    onChange() {
      this.$emit('change', this.inputValue);
    },
    onFocus() {
      this.$emit('focus');
    },
    onBlur() {
      this.$emit('blur');
    },
    toggleType() {
      this.currentType = this.currentType === 'password' ? 'text' : 'password';
    }
  }
}
</script>