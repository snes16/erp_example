<template>
  <div
    :class="[
      `${prefixClass}-calendar`,
      `${prefixClass}-calendar-panel-${panel}`,
      { [`${prefixClass}-calendar-week-mode`]: type === 'week' },
    ]"
  >
    <div :class="`${prefixClass}-calendar-header`">
      <button
        v-show="showIconDoubleArrow"
        type="button"
        :class="`${prefixClass}-btn ${prefixClass}-btn-text ${prefixClass}-btn-icon-double-left`"
        @click="handleIconDoubleLeftClick"
      >
        <i :class="`${prefixClass}-icon-double-left`"></i>
      </button>
      <button
        v-show="showIconArrow"
        type="button"
        :class="`${prefixClass}-btn ${prefixClass}-btn-text ${prefixClass}-btn-icon-left`"
        @click="handleIconLeftClick"
      >
        <i :class="`${prefixClass}-icon-left`"></i>
      </button>
      <button
        v-show="showIconDoubleArrow"
        type="button"
        :class="`${prefixClass}-btn ${prefixClass}-btn-text ${prefixClass}-btn-icon-double-right`"
        @click="handleIconDoubleRightClick"
      >
        <i :class="`${prefixClass}-icon-double-right`"></i>
      </button>
      <button
        v-show="showIconArrow"
        type="button"
        :class="`${prefixClass}-btn ${prefixClass}-btn-text ${prefixClass}-btn-icon-right`"
        @click="handleIconRightClick"
      >
        <i :class="`${prefixClass}-icon-right`"></i>
      </button>
      <span :class="`${prefixClass}-calendar-header-label`">
        <template v-if="panel === 'year'">
          <span>{{ calendarDecade }}</span>
          <span :class="`${prefixClass}-calendar-decade-separator`"></span>
          <span>{{ calendarDecade + 9 }}</span>
        </template>
        <button
          v-else-if="panel === 'month'"
          type="button"
          :class="`${prefixClass}-btn ${prefixClass}-btn-text`"
          @click="handelPanelChange('year')"
        >
          {{ calendarYear }}
        </button>
        <template v-else-if="panel === 'date'">
          <button
            v-for="item in dateHeader"
            :key="item.panel"
            type="button"
            :class="
              `${prefixClass}-btn ${prefixClass}-btn-text ${prefixClass}-btn-current-${item.panel}`
            "
            @click="handelPanelChange(item.panel)"
          >
            {{ item.label }}
          </button>
        </template>
      </span>
    </div>
    <div :class="`${prefixClass}-calendar-content`">
      <table-year
        v-show="panel === 'year'"
        :decade="calendarDecade"
        :get-cell-classes="getYearClasses"
        @select="handleSelectYear"
      ></table-year>
      <table-month
        v-if="type !== 'year'"
        v-show="panel === 'month'"
        :get-cell-classes="getMonthClasses"
        @select="handleSelectMonth"
      ></table-month>
      <table-date
        v-if="type !== 'year' && type !== 'month'"
        v-show="panel === 'date'"
        :calendar-year="calendarYear"
        :calendar-month="calendarMonth"
        :title-format="titleFormat"
        :show-week-number="typeof showWeekNumber === 'boolean' ? showWeekNumber : type === 'week'"
        :get-cell-classes="getDateClasses"
        :get-row-classes="getWeekState"
        @select="handleSelectDate"
      ></table-date>
    </div>
  </div>
</template>

<script>
import {
  subMonths,
  addMonths,
  subYears,
  addYears,
  setMonth,
  setYear,
  startOfYear,
  startOfMonth,
  startOfDay,
} from 'date-fns';
import { format } from 'date-format-parse';
import { getValidDate, isValidDate, createDate } from '../util/date';
import TableDate from './table-date';
import TableMonth from './table-month';
import TableYear from './table-year';
import { getLocaleFieldValue } from '../locale';
import emitter from '../mixin/emitter';

