<template>
  <div class="incomes-details">
    <div class="workshift_details-header theme-helper-content-main-header">
      <button-throbber
          class="incomes-button"
          size="sm"
          variant="outline-primary"
          colorThrobber="primary"
          @click="checkBeforeSubmit"
      >Сохранить</button-throbber>
    </div>
    <div class="schedule_filling-content">
      <div class="schedule_filling">
        <div class="schedule_filling-container">
          <div class="schedule_filling-container-header p-0">
            <h3>Заполнение расписания</h3>
            <h3 class="mb-3">{{ beginningWeek }} - {{ weekEnd }}</h3>
            <p><b>Минимальное количество смен: {{ template.min_shifts }}</b></p>
          </div>
          <div class="card schedule_filling-container-card">
            <div class="schedule_filling-container-card-row flex-column">
              <div class="schedule_filling-container-card-row-label pb-2">Выберите дни рабочих смен</div>
              <div class="schedule_filling-container-card-row-content">
                <b-button v-for="(day, key) in days"
                          variant="default"
                          size="sm"
                          class="btn-tab"
                          :class="{'active': activeDays.includes(key), '-disabled': (day.type === 'admin') || (day.type === 'absence')}"
                          :id="`day-button-${key}`"
                          v-b-tooltip.hover
                          :title="day.message"
                          @click="toggleDay(day, key)"
                >{{ day.title }}
                </b-button>
              </div>
            </div>
            <div v-if="activeDays.length" class="schedule_filling-container-card-row">
              <div class="schedule_filling-container-card-row-label">Укажите время смен</div>
              <div class="schedule_filling-container-card-row-content">
                <b class="text-size-small">С</b>
                <date-picker v-model="allDaysStart"
                             class="ml-1"
                             lang="ru"
                             type="time"
                             placeholder="Время"
                             :time-picker-options="time_periods"
                             format='HH:mm'
                             @change="changeAllTime('Start')"
                >
                  <clock slot="calendar-icon" class="schedule_filling-container-card-row-content-datepicker-icon"/>
                </date-picker>
                <b class="ml-3 text-size-small">ДО</b>
                <date-picker v-model="allDaysEnd"
                             class="ml-1"
                             lang="ru"
                             type="time"
                             placeholder="Время"
                             :time-picker-options="time_periods"
                             format='HH:mm'
                             @change="changeAllTime('End')"
                >
                  <clock slot="calendar-icon" class="schedule_filling-container-card-row-content-datepicker-icon"/>
                </date-picker>
              </div>
            </div>
            <div class="schedule_filling-container-card-table">
              <div class="schedule_filling-container-card-table-row -head">
                <div class="schedule_filling-container-card-table-row-cell -day"></div>
                <div class="schedule_filling-container-card-table-row-cell -time">Начало</div>
                <div class="schedule_filling-container-card-table-row-cell -time">Конец</div>
                <div class="schedule_filling-container-card-table-row-cell -message"></div>
              </div>
              <div v-for="(day, key) in days"
                   v-if="day.type !== 'inactive'"
                   class="schedule_filling-container-card-table-row"
              >
                <div class="schedule_filling-container-card-table-row-cell -day">
                  <p class="schedule_filling-container-card-table-row-cell-title">{{ day.title }}</p>
                  <p class="schedule_filling-container-card-table-row-cell-subtitle">{{ day.subtitle }}</p>
                </div>
                <div class="schedule_filling-container-card-table-row-cell -time">
                  <span v-if="day.type === 'admin'" class="text-gray-text">{{ day.start_at }}</span>
                  <date-picker v-else-if="day.type === 'active'"
                               v-model="timeStart[key]"
                               class="hide_styles_datepicker"
                               :class="{'-error': startErrors.includes(key)}"
                               lang="ru"
                               type="time"
                               placeholder="Время"
                               :time-picker-options="time_periods"
                               format='HH:mm'
                               @change="changeInput('start', key)"
                  ><i slot="calendar-icon" class="d-none"/></date-picker>
                </div>
                <div class="schedule_filling-container-card-table-row-cell -time">
                  <span v-if="day.type === 'admin'" class="text-gray-text">{{ day.end_at }}</span>
                  <date-picker v-else-if="day.type === 'active'"
                               v-model="timeEnd[key]"
                               class="hide_styles_datepicker"
                               :class="{'-error': endErrors.includes(key)}"
                               lang="ru"
                               type="time"
                               placeholder="Время"
                               :time-picker-options="time_periods"
                               format='HH:mm'
                               @change="changeInput('end', key)"
                  ><i slot="calendar-icon" class="d-none"/></date-picker>
                </div>
                <div class="schedule_filling-container-card-table-row-cell -message">
                  <span v-if="day.type === 'admin'" class="text-gray-text text-size-small text-fw-400">Смена назначена</span>
                  <span v-else-if="day.type === 'absence'" class="text-gray-text text-size-small text-fw-400">Запланировано отсутствие</span>
<!--                  <div v-else class="schedule_filling-container-card-table-row-cell-actions">
                    <i id="users-delete"
                       class="glyphicon glyphicon-trash_alt cursor-pointer"
                       @click="toggleDay(day, key)"
                    />
                  </div>-->
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-modal id="not-enough-shifts"
                 ref="not-enough-shifts-modal"
                 centered
                 title="Невозможно отправить расписание"
                 body-bg-variant="white"
                 ok-only
                 ok-title="Закрыть"
                 ok-variant="primary"
                 hide-header-close
        >
          <span class="text-fw-400">Для отправки расписания заполните недостающие смены. Количество смен не может быть меньше {{ template.min_shifts }}</span>
        </b-modal>
        <b-modal id="submit-confirm"
                 ref="submit-confirm-modal"
                 centered
                 title="Вы уверены, что хотите отправить расписание?"
                 body-bg-variant="white"
                 ok-title="Отправить"
                 ok-variant="primary"
                 cancel-title="Отменить"
                 cancel-variant="outline-primary"
                 hide-header-close
                 @ok="submitSchedule"
        >
          <span class="text-fw-400">После отправки редактирование расписания будет невозможно</span>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
