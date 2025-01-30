<template>
  <div class="notification_creation">
    <user-details v-if="droverType === 'user-details'"
                  :user-id="activeUserId"
                  breadcrumbs-title="Назад"
                  @close="closeDrover"
    />
    <div class="theme-helper-content-main-header">
      <b-button v-if="editPermission"
                variant="outline-primary"
                size="sm"
                :disabled="status === 'repeating'"
                @click="repeatNotification"
      >Отправить повторно</b-button>
    </div>
    <div class="notification_creation-body">
      <div class="notification_creation-body-message">
        <h4>Сообщение</h4>
        <p>{{ notification.message }}</p>
      </div>
      <div class="notification_creation-body-users">
        <div class="notification_creation-body-users-header">
          <h4 class="notification_creation-body-users-header-title">Список получателей</h4>
        </div>
        <div v-for="role in presentedRoles" class="notification_users-body-role">
          <div class="notification_users-body-role-title" @click="toggleRole(role.code)">
            <b>{{ role.title }}</b>
            <div class="d-flex align-items-center">
              <i class="fa fa-angle-down notification_users-body-role-title-arrow" :class="{'-active': openedRoles[role.code]}"/>
            </div>
          </div>
          <b-collapse :visible="openedRoles[role.code]">
            <div v-if="notification.users && notification.users[role.code]" class="notification_users-body-role-list">
              <div v-for="user in notification.users[role.code]" class="notification_users-body-role-list-user">
                <avatar class="notification_users-body-role-list-user-avatar"
                        :url="user.avatar"
                        :telegram="user.telegram_connected"
                        :is-fin-admin="user.is_fin_admin"
                />
                <div class="notification_users-body-role-list-user-main">
                  <p class="cursor-pointer" @click="clickUser(user.id, role)"><b><span class="text-gray-text">{{ user.uid }}</span> {{ user.fullname }}</b></p>
                  <p>
<!--                    <span class="flag-icon" :class="`flag-icon-${user.main_group.flag || 'default'}`"></span>
                    <span v-if="user.main_group.city" class="ml-2 text-gray-text">{{ user.main_group.city }}</span>
                    <span class="ml-2">{{ user.main_group.city ? user.main_group.office || '' : user.main_group.country }}</span>-->
                  </p>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserDetails from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import Avatar from "@/components/Common/Avatar/Avatar";

export default {
  name: 'notification-details',
  props: {
    notification: Object,
  },
  components: {
    UserDetails,
    'avatar': Avatar,
  },
  data() {
    return {
      openedRoles: {},
      rolesFetching: [],
      droverType: '',
      activeUserId: null,
    }
  },
  computed: {
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    status() {
      return this.$store.state.notifications.status;
    },
    presentedRoles() {
      return this.roles.filter(role => this.notification.users_roles.includes(role.code));
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.notification.edit;
    },
  },
  created() {
    this.$store.dispatch('dictionaries/getRoles');
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if ((prevStatus === 'fetching-users') && (newStatus === '')) {
        this.rolesFetching = this.rolesFetching.filter(roleCode => !this.notification.users?.[roleCode]?.length);
      }
    },
  },
  methods: {
    repeatNotification() {
      this.$store.dispatch('notifications/repeatNotification', this.notification.id);
    },
    toggleRole(roleCode) {
      this.openedRoles = {...this.openedRoles, [roleCode]: !this.openedRoles[roleCode]};
      if (!this.notification.users?.[roleCode]?.length && !this.rolesFetching.includes(roleCode)) {
        this.$store.dispatch('notifications/fetchNotificationUsers', {id: this.notification.id, query: {role: roleCode, pagination: false}});
        this.rolesFetching = [...this.rolesFetching, roleCode];
      }
    },
    clickUser(userId, role) {
      switch (role.code) {
        case 'ROLE_MODEL':
          if (!this.userPermissions.model.profile.view) return;
          break;
        case 'ROLE_OPERATOR':
          if (!this.userPermissions.operator.profile.view) return;
          break;
        default: if (!this.userPermissions.employee.profile.view) return;
      }
      this.activeUserId = userId;
      this.droverType = 'user-details';
    },
    closeDrover() {
      this.droverType = '';
    },
  }
}
</script>