export default {
    name: 'CalendarPanel',
    components: {
        TableDate,
        TableMonth,
        TableYear,
    },
    mixins: [emitter],
    inject: {
        t: {
            default: () => getLocaleFieldValue,
        },
        prefixClass: {
            default: 'mx',
        },
    },
    props: {
        value: {},
        defaultValue: {
            default() {
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                return date;
            },
        },
        defaultPanel: {
            type: String,
        },
        disabledDate: {
            type: Function,
            default: () => false,
        },
        type: {
            type: String,
            default: 'date',
        },
        getClasses: {
            type: Function,
            default: () => [],
        },
        showWeekNumber: {
            type: Boolean,
            default: undefined,
        },
        titleFormat: {
            type: String,
            default: 'YYYY-MM-DD',
        },
        calendar: Date,
        // update date when select year or month
        partialUpdate: {
            type: Boolean,
            default: false,
        },
        markedDates: Array
    },
    data() {
        const panels = ['date', 'month', 'year'];
        const index = Math.max(panels.indexOf(this.type), panels.indexOf(this.defaultPanel));
        const panel = index !== -1 ? panels[index] : 'date';
        return {
            panel,
            innerCalendar: null,
        };
    },
    computed: {
        innerValue() {
            const value = Array.isArray(this.value) ? this.value : [this.value];
            const map = {
                year: startOfYear,
                month: startOfMonth,
                date: startOfDay,
            };
            const start = map[this.type] || map.date;
            return value.filter(isValidDate).map(v => start(v));
        },
        calendarYear() {
            return this.innerCalendar.getFullYear();
        },
        calendarMonth() {
            return this.innerCalendar.getMonth();
        },
        calendarDecade() {
            return Math.floor(this.calendarYear / 10) * 10;
        },
        showIconDoubleArrow() {
            return this.panel === 'date' || this.panel === 'month' || this.panel === 'year';
        },
        showIconArrow() {
            return this.panel === 'date';
        },
        dateHeader() {
            const monthBeforeYear = this.t('monthBeforeYear');
            const yearFormat = this.t('yearFormat');
            const monthFormat = this.t('monthFormat') || 'MMM';
            const yearLabel = {
                panel: 'year',
                label: this.formatDate(this.innerCalendar, yearFormat),
            };
            const monthLabel = {
                panel: 'month',
                label: this.formatDate(this.innerCalendar, monthFormat),
            };
            return monthBeforeYear ? [monthLabel, yearLabel] : [yearLabel, monthLabel];
        },
    },
    watch: {
        value: {
            immediate: true,
            handler: 'initCalendar',
        },
        calendar: {
            handler: 'initCalendar',
        },
        defaultValue: {
            handler: 'initCalendar',
        },
    },
    methods: {
        formatDate(date, fmt) {
            return format(date, fmt, {locale: this.t('formatLocale')});
        },
        initCalendar() {
            let calendarDate = this.calendar;
            if (!isValidDate(calendarDate)) {
                const {length} = this.innerValue;
                calendarDate = getValidDate(length > 0 ? this.innerValue[length - 1] : this.defaultValue);
            }
            this.innerCalendar = calendarDate;
        },
        isDisabled(date) {
            return this.disabledDate(new Date(date), this.innerValue);
        },
        emitDate(date, type) {
            if (!this.isDisabled(date)) {
                this.$emit('select', date, type, this.innerValue);
                // someone need get the first selected date to set range value. (#429)
                this.dispatch('DatePicker', 'pick', date, type);
            }
        },
        updateCalendar(date, type) {
            const oldValue = new Date(this.innerCalendar);
            this.innerCalendar = date;
            this.$emit('update:calendar', date);
            this.dispatch('DatePicker', 'calendar-change', date, oldValue, type);
        },
        handelPanelChange(panel) {
            this.panel = panel;
        },
        handleIconLeftClick() {
            const nextCalendar = subMonths(this.innerCalendar, 1);
            this.updateCalendar(nextCalendar, 'last-month');
        },
        handleIconRightClick() {
            const nextCalendar = addMonths(this.innerCalendar, 1);
            this.updateCalendar(nextCalendar, 'next-month');
        },
        handleIconDoubleLeftClick() {
            const nextCalendar = subYears(this.innerCalendar, this.panel === 'year' ? 10 : 1);
            this.updateCalendar(nextCalendar, this.panel === 'year' ? 'last-decade' : 'last-year');
        },
        handleIconDoubleRightClick() {
            const nextCalendar = addYears(this.innerCalendar, this.panel === 'year' ? 10 : 1);
            this.updateCalendar(nextCalendar, this.panel === 'year' ? 'next-decade' : 'next-year');
        },
        handleSelectYear(year) {
            if (this.type === 'year') {
                const date = this.getCellDate(year, 'year');
                this.emitDate(date, 'year');
            } else {
                const nextCalendar = setYear(this.innerCalendar, year);
                this.updateCalendar(nextCalendar, 'year');
                this.handelPanelChange('month');
                if (this.partialUpdate && this.innerValue.length === 1) {
                    const date = setYear(this.innerValue[0], year);
                    this.emitDate(date, 'year');
                }
            }
        },
        handleSelectMonth(month) {
            if (this.type === 'month') {
                const date = this.getCellDate(month, 'month');
                this.emitDate(date, 'month');
            } else {
                const nextCalendar = setMonth(this.innerCalendar, month);
                this.updateCalendar(nextCalendar, 'month');
                this.handelPanelChange('date');
                if (this.partialUpdate && this.innerValue.length === 1) {
                    const date = setMonth(setYear(this.innerValue[0], this.calendarYear), month);
                    this.emitDate(date, 'month');
                }
            }
        },
        handleSelectDate(day) {
            const date = this.getCellDate(day, 'date');
            this.emitDate(date, this.type === 'week' ? 'week' : 'date');
        },
        getCellDate(value, type) {
            if (type === 'year') {
                return createDate(value, 0);
            }
            if (type === 'month') {
                return createDate(this.calendarYear, value);
            }
            return createDate(this.calendarYear, this.calendarMonth, value);
        },
        getDateClasses(day) {
            const cellDate = this.getCellDate(day, 'date');
            const notCurrentMonth = cellDate.getMonth() !== this.calendarMonth;
            const classes = [];
            if (cellDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
                classes.push('today');
            }
            if (notCurrentMonth) {
                classes.push('not-current-month');
            }
            const state = this.getStateClass(cellDate);
            if (!(state === 'active' && notCurrentMonth)) {
                classes.push(state);
            }
            if (this.markedDates?.some(date => date.getDate() === day)) classes.push('-marked');
            return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
        },
        getMonthClasses(month) {
            if (this.type !== 'month') {
                return this.calendarMonth === month ? 'active' : '';
            }
            const classes = [];
            const cellDate = this.getCellDate(month, 'month');
            classes.push(this.getStateClass(cellDate));
            return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
        },
        getYearClasses(year) {
            if (this.type !== 'year') {
                return this.calendarYear === year ? 'active' : '';
            }
            const classes = [];
            const cellDate = this.getCellDate(year, 'year');
            classes.push(this.getStateClass(cellDate));
            return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
        },
        getStateClass(cellDate) {
            if (this.isDisabled(cellDate)) {
                return 'disabled';
            }
            if (this.innerValue.some(v => v.getTime() === cellDate.getTime())) {
                return 'active';
            }
            return '';
        },
        getWeekState(row) {
            if (this.type !== 'week') return '';
            const start = this.getCellDate(row[0].day, 'date').getTime();
            const end = this.getCellDate(row[6].day, 'date').getTime();
            const active = this.innerValue.some(v => {
                const time = v.getTime();
                return time >= start && time <= end;
            });
            return active ? `${this.prefixClass}-active-week` : '';
        },
    },
};
</script>
