<template>
  <div class="roles-sidebar">
    <div class="roles-sidebar-header">
      <p class="roles-sidebar-header-title">Роли</p>
      <b-button v-if="userPermissions.admin.roles.edit" variant="add" class="roles-sidebar-header-button" @click="createRole"/>
    </div>
    <ul class="roles-sidebar-links">
      <li v-for="(role, index) in roles" :key="index"
          class="roles-sidebar-links-link"
          :class="role.id === activeRole.id ? '-active' : ''"
          @click="chooseRole(role)"
      >
        <span>{{ role.title ? role.title : "Новая роль" }}</span>
        <b-badge v-if="role.user_count.active && (role.user_count.active !== '0')"
                 variant="custom"
                 class="roles-sidebar-links-link-badge"
        >{{ role.user_count.active }}</b-badge>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'Sidebar',
  props: {
    roles: Array,
    activeRole: Object,
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  methods: {
    chooseRole(role) {
      this.$emit('chooseRole', role);
    },
    createRole() {
      this.$emit('createRole');
    },
  }
}
</script>