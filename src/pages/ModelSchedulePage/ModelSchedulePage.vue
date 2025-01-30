<template>
  <div class="schedule_page">
    <h1 class="schedule_page-header">Расписание</h1>
    <div class="schedule_page-settings">
      <div class="schedule_page-settings-groups">
<!--        <div class="schedule_page-settings-groups-color" :style="{ background: officeColor }"></div>-->
<!--        <custom-select v-model="currentOffice" valueField="id" :options="modelOffices" defaultText="Выберите офис"/>-->
        <group-select v-model="currentOffice" id="schedule-group-select" :groups="modelOffices"/>
      </div>
      <div v-if="currentOffice" class="schedule_page-dates">
        <div v-if="dateFormat === 'week'" class="schedule_page-dates-week">
          <div @click="subtractDate"><i class="fa fa-angle-left"/></div>
          <p class="glyphicon glyphicon-glyph-calendar mr-2"/>
          <p>{{ currentDatesText }}</p>
          <div @click="addDate"><i class="fa fa-angle-right"/></div>
        </div>
        <div v-else class="schedule_page-dates-week">
          <div @click="subtractDate"><i class="fa fa-angle-left"/></div>
          <p>{{ currentDatesText }}</p>
          <div @click="addDate"><i class="fa fa-angle-right"/></div>
        </div>
      </div>
<!--      <div v-if="currentOffice" class="schedule_page-settings-display_buttons">
        <div class="workshifts-filters-main-date-format" :class="dateFormat === 'day' ? '-active' : ''"
             @click="setDateFormat('day')">День
        </div>
        <div class="workshifts-filters-main-date-format" :class="dateFormat === 'week' ? '-active' : ''"
             @click="setDateFormat('week')">Неделя
        </div>
      </div>-->
    </div>
    <template v-if="currentOffice">
      <div v-if="!modelShiftsIsEmpty && !isShiftsEmpty" class="schedule_page-container">
        <!--        <div v-if="false" class="schedule_page-container">-->
        <div class="schedule_page-schedule">
          <div class="schedule_page-schedule-header">
            <div class="schedule_page-schedule-header-container">
              <div class="schedule_page-schedule-header-container-number">#</div>
              <div class="schedule_page-schedule-header-container-from">НАЧАЛО</div>
              <div class="schedule_page-schedule-header-container-to">КОНЕЦ</div>
            </div>
            <div class="schedule_page-schedule-header-status">СТАТУС</div>
          </div>
          <div class="schedule_page-schedule-days" v-for="(day, key) in shiftsFiltered" :key="key">
            <div class="schedule_page-schedule-days-day">
              <div class="schedule_page-schedule-days-day-title">{{ getDayTitle(key) }}</div>
              <div class="schedule_page-schedule-days-day-period_field">
                <div class="schedule_page-schedule-days-day-period_field-period" v-for="(period, index) in day"
                     :key="index">
                  <div class="schedule_page-schedule-days-day-period_field-period-work_shifts"
                       v-for="(shifts, element) in period" :key="element">
                    <div class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift"
                         v-for="(shift, block) in shifts.workshifts" :key="block">
                      <div class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-container">
                        <div v-if="element === 'without_room'"
                             class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-container-number">
                          <i :class="'fi flaticon-norooms'"></i></div>
                        <div v-else
                             class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-container-number">
                          {{ element === 'reserve' ? 'R' : shifts.number || element }}
                        </div>
                        <div class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-container-from">
                          {{ shift.start_at || shift.planned_start_at }}
                        </div>
                        <div class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-container-to">
                          {{ shift.end_at || shift.planned_end_at }}
                        </div>
                      </div>
                      <div
                          class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-status_container">
                        <div class="schedule_page-schedule-days-day-period_field-period-work_shifts-work_shift-status_container-status"
                            :class="`-${shift.status}`"
                        >
                          {{ scheduleStatuses[shift.status] }}
                        </div>
<!--                        <span class="glyphicon glyphicon-info" :id="`comments-${shift.id}`"></span>-->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="modelShiftsIsEmpty" class="schedule_page-empty">
        <h3 class="schedule_page-empty-title">Расписание на данную неделю не найдено</h3>
        <template v-if="isNextWeek">
          <b-button class="schedule_page-empty-button" variant="outline-primary" size="md" @click="setSchedule">
            Сформировать расписание
          </b-button>
        </template>
      </div>
      <div v-else class="schedule_page-empty">
        <h3 class="schedule_page-empty-title">Расписание на данный день не найдено</h3>
      </div>
    </template>
    <div v-else class="workshifts-empty">
      <i class="fi flaticon-load-workshift"></i>
      <h3>Для отображения расписания<br/>выберите группу</h3>
    </div>
    <helper>
      <model-schedule v-if="helperOpened"
                      :is-model="true"
                      :modelData="currentProfile.profile.user"
                      :office="currentOffice"
                      :hasCredentials="currentProfile.credentials && !!currentProfile.credentials.length"
                      :default-date="activeDate"
                      :absences="currentProfile.absences"
                      :workshiftPeriods="periods"
                      @saveSchedule="saveSchedule"
      />
    </helper>
  </div>
</template>

<script>
import Helper from '@/components/Helper/Helper.vue';
import ModelSchedule from '@/components/ModelSchedule/ModelSchedule';
import Select from "@/components/Common/Select/Select";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import {mapState, mapActions} from 'vuex';
import moment from 'moment';

