<template>
  <div class="roles-content-rights">
    <rights-block v-for="(right, key) in filteredRightsList"
                  v-model="permissions[key]"
                  :right="right"
                  :roleRights="activeRole.rights"
                  :isSystem="activeRole.is_system"
                  :key="key"
                  @updatePermission="updatePermissions"
    />
  </div>
</template>
<script>
import RightsBlock from "./RightsBlock";
import { filterListRecursively } from "@/tools/tools";

export default {
  name: 'Rights',
  components: {
    'rights-block': RightsBlock,
  },
  props: {
    rightsList: Array,
    activeRole: Object,
  },
  data() {
    return {
      permissions: [],
    }
  },
  computed: {
    filteredRightsList() {
      if (!this.rightsList?.length) return [];
      const availableFlag = this.activeRole.code === 'ROLE_MODEL' ? 'personal_model' :
          this.activeRole.code === 'ROLE_OPERATOR' ? 'personal_operator' : 'personal_employee';

      return filterListRecursively(this.rightsList, right => {
        if (right.flag && (right.flag !== availableFlag)) return false;
        switch (right.role_type) {
          case 'main': return this.activeRole.type === 'main' || this.activeRole.type === 'all';
          case 'operator': return this.activeRole.type === 'operator' || this.activeRole.type === 'all';
          case 'admin': return this.activeRole.code === 'ROLE_SUPERADMIN';
        }
        return true;
        },
          false, 'variants'
      );
    },
  },
  methods: {
    updatePermissions() {
      if (this.activeRole.id) this.$store.dispatch('roles/editRole', {
        id: this.activeRole.id,
        rights: this.permissions.flat()
      });
    },
  }
}
</script>
