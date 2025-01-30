<template>
  <div class="roles-content-actions">
    <template v-for="action in formattedActions">
      <div class="roles-content-actions-action">
        <div class="roles-content-rights-right-title">
          <span>{{ action.title }}</span>
          <span v-if="isSetByAdmin(action)"
                class="roles-content-rights-right-title-admin">Установлено администратором</span>
        </div>
        <div class="custom-control custom-switch">
          <input v-model="actionPermissions"
                 type="checkbox"
                 class="custom-control-input"
                 :id="`permission-${action.accessPermissionId}`"
                 :value="action.accessPermissionId"
                 :disabled="!isUserPermissions && (activeRole.is_system || !userPermissions.admin.roles.edit)"
                 @change="setActionPermissions($event, action)"
          >
          <label class="custom-control-label custom-control-label-stylization" :for="`permission-${action.accessPermissionId}`"></label>
        </div>
      </div>
      <div v-if="!activeRole.is_system && !isUserPermissions && (action.code === 'user.create') && value.includes(action.accessPermissionId)"
           class="roles-content-actions-action-roles"
      >
        <div v-for="role in filteredRoles" class="custom-control custom-checkbox mb-4">
          <input v-model="availableRoles"
                 :value="role.id"
                 class="custom-control-input"
                 type="checkbox"
                 :id="`permission-role-${role.id}`"
                 @change="editAvailableRoles"
          />
          <label class="custom-control-label" :for="`permission-role-${role.id}`">{{ role.title }}</label>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: 'Actions',
  props: {
    value: Array,
    actions: Array,
    activeRole: Object,
    isUserPermissions: Boolean,
    chosenUserPermissions: Array
  },
  data() {
    return {
      availableRoles: [],
      actionPermissions: []
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    roles() {
      return this.$store.state.roles.roles;
    },
    filteredRoles() {
      if (this.activeRole.type === 'all') return this.roles;
      return this.roles.filter(role => role.type === this.activeRole.type);
    },
    formattedActions() {
      const actions = [];
      this.actions?.forEach(action => {
        if ((action.role_type === 'operator') && (this.activeRole.type !== 'operator')) return;
        if ((action.role_type === 'main') && (this.activeRole.type !== 'main')) return;
        if ((action.role_type === 'admin') && (this.activeRole.code !== 'ROLE_SUPERADMIN')) return;

        actions.push({
          ...action,
          accessPermissionId: action.variants?.find(variant => variant.code === `${action.code}.access`)?.id,
          deniedPermissionId: action.variants?.find(variant => variant.code === `${action.code}.denied`)?.id,
        });
      });
      return actions;
    }
  },
  watch: {
    activeRole: function (newRole, oldRole) {
      if (newRole.id !== oldRole.id) this.availableRoles = newRole.available_roles ? newRole.available_roles.map(role => role.id) : [];
    },
    value: function (newValue) {
      this.actionPermissions = [...newValue];
    }
  },
  created() {
    this.actionPermissions = [...this.value];
    this.availableRoles = this.activeRole.available_roles ? this.activeRole.available_roles.map(role => role.id) : [];
  },
  methods: {
    setActionPermissions(event, action) {
      let actionPermissions = this.actionPermissions.filter(permission => (permission !== action.accessPermissionId) && (permission !== action.deniedPermissionId));
      if (event.target.checked) actionPermissions.push(action.accessPermissionId);
      else actionPermissions.push(action.deniedPermissionId);
      this.$emit('input', actionPermissions);
      this.$emit('setActionPermissions');
    },
    editAvailableRoles() {
      this.$store.dispatch('roles/editRole', {id: this.activeRole.id, available_roles: this.availableRoles});
    },
    isSetByAdmin(action) {
      return this.chosenUserPermissions?.some(permission => (permission.id === action.accessPermissionId) || (permission.id === action.deniedPermissionId));
    }
  }
}
</script>