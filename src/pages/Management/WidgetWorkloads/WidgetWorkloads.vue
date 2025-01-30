<template>
  <div class="management-main-workloads management-main-widget"
       :class="{'-transparent': statusWorkloads === 'request'}">
    <div class="management-main-workloads-header">
      <div class="management-main-workloads-header-title">
        <h3>Загрузка офисов</h3>
        <date-scroll v-model="currentDate" @change="getWorkloads(false)"/>
      </div>
      <group-select v-model="calendarGroup"
                    :groups="groupsOptions"
                    class="-filter management-select"
                    :disabled="statusWorkloads === 'request'"
                    placeholder="Регион"
                    right
                    @change="getWorkloads(false)"
      />
    </div>
    <div v-if="statusWorkloads === 'first-request'" class="management-main-workloads-load">
      <throbber class="throbber"/>
      <span>Информация загружается, пожалуйста, подождите</span>
    </div>
    <div v-else class="management-main-workloads-body">
      <div v-if="!workloads.length" class="management-main-workloads-load">
        <h3>В выбранном регионе офисы не найдены</h3>
        <span>Попробуйте выбрать другой регион</span>
      </div>
      <template v-for="(workloadCity, key) in workloads">
        <div class="management-main-workloads-body-group" @click="toggleCollapse(key)">
          <div class="management-main-workloads-body-group-info">
            <div class="management-main-workloads-body-group-info-point groups-nav-list-group-container-color"
                 :style="`background-color: ${workloadCity.group.color || 'red'}`"></div>
            <div class="management-main-workloads-body-group-info-title -city">
              <span v-if="permissionShowSchedule" class="management-main-workloads-body-group-info-title-link"
                    @click="goWorkshifts(workloadCity.group)">{{workloadCity.group.country}}, {{workloadCity.group.city}}</span>
              <span v-else>{{workloadCity.group.country}}, {{workloadCity.group.city}}</span>
            </div>
          </div>
          <div class="management-main-workloads-body-group-progress">
            {{workloadCity.count}}%
            <b-progress :value="workloadCity.count" :variant="workloadCity.count >= 50 ? 'success' : 'danger'"></b-progress>
          </div>
          <i v-if="!(calendarGroup && calendarGroup.type === 'city')" class="fa management-main-workloads-body-group-collapse_icon" :class="`fa-angle-${citiesCollapses[key] ? 'up' : 'down'}`"/>
        </div>
        <b-collapse v-model="citiesCollapses[key]" :id="`workloads-city-${key}`">
          <div v-for="workloadOffice in workloadCity.offices" class="management-main-workloads-body-group">
            <div class="management-main-workloads-body-group-info">
              <div class="management-main-workloads-body-group-info-point groups-nav-list-group-container-color"></div>
              <div class="management-main-workloads-body-group-info-title">
                <span v-if="permissionShowSchedule" class="management-main-workloads-body-group-info-title-link"
                  @click="goWorkshifts(workloadOffice)">{{workloadOffice.title}}</span>
                <span v-else>{{workloadOffice.title}}</span>
            </div>
            </div>
            <div class="management-main-workloads-body-group-progress">
              {{workloadOffice.count}}%
              <b-progress :value="workloadOffice.count" :variant="workloadOffice.count >= 50 ? 'success' : 'danger'"></b-progress>
            </div>
          </div>
        </b-collapse>
      </template>
    </div>
  </div>
</template>

<script>
import DateScroll from "@/pages/Management/components/DateScroll";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import throbber from "@/assets/vue-svg/throbber.svg";
import router from "@/Routes";
import moment from "moment";
import {searchListRecursively} from "@/tools/tools";

export default {
  name: "WidgetWorkloads",
  components: {
    DateScroll,
    GroupSelect,
    'throbber': throbber
  },
  props: {
    groupsOptions: Array,
    groups: Array,
  },
  data() {
    return {
      calendarGroup: null,
      currentDate: moment().format('YYYY-MM-DD'),
      citiesCollapses: [],
    }
  },
  computed: {
    statusWorkloads() {
      return this.$store.state.management.statusWorkloads;
    },
    workloads() {
      return this.$store.state.management.workloads;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    permissionShowSchedule() {
      return this.userPermissions.schedule.view || this.userPermissions.schedule.actual.start.date.edit || this.userPermissions.schedule.actual.end.date.edit || this.userPermissions.schedule.break.edit;
    },
    workshiftTabs() {
      return this.$store.state.schedule.workshiftTabs;
    },
  },
  watch: {
    workloads: function (newWorkloads) {
        if (this.calendarGroup?.type === 'city') this.citiesCollapses[0] = true
        else this.citiesCollapses = newWorkloads.map(() => false);
    }
  },
  created() {
    this.getWorkloads(true);
    this.citiesCollapses = this.workloads.map(() => false);
  },
  methods: {
    getWorkloads(isFirstRequest) {
      this.$store.dispatch('management/fetchWorkloads', {
        query: {
          date: this.currentDate,
          group: this.calendarGroup?.id
        },
        isFirstRequest: isFirstRequest
      })
    },
    toggleCollapse(key) {
      this.citiesCollapses = this.citiesCollapses.map((e, currentKey) => key === currentKey ? !e : e);
    },
    goWorkshifts(rawGroup) {
      let groupInfo = searchListRecursively(this.groups, (group) => group.id === rawGroup.id);
      if (!groupInfo) return;
      let group = {
        ...groupInfo.element,
        city: groupInfo.element.type === 'office' ? groupInfo.parent : undefined,
      }
      if (this.workshiftTabs.length >= 25) {
        this.$store.dispatch('schedule/editWorkshiftTab', {
          id: 25,
          tab: {
            date_type: 'day',
            group: group,
            tab: 'show',
          }
        });
        this.$store.dispatch('schedule/setActiveTab', 25);
      }
      else {
        this.$store.dispatch('schedule/addWorkshiftTab', {
          date_type: 'day',
          group: group,
          tab: 'show',
        });
        this.$store.dispatch('schedule/setActiveTab', this.workshiftTabs.length - 1);
      }
      router.push('/app/workshifts');
    },
  }
}
</script>