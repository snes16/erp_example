<template>
  <div class="permissions_edit">
    <div v-if="showThrobber" class="permissions_edit-empty">
      <throbber class="throbber"/>
      <span class="permissions_edit-empty-text">Настройки доступов загружается, пожалуйста, подождите</span>
    </div>
    <template v-else-if="droverType === 'userPermissions'">
      <div class="theme-helper-content-main-header">
        <b-button variant="outline-primary" size="sm" @click="close">Сохранить</b-button>
      </div>
      <div v-if="backButton" class="theme-helper-content-main-subheader">
        <div class="theme-helper-content-main-subheader-link" @click="close">
          <i class="fa fa-angle-left"></i>
          <span>{{ backButton }}</span>
        </div>
      </div>
      <div class="theme-helper-content-main-body">
        <div class="response-info_data-title" @click="toggleCollapse('rights')">
          <h4 class="mb-0">Права доступа</h4>
          <i class="fa" :class="visible.rights ? 'fa-angle-up' : 'fa-angle-down'"/>
        </div>
        <b-collapse v-model="visible.rights" id="rights-collapse" class="roles">
          <div class="roles-content-rights">
            <rights-block v-for="(right, key) in filteredRightsList"
                          v-model="permissions[key]"
                          :right="right"
                          :roleRights="role.rights"
                          :key="key"
                          isUserPermissions
                          :rolePermissions="role.permissions"
                          :chosenUserPermissions="user.permissions"
                          @updatePermission="updatePermissions"
            />
          </div>
        </b-collapse>
        <div class="response-info_data-title border-top pt-3 mt-3" @click="toggleCollapse('actions')">
          <h4 class="mb-0">Действия требующие разрешения</h4>
          <i class="fa" :class="visible.actions ? 'fa-angle-up' : 'fa-angle-down'"/>
        </div>
        <b-collapse v-model="visible.actions" id="rights-collapse" class="roles">
          <actions-list v-model="actionPermissions"
                        :actions="actions"
                        :active-role="role"
                        isUserPermissions
                        :chosenUserPermissions="user.permissions"
                        @setActionPermissions="updatePermissions"
          />
        </b-collapse>
        <div v-if="userType === 'employee'" class="response-info_data-title mt-3 mb-3 border-top pt-3" @click="toggleCollapse('users')">
          <div class="d-flex align-items-center">
            <h4 class="mb-0 mr-2">Назначение задач</h4>
            <b-button variant="add" @click.stop="setDroverType('usersForWhiteList')"/>
          </div>
          <i class="fa" :class="visible.users ? 'fa-angle-up' : 'fa-angle-down'"/>
        </div>
        <b-collapse v-model="visible.users" id="rights-collapse">
          <div class="white_list-watch-users" @scroll="onContentScroll">
            <div v-for="(user, key) in whiteList" class="white_list-watch-users-user" :ref="`white-list-${key}`" :key="user.id">
              <div class="avatar -lg"
                   :style="user.avatar ? `background-image: url(${getSmallImage(user.avatar)}); background-size: cover;` : ''"></div>
              <div class="white_list-watch-users-user-info">
                <b>
                  <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ user.uid }}</span>
                    <span>{{ user.fullname }}</span>
                  </template>
                </b>
                <span v-if="user.role">{{ user.role.title }}</span>
              </div>
              <div class="white_list-watch-users-user-group">
                <span v-if="user.main_group" :id="`user-white-list-${user.id}`">{{ user.main_group.title || user.main_group.office || user.main_group.city || user.main_group.country }}</span>
                <b-tooltip :target="`user-white-list-${user.id}`"
                           triggers="hover"
                           custom-class="white_list-watch-users-user-group-tooltip"
                >
                      <span class="flag-icon mr-1" :class="`flag-icon-${user.main_group.flag || 'default'}`"
                            :title="user.main_group.country"
                      ></span>
                  <span class="text-gray mr-1">{{ user.main_group.city }}</span>
                  <span>{{ user.main_group.city ? user.main_group.office : user.main_group.country || user.main_group.title }}</span>
                </b-tooltip>
              </div>
              <div class="white_list-watch-users-user-delete" @click="removeUserFromWhiteList(user.id)">
                <i class="glyphicon glyphicon-trash_alt"/>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </template>
    <users-for-white-list v-else-if="droverType === 'usersForWhiteList'"
                          :user-id="userId"
                          @close="setDroverType('userPermissions')"
    />
  </div>
</template>

<script>
import RightsBlock from "@/pages/Administration/Roles/components/Rights/RightsBlock";
import ActionsBlock from "@/pages/Administration/Roles/components/Actions/Actions";
import UsersForWhiteList from './UsersForWhiteList';
import throbber from "@/assets/vue-svg/throbber.svg";
import {getTypeEditUser, searchListRecursively, getSmallImage, filterListRecursively} from "@/tools/tools";

