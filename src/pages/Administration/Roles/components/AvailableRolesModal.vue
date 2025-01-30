<template>
  <form class="users_add theme-helper-content-main" @submit="editRole">
    <div class="users_add-header">
      <b-button variant="outline-primary"
                size="sm"
                type="submit"
                class="users_add-header-add"
                id="users-add-submit"
      >Сохранить</b-button>
    </div>
    <h3 class="assign-operators-title mb-4"><b>Доступные роли</b></h3>

    <div class="users_add-body">

      <div class="users_add-body-search">
        <b-input-group>
          <b-input-group-text slot="append">
            <i class="fa fa-search"/>
          </b-input-group-text>
          <b-form-input v-model="searchString"
                        id="users-add-search"
                        placeholder="Поиск"
          />
        </b-input-group>
      </div>
      <div class="roles-content-rights-right-add-body-roles">
        <div v-for="currentRole in filteredRoles" class="roles-content-rights-right-add-body-roles-modal" :key="currentRole.id">
          <div class="roles-content-rights-right-add-body-roles-modal-limit">
            <div class="roles-content-rights-right-add-body-roles-modal-info">
                {{ currentRole.title }}
            </div>
            <div class="abc-checkbox -fixed users_add-body-roles-role-users-user-checkbox">
              <input v-model="visibleRoles"
                    type="checkbox"
                    :value="currentRole.id"
                    :id="'add-' + currentRole.id"
              >
              <label class="custom-control-label" :for="'add-' + currentRole.id"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import GroupUser from "@/pages/Organization/Groups/components/GroupUser";
import Select from "@/components/Common/Select/Select";
import Avatar from "@/components/Common/Avatar/Avatar";


export default {
  name: 'availableRolesModal',
  props: {
    role: Object,
  },
  components: {
    GroupUser,
    'custom-select': Select,
    Avatar,
  },
  data() {
    return {
      visibleRoles: [],
      searchString: '',
    };
  },
  computed: {
    roles() {
      return this.$store.state.roles.roles;
    },
    filteredRoles() {
      const searchStringLower = this.searchString.toLowerCase();
      return this.role.type === 'all'
          ? this.roles.filter((role) => role.title && role.title.toLowerCase().includes(searchStringLower))
          : this.roles.filter((role) => role.type === this.role.type && role.title && role.title.toLowerCase().includes(searchStringLower));
    }
  },
  watch: {
    role: function (newRole, prevRole) {
      if (newRole.visible_roles !== prevRole.visible_roles) {
        this.visibleRoles = newRole.visible_roles.map((role) => role.id);
      }
    },
  },
  created() {
    if (this.role.visible_roles) {
      this.visibleRoles = this.role.visible_roles.map((role) => role.id);
    }
  },
  methods: {
    editRole() {
      this.$store.dispatch('roles/editRole', {
        id: this.role.id,
        visible_roles: this.visibleRoles,
      });
    },
  }
}
</script>