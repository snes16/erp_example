<template>
  <div v-if="isMessage" class="support_chat-messages-message">
    <bubble-with-question-mark v-if="placeholder" class="support_chat-messages-message-icon" />
    <avatar v-else :url="shownMessage.author.avatar" size="-xs" />
    <div class="support_chat-messages-message-main">
      <div class="support_chat-messages-message-main-top">
        <b class="support_chat-messages-message-main-top-name">{{ shownMessage.author.shown_name }}</b>
        <span class="support_chat-messages-message-main-top-date">{{ shownDate }}</span>
      </div>
      <p class="mb-0">{{ shownMessage.message }}</p>
      <div v-if="shownMessage.attachments && shownMessage.attachments.length" class="support_chat-messages-message-main-attachments">
        <div class="support_chat-messages-message-main-attachments-card">
          <div v-for="(attachment, key) in shownMessage.attachments"
               class="support_chat-messages-message-main-attachments-card-attachment"
               :style="{backgroundImage: `url(${attachment.preview_link})`, backgroundSize: 'cover'}"
               :key="attachment.id"
               @click="onClickAttachment(key)"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="support_chat-messages-message" :class="{[`-${shownMessage.type}`]: shownMessage.type}">
    <span v-if="isSupport">
       {{ message.system_message.message }}
    </span>
    <span v-else-if="shownMessage.type === 'request_opened'">Новое обращение №{{ shownMessage.request_id }}</span>
    <span v-else-if="shownMessage.type === 'request_closed'">Обращение №{{ shownMessage.request_id }} закрыто</span>
    <span>{{ shownDate }}</span>
  </div>
</template>

<script lang="ts">
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import bubbleWithQuestionMark from "@/assets/vue-svg/bubble-with-question-mark.svg";
import moment from "moment";

export default {
  name: "SupportMessage",
  props: {
    message: Object,
    placeholder: Boolean,
    isSupport: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    Avatar,
    'bubble-with-question-mark': bubbleWithQuestionMark,
  },
  data() {
    return {
      placeholderMessage: {
        type: 'message',
        author: {
          shown_name: 'Служба поддержки',
        },
        message: 'Добрый день! Оставьте свое сообщение, наши специалисты вам помогут.',
      },
    }
  },
  computed: {
    isMessage() {
      return  ['message', 'task'].includes(this.shownMessage.type)
    },
    shownMessage() {
      if (this.placeholder) return this.placeholderMessage;
      return this.message;
    },
    shownDate() {
      if (!this.shownMessage.created_at) return '';
      return moment(this.shownMessage.created_at).format('DD.MM.YYYY в HH:mm');
    },
  },
  methods: {
    getBoundingClientRect() {
      return this.$el.getBoundingClientRect();
    },
    onClickAttachment(id) {
      this.$emit('click-attachment', id);
    },
  },
}
</script>