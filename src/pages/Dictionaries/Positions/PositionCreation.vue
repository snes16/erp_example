<template>
  <form class="users_add theme-helper-content-main" @submit.prevent="createPosition">
    <div class="theme-helper-content-main-header">
      <b-button variant="outline-primary"
                size="sm"
                type="submit"
                class="theme-helper-content-main-header-button"
                id="users-add-submit"
      >{{ position ? 'Добавить пользователей' : 'Добавить должность' }}</b-button>
    </div>
    <div v-if="position" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>К должности</span>
      </div>
    </div>
    <div class="users_add-body">
      <div v-if="!position" class="position_creation-body-title">
        <input v-model="title"
               class="input-plain"
               placeholder="Введите название должности"
               required
        />
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
            <search/>
          </b-input-group-text>
          <b-form-input v-model="searchString"
                        id="users-add-search"
                        placeholder="Поиск"
                        @input="onInputSearchString"
          />
        </b-input-group>
      </div>
      <div v-if="formattedUsers.length" class="position_creation-body-roles" @scroll="handleScroll">
        <div v-for="(role, key) in formattedUsers" class="users_add-body-roles-role">
          <div class="users_add-body-roles-role-main" @click="toggleCollapse(role.code)">
            <b>{{ role.title }}</b>
            <div class="users_add-body-roles-role-main-actions">
              <div class="groups_select-item-container-checkbox-triple"
                   :class="rolesStatuses[key]"
                   @click.stop="changeRole(role, key)"
              />
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
<!--                <input :id="'add-' + user.id" type="checkbox" :value="user.id" v-model="chosenUsers"/>-->
                <input :id="'add-' + user.id"
                       type="checkbox"
                       :checked="chosenUsers.includes(user.id) || chosenRoles.includes(role.id)"
                       @change="changeUser(user, role)"
                />
                <label :for="'add-' + user.id"></label>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
      <div v-else-if="usersStatus === 'fetching'" class="position_creation-body-roles -empty">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else-if="areFiltersApplied" class="position_creation-body-roles -empty">
        <h3 class="mb-2">По вашему запросу ничего не найдено</h3>
        <p>Попробуйте изменить или сократить запрос</p>
      </div>
      <div v-else class="position_creation-body-roles -empty">
        <user class="mb-4" />
        <h3 class="mb-2">Нет сотрудников, которым<br/>можно дать эту должность</h3>
      </div>
    </div>
  </form>
</template>

<script>
import GroupUser from "@/pages/Organization/Groups/components/GroupUser";
import Select from "@/components/Common/Select/Select";
import throbber from "@/assets/vue-svg/throbber.svg";
import user from "@/assets/vue-svg/user.svg";
import search from "@/assets/vue-svg/search.svg"
import { getSmallImage, getIdsFromGroup } from "@/tools/tools";

export default {
  name: 'position-creation',
  props: {
    position: Object,
  },
  components: {
    GroupUser,
    'custom-select': Select,
    'throbber': throbber,
    'user': user,
    'search': search
  },
  data() {
    return {
      title: '',
      searchString: '',
      role: null,
      region: null,
      chosenUsers: [],
      chosenRoles: [],
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
    status() {
      return this.$store.state.positions.status;
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
    groupsForRegionFilter() {
      if (!this.region) return undefined;
      return getIdsFromGroup(this.groups.find(group => group.id === this.region));
    },
    rolesStatuses() {
      if (!this.chosenUsers) return this.formattedUsers.map(() => '-none');
      return this.formattedUsers.map((role, key) => {
        if (this.chosenRoles.includes(role.id)) return '-all';
        const isRoleLoaded = (key < (this.chosenRoles.length - 1)) || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages);
        let someActive = false,
            someInactive = false;

        role.users.some(user => {
          if (this.chosenUsers.includes(user.id)) someActive = true;
          else someInactive = true;
          return someActive && someInactive;
        });

        return someActive ? (someInactive || !isRoleLoaded ? '-some' : '-all') : '-none';
      });
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    groupsForSelect() {
      return [{title: 'Выберите регион', id: null}, ...this.groups];
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
  },
  created() {
    this.getUsers();
  },
  methods: {
    createPosition() {
      if ((this.status === 'adding-users') || (this.status === 'creating')) return;
      if (this.position) return this.$store.dispatch('positions/addUsersToPosition', {
        positionId: this.position.id,
        users: {
          users: this.chosenUsers,
          groups_of_users: this.chosenRoles.map(role => ({
            role,
            search: this.searchString,
            main_groups: this.groupsForRegionFilter,
          })),
        },
      });
      this.$store.dispatch('positions/createPosition', {
        title: this.title,
        users: this.chosenUsers,
        groups_of_users: this.chosenRoles.map(role => ({
          role,
          search: this.searchString,
          main_groups: this.groupsForRegionFilter,
        })),
      });
    },
    getUsers(page = 1) {
      let query = {
        is_active: true,
        page,
        search: this.searchString,
        role: this.role,
        main_group: this.groupsForRegionFilter,
        'order[role]': 'asc',
        position: 'null',
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
    changeRole(role, key) {
      if (this.chosenRoles.includes(role.id)) return this.chosenRoles = this.chosenRoles.filter(roleId => roleId !== role.id);
      const newUsers = this.chosenUsers.filter(userId =>
          !this.formattedUsers[key].users.some(user => user.id === userId)
      );
      if (this.rolesStatuses[key] === '-all') return this.chosenUsers = newUsers;
      this.chosenUsers = newUsers;
      this.chosenRoles = [...this.chosenRoles, role.id];
    },
    toggleCollapse(code) {
      this.collapseStatuses = {
        ...this.collapseStatuses,
        [code]: !this.collapseStatuses[code],
      };
    },
    changeFilters() {
      this.chosenUsers = [];
      this.chosenRoles = [];
      this.getUsers();
    },
    clickBack() {
      this.$emit('back');
    },
    changeUser(user, role) {
      if (this.chosenRoles.includes(role.id)) {
        this.chosenRoles = this.chosenRoles.filter(roleId => roleId !== role.id);
        const newUsers = [...this.chosenUsers];
        role.users.forEach(currentUser => (currentUser.id !== user.id) && newUsers.push(currentUser.id));
        this.chosenUsers = newUsers;
        return;
      }
      if (this.chosenUsers.includes(user.id)) this.chosenUsers = this.chosenUsers.filter(userId => userId !== user.id);
      else this.chosenUsers = [...this.chosenUsers, user.id];
    },
  }
}
</script>