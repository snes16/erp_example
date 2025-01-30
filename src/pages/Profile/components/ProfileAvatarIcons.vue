<template>
  <div>
    <div class="avatar-icon -telegram"
         :class="{'-inactive': !telegramConnected}"
         id="telegram-container"
         @click="getTelegramLink"
    >
      <telegram/>
      <b-tooltip target="telegram-container"
                 triggers="hover"
                 boundary="viewport"
                 :delay="{ 'show': 150, 'hide': 0 }"
                 placement="bottom"
      >
        <div class="profile-main-info-data-switches-block-tooltip">
          <div>
            <span v-if="telegramConnected">Уведомления подключены</span>
            <template v-else-if="isLinkLoading || currentTelegramLink">
              <b>Для подключения уведомлений {{ isMyProfile ? 'перейдите по ссылке' : 'отправьте ссылку' }}:</b>
              <div class="profile-main-info-data-switches-block-tooltip-main" :class="{'-loading': isLinkLoading}">
                <div v-if="isLinkLoading" class="profile-main-info-data-switches-block-tooltip-main-loading">
                  <throbber class="throbber profile-main-info-data-switches-block-tooltip-main-loading-throbber"/>
                </div>
                <span v-else>{{ currentTelegramLink }}</span>
                <copy class="profile-main-info-data-switches-block-tooltip-main-copy" @click="copyLink(currentTelegramLink)"/>
              </div>
            </template>
            <span v-else>Уведомления не подключены</span>
          </div>
          <div v-if="userType !== 'employee'" class="border-top border-gray-700 pt-2 mt-2">
            <div class="d-flex align-items-center">
              <b>Боты финансовой системы</b>
              <copy class="profile-main-info-data-switches-block-tooltip-copy" @click="copyAllFinBotsLinks"/>
            </div>
            <div class="profile-main-info-data-switches-block-tooltip-main">
              <span>{{ firstTelegramFinBotLink }}</span>
              <copy class="profile-main-info-data-switches-block-tooltip-main-copy" @click="copyLink(firstTelegramFinBotLink)"/>
            </div>
            <div class="profile-main-info-data-switches-block-tooltip-main">
              <span>{{ secondTelegramFinBotLink }}</span>
              <copy class="profile-main-info-data-switches-block-tooltip-main-copy" @click="copyLink(secondTelegramFinBotLink)"/>
            </div>
          </div>
        </div>
      </b-tooltip>
    </div>
    <div v-if="isFinAdmin"
         class="avatar-icon -fin_admin"
         v-b-tooltip.hover.bottom
         title="Имеет доступ к фин. системе"
    >
      <dollar-in-circle/>
    </div>
  </div>
</template>

<script>
import telegram from "@/assets/vue-svg/telegram.svg";
import dollarInCircle from "@/assets/vue-svg/dollar-in-circle.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import copy from "@/assets/vue-svg/copy-transparent.svg";
import { clipboard, showToast } from "@/tools/tools";

export default {
  name: 'profile-avatar-icons',
  props: {
    telegramConnected: Boolean,
    isFinAdmin: Boolean,
    isMyProfile: Boolean,
    currentTelegramLink: String,
    isLinkLoading: Boolean,
    userId: Number,
    userType: String,
  },
  components: {
    'telegram': telegram,
    'dollar-in-circle': dollarInCircle,
    'throbber': throbber,
    'copy': copy,
  },
  computed: {
    encodedIdForLink() {
      if (!this.userId) return '';
      return encodeURIComponent(btoa(this.userId.toString()).replaceAll('=',''));
    },
    firstTelegramFinBotLink() {
      return `http://t.me/Finstudio_bot?start=${this.encodedIdForLink}`;
    },
    secondTelegramFinBotLink() {
      return `http://t.me/Info_stats_bot?start=${this.encodedIdForLink}`;
    },
  },
  methods: {
    getTelegramLink() {
      this.$emit('get-telegram-link');
    },
    copyAllFinBotsLinks() {
      return this.copyLink(`${this.firstTelegramFinBotLink}\n${this.secondTelegramFinBotLink}`);
    },
    copyLink(link) {
      if (!link) return;
      clipboard(link, this.copyLinkSuccess);
    },
    copyLinkSuccess() {
      showToast(this.$toasted, 'Ссылка скопирована в буфер');
    },
  },
}
</script>