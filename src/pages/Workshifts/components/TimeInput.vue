<template>
  <input v-model="formattedTime"
         maxlength="5"
         class="input-plain"
         ref="input"
         :disabled="disabled"
         :placeholder="placeholder"
         @click.stop
         @input="validateTimeFormat"
         @change="changeTime"
         @click="select"/>
</template>

<script>
import {showToast} from "@/tools/tools";

export default {
  name: 'time-input',
  props: {
    value: String,
    disabled: {
      type: Boolean,
      default: false
    },
    endPeriodThreshold: Object,
    date: String,
    placeholder: {
      type: String,
      default: '--:--'
    },
    showError: {
      type: Boolean,
      default: false
    },
    startAt: String,
  },
  data() {
    return {
      formattedTime: '',
    }
  },
  watch: {
    value: function (newValue) {
      this.formattedTime = newValue || '';
    },
  },
  created() {
    if (this.value) this.formattedTime = this.value || '';
  },
  methods: {
    validateTimeFormat() {
      this.formattedTime = this.formattedTime.replace(/[^0-9:]/g, '').replace(/(\..*?)\..*/g, '$1');
    },
    changeTime() {
      if (this.showError) {
        this.formattedTime = '';
        showToast(this.$toasted, 'Сначала введите время начала', 'error');
      }
      if (this.formattedTime === '') return this.$emit('input', null);
      this.formattedTime = this.formattedTime.replace(/:/g, '');
      if (this.formattedTime.length <= 2) return this.formattedTime = this.value;
      if (this.formattedTime.length === 3) this.formattedTime = '0' + this.formattedTime;
      this.formattedTime = `${this.formattedTime.substr(0, 2)}:${this.formattedTime.substr(2, 2)}`;
      this.$emit('input', this.formattedTime);
    },
    select() {
      this.$refs.input.select();
    },
  }
}
</script>