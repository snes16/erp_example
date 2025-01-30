<template>
  <groups-list-for-mobile-drag v-if="isMobileGroupsDrag"
                               :groups-type="groupsType"
                               :filters="filters"
                               @toggle-mobile-drag="toggleMobileDrag"
  />
  <div v-else class="groups">
    <groups-list v-model="groupsType"
                 :is-mobile-groups-drag="isMobileGroupsDrag"
                 :filters="filters"
                 @change-filters="changeFilters"
                 @create="showCreateGroupDrover"
                 @toggle-mobile-drag="toggleMobileDrag"
    />
    <div class="groups-main">
      <groups-title :group="activeGroup" @settings="showDrover('settings')" @delete="showDeleteModal" />
      <role-picker />
      <div class="groups-main-data">
        <div class="groups-main-data-blocks">
          <group-users-main :groups-type="groupsType" @remove-users="showRemoveUsersModal" @add="showDrover('users-add')" />
          <group-users-with-access v-if="activeGroupId" />
          <group-rooms v-if="activeGroup && (activeGroup.type === 'office') && (activeGroup.sub_type === 'model')"
                       :rooms="activeGroup.rooms"
          />
        </div>
        <groups-roles class="groups-main-data-roles" />
      </div>
    </div>
    <helper contentClass="-paddingless">
      <user-details v-if="droverType === 'user-details'"
                    :userId="activeUserId"
                    :office-id="activeGroup && (activeGroup.type === 'office') ? activeGroupId : null"
      />
      <users-with-access-details v-if="droverType === 'users-with-access-details'"
                                 :active-group="activeGroup"
                                 :active-role-code="activeRoleCode"
                                 :group-with-users="accessGroup"
                                 :type="groupsType"
                                 @remove-users="showRemoveUsersModal"
      />
      <users-add v-else-if="droverType === 'users-add'"
                 :group="activeGroup"
                 @createUser="showDrover('user-create')"
      />
      <user-create v-else-if="droverType === 'user-create'"
                   :group="activeGroup"
                   :page-role-code="activeRoleCode"
                   @goBack="showDrover('users-add')"
      />
      <group-settings v-else-if="droverType === 'settings'"
                      :group="activeGroup"
                      @delete="showDeleteModal"
      />
      <group-creation v-else-if="droverType === 'group-create'"
                      :parent-group="parentGroup"
                      :type="groupsType"
      />
      <room-creation v-else-if="droverType === 'room-details'"
                     :originalRoom="activeRoom"
      />
    </helper>
    <b-modal id="remove_users_modal"
             centered
             title="Вы точно хотите удалить доступ к группе?"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="removeUser"
    >Пользователи потеряет доступ к выбранной группе</b-modal>
    <b-modal id="delete_group_modal"
             centered
             :title="`Вы точно хотите удалить группу “${groupToBeDeleted.title}”?`"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="deleteGroup">
      Это навсегда удалит группу и связанные с ней подгруппы. Эти группы больше не будут доступны вам или
      кому-либо еще.
    </b-modal>
  </div>
</template>

<script>
import GroupsList from "./components/GroupsList";
import GroupsTitle from "./components/GroupsTitle";
import GroupsRoles from "./components/GroupsRoles";
import GroupUsersMain from "./components/GroupUsersMain";
import GroupUsersWithAccess from "./components/GroupUsersWithAccess";
import GroupRooms from "./components/GroupRooms";
import RolePicker from "./components/RolePicker";
import Helper from "@/components/Helper/Helper";
import UserDetails from "./components/UserDetails/UserDetails";
import UsersWithAccessDetails from "@/pages/Organization/Groups/components/UsersWithAccessDetails";
import UsersAdd from './components/UsersAdd/UsersAdd';
import UserCreate from './components/UserCreate/UserCreate';
import GroupSettings from './components/GroupSettings/GroupSettings';
import GroupCreation from './components/GroupCreation/GroupCreation';
import RoomCreation from './components/RoomCreation/RoomCreation';
import GroupsListForMobileDrag from "./components/GroupsListForMobileDrag";
import { findInListRecursively, showToast, closeToast } from "@/tools/tools";
import AddGroups from "@/pages/Profile/components/AddGroups/AddGroups.vue";

