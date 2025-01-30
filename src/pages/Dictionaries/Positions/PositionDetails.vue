<template>
  <div class="users_add theme-helper-content-main">
    <div class="users_add-header">
      <b-button variant="outline-primary"
                size="sm"
                class="mr-2"
                id="position-details-save"
                @click="onClickClose"
      >Сохранить</b-button>
      <b-button variant="outline-danger"
                size="sm"
                id="position-details-delete"
                @click="onClickDelete"
      >Удалить</b-button>
    </div>
    <div class="users_add-body">
      <div class="position_creation-body-title">
        <input v-model="title"
               class="input-plain"
               placeholder="Введите название должности"
               required
               @change="editPosition"
        />
      </div>
      <template v-if="formattedUsers.length || (usersStatus === 'fetching') || areFiltersApplied">
        <div class="position_creation-body-subtitle">
          <div class="position_creation-body-subtitle-container">
            <h4 class="mb-0 mr-2">Пользователи с должностью</h4>
            <div class="btn-add" @click="addUsers"/>
          </div>
        </div>
        <div class="users_add-body-filters">
          <custom-select v-model="region"
                         :options="groupsForSelect"
                         value-field="id"
                         default-text="Выберите регион"
                         @change="changeFilters"
          />
          <custom-select v-model="role"
                         :options="rolesForSelect"
                         value-field="code"
                         default-text="Выберите роль"
                         @change="changeFilters"
          />
        </div>
        <div class="users_add-body-search">
          <b-input-group>
            <b-input-group-text slot="append">
              <i class="fa fa-search"/>
            </b-input-group-text>
            <b-form-input v-model="searchString"
                          id="users-add-search"
                          placeholder="Поиск"
                          @input="onInputSearchString"
            />
          </b-input-group>
        </div>
      </template>
      <div v-if="formattedUsers.length" class="position_creation-body-roles -details" @scroll="handleScroll">
        <div v-for="role in formattedUsers" class="users_add-body-roles-role">
          <div class="users_add-body-roles-role-main" @click="toggleCollapse(role.code)">
            <b>{{ role.title }}</b>
            <div class="users_add-body-roles-role-main-actions">
              <div class="btn-remove users_add-body-roles-role-main-actions-remove" @click.stop="removeRole(role.id)"/>
              <i class="fa fa-angle-down angle" :class="{'-active': !collapseStatuses[role.code]}"/>
            </div>
          </div>
          <b-collapse :visible="!collapseStatuses[role.code]" class="users_add-body-roles-role-users">
            <div v-for="user in role.users" class="users_add-body-roles-role-users-user" :ref="`user-add-${user.id}`" :key="user.id">
              <div class="users_add-body-roles-role-users-user-avatar avatar"
                   :style="user.avatar ? `background-image: url(${user.smallAvatar}); background-size: cover;` : ''"
              ></div>
              <div class="users_add-body-roles-role-users-user-info">
                <b>
                  <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ user.uid }}</span>
                    <span>{{ user.fullname }}</span>
                  </template>
                </b>
                <div v-if="user.main_group" class="d-flex align-items-center">
                  <i class="flag-icon mr-1"
                     :class="`flag-icon-${user.main_group.flag || 'default'}`"
                     :title="user.main_group.country"
                  />
                  <span class="text-gray mr-1">{{ user.main_group.city || user.main_group.country }}</span>
                  <span>{{ user.main_group.office }}</span>
                </div>
              </div>
              <div class="abc-checkbox -fixed users_add-body-roles-role-users-user-checkbox">
                <div class="btn-remove" @click="removeUser(user.id)"></div>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
      <div v-else-if="usersStatus === 'fetching'" class="position_creation-body-roles -details -empty">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else-if="areFiltersApplied" class="position_creation-body-roles -details -empty">
        <h3 class="mb-2">По вашему запросу ничего не найдено</h3>
        <p>Попробуйте изменить или сократить запрос</p>
      </div>
      <div v-else class="position_creation-body-roles -empty">
        <user class="mb-4" />
        <h3 class="mb-4">Нет пользователей<br/>с этой должностью</h3>
        <b-button variant="outline-primary" @click="addUsers">Добавить пользователей</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import GroupUser from "@/pages/Organization/Groups/components/GroupUser";
