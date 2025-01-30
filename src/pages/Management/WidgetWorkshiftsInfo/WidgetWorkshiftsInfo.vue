<template>
  <div class="management-main-workshifts management-main-widget"
       :class="{'-transparent': statusWorkshiftsInfo === 'request'}">
    <div class="management-main-workshifts-header">
      <div class="management-main-workshifts-header-title">
        <h3>{{showOperatorInfo ? 'Операторы без смен' : 'Несдавшие расписание'}}</h3>
      </div>
      <group-select v-model="calendarGroup"
                    :groups="groupsOptions"
                    class="-filter management-select"
                    :disabled="statusWorkshiftsInfo === 'request'"
                    placeholder="Регион"
                    right
                    @change="getWorkshiftsInfo(false)"
      />
    </div>
    <div v-if="statusWorkshiftsInfo === 'first-request'" class="management-main-workshifts-load">
      <throbber class="throbber"/>
      <span>Информация загружается, пожалуйста, подождите</span>
    </div>
    <div v-else class="management-main-workshifts-body">
      <div v-if="!workshiftsInfo.length" class="management-main-workshifts-load">
        <h3>В выбранном регионе нет {{showOperatorInfo ? 'операторов без смен' : 'моделей несдавших смены'}}</h3>
        <span>Попробуйте выбрать другой регион</span>
      </div>
      <div v-for="(workshiftsInfoCity, key) in workshiftsInfo">
        <div class="management-main-workshifts-body-group" @click="toggleCollapse(key)">
          <div class="management-main-workshifts-body-group-info">
            <div class="management-main-workshifts-body-group-info-point groups-nav-list-group-container-color"
                 :style="`background-color: ${workshiftsInfoCity.group.color || 'red'}`"></div>
              <div class="management-main-workshifts-body-group-info-title -city">
                <span v-if="permissionLink" class="management-main-workshifts-body-group-info-title-link"
                      @click="goWorkshifts(workshiftsInfoCity.group)">{{workshiftsInfoCity.group.country}}, {{workshiftsInfoCity.group.city}}</span>
                <span v-else>{{workshiftsInfoCity.group.country}}, {{workshiftsInfoCity.group.city}}</span>
              </div>
          </div>
          <b>{{workshiftsInfoCity.count}}</b>
          <i v-if="!(calendarGroup && calendarGroup.type === 'city')" class="fa management-main-workshifts-body-group-collapse_icon" :class="`fa-angle-${citiesCollapses[key] ? 'up' : 'down'}`"/>
        </div>
        <b-collapse v-model="citiesCollapses[key]" :id="`workloads-city-${key}`">
          <div v-for="workshiftsInfoOffice in workshiftsInfoCity.offices" class="management-main-workshifts-body-group">
            <div class="management-main-workshifts-body-group-info">
              <div class="management-main-workshifts-body-group-info-point groups-nav-list-group-container-color"></div>
              <div class="management-main-workshifts-body-group-info-title">
                <span v-if="permissionLink" class="management-main-workshifts-body-group-info-title-link"
                      @click="goWorkshifts(workshiftsInfoOffice)">{{workshiftsInfoOffice.title}}</span>
                <span v-else>{{workshiftsInfoOffice.title}}</span>
              </div>
            </div>
            <b>{{workshiftsInfoOffice.count}}</b>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import DateScroll from "@/pages/Management/components/DateScroll";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import throbber from "@/assets/vue-svg/throbber.svg";
import moment from "moment";
import router from '@/Routes';
import {searchListRecursively} from "@/tools/tools";

export default {
  name: "WidgetWorkshiftsInfo",
  components: {
    DateScroll,
    GroupSelect,
    'throbber': throbber,
  },
  props: {
    showOperatorInfo: {
      type: Boolean,
      default: false,
    },
    groupsOptions: Array,
    groups: Array,
  },
  data() {
    return {
      calendarGroup: null,
      currentDate: moment().format('YYYY-MM-DD'),
      citiesCollapses: [],
    };
  },
  computed: {
    statusWorkshiftsInfo() {
      return this.showOperatorInfo ? this.$store.state.management.statusOperatorsWithoutWorkshifts : this.$store.state.management.statusModelsWithoutWorkshifts;
    },
    workshiftsInfo() {
      return this.showOperatorInfo ? this.$store.state.management.operatorsWithoutWorkshifts : this.$store.state.management.modelsWithoutWorkshifts;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    permissionOperatorsInfo() {
      return this.userPermissions.setup.workshift.operator;
    },
    permissionFreeModelsInfo() {
      return this.userPermissions.schedule.edit || this.userPermissions.schedule.reserve.view;
    },
    permissionLink() {
      return (this.showOperatorInfo && this.permissionOperatorsInfo) || (!this.showOperatorInfo && this.permissionFreeModelsInfo);
    },
    workshiftTabs() {
      return this.$store.state.schedule.workshiftTabs;
    },
  },
  watch: {
    workshiftsInfo: function (newWorkshiftsInfo) {
      if (this.calendarGroup?.type === 'city') this.citiesCollapses[0] = true
      else this.citiesCollapses = newWorkshiftsInfo.map(() => false);
    },
  },
  created() {
    this.getWorkshiftsInfo(true);
    this.citiesCollapses = this.workshiftsInfo.map(() => false);
  },
  methods: {
    getWorkshiftsInfo(isFirstRequest) {
      this.$store.dispatch(`management/${this.showOperatorInfo ? 'fetchOperatorsWithoutWorkshifts' : 'fetchModelsWithoutWorkshifts'}`, {
        query: {
          date: this.currentDate,
          group: this.calendarGroup?.id,
        },
        isFirstRequest: isFirstRequest,
      });
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
            tab: this.showOperatorInfo ? 'operator' : 'free-models',
          }
        });
        this.$store.dispatch('schedule/setActiveTab', 25);
      }
      else {
        this.$store.dispatch('schedule/addWorkshiftTab', {
          date_type: 'day',
          group: group,
          tab: this.showOperatorInfo ? 'operator' : 'free-models',
        });
        this.$store.dispatch('schedule/setActiveTab', this.workshiftTabs.length - 1);
      }
      router.push('/app/workshifts');
    },
  }
}
</script>