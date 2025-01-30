<template>
  <div class="roles">
    <sidebar :roles="roleList" :active-role="activeRole" @chooseRole="chooseRole" @createRole="createRole"/>
    <div class="roles-content">
      <div class="roles-content-mobile">
        <div class="roles-sidebar-header">
          <p class="roles-sidebar-header-title">Роли</p>
          <b-button v-if="userPermissions.admin.roles.edit" variant="add" class="roles-sidebar-header-button" @click="createRole"/>
        </div>
        <b-dropdown class="roles-content-mobile-select" variant="default">
          <template v-slot:button-content>
            <div class="roles-content-mobile-select-button">
              <span>{{ activeRole.title || 'Новая роль' }}</span>
              <b-badge v-if="activeRole.user_count && activeRole.user_count.active && (activeRole.user_count.active !== '0')"
                       variant="primary"
                       class="roles-content-mobile-select-button-badge"
              >{{ activeRole.user_count.active }}</b-badge>
            </div>
          </template>
          <b-dropdown-item-button v-for="role in roleList" class="roles-content-mobile-select-variant" @click="chooseRole(role)">
            <span>{{ role.title || 'Новая роль' }}</span>
            <b-badge v-if="role.user_count.active && (role.user_count.active !== '0')"
                     variant="custom"
                     class="roles-content-mobile-select-button-badge"
            >{{ role.user_count.active }}</b-badge>
          </b-dropdown-item-button>
        </b-dropdown>
      </div>
      <div class="roles-content-card card">
        <div class="roles-content-header">
          <div class="d-flex flex-column align-items-start">
            <div class="roles-content-header-title" :class="{'-disabled': activeRole.is_system || !userPermissions.admin.roles.edit}">
              <input v-model="activeRole.title"
                     v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 8}"
                     :id="`active_role_${activeRole.id}`"
                     class="roles-content-header-title-text"
                     :disabled="activeRole.is_system || !userPermissions.admin.roles.edit"
                     maxlength="50"
                     type="text"
                     placeholder="Новая роль"
                     @change="editRole"
              >
              <label class="roles-content-header-title-button" :for="`active_role_${activeRole.id}`"
                     v-if="!activeRole.is_system && userPermissions.admin.roles.edit"
              ><pen/></label>
            </div>
            <custom-select v-if="isTypeEditable" v-model="activeRole.type" :options="roleTypesList" @change="editRole" />
            <span v-else>{{ roleTypes[activeRole.type] }}</span>
          </div>
          <b-button v-if="!activeRole.is_system && userPermissions.admin.roles.edit" variant="outline-danger"
                    @click="deleteRole(activeRole)">Удалить роль
          </b-button>
        </div>
        <div class="roles-content-role_information">
          <b-navbar toggleable="md" class="profile-main-tabs">
            <div class="profile-main-tabs-toggle">
              <span class="text-primary">{{ tabs[activeTab] }}</span>
              <b-navbar-toggle target="tabs-collapse"></b-navbar-toggle>
            </div>
            <b-collapse id="tabs-collapse" is-nav>
              <a v-for="(tab, key) in tabs" class="nav-link"
                 :class="activeTab === key ? 'active' : ''"
                 href="#"
                 :key="key"
                 @click.prevent="setActiveTab(key)"
              >{{ tab }}</a>
            </b-collapse>
          </b-navbar>
          <div class="roles-content-role_information-tabs_content">
            <users-list
                v-if="activeTab === 'users'"
                :roleCode="activeRole.code"
                :activeRole="activeRole"
                @openMiniProfile="openMiniProfile"
            />
            <rights-list
                v-else-if="activeTab === 'rights'"
                :rights-list="rightsList"
                :active-role="activeRole"
            />
            <actions-list
                v-else-if="activeTab === 'actions'"
                v-model="actionPermissions"
                :actions="actions"
                :active-role="activeRole"
                @setActionPermissions="setActionPermissions"
            />
            <duties-list
                v-else-if="activeTab === 'duties'"
                :active-role="activeRole"
            />
            <settings
                v-else-if="activeTab === 'settings'"
                :role="activeRole"
                @openModal="showDrover('roles-modal')"
            />
          </div>
        </div>
      </div>
    </div>
    <b-modal id="delete_role"
             centered
             :title='`Вы точно хотите удалить роль "${deletedRoleName}"?`'
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="deleteRoleAccess">
      Это навсегда удалит роль, настройки прав требующих разрешения, настройки прав в разделах. Сотрудники роли
      “{{ deletedRoleName }}” перейдут в роль “Сотрудники”. Это действие необратимо.
    </b-modal>
    <helper>
      <mini-profile
          v-if="droverType === 'mini-profile'"
          :user-id="userProfile.id"
      />
      <available-roles-modal
        v-if="droverType === 'roles-modal'"
        :role="activeRole"
      />
    </helper>
  </div>
