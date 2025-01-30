<template>
  <div v-if="staffLength || modelsWorkshiftsLength || childrenLength" class="group_settings-error">
    <div class="group_settings-error-header">
      <div class="group_settings-error-header-mark">
        <div class="group_settings-error-header-mark-cell">Ошибка</div>
      </div>
      <h3 class="group_settings-error-header-title">
        Деактивация группы «{{ group.build_group.office || group.build_group.city || group.build_group.country }}»
      </h3>
    </div>
    <div v-if="modelsWorkshiftsLength" class="group_settings-error-block">
      <div class="group_settings-error-block-header">
        <h4 class="group_settings-error-block-header-title">Отменить смену</h4>
      </div>
      <div v-for="shift in deactivationInfo.models_workshifts" class="group_settings-error-block-list" :key="shift.id">
        <avatar class="-xs"
                :url="shift.user.avatar"
                :telegram="shift.user.telegram_connected"
                :is-fin-admin="shift.user.is_fin_admin"
        />
          <div class="group_settings-error-block-list-fullname">
            <b>
              <template v-if="!user.uid || !user.fullname">
                <span>{{ shift.user.fullname || shift.user.uid }}</span>
              </template>
              <template v-else>
                <span>{{ shift.user.fullname }}</span>
              </template>
            </b>
          <div class="group_settings-error-block-list-fullname-workshift">
            <span class="group_settings-error-text-region_text mr-2">{{ moment(shift.period_date).format("DD.MM.YYYY") }}</span>
            <span class="group_settings-error-text-region_text">{{shift.planned_start_at}}-{{shift.planned_end_at}}</span>
          </div>
        </div>
        <div class="group_settings-error-block-list-indication"
             :class="`-${shift.status}`"> {{ workshiftStatuses[shift.status] }}</div>
        <custom-select v-model="selectedCancellationReasons[shift.id]"
                       :options="cancellationReasons"
                       class="group_settings-error-block-list-select -white -alt"
                       :id="`workshifts-${shift.id}`"
                       :error="resignReasonError"
                       defaultText="Выбрать причину"
                       value-field="id"
        />
        <div @click="showCancelModal(shift)" :id="'resign-' + shift.id" class="group_settings-error-block-list-cancell glyphicon-fired"></div>
        <b-tooltip :target="'resign-' + shift.id" placement="bottom">
          <div class="group_settings-error-block-list-tooltip">Отменить смену</div>
        </b-tooltip>
      </div>
    </div>
    <div v-if="staffLength" class="group_settings-error-block">
      <div class="group_settings-error-block-header">
        <h4 class="group_settings-error-block-header-title">Изменить основную группу</h4>
      </div>
      <div v-for="user in deactivationInfo.staff" class="group_settings-error-block-list" :key="user.id">
        <avatar class="-xs"
                :url="user.avatar"
                :telegram="user.telegram_connected"
                :is-fin-admin="user.is_fin_admin"
        />
        <div class="group_settings-error-block-list-fullname-group">
          <b>
            <template v-if="!user.uid || !user.fullname">
              <span>{{ user.uid || user.fullname }}</span>
            </template>
            <template v-else>
              <span>{{ user.fullname }}</span>
            </template>
          </b>
          <div v-if="user.main_group" class="d-flex align-items-center">
            <i class="group_settings-error-block-list-flag flag-icon mr-1"
               :class="`flag-icon-${user.main_group.flag || 'default'}`"
               :title="user.main_group.country"
            />
            <span class="group_settings-error-text-region_text mr-1">{{ user.main_group.city || user.main_group.country }}</span>
            <span class="group_settings-error-text-region_text-office">{{ user.main_group.office }}</span>
          </div>
        </div>
        <span class="group_settings-error-block-list-group_button" @click="changeMainGroup(user)">
          <span class="group_settings-error-block-list-group_button-text">Изменить группу</span>
          <pen class="ml-1"/>
        </span>
        <resign-user class="group_settings-error-block-list-resign_user cursor-pointer" @click="activeUser(user)"
                     v-b-modal.resign_modal />
      </div>
    </div>
    <div v-if="childrenLength" class="group_settings-error-block">
      <div class="group_settings-error-block-header">
        <h4 class="group_settings-error-block-header-title">Деактивировать группу</h4>
      </div>
      <div v-for="item in formattedGroups" class="group_settings-error-block-list" :key="item.id">
        <div class="group_settings-error-block-list-group">
          <div class="d-flex align-items-center">
            <i class="flag-icon mr-1"
               :class="`flag-icon-${group.build_group.flag || 'default'}`"
            />
            <span v-if="item.type === 'office'" class="group_settings-error-text text-gray mr-1">{{ item.build_group.city}}</span>
            <span class="group_settings-error-text overflow-hidden text-ellipsis">{{ item.title }}</span>
          </div>
        </div>
        <span class="group_settings-error-block-list-deactivation_button ml-2" @click="deactivateChild(item)">Деактивировать <deactivation class="ml-2"/></span>
      </div>
    </div>
    <b-modal id="cancel_shift"
             centered
             hide-header-close
             :title="`Вы точно хотите отменить выбранную смену?`"
             body-bg-variant="white"
             header-class="group_settings-error-cancellation_modal-header"
             body-class="group_settings-error-cancellation_modal-body"
             footer-class="group_settings-error-cancellation_modal-footer"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" class="group_settings-error-cancellation_modal-footer cancel m-0" @click="$bvModal.hide('cancel_shift')">Назад</b-button>
        <b-button variant="danger" class="throbber-button group_settings-error-button mt-0 mb-0 mr-0" @click="cancelShift">
          <div v-if="isCancelLoading" class="throbber-button-block">
            <throbber class="throbber -button -button-white -button-larger"/>
          </div>
          <span :class="{ 'text-inherit': isCancelLoading }">Применить</span>
        </b-button>
      </template>
      <span class="group_settings-error-text">{{this.cancelShiftText}}</span>
    </b-modal>
  </div>
