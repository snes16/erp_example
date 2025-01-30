<template>
  <div class="notification_users">
    <div class="theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" @click="addUsers">Добавить получателей</b-button>
    </div>
    <div class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="goBack">
        <i class="fa fa-angle-left"></i>
        <span>К сообщению</span>
      </div>
    </div>
    <div class="notification_users-body">
      <div class="notification_users-body-filters">
        <div class="notification_users-body-filters-selects">
          <group-select v-model="activeGroup"
                        :groups="groups"
                        @change="changeFilter"
          />
          <custom-select v-model="activeRole"
                         :options="rolesForSelect"
                         value-field="code"
                         default-text="Выберите роль"
          />
          <custom-select v-if="activeRole === 'ROLE_MODEL'"
                         v-model="activeShiftsStatus"
                         :options="modelShiftsSelectVariants"
                         default-text="Все модели"
                         @change="changeFilter"
          />
        </div>
        <b-input-group>
          <b-input-group-text slot="append"><search/></b-input-group-text>
          <b-form-input v-model="searchString" placeholder="Поиск" type="text"/>
        </b-input-group>
      </div>
      <div v-for="role in filteredRoles" class="notification_users-body-role">
        <div class="notification_users-body-role-title" @click="toggleRole(role.code)">
          <b>{{ role.title }}</b>
          <div class="d-flex align-items-center">
            <div class="abc-checkbox groups_select-item-container-checkbox">
              <div class="groups_select-item-container-checkbox-triple" :class="rolesStatuses[role.code] || ''" @click="toggleRoleUsers(role.code, $event)" />
            </div>
            <i class="fa fa-angle-down notification_users-body-role-title-arrow" :class="{'-active': openedRoles[role.code]}"/>
          </div>
        </div>
        <b-collapse :visible="openedRoles[role.code]">
          <div v-if="filteredUsers[role.code] && !filteredUsers[role.code].length" class="notification_users-body-role-list -empty">
            <span>Пользователей, удовлетворяющих условиям, не найдено</span>
          </div>
          <div v-else class="notification_users-body-role-list">
            <div v-for="user in filteredUsers[role.code]" class="notification_users-body-role-list-user">
              <avatar class="notification_users-body-role-list-user-avatar"
                      :url="user.avatar"
                      :telegram="user.telegram_connected"
                      :is-fin-admin="user.is_fin_admin"
              />
              <div class="notification_users-body-role-list-user-main">
                <p><b><span class="text-gray-text">{{ user.uid }}</span> {{ user.fullname }}</b></p>
                <p>
                  <span class="flag-icon" :class="`flag-icon-${user.main_group.flag || 'default'}`"></span>
                  <span v-if="user.main_group.city" class="ml-2 text-gray-text">{{ user.main_group.city }}</span>
                  <span class="ml-2">{{ user.main_group.city ? user.main_group.office || '' : user.main_group.country }}</span>
                </p>
              </div>
              <div class="abc-checkbox notification_users-body-role-list-user-checkbox">
                <input v-model="activeUsers" :value="user" type="checkbox" :id="`notification-user-checkbox-${ user.id }`"/>
                <label :for="`notification-user-checkbox-${ user.id }`"/>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import Avatar from "@/components/Common/Avatar/Avatar";
import search from "@/assets/vue-svg/search.svg";


