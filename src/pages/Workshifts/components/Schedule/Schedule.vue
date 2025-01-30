<template>
  <div>
<!--    <div class="d-flex justify-content-between align-items-center flex-wrap">
      <date-scroll-type v-model="activeDate" :type="activeTab.date_type" ></date-scroll-type>
      <b-button v-if="userPermissions.schedule.edit" class="workshifts-header-button" variant="outline-primary"
                @click="openNewShiftCreation()">Добавить смену
      </b-button>
    </div>-->
    <div v-if="(loadWorkshifts.length || mainStatus === 'request-week-workshift') && !droverType" class="workshifts-edit-main-empty">
      <throbber class="throbber"/>
      <p class="workshifts-edit-main-empty-text">Расписание загружается, пожалуйста, подождите</p>
    </div>
    <div v-else-if="newCurrentShifts" class="card workshifts-card">
      <template v-for="date in currentDatesArray">
        <div v-if="activeTab.date_type === 'week'" class="workshifts-collapse" :class="{'-active': collapseStateDate[date]}" @click="collapseBlock(`collapse-date-${date}`)">
          <h4>{{ formatDate(date) }}</h4>
          <i class="fa fa-angle-down workshifts-collapse-arrow"/>
        </div>
        <b-collapse v-model="collapseStateDate[date]"
                    :id="`collapse-date-${date}`"
                    class="workshifts-card-main"
                    :class="{'-without_header': activeTab.date_type === 'day'}"
        >
          <div class="workshifts-card-main-header">
            <div v-for="(period, key) in periods" class="workshifts-card-main-header-period" :style="{flex: key? headerPeriodWidth : firstHeaderPeriodWidth}">
              <div class="workshifts-card-main-header-period-title">{{ period.from }} - {{ period.to }}</div>
              <div class="workshifts-card-main-header-period-row" :class="{'-first': key === 0}">
                <div class="workshifts-card-main-header-period-row-cell -room">#</div>
                <div class="workshifts-card-main-header-period-row-cell -model">модель</div>
                <div class="workshifts-card-main-header-period-row-cell -operator">Оператор</div>
                <div class="workshifts-card-main-header-period-row-cell -start">Начало</div>
                <div class="workshifts-card-main-header-period-row-cell -end">Конец</div>
              </div>
            </div>
          </div>
          <div class="workshifts-card-main-body">
            <div v-for="(office, officeId) in newCurrentShifts[date]" class="workshifts-card-main-body-office">
              <div v-for="(room, roomId) in office.shifts" class="workshifts-card-main-body-office-room">
                <div class="workshifts-card-main-body-office-room-title"
                     :class="{'-dark': office.isDark, '-editable': userPermissions.schedule.edit && (room.number !== 'reserve')}"
                     :style="{backgroundColor: office.color}"
                     :id="`room-${date}-${officeId}-${roomId}`"
                >
                  <span class="workshifts-card-main-body-office-room-title-name">{{ room.title }}</span>
                  <div class="btn-add workshifts-card-main-body-office-room-title-btn" @click="openShiftCreation(date, null, roomId, officeId)"></div>
                </div>
                <b-tooltip :target="`room-${date}-${officeId}-${roomId}`" placement="right">
                  <div class="model_mini_profile-schedule-tooltip-workshift-group">
                    <span class="model_mini_profile-schedule-tooltip-workshift-group-flag flag-icon" :class="`flag-icon-${office.flag || 'default'}`"/>
                    <div class="model_mini_profile-schedule-tooltip-workshift-group-info">
                      <span class="text-gray">{{ office.city }}</span>
                      <span>{{ office.title }}</span>
                    </div>
                  </div>
                </b-tooltip>
                <div class="workshifts-card-main-body-office-room-shifts">
                  <template v-for="(period, periodString) in room.shifts">
                    <draggable v-model="period.shifts"
                               group="shifts"
                               :filter="userPermissions.schedule.edit ? '.-placeholder, .-hidden' : 'div'"
                               :preventOnFilter="false"
                               class="workshifts-card-main-body-office-room-shifts-period"
                               :style="{flex: periodWidth}"
                               :forceFallback="true"
                               @change="moveWorkshift(date, periodString, roomId, officeId, $event)"
                               @start="startDrag(date, periodString, roomId, $event)"
                               @end="endDrag"
                    >
                      <template v-for="shift in period.shifts">
                        <div v-if="shift.access"
                             class="workshifts-card-main-body-office-room-shifts-period-shift"
                             :id="`schedule_shift-${shift.id}`"
                             @click="clickRow(shift, date)"
                        >
                          <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell -model">
                            <div v-if="shift.model" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text" @click.stop="onClickModel(shift, date)">
                            <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-name d-flex align-items-center"
                                  v-b-tooltip.hover
                                  :title="`${shift.model.uid || ''} ${shift.model.fullname || shift.model.surname || ''}`"
                            >
                              <span v-if="shift.model.surname">{{ shift.model.surname }}</span>
                              <div v-else class="d-flex align-items-center">
                                <at class="mr-1"/>
                                <b>{{ shift.model.model_nickname }}</b>
                              </div>
                            </div>
                              <template v-if="shift.model.new_model">
                                <div class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" :id="`new-${shift.id}`"/>
                                <b-tooltip :target="`new-${shift.id}`"
                                           triggers="hover"
                                           placement="top"
                                >
                                  <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                                </b-tooltip>
                              </template>
                            </div>
                          </div>
                          <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell -operator">
                            <div v-if="shift.model" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text" @click.stop="onClickOperator(shift, date)">
                            <span v-if="shift.operator"
                                  class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-name"
                                  v-b-tooltip.hover
                                  :title="`${shift.operator.uid || ''} ${shift.operator.fullname || shift.operator.surname || ''}`"
                            >{{ shift.operator.surname || shift.operator.uid }}</span>
                              <div v-else-if="shift.model.is_solo" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo">Соло</div>
                            </div>
                          </div>
                          <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell -start">
                            <time-input v-model="shift.start_at"
                                        :endPeriodThreshold="endPeriodThreshold"
                                        :date="date"
                                        :placeholder="shift.planned_start_at"
                                        :disabled="((shift.status !== 'assigned') && (shift.status !== 'process')) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.start.date.edit)"
                                        @input="changeShiftTime(shift)"
                            />
                          </div>
                          <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell -end">
                            <time-input v-model="shift.end_at"
                                        :endPeriodThreshold="endPeriodThreshold"
                                        :date="date"
                                        :placeholder="shift.planned_end_at"
                                        :showError="!shift.start_at"
                                        :disabled="((shift.status !== 'assigned') && (shift.status !== 'process')) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.end.date.edit)"
                                        :startAt="shift.start_at"
                                        @input="changeShiftTime(shift)"
                            />
                          </div>
                          <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell -status"
                               :class="`-${shift.status}`"
                               :id="`shift-status-${shift.id}`"
                          />
                          <b-tooltip :target="`shift-status-${shift.id}`">
                            <div class="workshifts-card-main-body-office-room-shifts-period-shift-cell-status"
                                 :class="`-${shift.status}`"
                            >{{ workshiftStatuses[shift.status] }}</div>
                          </b-tooltip>
                        </div>
                        <div v-else class="workshifts-card-main-body-office-room-shifts-period-shift -hidden">
                          Комната занята
                        </div>
                      </template>
                    </draggable>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </b-collapse>
      </template>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import VueScrollingTable from "vue-scrolling-table";
