<template>
  <div class="workshifts">
    <header-workshifts :freeModelsCount="freeModelsCount">
      <template v-slot:date-picker>
        <date-scroll-type v-model="chosenDate" :type="dateFormatType" :showTypePicker="activeTab.tab === 'show'"/>
      </template>
    </header-workshifts>
    <div v-if="activeTab.group === null || !activeTab.group.id" class="workshifts-empty">
      <i class="fi flaticon-load-workshift"></i>
      <h3>Для отображения расписания<br/>выберите группу</h3>
    </div>
    <div v-else class="workshifts-show">
      <div v-if="activeTab.group.type === 'city' && !officesList.length && activeTab.tab !== 'free-models'"
           class="workshifts-edit-main-empty">
        <h3>В выбранной группе офисы не найдены</h3>
        <p>Попробуйте выбрать другую группу</p>
      </div>
      <operators-workshifts v-else-if="activeTab.tab === 'operator'"
                            :offices-list="officesList"
                            :active-group="activeTab.group"
                            :user-permissions="userPermissions"
                            :activeOperatorsDate="activeOperatorsDate"
                            @updateOperatorsDate="updateOperatorsDate"
                            @open-mini-profile="openPastMiniProfile"
                            @open-assign-operator="openAssignOperators"
                            @openAssignPairs="openAssignPairs"
                            @click-remove-operator="onClickRemoveOperator"
                            @remove-operator-from-shift="removeOperatorFromShift"
      />
      <div
          v-else-if="((activeTab.group.type === 'office') || (activeTab.group.type === 'city')) && activeTab.group.settings && activeTab.group.settings.work_shift"
          class="workshifts-edit-main">
        <schedule v-if="activeTab.tab === 'show'"
                  :activeGroup="activeTab.group"
                  :activeDateType="activeTab.date_type"
                  :offices-list="officesList"
                  :activeDate="activeDate"
                  :droverType="droverType"
                  @updateWorkshiftsDate="updateWorkshiftsDate"
                  @updateWorkshiftsForWeek="updateWorkshiftsForWeek"
                  @openShiftCreation="openShiftCreation"
                  @openWorkshiftDetails="openWorkshiftDetails"
                  @onClickModel="onClickModel"
                  @onClickOperator="onClickOperator"
        />
        <free-models v-else-if="activeTab.tab === 'free-models'"
                     v-model="activeFreeModelsType"
                     :activeGroup="activeTab.group"
                     :activeFreeModelsDate="activeFreeModelsDate"
                     @open-schedule="onClickFreeModel"
                     @updateFreeModelDate="updateFreeModelDate"
                     @input="onFreeModelsTypeInput"
        />
        <past-workshifts v-else-if="activeTab.tab === 'past-workshift'"
                         :offices-list="officesList"
                         :activeGroup="activeTab.group"
                         :activePastDate="activePastDate"
                         @updatePastDate="updatePastDate"
                         @open-mini-profile="openPastMiniProfile"
        />
      </div>
      <div v-else class="workshifts-edit-main-empty">
        <h3>Расписание не найдено</h3>
        <p>Для отображения расписания выберите страну, город и офис</p>
      </div>
    </div>
    <helper contentClass="-paddingless" :hide-header-close="droverType === 'assign-operators'">
      <assign-operators v-if="droverType === 'assign-operators'"
                        :group="activeTab.group"
                        :active-date="activeOperatorsDate"
                        :active-operator="activeUser"
                        :active-model="modelToAssign"
                        :offices-list="officesList"
                        @closeDrover="closeDrover"
      />
      <assign-pairs v-if="droverType === 'assign-pairs'"
                    :offices-list="officesList"
                    :group="activeTab.group"
                    :active-date="activeOperatorsDate"
                    @closeDrover="closeDrover"
      />
      <workshift-details v-if="droverType === 'details'"
                         :workshift="activeWorkshift"
                         :group="chosenGroup"
                         :shiftDate="activeShiftDate"
                         :endPeriodThreshold="endPeriodThreshold"
                         :excessTime="excessTime"
                         :periods="periods"
                         @miniProfile="openMiniProfile"
                         @openSchedule="openScheduleFromShift"
      />
      <mini-profile v-else-if="droverType === 'mini-profile'"
                    :user-id="activeUser.id"
                    :office-id="chosenGroup.id"
                    :breadcrumbs-title="droverBreadcrumbs"
                    @close="returnModelSchedule"
                    @openWorkshiftDetails="openWorkshiftDetails"
      />
      <model-schedule v-else-if="droverType === 'model-schedule'"
                      :modelData="activeUser"
                      :office="chosenGroup"
                      :rooms="chosenGroup.rooms"
                      :absences="activeUser.absences || absencesModel"
                      showModel
                      showAddAbsences
                      :backButton="showBackButtonInSchedule && 'Информация о смене' || undefined"
                      :selectOffice="selectOffice"
                      :officesList="activeUserOffices"
                      :user-permissions="userPermissions"
                      :default-date="activeDate"
                      :workshiftPeriods="periods"
                      @open-mini-profile="openModelProfile"
                      @open-absence-details="openAbsenceDetails"
                      @setChosenGroupId="setChosenGroupId"
                      @go-back="openWorkshiftDetails"
                      @fetchFreeModels="fetchFreeModels"
      />
      <absence-details v-else-if="droverType === 'absence-details'"
                       :backButton="droverBreadcrumbs"
                       @createAbsence="createUserAbsence"
                       @close="returnModelSchedule"
      />
    </helper>
    <b-modal id="remove_operator_modal"
             centered
             title="Удалить  все смены с этой моделью?"
             body-bg-variant="white"
             ok-title="Удалить все смены"
             ok-variant="primary"
             cancel-title="Удалить одну"
             cancel-variant="outline-primary"
             @ok="removeOperatorFromAllModelShifts"
             @cancel="removeOperatorFromShift()"
    >У данной модели в этом периоде есть несколько смен с этим оператором.</b-modal>
  </div>
