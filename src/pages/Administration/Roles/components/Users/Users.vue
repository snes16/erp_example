<template>
  <div class="roles-content-tabs-users_list">
    <div v-if="!activeUsersHeaders.totalItems && !inactiveUsersHeaders.totalItems" class="roles-content-tabs-users_list-empty">
      <div class="roles-content-tabs-users_list-empty-image icon-group"></div>
      <p class="roles-content-tabs-users_list-empty-text">Нет сотрудников с этой ролью</p>
    </div>
    <div v-else class="roles-content-tabs-users_list-users">
      <div class="roles-content-tabs-users_list-users-header">
        <div class="roles-content-tabs-users_list-users-header-main">
          <h4 class="roles-content-tabs-users_list-users-header-main-title">Сотрудники</h4>
          <div v-if="userPermissions.group.deactivate.view" class="roles-content-tabs-users_list-users-header-main-active">
            <div class="btn btn-default btn-sm btn-tab"
                 :class="{'active': isActive}"
                 id="status-filter-active-user"
                 @click="setIsActive(true)"
            >Активные <span v-if="activeUsersHeaders.totalItems">{{ activeUsersHeaders.totalItems }}</span></div>
            <div class="btn btn-default btn-sm btn-tab"
                 :class="{'active': !isActive}"
                 id="status-filter-inactive-user"
                 @click="setIsActive(false)"
            >Неактивные <span v-if="inactiveUsersHeaders.totalItems">{{ inactiveUsersHeaders.totalItems }}</span></div>
          </div>
        </div>
        <b-form-group class="search-field">
          <b-input-group>
            <template v-slot:prepend>
              <b-input-group-text><search_large/></b-input-group-text>
            </template>
            <b-form-input v-model="searchString" placeholder="Поиск"/>
          </b-input-group>
        </b-form-group>
      </div>
      <div v-if="users.length" class="roles-content-tabs-users_list-users-body" @scroll="onContentScroll">
        <div v-for="(user, index) in filteredUsers" class="roles-content-tabs-users_list-users-body-user" :key="index" :ref="`role-user-${index}`">
          <div class="roles-content-tabs-users_list-users-body-user-data">
            <avatar class="roles-content-tabs-users_list-users-body-user-data-avatar mr-2"
                    size="-lg"
                    :url="user.avatar"
                    is-large
                    :telegram="user.telegram_connected"
                    :is-fin-admin="user.is_fin_admin"
                    @click="openMiniProfile(user)"
            />
            <div class="roles-content-tabs-users_list-users-body-user-data-personal">
              <p v-if="user.position" class="mb-0">{{ user.position.title }}</p>
              <div class="roles-content-tabs-users_list-users-body-user-data-personal-full_name cursor-pointer"
                 @click="openMiniProfile(user)"
              >
                <span v-if="user.uid" class="text-gray-text" :class="{'mr-2': user.fullname}">{{ user.uid }}</span>
                <span>{{ user.fullname }}</span>
                <user-resign-icon v-if="user.resign_date" :user="user" :offset="40" :id="`resign_info-${user.id}`" />
              </div>
              <div v-if="user.model_nickname" class="d-flex align-items-center">
                <at class="mr-1"/>
                <b>{{ user.model_nickname }}</b>
              </div>
              <p class="roles-content-tabs-users_list-users-body-user-data-personal-address">
                <i v-if="user.main_group.build_group.country || !user.main_group.build_group.title"
                      class="flag-icon mr-1"
                      :class="`flag-icon-${user.main_group.build_group.flag || 'default'}`"
                      :title="user.main_group.build_group.country"
                />
                <span v-else>{{ user.main_group.build_group.title }}</span>
                <span class="text-gray mr-1">{{ user.main_group.build_group.city }}</span>
                <span>{{ user.main_group.build_group.office }}</span>
              </p>
            </div>
          </div>
          <div v-if="showDeleteButtons"
               class="roles-content-tabs-users_list-users-body-user-delete glyphicon-trash_alt"
               @click="deleteUser(user)"
          />
        </div>
      </div>
      <div v-else class="roles-content-tabs-users_list-empty">
        <div class="roles-content-tabs-users_list-empty-image icon-group"></div>
        <p class="roles-content-tabs-users_list-empty-text">Не найдено сотрудников с этой ролью</p>
      </div>
    </div>
  </div>
</template>

<script>
import UserResignIcon from "@/components/Common/UserResignIcon";
import Avatar from "@/components/Common/Avatar/Avatar";
import at from "@/assets/vue-svg/at.svg";
import search_large from "@/assets/vue-svg/search-large.svg"
import { getSmallImage } from "@/tools/tools";

export default {
  name: 'Users',
  props: {
    activeRole: Object,
    roleCode: String
  },
  components: {
    UserResignIcon,
    Avatar,
    'at': at,
    'search_large': search_large
  },
  data() {
    return {
      searchString: '',
      perPage: 20,
      isActive: true,
    }
  },
  computed: {
    activeUsers() {
      return this.$store.state.roles.activeUsers;
    },
    inactiveUsers() {
      return this.$store.state.roles.inactiveUsers;
    },
    users() {
      return this.isActive ? this.activeUsers : this.inactiveUsers;
    },
    filteredUsers() {
      if (!this.searchString) return this.users;
      let searchString = this.searchString.toLowerCase();
      return this.users.filter(user =>
          user.surname?.toLowerCase().includes(searchString) || user.name?.toLowerCase().includes(searchString) || user.patronymic?.toLowerCase().includes(searchString) || user.uid?.toLowerCase().includes(searchString)
      );
    },
    activeUsersHeaders() {
      return this.$store.state.roles.activeUsersHeaders;
    },
    inactiveUsersHeaders() {
      return this.$store.state.roles.inactiveUsersHeaders;
    },
    usersHeaders() {
      return this.isActive ? this.activeUsersHeaders : this.inactiveUsersHeaders;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    roleStatus() {
      return this.$store.state.roles.roleStatus;
    },
    showDeleteButtons() {
      return (this.roleCode !== 'ROLE_EMPLOYEE') &&
          (this.roleCode !== 'ROLE_MODEL') &&
          (this.roleCode !== 'ROLE_OPERATOR') &&
          this.userPermissions.admin.roles.edit;
    },
  },
  watch: {
    roleStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'deletingUser') && (newStatus === '')) return this.$store.dispatch('roles/updateUsersLastPage', {['role']: this.activeRole.code, per_page: 20, page: this.usersHeaders.currentPage, is_active: this.isActive ? 1 : 0});
    },
  },
  methods: {
    deleteUser(user) {
      this.$store.dispatch('roles/deleteUsers',
          {
            userId: user.id,
            isActive: this.isActive,
          });
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    openMiniProfile(user) {
      this.$emit('openMiniProfile', {id: user.id, fullname: user.fullname})
    },
    onContentScroll(e) {
      let middleElement = this.filteredUsers.length - (this.filteredUsers.length % this.perPage) - Math.floor(this.perPage / 2);
      if (this.$refs[`role-user-${middleElement}`] && (this.$refs[`role-user-${middleElement}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height)) this.getUsersNextPage();
    },
    getUsersNextPage() {
      if ((this.roleStatus === 'request') || (this.roleStatus === 'deleting') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages)) return;
      this.$store.dispatch('roles/fetchUsersNextPage', {['role']: this.activeRole.code, per_page: 20, page: this.usersHeaders.currentPage + 1, is_active: this.isActive ? 1 : 0});
    },
    setIsActive(isActive) {
      this.isActive = isActive;
    },
  }
}
</script>