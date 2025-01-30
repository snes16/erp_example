<template>
  <div v-if="(userType === 'operator' || userType === 'model') && isMyProfile"
       class="card profile_main-card d-flex justify-content-between"
  >
    <div class="personal_operator-card-header -schedule">
      <div class="profile_main-card-header-schedule_picker"
           :class="{'w-100': isModel && showMobile}"
      >
        <h3 v-if="!showMobile && isModel || isOperator" class="profile_main-card-header-schedule_picker-title">Расписание</h3>
        <div class="profile_main-card-header-schedule_picker-picker">
          <div v-if="isPrevReportDay && !isNeedScheduleFilled && isModel"
               class="profile_main-card-header-schedule_picker-picker-circle"
          />
          <p class="profile_main-card-header-schedule_picker-picker-arrow ml-0"
             @click="setWeek('last')"
          ><i class="fa fa-angle-left mr-1"/></p>
          <div class="personal_operator-card-header-date">
            <p>{{ beginningWeek }}</p>
            <p>-</p>
            <p>{{ weekEnd }}</p>
          </div>
          <p class="profile_main-card-header-schedule_picker-picker-arrow mr-0"
             @click="setWeek('next')"
          ><i class="fa fa-angle-right ml-1"/></p>
          <div v-if="isNextReportDay && !isNeedScheduleFilled && isModel" class="profile_main-card-header-schedule_picker-picker-circle"/>
        </div>
      </div>
      <div v-if="isModel && isEmptyWeek && !showMobile && !isPastWeek"
           class="personal_operator-card-header-edit cursor-pointer"
           @click="fillSchedule"
      >
        <span class="payment_info-text-blue mr-2_5">Заполнить</span>
        <pen class="mb-1"/>
      </div>
      <h4 :class="{'mt-2': showMobile}" v-if="isOperator"> $ {{ commonProfit }} </h4>
    </div>
    <template v-if="showMobile && !isModel">
      <div v-if="!isEmptyWeek" class="personal_operator-card-schedule_mobile">
        <div v-for="(daySchedule, date) in formattedPersonalSchedule" class="personal_operator-card-schedule_mobile-day" :key="date">
          <div class="personal_operator-card-schedule_mobile-day-trigger" @click="toggleDayCollapse(currentWeekDays[date].dayNumber)">
            <div class="personal_operator-card-schedule_mobile-day-trigger-main">
              <i class="fa fa-angle-right personal_operator-card-schedule_mobile-day-trigger-main-angle"
                 :class="{'-active': collapseStatuses[currentWeekDays[date].dayNumber]}"
              />
              <b class="personal_operator-card-schedule_mobile-day-trigger-main-title">{{ currentWeekDays[date].dayNumberText }}</b>
              <span>{{ formattedPersonalScheduleInfo[date].shiftsNumberText }}</span>
            </div>
            <div v-if="formattedPersonalScheduleInfo[date].hasCompletedStatus"
                 class="personal_operator-card-schedule_mobile-day-trigger-sum"
            >
              <span>{{ formattedPersonalScheduleInfo[date].sum }}</span>
              <dollar class="personal_operator-card-schedule_mobile-day-trigger-sum-icon"
                      :class="{'-unpaid': formattedPersonalScheduleInfo[date].hasUnpaidShifts}"
              />
            </div>
          </div>
          <b-collapse :visible="collapseStatuses[currentWeekDays[date].dayNumber]" class="personal_operator-card-schedule_mobile-day-collapse">
            <div v-for="(shift, index) in daySchedule" class="personal_operator-card-schedule_mobile-day-collapse-shift" :key="index">
              <div class="personal_operator-card-schedule_mobile-day-collapse-shift-container">
                <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row">
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-title">МОДЕЛЬ</div>
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-value">{{ shift.model.model_nickname }}</div>
                </div>
                <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row">
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-title">НАЧАЛО</div>
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-value">{{ shift.start_at || shift.planned_start_at }}</div>
                </div>
                <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row">
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-title">КОНЕЦ</div>
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-value">{{ shift.end_at || shift.planned_end_at }}</div>
                </div>
                <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row"
                     :class="{'mb-1': shift.status !== 'completed'}"
                >
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-title">СТАТУС</div>
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-value">
                    <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status_container-status"
                        :class="`-${shift.status}`"
                    >{{ workshiftStatuses[shift.status] }}</div>
                  </div>
                </div>
                <template v-if="shift.status === 'completed'">
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row">
                    <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-title">ЗАРАБОТОК</div>
                    <div class="personal_operator-card-schedule_mobile-day-collapse-shift-row-value">$ {{ shift.shown_profit || 0 }}</div>
                  </div>
                  <div class="personal_operator-card-schedule_mobile-day-collapse-shift-add_payment"
                       :class="{'-unpaid': shift.profit === null}"
                       @click="openIncomeDetails(shift.id)"
                  >
                    <span v-if="shift.profit === null">Добавить поступления</span>
                    <span v-else>Изменить поступления</span>
                    <div class="personal_operator-card-schedule_mobile-day-collapse-shift-add_payment-icon">
                      <dollar/>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
      <div v-else class="personal_operator-card-schedule_mobile -empty">Нет смен</div>
    </template>
    <div v-else class="profile_main-card-body -paddingless">
      <div v-if="!isEmptyWeek" class="profile_main-card-body-schedule -fixed">
        <div v-for="(daySchedule, date) in formattedPersonalSchedule" class="profile_main-card-body-schedule-days" :key="date">
          <div class="personal_operator-card-body-schedule-days-day">
            <div class="profile_main-card-body-schedule-days-day-title">{{ moment(date).format('dd') }}</div>
            <div class="profile_main-card-body-schedule-days-day-period_field">
              <div class="profile_main-card-body-schedule-days-day-period_field-period">
                <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts">
                  <div v-for="shift in daySchedule"
                       class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift"
                       :class="{'-not_paid': (shift.profit === null) && (shift.status === 'completed') && isOperator}"
                       :key="shift.id"
                  >
                    <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift"
                        :class="{'-model_line': isModel}"
                    >
                      <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-model">
                        <span v-if="isOperator">{{ shift.model.model_nickname }}</span>
                        <span v-else>{{ shift.room_title }}</span>
                      </div>
                      <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-from">
                        <span v-if="shift.start_at">{{ shift.start_at }}</span>
                        <span v-else>{{ shift.planned_start_at }}</span>
                      </div>
                      <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-to">
                        <span v-if="shift.end_at">{{ shift.end_at }}</span>
                        <span v-else>{{ shift.planned_end_at }}</span>
                      </div>
                      <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status_container">
                        <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status_container-status"
                            :class="`-${shift.status}`"
                        >{{ workshiftStatuses[shift.status] }}</div>
                      </div>
                      <template v-if="isOperator">
                        <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-profit">
                          <span v-if="shift.status === 'completed'">{{ shift.shown_profit || 0 }}</span>
                        </div>
                        <div class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-info">
                          <dollar v-if="shift.status === 'completed'"
                                  class="personal_operator-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-info-icon"
                                  :id="`info-${shift.id}`"
                                  @click="openIncomeDetails(shift.id)"
                          />
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="isModel && !isPastWeek"
           class="personal_operator-card-body-schedule-without_workshifts"
           :class="{'flex-column p-0' : showMobile, '-last_saturday' : week === needFillingWeek}">
        <model v-if="showMobile" class="personal_operator-card-body-schedule-model_icon"/>
        <exclamation class="personal_operator-card-body-schedule-exclamation_icon mr-2_5"/>
        <span class="personal_operator-card-body-schedule-without_workshifts-text -empty">Пожалуйста, заполните расписание на неделю</span>
        <b-button v-if="showMobile" variant="primary" class="btn personal_operator-card-body-schedule-without_workshifts-button" @click="fillSchedule">Заполнить</b-button>
      </div>
      <div v-else class="pl-4 mt-2_5 mb-2_5">
        <span class="personal_operator-card-body-schedule-without_workshifts-text">Нет смен</span>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select.vue";
