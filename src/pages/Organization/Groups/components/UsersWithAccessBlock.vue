<template>
  <div class="users_access-body-roles-role">
    <div class="users_access-body-roles-role-main" @click="toggleCollapse">
      <b>{{ role.title }}</b>
      <div class="users_access-body-roles-role-main-actions">
        <i v-if="editPermission" class="glyphicon glyphicon-trash_alt mr-3" @click.stop="deleteRole"/>
        <i class="fa fa-angle-down angle" :class="{'-active': collapseStatus}"/>
      </div>
    </div>
    <b-collapse :visible="collapseStatus" class="users_access-body-roles-role-users">
      <div v-for="user in role.users"
           class="users_access-body-roles-role-users-user"
           :ref="`user-with-access-${user.id}`"
           :key="user.id"
      >
        <avatar class="users_access-body-roles-role-users-user-avatar"
                size="-lg"
                :url="user.smallAvatar"
                :telegram="user.telegram_connected"
                :is-fin-admin="user.is_fin_admin"
        />
        <div class="users_access-body-roles-role-users-user-info">
          <b>
            <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
            <template v-else>
              <span class="text-gray mr-1">{{ user.uid }}</span>
              <span>{{ user.fullname }}</span>
            </template>
          </b>
        </div>
        <div v-if="editPermission" class="d-flex align-items-center">
          <i class="glyphicon glyphicon-trash_alt mr-2_5" @click="deleteUser(user.id)"/>
          <div class="abc-checkbox -fixed">
            <input v-model="chosenUsers" :id="'add-' + user.id" type="checkbox" :value="user.id"/>
            <label :for="'add-' + user.id"></label>
          </div>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";

export default {
  name: 'users-with-access-block',
  props: {
    role: Object,
    editPermission: Boolean,
  },
  components: {
    Avatar,
  },
  data() {
    return {
      chosenUsers: [],
      collapseStatus: true,
    }
  },
  methods: {
    toggleCollapse() {
      this.collapseStatus = !this.collapseStatus;
    },
    deleteUser(userId) {
      this.$emit('remove-users', [userId]);
    },
    deleteRole() {
      if (!this.chosenUsers.length) return;
      this.$emit('remove-users', this.chosenUsers);
    },
    getElementTopById(id) {
      return this.$refs[`user-with-access-${id}`]?.[0]?.getBoundingClientRect()?.top;
    },
  },
}
</script>