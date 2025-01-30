<template>
  <div class="schedule">
    <div v-if="status === 'error'" class="schedule-error">
      <div class="schedule-error-image icon-group"></div>
      <h4>Страница не найдена или доступ запрещен</h4>
      <p>Страница отсутствует или у вас нет прав доступа для ее просмотра</p>
    </div>
    <div v-else class="schedule-container">
      <div class="schedule-container-header">
        <h4>Заполнение расписания {{ formattedDate }}</h4>
        <p v-if="status !== 'success'"><b>Минимальное количество смен: {{ template.min_shifts }}</b></p>
      </div>
      <div class="card schedule-container-card">
        <div v-if="status !== 'success'" class="schedule-container-card-row">
          <div class="schedule-container-card-row-label">Выберите дни рабочих смен</div>
          <div class="schedule-container-card-row-content">
            <b-button v-for="(day, key) in days"
                      variant="default"
                      size="sm"
                      class="btn-tab"
                      :class="{'active': activeDays.includes(key), '-disabled': (day.type === 'admin') || (day.type === 'absence')}"
                      :id="`day-button-${key}`"
                      v-b-tooltip.hover
                      :title="day.message"
                      @click="toggleDay(day, key)"
            >{{ day.title }}</b-button>
          </div>
        </div>
        <div v-if="(status !== 'success') && activeDays.length" class="schedule-container-card-row">
          <div class="schedule-container-card-row-label">Укажите время смен</div>
          <div class="schedule-container-card-row-content">
            <b>с</b>
            <date-picker v-model="allDaysStart"
                         class="hide_styles_datepicker ml-2"
                         lang="ru"
                         type="time"
                         placeholder="Время"
                         :time-picker-options="time_periods"
                         format='HH:mm'
                         @change="changeAllTime('Start')"
            ><clock slot="calendar-icon"/></date-picker>
            <b class="ml-2">до</b>
            <date-picker v-model="allDaysEnd"
                         class="hide_styles_datepicker ml-2"
                         lang="ru"
                         type="time"
                         placeholder="Время"
                         :time-picker-options="time_periods"
                         format='HH:mm'
                         @change="changeAllTime('End')"
            ><clock slot="calendar-icon"/></date-picker>
          </div>
        </div>
        <div class="schedule-container-card-table">
          <div class="schedule-container-card-table-row -head">
            <div class="schedule-container-card-table-row-cell -day"></div>
            <div class="schedule-container-card-table-row-cell -time">Начало</div>
            <div class="schedule-container-card-table-row-cell -time">Конец</div>
            <div class="schedule-container-card-table-row-cell -message"></div>
          </div>
          <div v-for="(day, key) in days"
               v-if="day.type !== 'inactive'"
               class="schedule-container-card-table-row"
          >
            <div class="schedule-container-card-table-row-cell -day">
              <p class="schedule-container-card-table-row-cell-title">{{ day.title }}</p>
              <p class="schedule-container-card-table-row-cell-subtitle">{{ day.subtitle }}</p>
            </div>
            <div class="schedule-container-card-table-row-cell -time">
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
                           :disabled="status === 'success'"
                           @change="changeInput('start', key)"
              ><i slot="calendar-icon" class="d-none"/></date-picker>
            </div>
            <div class="schedule-container-card-table-row-cell -time">
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
                           :disabled="status === 'success'"
                           @change="changeInput('end', key)"
              ><i slot="calendar-icon" class="d-none"/></date-picker>
            </div>
            <div class="schedule-container-card-table-row-cell -message">
              <span v-if="day.type === 'admin'" class="text-gray-text">Смена назначена</span>
              <span v-else-if="day.type === 'absence'" class="text-gray-text">Запланировано отсутствие</span>
              <div v-else-if="status !== 'success'" class="schedule-container-card-table-row-cell-actions">
                <span id="users-delete" class="glyphicon glyphicon-trash_alt cursor-pointer" @click="toggleDay(day, key)"></span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="status !== 'success'" class="schedule-container-card-footer">
          <b-button variant="outline-primary" class="schedule-container-card-footer-submit" @click="checkBeforeSubmit">Отправить</b-button>
        </div>
      </div>
    </div>
    <b-modal
        id="not-enough-shifts"
        ref="not-enough-shifts-modal"
        centered
        title="Невозможно отправить расписание"
        body-bg-variant="white"
        ok-only
        ok-title="Закрыть"
        ok-variant="primary"
        hide-header-close
    >Для отправки расписания заполните недостающие смены. Количество смен не может быть меньше {{ template.min_shifts }}</b-modal>
    <b-modal
        id="submit-confirm"
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
    >После отправки редактирование расписание будет невозможно</b-modal>
  </div>
