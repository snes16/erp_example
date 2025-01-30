<template>
  <div class="workshifts">
    <h3 class="workshifts-header mb-0">Расписание</h3>
    <div class="workshifts-header-filters">
      <h5 class="mb-0">
        <date-scroll v-model="activeDate" :type="dateFormat" bold showIcon @change="updateData"/>
      </h5>
      <div class="workshifts-filters-main-date">
        <div class="workshifts-filters-main-date-format" :class="dateFormat === 'day' ? '-active' : ''" @click="setDateFormat('day')">День</div>
        <div class="workshifts-filters-main-date-format" :class="dateFormat === 'week' ? '-active' : ''" @click="setDateFormat('week')">Неделя</div>
      </div>
    </div>
    <div v-if="showAnyShifts" class="workshifts-operators_table card">
      <div class="workshifts-operators_table-day -head">
        <div class="workshifts-operators_table-day-title"></div>
        <div class="workshifts-operators_table-day-shifts">
          <div class="workshifts-operators_table-day-shifts-shift">
            <div class="workshifts-operators_table-day-shifts-shift-block -model">Модель</div>
            <div class="workshifts-operators_table-day-shifts-shift-block -from">Начало</div>
            <div class="workshifts-operators_table-day-shifts-shift-block -to">Конец</div>
            <div class="workshifts-operators_table-day-shifts-shift-block -status">Статус</div>
            <div class="workshifts-operators_table-day-shifts-shift-block -comment"></div>
          </div>
        </div>
      </div>
      <div v-for="(title, date) in activeDateNames" v-if="currentSchedule && currentSchedule[date]" class="workshifts-operators_table-day">
        <div class="workshifts-operators_table-day-title">{{ title }}</div>
        <div class="workshifts-operators_table-day-shifts text-fw-400">
              <div v-for="shift in filteredShifts[date]" class="workshifts-operators_table-day-shifts-shift" @click="clickRow(shift, date)">
                <div v-if="shift.model && shift.model.model_nickname" class="d-flex align-items-center workshifts-operators_table-day-shifts-shift-block -nickname">
                  <at class="workshifts-operators_table-nickname_icon"/>
                  <b class="text-ellipsis">{{ shift.model.model_nickname }}</b>
                </div>
                <div v-if="shift.model && shift.model.uid" class="workshifts-operators_table-day-shifts-shift-block -uid">
                  <span class="text-ellipsis text-gray">{{ shift.model.uid }}</span>
                </div>
<!--                <time-input v-model="shift.start_at"
                            :endPeriodThreshold="endPeriodThreshold"
                            :date="date"
                            :placeholder="getTimeFromDate(shift.planned_start_at)"
                            :disabled="((shift.status !== 'assigned') && (shift.status !== 'process')) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.start.date.edit)"
                            @input="changeShiftTime(shift)"
                />-->
                <div class="workshifts-operators_table-day-shifts-shift-block -from">{{ shift.start_at || shift.planned_start_at }}</div>
                <div class="workshifts-operators_table-day-shifts-shift-block -to">{{ shift.end_at || shift.planned_end_at }}</div>
                <div class="workshifts-operators_table-day-shifts-shift-block -status">
                  <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-status" :class="`-${shift.status}`">{{ workshiftStatuses[shift.status] }}</div>
                </div>
               <div class="workshifts-operators_table-day-shifts-shift-block -comment" @click.prevent.stop>
<!--                  <span class="glyphicon glyphicon-info" :id="`comments-${shift.id}`"></span>-->
<!--                  <b-popover v-if="shift.comments && shift.comments.length && shift.comments.filter(comment => comment.type !== 'system').length" custom-class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments" :target="`comments-${shift.id}`" triggers="hover">-->
<!--                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-header">Информация о смене</div>-->
<!--                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body">-->
<!--                      <template v-for="comment in shift.comments">-->
<!--                        <div v-if="comment.type !== 'system'" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment">-->
<!--                          <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-avatar">-->
<!--                            <div class="avatar -sm" :style="comment.user.avatar ? `background-image: url(${comment.user.avatar}); background-size: cover;` : ''" />-->
<!--                          </div>-->
<!--                          <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main">-->
<!--                            <p class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main-author">{{ comment.user.fullname }}</p>-->
<!--                            <p>{{ comment.text }}</p>-->
<!--                            <p class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main-date">{{ getTimeFromDate(comment.created_at) }}</p>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </template>-->
<!--                    </div>-->
<!--                  </b-popover>-->
                </div>
            </div>
        </div>
      </div>
    </div>
    <div v-else class="workshifts-edit-main-empty">
      <h3>Расписание на данный день не найдено</h3>
    </div>
    <helper>
      <workshift-details v-if="droverType === 'details'"
                         :workshift="activeWorkshift"
                         :shift-date="activeShiftDate"
                         operatorSchedule
                         @closeDrover="closeDrover"
                         @miniProfile="openMiniProfile"
      />
      <!--                         @openSchedule="openScheduleFromShift"-->
      <mini-profile v-else-if="droverType === 'mini-profile'"
                    :user-id="activeUser.id"
                    @close="closeDrover"
                    @openWorkshiftDetails="openWorkshiftDetails"
      />
    </helper>
  </div>