import Draggable from "vuedraggable";
import CustomSelect from "@/components/Common/Select/Select";
import TimeInput from '../../components/TimeInput';
import DateScrollType from "@/pages/Workshifts/components/DateScrollType/DateScrollType";
import throbber from "@/assets/vue-svg/throbber.svg";
import at from "@/assets/vue-svg/at.svg";
import {isColorDark} from "@/tools/tools";
moment.locale('ru');

export default {
  name: "Schedule",
  components: {
    DateScrollType,
    'draggable': Draggable,
    'custom-select': CustomSelect,
    'scrolling-table': VueScrollingTable,
    'time-input': TimeInput,
    'throbber': throbber,
    'at': at,
  },
  props: {
    officesList: {
      type: Array
    },
    activeDate: String,
    droverType: String,
  },
  data() {
    return {
      newCurrentShifts: {},
      activeWorkshift: {},
      activeCollapses: [],
      activeUser: {},
      activeShiftDate: '',
      collapseStateOffice: {},
      collapseStateDate: {},
      chosenGroupId: null,
    }
  },
  computed: {
    activeTab() {
      return this.$store.state.schedule.activeTab;
    },
    periods() {
      return this.$store.state.schedule.periods;
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
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    currentDatesArray() {
      if (this.activeTab.date_type === 'day') return [this.activeDate];
      return this.activeWeekArray;
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
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    permissionShowWorkshifts() {
      return this.userPermissions.schedule.view || this.userPermissions.schedule.actual.start.date.edit || this.userPermissions.schedule.actual.end.date.edit || this.userPermissions.schedule.break.edit;
    },
    endPeriodThreshold() {
      let groupId = Object.keys(this.currentSchedule)[0];
      if (!groupId || !this.currentSchedule[groupId] || !(this.currentSchedule[groupId].periods && this.currentSchedule[groupId].periods[this.currentSchedule[groupId].periods.length - 1] && this.currentSchedule[groupId].periods[this.currentSchedule[groupId].periods.length - 1].from)) return {
        hours: 0,
        minutes: 0
      };
      let time = this.currentSchedule[groupId].periods[this.currentSchedule[groupId].periods.length - 1].to.split(':');
      return {
        minutes: parseInt(time[1]),
        hours: parseInt(time[0])
      }
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    chosenGroup() {
      if (this.activeTab.group.type === 'office') return this.activeTab.group;
      if (this.activeTab.group.type === 'city') {
        if (!this.activeWorkshift.group && !this.chosenGroupId) return this.activeTab.group;
        let group = this.activeTab.group.children.find(child => child.id === (this.chosenGroupId || this.activeWorkshift.group.id));
        if (!group) return {};
        group.path = {...this.activeTab.group.path, office: group.title};
        return group;
      }
      return {};
    },
    chosenGroupSchedule() {
      let currentGroup = this.activeUser.office ? this.activeUser.office : this.chosenGroup
      if (!currentGroup || !currentGroup.id) return {};
      return this.currentSchedule[currentGroup.id] || {};
    },
    updatedWorkshift() {
      return this.$store.state.schedule.updatedWorkshift;
    },
    mainStatus() {
      return this.$store.state.schedule.mainStatus;
    },
    headerPeriodWidth() {
      return this.periods.length ? `0 0 calc((100% - 45px) / ${this.periods.length})` : '440px';
    },
    firstHeaderPeriodWidth() {
      return this.periods.length ? `0 0 calc(((100% - 45px) / ${this.periods.length}) + 45px)` : '395px';
    },
    periodWidth() {
      return this.periods.length ? `0 0 ${100 / this.periods.length}%` : '395px';
    },
  },
  watch: {
    officesList: function (newList) {
      this.updateCollapsesStates(this.currentDatesArray, newList);
    },
    currentSchedule: function (nextScheduleObject) {
      this.setNewCurrentShifts(nextScheduleObject);
    },
    scheduleStatus: function (newStatus, prevStatus) {
      switch (newStatus) {
        case 'edit-error':
          this.$toasted.error(this.requestErrors[0] && this.requestErrors[0].message || `Ошибка выполнения запроса`, {
            className: ['toasted-error'],
            action: {
              class: 'btn-close',
              onClick: this.closeToast
            },
          });
          this.setNewCurrentShifts();
          return;
      }
    },
    periods: function () {
        this.setNewCurrentShifts();
    },
    activeDate(newDate, oldDate) {
      this.updateCollapsesStates();
      this.updateWorkshiftsDate();
      if (this.activeTab.date_type === 'week') return this.updateWorkshiftsForWeek();
      let oldCurrentDate = moment(oldDate);
      if (oldCurrentDate.weekday() !== 6) oldCurrentDate.weekday(-1);
      let startOldWeek = moment(oldCurrentDate.format('YYYY-MM-DD'));
      oldCurrentDate.add(6, 'd');
      if (!(moment(newDate) >= startOldWeek && moment(newDate) <= oldCurrentDate)) this.updateWorkshiftsForWeek();
    },
  },
  created() {
    this.updateCollapsesStates();
    this.setNewCurrentShifts();
  },
  methods: {
    async updateWorkshiftsDate() {
      this.$emit('updateWorkshiftsDate', this.activeDate);
    },
    async updateWorkshiftsForWeek() {
      this.$emit('updateWorkshiftsForWeek');
    },
    formatDate(date) {
      return moment(date).format('dddd DD.MM');
    },
    formatDateTime(date) {
      return moment(date).format('DD.MM.YYYY, HH:mm');
    },
    editShift(shift) {
      if (!(shift.model && shift.model.id) || !shift.planned_start_at || !shift.planned_end_at) return;
      if (typeof shift.id === 'string') return this.createShift(shift);
      this.$store.dispatch('schedule/editWorkshift', {
        id: shift.id,
        planned_start_at: shift.planned_start_at,
        planned_end_at: shift.planned_end_at,
        model: shift.model.id,
        operator: shift.operator && shift.operator.id,
        work_shift: shift.work_shift,
        room: shift.room && shift.room.id,
        status: shift.status,
        period_date: shift.period_date,
      });
    },
    moveWorkshift(date, periodString, roomId, officeId, e) {
      if (!e.added) return;
      let workshift = e.added.element;
      if (workshift.group.id != officeId) {
        this.setNewCurrentShifts();
        this.$toasted.error(`Нельзя переносить смену из одного офиса в другой`, {
          className: ['toasted-error'],
          action: {
            class: 'btn-close',
            onClick: this.closeToast
          },
        });
        return;
      }
      if ((roomId === 'reserve') && (workshift.status !== 'created') && (workshift.status !== 'assigned')) {
        this.setNewCurrentShifts();
        this.$toasted.error(`В резерв можно вернуть смену только в статусе "назначена"`, {
          className: ['toasted-error'],
          action: {
            class: 'btn-close',
            onClick: this.closeToast
          },
        });
        return;
      }
      const period = periodString.split(' - ');
      if ((period[0] !== workshift.work_shift.from) || (period[1] !== workshift.work_shift.to)) {
        workshift.work_shift = {
          from: period[0],
          to: period[1]
        };
        workshift.planned_start_at = period[0];
        workshift.planned_end_at = period[1];
      }
      workshift.period_date = date;

      workshift.room = roomId === 'without_room' ? null : roomId === 'reserve' ? workshift.room : {id: roomId};
      workshift.status = roomId === 'reserve' ? 'created' : workshift.status === 'created' ? 'assigned' : workshift.status;

      this.preventEdit = false;
      this.editShift(workshift);
    },
    startDrag(date, periodString, roomId, e) {
      this.movingShiftData = {date, periodString, roomId, key: e.oldIndex};
      this.preventEdit = true;
      this.movingShift = true;
    },
    endDrag() {
      setTimeout(() => {
        this.preventEdit = false;
      }, 1000);
      this.movingShift = false;
    },
    setNewCurrentShifts(nextScheduleObject = this.currentSchedule) {
      const newSchedule = {};
      const activeRooms = {};
      this.officesList.forEach(office => {
        if (!nextScheduleObject[office.id]) return;
        activeRooms[office.id] = Object.values(nextScheduleObject[office.id]).reduce(
            (acc, dateShifts) => [...acc, ...Object.values(dateShifts).reduce((stepAcc, periodShifts) => [...stepAcc, ...Object.keys(periodShifts)], [])],
            []
        );
      });
      this.activeWeekArray.forEach(date => {
        newSchedule[date] = {};
        this.officesList.forEach(office => {
          if (!nextScheduleObject[office.id]) return;
          newSchedule[date][office.id] = {
            title: office.title,
            color: office.color,
            isDark: isColorDark(office.color),
            shifts: {},
            city: office.build_group.city,
            flag: office.build_group.flag,
          };
          office.rooms.forEach(room => {
            if (room.is_deleted && !activeRooms[office.id].includes(room.id.toString())) return;
            newSchedule[date][office.id].shifts[room.id] = {
              number: room.number,
              title: room.number,
              shifts: {},
            };
            let anyReservedShifts = false;
            this.periods.forEach(period => {
              newSchedule[date][office.id].shifts[room.id].shifts[`${period.from} - ${period.to}`] = {
                shifts: nextScheduleObject[office.id][date]?.[`${period.from} - ${period.to}`]?.[room.id]?.workshifts ? JSON.parse(JSON.stringify(nextScheduleObject[office.id][date][`${period.from} - ${period.to}`][room.id].workshifts)) : [],
              };
              if (nextScheduleObject[office.id][date]?.[`${period.from} - ${period.to}`]?.reserve?.workshifts.length) anyReservedShifts = true;
            });

            if (anyReservedShifts) {
              newSchedule[date][office.id].shifts.reserve = {
                number: 'reserve',
                title: 'R',
                shifts: {},
              }

              this.periods.forEach(period => {
                newSchedule[date][office.id].shifts.reserve.shifts[`${period.from} - ${period.to}`] = {
                  shifts: nextScheduleObject[office.id]?.[date]?.[`${period.from} - ${period.to}`]?.reserve?.workshifts ? JSON.parse(JSON.stringify(nextScheduleObject[office.id][date][`${period.from} - ${period.to}`].reserve.workshifts)) : []
                };
              });
            }
          });
        });
      });

      this.newCurrentShifts = newSchedule;
    },
    clickCollapse(id) {
      if (this.activeCollapses.includes(id)) this.activeCollapses = this.activeCollapses.filter(currentId => currentId !== id);
      else this.activeCollapses = [...this.activeCollapses, id];
      this.$root.$emit('bv::toggle::collapse', id);
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
    updateCollapsesStates(dates = this.currentDatesArray, offices = this.officesList) {
      let collapseStateOffice = {};
      offices.map(office => collapseStateOffice[office.id] = true);
      this.collapseStateOffice = collapseStateOffice;
      let collapseStateDate = {};
      dates.map(dates => collapseStateDate[dates] = true);
      this.collapseStateDate = collapseStateDate;
    },
    clickRow(shift, date) {
      this.$emit('openWorkshiftDetails', {shift, date});
    },
    openNewShiftCreation() {
      this.$emit('openShiftCreation');
    },
    openShiftCreation(dateString, periodString, roomId, groupId) {
      this.$emit('openShiftCreation', {dateString, periodString, roomId, groupId: groupId && parseInt(groupId)});
    },
    onClickModel(shift, date) {
      this.$emit('onClickModel', {shift, date});
    },
    onClickOperator(shift, date) {
      this.$emit('onClickOperator', {shift, date});
    },
    closeToast(e, toastObject) {
      toastObject.goAway(0);
    },
  }
}
</script>