</template>

<script>
import TimeInput from "@/pages/Workshifts/components/TimeInput";
import DatePicker from 'vue2-datepicker';
import clock from "@/assets/vue-svg/clock.svg";
import axios from "axios";
import { getPeriodsData, isNextDateInShift, showToast } from "@/tools/tools";
import moment from "moment";
moment.locale('ru');

const daysTitles = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

export default {
  name: 'schedule',
  components: {
    TimeInput,
    DatePicker,
    'clock': clock,
  },
  data() {
    return {
      status: '',
      template: {},
      link: new URLSearchParams(window.location.search).get('link'),
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
    periodsData() {
      if (!this.template.periods) return {};
      return getPeriodsData(this.template.periods);
    },
    absences() {
      if (!this.template.absences) return [];
      return this.template.absences.map(absence => ({
        type: absence.type,
        start: moment.parseZone(absence.start_at),
        end: moment.parseZone(absence.end_at),
      }));
    },
    formattedDate() {
      if (!this.template.workweek) return '';
      let date = moment(this.template.workweek);
      if (date.weekday() !== 6) date.weekday(-1);
      let text = date.format('DD.MM.YYYY');
      date.add(6, 'd');
      return `${text} - ${date.format('DD.MM.YYYY')}`
    },
    days() {
      if (!this.template.workweek) return [];
      let date = moment.parseZone(this.template.workweek);
      if (date.weekday() !== 6) date.weekday(-1);
      date.subtract(1, 'day');
      return daysTitles.map((title, key) => {
        date.add(1, 'day');
        let absence = this.absences.find(absence => (date >= absence.start) && (date <= absence.end));
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
  },
  created() {
    this.fetchTemplate();
  },
  methods: {
    fetchTemplate() {
      this.status = 'request';
      axios.get(`/workshifts/build_by_link/${this.link}`).then(({data}) => {
        this.template = data;
        this.status = '';
      }).catch(() => {
        this.status = 'error';
      });
    },
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
      this.submitData = data;
      this.$refs['submit-confirm-modal'].show();
    },
    submitSchedule() {
      this.status = 'request';
      axios.post(`/workshifts/build_by_link/${this.link}`, this.submitData).then((e) => {
        console.log('success', e);
        this.status = 'success';
        showToast(this.$toasted, 'Расписание успешно отправлено');
      }).catch((e) => {
        if (e?.response?.data?.violations?.[0]?.message) showToast(this.$toasted, e.response.data.violations?.[0].message, 'error');
        this.status = 'form-error';
      });
    },
    changeAllTime(type) {
      let time = this[`allDays${type}`].getTime();
      return this[`time${type}`] = [new Date(time), new Date(time), new Date(time), new Date(time), new Date(time), new Date(time), new Date(time)];
    },
    closeToast(e, toastObject) {
      toastObject.goAway(0);
    },
    changeInput(type, key) {
      this[`${type}Errors`] = this[`${type}Errors`].filter(error => error !== key);
    },
  },
}
</script>

<style src="./Schedule.scss" lang="scss"/>