</template>
<script>
import moment from 'moment';
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";
import {showToast} from "@/tools/tools";
import throbber from "@/assets/vue-svg/throbber.svg";
import resignUser from "@/assets/vue-svg/resign-user.svg";
import pen from "@/assets/vue-svg/pen.svg";
import deactivation from "@/assets/vue-svg/deactivation.svg"
import Avatar from "@/components/Common/Avatar/Avatar.vue";

export default {
  name: 'deactivation-group',
  components: {
    Avatar,
    'date-picker': DatePicker,
    'custom-select': Select,
    'resign-user': resignUser,
    'throbber': throbber,
    'pen': pen,
    'deactivation': deactivation,
  },
  props: {
    group: Object,
  },
  data() {
    return {
      moment: moment,
      settings: {psych_enabled: false, video_enabled: false, min_shifts: 4, work_shift: []},
      selectedCancellationReasons: {},
      activeProfile: {},
      title: this.group.title,
      color: this.group.color,
      userId: null,
      user: {},
      activeShift: {},
      resignReasonError: null,
      cancellationReason: null,
    }
  },
  computed: {
    status() {
      return this.$store.state.groups.status;
    },
    cancelShiftText() {
      if (this.activeShift.id) {
        return `Смена ${this.activeShift?.user?.fullname} ${this.activeShift?.period_date} ${this.activeShift?.planned_start_at}-${this.activeShift?.planned_end_at} будет отменена с указанием причины «${this.cancellationReasons[this.selectedCancellationReasons[this.activeShift.id]]}».`;
      }
    },
    workshiftStatus() {
      return this.$store.state.schedule.status;
    },
    isCancelLoading() {
      if ( this.workshiftStatus === 'canceling' )
        return true;
    },
    childrenLength() {
      return this.deactivationInfo?.children?.length;
    },
    modelsWorkshiftsLength() {
      return this.deactivationInfo?.models_workshifts?.length;
    },
    staffLength() {
      return this.deactivationInfo?.staff?.length;
    },
    deactivationInfo() {
      return this.$store.state.groups.deactivationInfo;
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    formattedGroups() {
      const traverse = (group) => {
        return [
          ...(this.deactivationInfo.children?.includes(group.id) ? [group] : []),
          ...(group.children ? group.children.flatMap(traverse) : [])
        ];
      };
      return this.groups.flatMap(traverse);
    },
    users() {
      return this.$store.state.profile.currentModels;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    cancellationReasons() {
      return this.$store.state.dictionaries.cancellationReasons;
    }
  },
  created() {
    if (this.staffLength)
     this.$store.dispatch('dictionaries/fetchResignReasons');
    if (this.modelsWorkshiftsLength)
      this.$store.dispatch('dictionaries/fetchCancellationReasons');
    if (this.childrenLength)
      this.$store.dispatch('groups/getGroupsNonSystem');
  },
  watch: {
    workshiftStatus: function (newStatus, prevStatus ) {
      if( prevStatus === 'canceling' && newStatus === '' ) {
        this.$bvModal.hide('cancel_shift');
        showToast(this.$toasted, 'Смена отменена');
        this.getDeactivationInfo();
      }
    },
  },
  methods: {
    changeMainGroup(user) {
      this.activeProfile = this.$store.getters["profile/profile"](user.id);
      this.activeUser(user);
      this.$emit('mainGroup', user);
    },
    deactivateChild(group) {
      const params = {
        child: group,
        parent_id: this.group.id,
        parent: this.group.title
      }
      this.$emit('child', params );
    },
    activeUser(user) {
      this.userId = user.id;
      this.user = user;
      this.$emit('activeUser', user);
    },
    getDeactivationInfo() {
      this.$store.dispatch('groups/deactivateGroupCheck', this.group.id);
    },
    showCancelModal(shift) {
      if (this.selectedCancellationReasons[shift.id]) {
        this.activeShift = shift;
        this.$bvModal.show('cancel_shift');
      }
    },
    cancelShift() {
      if (!this.isCancelLoading) {
        this.$store.dispatch('schedule/cancelWorkshift', {
          id: this.activeShift.id,
          status: 'canceled',
          cancel: this.selectedCancellationReasons[this.activeShift.id]
        });
      }
    },
  }
}
</script>
