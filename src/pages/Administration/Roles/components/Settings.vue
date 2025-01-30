<template>
  <div class="roles-content-tab-settings">
    <div class="roles-content-rights-right mb-2">
      <b>Главная страница для роли</b>
      <custom-select v-model="mainPage"
                     :options="filteredMainPages"
                     :disabled="!userPermissions.admin.roles.edit"
                     value-field="route"
                     class="roles-content-rights-right-select-roles -lg"
                     @change="editRole"
      />
    </div>
      <div class="roles-content-rights-right-title-settings" @click="toggleCollapse('rolesCollapse')">
        <i v-if="visibleRoles.length" class="fa angle mr-2 m-1" :class="rolesCollapse ? 'fa-angle-up' : 'fa-angle-down'"/>
        <b>Доступные роли</b>
        <span v-if="userPermissions.admin.roles.edit" class="roles-content-header-title-button ml-2" >
          <pen_circle @click.stop="openModal"/>
        </span>
      </div>
      <b-collapse v-if="visibleRoles.length" v-model="rolesCollapse" id="rights-collapse" class="roles-content-rights-right-subpermissions p-0 mb-3">
        <div v-for="currentRole  in filteredRoles" :key="currentRole.id" class="roles-content-rights-right-subpermissions-list" >
          <bell v-b-tooltip.hover.topright="getTooltipContent(currentRole)"
                class="roles-content-rights-right-subpermissions-list-bell"
                :class="{'-active': activeNotification.includes(currentRole.id)}"
                @click="birthNotice(currentRole.id)"
          />
          <span>{{ currentRole.title }}</span>
        </div>
      </b-collapse>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import pen from "@/assets/vue-svg/pen.svg";
import pen_circle from "@/assets/vue-svg/pen_circle.svg";
import bell from "@/assets/vue-svg/bell.svg";

export default {
  name: 'settings',
  props: {
    role: Object,
  },
  components: {
    pen,
    pen_circle,
    bell,
    'custom-select': Select
  },
  data() {
    return {
      mainPage: null,
      visibleRoles: [],
      rolesCollapse: true,
      activeNotification: [],
    }
  },
  computed: {
    roleStatus() {
      return this.$store.state.roles.roleStatus;
    },
    mainPages() {
      return this.$store.state.dictionaries.mainPages;
    },
    permissions() {
      return this.$store.state.roles.permissions;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    filteredMainPages() {
      if (!this.permissions.length) return [];
      return this.mainPages.filter(page => !page.permissions.length || page.permissions.some(permissionCode => this.role.permissions.includes(this.permissions.find(permission => permission.code === permissionCode)?.id)));
    },
    roles() {
      return this.$store.state.roles.roles;
    },
    filteredRoles() {
      return this.roles.filter(
          role => (this.role.type === 'all') ? this.visibleRoles.includes(role.id) : (role.type === this.role.type && this.visibleRoles.includes(role.id))
      );
    },
  },
  watch: {
    role: function (newRole, prevRole) {
      if (newRole.main_page !== prevRole.main_page) this.mainPage = newRole.main_page;
      if (newRole.visible_roles !== prevRole.visible_roles) this.visibleRoles = newRole.visible_roles.map(role => role.id);
      if (newRole.roles_for_notifications !== prevRole.roles_for_notifications) this.activeNotification = newRole.roles_for_notifications.map(role => role.id);
    },
    roleStatus: function (newStatus, prevStatus) {
      switch (newStatus) {
        case 'error':
          if(prevStatus === 'editing')
            this.activeNotification = this.role.roles_for_notifications.map(role => role.id);
      }
    },
  },
  created() {
    this.mainPage = this.role.main_page;
    if (this.role.visible_roles) this.visibleRoles = this.role.visible_roles.map(role => role.id);
    if (this.role.roles_for_notifications) this.activeNotification = this.role.roles_for_notifications.map(role => role.id);
  },
  methods: {
    openModal() {
      this.$emit('openModal');
    },
    editRole() {
      this.$store.dispatch('roles/editRole', {
        id: this.role.id,
        main_page: this.mainPage,
        visible_roles: this.visibleRoles
      });
    },
    toggleCollapse() {
        this.rolesCollapse=!this.rolesCollapse;
    },
    getTooltipContent(currentRole) {
      return this.activeNotification.includes(currentRole.id) ? "Уведомления о дне рождения подключены" : "Подключить уведомления о дне рождения";
    },
    birthNotice(roleId) {
      this.activeNotification = this.activeNotification.includes(roleId)
          ? this.activeNotification.filter(id => id !== roleId)
          : [...this.activeNotification, roleId];
      this.$store.dispatch('roles/editRole', {
        id: this.role.id,
        roles_for_notifications: this.activeNotification,
      });
    }
  }
}
</script>