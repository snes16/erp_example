<template>
  <div>
    <div v-if="userPermissions.calendar.birthday.view" class="calendar">
      <div class="calendar-filters calendar-block">
        <div class="calendar-filters-collapse" @click="toggleCollapse('birthdays')">
          <h4 class="calendar-filters-collapse-title">Дни рождения</h4>
          <i :class="collapseVisible.birthdays ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
        </div>
        <b-collapse v-model="collapseVisible.birthdays" class="calendar-filters-checkboxes">
          <div class="abc-checkbox calendar-filters-checkboxes-checkbox" v-for="rolesType in rolesTypes">
            <div class="abc-checkbox calendar-filters-checkboxes-checkbox-block">
              <span>{{ rolesType.title }}</span>
              <input type="checkbox" :id="rolesType.value" :value='rolesType.value' v-model="currentRoles"
                     @change="getBirthdays">
              <label :for="rolesType.value"></label>
            </div>
          </div>
          <span class="calendar-filters-checkboxes-button" @click="clearFilters">Сбросить фильтры</span>
        </b-collapse>
      </div>
      <div class="calendar-main">
        <div class="calendar-main-filters calendar-block">
          <group-picker v-model="currentGroup"
                        :defaultGroup="defaultGroup"
                        :groups="groups"
                        @change="getBirthdays"
          />
          <div class="calendar-main-filters-date">
            <date-scroll v-model="currentDate" :type="calendarFormat" showIcon bold emitWithOldDate @change="changeDate"
                         @beforeChange="beforeChangeDate"/>
            <div class="calendar-main-filters-date-format">
              <div class="calendar-main-filters-date-format-element" :class="calendarFormat === 'week' ? '-active' : ''"
                   @click="setCalendarFormat('week')">Неделя
              </div>
              <div class="calendar-main-filters-date-format-element"
                   :class="calendarFormat === 'month' ? '-active' : ''" @click="setCalendarFormat('month')">Месяц
              </div>
            </div>
          </div>
        </div>
        <div class="calendar-main-table calendar-block" :class="{'-transparent' : status === 'request'}">
          <full-calendar :options="calendarOptions" ref="fullCalendar" :event-sources="calendarOptions.events"/>
        </div>
      </div>
      <div v-if="tooltipsEvents.length && !isMobile">
        <b-tooltip v-for="event of tooltipsEvents" :target="`avatar-birthdays-${event.id}`" triggers="hover"
                   boundary="viewport" :delay="{ 'show': 150, 'hide': 0 }"
                   custom-class="management-main-calendar-birthdays-content-tooltip">
          <div class="management-main-calendar-birthdays-content-tooltip-title cursor-pointer">
            <span class="text-gray">{{ event.uid }}</span>
            <span class="management-main-calendar-birthdays-content-tooltip-title-fullname">
                         {{ event.fullname }}
                         <div v-if="event.is_resign" class="glyphicon-fired ml-1"></div>
                         <div v-else-if="event.blocked" class="glyphicon-blocked ml-1"></div>
                      </span>
            <span class="text-gray" v-if="event.role">{{ getAgeByBirthday(event.birthday) }} / {{
                event.role.title
              }}</span>
          </div>
          <div v-if="event.main_group" class="management-main-calendar-birthdays-content-tooltip-group">
                              <span class="management-main-calendar-birthdays-content-tooltip-group-flag flag-icon"
                                    :class="`flag-icon-${event.main_group.flag || 'default'}`"></span>
            <div class="management-main-calendar-birthdays-content-tooltip-group-info">
              <span class="text-gray">{{ event.main_group.city }}</span>
              <span>{{ event.main_group.office }}</span>
            </div>
          </div>
        </b-tooltip>
      </div>
    </div>
    <div v-else class="management-empty">
      <h3>Календарь не найден</h3>
    </div>
    <helper>
      <mini-profile
          v-if="droverType === 'mini-profile'"
          :user-id="userProfile.id"
      />
    </helper>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import ruLocale from '@fullcalendar/core/locales/ru';
