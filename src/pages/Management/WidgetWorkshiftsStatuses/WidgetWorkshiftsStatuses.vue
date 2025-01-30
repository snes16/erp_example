<template>
  <div class="management-main-schedule_statuses management-main-widget"
       :class="{'-transparent': statusWorkshiftsStatuses === 'request'}">
    <div class="management-main-schedule_statuses-header">
      <div class="management-main-schedule_statuses-header-title">
        <h3 class="tasks-header-title">
          {{countStatusWidget}}
          <custom-select v-model="currentStatus" class="tasks-header-title-select" defaultText="активные смен"
                         :options="optionsStatuses" @change="getWorkshiftsStatuses(false)">
            <template v-slot:chosen-variant="props">
              <div v-if="props.value" class="management-main-schedule_statuses-header-title-chosen">
                <span class="management-main-schedule_statuses-header-title-chosen-title"> {{ titleWidget }} </span>
                <span>{{ getPluralizeStatus(props.value.toLowerCase()) }}</span>
              </div>
              <span v-else>{{ props.shownText }}</span>
            </template>
          </custom-select>
        </h3>
        <date-scroll v-model="currentDate" @change="getWorkshiftsStatuses(false)"/>
      </div>
      <group-select v-model="calendarGroup"
                    :groups="groups"
                    class="-filter management-select"
                    :disabled="statusWorkshiftsStatuses === 'request'"
                    placeholder="Регион"
                    right
                    @change="getWorkshiftsStatuses(false)"
      />
    </div>
    <div v-if="statusWorkshiftsStatuses === 'first-request'" class="management-main-schedule_statuses-load">
      <throbber class="throbber"/>
      <span>Информация загружается, пожалуйста, подождите</span>
    </div>
    <div v-else class="management-main-schedule_statuses-highcharts">
      <highcharts :options="chartOptions"></highcharts>
    </div>
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue'
import DateScroll from "@/pages/Management/components/DateScroll";
import CustomSelect from "@/components/Common/Select/Select";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import throbber from "@/assets/vue-svg/throbber.svg";
import { pluralizeWords } from "@/tools/tools";
import moment from "moment";

export default {
  name: "WidgetWorkshiftsStatuses",
  components: {
    'highcharts' : Chart,
    CustomSelect,
    DateScroll,
    GroupSelect,
    'throbber': throbber,
  },
  props: {
    groupsOptions: Array,
    groupsOptionsNonOffice: Array,
  },
  data() {
    return {
      calendarGroup: null,
      currentDate: moment().format('YYYY-MM-DD'),
      currentStatus: 'active',
      chartData: {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          height: 175
        },
        title: false,
        tooltip: {
          headerFormat: '',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {point.name}: <b>{point.y}</b><br/>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: false
            },
            showInLegend: true,
            size: 135,
            center: ['35%', '50%']
          }
        },
        legend: {
          align: 'right',
          alignColumns: true,
          labelFormat: '<div class="management-main-schedule_statuses-highcharts-legend"><span>{name}</span> <b>{y}</b></div>',
          verticalAlign: 'middle',
          itemWidth: 200,
          itemMarginBottom: 10,
          symbolRadius: 0,
          useHTML: true,
          navigation: {
            activeColor: '#1A86D0',
            arrowSize: 10
          }
        }
      }
    }
  },
  computed: {
    statusWorkshiftsStatuses() {
      return this.$store.state.management.statusWorkshiftsStatuses
    },
    optionsStatuses() {
      return {
        active: 'Активные',
        created: 'Резерв',
        assigned: 'Назначенные',
        canceled: 'Отменённые',
        process: 'В процессе',
        completed: 'Завершённые'
      };
    },
    workshiftsStatuses() {
      return this.$store.state.management.workshiftsStatuses
    },
    chartOptions() {
      return {...this.chartData, series:[{
          innerSize: '70%',
          name: 'statuses',
          data: this.workshiftsStatuses.other
        }]}
    },
    countStatusWidget() {
      return this.statusWorkshiftsStatuses === 'first-request' ? 0 : this.workshiftsStatuses.active
    },
    titleWidget() {
      return pluralizeWords(this.countStatusWidget, ['смена', 'смены', 'смен'])
    },
    groups() {
      return this.currentStatus === 'active' ? this.groupsOptions : this.groupsOptionsNonOffice;
    },
  },
  created() {
    this.getWorkshiftsStatuses(true)
  },
  methods: {
    getWorkshiftsStatuses(isFirstRequest) {
      if (this.currentStatus !== 'active' && this.calendarGroup?.type === 'office') this.calendarGroup = null
      this.$store.dispatch('management/fetchWorkshiftsStatuses', {
        query: {
          status: this.currentStatus === 'active' ? null : this.currentStatus,
          date: this.currentDate,
          group: this.calendarGroup?.id
        },
        isFirstRequest: isFirstRequest
      })
    },
    getPluralizeStatus(status) {
      if (this.currentStatus === 'created' || this.currentStatus === 'process') return status
      return pluralizeWords(this.countStatusWidget, [`${status.slice(0, -2)}ая`, status, `${status.slice(0, -2)}ых`])
    }
  }
}
</script>