</template>
<script>
import Sidebar from './components/Sidebar/Sidebar';
import Users from './components/Users/Users';
import Rights from './components/Rights/Rights';
import Actions from './components/Actions/Actions';
import Settings from './components/Settings';
import Select from "@/components/Common/Select/Select";
import {mapState, mapActions} from 'vuex';
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import Helper from "@/components/Helper/Helper";
import AddGroups from "@/pages/Profile/components/AddGroups/AddGroups";
import Duties from "@/pages/Administration/Roles/components/Duties/Duties";
import AvailableRolesModal from './components/AvailableRolesModal';
import pen from "@/assets/vue-svg/pen.svg";

export default {
  name: 'Roles',
  components: {
    'sidebar': Sidebar,
    'users-list': Users,
    'rights-list': Rights,
    'actions-list': Actions,
    'Settings': Settings,
    'available-roles-modal': AvailableRolesModal,
    'custom-select': Select,
    'helper': Helper,
    'mini-profile': MiniProfile,
    'add-groups': AddGroups,
    'duties-list': Duties,
    'pen': pen,
  },
  data() {
    return {
      tabs: {
        users: 'Список сотрудников',
        rights: 'Права доступа',
        actions: 'ДТР',
        duties: 'ДО',
        settings: 'Настройки'
      },
      activeTab: 'users',
      roleList: [],
      rightsList: [],
      activeRole: {},
      activeRoleIndex: null,
      deletedRole: {},
      actionPermissions: [],
      subPermissions: [],
      subPermissionsArray: [],
      droverType: '',
      userProfile: {},
      roleTypes: {
        main: 'Основная',
        operator: 'Операторская',
        all: 'Системная',
      },
    }
  },
  computed: {
    ...mapState('roles', ['roles', 'role', 'deletedName', 'actions', 'rights', 'previousRole']),
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    user() {
      return this.$store.state.auth.user;
    },
    roleStatus() {
      return this.$store.state.roles.roleStatus;
    },
    deletedRoleName() {
      return this.deletedRole.title ? this.deletedRole.title : 'Новая роль'
    },
    roleSelected() {
      for (let key in this.activeRole) return true
      return false
    },
    users() {
      return this.$store.state.roles.users;
    },
    usersHeaders() {
      return this.$store.state.roles.usersHeaders;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    roleTypesList() {
      return [
        {
          value: 'main',
          title: this.roleTypes.main,
        },
        {
          value: 'operator',
          title: this.roleTypes.operator,
        },
      ]
    },
    activeUsersHeaders() {
      return this.$store.state.roles.activeUsersHeaders;
    },
    inactiveUsersHeaders() {
      return this.$store.state.roles.inactiveUsersHeaders;
    },
    isTypeEditable() {
      return this.userPermissions.admin.roles.edit &&
          !this.activeRole.is_system &&
          (this.user.role?.type === 'all') &&
          (this.activeRole?.user_count?.all === 0);
    },
  },
  watch: {
    roleStatus: function (newStatus, prevStatus) {
      switch (newStatus) {
        case 'roles-received':
          return this.activeRole = {...this.roles[0], index: 0};
        case 'role-received':
          return this.chooseRole(this.roles[this.roles.length - 1]);
        case 'role-removed':
          return this.roleDeletedNotification();
        case 'editing':
          return this.closeDrover();
        case '':
          if (prevStatus === 'deleting') return this.$store.dispatch('roles/updateUsersLastPage', {['role']: this.activeRole.code, per_page: 20, page: this.usersHeaders.currentPage});
      }
    },
    roles: function (newRoles, prevRoles) {
      this.roleList = newRoles.map(function (role, index) {
        role.index = index;
        return role
      });
      if (newRoles.length === prevRoles.length) this.activeRole = {
        ...this.roles[this.activeRoleIndex],
        index: this.activeRoleIndex
      };
      else if (!prevRoles.length) this.chooseRole(this.roleList[0]);
    },
    rights: function (newRights) {
      this.rightsList = newRights;
      if (this.roleList.length) this.chooseRole(this.roleList[0]);
    },
    activeRole: function (newRole) {
      if (newRole?.code) {
        this.$store.dispatch('roles/fetchUsers', {['role']: newRole.code, per_page: 20, is_active: 1});
        if (this.userPermissions.group.deactivate.view) this.$store.dispatch('roles/fetchUsers', {['role']: newRole.code, per_page: 20, is_active: 0});
      }
    },
    subPermissions: function (newPermissions) {
      let subPermissionsArray = []
      newPermissions.map(permissions => permissions.map(permission => permission.map(value => subPermissionsArray.push(value))))
      this.subPermissionsArray = subPermissionsArray
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
  },
  created() {
    this.getRights()
    this.getActions()
    this.getRoles()
    this.$store.dispatch('dictionaries/fetchMainPages');
    this.$store.dispatch('roles/fetchPermissions');
    this.$store.dispatch('dictionaries/getJobDuties');
    // this.getUser()
    this.roleList = this.roles.map(function (role, index) {
      role.index = index;
      return role
    });
    if (this.rights.length) this.rightsList = this.rights
    if (this.roleList.length) this.chooseRole(this.roles[0]);
  },
  methods: {
    ...mapActions('roles', ['getRoles', 'removeRole', 'getActions', 'getRights', 'editRights', 'editActions']),
    createRole() {
      this.$store.dispatch('roles/createRole', {type: this.user.role.type === 'operator' ? 'operator' : 'main'});
    },
    editRole() {
      this.$store.dispatch('roles/editRole', {title: this.activeRole.title, id: this.activeRole.id, type: this.activeRole.type});
    },
    setTabs(role) {
      if (this.actions) this.actionPermissions = role.permissions.filter(permissionId => this.actions.some(action => action.variants.some(variant => variant.id === permissionId)));
    },
    setActiveTab(tab) {
      if (this.roleSelected) this.activeTab = tab
    },
    chooseRole(role) {
      this.activeRole = role;
      this.activeRoleIndex = role.index === 0 ? 0 : role.index || this.roles.length - 1;
      this.subPermissions = this.rightsList.map(right => right.variants.map(variant => variant.variants.filter(variant => role.permissions.includes(variant.id)).map(variant => variant.id)))
      this.actionPermissions = role.permissions.filter(permissionId => this.actions.some(action => action.variants.some(variant => variant.id === permissionId)));
    },
    userRole() {
      switch (this.activeRole.code) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
        default:
          return 'employee';
      }
    },
    setActionPermissions() {
      if (!this.activeRole.is_system) this.editActions({
        id: this.activeRole.id,
        title: this.activeRole.title,
        actions: this.actionPermissions
      })
    },
    deleteRole(deletedRole) {
      this.deletedRole = deletedRole
      this.$bvModal.show('delete_role');
    },
    deleteRoleAccess() {
      this.chooseRole(this.roleList[this.activeRoleIndex ? (this.activeRoleIndex - 1) : 0]);
      this.removeRole(this.deletedRole)
    },
    roleDeletedNotification() {
      this.$toasted.success(`Роль "${this.deletedName ? this.deletedName : 'Новая роль'}" удалена`, {
        action: {
          text: 'X',
          class: 'toasts-close',
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          }
        },
      })
    },
    openMiniProfile(user) {
      if (this.userRole() && this.userPermissions[this.userRole()].profile.view) {
        this.userProfile = user
        this.showDrover('mini-profile');
      }
    },
    closeDrover() {
      this.droverType = '';
      this.$store.dispatch('layout/toggleHelper', false)
    },
    showDrover(type) {
      this.droverType = type;
      this.$store.dispatch('layout/toggleHelper', true)
    },
  }
}
</script>