import Helper from "@/components/Helper/Helper";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import GroupPicker from "@/pages/Workshifts/components/GroupPicker";
import DateScroll from "@/pages/Management/components/DateScroll";
import { getSmallImage, isMobile, pluralize, telegramIcon, finAdminIcon } from "@/tools/tools";

export default {
  name: "Calendar",
  components: {
    DateScroll,
    GroupPicker,
    'full-calendar': FullCalendar,
    'helper': Helper,
    'mini-profile': MiniProfile,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        selectable: true,
        locale: ruLocale,
        headerToolbar: false,
        dayHeaderFormat: {weekday: 'long', omitCommas: true},
        height: '100%',
        events: this.absencesToTable,
        select: this.selectDate,
        eventClick: this.eventClick,
        eventDidMount: this.eventRender,
        eventWillUnmount: this.beforeDestroyEvent,
      },
      calendar: null,
      currentDate: moment().format('YYYY-MM-DD'),
      oldCurrentDate: null,
      currentRoles: [],
      currentGroup: {},
      calendarFormat: 'month',
      droverType: '',
      userProfile: {},
      showGroupsForOperator: false,
      collapseVisible: {
        birthdays: true,
      },
      tooltipsEvents: [],
      done: false,
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions
    },
    rolesTypes() {
      return [
        {title: 'Сотрудники', value: 'OTHER'},
        {title: 'Операторы', value: 'ROLE_OPERATOR'},
        {title: 'Модели', value: 'ROLE_MODEL'},
      ]
    },
    status() {
      return this.$store.state.calendar.status;
    },
    birthdays() {
      return this.$store.state.calendar.birthdays;
    },
    events() {
      return this.birthdays.map(birthday => {
        return {
          ...birthday.user,
          start: this.dateFormat(birthday.start_at) || null,
          end: this.dateFormat(birthday.end_at) || null,
        }
      })
    },
    groups() {
      return this.$store.state.dictionaries.groups;
    },
    user() {
      return this.$store.state.auth.user;
    },
    defaultGroup() {
      return (!this.user.role || this.user.role.code === 'ROLE_SUPERADMIN') ? [] : this.getGroupForPicker(this.user.main_group);
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    isMobile() {
      return isMobile;
    }
  },
  watch: {
    events(newEvents) {
      Vue.set(this.calendarOptions, 'events', [...newEvents]);
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
  },
  created() {
    this.getBirthdays()
    this.$store.dispatch('dictionaries/fetchGroups');
  },
  methods: {
    getBirthdays() {
      this.$store.dispatch('calendar/fetchBirthdays', {
        date: this.currentDate,
        group: this.currentGroup.id,
        roles: this.currentRoles,
      })
    },
    clearFilters() {
      this.tooltipsEvents = []
      this.currentRoles = []
      this.getBirthdays()
    },
    setCalendarFormat(format) {
      this.tooltipsEvents = []
      this.calendarFormat = format
      this.$refs.fullCalendar.getApi().changeView(format === 'week' ? 'dayGridWeek' : 'dayGridMonth')
      if (format === 'week') Vue.set(this.calendarOptions, 'dayHeaderFormat', {
        weekday: 'long',
        omitCommas: true,
        day: 'numeric'
      });
      else Vue.set(this.calendarOptions, 'dayHeaderFormat', {weekday: 'long', omitCommas: true});
      //For rerender events
      Vue.set(this.calendarOptions, 'events', [...this.calendarOptions.events]);
    },
    changeDate() {
      this.tooltipsEvents = []
      if (moment(this.oldCurrentDate).month() !== moment(this.currentDate).month()) this.getBirthdays()
      this.$refs.fullCalendar.getApi().gotoDate(this.currentDate)
    },
    beforeChangeDate(date) {
      this.oldCurrentDate = date
    },
    eventClick(info) {
      this.openMiniProfile({id: Number(info.event.id), ...info.event.extendedProps})
    },
    eventRender(info) {
      //add id for events
      info.el.firstChild.setAttribute('id', `avatar-birthdays-${info.event.id}`);
      //add info about events in tooltips data
      Vue.nextTick(() => {
        this.tooltipsEvents.push({...info.event.extendedProps, id: info.event.id});
      });
      //change default style of events on avatar
      info.el.firstChild.classList.add('avatar-wrap', '-xs', 'cursor-pointer');
      const avatar = document.createElement('div');
      avatar.classList.add('avatar');
      avatar.setAttribute('style', info.event.extendedProps.avatar ? `background-image: url(${this.getSmallImage(info.event.extendedProps.avatar)}); background-size: cover;` : '');
      info.el.firstChild.appendChild(avatar);
      if (info.event.extendedProps.telegram_connected) {
        const telegram = document.createElement('div');
        telegram.classList.add('avatar-icon', '-telegram');
        telegram.innerHTML = telegramIcon;
        info.el.firstChild.appendChild(telegram);
      }
      if (info.event.extendedProps.is_fin_admin) {
        const finAdmin = document.createElement('div');
        finAdmin.classList.add('avatar-icon', '-fin_admin');
        finAdmin.innerHTML = finAdminIcon;
        info.el.firstChild.appendChild(finAdmin);
      }
      //add gift icon
      const divIcon = document.createElement('div');
      divIcon.classList.add('image-gift');
      if (this.calendarFormat === 'month') {
        let elementDayNumber = info.el.parentElement.parentElement.parentElement.getElementsByClassName('fc-daygrid-day-top')[0];
        if (!elementDayNumber || elementDayNumber.getElementsByTagName('div').length) return;
        elementDayNumber.appendChild(divIcon);
      } else {
        let headersCalendar = this.$refs.fullCalendar.$el.getElementsByClassName('fc-col-header')[0].getElementsByTagName('th');
        let headerWithBirthday = [...headersCalendar].find(headerCalendar => (headerCalendar.dataset.date === this.dateFormat(info.event.start)));
        let elementDayNumber = headerWithBirthday.getElementsByClassName('fc-scrollgrid-sync-inner')[0];
        if (!elementDayNumber || elementDayNumber.getElementsByTagName('div').length) return;
        elementDayNumber.appendChild(divIcon);
      }
    },
    beforeDestroyEvent(info) {
      //delete old icon gift in day
      if (this.calendarFormat === 'month') {
        let elementDayNumber = info.el.parentElement.parentElement.parentElement.getElementsByClassName('fc-daygrid-day-top')[0]
        if (elementDayNumber?.getElementsByTagName('div').length) elementDayNumber.removeChild(elementDayNumber.getElementsByTagName('div')[0])
      } else {
        let headersCalendar = this.$refs.fullCalendar.$el.getElementsByClassName('fc-col-header')[0].getElementsByTagName('th')
        let headerWithBirthday = [...headersCalendar].find(headerCalendar => (headerCalendar.dataset.date === this.dateFormat(info.event.start)))
        let elementDayNumber = headerWithBirthday?.getElementsByClassName('fc-scrollgrid-sync-inner')[0]
        if (elementDayNumber?.getElementsByTagName('div').length) elementDayNumber.removeChild(elementDayNumber.getElementsByTagName('div')[0])
      }
    },
    openMiniProfile(user) {
      if (!this.userPermissions[user.role ? this.userRole(user.role.code) : 'employee'].profile.view) return;
      this.userProfile = user;
      this.droverType = 'mini-profile';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    userRole(code) {
      switch (code) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
        default:
          return 'employee';
      }
    },
    dateFormat(date) {
      return moment(date).set('year', moment(this.currentDate).year()).format('YYYY-MM-DD')
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    toggleCollapse(type) {
      this.collapseVisible = {
        ...this.collapseVisible,
        [type]: !this.collapseVisible[type]
      }
    },
    getAgeByBirthday(date) {
      return date ? pluralize(moment().diff(date, 'years'), ['год', 'года', 'лет']) : '';
    },
    getGroupForPicker(group) {
      let result = []
      this.groups.forEach(groupCountry => {
        if (group?.type === 'city' && groupCountry.children.some(groupCity => groupCity.id === group.id)) result = [groupCountry.id, group.id]
        else if (group?.type === 'office') groupCountry.children.forEach(groupCity => {
          if (groupCity.children.some(groupOffice => groupOffice.id === group.id)) result = [groupCountry.id, groupCity.id, group.id]
        })
      })
      return result
    }
  }

}
</script>