</template>

<script>
import CustomSelect from "@/components/Common/Select/Select";
import HeaderWorkshifts from "@/pages/Workshifts/components/HeaderWorkshifts/HeaderWorkshifts";
import Helper from '@/components/Helper/Helper.vue';
import Details from "./components/Details";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import moment from 'moment';
import Select from "@/components/Common/Select/Select";
import FreeModels from "./components/FreeModels/FreeModels";
import ModelSchedule from '@/components/ModelSchedule/ModelSchedule';
import TimeInput from './components/TimeInput';
import AssignOperators from "@/pages/Workshifts/components/AssignOperators/AssignOperators";
import PastWorkshifts from "@/pages/Workshifts/components/PastWorkshifts/PastWorkshifts";
import AbsenceDetails from "@/pages/Profile/components/WorkCalendar/AbsenceDetails";
import OperatorsWorkshifts from "@/pages/Workshifts/components/OperatorsWorkshifts/OperatorsWorkshifts";
import AssignPairs from "@/pages/Workshifts/components/AssignOperators/AssignPairs";
import throbber from "@/assets/vue-svg/throbber.svg";
import Schedule from "@/pages/Workshifts/components/Schedule/Schedule";
import DateScrollType from "@/pages/Workshifts/components/DateScrollType/DateScrollType";
import { showToast } from "@/tools/tools";

moment.locale('ru');

