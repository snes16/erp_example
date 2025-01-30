<template>
  <div class="add_groups">
    <div class="add_groups-header">
      <button-throbber v-if="groupEditPermissions"
                       variant="outline-primary"
                       color-throbber="primary"
                       size="sm"
                       :class="isLoading ? 'group_settings-error-header-primary_borders' : ''"
                       :loading="isLoading"
                       @click="saveGroups">
        Сохранить
      </button-throbber>
    </div>
    <div v-if="backButton" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>{{ backButton }}</span>
      </div>
    </div>
    <div v-if="isOnlyHomeGroup" class="pt-3 pr-4 pl-4 pb-2"><h4 class="mb-0">Выбрать основную группу</h4></div>
    <div class="add_groups-body">
      <h3 v-if="title" class="add_groups-body-title">{{title}}</h3>
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
      <add-group-item v-for="group in filteredGroups"
                      :group="group"
                      :key="`group-item-${group.id}`"
                      :currentGroups="activeGroups"
                      :showOnly="!groupEditPermissions"
                      :changedMainGroup="changedMainGroup"
                      :editOperatorGroups="editOperatorGroups"
                      :onlyEditOffices="onlyEditOffices"
                      :chosenGroup="chosenGroup"
                      :is-only-home-group="isOnlyHomeGroup"
                      :is-operator="userType === 'operator'"
                      @toggleGroup="toggleGroup"
                      @updateMainGroup="updateMainGroup"
                      @setSingleGroup="updateMainGroup"
                      @changeChosenGroup="changeChosenGroup"
      />
    </div>
    <b-modal id="save_offices"
             centered
             title="Сохранить измененные данные?"
             body-bg-variant="white"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" @click="closeModal">Отменить</b-button>
        <b-button variant="primary" @click="saveGroups"><span >Сохранить</span></b-button>
      </template>
      Измененные данные могут не сохраниться, подтвердите сохранение
    </b-modal>
    <b-modal id="unfinished_shifts"
             centered
             title="У модели есть незавершенные смены, отменить их?"
             body-bg-variant="white"
             :no-close-on-backdrop="statusWorkshift === 'deleting-shifts'"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" @click="closeModalShifts">Вернуться назад</b-button>
        <b-button variant="primary" class="throbber-button" :disabled="statusWorkshift === 'deleting-shifts'" @click="deleteUnfinishedShifts">
          <div v-if="statusWorkshift === 'deleting-shifts'" class="throbber-button-block">
            <throbber class="throbber -button -button-white -button-larger"/>
          </div>
          <span :class="{ 'text-inherit': statusWorkshift === 'deleting-shifts' }">Отменить смены</span>
        </b-button>
      </template>
      Что бы исключить модель из группы, нужно отменить незавершенные смены
    </b-modal>
  </div>
</template>

<script>
import AddGroupItem from "./AddGroupItem";
import {filterListRecursively, getTypeEditUser} from "@/tools/tools";
import throbber from "@/assets/vue-svg/throbber.svg";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import search from "@/assets/vue-svg/search.svg";

