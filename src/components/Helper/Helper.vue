<template>
    <div :class="{ 'theme-helper': true, 'theme-helper-opened': helperOpened && (type === activeHelperType) }">
      <section class="directory widget theme-helper-content -paddingless" :class="contentClass || ''">
          <div v-if="!hideHeaderClose" class="theme-helper-content-close helper-close" id="helper_close" @click="switchToggle()"></div>
        <slot />
      </section>
    </div>
</template>

<script>
export default {
    name: 'Helper',
    props: {
        contentClass: String,
        type: {
            type: String,
            default: null
        },
        hideHeaderClose: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        helperOpened() {
            return this.$store.state.layout.helperOpened;
        },
        activeHelperType() {
            return this.$store.state.layout.activeHelperType;
        },
    },
    methods: {
        switchToggle() {
            this.$store.dispatch('layout/toggleHelper', false);
        }
    }
};
</script>