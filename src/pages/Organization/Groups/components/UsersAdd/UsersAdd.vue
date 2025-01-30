<template>
  <form class="users_add theme-helper-content-main" @submit="addUsers">
    <div class="users_add-header">
      <b-button variant="outline-primary"
                size="sm"
                type="submit"
                class="users_add-header-add"
                id="users-add-submit"
                :disabled="!chosenUsers.length"
      >Добавить в группу "{{ group.title }}"</b-button>
      <div v-if="createPermission" class="users_add-header-create" id="users-add-create" @click="clickCreateUser">
        <span>Создать сотрудника</span>
        <div class="btn-add"></div>
      </div>
    </div>
    <div class="users_add-body">
      <div class="users_add-body-filters">
        <custom-select v-model="region"
                       :options="groups"
                       value-field="id"
                       default-text="Выберите регион"
                       @change="changeFilters"
        />
        <custom-select v-model="role"
                       :options="filteredRoles"
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
      <div class="users_add-body-roles" @scroll="handleScroll">
        <div v-for="(role, key) in formattedUsers" class="users_add-body-roles-role">
          <div class="users_add-body-roles-role-main" @click="toggleCollapse(role.code)">
            <b>{{ role.title }}</b>
            <div class="users_add-body-roles-role-main-actions">
              <div class="groups_select-item-container-checkbox-triple"
                   :class="rolesStatuses[key]"
                   @click.stop="changeRole(key)"
              />
              <i class="fa fa-angle-down angle" :class="{'-active': !collapseStatuses[role.code]}"/>
            </div>
          </div>
          <b-collapse :visible="!collapseStatuses[role.code]" class="users_add-body-roles-role-users">
            <div v-for="user in role.users" class="users_add-body-roles-role-users-user" :ref="`user-add-${user.id}`" :key="user.id">
              <avatar class="mr-2"
                      :url="user.smallAvatar"
                      :telegram="user.telegram_connected"
                      :is-fin-admin="user.is_fin_admin"
              />
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
                <input :id="'add-' + user.id" type="checkbox" :value="user.id" v-model="chosenUsers"/>
                <label :for="'add-' + user.id"></label>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>
<!--    <template v-else>
      <div class="users_add-header"></div>
      <div class="users_add-empty">
        <div class="users_add-empty-img icon-group"></div>
        <h3>Нет сотрудников, которых можно добавить в группу</h3>
        <template v-if="createPermission">
          <p>Создайте сотрудника, чтобы добавить его в группу</p>
          <b-button variant="outline-primary" id="users-add-create" @click="clickCreateUser">
            Создать сотрудника
          </b-button>
        </template>
      </div>
    </template>-->
  </form>
</template>

<script>
import GroupUser from "@/pages/Organization/Groups/components/GroupUser";
import Select from "@/components/Common/Select/Select";
import Avatar from "@/components/Common/Avatar/Avatar";
import { getSmallImage, getIdsFromGroup } from "@/tools/tools";
import search from "@/assets/vue-svg/search.svg"

export default {
  name: 'users-add',
  props: {
    group: Object,
  },
  components: {
    GroupUser,
    'custom-select': Select,
    Avatar,
    'search': search,
  },
  data() {
    return {
      searchString: '',
      role: null,
      region: null,
      chosenUsers: [],
      collapseStatuses: {},
    }
  },
  computed: {
    status() {
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
    groupsForRegionFilter() {
      if (!this.region) return undefined;
      return getIdsFromGroup(this.groups.find(group => group.id === this.region));
    },
    rolesStatuses() {
      if (!this.chosenUsers?.length) return this.formattedUsers.map(() => '-none');
      return this.formattedUsers.map(role => {
        let someActive = false,
            someInactive = false;

        role.users.some(user => {
          if (this.chosenUsers.includes(user.id)) someActive = true;
          else someInactive = true;
          return someActive && someInactive;
        });

        return someActive ? (someInactive ? '-some' : '-all') : '-none';
      });
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    roles() {
      if (this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN') return this.$store.state.dictionaries.roles;
      return this.$store.state.auth.user.role?.available_roles || [];
    },
    filteredRoles() {
      if (!this.group.sub_type) return this.roles;
      const hiddenRoleType = this.group.sub_type === 'model' ? 'operator' : 'main';
      return this.roles.filter(role => role.type !== hiddenRoleType);
    },
    createPermission() {
      if (this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN') return true;
      return this.userPermissions.user.create;
    },
  },
  created() {
    this.getUsers();
  },
  methods: {
    addUsers(e) {
      e.preventDefault();
      this.$store.dispatch('groups/addUsersToGroup', {
        groupId: this.group.id,
        users: this.chosenUsers,
        operation: 'set',
        // type: ((this.group.sub_type === 'operator') && (this.type === 'operators')) ? 'operator' : 'model',
      });
    },
    clickCreateUser() {
      this.$emit('createUser');
    },
    getUsers(page = 1) {
      let query = {
        is_active: true,
        page,
        search: this.searchString,
        role: this.role,
        main_group: this.groupsForRegionFilter,
        'order[role]': 'asc',
      };
      switch (this.group.sub_type) {
        case 'model':
          if (!this.role) query.role_type = 'main';
          query.group_exclude = this.group.id;
          break;
        case 'operator':
          if (!this.role) query.role_type = 'operator';
          query.operator_group_exclude = this.group.id;
          break;
        default:
          query.group_exclude = this.group.id;
          query.operator_group_exclude = this.group.id;
      }
      this.$store.dispatch('users/fetchCurrentUsers', query);
    },
    handleScroll(e) {
      if ((this.status === 'fetching') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || !this.users.length) return;
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
    changeRole(key) {
      if (this.rolesStatuses[key] === '-all') return this.chosenUsers = this.chosenUsers.filter(userId =>
          !this.formattedUsers[key].users.some(user => user.id === userId)
      );
      let chosenUsers = [...this.chosenUsers];
      this.formattedUsers[key].users.forEach(user => {
        if (!chosenUsers.includes(user.id)) chosenUsers.push(user.id);
      });
      this.chosenUsers = chosenUsers;
    },
    toggleCollapse(code) {
      this.collapseStatuses = {
        ...this.collapseStatuses,
        [code]: !this.collapseStatuses[code],
      };
    },
    changeFilters() {
      this.chosenUsers = [];
      this.getUsers();
    },
  }
}
</script>