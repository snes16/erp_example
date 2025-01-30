<template>
  <div class="work-calendar">
    <div class="work-calendar-toolbar">
      <div class="work-calendar-datepicker mb-0">
        <div class="work-calendar-datepicker-prev" @click="subtractMonth"><i class="fa fa-angle-left"></i></div>
        <div class="work-calendar-datepicker-current">
          <span class="work-calendar-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
          <b-dropdown class="work-calendar-datepicker-current-text cursor-pointer work-calendar-dropdown" :text="currentDate"  variant="link" dropdown>
            <div class="work-calendar-dropdown-body">
              <div class="work-calendar-dropdown-body-years work-calendar-datepicker">
                <div class="work-calendar-datepicker-prev -more-area" @click="subtractYear"><i class="fa fa-angle-left"></i></div>
                <h4 class="work-calendar-datepicker-current-text cursor-pointer">{{currentYear}}</h4>
                <div class="work-calendar-datepicker-next -more-area" @click="addYear"><i class="fa fa-angle-right"></i></div>
              </div>
              <div class="work-calendar-dropdown-body-months">
                <div v-for="(month, index) in months" class="work-calendar-dropdown-body-months-month" @click="setMonth(index)">{{month}}</div>
              </div>
            </div>
          </b-dropdown>
        </div>
        <div class="work-calendar-datepicker-next" @click="addMonth"><i class="fa fa-angle-right"></i></div>
      </div>
      <div class="work-calendar-toolbar-tabs">
        <b-button v-if="editPermission" variant="outline-primary" size="sm"  class="work-calendar-toolbar-tabs-btn" @click="createEvent">Добавить отсутствие</b-button>
        <div @click="setActiveTab('calendar')">
          <calendar class="work-calendar-toolbar-tabs-tab" :class="activeTab === 'calendar' ? '-active' : ''"/>
        </div>
        <div @click="setActiveTab('list')">
          <list class="work-calendar-toolbar-tabs-tab" :class="activeTab === 'list' ? '-active' : ''"/>
        </div>
      </div>
    </div>
    <template v-if="activeTab === 'calendar'">
      <div class="work-calendar-table">
        <full-calendar :options="calendarOptions" ref="fullCalendar"/>
      </div>
    </template>
    <template v-else-if="activeTab === 'list'">
      <div v-if="absencesToList.length" class="work-calendar-list">
        <div class="work-calendar-list-content">
          <div class="work-calendar-list-row -head">
            <div class="work-calendar-list-row-cell -start">Дата начала</div>
            <div class="work-calendar-list-row-cell -end">Дата окончания</div>
            <div class="work-calendar-list-row-cell -type">Тип отсутствия</div>
          </div>
          <div v-for="event in absencesToList" class="work-calendar-list-row">
            <div class="work-calendar-list-row-cell -start cursor-pointer" @click="openEvent(event)">{{dateListFormat(event.start)}}</div>
            <div class="work-calendar-list-row-cell -end cursor-pointer" @click="openEvent(event)">{{dateListFormat(subtractDay(event.end))}}</div>
            <div class="work-calendar-list-row-cell -type cursor-pointer" @click="openEvent(event)">
              <div class="work-calendar-list-row-cell -type-block" :style="`background-color: ${event.color};`">
                {{event.title}}
              </div>
            </div>
            <div v-if="editPermission" class="work-calendar-list-row-cell -trash">
              <trash class="event-details-header-trash" @click="deleteEvent(event.id)" />
            </div>
          </div>
          <b-pagination v-model="currentPage"
                        class="work-calendar-list-pagination"
                        align="left"
                        :total-rows="absencesToTable.length"
                        :per-page="perPage"
          />
        </div>
      </div>
      <div v-else class="work-calendar-info">
        <h3>У пользователя пока нет отсутствий</h3>
        <span class="work-calendar-info-empty">Попробуйте выбрать другой месяц или добавить отсутствие</span>
      </div>
    </template>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru';
import DatePicker from "vue2-datepicker";
import moment from "moment";
import Helper from "@/components/Helper/Helper";
import Trash from "@/assets/vue-svg/trash.svg";
import Calendar from "@/assets/vue-svg/calendar.svg";
import List from "@/assets/vue-svg/list.svg";
import Vue from "vue";