import TimeInput from "@/pages/Workshifts/components/TimeInput";
import DatePicker from 'vue2-datepicker';
import Avatar from "@/components/Common/Avatar/Avatar";
import at from "@/assets/vue-svg/at.svg";
import buttonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import clock from "@/assets/vue-svg/clock.svg";
import { showToast } from "@/tools/tools";
import moment from "moment";

moment.locale('ru');

const daysTitles = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

export default {
  name: 'filling-schedule',
  props: {
    // absences: Array,
    workshifts: Object,
    week: Number,
    min_shifts: Number,
    userId: Number,
  },
  components: {
    TimeInput,
    DatePicker,
    'clock': clock,
    buttonThrobber,
    'avatar': Avatar,
    'at': at,
  },
  data() {
    return {
      template: {},
      activeDays: [],
      timeStart: [],
      timeEnd: [],
      startErrors: [],
      endErrors: [],
      time_periods: {start: '00:00', step: '00:30', end: '23:30'},
      allDaysStart: null,
      allDaysEnd: null,
      submitData: null,
    }
  },
  computed: {
    status() {
      return this.$store.state.profile.status;
    },
    needFillingWeek() {
      return moment().isBefore(moment().isoWeekday(6)) ? 0 : 1;
    },
    beginningWeek() {
      return moment().isoWeekday(0).add(this.week, 'week').format('DD.MM.YYYY');
    },
    weekEnd() {
      return moment().isoWeekday(6).add(this.week, 'week').format('DD.MM.YYYY');
    },
    formattedAbsences() {
      if (!this.absences) return [];
      return this.absences.map(absence => ({
        type: absence.type,
        start: moment.parseZone(absence.start_at),
        end: moment.parseZone(absence.end_at),
      }));
    },
    days() {
      if (!this.template.workweek) return [];
      let date = moment.parseZone(this.template.workweek);
      if (date.weekday() !== 6) date.weekday(-1);
      date.subtract(1, 'day');
      return daysTitles.map((title, key) => {
        date.add(1, 'day');
        let absence = this.formattedAbsences.find(absence => (date >= absence.start) && (date <= absence.end));
        if (absence) return {
          title,
          subtitle: date.format('DD.MM'),
          absence,
          type: 'absence',
          message: 'В этот день назначено отсутствие',
        }

        let adminShift = this.template.workshifts?.[date.format('YYYY-MM-DD')]?.[0];
        if (adminShift) return {
          title,
          subtitle: date.format('DD.MM'),
          start_at: adminShift.planned_start_at,
          end_at: adminShift.planned_end_at,
          type: 'admin',
          message: 'Смена на этот день уже назначена',
        }

        return {
          title,
          subtitle: date.format('DD.MM'),
          type: this.activeDays.includes(key) ? 'active' : 'inactive',
          date: date.format('YYYY-MM-DD'),
        };
      });
    },
    absences() {
      return this.$store.state.profile.absences;
    },
  },
  created() {
    this.template = {
      workshifts: this.workshifts,
      absences: this.absences,
      min_shifts: this.min_shifts,
      workweek: moment().isoWeekday(3).add(this.week, 'week'),
    }
  },
  mounted() {
    this.$store.dispatch('profile/fetchAbsences', {user: this.userId, 'date[workweek]': this.days[0].date, pagination: false});
  },
  methods: {
    toggleDay(day, key) {
      if (day.type === 'absence') {
        if (window.innerWidth < 577) showToast(this.$toasted, 'В этот день назначено отсутствие', 'show');
        return;
      } else if (day.type === 'admin') {
        if (window.innerWidth < 577) showToast(this.$toasted, 'Смена на этот день уже назначена', 'show');
        return;
      }
      if (this.activeDays.includes(key)) this.activeDays = this.activeDays.filter(day => day !== key);
      else this.activeDays = [...this.activeDays, key];
    },
    checkBeforeSubmit() {
      let data = {
            workshifts: [],
          },
          shifts = 0,
          isError = false;

      this.days.forEach((day, key) => {
        if (day.type === 'active') {
          shifts++;
          if (!this.timeStart[key] || !this.timeEnd[key]) {
            if (!this.timeStart[key]) this.startErrors = [...this.startErrors, key];
            if (!this.timeEnd[key]) this.endErrors = [...this.endErrors, key];
            isError = true;
            return;
          }
          data.workshifts.push({
            from: moment(this.timeStart[key]).format('HH:mm'),
            to: moment(this.timeEnd[key]).format('HH:mm'),
            period_date: day.date,
          });
        } else if ((day.type === 'admin') || (day.type === 'absence')) shifts++;
      });
      if (isError) return;
      if (shifts < this.template.min_shifts) return this.$refs['not-enough-shifts-modal'].show();
      this.submitData = {data, id: this.userId};
      if (this.week === this.needFillingWeek)
        this.submitData.isNeedFilling = true;
      this.$refs['submit-confirm-modal'].show();
    },
    submitSchedule() {
      this.$store.dispatch('profile/sendPersonalSchedule', this.submitData);
    },
    changeAllTime(type) {
      let time = this[`allDays${type}`].getTime();
      return this[`time${type}`] = [new Date(time), new Date(time), new Date(time), new Date(time), new Date(time), new Date(time), new Date(time)];
    },
    changeInput(type, key) {
      this[`${type}Errors`] = this[`${type}Errors`].filter(error => error !== key);
    },
  },
}
</script>