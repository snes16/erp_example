<template>
  <input v-model="formattedCardNumber" class="payment_info-input" maxLength="19" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown" />
</template>

<script>
export default {
  name: "card-number-input",
  props: {
    value: String,
  },
  data() {
    return {
      prevValue: '',
    }
  },
  computed: {
    formattedCardNumber: {
      get() {
        let cardNumber = this.value ? this.value.replaceAll(/\D/g, '') : '';
        if ((cardNumber.length >= 4) && (cardNumber[4] !== ' ')) cardNumber = cardNumber.slice(0, 4) + ' ' + cardNumber.slice(4);
        if ((cardNumber.length >= 9) && (cardNumber[9] !== ' ')) cardNumber = cardNumber.slice(0, 9) + ' ' + cardNumber.slice(9);
        if ((cardNumber.length >= 14) && (cardNumber[14] !== ' ')) cardNumber = cardNumber.slice(0, 14) + ' ' + cardNumber.slice(14);
        return cardNumber;
      },
      set(value) {
        this.$emit('input', value.replace(/\D/g, ''));
      },
    },
  },
  created() {
    this.prevValue = this.value;
  },
  methods: {
    onFocus() {
      this.prevValue = this.formattedCardNumber;
    },
    onBlur() {
      if (this.prevValue !== this.formattedCardNumber) {
        this.$emit("change");
      }
    },
    onKeyDown(event) {
      if (!event.ctrlKey && !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "Backspace", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Tab"].includes(event.key))
        return event.preventDefault();
      let cursorPosition = event.target.selectionStart;
      if ((cursorPosition === this.formattedCardNumber.length) || ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Tab"].includes(event.key) || event.ctrlKey) return true;
      if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)) cursorPosition++;
      if (["Backspace"].includes(event.key) && cursorPosition > 0) cursorPosition--;
      setTimeout(() => event.target.setSelectionRange(cursorPosition, cursorPosition), 10);
    },
  },
};
</script>