<template>
  <div class="notification_creation">
    <notification-add-users v-if="droverType === 'add-users'"
                            :default-users="activeUsers"
                            @go-back="closeNestedDrover"
                            @add-users="addUsers"
    />
    <user-details v-else-if="droverType === 'user-details'"
                  :user-id="activeUserId"
                  breadcrumbs-title="Назад"
                  @close="closeNestedDrover"
    />
    <template v-else>
      <div class="theme-helper-content-main-header">
        <b-button variant="outline-primary" size="sm" :disabled="status === 'creating'" @click="createNotification">Отправить</b-button>
      </div>
      <div class="notification_creation-body">
        <div class="notification_creation-body-message">
          <h4>Сообщение</h4>
<!--          <textarea-autosize v-model="message"
                             placeholder="Введите текст"
                             class="notification_creation-body-message-textarea input-plain -editable_fields"
                             :class="{'-error': formErrors.message}"
                             @input="inputField('message')"
          />-->
          <emoji-textarea v-model="message"
                          placeholder="Введите текст"
                          :textarea-class="`notification_creation-body-message-textarea input-plain -editable_fields${formErrors.message ? ' -error' : ''}`"
                          @input="inputField('message')"
          />
        </div>
        <div class="notification_creation-body-users">
          <div class="notification_creation-body-users-header">
            <h4 class="notification_creation-body-users-header-title">Список получателей</h4>
            <b-button variant="add" class="ml-3" @click="openUsersAdding"></b-button>
          </div>
          <div v-for="role in roles" v-if="formattedUsers[role.code]" class="notification_users-body-role">
            <div class="notification_users-body-role-title" @click="toggleRole(role.code)">
              <b>{{ role.title }}</b>
              <div class="d-flex align-items-center">
                <b-button variant="remove" class="mr-2" @click="removeRole(role.code)"/>
                <i class="fa fa-angle-down notification_users-body-role-title-arrow" :class="{'-active': openedRoles[role.code]}"/>
              </div>
            </div>
            <b-collapse :visible="openedRoles[role.code]">
              <div class="notification_users-body-role-list">
                <div v-for="user in formattedUsers[role.code]" class="notification_users-body-role-list-user">
                  <avatar class="notification_users-body-role-list-user-avatar"
                          :url="user.avatar"
                          :telegram="user.telegram_connected"
                          :is-fin-admin="user.is_fin_admin"
                  />
                  <div class="notification_users-body-role-list-user-main">
                    <p class="cursor-pointer" @click="clickUser(user.id, role)"><b><span class="text-gray-text">{{ user.uid }}</span> {{ user.fullname }}</b></p>
                    <p>
                      <span class="flag-icon" :class="`flag-icon-${user.main_group.flag || 'default'}`"></span>
                      <span v-if="user.main_group.city" class="ml-2 text-gray-text">{{ user.main_group.city }}</span>
                      <span class="ml-2">{{ user.main_group.city ? user.main_group.office || '' : user.main_group.country }}</span>
                    </p>
                  </div>
                  <div class="abc-checkbox notification_users-body-role-list-user-checkbox">
                    <b-button variant="remove" class="mr-2" @click="removeUser(user.id)"/>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import NotificationAddUsers from "./NotificationAddUsers";
import EmojiTextarea from "@/components/Common/EmojiTextarea/EmojiTextarea";
import UserDetails from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import Avatar from "@/components/Common/Avatar/Avatar";
import {closeToast} from '@/tools/tools';

export default {
  name: 'notification-creation',
  components: {
    'avatar': Avatar,
    NotificationAddUsers,
    EmojiTextarea,
    UserDetails,
  },
  data() {
    return {
      message: '',
      droverType: null,
      activeUsers: [],
      openedRoles: {},
      formErrors: {},
      activeUserId: null,
    }
  },
  computed: {
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    formattedUsers() {
      let roles = {};
      this.activeUsers.forEach(user => {
        if (!user.role?.code) return;
        if (roles[user.role.code]) roles[user.role.code].push(user);
        else roles[user.role.code] = [user];
      });
      return roles;
    },
    status() {
      return this.$store.state.notifications.status;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  created() {
    this.$store.dispatch('dictionaries/getRoles');
  },
  methods: {
    createNotification() {
      if (!this.message.length) return this.formErrors = {...this.formErrors, message: true};
      if (!this.activeUsers.length) return this.$toasted.error('Выберите получателей', {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000,
        action: {
          text: '',
          class: 'btn-close',
          onClick: closeToast,
        }
      });
      this.$store.dispatch('notifications/createNotification', {message: this.message, users: this.activeUsers.map(user => user.id)});
    },
    openUsersAdding() {
      this.droverType = 'add-users';
    },
    closeNestedDrover() {
      this.droverType = null;
    },
    addUsers(users) {
      this.activeUsers = [...users];
      this.closeNestedDrover();
    },
    toggleRole(roleCode) {
      this.openedRoles = {...this.openedRoles, [roleCode]: !this.openedRoles[roleCode]};
    },
    removeRole(roleCode) {
      this.activeUsers = this.activeUsers.filter(user => user.role.code !== roleCode);
    },
    removeUser(userId) {
      this.activeUsers = this.activeUsers.filter(user => user.id !== userId);
    },
    inputField(field) {
      this.formErrors = {...this.formErrors, [field]: false};
    },
    clickUser(userId, roleCode) {
      switch (roleCode) {
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
  }
}
</script>