import model from '@/assets/vue-svg/model.svg';
import dollar from "@/assets/vue-svg/dollar.svg";
import moment from 'moment';
import { pluralizeWords } from "@/tools/tools";
import pen from "@/assets/vue-svg/pen.svg";
import exclamation from "@/assets/vue-svg/exclamation.svg"

moment.locale('ru');

export default {
  name: 'widget-personal-schedule',
  props: {
    profile: Object,
    userPermissions: Object,
    userType: String,
    isMyProfile: Boolean,
    userId: Number,
    showStatusPoint: Boolean,
    showMobile: Boolean,
  },
  components: {
    'date-picker': DatePicker,
    'custom-select': Select,
    exclamation: exclamation,
    dollar: dollar,
    pen: pen,
    model: model,
  },
  data() {
    return {
      moment: moment,
      week: 0,
      collapseStatuses: [false, false, false, false, false, false, false],
    }
  },
  computed: {
    status() {
      return this.$store.state.profile.status;
    },
    isPastWeek() {
      return (moment().isoWeekday() === 7 ? 1 : 0) > this.week;
    },
    isNextReportDay() {
      return this.week < this.needFillingWeek;
    },
    isPrevReportDay() {
      return this.week > this.needFillingWeek;
    },
    needFillingWeek() {
      return moment().isBefore(moment().isoWeekday(6)) ? 0 : 1;
    },
    currentDate() {
      return moment().format('YYYY-MM-DD');
    },
    beginningWeek() {
      return moment().isoWeekday(0).add(this.week, 'week').format('DD.MM.YYYY');
    },
    isModel() {
      return this.$store.state.auth.user.role.code === 'ROLE_MODEL';
    },
    isOperator() {
      return this.$store.state.auth.user.role.code === 'ROLE_OPERATOR';
    },
    weekEnd() {
      return moment().isoWeekday(6).add(this.week, 'week').format('DD.MM.YYYY');
    },
    currentWeekDays() {
      const currentWeekDays = {},
          day = moment().isoWeekday(0).add(this.week, 'week');

      for (let i = 0; i < 7; i++) {
        currentWeekDays[day.format('YYYY-MM-DD')] = {
          dayNumber: i,
          dayNumberText: day.format('dd'),
        };
        day.add(1, 'day');
      }
      return currentWeekDays;
    },
    personalSchedule() {
      return this.$store.state.profile.personalSchedule;
    },
    isEmptyWeek() {
      return Array.isArray(this.personalSchedule);
    },
    formattedPersonalSchedule() {
      const formattedSchedule = {};
      for (const date in this.personalSchedule) {
        formattedSchedule[date] = this.personalSchedule[date].map(shift => {
          return {
            ...shift,
            shown_profit: this.formatNumber(shift?.profit)
          };
        });
      }
      return formattedSchedule;
    },
    formattedPersonalScheduleInfo() {
      const formattedPersonalScheduleInfo = {},
          words = ['смена', 'смены', 'смен'];

      for (const date in this.formattedPersonalSchedule) {
        let sum = 0,
            hasUnpaidShifts = false,
            hasCompletedStatus = false;

        this.formattedPersonalSchedule[date].forEach(shift => {
          sum += shift.profit;
          if ((shift.profit === null) && (shift.status === 'completed')) hasUnpaidShifts = true;
          if (shift.status === 'completed') hasCompletedStatus = true;
        });

        formattedPersonalScheduleInfo[date] = {
          shiftsNumberText: `${this.formattedPersonalSchedule[date].length} ${pluralizeWords(this.formattedPersonalSchedule[date].length, words)}`,
          sum: this.formatNumber(sum),
          hasUnpaidShifts,
          hasCompletedStatus,
        };
      }
      return formattedPersonalScheduleInfo;
    },
    commonProfit() {
      let totalProfit = 0;
      for (const date in this.personalSchedule) {
        this.personalSchedule[date].forEach(shift => {
          if (shift.profit) {
            totalProfit += shift.profit;
          }
        });
      }
      return this.formatNumber(parseFloat(totalProfit.toFixed(2)));
    },
    workshiftStatuses() {
      if (this.showStatusPoint) return  { assigned: "Наз.", canceled: "Отм.", completed: "Зав.", created: "В рез.", process: "В про."};
      return this.$store.state.schedule.workshiftStatuses;
    },
    isNeedScheduleFilled() {
      return this.$store.state.profile.isNeedScheduleFilled;
    },
  },
  watch: {
    profile: function (newProfile, oldProfile) {
      if (newProfile) {
        this.fetchSchedule({workweek: this.beginningWeek});
        if (!oldProfile.id)
          moment().isoWeekday() === 7 ? this.week = 1 : this.week = 0;
      }
    },
    status: function (newStatus, prevStatus) {
      if ( prevStatus === 'editing-incomes' && newStatus === '' ) {
        this.fetchSchedule({workweek: this.beginningWeek});
      }
    },
  },
  created() {
    if (moment().isoWeekday() === 7) this.week++;
    if (this.beginningWeek === moment().isoWeekday(0).add(this.needFillingWeek, 'week').format('DD.MM.YYYY'))
      this.fetchSchedule({workweek: this.beginningWeek, isLastSaturday: true});
    else {
      this.fetchSchedule({workweek: this.beginningWeek});
      this.fetchSchedule({
        workweek: moment().isoWeekday(0).add(this.needFillingWeek, 'week').format('DD.MM.YYYY'),
        isLastSaturday: true
      });
    }
  },
  methods: {
    fillSchedule() {
      const scheduleData = {
        week: this.week,
        workshifts: this.formattedPersonalSchedule,
      }

      this.$emit('openScheduleFilling', scheduleData);
    },
    formatNumber(number) {
      if (!number) return 0;
      return parseFloat(number).toFixed(2).replace(/(\.0*|(?<=(\..*[^0])0*))$/, "");
    },
    fetchSchedule(data) {
      this.$store.dispatch('profile/fetchPersonalSchedule',
          {id: this.userId, workweek: data.workweek, isLastSaturday: data?.isLastSaturday});
    },
    setWeek(week) {
      if (week === 'next') this.week++;
      else if (week === 'last') this.week--;
      this.fetchSchedule({workweek: this.beginningWeek});
    },
    openIncomeDetails(shiftId) {
      this.$emit('openIncomeDetails', shiftId);
    },
    toggleDayCollapse(day) {
      this.collapseStatuses = this.collapseStatuses.map((status, number) => day === number ? !status : status);
    },
  }
}
</script>