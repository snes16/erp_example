<template>
  <div class="white_list-add">
    <div class="theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" @click="addUsers">Добавить</b-button>
    </div>
    <div class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="close">
        <i class="fa fa-angle-left"></i>
        <span>Права доступа</span>
      </div>
    </div>
    <div class="theme-helper-content-main-body">
      <h4>Добавить сотрудников</h4>
      <b-form-group class="add_groups-body-search">
        <b-input-group>
          <b-input-group-text slot="append">
            <search/>
          </b-input-group-text>
          <b-form-input v-model="searchString"
                        placeholder="Поиск"
          />
        </b-input-group>
      </b-form-group>
      <div v-if="Array.isArray(usersForWhiteList)" class="">
        Сотрудники не найдены
      </div>
<!--      <div v-else class="white_list-add-body" @scroll="onContentScroll">-->
      <div v-else class="white_list-add-body">
        <div v-for="(role, key) in formattedRoles" v-if="usersForWhiteList[role.code] && usersForWhiteList[role.code].length" >
          <div class="white_list-add-body-title" @click="toggleCollapse(role.code)">
            <b>{{ role.title }}</b>
            <div class="users_add-body-roles-role-main-actions">
              <div class="groups_select-item-container-checkbox-triple"
                   :ref="`role-${key}`"
                   :class="`-${key} ${rolesStatuses[key]}`"
                   @click.stop="toggleSelectAll(role.code)"
              />
              <i class="fa ml-3" :class="visible[role.code] ? 'fa-angle-down' : 'fa-angle-up'"/>
            </div>
          </div>
          <b-collapse :visible="!visible[role.code]">
            <div v-for="(user, key) in usersForWhiteList[role.code]" class="users_add-body-roles-role-users-user pb-2 pt-2" :ref="`user-for-white-list-${key}`" :key="user.id">
              <avatar class="avatar -lg"
                      :url="user.avatar"
                      :telegram="user.telegram_connected"
                      :is-fin-admin="user.is_fin_admin"
              />
              <div class="users_add-body-roles-role-users-user-white_list p-0">
                <b class="text-ellipsis overflow-hidden ml-3">
                  <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                  <template v-else>
                    <span class="text-ellipsis overflow-hidden text-gray mr-1">{{ user.uid }}</span>
                    <span>{{ user.fullname }}</span>
                  </template>
                </b>
                <div v-if="user.main_group" class="text-ellipsis overflow-hidden d-flex align-items-center ml-3">
                  <span>{{user.main_group.office || user.main_group.city || user.main_group.country }}</span>
                </div>
              </div>
              <div class="abc-checkbox -fixed users_add-body-roles-role-users-user-checkbox">
                <input :id="'add-' + user.id" type="checkbox" :value="user.id" v-model="addedUsers" @change="toggleUser($event, user.id)"/>
                <label class="left" :for="'add-' + user.id"></label>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getSmallImage} from "@/tools/tools";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import search from "@/assets/vue-svg/search.svg";

