<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  watch: {
    $route: function () {
      this.$store.dispatch('layout/toggleHelper', false);
    }
  }
};
</script>

<style src="./styles/theme.scss" lang="scss" />