export default {
  name: 'groups',
  components: {
    GroupsList,
    GroupsTitle,
    GroupsRoles,
    RolePicker,
    GroupUsersMain,
    GroupUsersWithAccess,
    GroupRooms,
    Helper,
    UserDetails,
    UsersWithAccessDetails,
    UsersAdd,
    UserCreate,
    GroupSettings,
    GroupCreation,
    RoomCreation,
    GroupsListForMobileDrag,
    AddGroups,
  },
  data() {
    return {
      usersForRemoval: [],
      droverType: '',
      groupToBeDeleted: {},
      parentGroup: null,
      groupsType: 'model',
      isMobileGroupsDrag: false,
      filters: {
        inactiveGroups: false,
        emptyGroups: false,
      },
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    activeGroupId() {
      let rawId = this.$route.query.group;
      return rawId && parseInt(rawId);
    },
    activeRoleCode() {
      return this.$route.query.role;
    },
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    activeRole() {
      if (!this.activeRoleCode) return null;
      return this.roles.find(role => role.code === this.activeRoleCode);
    },
    activeUserId() {
      let rawId = this.$route.query.user;
      return rawId && parseInt(rawId);
    },
    activeRoomId() {
      let rawId = this.$route.query.room;
      return rawId && parseInt(rawId);
    },
    activeRoom() {
      if (!this.activeRoomId || !this.activeGroup?.rooms) return null;
      return this.activeGroup.rooms.find(room => room.id === this.activeRoomId);
    },
    activeGroup() {
      if (!this.activeGroupId) return null;
      return findInListRecursively(this.groups, (group) => group.id === this.activeGroupId);
    },
    status() {
      return this.$store.state.groups.status;
    },
    responsibleStatus() {
      return this.$store.state.groups.responsibleStatus;
    },
    statusUsers() {
      return this.$store.state.groups.statusUsers;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    accessGroupId() {
      let rawId = this.$route.query.access_group;
      return rawId && parseInt(rawId);
    },
    usersWithAccessCounter() {
      return this.$store.state.groups.usersWithAccessCounter;
    },
    accessGroup() {
      if (!this.accessGroupId) return null;
      const group = findInListRecursively(this.groups, (group) => group.id === this.accessGroupId);
      if (group) return group;
      const groupFromAccessCounters = this.usersWithAccessCounter.find(group => group.id === this.accessGroupId);
      if (groupFromAccessCounters) return {
        ...groupFromAccessCounters,
        build_group: {
          flag: groupFromAccessCounters.flag,
          country: groupFromAccessCounters.country,
          city: groupFromAccessCounters.city,
          office: groupFromAccessCounters.office,
        },
      };
      return null;
    },
    errorMessage() {
      return this.$store.state.groups.errorMessage;
    },
    newGroup() {
      return this.$store.state.groups.newGroup;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'adding-users':
            showToast(this.$toasted, 'Сотрудники добавлены');
            this.$store.dispatch('layout/toggleHelper', false);
            return;
          case 'deleting':
            this.$toasted.success(`Группа “${this.groupToBeDeleted.title}” удалена`, {
              position: 'bottom-left',
              keepOnHover: true,
              duration: 5000,
              action: [
                {
                  text: 'Отменить',
                  class: '-success',
                  onClick: this.cancelDeletion(this.groupToBeDeleted.id),
                },
                {
                  text: '',
                  class: 'btn-close',
                  onClick: closeToast,
                },
              ],
            });
            if (this.activeGroupId === this.groupToBeDeleted.id) this.$router.push({
              name: this.$route.name,
              query: {
                ...this.$route.query,
                group: undefined,
              },
            });
            return;
          case 'creating':
            showToast(this.$toasted, `Группа "${this.newGroup.title}" создана`)
            return this.$store.dispatch('layout/toggleHelper', false);
        }
      } else if (newStatus === 'error') showToast(this.$toasted, this.errorMessage || 'Ошибка', 'error');
    },
    responsibleStatus: function (newStatus, prevStatus) {
      if (newStatus === 'error' && prevStatus === 'request')
        showToast(this.$toasted, this.errorMessage || 'Ошибка', 'error');
    },
    statusUsers: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if (prevStatus === 'removing') showToast(this.$toasted, 'Успешно удален доступ к группе');
      }
    },
    activeUserId: function (newId, prevId) {
      if (newId && (newId !== prevId)) this.showDrover('user-details');
    },
    accessGroup: function (newGroup, prevGroup) {
      if (newGroup && (newGroup.id !== prevGroup?.id)) this.showDrover('users-with-access-details');
    },
    activeRoomId: function (newId, prevId) {
      if (newId && (newId !== prevId)) this.showDrover('room-details');
    },
    layoutStatus: function (newStatus) {
      if (newStatus !== 'blackout-screen-close') return;
      this.droverType = '';
      if (this.activeUserId || this.activeRoomId || this.accessGroupId) this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          user: undefined,
          room: undefined,
          access_group: undefined,
        },
      });
    },
  },
  created() {
    this.$store.dispatch('groups/getGroups');
    this.$store.dispatch('dictionaries/fetchRoles');
    this.$store.dispatch('dictionaries/getTimezones');
    if (this.activeUserId) this.showDrover('user-details');
  },
  methods: {
    showRemoveUsersModal(users) {
      this.usersForRemoval = users;
      this.$bvModal.show('remove_users_modal');
    },
    removeUser() {
      this.$store.dispatch('groups/removeUsersFromGroup', {
        groupId: this.activeGroupId,
        data: {
          user_ids: this.usersForRemoval,
          operation: 'unset',
          type: this.activeGroup.sub_type,
        },
      });
    },
    showDeleteModal() {
      this.groupToBeDeleted = {
        id: this.activeGroup.id,
        title: this.activeGroup.title,
      };
      this.$bvModal.show('delete_group_modal');
    },
    deleteGroup() {
      this.$store.dispatch('groups/deleteGroup', this.groupToBeDeleted.id);
    },
    cancelDeletion(id) {
      return (e, toast) => {
        closeToast(e, toast);
        this.$store.dispatch('groups/restoreGroup', id);
      };
    },
    showDrover(type) {
      this.droverType = type;
      this.$store.dispatch('layout/toggleHelper', true);
    },
    showCreateGroupDrover(parentGroup) {
      this.parentGroup = parentGroup;
      this.showDrover('group-create');
    },
    toggleMobileDrag() {
      this.isMobileGroupsDrag = !this.isMobileGroupsDrag;
    },
    changeFilters(filters) {
      this.filters = filters;
    },
  },
}
</script>