<template>
  <div class="round_checkbox-container" @click="toggleChecked">
    <div class="round_checkbox" :class="{ 'active': checked }">
      <div class="round_checkbox-inner"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'roundCheckbox',
  props: {
    checked: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    toggleChecked() {
      this.$emit('change', !this.checked);
    }
  }
};
</script>