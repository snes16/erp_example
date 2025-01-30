<template>
  <div v-if="(userType === 'model') && !isMyProfile && userPermissions.model.profile.schedule.view">
    <div class="card profile_main-card">
      <div class="profile_main-card-header d-flex justify-content-between -schedule_padding">
        <div class="profile_main-card-header-schedule_picker">
          <h3 class="profile_main-card-header-schedule_picker-title">Расписание</h3>
          <div class="profile_main-card-header-schedule_picker-picker">
            <p class="profile_main-card-header-schedule_picker-picker-arrow"
               @click="setWeek('last')"
            ><i class="fa fa-angle-left"/></p>
            <p>{{ beginningWeek }}</p>
            <p>-</p>
            <p>{{ weekEnd }}</p>
            <p class="profile_main-card-header-schedule_picker-picker-arrow"
               :style="week === 1 ? 'color: #C1CCD3;' : ''"
               @click="setWeek('next')"
            ><i class="fa fa-angle-right"/></p>
          </div>
        </div>
        <b-button variant="outline-info" size="sm" @click="setSchedule">Изменить</b-button>
      </div>
      <div class="profile_main-card-body -paddingless">
        <div class="profile_main-card-body-office">
          <custom-select
              valueField="id"
              titleField="office"
              v-model="activeOffice"
              defaultText="Выберите офис"
              :options="modelOffices"
              class="-alt"
              :class="checkOffice === 'officeNotSelected' ? '-error_text' : ''"
              return-whole-object
              @change="setOffice"
              @focus="checkOffice === 'officeSelected'"
          >
            <template v-slot:chosen-variant="value">
                  <span class="flag-icon mr-1" :class="`flag-icon-${activeOffice.flag || 'default'}`"
                        :title="activeOffice.country"></span>
              <span class="text-gray mr-1">{{ activeOffice.city }}</span>
              <span>{{ value.shownText }}</span>
            </template>
            <template v-slot:list-variant="variant">
              <div class="d-flex align-items-center position-relative">
                    <span class="flag-icon mr-1" :class="`flag-icon-${variant.variant.flag || 'default'}`"
                          :title="variant.variant.country"></span>
                <span class="text-gray mr-1">{{ variant.variant.city }}</span>
                <span>{{ variant.variant.office }}</span>
              </div>
            </template>
          </custom-select>
        </div>
        <div class="profile_main-card-body-schedule -fixed">
          <div v-if="profile.profile && profile.profile.workshift && profile.profile.workshift.workshifts && typeof profile.profile.workshift.workshifts.length === 'undefined'"
               class="profile_main-card-body-schedule-container"
          >
            <div class="profile_main-card-body-schedule-header">
              <div class="profile_main-card-body-schedule-header-title"/>
              <div class="profile_main-card-body-schedule-header-main">
                <div class="profile_main-card-body-schedule-header-number">#</div>
                <div class="profile_main-card-body-schedule-header-from">НАЧАЛО</div>
                <div class="profile_main-card-body-schedule-header-to">КОНЕЦ</div>
                <div class="profile_main-card-body-schedule-header-status">СТАТУС</div>
              </div>
            </div>
            <div v-for="(day, key) in profile.profile.workshift.workshifts"
                 class="profile_main-card-body-schedule-days"
                 :key="key"
            >
              <div class="profile_main-card-body-schedule-days-day">
                <div class="profile_main-card-body-schedule-days-day-title">{{ moment(key).format('dd') }}</div>
                <div class="profile_main-card-body-schedule-days-day-period_field">
                  <div v-for="(period, index) in day"
                       class="profile_main-card-body-schedule-days-day-period_field-period"
                       :key="index"
                  >
                    <div v-for="(shifts, element) in period"
                         class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts"
                         :key="element"
                    >
                      <div v-for="(shift, block) in shifts.workshifts"
                           class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift"
                           :key="block"
                      >
                        <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-number">
                          {{ parseRoomTitle(shifts, element) }}
                        </div>
                        <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-from">
                          <span v-if="shift.start_at">{{ shift.start_at }}</span>
                          <span v-else class="text-gray">{{ shift.planned_start_at }}</span>
                        </div>
                        <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-to">
                          <span v-if="shift.end_at">{{ shift.end_at }}</span>
                          <span v-else class="text-gray">{{ shift.planned_end_at }}</span>
                        </div>
                        <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status">
                          <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status-badge"
                               :class="`-${shift.status}`"
                          >{{ workshiftStatuses[shift.status] }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="profile_main-card-body-empty">
            <p class="profile_main-card-body-empty-title">Смены не найдены</p>
            <p class="profile_main-card-body-empty-subtitle">На данную неделю смен не найдено</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="(userType === 'operator') && !isMyProfile && userPermissions.operator.profile.schedule.view"
       class="card profile_main-card">
    <div class="profile_main-card-header d-flex justify-content-between -schedule_padding">
      <div class="profile_main-card-header-schedule_picker">
        <h3 class="profile_main-card-header-schedule_picker-title">Расписание</h3>
        <div class="profile_main-card-header-schedule_picker-picker">
          <p class="profile_main-card-header-schedule_picker-picker-arrow" @click="setWeek('last')"><i
              class="fa fa-angle-left"/></p>
          <p>{{ beginningWeek }}</p>
          <p>-</p>
          <p>{{ weekEnd }}</p>
          <p class="profile_main-card-header-schedule_picker-picker-arrow"
             :style="week === 1 ? '-gray' : ''" @click="setWeek('next')"><i
              class="fa fa-angle-right"/>
          </p>
        </div>
      </div>
    </div>
    <div class="profile_main-card-body -paddingless">
      <div v-if="workshiftsOperator" class="profile_main-card-body-schedule -fixed">
        <div class="profile_main-card-body-schedule-header">
          <div class="profile_main-card-body-schedule-header-title"/>
          <div class="profile_main-card-body-schedule-header-main">
            <div class="profile_main-card-body-schedule-header-model">МОДЕЛЬ</div>
            <div class="profile_main-card-body-schedule-header-from">НАЧАЛО</div>
            <div class="profile_main-card-body-schedule-header-to -with-model">КОНЕЦ</div>
            <div class="profile_main-card-body-schedule-header-status">СТАТУС</div>
          </div>
        </div>
        <div v-for="(dayData, key) in workshiftsOperator"
             class="profile_main-card-body-schedule-days"
             :key="key"
        >
          <div class="profile_main-card-body-schedule-days-day">
            <div class="profile_main-card-body-schedule-days-day-title">{{  dayData.day  }}</div>
            <div class="profile_main-card-body-schedule-days-day-period_field">
              <div v-for="(period, index) in dayData.periods"
                   class="profile_main-card-body-schedule-days-day-period_field-period"
                   :key="index"
              >
                <div v-for="(shifts, element) in period"
                     class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts"
                     :key="element"
                >
                  <div v-for="(shift, block) in shifts.workshifts"
                       class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift"
                       :key="block"
                  >
                    <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-model"
                         :class="userPermissions.model.profile.view ? 'cursor-pointer': ''"
                         @click="openMiniProfile({id: shift.model.id, fullname: shift.model.fullname, office: shift.group.id})"
                    >
                      <span class="text-gray">{{ shift.model.uid }}</span>
                      {{ shift.model.surname }}
                    </div>
                    <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-from">
                      <span v-if="shift.start_at">{{ shift.start_at }}</span>
                      <span v-else class="text-gray">{{ shift.planned_start_at }}</span>
                    </div>
                    <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-to -with-model">
                      <span v-if="shift.end_at">{{ shift.end_at }}</span>
                      <span v-else class="text-gray">{{ shift.planned_end_at }}</span>
                    </div>
                    <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status">
                      <div class="profile_main-card-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status-badge"
                           :class="`-${shift.status}`"
                      >{{ workshiftStatuses[shift.status] }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="profile_main-card-body-empty">
        <p class="profile_main-card-body-empty-title">Смены не найдены</p>
        <p class="profile_main-card-body-empty-subtitle">На данную неделю смен не найдено</p>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select.vue";
import moment from 'moment';

moment.locale('ru');

export default {
  name: 'widget-profile-schedule',
  props: {
    profile: Object,
    userPermissions: Object,
    userType: String,
    isMyProfile: Boolean,
    changedUser: Object,
  },
  components: {
    'date-picker': DatePicker,
    'custom-select': Select,
  },
  data() {
    return {
      moment: moment,
      activeOffice: {},
      week: 0,
      checkOffice: 'empty',
    }
  },
  computed: {
    beginningWeek() {
      return moment().isoWeekday(0).add(this.week, 'week').format('DD.MM.YYYY');
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    weekEnd() {
      return moment().isoWeekday(6).add(this.week, 'week').format('DD.MM.YYYY');
    },
    modelOffices() {
      return this.profile?.profile?.common_groups || [{id: null, title: "Выберите офис"}];
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
    workshiftsOperator() {
      if (!(this.profile?.profile?.workshift && Object.keys(this.profile.profile.workshift).length)) return null;
      let workshiftsOperator = {};
      Object.entries(this.profile.profile.workshift).forEach(([officeId, workshift]) => {
        Object.keys(workshift.workshifts).forEach(workshiftDay => {
          const formattedDay = moment(workshiftDay).format('dd');
          const workshiftData = workshift.workshifts[workshiftDay];
          workshiftData.day = formattedDay;
          workshiftData.periods = Object.values(workshiftData);
          if (Object.keys(workshiftsOperator).includes(formattedDay)) {
            Object.assign(workshiftsOperator[formattedDay], workshiftData);
          } else {
            workshiftsOperator[formattedDay] = workshiftData;
          }
        });
      });
      return Object.keys(workshiftsOperator).length ? workshiftsOperator : null;
    },
  },
  watch: {
    profile: function (newProfile, oldProfile) {
      if (newProfile) {
        if (this.userType === 'model' && (!newProfile.profile.groups?.some(group => group.id === this.activeOffice.id) || newProfile.profile.user.main_group?.id !== oldProfile.profile.user.main_group?.id))
          this.setOfficeId(this.profile.profile?.user.main_group?.id);
        if (!oldProfile.id) this.week = 0;
      }
    },
    profileStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'commenting') && (newStatus === '')) this.newComment = '';
    }
  },
  created() {
    if (this.profile) {
      if (this.userType === 'model') this.setOfficeId(this.profile.profile?.user.main_group.id);
    }
  },
  methods: {
    setSchedule() {
      if (this.userPermissions.model.profile.schedule.edit) {
        let office = this.modelOffices.find(office => office.id === this.activeOffice.id);
        if (this.activeOffice.id) {
          this.$emit('setSchedule', office);
          this.checkOffice = 'officeSelected';
        } else
          this.checkOffice = 'officeNotSelected';
      }
    },
    setOffice() {
      this.$emit('setOffice', this.activeOffice.id);
      if (this.activeOffice.id) this.checkOffice = 'officeSelected';
      else this.checkOffice = 'officeNotSelected';
    },
    setOfficeId(mainGroupId) {
      let office = this.modelOffices.find(office => office.id === mainGroupId);
      if (office) this.activeOffice = office;
      else this.activeOffice = this.modelOffices[1] || {};
      this.setOffice();
    },
    setWeek(week) {
      if (!this.activeOffice.id && this.userType === 'model') this.checkOffice = 'officeNotSelected';
      else {
        this.checkOffice = 'officeSelected';
        if (week === 'next' && this.week < 1) this.week++;
        else if (week === 'last') this.week--;
        this.$emit('startWeek', {office: this.activeOffice.id,
          date: moment().isoWeekday(1).add(this.week, 'week').format('YYYY-MM-DD')});
      }
    },
    parseRoomTitle(room, element) {
      switch (element) {
        case 'without_room':
          return null;
        case 'reserved':
          return 'R';
      }
      return room.title;
    },
    openMiniProfile(profile) {
      if (this.userPermissions.model.profile.view) this.$emit('openModelMiniProfile', profile);
    },
  }
}
</script>