export default {
  name: 'WorkCalendar',
  components: {
    'helper': Helper,
    'full-calendar': FullCalendar,
    'date-picker': DatePicker,
    trash: Trash,
    calendar: Calendar,
    list: List
  },
  props: {
    absences: Array,
    editPermission: Boolean
  },
  data() {
    return {
      activeTab: 'calendar',
      activeDate: moment().format('YYYY-MM-DD'),
      months: moment.months(),
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        selectable: true,
        locale: ruLocale,
        headerToolbar: false,
        dayHeaderFormat: { weekday: 'long', omitCommas: true },
        height: 'auto',
        events: this.absencesToTable,
        select: this.selectDate,
        eventClick: this.eventClick
      },
      currentPage: 1,
      perPage: 8,
    }
  },
  computed: {
    currentDate() {
      return moment(this.activeDate).format('MMMM, YYYY');
    },
    currentYear() {
      return moment(this.currentDate).year()
    },
    typesAbsence() {
      return this.$store.state.dictionaries.absenceTypes
    },
    absencesToTable() {
      return this.absences.map(absence => {
        return {
          id: absence.id,
          title: this.typesAbsence[absence.type],
          start: this.dateFormat(absence.start_at),
          end: this.dateFormat(absence.end_at),
          color: this.colorAbsence(absence.type)
        }
      })
    },
    absencesToList() {
      let start = (this.currentPage - 1)*this.perPage
      return this.absencesToTable.slice(start, start+this.perPage)
    }
  },
  watch: {
    absencesToTable(newAbsencesToTable) {
      Vue.set(this.calendarOptions, 'events', newAbsencesToTable);
      if (this.activeTab === 'calendar') this.$refs.fullCalendar.$emit('rerenderEvents');
    },
    activeDate(newDate) {
      this.$emit('fetchProfileAbsence', newDate);
      this.currentPage = 1
      if (this.activeTab === 'calendar') this.$refs.fullCalendar.getApi().gotoDate(newDate)
    },
    activeTab(newTab) {
      if (newTab === 'calendar') this.$nextTick(() => {
        this.$refs.fullCalendar.getApi().gotoDate(this.activeDate)
      })
    }
  },
  created() {
    this.calendarOptions.events = this.absencesToTable
  },
  methods: {
    colorAbsence(type) {
      switch (type) {
        case 'vacation': return '#21AE8C';
        case 'sick_leave': return '#1A86D0';
        case 'absence': return '#FD5F00';
      }
    },
    dateFormat(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    dateListFormat(date) {
      return moment(date).format('DD.MM.YYYY')
    },
    setActiveTab(tab) {
      this.activeTab = tab
    },
    subtractMonth() {
      let date = moment(this.activeDate);
      date.subtract(1, 'months');
      this.activeDate = date.format('YYYY-MM-DD');
    },
    subtractYear() {
      let date = moment(this.activeDate);
      date.subtract(1, 'years');
      this.activeDate = date.format('YYYY-MM-DD');
    },
    subtractDay(subtractDate) {
      let date = moment(subtractDate);
      date.subtract(1, 'days');
      return date.format('YYYY-MM-DD');
    },
    addMonth() {
      let date = moment(this.activeDate);
      date.add(1, 'months');
      this.activeDate = date.format('YYYY-MM-DD');
    },
    addYear() {
      let date = moment(this.activeDate);
      date.add(1, 'years');
      this.activeDate = date.format('YYYY-MM-DD');
    },
    setMonth(monthIndex) {
      let date = moment(this.activeDate);
      date.set('month', monthIndex);
      this.activeDate = date.format('YYYY-MM-DD');
    },
    createEvent() {
      this.$emit('openAbsenceDetails',{date: {activeDate: this.activeDate}});
    },
    openEvent(event) {
      if (this.editPermission) this.$emit('openAbsenceDetails', {date: {startDate: event.start, endDate: this.subtractDay(event.end), activeDate: this.activeDate}, info: {type: this.getTypeFromTitle(event.title), id: event.id}});
    },
    selectDate(info) {
      if (this.editPermission) this.$emit('openAbsenceDetails', {date: {startDate: info.startStr, endDate: this.subtractDay(info.endStr), activeDate: this.activeDate}});
    },
    eventClick(info) {
      if (this.editPermission) this.openEvent({start: info.event.startStr, end: info.event.endStr, title: info.event.title, id: info.event.id})
    },
    deleteEvent(id) {
      this.$emit('deleteAbsence', id, this.activeDate);
    },
    getTypeFromTitle(title) {
      return Object.keys(this.typesAbsence).find(key => this.typesAbsence[key] === title)
    }
  }
}
</script>