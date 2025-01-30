<template>
  <div class="roles-content-rights-right">
    <div class="roles-content-rights-right-title" @click="toggleCollapse">
      <i class="fa fa-angle-down angle mr-2" :class="{'-active': collapseState, '-hidden': !subPermissionsList.length}"/>
      <b>{{ right.title }}</b>
      <span
          v-if="isUserPermissions && rolePermissions && !rolePermissions.includes(mainPermission) && value && value.includes(mainPermission)"
          class="roles-content-rights-right-title-admin">Установлено администратором</span>
    </div>
    <div v-if="right.variants.length === 2" class="custom-control custom-switch">
      <input v-model="mainPermissionCheckbox"
             type="checkbox"
             class="custom-control-input"
             :id="right.id"
             :value="right.id"
             :disabled="isDisabledInterface"
             @change="changeMainPermission"
      >
      <label class="custom-control-label custom-control-label-stylization" :for="right.id"></label>
    </div>
    <custom-select v-else
                   v-model="mainPermission"
                   class="roles-content-rights-right-select"
                   valueField="id"
                   titleField="title"
                   defaultText="Нет доступа"
                   :options="right.variants"
                   :disabled="isDisabledInterface"
                   @change="changeMainPermission"
    />
    <b-collapse v-if="subPermissionsList.length"
                :visible="collapseState"
                class="roles-content-rights-right-subpermissions"
    >
      <div class="roles-content-rights-right-subpermissions-content">
        <div class="roles-content-rights-right-subpermissions-checkbox"
             v-for="(subPermission, key) in subPermissionsList" :key="key">
          <div class="roles-content-rights-right-title">
            <span>{{ subPermission.title }}</span>
            <span
                v-if="isUserPermissions && rolePermissions && !rolePermissions.includes(subPermissions[subPermission.id]) && subPermissions[subPermission.id] && value && value.includes(subPermissions[subPermission.id])"
                class="roles-content-rights-right-title-admin">Установлено администратором</span>
          </div>
          <custom-select v-model="subPermissions[subPermission.id]"
                         class="roles-content-rights-right-select"
                         valueField="id"
                         titleField="title"
                         defaultText="Нет доступа"
                         :options="subPermission.variants"
                         :disabled="isDisabledInterface"
                         @change="changeSubPermissions"
          />
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";

export default {
  name: 'rights-block',
  props: {
    value: Array,
    right: Object,
    roleRights: Array,
    isSystem: Boolean,
    isUserPermissions: Boolean,
    rolePermissions: Array,
    chosenUserPermissions: Array
  },
  components: {
    'custom-select': Select
  },
  data() {
    return {
      mainPermission: null,
      subPermissions: {},
      collapseState: false,
    }
  },
  computed: {
    isDisabledInterface() {
      return !this.isUserPermissions && (this.isSystem || !this.userPermissions.admin.roles.edit)
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    subPermissionsList() {
      if (!this.right || !this.mainPermission) return [];
      return this.right?.variants?.find(variant => variant.id === this.mainPermission)?.variants || [];
    },
    mainPermissionCheckbox: {
      get() {
        return this.mainPermission && !this.right?.variants?.find(variant => variant.id === this.mainPermission).code.includes('.denied');
      },
      set(value) {
        this.mainPermission = this.right.variants[value ? 0 : 1].id;
      }
    }
  },
  watch: {
    roleRights: function (newRights) {
      this.fillPermissions(newRights);
    },
    chosenUserPermissions(newPermissions) {
      this.fillPermissions(this.roleRights, newPermissions);
    },
  },
  created() {
    if (this.roleRights?.length) this.fillPermissions(this.roleRights);
  },
  methods: {
    fillPermissions(rights, userPermissions = this.chosenUserPermissions) {
      if (this.isUserPermissions) return this.fillPermissionsForUser(rights, userPermissions);
      let right = rights.find(currentRight => currentRight.id === this.right.id);
      if (right?.variants[0].id) {
        this.mainPermission = right.variants[0].id;
        let subPermissions = {};
        right.variants[0].variants.forEach(subPermission => {
          if (!subPermission?.variants[0]?.id) return subPermissions[subPermission.id] = subPermission.id;
          subPermissions[subPermission.id] = subPermission.variants[0].id;
        });
        this.subPermissions = subPermissions;
      } else {
        this.mainPermission = null;
        this.subPermissions = {};
      }
      this.$emit('input', this.mainPermission ? [this.mainPermission, ...Object.values(this.subPermissions).filter(subPermission => subPermission)] : []);
    },
    fillPermissionsForUser(rights, userPermissions) {
      let chosenVariant = this.right.variants.find(variant => userPermissions.some(userPermission => variant.id === userPermission.id));
      let right = chosenVariant ? {
        id: this.right.id,
        variants: [chosenVariant]
      } : rights.find(currentRight => currentRight.id === this.right.id);
      if (right?.variants[0]?.id) {
        this.mainPermission = right.variants[0].id;
        let subPermissions = {};
        right.variants[0].variants.forEach(subPermission => {
          if (!subPermission?.variants[0]?.id) return subPermissions[subPermission.id] = subPermission.id;
          subPermissions[subPermission.id] = subPermission.variants.length === 1 ? subPermission.variants[0].id : null;
          // subPermissions[subPermission.id] = null;
        });
        this.right.variants.find(variant => variant.id === right.variants[0].id).variants.forEach(subPermission => {
          subPermission.variants.forEach(subPermissionVariant => {
            userPermissions.some(userPermission => {
              if (userPermission.id === subPermissionVariant.id) {
                subPermissions[subPermission.id] = subPermissionVariant.id;
                return true;
              }
            });
          })
        });
        this.subPermissions = subPermissions;
      } else {
        this.mainPermission = null;
        this.subPermissions = {};
      }
      this.$emit('input', this.mainPermission ? [this.mainPermission, ...Object.values(this.subPermissions).filter(subPermission => subPermission)] : []);
    },
    changeMainPermission() {
      let variant = this.right.variants.find(currentVariant => currentVariant.id === this.mainPermission);
      if (this.isUserPermissions) {
        let subPermissions = {};
        this.right.variants?.forEach(variant => {
          variant.variants?.forEach((subPermission) => {
            subPermissions[subPermission.id] = subPermission.variants.find(variant => variant.title === "Нет доступа")?.id;
          })
        });
        this.subPermissions = subPermissions;
      } else this.subPermissions = {}
      this.$emit('input', this.mainPermission ? [this.mainPermission, ...Object.values(this.subPermissions).filter(subPermission => subPermission)] : []);
      this.$emit('updatePermission');
    },
    changeSubPermissions() {
      this.$emit('input', [this.mainPermission, ...Object.values(this.subPermissions).filter(subPermission => subPermission)]);
      this.$emit('updatePermission');
    },
    toggleCollapse() {
      this.collapseState = !this.collapseState;
    },
  }
}
</script>
