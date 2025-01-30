<template>
  <div class="profile-support card">
    <div class="profile-support-header">
      <h3 class="mb-0">Сообщения</h3>
    </div>
    <div class="profile-support-chats">
      <div class="profile-support-chats-chat" @click="onClickChat">
        <bubble-with-question-mark class="profile-support-chats-chat-icon" />
        <div class="profile-support-chats-chat-main">
          <p class="mb-0"><b>Служба поддержки</b></p>
          <div v-if="newestMessage" class="profile-support-chats-chat-main-info">
            <span>Обращение № {{ newestMessage.request_id }}</span>
            <span class="text-gray-text">{{ shownDate }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="profile-support-main">
      <div class="profile-support-main-header">
        <span>Служба поддержки</span>
      </div>
      <support-chat :messages="supportMessages"
                    :is-loading="status === 'creating-message'"
                    ref="support-chat"
                    @send-message="sendMessage"
                    @scrolled-to-top="fetchNextPage"
      />
    </div>
  </div>
</template>

<script>
import SupportChat from "@/pages/Profile/components/Support/SupportChat.vue";
import bubbleWithQuestionMark from "@/assets/vue-svg/bubble-with-question-mark.svg";
import moment from "moment";

export default {
  name: 'WidgetSupport',
  props: {
    userId: Number,
  },
  components: {
    SupportChat,
    'bubble-with-question-mark': bubbleWithQuestionMark,
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
    newestMessage() {
      return this.supportMessages[0];
    },
    shownDate() {
      if (!this.newestMessage) return '';
      return moment(this.newestMessage.created_at).format('DD.MM.YYYY в HH:mm');
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if ((prevStatus === 'creating-message') && (newStatus === '')) this.$refs['support-chat'].clearMessageInput();
    },
  },
  created() {
    this.$store.dispatch('profile/fetchSupportMessages', {pagination_format: 'cursor'});
  },
  methods: {
    onClickChat() {
      if (window.innerWidth > 991) return;
      this.$emit('open-support-chat');
    },
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