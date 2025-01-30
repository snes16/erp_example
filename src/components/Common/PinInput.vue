<template>
  <div class="pin-input">
    <h2 class="pin-input-title">{{ title }}</h2>
    <h3 v-if="subTitle" class="pin-input-sub_title">{{ subTitle }}</h3>
    <div v-else class="pin-input-spacer16"/>
    <div class="pin-input-main">
      <span v-if="error" class="pin-input-main-error">{{ error }}</span>
      <div class="pin-input-main-input" :class="{'-error': error, [dotsBlockClass]: true}">
        <span class="pin-input-main-input-dot"/>
        <span class="pin-input-main-input-dot"/>
        <span class="pin-input-main-input-dot"/>
        <span class="pin-input-main-input-dot"/>
        <span class="pin-input-main-input-placeholder">Введите PIN</span>
      </div>
      <div class="pin-input-main-input_mob">
        <div class="pin-input-main-input_mob-inner" :class="dotsBlockClass">
          <div class="pin-input-main-input_mob-inner-dot"/>
          <div class="pin-input-main-input_mob-inner-dot"/>
          <div class="pin-input-main-input_mob-inner-dot"/>
          <div class="pin-input-main-input_mob-inner-dot"/>
        </div>
      </div>
      <div class="pin-input-main-keys">
        <div class="pin-input-main-keys-container">
          <template v-for="itemNum in keyNums">
            <div class="pin-input-main-keys-container-key hidden-below_md" :key="`desktop-${itemNum}`" @click="addValueInInput(itemNum)">
              <div v-if="itemNum !== ''" class="pin-input-main-keys-container-key-circle" :class="{'-press': valuePressKey === itemNum}">{{ itemNum }}</div>
            </div>
            <div class="pin-input-main-keys-container-key hidden-above_md" :key="`mobile-${itemNum}`" @touchstart.prevent="addValueInInput(itemNum)">
              <div v-if="itemNum !== ''" class="pin-input-main-keys-container-key-circle" :class="{'-press': valuePressKey === itemNum}">{{ itemNum }}</div>
            </div>
          </template>
          <div class="pin-input-main-keys-container-key hidden-below_md" @click="delLastSymbol">
            <div class="pin-input-main-keys-container-key-backspace">
              <backspace-icon/>
            </div>
          </div>
          <div class="pin-input-main-keys-container-key hidden-above_md" @touchstart.prevent="delLastSymbol">
            <div class="pin-input-main-keys-container-key-backspace">
              <backspace-icon/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="default"/>
  </div>
</template>

<script>
import backspaceIcon from '@/assets/vue-svg/backspace-icon.svg';
import {isNumber} from "highcharts";

export default {
  name: 'PinInput',
  props: {
    value: String,
    title: String,
    subTitle: String,
    error: String,
  },
  components: {
    'backspace-icon': backspaceIcon,
  },
  data() {
    return {
      keyNums: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'],
      valuePressKey: null,
      clearKeyTimeout: null,
      localValue: '',
    }
  },
  computed: {
    resultingValue: {
      get() {
        if (typeof this.value === 'string') return this.value;
        return this.localValue;
      },
      set(value) {
        if (typeof this.value === 'string') return this.$emit('input', value);
        this.localValue = value;
      },
    },
    dotsBlockClass() {
      if (!this.resultingValue.length) return '-active_none';
      return `-active_${this.resultingValue.length}`;
    },
  },
  created() {
    document.addEventListener('keydown', this.handlerKeyPress);
  },
  destroyed() {
    document.removeEventListener('keydown', this.handlerKeyPress);
  },
  methods: {
    addValueInInput(num) {
      if (this.resultingValue.length === 4) return;
      const keyNum = num.replace(/\D/g, '');
      if (this.valuePressKey) this.errorText = '';
      // animation touch on num btn
      this.valuePressKey = keyNum;
      if (this.clearKeyTimeout) clearTimeout(this.clearKeyTimeout);
      this.clearKeyTimeout = setTimeout(this.clearPressedKey, 1000);
      const newValue = this.resultingValue + keyNum;
      this.resultingValue = newValue;

      this.$emit('input', newValue);
      if (newValue.length === 4) this.$emit('change', newValue);
    },
    clearPressedKey() {
      this.valuePressKey = null;
      this.clearKeyTimeout = null;
    },
    delLastSymbol() {
      this.resultingValue = this.resultingValue.slice(0, -1);
    },
    handlerKeyPress(e) {
      if (e.key === 'Backspace') return this.delLastSymbol();
      if (!isNumber(parseInt(e.key))) return;
      this.addValueInInput(e.key);
    },
  },
}
</script>