</template>

<script>
import Helper from '@/components/Helper/Helper.vue';
import Details from "./components/Details";
import DateScroll from "@/pages/Management/components/DateScroll";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import at from "@/assets/vue-svg/at.svg";
import moment from "moment";

export default {
  name: 'workshifts-for-operator',
  components: {
    'date-scroll': DateScroll,
    'helper': Helper,
    'workshift-details': Details,
    'mini-profile': MiniProfile,
    'at': at,
  },
  data() {
    return {
      activeDate: moment().format('YYYY-MM-DD'),
      dateFormat: 'week',
      activeWorkshift: {},
      activeUser: {},
      currentScheduleDate: null,
      activeShiftDate: null,
      droverType: null,
    }
  },
  computed: {
    currentSchedule() {
      return this.$store.state.schedule.currentScheduleMiniProfile;
    },
    filteredShifts() {
      const filteredSchedule = {};
      for (const date in this.currentSchedule) {
        if (!this.currentSchedule.hasOwnProperty(date)) {
          continue;
        }
        const allShifts = [];
        for (const shiftsInPeriod in this.currentSchedule[date]) {
          if (!this.currentSchedule[date].hasOwnProperty(shiftsInPeriod)) {
            continue;
          }
          const shiftsData = this.currentSchedule[date][shiftsInPeriod];
          Object.values(shiftsData).forEach(shift => {
            if (shift.workshifts) {
              allShifts.push(...shift.workshifts.filter(shift => shift.access));
            }
          });
        }
        if (allShifts.length > 0) {
          const sortedShifts = allShifts.sort((a, b) => {
            return this.compareStartTime(a, b, 'start_at', 'start_at_date');
          });
          filteredSchedule[date] = sortedShifts;
        }
      }
      return filteredSchedule;
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    updatedWorkshift() {
      return this.$store.state.schedule.updatedWorkshift;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    activeDateNames() {
      let date = moment(this.activeDate),
          titles = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      if (this.dateFormat === 'day')
        return {[date.format('YYYY-MM-DD')]: titles[(date.weekday() + 1) % 7]};
      if (date.weekday() !== 6) date.weekday(-2);
      else date.weekday(5);
      let activeDateNames = {};
      titles.forEach(title => {
        date.add(1, 'd');
        const formattedDate = date.format('YYYY-MM-DD');
        if (formattedDate in this.filteredShifts) {
          activeDateNames[formattedDate] = title;
        }
      });
      return activeDateNames;
    },
    showAnyShifts() {
      if (!this.currentSchedule) return false;
      return Object.keys(this.activeDateNames).some(date => this.filteredShifts[date]);
    },
  },
  watch: {
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.updateData();
      }
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
          this.setCurrentWorkshifts();
          return;
        case '':
          if ((prevStatus === 'editing') || (prevStatus === 'canceling')) this.activeWorkshift = this.updatedWorkshift;
          return;
      }
    }
  },
  created() {
    this.updateData();
  },
  methods: {
    setDateFormat(format) {
      this.dateFormat = format;
    },
    compareStartTime(a, b, field, dateField) {
      const startAtDateA = a[dateField] || a['planned_' + dateField]  + 'T' + a[field] || a['planned_' + field];
      const startAtDateB = b[dateField] || b['planned_' + dateField]  + 'T' + b[field] || b['planned_' + field];
      return startAtDateA.localeCompare(startAtDateB);
    },
    updateData() {
      this.$store.dispatch('schedule/fetchModelScheduleMiniProfile', {'workweek': this.activeDate, pagination: false});
    },
    clickRow(shift, date) {
      this.activeWorkshift = shift;
      this.activeShiftDate = date;
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openWorkshiftDetails() {
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openMiniProfile(workshift) {
      this.droverBreadcrumbs = '';
      this.activeUser = workshift.model;
      this.droverType = 'mini-profile';
    },
    openScheduleFromShift(model) {
      this.showBackButtonInSchedule = true;
      this.$store.dispatch('profile/fetchAbsences', {
        user: model.id,
        workweek: this.activeShiftDate,
      });
      this.openSchedule(model);
    },
    openSchedule(model) {
      this.activeUser = model;
      this.currentScheduleDate = null;
      this.droverType = 'model-schedule';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
  },
}
</script>