<template>
  <div class="card profile_main-card">
    <div class="profile_main-card-header pb-3">
        <h3>Ваш аккаунт не активен</h3>
    </div>
    <div class="profile_main-card-body d-flex flex-column pt-3">
      <span class="text-fw-400 text-lh-20 mb-1">Добрый день! Ваш аккаунт не активен. Для активации обратитесь в службу поддержки.</span>
      <b-button class="mt-3 width-fit-content pl-4 pr-4" variant="primary" size="md" @click="goToMessagesTab">Написать сообщение</b-button>
    </div>
  </div>
</template>
<script>

export default {
  name: 'widget-inactivity',
  methods: {
    goToMessagesTab() {
      this.$emit('goToMessagesTab');
    },
  },
};
</script>