<template>
  <form class="users_add theme-helper-content-main" @submit="addUsers">
    <div class="users_add-header">
      <button-throbber
          size="sm"
          type="submit"
          variant="outline-primary"
          colorThrobber="primary"
          class="ref_system_models-throbber_button"
          :class="isLoading ? 'primary' : ''"
          :loading="isLoading"
          id="users-add-submit"
          :disabled="!chosenUsers.length"
      >Добавить сотрудника</button-throbber>
    </div>
    <div class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>Бонусная программа</span>
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
      </div>
      <div class="auth_history-body-search">
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
        <div class="users_add-body-models" @scroll="handleScroll">
          <div v-for="(group,key) in formattedUsers" class="ref_system_models-main-block-group" :key="group.id">
            <div class="groups-main-data-blocks-main-collapse-users-group_info" @click="toggleGroupCollapse(group.id)">
              <div class="d-flex align-items-center">
                <i class="groups-nav-list-group-container-color mr-3"
                   :style="`background-color: ${group.color || 'red'}`"/>
                <div v-if="!group.parentTitle">
                  <b class="mr-2">{{ group.city || group.country || group.title }}</b>
                  <b v-if="group.office" class="text-gray mr-2">{{ group.office || group.title }}</b>
                </div>
                <div v-else>
                  <b class="mr-2">{{ group.parentTitle || group.title }}</b>
                  <b v-if="group.parentTitle" class="text-gray mr-2">{{ group.title }}</b>
                </div>
              </div>
              <div class="users_add-body-roles-role-main-actions">
                <div class="groups_select-item-container-checkbox-triple mr-2_5"
                     :class="groupStatuses[key]"
                     @click.stop="changeGroup(key)"
                />
                <i class="fa fa-angle-down angle" :class="{'-active': !groupCollapseReverseStatuses[group.id]}"/>
              </div>
            </div>
            <b-collapse v-if="users" :visible=!groupCollapseReverseStatuses[group.id]
                        class="groups-main-data-blocks-main-collapse-users-group"
            >
              <div v-for="user in group.users" class="users_add-body-roles-role-users-user" :ref="`model-add-${user.id}`" :key="user.id">
                <avatar class="mr-2"
                        size="-lg"
                        :url="user.avatar"
                        :telegram="user.telegram_connected"
                        :is-fin-admin="user.is_fin_admin"
                />
                <div class="users_add-body-roles-role-users-user-ref">
                  <b>
                    <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                    <template v-else>
                      <span class="text-gray mr-1">{{ user.uid }}</span>
                      <span>{{ user.fullname }}</span>
                    </template>
                  </b>
                  </div>
                <div class="abc-checkbox -fixed users_add-body-roles-role-users-user-checkbox">
                  <input v-model="chosenUsers" :id="'add-' + user.id" type="checkbox" :value="user.id"/>
                  <label :for="'add-' + user.id"></label>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
    </div>
  </form>
</template>

<script>
import GroupUser from "@/pages/Organization/Groups/components/GroupUser";
import Select from "@/components/Common/Select/Select";
import Avatar from "@/components/Common/Avatar/Avatar";
import {getIdsFromGroup, findInListRecursivelyWithParent} from "@/tools/tools";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import search from "@/assets/vue-svg/search.svg"