export default {
  name: 'add-group',
  props: {
    currentGroups: Array,
    userId: [Number, String],
    backButton: String,
    showGroupsForOperator: Boolean,
    isGroupDeactivationPage: Boolean,
    isProfilePage: Boolean,
    isOnlyHomeGroup: Boolean,
    userCreate: Boolean,
    title: String,
    newUser: Boolean,
    isOperator: Boolean,
    // showOnly: Boolean,
    currentMainGroupId: Number,
    role: Object,
  },
  components: {
    ButtonThrobber,
    'add-group-item': AddGroupItem,
    'throbber': throbber,
    'search': search,
  },
  data() {
    return {
      searchString: '',
      activeGroups: [],
      changedMainGroup: null,
      activeOperatorsGroups: [],
      isChangedGroup: false,
      chosenGroup: null,
    }
  },
  computed: {
    groups() {
      return this.$store.state.dictionaries.groupsNonSystem;
    },
    status() {
      return this.$store.state.users.status;
    },
    statusWorkshift() {
      return this.$store.state.schedule.status;
    },
    errorMessage() {
      return this.$store.state.users.errorMessage;
    },
    isLoading() {
      return this.status === 'editing-groups' ? true : false;
    },
    fieldsErrors() {
      return this.$store.state.users.fieldsErrors;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    profile() {
      if (this.userCreate) return {};
      return this.isProfilePage ? this.$store.getters["profile/profile"](this.userId) : this.$store.getters["profile/shortProfile"](this.userId)?.user || {};
    },
    allCurrentGroups() {
      if (this.userCreate) return this.currentGroups;
      if (!this.isProfilePage) {
        if ((this.roleType === 'operator') && !this.showGroupsForOperator) return this.profile?.operator_groups?.map(group => group.id) || [];
        return this.profile?.groups?.map(group => group.id) || [];
      }
      return (this.currentGroups?.length) ? this.currentGroups : this.profile?.profile[this.groupsFieldName]?.map(group => group.id) || [];
      // return ((this.profile?.role?.code === 'ROLE_OPERATOR') && !this.showGroupsForOperator) ? (this.profile.profile?.operator_groups?.map(group => group.id) || []) : this.profile.profile?.groups?.map(group => group.id) || [];
    },
    groupEditPermissions() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].group.edit;
    },
    isMyProfile() {
      return this.$store.state.auth.user.id === this.profile?.profile?.user?.id;
    },
    mainGroupId() {
      return this.currentMainGroupId || (this.isProfilePage ? this.profile?.profile?.user?.main_group?.id : this.profile?.main_group?.id) || null;
    },
    userType() {
      if (this.isOperator) return 'operator';
      switch (this.profile.role?.code || this.role?.code) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
      }
      return 'employee';
    },
    roleType() {
      return this.profile?.role?.type || this.role?.type;
    },
    editOperatorGroups() {
      return (this.roleType === 'operator') && !this.showGroupsForOperator;
    },
    groupsFieldName() {
      return this.editOperatorGroups ? 'operator_groups' : 'groups';
    },
    formattedGroups() {
      if (!this.groups?.length) return [];
      if ((this.editOperatorGroups && (this.userType === 'operator')) || !this.activeGroups.length) return this.groups;
      return this.formatGroups(this.groups);
    },
    filteredGroups() {
      return filterListRecursively(this.formattedGroups, this.filterRule);
    },
    operatorGroupsAccess() {
      return this.isProfilePage ? this.profile?.profile?.user.has_group_operator_access : this.profile?.has_group_operator_access;
    },
    onlyEditOffices() {
      return (this.userType === 'operator') || ((this.roleType === 'operator') && !this.editOperatorGroups);
    },
  },
  watch: {
    status: function (newStatus, prevState) {
      if (newStatus === 'error-unfinished-shift') this.$bvModal.show('unfinished_shifts')
      else if (newStatus === 'error-groups') {
        if (this.errorMessage || this.fieldsErrors?.length) this.$toasted.error(this.fieldsErrors && this.fieldsErrors[0]?.message || this.errorMessage, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
      }
      else if ((prevState === 'editing-groups') && (newStatus === '')) this.$emit('clickBack');
    },
    statusWorkshift: function (newStatus) {
      if (newStatus === 'deleted-shifts') {
        this.$bvModal.hide('unfinished_shifts')
        this.saveGroups()
      }
      else if (newStatus === 'error') {
        this.$toasted.error('Ошибка', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
      }
    },
    allCurrentGroups: function (newGroups) {
      this.activeGroups = [...newGroups];
    }
  },
  created() {
    this.$store.dispatch('dictionaries/getGroupsNonSystem');
    this.activeGroups = [...this.allCurrentGroups];
    this.changedMainGroup = this.mainGroupId;
  },
  methods: {
    saveGroups() {
      const groups = ((this.userType === 'operator') && !this.showGroupsForOperator) ? [this.changedMainGroup] : this.activeGroups;
      if (this.newUser) return this.$emit('save', {
        [this.groupsFieldName]: groups,
        main_group: this.changedMainGroup,
      });
      if (this.status === 'editing-groups') return;
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}Groups`, {
        id: this.userId,
        [this.groupsFieldName]: groups,
        main_group: this.changedMainGroup
      });
    },
    deleteUnfinishedShifts() {
      this.$store.dispatch('schedule/deleteUnfinishedShifts', {
        model: this.userId,
        groups: this.allCurrentGroups.filter(group => !this.activeGroups.includes(group))
      })
    },
    filterRule(group) {
      return (!this.searchString || group.title.toLowerCase().includes(this.searchString.toLowerCase())) &&
          ((this.roleType !== 'operator') ?
                  (this.operatorGroupsAccess ? true : (group.sub_type !== 'operator')) :
                  (this.showGroupsForOperator ? ((group.type === 'office') && (group.sub_type !== 'operator')) :
                          this.userType === 'operator' ? (group.sub_type === 'operator') : (group.sub_type !== 'model')
                  )
          );
    },
    clickBack() {
      if (this.isChangedGroup) this.$bvModal.show('save_offices')
      else this.$emit('clickBack');
    },
    updateMainGroup(groupId) {
      this.changedMainGroup = groupId;
      if (!this.activeGroups.includes(groupId)) this.activeGroups = [...this.activeGroups, groupId];
    },
    toggleGroup(group) {
      this.isChangedGroup = true;
      let newActiveGroups = [],
          groupsIds = this.getChildrenIds(group);

      if (this.activeGroups.includes(group.id)) newActiveGroups = this.activeGroups.filter(currentGroupId => !groupsIds.includes(currentGroupId) || (currentGroupId === this.changedMainGroup));
      else {
        groupsIds = groupsIds.filter(currentGroupId => !this.activeGroups.includes(currentGroupId));
        newActiveGroups = [...this.activeGroups, ...groupsIds];
      }

      this.activeGroups = newActiveGroups;
    },
    getChildrenIds(group) {
      let result = group.children?.length ? group.children.flatMap(this.getChildrenIds) : [];
      result.push(group.id);
      return result;
    },
    /*saveModal() {
      this.saveGroups();
    },*/
    closeModal() {
      this.$bvModal.hide('save_offices')
      this.$emit('clickBack');
    },
    closeModalShifts() {
      this.$bvModal.hide('unfinished_shifts')
    },
    changeChosenGroup(groupId) {
      this.chosenGroup = groupId;
    },
    formatGroups(groups) {
      return groups.map(group => {
        const children = group.children?.length && this.formatGroups(group.children),
            numberOfActiveChildren = children?.length ? children.reduce((sum, child) => sum + child.numberOfActiveChildren + (this.activeGroups.includes(child.id) ? 1 : 0), 0) : 0;

        return {
          ...group,
          children,
          numberOfActiveChildren,
        }
      });
    },
  }
}
</script>
