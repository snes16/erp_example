<template>
  <div>
    <router-link :to="allUsersLink" class="groups-main-data-roles-role" :class="{'-active': !activeRole}">
      <div class="groups-main-data-roles-role-title">
        <span>Все сотрудники</span>
        <div v-if="allUsersCounter" class="groups-main-data-roles-role-title-badge">{{ allUsersCounter }}</div>
      </div>
    </router-link>
    <router-link v-for="role in formattedRoles.all"
                 :to="role.link"
                 class="groups-main-data-roles-role"
                 :class="{'-active': activeRole === role.code}"
    >
      <div class="groups-main-data-roles-role-title">
        <span>{{ role.title }}</span>
        <div v-if="usersByRoleCounter[role.code]"
             class="groups-main-data-roles-role-title-badge"
        >{{ usersByRoleCounter[role.code] }}</div>
      </div>
    </router-link>
    <router-link v-for="role in formattedRoles.main"
                 :to="role.link"
                 class="groups-main-data-roles-role"
                 :class="{'-active': activeRole === role.code}"
    >
      <div class="groups-main-data-roles-role-title">
        <span>{{ role.title }}</span>
        <div v-if="usersByRoleCounter[role.code]"
             class="groups-main-data-roles-role-title-badge"
        >{{ usersByRoleCounter[role.code] }}</div>
      </div>
    </router-link>
    <p v-if="formattedRoles.main.length && formattedRoles.operator.length" class="groups-main-data-roles-subtitle">Операторские роли</p>
    <router-link v-for="role in formattedRoles.operator"
                 :to="role.link"
                 class="groups-main-data-roles-role"
                 :class="{'-active': activeRole === role.code}"
    >
      <div class="groups-main-data-roles-role-title">
        <div class="d-flex align-items-center">
          <headset class="groups-main-data-roles-role-title-icon"/>
          <span>{{ role.title }}</span>
        </div>
        <div v-if="usersByRoleCounter[role.code]"
             class="groups-main-data-roles-role-title-badge"
        >{{ usersByRoleCounter[role.code] }}</div>
      </div>
    </router-link>
  </div>
</template>

<script>
import headset from "@/assets/vue-svg/headset.svg";

export default {
  name: 'groups-roles',
  props: {
    usersCounter: Object,
  },
  components: {
    'headset': headset,
  },
  computed: {
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    activeRole() {
      return this.$route.query.role;
    },
    activeGroupId() {
      let rawId = this.$route.query.group;
      return rawId && parseInt(rawId);
    },
    allUsersLink() {
      const currentRoute = this.$route;
      return {
        ...currentRoute,
        query: {
          ...currentRoute.query,
          role: undefined,
        },
      };
    },
    formattedRoles() {
      const formattedRoles = {
        all: [],
        main: [],
        operator: [],
      };
      const currentRoute = this.$route;
      this.roles.forEach(role => formattedRoles[role.type].push({
        ...role,
        link: {
          ...currentRoute,
          query: {
            ...currentRoute.query,
            role: role.code,
          },
        },
      }));
      return formattedRoles;
    },
    usersByRoleCounter() {
      return this.$store.state.groups.usersByRoleCounter;
    },
    allUsersCounter() {
      let counter = 0;
      for (let role in this.usersByRoleCounter) {
        counter += this.usersByRoleCounter[role];
      }
      return counter;
    },
  },
  watch: {
    activeGroupId: function (newId, prevId) {
      if (newId && (newId !== prevId)) this.$store.dispatch('groups/fetchUsersByRoleCounter', newId);
    },
  },
  created() {
    if (this.activeGroupId) this.$store.dispatch('groups/fetchUsersByRoleCounter', this.activeGroupId);
  },
}
</script>