export default {
  name: 'edit-permissions',
  props: {
    userId: Number,
    backButton: String,
    isProfilePage: Boolean,
  },
  components: {
    'rights-block': RightsBlock,
    'actions-list': ActionsBlock,
    'users-for-white-list': UsersForWhiteList,
    'throbber': throbber,
  },
  data() {
    return {
      permissions: [],
      actionPermissions: [],
      visible: {},
      droverType: 'userPermissions',
      perPage: 20,
      showThrobber: false,
    }
  },
  computed: {
    profile() {
      return this.$store.getters[this.isProfilePage ? "profile/profile" : "profile/shortProfile"](this.userId);
    },
    user() {
      return this.profile.profile && this.profile.profile.user || {};
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    role() {
      if (!this.profile.role?.code) return {};
      return this.$store.getters['dictionaries/getRoleByCode'](this.profile.role.code);
    },
    allRoles() {
      return this.$store.state.dictionaries.rolesDetailed;
    },
    rights() {
      return this.$store.state.roles.rights;
    },
    actions() {
      return this.$store.state.roles.actions;
    },
    filteredRightsList() {
      if (!this.rights?.length) return [];
      const availableFlag = this.role.code === 'ROLE_MODEL' ? 'personal_model' :
          this.role.code === 'ROLE_OPERATOR' ? 'personal_operator' : 'personal_employee';

      return filterListRecursively(this.rights, right => {
            if (right.flag && (right.flag !== availableFlag)) return false;

            switch (right.role_type) {
              case 'main': return this.role.type === 'main' || this.role.type === 'all';
              case 'operator': return this.role.type === 'operator' || this.role.type === 'all';
              case 'admin': return this.role.code === 'ROLE_SUPERADMIN';
            }

            return true;
          },
          false, 'variants'
      );
    },
    userType() {
      switch (this.profile.role?.code) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
      }
      return 'employee';
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    whiteList() {
      return this.profile.whiteList || [];
    },
    whiteListHeaders() {
      return this.$store.state.profile.whiteListHeaders;
    },
  },
  watch: {
    role: function (newRole) {
      this.getActionPermissions();
      this.checkDataForThrobber(newRole);
    },
    actions: function () {
      this.getActionPermissions();
    },
    userStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'editing') && (newStatus === '')) this.$store.dispatch(`profile/${this.isProfilePage ? 'fetchProfile' : 'fetchShortProfile'}`, {userId: this.userId});
    },
    profileStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'editing') && (newStatus === '')) {
        this.$store.dispatch('profile/fetchWhiteList', {id: this.userId, query: {per_page: this.perPage}});
        this.setDroverType('userPermissions');
      }
    },
    rights: function (newRight) {
      this.checkDataForThrobber(this.role, newRight);
    },
  },
  created() {
    if (this.profile.role?.id) this.$store.dispatch('dictionaries/fetchRole', this.profile.role.id);
    this.$store.dispatch('roles/getRights');
    this.$store.dispatch('roles/getActions');
    if (this.userType === 'employee') {
      this.$store.dispatch('profile/fetchWhiteList', {id: this.userId, query: {per_page: this.perPage}});
      this.$store.dispatch('dictionaries/fetchRoles', {pagination: false});
    }
    setTimeout(this.checkDataForThrobber, 10);
  },
  methods: {
    close() {
      this.$emit('close');
    },
    updatePermissions() {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.userId,
        permissions: [...this.permissions.flat(), ...this.actionPermissions].filter(this.filterPermission)
      });
    },
    toggleCollapse(type) {
      this.visible = {
        ...this.visible,
        [type]: !this.visible[type]
      }
    },
    getActionPermissions() {
      let actionPermissions = []
      this.actions.forEach(action => {
        let newActionId = this.user.permissions?.find(permission => action.variants.some(variant => variant.id === permission.id))?.id || this.role.permissions?.find(permission => action.variants.some(variant => variant.id === permission));
        if (newActionId) actionPermissions.push(newActionId);
      });
      this.actionPermissions = actionPermissions;
    },
    filterPermission(permission) {
      if (this.role.permissions.includes(permission)) return false;
      let result = searchListRecursively(this.rights, right => right.id === permission, 'variants') || searchListRecursively(this.actions, right => right.id === permission, 'variants');
      if (!result?.element?.code?.endsWith('.denied')) return true;
      return result.list.some(element => this.role.permissions.includes(element.id));
    },
    setDroverType(type) {
      this.droverType = type;
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    removeUserFromWhiteList(id) {
      this.$store.dispatch('profile/editWhiteList', {id: this.userId, data: {remove: [id]}});
    },
    onContentScroll(e) {
      let middleElement = this.whiteList.length - (this.whiteList.length % this.perPage) - Math.floor(this.perPage / 2);
      if (this.$refs[`white-list-${middleElement}`] && (this.$refs[`white-list-${middleElement}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height)) this.getWhiteListPage();
    },
    getWhiteListPage() {
      if ((this.profileStatus === 'request') || (this.whiteListHeaders.currentPage >= this.whiteListHeaders.totalPages)) return;
      this.$store.dispatch('profile/fetchWhiteList', {
        id: this.userId,
        query: {per_page: this.perPage, page: this.whiteListHeaders.currentPage + 1}
      });
    },
    checkDataForThrobber(role = this.role, rights = this.rights) {
      this.showThrobber = (!rights.length || !role.id);
    },
  }
}
</script>