export default {
  name: 'notification-add-users',
  props: {
    defaultUsers: Array,
  },
  components: {
    'custom-select': Select,
    'avatar': Avatar,
    'search': search,
    GroupSelect,
  },
  data() {
    return {
      activeUsers: [],
      searchString: '',
      openedRoles: {},
      rolesFetching: [],
      rolesToAddAllUsers: [],
      activeGroup: null,
      activeRole: null,
      activeShiftsStatus: null,
      modelShiftsSelectVariants: [
        {
          title: 'Все модели',
          value: 'all',
        },
        {
          title: 'Модели без смен',
          value: 'free',
        },
      ],
    }
  },
  computed: {
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    rolesForSelect() {
      return [
        {
          title: 'Выберите роль',
          code: null,
        },
        ...this.roles,
      ]
    },
    filteredRoles() {
      if (!this.activeRole) return this.roles;
      return this.roles.filter(role => role.code === this.activeRole);
    },
    groups() {
      return this.$store.state.dictionaries.groups;
    },
    users() {
      return this.$store.state.notifications.usersForNotifications;
    },
    filteredUsers() {
      if (!this.searchString) return this.users;
      let users = {},
          searchString = this.searchString.toLowerCase();

      for (let role in this.users) {
        users[role] = this.users[role].filter(user => user.fullname?.toLowerCase().includes(searchString) || user.uid?.toLowerCase().includes(searchString));
      }
      return users;
    },
    status() {
      return this.$store.state.notifications.status;
    },
    rolesStatuses() {
      let statuses = {};
      if (!this.roles.length || !this.activeUsers.length) return statuses;
      this.roles.forEach(role => {
        if (!this.filteredUsers[role.code]?.length) return;
        let someActive = false,
            someInactive = false;

        this.filteredUsers[role.code].some(user => {
          // if (this.activeUsers.some(activeUser => activeUser.id === user.id)) someActive = true;
          if (this.activeUsers.includes(user)) someActive = true;
          else someInactive = true;
          return someActive && someInactive;
        });

        statuses[role.code] = someActive ? (someInactive ? '-some' : '-all') : null;
      });

      return statuses;
    },
    filters() {
      let filters = {};
      if (this.activeGroup) filters[this.activeGroup.sub_type === 'operator' ? 'operator_groups' : 'groups'] = this.activeGroup.id;
      if ((this.activeRole === 'ROLE_MODEL') && (this.activeShiftsStatus === 'free')) filters['exists[workshift]'] = false;
      return filters;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if ((prevStatus === 'fetching-users') && (newStatus === '')) {
        this.rolesFetching = this.rolesFetching.filter(roleCode => !this.users[roleCode]);
        this.rolesToAddAllUsers = this.rolesToAddAllUsers.filter(roleCode => {
          if (!this.users[roleCode]) return false;
          this.toggleRoleUsers(roleCode);
          return true;
        });
      }
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroups');
    this.activeUsers = [...this.defaultUsers];
  },
  beforeDestroy() {
    this.$store.dispatch('notifications/clearUsersForNotifications');
  },
  methods: {
    addUsers() {
      this.$emit('add-users', this.activeUsers);
    },
    goBack() {
      this.$emit('go-back');
    },
    toggleRole(roleCode) {
      this.openedRoles = {...this.openedRoles, [roleCode]: !this.openedRoles[roleCode]};
      if (!this.users[roleCode] && !this.rolesFetching.includes(roleCode)) {
        this.$store.dispatch('notifications/fetchUsersForNotifications', {role: roleCode, is_active: true, pagination: false, ...this.filters});
        this.rolesFetching = [...this.rolesFetching, roleCode];
      }
    },
    toggleRoleUsers(roleCode, e) {
      if (this.openedRoles[roleCode]) e?.stopPropagation();
      if (!this.filteredUsers[roleCode]) return this.rolesToAddAllUsers = [...this.rolesToAddAllUsers, roleCode];
      if (this.rolesStatuses[roleCode] === '-all') this.activeUsers = this.activeUsers.filter(user => !this.filteredUsers[roleCode].includes(user));
      else this.activeUsers = [...this.activeUsers, ...this.filteredUsers[roleCode].filter(user => !this.activeUsers.includes(user))];
    },
    changeFilter() {
      this.$store.dispatch('notifications/clearUsersForNotifications');
      if (this.activeRole) return this.$store.dispatch('notifications/fetchUsersForNotifications', {role: this.activeRole, is_active: true, pagination: false, ...this.filters});
      for (let roleCode in this.openedRoles) {
        if (!this.openedRoles[roleCode]) continue;
        this.$store.dispatch('notifications/fetchUsersForNotifications', {role: roleCode, is_active: true, pagination: false, ...this.filters});
      }
    },
  }
}
</script>