<template>
  <div class="theme-helper-content">
    <div class="theme-helper-content-main-header">
      <h4 class="mb-0">Служба поддержки</h4>
    </div>
    <support-chat :messages="supportMessages"
                  :is-loading="status === 'creating-message'"
                  ref="support-chat"
                  @send-message="sendMessage"
                  @scrolled-to-top="fetchNextPage"
    />
  </div>
</template>

<script>
import SupportChat from "@/pages/Profile/components/Support/SupportChat.vue";

export default {
  name: "SupportChatDrover",
  components: {
    SupportChat,
  },
  computed: {
    supportMessages() {
      return this.$store.state.profile.supportMessages;
    },
    supportMessagesHeaders() {
      return this.$store.state.profile.supportMessagesHeaders;
    },
    status() {
      return this.$store.state.profile.supportMessagesStatus;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if ((prevStatus === 'creating-message') && (newStatus === '')) this.$refs['support-chat'].clearMessageInput();
    },
  },
  methods: {
    sendMessage(message) {
      this.$store.dispatch('profile/sendSupportMessage', message);
    },
    fetchNextPage() {
      if ((this.status === 'fetching-support-messages') || !this.supportMessagesHeaders.hasNextPage) return;
      this.$store.dispatch('profile/fetchSupportMessages', {pagination_format: 'cursor', cursor: this.supportMessages[this.supportMessages.length - 1].id});
    },
  },
}
</script>