moment.locale('ru');

export default {
  name: 'model-schedule-page',
  components: {
    'helper': Helper,
    'custom-select': Select,
    'model-schedule': ModelSchedule,
    GroupSelect,
  },
  data() {
    return {
      activeDate: moment().format('YYYY-MM-DD'),
      dateFormat: 'week',
      modelShifts: {},
      scheduleStatuses: {
        created: 'Резерв',
        assigned: 'Назначена',
        canceled: 'Отменена',
        process: 'В процессе',
        completed: 'Завершена'
      },
      activeGroup: {
        rooms: []
      },
      currentOffice: null,
      // activeOffice: {},
      officeColor: null,
      modelScheduleArray: [],
      nextWeekBorders: {}
    }
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('layout', ['layoutStatus', 'helperOpened']),
    ...mapState('schedule', ['schedule', 'scheduleAbility']),
    currentDatesText() {
      if (this.dateFormat === 'day') return moment(this.activeDate).format('dddd, DD.MM.YYYY');
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-1);
      let text = date.format('DD.MM.YYYY');
      date.add(6, 'd');
      return `${text} - ${date.format('DD.MM.YYYY')}`;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
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
    isNextWeek() {
      let dateObj = moment(this.activeDate);
      return (dateObj >= this.nextWeekBorders.from) && (dateObj <= this.nextWeekBorders.to);
    },
    currentProfile() {
      return this.$store.state.profile.currentProfile;
    },
    shiftsFiltered() {
      let result = {};
      if (this.dateFormat === 'day') {
        if (this.modelShifts[this.activeDate]) {
          result[this.activeDate] = this.modelShifts[this.activeDate];
        }
        return result;
      } else return this.modelShifts;
    },
    isShiftsEmpty() {
      return !Object.keys(this.shiftsFiltered || {}).length;
    },
    modelShiftsIsEmpty() {
      return Object.getOwnPropertyNames(this.modelShifts).length === 1
    },
    currentWorkshifts() {
      return this.$store.state.schedule.currentWorkshifts
    },
    modelOffices() {
      return this.$store.state.dictionaries.offices;
    },
    periods() {
      return this.$store.state.schedule.periods;
    },
  },
  watch: {
    user: function (newUser) {
      if (newUser.id) this.fetchProfile({userId: newUser.id})
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close' && this.modelScheduleArray.length) {
        this.createSchedule({
          work_shift_interval: this.modelScheduleArray,
          model: this.user.id,
          group: this.currentOffice
        })
      }
    },
    currentOffice: function (newOffice) {
      // console.log(newOffice);
      // this.officeColor = this.modelOffices.find(office => office.id === newOffice).color;
      // if(newOffice) this.fetchModelWorkShifts({ office: this.currentOffice, workweek: this.activeDate });
      if (newOffice) this.updateWorkshifts(this.activeDate, newOffice);
      else this.modelShifts = {};
    },
    currentWorkshifts: function (newSchedule) {
      if (newSchedule.length === undefined) this.modelShifts = newSchedule;
      else this.modelShifts = {};
    },
    schedule: function () {
      if (this.currentOffice) this.updateWorkshifts();
    },
  },
  created() {
    if (this.user.id) this.fetchProfile({userId: this.user.id});
    this.$store.dispatch('dictionaries/fetchGroupsByType', 'office');
    if (moment().weekday() === 6) this.nextWeekBorders = {
      from: moment().add(1, 'week'),
      to: moment().add(13, 'days')
    };
    else this.nextWeekBorders = {
      from: moment().weekday(5),
      to: moment().weekday(12)
    };
  },
  methods: {
    ...mapActions('profile', ['fetchProfile']),
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('schedule', ['createSchedule']),
    shiftProps(status, index) {
      return Object.values(this.scheduleStatuses.find(function (shiftStatus) {
        if (Object.keys(shiftStatus)[0] === status) return shiftStatus
      }))[0][index]
    },
    setDateFormat(format) {
      this.dateFormat = format;
    },
    setSchedule() {
      // this.activeOffice = this.modelOffices.find(office => office.id === this.currentOffice);
      if (this.userPermissions.schedule.edit)
        this.toggleHelper(true)
    },
    saveSchedule(schedule) {
      this.modelScheduleArray = schedule
    },
    formatDateTime(date) {
      return moment(date).format('DD.MM.YYYY, HH:mm');
    },
    getDayTitle(day) {
      return moment(day).locale('ru').format('dd')
    },
    addDate() {
      let date = moment(this.activeDate);
      date.add(this.dateFormat === 'day' ? 1 : 7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      if ((date.weekday() === 6) || (this.dateFormat === 'week')) {
        this.updateWorkshifts();
      }
    },
    subtractDate() {
      let date = moment(this.activeDate);
      date.subtract(this.dateFormat === 'day' ? 1 : 7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      if ((date.weekday() === 5) || (this.dateFormat === 'week')) {
        this.updateWorkshifts();
      }
    },
    updateWorkshifts(newDate = this.activeDate, newOffice = this.currentOffice) {
      this.$store.dispatch('schedule/fetchModelWorkShifts', {office: newOffice.id, workweek: newDate});
      this.$store.dispatch('schedule/fetchPeriodsForGroup', {group: newOffice.id, workweek: newDate});
    }
  }
}
</script>