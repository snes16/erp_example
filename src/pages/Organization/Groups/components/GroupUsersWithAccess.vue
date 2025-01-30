<template>
  <div class="groups-main-data-blocks-access card">
    <div class="groups-main-data-blocks-access-header" @click="toggleCollapse">
      <div class="groups-main-data-blocks-access-header-main">
        <h3 class="mb-0 mr-3">Имееют доступ </h3>
        <div class="badge groups-main-data-blocks-access-header-main-badge">{{ allUsersSumText }}</div>
      </div>
      <i class="fa fa-angle-down angle" :class="{'-active': collapseStatus}"/>
    </div>
    <b-collapse :visible="collapseStatus" class="groups-main-data-blocks-access-body">
      <router-link v-for="group in formattedCounter" :to="group.route" class="groups-main-data-blocks-access-body-group">
        <div class="groups-main-data-blocks-access-body-group-info">
          <i class="flag-icon mr-1"
             :class="`flag-icon-${group.flag || 'default'}`"
             :title="group.country"
          />
          <b v-if="group.office" class="text-gray mr-1">{{ group.city }}</b>
          <b>{{ group.office || group.city || group.country }}</b>
        </div>
        <b>{{ group.users_count }}</b>
      </router-link>
    </b-collapse>
  </div>
</template>

<script>
import { findInListRecursively, pluralize } from "@/tools/tools";

export default {
  name: 'group-users-with-access',
  data() {
    return {
      collapseStatus: true,
    }
  },
  computed: {
    activeGroupId() {
      const rawId = this.$route.query.group;
      return rawId && parseInt(rawId);
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    activeGroup() {
      return findInListRecursively(this.groups, (group) => group.id === this.activeGroupId, true);
    },
    usersWithAccessCounter() {
      return this.$store.state.groups.usersWithAccessCounter;
    },
    formattedCounter() {
      const currentRoute = this.$route;
      return this.usersWithAccessCounter.map(group => ({
        ...group,
        route: {
          ...currentRoute,
          query: {
            ...currentRoute.query,
            access_group: group.id,
          },
        },
      }));
    },
    allUsersSumText() {
      const sum = this.usersWithAccessCounter.reduce((counter, group) =>  counter + group.users_count, 0);
      return pluralize(sum, ['сотрудник', 'сотрудника', 'сотрудников']);
    },
    status() {
      return this.$store.state.groups.status;
    },
    activeRoleCode() {
      return this.$route.query.role;
    },
  },
  watch: {
    activeGroupId: function (newGroupId) {
      if (newGroupId) this.getUsersCounters(newGroupId);
    },
    activeRoleCode: function (newRoleCode) {
      if (this.activeGroupId) this.getUsersCounters(this.activeGroupId, newRoleCode);
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if ((prevStatus === 'adding-users') || (prevStatus === 'removing')) this.$nextTick(() => this.getUsersCounters());
      }
    },
  },
  created() {
    if (this.activeGroupId) this.getUsersCounters();
  },
  methods: {
    toggleCollapse() {
      this.collapseStatus = !this.collapseStatus;
    },
    getUsersCounters(activeGroupId = this.activeGroupId, activeRoleCode = this.activeRoleCode) {
      this.$store.dispatch('groups/fetchUsersWithAccessCounter', {
        groupId: activeGroupId,
        query: {
          role: activeRoleCode,
        },
      });
    },
  },
}
</script>