<template>
  <section v-if="notifications.length" class="notifications navbar-notifications" @scroll="handleScroll">
    <div class="notifications-dropdown-header">
      <span class="text-gray">{{ notificationCountText }}</span>
      <round-checkbox v-show="commonCheckbox"
                      :checked="commonCheckbox"
                      id="-commonCheckbox"
                      @change="sendAllReadMessages"/>
      <b-tooltip v-if="commonCheckbox"
                 placement="left"
                 target="-commonCheckbox"
                 custom-class="notifications-dropdown-notification-tooltip">
        <span>Отметить все как прочитанное</span>
      </b-tooltip>
    </div>
    <div v-for="(notification, index) in notifications"
         :ref="`notification-${notification.id}`">
      <notification :notification="notification"
                    :index="index"
                    :class="{ '-last': index === notifications.length - 1}"
                    class="notifications-dropdown-notification"
                    @toggleCheckbox="toggleCheckbox"
      />
    </div>
    <div v-if="status === 'fetch-notifications'" class="notifications-dropdown-load">
      <throbber class="throbber notifications-dropdown-load-throbber"/>
    </div>
  </section>
  <section v-else class="notifications -empty navbar-notification">
    <span class="text-gray">Нет уведомлений</span>
  </section>
</template>

<script>
import moment from 'moment';
import RoundCheckbox from '@/components/Common/RoundCheckbox/RoundCheckbox.vue';
import calendarCircled from '@/assets/vue-svg/calendar-circled.svg';
import calendarCheck from '@/assets/vue-svg/calendar-check.svg';
import megaphone from '@/assets/vue-svg/megaphone.svg';
import manFinance from '@/assets/vue-svg/man-finance.svg';
import clock from "@/assets/vue-svg/clock.svg";
import calendar from "@/assets/calendar.svg";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import { pluralizeWords } from "@/tools/tools";
import throbber from "@/assets/vue-svg/throbber.svg";
import notification from "./Notification.vue"

moment.locale('ru');

export default {
  name: 'Notifications',
  components: {
    Avatar,
    notification,
    'round-checkbox': RoundCheckbox,
    'throbber': throbber,
    'calendar': calendar,
    'clock': clock,
    'man-finance': manFinance,
    'megaphone': megaphone,
    'calendar-check': calendarCheck,
    'calendar-circled': calendarCircled,
  },
  data() {
    return {
      moment: moment,
      taskStatuses: {
        active: 'Активная',
        check: 'Проверка',
        postponed: 'Отложена',
        completed: 'Выполнена',
        archive: 'Отказ'
      },
    };
  },
  computed: {
    notificationCountText() {
      const notificationWord = pluralizeWords(this.unreadNotificationsCount, ['новое уведомление', 'новых уведомления', 'новых уведомлений']);
      return this.unreadNotificationsCount ? `${this.unreadNotificationsCount} ${notificationWord}` : 'Нет новых уведомлений';
    },
    unreadNotificationsCount() {
      return this.$store.state.auth.unreadNotificationsCount;
    },
    status() {
      return this.$store.state.notifications.status;
    },
    userId() {
      return this.$store.state.auth.user.id;
    },
    notifications() {
      return this.$store.state.notifications.userNotifications;
    },
    notificationsHeaders() {
      return this.$store.state.notifications.userNotificationsHeaders;
    },
    cursor() {
      return this.notifications[this.notifications.length - 1]?.id;
    },
    pagesCount() {
      return this.$store.state.notifications.pagesCount;
    },
    commonCheckbox() {
      return this.notifications.some(notification => !notification.is_read);
    },
  },
  created() {
    this.$store.dispatch('notifications/fetchUserNotifications', {per_page: 10});
  },
  methods: {
    toggleCheckbox(notification) {
      this.$store.dispatch(notification.is_read ? 'notifications/sendUnreadMessages' : 'notifications/sendReadMessages', [notification.id]);
      notification.is_read = !notification.is_read;
    },
    sendAllReadMessages() {
      this.$store.dispatch('notifications/sendAllReadMessages');
    },
    handleScroll(e) {
      if (this.status === 'fetch-notifications' ||
          !this.notifications.length ||
          this.notificationsHeaders.currentPage >= this.pagesCount ||
          'hasNextPage' in this.notificationsHeaders && !this.notificationsHeaders.hasNextPage) return;
      const anchorElementId = this.notifications[this.notifications.length - 2]?.id;
      const anchorElement = this.$refs[`notification-${anchorElementId}`];
      if (anchorElement && anchorElement[0] && anchorElement[0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height) {
        this.$store.dispatch('notifications/fetchUserNotifications', { cursor: this.cursor, pagination_format: 'cursor' });
      }
    },
  },
};
</script>