export default {
  name: 'user-white-list',
  components: {
    Avatar,
    'search': search,
  },
  props: {
    userId: Number,
  },
  data() {
    return {
      chosenUsers: [],
      addedUsers: [],
      removedUsers: [],
      searchString: '',
      perPage: 20,
      visible: {},
      collapseStatuses: {},
    };
  },
  computed: {
    usersForWhiteList() {
      return this.$store.state.profile.usersForWhiteList;
    },
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    formattedRoles() {
      return this.roles.filter(role => this.usersForWhiteList[role.code] && this.usersForWhiteList[role.code].length);
    },
    status() {
      return this.$store.state.profile.status;
    },
    headers() {
      return this.$store.state.profile.usersForWhiteListHeaders;
    },
    middleElementKey() {
      let lastRole = this.roles[this.roles.filter(role => this.usersForWhiteList[role.code]?.length).length - 1];
      if (this.usersForWhiteList[lastRole.code].length < this.perPage) return `${lastRole.id}-0`;
      return `${lastRole.id}-${this.usersForWhiteList[lastRole.code].length - (this.usersForWhiteList[lastRole.code].length % this.perPage) - Math.floor(this.perPage / 2)}`;
    },
    usersForWhiteListLastPage() {
      return this.$store.state.profile.usersForWhiteListLastPage;
    },
    rolesStatuses() {
      if (!this.addedUsers?.length) return this.roles.map(() => '-none');
      const roleStatuses = [];
      for (const role in this.usersForWhiteList) {
        if (this.usersForWhiteList.hasOwnProperty(role)) {
          const roleUsers = this.usersForWhiteList[role];
          let someActive = false;
          let someInactive = false;
          roleUsers.forEach(user => {
            this.addedUsers.includes(user.id) ? someActive = true : someInactive = true;
          });
          someActive ? roleStatuses.push(someInactive ? '-some' : '-all') : roleStatuses.push('-none');
        }
      }
      return roleStatuses;
    }
  },
  watch: {
    usersForWhiteListLastPage: function(newPage) {
      let activeUsers = [];
      for (let role in newPage) {
        activeUsers = [...activeUsers, ...newPage[role].filter(user => user.in_white_list && !this.chosenUsers.includes(user.id) && !this.removedUsers.includes(user.id)).map(user => user.id)];
      }
      this.chosenUsers = [...this.chosenUsers, ...activeUsers];
    },
  },
  created() {
    this.$store.dispatch('profile/fetchUsersForWhiteList', {
      id: this.userId,
      query: {
        pagination: false,
        is_active: true,
        role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
      },
    });
  },
  methods: {
    onInputSearchString() {
      let searchString = this.searchString;
      setTimeout(() => this.fetchSearchResults(searchString), 500);
    },
    fetchSearchResults(searchString) {
      if ((searchString !== this.searchString) || (this.status === 'request')) return;
      this.requestedSearchString = searchString;
      this.$store.dispatch('profile/fetchUsersForWhiteList', {
        id: this.userId,
        query: {
          surname: searchString,
          pagination: false,
          is_active: true,
          role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
        }
      });
    },
    onContentScroll(e) {
      if ((this.$refs[`user-for-white-list-${this.middleElementKey}`]?.[0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height)) this.getUsersNextPage();
    },
    getUsersNextPage() {
      if ((this.status === 'request') || (this.headers.currentPage >= this.headers.totalPages)) return;
      this.$store.dispatch('profile/fetchUsersForWhiteList', {id: this.userId, query: {surname: this.searchString, per_page: this.perPage, page: this.headers.currentPage + 1}});
    },
    addUsers() {
      if (this.status === 'editing') return;
      this.$store.dispatch('profile/editWhiteList', {id: this.userId, data: {remove: this.removedUsers, add: this.addedUsers}});
    },
    close() {
      this.$emit('close');
    },
    toggleCollapse(type) {
      this.visible = {
        ...this.visible,
        [type]: !this.visible[type]
      }
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    toggleUser(e, id) {
      if (e.target.checked) {
        if (this.removedUsers.includes(id)) return this.removedUsers = this.removedUsers.filter(user => user !== id);
        return this.addedUsers = [...this.addedUsers, id];
      }
      if (this.addedUsers.includes(id)) return this.addedUsers = this.addedUsers.filter(user => user !== id);
      return this.removedUsers = [...this.removedUsers, id];
    },
    toggleSelectAll(roleCode) {
      if (this.usersForWhiteList[roleCode]) {
        const usersInRole = this.usersForWhiteList[roleCode];
        const selectedUserIds = this.addedUsers;
        const allUsersSelected = usersInRole.every(user => selectedUserIds.includes(user.id));
        if (allUsersSelected) {
          this.addedUsers = selectedUserIds.filter(id => !usersInRole.some(user => user.id === id));
        } else {
          const usersToAdd = usersInRole.filter(user => !selectedUserIds.includes(user.id));
          this.addedUsers = [...selectedUserIds, ...usersToAdd.map(user => user.id)];
        }
      }
    }

  },
}
</script>