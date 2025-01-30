<template>
  <div class="groups-main-data-blocks-main card">
    <div class="groups-main-data-blocks-main-header" @click="toggleCollapseStatus">
      <div class="groups-main-data-blocks-main-header-title">
        <h3 class="mb-0">{{ activeRole.title }}</h3>
        <b-button v-if="activeGroupId && editPermission"
                  variant="add"
                  class="ml-2"
                  @click.stop="addUsers"
        />
      </div>
      <i class="fa fa-angle-down angle" :class="{'-active': collapseStatus}"/>
    </div>
    <b-collapse :visible="collapseStatus" id="group-users-main" class="groups-main-data-blocks-main-collapse">
      <b-form-group class="search-field groups-main-data-blocks-main-collapse-search">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text><search_large/></b-input-group-text>
          </template>
          <b-form-input v-model="searchString"
                        id="groups-search-input"
                        placeholder="Поиск"
                        autocomplete="new-password"
                        @input="onInputSearchString"
          />
        </b-input-group>
      </b-form-group>
      <div class="groups-main-data-blocks-main-collapse-tabs">
        <div class="groups-main-data-blocks-main-collapse-tabs-tab"
             :class="{'-active': isActive}"
             @click="changeIsActive(true)"
        >Активные ({{ quantity.active }})</div>
        <div class="groups-main-data-blocks-main-collapse-tabs-tab"
             :class="{'-active': !isActive}"
             @click="changeIsActive(false)"
        >Неактивные ({{ quantity.inactive }})</div>
      </div>
      <div v-if="users.length" class="groups-main-data-blocks-main-collapse-users" @scroll="handleScroll">
        <template v-if="activeGroupId">
          <div v-for="group in formattedUsers" class="groups-main-data-blocks-main-collapse-users-element" :key="group.id">
            <div class="groups-main-data-blocks-main-collapse-users-group_info" @click="toggleGroupCollapseStatus(group.id)">
              <div class="d-flex align-items-center">
                <i v-if="group.type === 'country'"
                   class="flag-icon mr-2"
                   :class="`flag-icon-${group.build_group.flag || 'default'}`"
                />
                <i v-else class="groups-nav-list-group-container-color mr-2" :style="`background-color: ${group.color || 'red'}`"/>
                <b v-if="group.office" class="text-gray mr-2">{{ group.city }}</b>
                <b>{{ group.office || group.city || group.title }}</b>
              </div>
              <div class="d-flex align-items-center pr-1">
<!--                <i v-if="group.id === activeGroupId" class="glyphicon glyphicon-trash_alt mr-3" @click.stop="deleteUsers"/>-->
                <i class="fa fa-angle-down angle" :class="{'-active': !groupsCollapseStatuses.includes(group.id)}"/>
              </div>
            </div>
            <b-collapse :visible="!groupsCollapseStatuses.includes(group.id)"
                        :id="`collapse-group-${group.id}`"
                        class="groups-main-data-blocks-main-collapse-users-group"
            >
              <group-user v-for="user in group.users"
                          v-model="usersForDeletion"
                          :user="user"
                          :ref="`user-${user.id}`"
                          :key="user.id"
                          @click="clickUser(user.id)"
                          @delete="deleteUser(user.id)"
              />
            </b-collapse>
          </div>
        </template>
        <div v-else class="groups-main-data-blocks-main-collapse-users-group">
          <group-user v-for="user in users" :user="user" :ref="`user-${user.id}`" :key="user.id" @click="clickUser(user.id)"/>
        </div>
        <div v-if="statusUsers === 'request'" class="groups-main-data-blocks-main-collapse-users-group -empty">
          <throbber class="throbber -sm"/>
        </div>
      </div>
      <div v-else class="groups-main-data-blocks-main-collapse-users -empty">
        <span>В данной группе сотрудников не найдено</span>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import GroupUser from "@/pages/Organization/Groups/components/GroupUser";
import throbber from "@/assets/vue-svg/throbber.svg";
import { searchListRecursively, getIdsFromGroup } from "@/tools/tools";
import search_large from "@/assets/vue-svg/search-large.svg";

