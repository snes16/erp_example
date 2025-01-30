<template>
  <div class="management-main-calendar management-main-widget"
       :class="{'-transparent': loadingRequest}"
       ref="birthdays-widget">
    <div class="management-main-calendar-header">
      <h3>Календарь</h3>
      <group-select v-model="calendarGroup"
                    :groups="groupsOptions"
                    class="-filter management-select"
                    :disabled="loadingRequest"
                    placeholder="Регион"
                    right
                    @change="changeGroup"
      />
    </div>
    <div v-if="firstRequest" class="management-main-calendar-load">
      <throbber class="throbber"/>
      <span>Информация загружается, пожалуйста, подождите</span>
    </div>
    <div v-show="!firstRequest">
      <div class="management-main-calendar-custom">
        <calendar :attributes="calendarAttributes"
                  ref="calendar"
                  is-expanded
                  @update:from-page="changeDate">
          <template #day-popover="{ attributes }">
            <div v-for="attr in attributes"
                 :key="attr.key"
                 :attribute="attr">
              <div v-if="attr.customData.birthdays" class="management-main-calendar-custom-birthdays">
                <div class="management-main-calendar-custom-birthdays-title">
                  <i class="fi flaticon-gift-birthday d-flex mr-1"/>
                  <span>Дни рождения</span>
                </div>
                <div v-for="birthday in attr.customData.birthdays"
                     class="management-main-calendar-custom-birthdays-user cursor-pointer"
                     @click="openMiniProfile(birthday)">
                  <avatar :id="`avatar-${birthday.id}`"
                          class="mr-2"
                          size="-xs"
                          :url=" birthday.avatar"
                          is-large
                          :telegram="birthday.telegram_connected"
                          :is-fin-admin="birthday.is_fin_admin"
                  />
                  <div class="d-flex flex-column">
                    <span class="management-main-calendar-custom-birthdays-user-fullname">
                       {{ birthday.fullname }}
                       <div v-if="birthday.is_resign" class="glyphicon-fired ml-1"></div>
                       <div v-else-if="birthday.blocked" class="glyphicon-blocked ml-1"></div>
                    </span>
                    <span class="text-gray">{{ birthday.role.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </calendar>
      </div>
      <div class="management-main-calendar-birthdays">
        <div v-for="(birthdaysData, indexDay) in showBirthdays" class="management-main-calendar-birthdays-content">
          <template v-if="birthdaysData && birthdaysData.length">
            <div class="management-main-calendar-birthdays-content-title">
              <i class="fi flaticon-gift-birthday d-flex mr-1"/>
              <span>День рождения {{indexDay === 0 ? 'сегодня' : 'завтра'}}</span>
            </div>
            <div class="management-main-calendar-birthdays-content-users">
              <template v-for="(birthdayData, index) in birthdaysData" v-if="(index < maxElementsBirthdays - 1) || (index === maxElementsBirthdays - 1 && restBirthdays[indexDay] && restBirthdays[indexDay].length === 1)">
                <avatar :id="`avatar-birthdays-${birthdayData.id}`"
                        class="cursor-pointer management-main-calendar-birthdays-content-users-avatar"
                        size="-xs"
                        :url="birthdayData.avatar"
                        is-large
                        :telegram="birthdayData.telegram_connected"
                        :is-fin-admin="birthdayData.is_fin_admin"
                        @click="openMiniProfile(birthdayData)"/>
                <b-tooltip :target="`avatar-birthdays-${birthdayData.id}`" triggers="hover" :delay="{ 'show': 150, 'hide': 0 }">
                  <div class="management-main-calendar-birthdays-content-tooltip-title cursor-pointer"
                       @click="openMiniProfile(birthdayData)">
                  <span class="management-main-calendar-birthdays-content-tooltip-title-fullname">
                     {{ birthdayData.fullname }}
                     <div v-if="birthdayData.is_resign" class="glyphicon-fired ml-1"></div>
                     <div v-else-if="birthdayData.blocked" class="glyphicon-blocked ml-1"></div>
                  </span>
                    <span class="text-gray">{{ birthdayData.role.title }}</span>
                  </div>
                  <div class="management-main-calendar-birthdays-content-tooltip-group">
                          <span class="management-main-calendar-birthdays-content-tooltip-group-flag flag-icon"
                                :class="`flag-icon-${birthdayData.main_group.flag || 'default'}`"></span>
                    <div class="management-main-calendar-birthdays-content-tooltip-group-info">
                      <span class="text-gray">{{ birthdayData.main_group.city }}</span>
                      <span>{{ birthdayData.main_group.office }}</span>
                    </div>
                  </div>
                </b-tooltip>
              </template>
              <template v-if="restBirthdays[indexDay] && restBirthdays[indexDay].length > 1">
                <avatar :id="`avatar-birthdays-${dayOfBirthday(indexDay)}`"
                        class="cursor-pointer management-main-calendar-birthdays-content-users-avatar"
                        size="-xs"
                        :url="restBirthdays[indexDay][0].avatar"
                        is-large
                        :telegram="restBirthdays[indexDay][0].telegram_connected"
                        :is-fin-admin="restBirthdays[indexDay][0].is_fin_admin"
                >
                  <span class="management-main-calendar-birthdays-content-users-avatar-rest">
                    +{{restBirthdays[indexDay].length}}
                  </span>
                </avatar>
                <b-tooltip :target="`avatar-birthdays-${dayOfBirthday(indexDay)}`"
                           triggers="hover"
                           :delay="{ 'show': 150, 'hide': 0 }"
                           custom-class="management-main-calendar-birthdays-content-tooltip -lg">
                  <div class="management-main-calendar-custom-birthdays-title">
                    <i class="fi flaticon-gift-birthday d-flex mr-1"/>
                    <span>Дни рождения</span>
                  </div>
                  <div v-for="birthday in restBirthdays[indexDay]"
                       class="management-main-calendar-custom-birthdays-user cursor-pointer"
                       @click="openMiniProfile(birthday)"
                  >
                    <avatar class="mr-2"
                            size="-xs"
                            :url="birthday.avatar"
                            is-large
                            :telegram="birthday.telegram_connected"
                            :is-fin-admin="birthday.is_fin_admin"
                    />
                    <div class="d-flex flex-column align-items-start">
                      <div class="management-main-calendar-custom-birthdays-user-fullname">
                        {{ birthday.fullname }}
                        <i v-if="birthday.is_resign" class="glyphicon-fired ml-1"/>
                        <i v-else-if="birthday.blocked" class="glyphicon-blocked ml-1"/>
                      </div>
                      <span class="text-gray">{{ birthday.role.title }}</span>
                    </div>
                  </div>
                </b-tooltip>
              </template>
            </div>
          </template>
          <div v-else>
            <div class="management-main-calendar-birthdays-content-title -empty">
              <i class="fi flaticon-gift-birthday d-flex mr-1"/>
              <span>{{indexDay === 0 ? 'Сегодня' : 'Завтра'}} у сотрудников нет дней рождения</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VCalendar from 'v-calendar/lib/components/calendar.umd';
import CustomSelect from "@/components/Common/Select/Select";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import Avatar from "@/components/Common/Avatar/Avatar";
import throbber from "@/assets/vue-svg/throbber.svg";
import { getSmallImage } from "@/tools/tools";
import moment from "moment";

export default {
  name: "WidgetCalendar",
  components: {
    'calendar': VCalendar,
    'avatar': Avatar,
    CustomSelect,
    GroupSelect,
    'throbber': throbber,
  },
  props: {
    groupsOptions: Array,
  },
  data() {
    return {
      currentDate: new Date(),
      calendarGroup: null,
      maxElementsBirthdays: 0,
    };
  },
  computed: {
    statusEvents() {
      return this.$store.state.management.statusEvents;
    },
    statusBirthdays() {
      return this.$store.state.management.statusBirthdays;
    },
    calendarEvents() {
      return this.$store.state.management.calendarEvents;
    },
    birthdays() {
      return this.$store.state.management.birthdays;
    },
    showBirthdays() {
      return [this.birthdays.today || null, this.birthdays.tomorrow || null];
    },
    restBirthdays() {
      return this.showBirthdays.map(showBirthday => showBirthday ? showBirthday.slice(this.maxElementsBirthdays - 1, showBirthday.length) : null);
    },
    calendarAttributes() {
      let attributes = [{
        key: 'today',
        highlight: {
          fillMode: 'inherit',
          contentClass: 'today',
        },
        dates: new Date(),
      }];
      return this.calendarEvents[this.formattedCurrentDate] ? [...attributes, ...Object.entries(this.calendarEvents[this.formattedCurrentDate]).map(([date, events]) => ({
        dot: 'yellow',
        dates: new Date(date),
        popover: {placement: 'auto'},
        customData: events,
      }))] : attributes;
    },
    formattedCurrentDate() {
      return moment(this.currentDate).format("YYYY-MM-DD");
    },
    firstRequest() {
      return this.statusEvents === 'first-request' || this.statusBirthdays === 'request';
    },
    loadingRequest() {
      return this.statusEvents === 'request' && !this.calendarEvents[this.formattedCurrentDate];
    },
  },
  created() {
    this.$store.dispatch('management/fetchBirthdays');
    this.getMonthsEvents(true);
  },
  mounted() {
    this.resizeWidth()
    this.$root.$on('resize', this.resizeWidth);
  },
  beforeDestroy() {
    this.$root.$off('resize', this.resizeWidth);
  },
  methods: {
    changeDate(changedDate) {
      this.currentDate = moment().set({'year': changedDate.year, 'month': changedDate.month - 1});
      this.getMonthsEvents();
    },
    getMonthsEvents(isFirstRequest = false) {
      if (this.statusEvents === 'first-request') return;
      this.getMonthEvents(this.formattedCurrentDate, isFirstRequest);
      this.getMonthEvents(moment(this.currentDate).subtract(1, 'months').format("YYYY-MM-DD"), isFirstRequest);
      this.getMonthEvents(moment(this.currentDate).add(1, 'months').format("YYYY-MM-DD"), isFirstRequest);
    },
    getMonthEvents(date, isFirstRequest) {
      if (!this.calendarEvents[date]) {
        this.$store.dispatch('management/fetchEventCalendar', {
          query: {
            date: date,
            group: this.calendarGroup?.id,
          },
          isFirstRequest: isFirstRequest,
        });
      }
    },
    changeGroup() {
      this.$store.dispatch('management/cleanCalendarEvents');
      this.getMonthsEvents();
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    openMiniProfile(user) {
      this.$emit('openMiniProfile', user);
    },
    resizeWidth() {
      this.maxElementsBirthdays = this.$refs['birthdays-widget'] ? Math.floor((this.$refs['birthdays-widget'].clientWidth - 48) / 80) : 0;
    },
    dayOfBirthday(index) {
      return index === 0 ? 'today' : 'tomorrow';
    },
  }
}
</script>