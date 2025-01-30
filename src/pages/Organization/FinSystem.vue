<template>
  <iframe v-if="user.id" class="iframe" allow="clipboard-read; clipboard-write" :src="iframeUrl"/>
</template>

<script>
import config from '@/config';

export default {
  name: 'fin-system',
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    iframeUrl() {
      return `${config.finSystemHost}/#/employee_login?user_id=${this.user.id}`;
    },
  },
}
</script>