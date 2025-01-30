<template>
  <div class="headerDropdown">
    <div class="notifications-header">
      <h2>Оповещения</h2>
      <b-button v-if="editPermission" variant="outline-primary" class="notifications-header-button" @click="onClickCreate">Создать сообщение</b-button>
    </div>
    <div class="notifications-body card">
      <div class="card-body">
        <div class="notifications-body-table">
          <div class="notifications-body-table-row -head">
            <div class="notifications-body-table-row-cell -user">ОТПРАВИТЕЛЬ</div>
            <div class="notifications-body-table-row-cell -date">ДАТА ОТПРАВЛЕНИЯ</div>
            <div class="notifications-body-table-row-cell -text">ТЕКСТ СООБЩЕНИЯ</div>
          </div>
          <div v-for="notification in formattedNotifications" class="notifications-body-table-row" @click="onClickNotification(notification)">
            <div class="notifications-body-table-row-cell -user"><span class="text-gray">{{ notification.author.uid }}</span> {{ notification.author.fullname }}</div>
            <div class="notifications-body-table-row-cell -date">{{ notification.formattedDate }}</div>
            <div class="notifications-body-table-row-cell -text">{{ notification.message }}</div>
          </div>
        </div>
        <b-pagination v-model="headers.currentPage"
                      align="left"
                      :total-rows="headers.totalItems"
                      :per-page="perPage"
                      @change="changePage"
        />
      </div>
    </div>
    <helper>
      <notification-creation v-if="droverType === 'creation'"/>
      <notification-details v-else-if="droverType === 'details'" :notification="activeNotification"/>
    </helper>
  </div>
</template>

<script>
import Helper from "@/components/Helper/Helper";
import NotificationCreation from "./NotificationCreation";
import NotificationDetails from "./NotificationDetails";
import {closeToast} from '@/tools/tools';
import moment from "moment";

export default {
  name: 'notifications',
  components: {
    Helper,
    NotificationCreation,
    NotificationDetails,
  },
  data() {
    return {
      activeNotificationId: null,
      droverType: null,
      perPage: 10,
      test: '',
    }
  },
  computed: {
    status() {
      return this.$store.state.notifications.status;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.notification.edit;
    },
    notifications() {
      return this.$store.state.notifications.notifications;
    },
    headers() {
      return this.$store.state.notifications.notificationsHeaders;
    },
    formattedNotifications() {
      return this.notifications.map(notification => ({
        ...notification,
        formattedDate: notification.created_at && moment.parseZone(notification.created_at).format('DD.MM.YYYY'),
      }));
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    activeNotification() {
      return this.notifications.find(notification => notification.id === this.activeNotificationId);
    },
  },
  watch: {
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.$store.dispatch('notifications/fetchNotifications', {page: this.headers.currentPage, per_page: this.perPage});
      }
    },
    status: function (newStatus, prevStatus) {
      if ((prevStatus === 'creating') && (newStatus === '')) {
        this.$toasted.success('Оповещение отправлено', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: closeToast,
          }
        });
        this.closeDrover();
      } else if ((prevStatus === 'repeating') && (newStatus === '')) {
        this.$toasted.success('Оповещение повторно отправлено', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: closeToast,
          }
        });
      }
    },
  },
  created() {
    this.$store.dispatch('notifications/fetchNotifications', {page: 1, per_page: this.perPage});
  },
  methods: {
    changePage(page) {
      this.$store.dispatch('notifications/fetchNotifications', {page, per_page: this.perPage});
    },
    onClickCreate() {
      this.droverType = 'creation';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    onClickNotification(notification) {
      this.droverType = 'details';
      this.activeNotificationId = notification.id;
      this.$store.dispatch('layout/toggleHelper', true);
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
  }
}
</script>