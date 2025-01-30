<template>
  <div v-if="user" class="assign-operators-body-user">
    <div class="assign-operators-body-profile" :id="`user-${user.id}`">
      <avatar class="mr-3"
              :size="collapsesStatus ? '-lg' : '-sm'"
              :url="user.avatar"
              :telegram="user.telegram_connected"
              :is-fin-admin="user.is_fin_admin"
      />
      <div class="assign-operators-body-profile-title">
        <div class="assign-operators-body-profile-title-info">
          <div class="d-flex flex-wrap">
            <b class="text-gray mr-1">{{ user.uid }}</b>
            <div v-if="showNickname" class="d-flex align-items-center">
              <at class="mr-1"/>
              <b class="assign-operators-body-profile-title-info-name">{{ user.model_nickname }}</b>
            </div>
            <span v-else class="assign-operators-body-profile-title-info-name">{{ user.surname || user.fullname }}</span>
          </div>
          <b-collapse v-model="collapsesStatusValue" id="collapse-pairs-operator">
            <div class="assign-operators-body-profile-title-info">
              <span>{{getNumberOfShifts(user.count_workshift)}}<span v-if="showAdditionalCount && user.count_workshift_without_operator">, {{user.count_workshift_without_operator}} без оператора</span></span>
              <div v-if="groupsOperator && groupsOperator.length" class="d-flex align-center">
                <span>Доступ к группам</span>
                <b-badge v-if="groupsOperator && groupsOperator.length"
                         pill
                         variant="primary"
                         class="user_details-main-groups-badge"
                         @click="editOperatorGroups"
                >{{ groupsOperator.length }}</b-badge>
              </div>
            </div>
          </b-collapse>
        </div>
        <div v-if="showChangeButton" class="assign-operators-body-profile-edit" @click="changeUser">
          <span>Изменить</span>
          <pen />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";
import pen from "@/assets/vue-svg/pen.svg";
import at from "@/assets/vue-svg/at.svg";
import { pluralize } from "@/tools/tools";

export default {
  name: "UserProfile",
  components: {
    'avatar': Avatar,
    'pen': pen,
    'at': at,
  },
  props: {
    user: Object,
    showChangeButton: Boolean,
    showAdditionalCount: {
      type: Boolean,
      default: true
    },
    groupsOperator: Array,
    collapsesStatus: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    collapsesStatusValue: {
      get() {
        return this.collapsesStatus;
      },
      set(value) {},
    },
    showNickname() {
      return this.user.model_nickname && !this.user.surname && !this.user.fullname;
    },
  },
  methods: {
    getNumberOfShifts(shifts) {
      return Number(shifts) ? `${pluralize(shifts, ['смена', 'смены', 'смен'])}` : 'Без смен';
    },
    editOperatorGroups() {
      this.$emit('editOperatorGroups');
    },
    changeUser() {
      this.$emit('change-user');
    },
  }
}
</script>
