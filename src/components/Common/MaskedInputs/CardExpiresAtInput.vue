<template>
  <input :value="formattedExpiresAt" maxlength="5" @input="onInput" @keydown="onKeyDown" @focus="onFocus" @blur="onBlur" />
</template>

<script>
export default {
  name: 'card-expires-at-input',
  props: {
    value: String,
  },
  data() {
    return {
      prevValue: '',
    };
  },
  computed: {
    formattedExpiresAt: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  created() {
    this.prevValue = this.formattedExpiresAt;
  },
  methods: {
    onFocus() {
      this.prevValue = this.formattedExpiresAt;
    },
    onBlur() {
      if (this.prevValue !== this.formattedExpiresAt) {
        this.$emit('change');
      }
    },
    onKeyDown(event) {
      if (!event.ctrlKey && !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "Backspace", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Tab"].includes(event.key))
        return event.preventDefault();
      let cursorPosition = event.target.selectionStart;
      if (event.key === "Backspace") {
        if (cursorPosition === 0)
          return event.preventDefault();
        if (this.formattedExpiresAt[cursorPosition - 1] === '/') {
          cursorPosition--;
          event.target.setSelectionRange(cursorPosition, cursorPosition);
          return event.preventDefault();
        }
      }
      if ((cursorPosition === this.formattedExpiresAt.length) || ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Tab"].includes(event.key) || event.ctrlKey) return true;
      if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)) cursorPosition++;
      if (["Backspace"].includes(event.key)) cursorPosition--;
      setTimeout(() => event.target.setSelectionRange(cursorPosition, cursorPosition), 10);
    },
    onInput(e) {
      let expiresAt = e.target.value ? e.target.value.replace(/\D/g, '') : '';
      if (expiresAt.length > 2) {
        expiresAt = expiresAt.slice(0, 2) + '/' + expiresAt.slice(2);
      }
      this.formattedExpiresAt = expiresAt;
    },
  },
};
</script>