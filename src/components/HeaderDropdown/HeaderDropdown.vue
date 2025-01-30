<template>
  <section class="header_dropdown navbar-notifications">
    <header class="cardHeader header-notify">
      <a v-if="!isModelOrOperator" class="dropdown-item d-flex align-items-center" @click="goProfile">Профиль</a>
      <a v-else class="dropdown-item d-flex align-items-center hidden-above_md" @click="goPersonalData">Личный кабинет</a>
      <a class="dropdown-item" variant="default" @click="logoutUser">Выйти из профиля</a>
    </header>
  </section>
</template>

<script>
import Vue from 'vue';
import router from '@/Routes';
import NotifictionsList from '@/components/Notifications/NotificationsDemo/NotificationsList';
import NewNotifictionsList from '@/components/Notifications/NotificationsDemo/NewNotificationsList';
import Messages from '@/components/Notifications/NotificationsDemo/Messages';
import { mapState, mapActions } from 'vuex';
export default {
  name: 'HeaderDropdown',
  components: {
    NotifictionsList, NewNotifictionsList, Messages
  },
  data() {
    return {
      notificationsTabSelected: 1,
      newNotifications: null,
      isLoad: false
    };
  },
  computed: {
    isModelOrOperator() {
      return (this.$store.state.auth.user.role.code === 'ROLE_MODEL') || (this.$store.state.auth.user.role.code === 'ROLE_OPERATOR');
    },
  },
  methods: {
    ...mapActions('auth', ['logoutUser']),
    changeNotificationsTab(tab) {
      Vue.set(this, 'notificationsTabSelected', tab);
      Vue.set(this, 'newNotifications', null);
    },
    loadNotifications() {
      Vue.set(this, 'isLoad', true);

      setTimeout(() => {
        Vue.set(this, 'newNotifications', 'new notifications component');
        Vue.set(this, 'isLoad', false);
      }, 1500);
    },
    goProfile() {
      this.$emit('notification-selected');
      router.push('/app/profile');
    },
    goPersonalData() {
      this.$emit('notification-selected');
      this.$root.$emit('set-profile-tab', 'personal_data');
    },
  },
};
</script>
