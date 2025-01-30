<template>
  <div>
    <avatar v-if="isAvatarShown" size="-md" :url="notification.data.avatar" />
    <request-avatar class="request-avatar" height="40" width="40" v-else-if="isAvatarRequest" />
    <component v-else-if="notificationIcon" :is="notificationIcon" />
    <div class="notifications-dropdown-notification-block">
      <div class="notifications-dropdown-notification-info"
           :class="{'-status': notification.data.status}"
      >
        <span class="text-gray">{{ createdAt }}</span>
        <b>{{ notification.data.title }}</b>
        <span class="overflow-auto">{{ notification.data.message }}</span>
        <div v-if="(notification.type === 'task') && deadline" class="notifications-dropdown-notification-info-deadline">
          <span class="text-gray">Срок выполнения:&nbsp;</span>
          <span>{{ deadline }}</span>
        </div>
        <div v-else-if="notification.type === 'user_duty_period'" class="d-flex flex-column">
          <div>
            <span class="text-gray">Стаж:&nbsp;</span>
            <span>{{ formattedExperience }}</span>
          </div>
          <div>
            <span class="text-gray">Отработанных смен:&nbsp;</span>
            <span>{{ notification.data.workshiftsCount }}</span>
          </div>
          <div class="model_schedule-body-content-option-city">
            <span class="flag-icon mr-1"
                  :class="`flag-icon-${notification.data.mainGroup.flag || 'default'}`"
                  :title="notification.data.mainGroup.flag"
            />
            <span v-if="notification.data.mainGroup.city" class="text-gray mr-1">{{ notification.data.mainGroup.city }}</span>
            <span v-if="notification.data.mainGroup.office">{{ notification.data.mainGroup.office }}</span>
          </div>
          <div>
            <span class="text-gray">Уволил&nbsp;</span>
            <span>{{ notification.data.resignedBy }}</span>
          </div>
        </div>
      </div>
      <div v-if="notification.data.status"
           class="notifications-dropdown-notification-status"
           :class="`-${notification.data.status}`">
        {{ taskStatuses[notification.data.status] }}
      </div>
    </div>
    <round-checkbox :checked="!notification.is_read"
                    :id="`-round_checkbox-${index}-${notification.id}`"
                    @change="toggleCheckbox(notification)" />
    <b-tooltip placement="left"
               :target="`-round_checkbox-${index}-${notification.id}`"
               custom-class="notifications-dropdown-notification-tooltip"
    >
      <template v-if="!notification.is_read">
        <span>Отметить как прочитанное</span>
      </template>
      <template v-else-if="notification.is_read">
        <span>Отметить как не прочитанное</span>
      </template>
    </b-tooltip>
  </div>
</template>

<script>
import moment from 'moment';
import requestAvatar from '@/assets/vue-svg/bubble-with-question-mark.svg';
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import RoundCheckbox from '@/components/Common/RoundCheckbox/RoundCheckbox.vue';
import calendarCircled from '@/assets/vue-svg/calendar-circled.svg';
import calendarCheck from '@/assets/vue-svg/calendar-check.svg';
import megaphone from '@/assets/vue-svg/megaphone.svg';
import {pluralize, pluralizeWords} from "@/tools/tools";

moment.locale('ru');

export default {
  name: 'NotificationItem',
  components: {
    Avatar,
    'round-checkbox': RoundCheckbox,
    'calendar-circled': calendarCircled,
    'calendar-check': calendarCheck,
    'megaphone': megaphone,
    'request-avatar': requestAvatar
  },
  props: {
    notification: Object,
    index: Number,
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
  computed : {
    formattedExperience() {
      if (this.notification.data.experience <= 30) return pluralize(this.notification.data.experience, ['день', 'дня', 'дней']);
      const diffMonths = moment().diff(moment().subtract(this.notification.data.experience, 'd'), 'months'),
          months = diffMonths % 12,
          years = (diffMonths - months) / 12;

      return `${years ? pluralize(years, ['год', 'года', 'лет']) : ''} ${months ? pluralize(months, ['месяц', 'месяца', 'месяцев']) : ''}`;
    },
    isAvatarShown() {
      return ['user_duty_period', 'blocking_user', 'task_comment'].includes(this.notification.type);
    },
    isAvatarRequest() {
      return ['support_reply'].includes(this.notification.type);
    },
    notificationIcon() {
      switch (this.notification.type) {
        case 'birthday': return 'calendar-circled';
        case 'task': return 'calendar-check';
        case 'notification': return 'megaphone';
      }
      return null;
    },
    deadline() {
      if (!this.notification?.data?.deadline) return null;
      return moment(this.notification.data.deadline).format('DD.MM.YYYY');
    },
    createdAt() {
      if (!this.notification?.created_at) return null;
      return moment(this.notification.created_at).format('DD.MM.YYYY в HH:mm');
    },
  },
  methods: {
    toggleCheckbox(notification) {
      this.$emit('toggleCheckbox', notification);
    },
  },
};
</script>
