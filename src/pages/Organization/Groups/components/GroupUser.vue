<template>
  <div class="groups-main-data-blocks-main-collapse-users-group-user">
    <component :is="userLink ? 'router-link' : 'div'"
               :to="userLink"
               class="groups-main-data-blocks-main-collapse-users-group-user-data"
    >
      <avatar class="mr-3"
              size="-lg"
              :url="user.avatar"
              :telegram="user.telegram_connected"
              :is-fin-admin="user.is_fin_admin"
      />
      <div>
        <p class="text-gray mb-0">{{ user.role.title }}<span v-if="user.position" class="ml-1">• {{ user.position.title }}</span></p>
        <div class="d-flex align-items-center">
          <b class="text-nowrap">
            <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
            <template v-else>
              <span class="text-gray mr-1">{{ user.uid }}</span>
              <span>{{ user.fullname }}</span>
            </template>
          </b>
          <user-resign-icon v-if="user.resign_date" :user="user" :id="`resign_info-${user.id}`" />
          <i v-else-if="user.blocked"
             class="glyphicon-blocked"
             v-b-tooltip.hover
             title="Сотрудник заблокирован"
          />
          <template v-if="user.new_model">
            <i class="glyphicon glyphicon-new_model flex-shrink-0 ml-2" :id="`new-user-organization-${user.id}`"/>
            <b-tooltip :target="`new-user-organization-${user.id}`" triggers="hover" placement="top">
              <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
            </b-tooltip>
          </template>
          <div v-if="user.is_solo" class="solo ml-2">Соло</div>
        </div>
        <span v-if="user.main_group" class="d-flex align-items-center">
          <i class="flag-icon mr-1"
             :class="`flag-icon-${user.main_group.flag || 'default'}`"
             :title="user.main_group.country"
          />
          <span class="text-gray mr-1">{{ user.main_group.city || user.main_group.country }}</span>
          <span>{{ user.main_group.office }}</span>
        </span>
        <div v-if="user.model_nickname" class="d-flex align-items-center">
          <at class="mr-1"/>
          <b>{{ user.model_nickname }}</b>
        </div>
      </div>
    </component>
    <div v-if="deletable" class="d-flex align-items-center">
      <i class="glyphicon glyphicon-trash_alt mr-2_5" @click="onClickDelete"/>
      <div class="abc-checkbox -fixed">
        <input v-model="checkedStatus"
               :id="`main-user-delete-id-${ user.id }`"
               :value="user.id"
               type="checkbox"
        />
        <label :for="`main-user-delete-id-${ user.id }`"/>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";
import UserResignIcon from "@/components/Common/UserResignIcon";
import at from "@/assets/vue-svg/at.svg";

export default {
  name: 'group-user',
  props: {
    value: Array,
    user: Object,
    deletable: Boolean,
  },
  components: {
    Avatar,
    UserResignIcon,
    'at': at,
  },
  computed: {
    checkedStatus: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
        this.$emit('change', value);
      },
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    userLink() {
      const roleCode = this.user?.role?.code;
      if (!this.userPermissions[roleCode === 'ROLE_MODEL' ? 'model' : (roleCode === 'ROLE_OPERATOR' ? 'operator' : 'employee')].profile.view) return null;
      const currentRoute = this.$route;
      return {
        ...currentRoute,
        query: {
          ...currentRoute.query,
          user: this.user.id,
        },
      };
    },
  },
  methods: {
    onClickDelete() {
      this.$emit('delete');
    },
  },
}
</script>