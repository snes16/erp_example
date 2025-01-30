<template>
  <b-button :variant=variant class="throbber-button" :disabled="loading || disabled" :size="size" @click="click">
    <div v-if="loading" class="throbber-button-block">
      <throbber class="throbber -button" :class="`-button-${colorThrobber}${size !== 'sm' ? ' -button-larger' : ''}`"/>
    </div>
    <span :class="{ 'throbber-button-transparent': loading }">
      <slot></slot>
    </span>
  </b-button>
</template>

<script>
import throbber from "@/assets/vue-svg/throbber.svg";
export default {
  name: "ButtonThrobber",
  components: {
    'throbber': throbber
  },
  props: {
    variant: {
      type: String,
      default: 'primary'
    },
    colorThrobber: {
      type: String,
      default: 'white'
    },
    loading: Boolean,
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
        type: String,
        default: 'md'
    },
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    }
  }
}
</script>