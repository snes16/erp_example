<template>
  <div class="groups-main-data-role_picker" @click="toggleCollapse">
    <div class="groups-main-data-role_picker-main">
      <div class="groups-main-data-roles-role -active border-bottom">
        <div class="groups-main-data-roles-role-title">
          <headset v-if="activeRole.type === 'operator'" class="groups-main-data-roles-role-title-icon"/>
          <span>{{ activeRole.title }}</span>
        </div>
        <div class="groups-main-data-roles-role-actions">
          <i class="fa fa-angle-down groups-main-data-roles-role-actions-angle" :class="{'-active': collapseStatus}"/>
        </div>
      </div>
    </div>
    <div class="groups-main-data-role_picker-list card" :class="{'-active': collapseStatus}">
      <roles-list />
    </div>
  </div>
</template>

<script>
import RolesList from './GroupsRoles';
import headset from "@/assets/vue-svg/headset.svg";

export default {
  name: 'role-picker',
  components: {
    RolesList,
    'headset': headset,
  },
  data() {
    return {
      collapseStatus: false,
    };
  },
  computed: {
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    activeRoleCode() {
      return this.$route.query.role;
    },
    activeRole() {
      return this.activeRoleCode && this.roles.find(role => role.code === this.activeRoleCode) || {
        title: 'Все сотрудники',
        type: 'main',
      };
    },
  },
  methods: {
    toggleCollapse() {
      this.collapseStatus = !this.collapseStatus;
    },
  },
}
</script>