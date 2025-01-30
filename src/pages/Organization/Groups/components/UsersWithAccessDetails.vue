<template>
  <div class="users_access theme-helper-content-main">
    <div class="theme-helper-content-main-header"></div>
    <div class="theme-helper-content-main-subheader">
      <span class="theme-helper-content-main-subheader-link" @click="close">
        <i class="fa fa-angle-left"/>
        <span>{{ activeGroup.title }}</span>
      </span>
    </div>
    <div class="users_access-body">
      <div class="users_access-body-title">
        <h3 class="mb-1">Имеют доступ к группе “{{ activeGroup.title }}”</h3>
        <div class="d-flex align-items-center">
          <i class="flag-icon mr-1"
             :class="`flag-icon-${groupWithUsers.build_group.flag || 'default'}`"
             :title="groupWithUsers.build_group.country"
          />
          <span v-if="groupWithUsers.build_group.office" class="text-gray mr-1">{{ groupWithUsers.build_group.city }}</span>
          <span>{{ groupWithUsers.build_group.office || groupWithUsers.build_group.city || groupWithUsers.build_group.country }}</span>
        </div>
      </div>
      <div class="users_access-body-search">
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
      <div class="users_access-body-roles" @scroll="handleScroll">
        <users-with-access-block v-for="role in formattedUsers"
                                 :role="role"
                                 :ref="`user-with-access-role-${role.code}`"
                                 :edit-permission="editPermission"
                                 @remove-users="removeUsers"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UsersWithAccessBlock from "./UsersWithAccessBlock";
import { getSmallImage } from "@/tools/tools";
import search from '@/assets/vue-svg/search.svg';

export default {
  name: 'users-with-access-details',
  props: {
    activeGroup: Object,
    groupWithUsers: Object,
    type: String,
    activeRoleCode: String,
  },
  components: {
    UsersWithAccessBlock,
    'search': search,
  },
  data() {
    return {
      searchString: '',
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
        };
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
    groupsStatus() {
      return this.$store.state.groups.statusUsers;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.activeGroup.sub_type === 'operator' ? this.userPermissions.group.operator.edit : this.userPermissions.group.main.edit;
    },
  },
  watch: {
    groupsStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if (prevStatus === 'removing') this.getUsers();
      }
    },
  },
  created() {
    this.getUsers();
  },
  methods: {
    close() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
    getUsers(page = 1) {
      const query = {
        page,
        search: this.searchString,
        main_group: this.groupWithUsers.id,
        all_groups: [this.activeGroup.id],
        'order[role]': 'asc',
      };
      if (this.activeRoleCode) query.role = this.activeRoleCode;
      this.$store.dispatch('users/fetchCurrentUsers', query);
    },
    handleScroll(e) {
      if ((this.status === 'fetching') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || !this.users.length) return;
      const anchorUser = this.users[this.users.length - 2],
          top = this.$refs[`user-with-access-role-${anchorUser.role.code}`]?.[0]?.getElementTopById(anchorUser.id);

      if (top && (top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height))
        this.getUsers(this.usersHeaders.currentPage + 1);
    },
    onInputSearchString() {
      const searchString = this.searchString;
      setTimeout(() => {
        if (searchString === this.searchString) this.getUsers();
      }, 1000);
    },
    removeUsers(users) {
      this.$emit('remove-users', users);
    },
  },
}
</script>