import Select from "@/components/Common/Select/Select";
import throbber from "@/assets/vue-svg/throbber.svg";
import user from "@/assets/vue-svg/user.svg";
import {getSmallImage, getIdsFromGroup, showToast} from "@/tools/tools";

export default {
  name: 'position-details',
  props: {
    position: Object,
  },
  components: {
    GroupUser,
    'custom-select': Select,
    'throbber': throbber,
    'user': user,
  },
  data() {
    return {
      title: this.position.title,
      searchString: '',
      role: null,
      region: null,
      collapseStatuses: {},
    }
  },
  computed: {
    usersStatus() {
      return this.$store.state.users.status;
    },
    users() {
      return this.$store.state.users.currentUsers;
    },
    usersHeaders() {
      return this.$store.state.users.currentUsersHeaders;
    },
    formattedUsers() {
      const roles = [];
      let role = {};
      this.users.forEach(user => {
        const formattedUser = {
          ...user,
          smallAvatar: user.avatar ? getSmallImage(user.avatar) : null,
        }
        if (user.role.code !== role.code) {
          role = {
            ...user.role,
            users: [formattedUser],
          };
          roles.push(role);
        } else role.users.push(formattedUser);
      });
      return roles;
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    groupsForSelect() {
      return [{title: 'Выберите регион', id: null}, ...this.groups];
    },
    groupsForRegionFilter() {
      if (!this.region) return undefined;
      return getIdsFromGroup(this.groups.find(group => group.id === this.region));
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    rolesForSelect() {
      return [{title: 'Выберите роль', code: null}, ...this.roles];
    },
    areFiltersApplied() {
      return !!this.searchString || !!this.groupsForRegionFilter || !!this.role;
    },
    status() {
      return this.$store.state.positions.status;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if ((newStatus === '') && (prevStatus === 'deleting-users')) this.getUsers();
    }
  },
  created() {
    this.getUsers();
  },
  methods: {
    getUsers(page = 1) {
      let query = {
        is_active: true,
        page,
        search: this.searchString,
        role: this.role,
        main_group: this.groupsForRegionFilter,
        'order[role]': 'asc',
        position: this.position.id,
      };
      this.$store.dispatch('users/fetchCurrentUsers', query);
    },
    handleScroll(e) {
      if ((this.usersStatus === 'fetching') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || !this.users.length) return;
      const anchorElementId = this.users[this.users.length - 2].id;
      if (this.$refs[`user-add-${anchorElementId}`]?.[0] && (this.$refs[`user-add-${anchorElementId}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height))
        this.getUsers(this.usersHeaders.currentPage + 1);
    },
    onInputSearchString() {
      const searchString = this.searchString;
      setTimeout(() => {
        if (searchString === this.searchString) this.changeFilters();
      }, 1000);
    },
    toggleCollapse(code) {
      this.collapseStatuses = {
        ...this.collapseStatuses,
        [code]: !this.collapseStatuses[code],
      };
    },
    changeFilters() {
      this.getUsers();
    },
    onClickClose() {
      this.$emit('close');
    },
    onClickDelete() {
      this.$emit('delete');
    },
    editPosition() {
      this.$store.dispatch('positions/editPosition', {
        ...this.position,
        title: this.title,
      });
    },
    removeUser(userId) {
      this.$store.dispatch('positions/deleteUserFromPosition', {
        userId,
        positionId: this.position.id,
      });
    },
    removeRole(roleId) {
      this.$store.dispatch('positions/deleteAllUsersOfRoleFromPosition', {
        roleId,
        positionId: this.position.id,
        query: {
          search: this.searchString,
          main_group: this.groupsForRegionFilter,
        }
      });
    },
    addUsers() {
      this.$emit('add-users');
    },
  }
}
</script>