export default {
  name: 'group-users-main',
  props: {
    groupsType: String,
  },
  components: {
    GroupUser,
    'throbber': throbber,
    'search_large': search_large,
  },
  data() {
    return {
      chosenUsers: [],
      searchString: '',
      collapseStatus: true,
      isActive: true,
      groupsCollapseStatuses: [],
      usersForDeletion: [],
      quantity: {},
    }
  },
  computed: {
    groups() {
      return this.$store.state.groups.groups;
    },
    activeGroupId() {
      const rawId = this.$route.query.group;
      return rawId && parseInt(rawId);
    },
    activeGroup() {
      if (!this.activeGroupId || !this.groups.length) return {};
      return searchListRecursively(this.groups, (group) => group.id === this.activeGroupId)?.element || {};
    },
    editPermission() {
      return this.activeGroup.sub_type === 'operator' ? this.userPermissions.group.operator.edit : this.userPermissions.group.main.edit;
    },
    groupsListForRequest() {
      if (!this.activeGroup?.id) return [];
      return getIdsFromGroup(this.activeGroup, this.groupsType);
    },
    activeRoleCode() {
      return this.$route.query.role;
    },
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    activeRole() {
      if (!this.activeRoleCode) return {title: 'Все сотрудники'};
      return this.roles.find(role => role.code === this.activeRoleCode) || {};
    },
    statusUsers() {
      return this.$store.state.groups.statusUsers;
    },
    users() {
      return this.$store.state.groups.groupUsersMain;
    },
    usersHeaders() {
      return this.$store.state.groups.groupUsersMainHeaders;
    },
    usersHeadersAlt() {
      return this.$store.state.groups.groupUsersMainHeadersAlt;
    },
    formattedUsers() {
      if (!this.activeGroupId) return this.users;
      const groups = [];
      let prevGroup = {};
      this.users.forEach(user => {
        if (prevGroup.id === user.main_group.id) return prevGroup.users.push(user);
        prevGroup = {
          ...user.main_group,
          users: [user],
        };
        groups.push(prevGroup);
      });
      return groups;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  watch: {
    groupsListForRequest: function (newList, prevList) {
      if (JSON.stringify(newList) === JSON.stringify(prevList)) return;
      this.searchString = '';
      this.getUsers();
      this.getAltHeaders();
    },
    activeRoleCode: function () {
      this.searchString = '';
      this.getUsers();
      this.getAltHeaders();
    },
    usersHeaders: function (newHeaders) {
      if (newHeaders.isForCounter) this.quantity = {
        ...this.quantity,
        [newHeaders.isActive ? 'active': 'inactive']: newHeaders.totalItems,
      };
    },
    usersHeadersAlt: function (newHeaders) {
      if (newHeaders.isForCounter) this.quantity = {
        ...this.quantity,
        [newHeaders.isActive ? 'active': 'inactive']: newHeaders.totalItems,
      };
    },
    statusUsers: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if (prevStatus === 'removing') this.$nextTick(() => this.updateLastPage());
      }
    }
  },
  mounted() {
    this.getUsers();
    this.getAltHeaders();
  },
  methods: {
    getUsers(page = 1) {
      this.$store.dispatch('groups/fetchGroupUsersMain', {
        main_group: this.groupsListForRequest,
        role: this.activeRoleCode,
        search: this.searchString,
        is_active: this.isActive,
        page,
        'order[main_group, role]': 'asc',
      });
    },
    getAltHeaders() {
      this.$store.dispatch('groups/fetchGroupUsersMainHeaders', {
        main_group: this.groupsListForRequest,
        role: this.activeRoleCode,
        is_active: !this.isActive,
        per_page: 1,
      });
    },
    updateLastPage() {
      this.$store.dispatch('groups/updateGroupUsersMain', {
        main_group: this.groupsListForRequest,
        role: this.activeRoleCode,
        search: this.searchString,
        is_active: this.isActive,
        page: this.usersHeaders.currentPage,
        'order[main_group, role]': 'asc',
      });
    },
    addUsers() {
      this.$emit('add');
    },
    toggleCollapseStatus() {
      this.collapseStatus = !this.collapseStatus;
    },
    changeIsActive(isActive) {
      this.isActive = isActive;
      this.searchString = '';
      this.getUsers();
    },
    clickUser(id) {
      this.$emit('click-user', id);
    },
    toggleGroupCollapseStatus(groupId) {
      if (this.groupsCollapseStatuses.includes(groupId)) this.groupsCollapseStatuses = this.groupsCollapseStatuses.filter(id => id !== groupId);
      else this.groupsCollapseStatuses = [...this.groupsCollapseStatuses, groupId];
    },
    handleScroll(e) {
      if ((this.statusUsers === 'request') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || !this.users.length) return;
      const anchorElementId = this.users[this.users.length - 2].id;
      if (this.$refs[`user-${anchorElementId}`]?.[0] && (this.$refs[`user-${anchorElementId}`][0].$el.getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height))
        this.getUsers(this.usersHeaders.currentPage + 1);
    },
    onInputSearchString() {
      const searchString = this.searchString;
      setTimeout(() => {
        if (searchString === this.searchString) this.getUsers();
      }, 1000);
    },
    deleteUsers() {
      if (!this.usersForDeletion.length) return;
      this.$emit('remove-users', this.usersForDeletion);
    },
    deleteUser(id) {
      this.$emit('remove-users', [id]);
    },
  },
}
</script>