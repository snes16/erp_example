<template>
  <div class="ref_system_models-main-block">
    <div class="ref_system_models-main-block-title"
         :class="mainCollapseStatus ? '-active' : {'-unbordered' : type === 'trainer'}"
         @click="toggleMainCollapse">
      <div class="d-flex align-items-center">
        <h4 class="mb-0 mr-2">{{ title }}</h4>
        <div class="profile_main-card-header-title-badge mr-2">{{ usersQuantity }}</div>
        <div class="btn btn-add" @click="add"/>
      </div>
      <i v-if="isAnyUsers" class="fa fa-angle-down angle" :class="{'-active': mainCollapseStatus}"/>
    </div>
    <b-collapse v-if="users" :visible="mainCollapseStatus">
      <div v-for="group in formattedGroups" class="ref_system_models-main-block-group">
        <div class="ref_system_models-main-block-group-title" :class="{'-active': !groupCollapseReverseStatuses[group.id]}" @click="toggleGroupCollapse(group.id)">
          <div class="d-flex align-items-center">
            <i class="color_icon mr-3" :style="`background-color: ${group.color || 'red'}`"/>
            <div v-if="!group.parentTitle" class="ref_system_models-main-block-group-title-groups">
              <b class="mr-1">{{ group.city || group.country || group.title }}</b>
              <b v-if="group.office" class="text-gray mr-2">{{ group.office || group.title }}</b>
            </div>
            <div v-else class="ref_system_models-main-block-group-title-groups">
              <b class="mr-1">{{ group.parentTitle || group.title }}</b>
              <b v-if="group.parentTitle" class="text-gray-text">{{ group.title }}</b>
            </div>
          </div>
          <div>
            <label :for="`ref_system_models-${type}-group-${group.id}`"
                   class="ref_system_models-main-block-group-title-percentages mr-3"
            >
              <input v-autowidth="{maxWidth: '100%', minWidth: '5px', comfortZone: 0}"
                     :id="`ref_system_models-${type}-group-${group.id}`"
                     class="ref_system_models-main-block-group-title-percentages-input"
                     type="number"
                     :placeholder="groupsInputsPlaceholders[group.id]"
                     @click.stop
                     @input="validateField"
                     @change="editGroupPercentages($event, group.id)"
              />
              <span class="ref_system_models-main-block-group-title-percentages-symbol">%</span>
            </label>
            <i class="fa fa-angle-down angle" :class="{'-active': !groupCollapseReverseStatuses[group.id]}"/>
          </div>
        </div>
        <b-collapse :visible="!groupCollapseReverseStatuses[group.id]">
          <div v-for="user in users[group.id]"
               class="ref_system_models-main-block-group-users-user"
               :ref="`user-with-access-${user.id}`"
               :key="user.id"
          >
            <avatar class="ref_system_models-main-block-group-users-user-avatar"
                    size="-lg"
                    :url="user.avatar"
                    :telegram="user.telegram_connected"
                    :is-fin-admin="user.is_fin_admin"
            />
            <div class="ref_system_models-main-block-group-users-user-info">
              <b>
                <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                <template v-else>
                  <span class="text-gray mr-1">{{ user.uid }}</span>
                  <span>{{ user.fullname }}</span>
                </template>
              </b>
            </div>
            <div class="d-flex align-items-center">
              <label :for="`ref_system_models-${type}-model-${user.id}`"
                     class="ref_system_models-main-block-group-users-user-percentages"
              >
                <input :value="user.ref_system_percentages || ''"
                       v-autowidth="{maxWidth: '100%', minWidth: '5px', comfortZone: 0}"
                       :id="`ref_system_models-${type}-model-${user.id}`"
                       class="ref_system_models-main-block-group-users-user-percentages-input"
                       placeholder="Укажите"
                       type="number"
                       step="0.01"
                       max="100"
                       min="0"
                       @click.stop
                       @input="validateField"
                       @change="editUserPercentages($event, user.id, user.ref_system_percentages)"
                />
                <span class="ref_system_models-main-block-group-users-user-percentages-symbol"
                      :class="{'-active': !!user.ref_system_percentages}"
                >%</span>
              </label>
              <i class="glyphicon glyphicon-trash_alt cursor-pointer" @click="deleteUser(group.id, user.id)"/>
            </div>
          </div>
        </b-collapse>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";