export default {
  name: 'refSystemModelsAdd',
  props: {
    url: String,
    userId: Number,
    refType: String,
  },
  components: {
    ButtonThrobber,
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
      mainCollapseStatus: false,
      groupCollapseReverseStatuses: {},
    }
  },
  computed: {
    status() {
      return this.$store.state.profile.userStatus;
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    refStatus() {
      return this.$store.state.profile.refStatus;
    },
    users() {
      return this.$store.state.profile.currentUsers;
    },
    groups() {
      return this.$store.state.dictionaries.groupsNonSystem;
    },
    currentGroups() {
      return this.$store.state.groups.groups;
    },
    groupsForRegionFilter() {
      if (!this.region) return undefined;
      return getIdsFromGroup(this.groups.find(group => group.id === this.region));
    },
    usersHeaders() {
      return this.$store.state.profile.currentUsersHeaders;
    },
    isLoading() {
      return this.refStatus === 'adding-refs';
    },
    formattedUsers() {
      const formattedUsers = [];
      this.users.forEach(user => {
        if (user.main_group.type !== null) {
          const groupIndex = formattedUsers.findIndex(group => group.id === user.main_group.id);
          groupIndex === -1 ? formattedUsers.push({
            ...user.main_group,
            users: [user]
          }) : formattedUsers[groupIndex].users.push(user);
        } else {
          const foundGroup = findInListRecursivelyWithParent(this.groups, group => group.id === user.main_group.id, false, 0, null);
          const parentTitle = foundGroup?.parent?.title;
          const groupIndex = formattedUsers.findIndex(group => group.id === user.main_group.id, parentTitle);
          groupIndex === -1 ? formattedUsers.push({
            ...user.main_group,
            users: [user],
            parentTitle
          }) : formattedUsers[groupIndex].users.push(user);
        }
      });
      return formattedUsers;
    },
    groupStatuses() {
      if (!this.chosenUsers?.length) return this.formattedUsers.map(() => '-none');
      return this.formattedUsers.map(group => {
        let someActive = false,
            someInactive = false;
        group.users.some(user => {
          if (this.chosenUsers.includes(user.id)) someActive = true;
          else someInactive = true;
          return someActive && someInactive;
        });
        return someActive ? (someInactive ? '-some' : '-all') : '-none';
      });
    },
  },
  watch: {
    refStatus: function(newStatus, prevStatus) {
      if (newStatus === '' && prevStatus === 'adding-refs') {
        this.clickBack();
      }
    }
  },
  created() {
    this.getUsers();
    this.$store.dispatch('groups/getGroups');
  },
  methods: {
    getUsers(page = 1) {
      let filters = {
        is_active: true,
        main_group_is_system: false,
        page,
        search: this.searchString,
        main_group: this.groupsForRegionFilter,
        'order[main_group]': 'asc',
        exclude_connected_to_user_as_trainer: this.refType === 'trainer' ? this.userId : null,
        exclude_connected_to_user_as_referal: this.refType === 'referal' ? this.userId : null,
        is_ref_connected: this.refType === 'referal' ? false : null,
      };
      this.$store.dispatch('profile/fetchCurrentUsers', filters);
    },
    addUsers(e) {
      e.preventDefault();
      let params = {
        users: this.chosenUsers,
        type: this.refType === 'trainer' ? this.refType : this.refType === 'referal' ? this.refType : '',
        userId: this.userId,
      };
      this.$store.dispatch('profile/addRefSystemConnectedUsers', params);
    },
    clickBack() {
      this.$emit('back');
    },
    toggleGroupCollapse(groupId) {
      this.groupCollapseReverseStatuses = {
        ...this.groupCollapseReverseStatuses,
        [groupId]: !this.groupCollapseReverseStatuses[groupId],
      }
    },
    handleScroll(e) {
      if ((this.status === 'fetching') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || !this.users.length) return;
      const anchorElementId = this.users[this.users.length - 2].id;
      if (this.$refs[`model-add-${anchorElementId}`]?.[0] && (this.$refs[`model-add-${anchorElementId}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height))
        this.getUsers(this.usersHeaders.currentPage + 1);
    },
    onInputSearchString() {
      const searchString = this.searchString;
      setTimeout(() => {
        if (searchString === this.searchString) this.changeFilters();
      }, 1000);
    },
    changeFilters() {
      this.chosenUsers = [];
      this.getUsers();
    },
    changeGroup(key) {
      const selectedUserIds = this.formattedUsers[key].users.map(user => user.id);
      let chosenUsers = [...this.chosenUsers];
      const allSelectedUsersChosen = selectedUserIds.every(userId => chosenUsers.includes(userId));
      if (allSelectedUsersChosen) {
        chosenUsers = chosenUsers.filter(userId => !selectedUserIds.includes(userId));
      } else {
        chosenUsers = [...chosenUsers, ...selectedUserIds];
      }
      this.chosenUsers = chosenUsers;
    },
  }
}
</script>