export default {
  name: "RewriteWorkshifts",
  components: {
    Schedule,
    HeaderWorkshifts,
    CustomSelect,
    AssignPairs,
    OperatorsWorkshifts,
    PastWorkshifts,
    'helper': Helper,
    'workshift-details': Details,
    'mini-profile': MiniProfile,
    'custom-select': Select,
    'free-models': FreeModels,
    'model-schedule': ModelSchedule,
    'time-input': TimeInput,
    'assign-operators': AssignOperators,
    'absence-details': AbsenceDetails,
    'throbber': throbber,
    DateScrollType,
  },
  data() {
    return {
      currentWorkshifts: [],
      activeDate: moment().format('YYYY-MM-DD'),
      activePastDate: moment().format('YYYY-MM-DD'),
      activeFreeModelsDate: moment().format('YYYY-MM-DD'),
      activeOperatorsDate: moment().format('YYYY-MM-DD'),
      activeWorkshift: {},
      droverType: '',
      droverBreadcrumbs: '',
      activeCollapses: [],
      activeUser: {},
      activeModel: null,
      activeOperator: {},
      pastProfile: {},
      showBackButtonInSchedule: false,
      activeShiftDate: '',
      collapseStateOffice: {},
      collapseStateDate: {},
      cellWidths: {},
      chosenGroupId: null,
      selectOffice: false,
      showGroupsForOperator: false,
      modelsGroupId: null,
      modelToAssign: {},
      currentScheduleDate: null,
      showFreeOperators: false,
      modelsCounter: 0,
      waitingForGroups: false,
      activeFreeModelsType: 'without_workshifts',
    }
  },
  computed: {
    activeTab() {
      return this.$store.state.schedule.activeTab;
    },
    currentSchedule() {
      return this.$store.state.schedule.currentSchedule;
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
    loadWorkshifts() {
      return this.$store.state.schedule.loadWorkshifts;
    },
    freeModelsCount() {
      return this.$store.state.schedule.freeModelsCount;
    },
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    activeWeekArray() {
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-2);
      else date.weekday(5);
      return [0, 1, 2, 3, 4, 5, 6].map(() => {
        date.add(1, 'd');
        return date.format('YYYY-MM-DD');
      })
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    profile() {
      return this.$store.getters["profile/shortProfile"](Number(this.activeUser?.id));
    },
    absencesModel() {
      return this.$store.state.profile.absences;
    },
    absenceRequestStatus() {
      return this.$store.state.profile.absenceStatus;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    permissionShowWorkshifts() {
      return this.userPermissions.schedule.view ||
          this.userPermissions.schedule.actual.start.date.edit ||
          this.userPermissions.schedule.actual.end.date.edit ||
          this.userPermissions.schedule.break.edit ||
          this.userPermissions.setup.workshift.operator ||
          this.userPermissions.schedule.operator.workshifts.yours ||
          this.userPermissions.schedule.operator.workshifts.all;
    },
    permissionFreeModel() {
      return this.userPermissions.schedule.edit || this.userPermissions.schedule.reserve.view;
    },
    items() {
      return this.allItems.slice(0, this.maxRows)
    },
    excessTime() {
      let groupId = Object.keys(this.currentSchedule)[0];
      if (!groupId || !this.currentSchedule[groupId] || !this.currentSchedule[groupId].excess_time) return 0;
      return this.currentSchedule[groupId].excess_time;
    },
    endPeriodThreshold() {
      if (!this.periods?.[this.periods.length - 1]?.from) return {
        hours: 0,
        minutes: 0
      };
      let time = this.periods[this.periods.length - 1].to.split(':');
      return {
        minutes: parseInt(time[1]),
        hours: parseInt(time[0])
      }
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    officesList() {
      if (this.activeTab.group === null) return [];
      if (this.activeTab.group.type === 'office') return [this.activeTab.group];
      if (this.activeTab.group.type === 'city') return this.activeTab.group.children && this.activeTab.group.children.filter(child => child.type === 'office' && child.sub_type === (this.activeTab.tab === 'operator' ? 'operator' : 'model')) || [];
      if (this.activeTab.group.type === 'country') {
        let resultOffices = []
        this.activeTab.group.children?.forEach(city => {
          resultOffices = resultOffices.concat(city.children.filter(child => child.type === 'office' && child.sub_type === (this.activeTab.tab === 'operator' ? 'operator' : 'model'))
              .map(office => ({
                ...office,
                city: city.title,
              })));
        });
        return resultOffices
      }
      return [];
    },
    chosenGroup() {
      if (this.activeTab.group.type === 'office') return this.activeTab.group;
      if (this.activeTab.group.type === 'city') {
        if (!this.activeWorkshift.group && !this.chosenGroupId) return this.activeTab.group;
        let group = this.activeTab.group.children.find(child => child.id === (this.chosenGroupId || this.activeWorkshift.group.id));
        if (!group) return {};
        return group;
      }
      return {};
    },
    activeUserOffices() {
      if (!this.activeUser || !this.models) return [];
      return this.models.find(model => model.id === this.activeUser.id)?.offices || [];
    },
    updatedWorkshift() {
      return this.$store.state.schedule.updatedWorkshift;
    },
    dateFormatType() {
      if (!this.activeTab) return 'week';
      return this.activeTab.tab === 'show' ? this.activeTab.date_type : 'week';
    },
    chosenDate: {
      get() {
        switch (this.activeTab.tab) {
          case 'show': return this.activeDate;
          case 'free-models': return this.activeFreeModelsDate;
          case 'past-workshift': return this.activePastDate;
          case 'operator': return this.activeOperatorsDate;
        }
        return '';
      },
      set(value) {
        switch (this.activeTab.tab) {
          case 'show': return this.activeDate = value;
          case 'free-models': return this.activeFreeModelsDate = value;
          case 'past-workshift': return this.activePastDate = value;
          case 'operator': return this.activeOperatorsDate = value;
        }
      },
    },
    periods() {
      return this.$store.state.schedule.periods;
    },
    newWorkshift() {
      return this.$store.state.schedule.newWorkshift;
    },
  },
  watch: {
    activeTab: async function (newActiveTab, oldActiveTab) {
      this.activeCollapses = [];
      if (newActiveTab.group && ((newActiveTab.group.type === 'office' && newActiveTab.group.sub_type === 'model') || (newActiveTab.group.type === 'city'))) {
        this.fetchPeriodsForGroup(newActiveTab.group);
        if (!oldActiveTab.group?.id || (newActiveTab.group.id !== oldActiveTab.group.id) || (newActiveTab.tab !== oldActiveTab.tab) || this.waitingForGroups) {
          this.fetchFreeModelsCount(newActiveTab.group);
          if (newActiveTab.tab === 'show') {
            await this.updateWorkshifts(newActiveTab.group);
            this.fetchFreeModels(newActiveTab.group);
            return;
          }
          if (newActiveTab.tab === 'free-models') {
            await this.fetchFreeModels(newActiveTab.group);
            this.updateWorkshifts(newActiveTab.group);
            return;
          }
          this.$nextTick(() => {
            this.fetchFreeModels(newActiveTab.group);
            this.updateWorkshifts(newActiveTab.group);
          })
        }
      }
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.selectOffice = false;
        this.chosenGroupId = null;
        this.showBackButtonInSchedule = false;
        this.modelsGroupId = null;
      }
    },
    userStatus: function (newStatus, prevStatus) {
      if (newStatus !== '') return;
      if (prevStatus === 'editing' && this.droverType === 'add-groups') {
        this.droverBreadcrumbs = ''
        this.droverType = 'mini-profile'
      }
    },
    scheduleStatus: function (newStatus, prevStatus) {
      switch (newStatus) {
        case 'link-error':
          showToast(this.$toasted, this.requestErrors[0]?.message || 'При генерации ссылки возникла ошибка', 'error');
          return;
        case '':
          if ((prevStatus === 'editing') || (prevStatus === 'canceling')) this.activeWorkshift = this.updatedWorkshift;
          return;
        case 'assigning-error':
        case 'all-assigning-error':
          showToast(this.$toasted, this.requestErrors.length ? this.requestErrors[0]?.message : 'Ошибка', 'error');
          return;
        case 'schedule-created':
          this.fetchFreeModelsCount();
          this.updateWorkshifts();
          return;
        case 'edit-error':
          showToast(this.$toasted, this.requestErrors[0]?.message || 'При удалении оператора возникла ошибка', 'error');
          return;
      }
    },
    absenceRequestStatus: function (newStatus) {
      if (newStatus === 'created') {
        showToast(this.$toasted, 'Отсутствие добавлено');
        this.$store.dispatch('profile/fetchAbsences', {user: this.activeUser.id});
        this.returnModelSchedule()
      } else if (newStatus === 'error') showToast(this.$toasted, `${this.$store.state.profile.errorMessage || 'Ошибка'}`, 'error');
    },
    absencesModel(newAbsences) {
      if (newAbsences.length && this.activeUser) this.activeUser.absences = newAbsences;
    },
    newWorkshift: function (shift) {
      this.activeWorkshift = shift;
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsNonOperators');
    this.$store.dispatch('dictionaries/fetchGroupsOperators');
    this.$store.dispatch('dictionaries/fetchCancellationReasons');
    this.$store.dispatch('dictionaries/getAbsenceTypes');
  },
  methods: {
    fetchPeriodsForGroup(group = this.activeTab.group) {
      let groupId = group.type === 'city' ? group.id : group.city.id;
      if (!groupId) return;
      this.$store.dispatch('schedule/fetchPeriodsForGroup', {group: groupId, 'workweek': this.activeDate});
    },
    async updateWorkshifts(group = this.activeTab.group) {
      this.waitingForGroups = false;
      if (!this.permissionShowWorkshifts || !group?.id) return;
      if ((group.type === 'city') && (this.officesList.length === 0)) return this.waitingForGroups = true;
      if ((group.type !== 'office') && (group.type !== 'city')) return this.currentWorkshifts = {};
      if (group.type === 'office') await this.$store.dispatch('schedule/fetchSchedule', {
        office: group.id,
        'workweek': this.activeDate,
        pagination: false
      });
      else await this.$store.dispatch('schedule/fetchScheduleForCity', {
        offices: this.officesList,
        query: {'workweek': this.activeDate, pagination: false}
      });
    },
    onFreeModelsTypeInput() {
      this.fetchFreeModels();
    },
    async fetchFreeModels(group = this.activeTab.group) {
      if (!this.permissionFreeModel) return;
      await this.$store.dispatch('schedule/fetchFreeModels', {
        group: group.id,
        workweek: this.activeFreeModelsDate,
        type: this.activeFreeModelsType,
      });
    },
    fetchFreeModelsCount(group = this.activeTab.group) {
      if (!this.permissionFreeModel) return;
      this.$store.dispatch('schedule/fetchFreeModelsCount', {
        office: group.id,
        workweek: this.activeFreeModelsDate
      });
    },
    updateWorkshiftsDate(date) {
      this.activeDate = date;
    },
    updateWorkshiftsForWeek() {
      this.fetchPeriodsForGroup();
      this.updateWorkshifts();
    },
    updateFreeModelDate(date) {
      this.activeFreeModelsDate = date;
      this.fetchFreeModels();
      this.fetchFreeModelsCount();
    },
    updatePastDate(date) {
      this.activePastDate = date
    },
    updateOperatorsDate(date) {
      this.activeOperatorsDate = date
    },
    userEditGroups() {
      this.showGroupsForOperator = false;
      this.droverType = 'add-groups';
    },
    userEditOperatorGroups() {
      this.showGroupsForOperator = true;
      this.droverType = 'add-groups';
    },
    returnModelSchedule() {
      if (this.activeModel) {
        this.activeUser = this.activeModel;
        this.activeModel = null;
      }
      this.droverBreadcrumbs = '';
      this.droverType = 'model-schedule';
    },
    getOperatorName(operator) {
      return this.userPermissions.employee.view ? operator.surname : operator.fullname;
    },
    backToUserDetails() {
      this.droverType = 'mini-profile';
    },
    openMiniProfile(user, title = '') {
      this.droverBreadcrumbs = title;
      this.activeUser = user;
      this.droverType = 'mini-profile'
    },
    openModelProfile({user, title, model}) {
      this.openMiniProfile(user, title)
      if (model) this.activeModel = model
    },
    openPastMiniProfile(profile) {
      this.droverBreadcrumbs = '';
      this.activeUser = {id: profile.id, fullname: profile.fullname, office: {id: profile.office}};
      this.chosenGroupId = profile.office;
      this.droverType = 'mini-profile';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
    openAbsenceDetails(currentScheduleDate) {
      this.currentScheduleDate = currentScheduleDate;
      this.droverBreadcrumbs = 'Расписание на неделю'
      this.droverType = 'absence-details'
    },
    openWorkshiftDetails(data = null) {
      if (data) {
        this.activeWorkshift = data.shift;
        this.activeShiftDate = data.date;
      }
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openPartnerProfile(user) {
      this.activeUser = user
    },
    onClickFreeModel(model) {
      this.chosenGroupId = model.main_group.id;
      this.activeUser = model;
      this.currentScheduleDate = null;
      if (this.userPermissions.schedule.edit)
        this.droverType = 'model-schedule';
      else if (this.userPermissions.model.profile.view)
        this.droverType = 'mini-profile';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openSchedule(model) {
      this.activeUser = model;
      this.currentScheduleDate = null;
      this.droverType = 'model-schedule';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openScheduleFromShift(model) {
      this.showBackButtonInSchedule = true;
      this.$store.dispatch('profile/fetchAbsences', {
        user: model.id,
        workweek: this.activeShiftDate,
      });
      this.openSchedule(model);
    },
    openShiftCreation(data = null) {
      let shift = {model: {}};
      if (data) {
        // if (data.groupId && (data.groupId !== this.activeTab.group.id)) {
        //   this.modelsGroupId = data.groupId;
        //   this.$store.dispatch('schedule/fetchModels', {
        //     group: data.groupId,
        //     'workweek': this.activeDate,
        //     per_page: 20
        //   });
        // }
        if (data.roomId) shift.room = {id: parseInt(data.roomId)};
        if (data.dateString && data.periodString) {
          let period = data.periodString.split(' - '),
              from = period[0].split(':'),
              to = period[1].split(':'),
              date = moment(data.dateString);

          date.hours(from[0]).minutes(from[1]);
          shift.planned_start_at = date.format('YYYY-MM-DDTkk:mm:ss') + '+00:00';

          if (from[0] >= to[0]) date.add(1, 'd');

          date.hours(to[0]).minutes(to[1]);
          shift.planned_end_at = date.format('YYYY-MM-DDTkk:mm:ss') + '+00:00';
        }
        if (data.groupId) shift.group = {id: data.groupId};
      }
      this.activeWorkshift = shift;
      this.activeShiftDate = data?.dateString || '';
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openAssignOperators(data = null) {
      if (data) {
        this.activeUser = data.operator
        this.modelToAssign = data.model
        this.updateOperatorProfile()
      } else {
        this.activeUser = null
        this.modelToAssign = null
      }
      this.droverType = 'assign-operators';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openAssignPairs() {
      this.droverType = 'assign-pairs';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    updateOperatorProfile() {
      let requestData = {
        userId: this.activeUser.id
      };
      requestData.query = {absence_at: moment(this.activeOperatorsDate).format('YYYY-MM-DD')}
      requestData.query.workweek = moment(this.activeOperatorsDate).format('YYYY-MM-DD')
      this.$store.dispatch('profile/fetchShortProfile', requestData);
    },
    editOperatorGroups() {
      this.showGroupsForOperator = true
      this.droverType = 'add-groups';
    },
    changeShiftTime(shift) {
      this.$store.dispatch('schedule/editWorkshift', {
        id: shift.id,
        start_at: shift.start_at,
        end_at: shift.end_at
      });
    },
    collapseBlock(id) {
      this.$root.$emit('bv::toggle::collapse', id);
    },
    onClickModel({shift, date}) {
      this.currentScheduleDate = null;
      this.droverBreadcrumbs = ''
      this.activeUser = shift.model;
      this.activeWorkshift = shift;
      this.activeShiftDate = date;
      this.droverType = this.userPermissions.schedule.edit ? 'model-schedule' : (this.userPermissions.model.profile.view ? 'mini-profile' : 'details');
      // this.selectOffice = true;
      this.$store.dispatch('profile/fetchAbsences', {
        user: shift.model.id,
        workweek: date
      });
      this.$store.dispatch('layout/toggleHelper', true);
    },
    onClickOperator({shift, date}) {
      if (!shift.operator?.is_access) {
        this.openWorkshiftDetails({shift, date});
        return;
      }
      this.droverBreadcrumbs = ''
      this.activeUser = shift.operator;
      this.activeWorkshift = shift;
      this.activeShiftDate = date;
      this.droverType = (shift.operator && this.userPermissions.operator.profile.view) ? 'mini-profile' : 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    setChosenGroupId(id) {
      this.chosenGroupId = id;
    },
    createUserAbsence(absence) {
      absence.user = this.activeUser.id
      this.$store.dispatch('profile/createAbsence', absence)
    },
    onClickRemoveOperator(shift) {
      this.activeWorkshift = shift;
      this.$bvModal.show('remove_operator_modal');
    },
    removeOperatorFromShift(shift = this.activeWorkshift) {
      this.$store.dispatch('schedule/removeOperatorFromShift', {
        id: shift.id,
        operator: null,
      });
    },
    removeOperatorFromAllModelShifts() {
      this.$store.dispatch('schedule/removeOperatorFromModelShifts', {
        operatorId: this.activeWorkshift.operator.id,
        query: {
          model_id: this.activeWorkshift.model.id,
          workweek: this.activeWorkshift.period,
        },
      });
    },
  }
}
</script>