import {findInListRecursivelyWithParent} from "@/tools/tools";

export default {
  name: 'ref-system-models-view-block',
  props: {
    users: Object,
    title: String,
    type: String,
    userId: Number,
  },
  components: {
    Avatar,
  },
  data() {
    return {
      mainCollapseStatus: false,
      groupCollapseReverseStatuses: {},
      userPercentages: {}
    }
  },
  computed: {
    status() {
      return this.$store.state.profile.status;
    },
    refStatus() {
      return this.$store.state.profile.refStatus;
    },
    usersQuantity() {
      return this.users
          ? Object.values(this.users).reduce((total, arr) => total + arr.length, 0)
          : 0;
    },
    allGroups() {
      return this.$store.state.dictionaries.groupsNonSystem;
    },
    formattedGroups() {
      const groups = [];
      if (!this.users) return groups;
      for (const groupId in this.users) {
        let foundGroup = findInListRecursivelyWithParent(this.allGroups, group => group.id === parseInt(groupId), false, 0, null);
        const parentTitle = foundGroup?.parent?.title;
        if (foundGroup) {
          foundGroup = {
            ...foundGroup,
            parentTitle: parentTitle,
          };
        }
        if (foundGroup && this.users[foundGroup.id]) {
          groups.push(foundGroup);
        }
      }
      return groups;
    },
    groupsInputsPlaceholders() {
      const groupsInputsPlaceholders = {};
      if (!this.users) return groupsInputsPlaceholders;
      for (const groupId in this.users) {
        const extremes = this.users[groupId].reduce((result, user) => user.ref_system_percentages ? {
          max: user.ref_system_percentages > result.max ? user.ref_system_percentages : result.max,
          min: user.ref_system_percentages < result.min ? user.ref_system_percentages : result.min,
        } : result, {max: this.users[groupId][0].ref_system_percentages, min: this.users[groupId][0].ref_system_percentages});
        groupsInputsPlaceholders[groupId] = extremes.max ? (extremes.max === extremes.min ? extremes.max : `${extremes.min}-${extremes.max}`) : 'Укажите';
      }
      return groupsInputsPlaceholders;
    },
    isAnyUsers() {
      if (!this.users) return false;
      return Object.keys(this.users).length;
    },
  },
  methods: {
    add() {
      this.$emit('add', this.type);
    },
    filterGroups(groups, filteredGroups) {
      groups.forEach(group => {
        filteredGroups.push(group);
        if (group.children?.length) this.filterGroups(group.children, filteredGroups);
      });
    },
    toggleMainCollapse() {
      this.mainCollapseStatus = !this.mainCollapseStatus;
    },
    toggleGroupCollapse(groupId) {
      this.$set(this.groupCollapseReverseStatuses, groupId, !this.groupCollapseReverseStatuses[groupId]);
    },
    async editGroupPercentages(e, groupId) {
      await this.$store.dispatch('profile/editRefSystemConnectedUsersPercentages', {
        userId: this.userId,
        data: {
          ref_system_percentages: e.target.value,
          users: this.users[groupId].map(user => user.id),
          type: this.type,
        }
      });
      e.target.value = '';
    },
    editUserPercentages(e, userId) {
      this.$store.dispatch('profile/editRefSystemConnectedUsersPercentages', {
        userId: this.userId,
        data: {
          ref_system_percentages: e.target.value,
          users: [userId],
          type: this.type,
        }
      });
    },
    validateField(e, userId, prevValue) {
      const newValue = parseFloat(e.target.value);
      if (isNaN(newValue) || newValue < 0 || newValue > 100)
        e.target.value = prevValue;
    },
    deleteUser(groupId, refUserId) {
      if (this.refStatus === 'deleting-refs') return;
      this.$store.dispatch('profile/deleteRefSystemConnectedUsers', {
        userId: this.userId,
        type: this.type,
        groupId,
        refUserId,
      });
    },
  }
}
</script>