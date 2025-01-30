<template>
  <div class="hr_stats">
    <h2>Статистика</h2>
    <div class="card hr_stats-main">
      <div class="hr_stats-main-filters">
        <div class="hr_stats-main-filters-top">
          <groups-filter v-model="activeGroups"
                         class="tasks-body-main-filters-inputs-group"
                         :groups="groups"
                         allGroupsDefault
                         @change="updateFilters"
          />
          <div class="hr_stats-main-filters-top-periods">
            <b>Период:</b>
            <i class="hr_stats-main-filters-top-periods-icon glyphicon glyphicon-glyph-calendar"/>
            <date-picker v-model="dateFrom"
                         class="datepicker-text hr_stats-main-filters-top-periods-datepicker"
                         placeholder="Дата"
                         lang="ru"
                         input-class="input-plain"
                         format="DD.MM.YYYY"
                         :clearable="false"
                         @change="updateFilters"
            ><i slot="calendar-icon"/></date-picker>
            <span class="text-gray-light"> — </span>
            <i class="hr_stats-main-filters-top-periods-icon glyphicon glyphicon-glyph-calendar"/>
            <date-picker v-model="dateTo"
                         class="datepicker-text hr_stats-main-filters-top-periods-datepicker"
                         placeholder="Дата"
                         lang="ru"
                         input-class="input-plain"
                         format="DD.MM.YYYY"
                         :clearable="false"
                         @change="updateFilters"
            ><i slot="calendar-icon"/></date-picker>
          </div>
        </div>
        <div class="hr_stats-main-filters-bottom">
          <select-multiple v-model="activeFilters.resources"
                           :options="filtersOptions.resources"
                           id="filters-resources"
                           class="-white"
                           :placeholder="activeFiltersPlaceholders.resources"
                           value-field="id"
                           :disabled="!filtersOptions.resources.length"
                           @change="changeLocalFilters"
          />
          <select-multiple v-model="activeFilters.vacancies"
                           :options="filtersOptions.vacancies"
                           id="filters-vacancies"
                           class="-white ml-2"
                           :placeholder="activeFiltersPlaceholders.vacancies"
                           value-field="id"
                           :disabled="!filtersOptions.vacancies.length"
                           @change="changeLocalFilters"
          >
            <template v-slot:list-variant="{variant}">
              <div>
                <p class="mb-0">{{ variant.title }}</p>
                <p class="mb-0 text-gray-text">{{ variant.resourceTitle }}</p>
              </div>
            </template>
          </select-multiple>
          <select-multiple v-model="activeFilters.agents"
                           :options="filtersOptions.agents"
                           id="filters-agents"
                           class="-white ml-2"
                           :placeholder="activeFiltersPlaceholders.agents"
                           value-field="id"
                           :disabled="!filtersOptions.agents.length"
                           @change="changeLocalFilters"
          >
            <template v-slot:list-variant="{variant}">
              <div class="d-flex align-items-center">
                <div class="avatar mr-2" :style="variant.avatar ? `background-image: url(${variant.avatar}); background-size: cover;` : ''"></div>
                <b>{{ variant.uid }}</b>
                <span>{{ variant.surname }}</span>
              </div>
            </template>
          </select-multiple>
        </div>
      </div>
      <div class="hr_stats-main-table" :class="{'-loading': status === 'request'}">
        <div class="hr_stats-main-table-row -head">
          <div class="hr_stats-main-table-row-cell -title">
            <b>Регион</b>
          </div>
          <div class="hr_stats-main-table-row-cell -responses">
            <b>Заявки</b>
          </div>
          <div class="hr_stats-main-table-row-cell -interviews">
            <b>Собеседования</b>
          </div>
          <div class="hr_stats-main-table-row-cell -registrations">
            <b>Регистрация</b>
          </div>
          <div class="hr_stats-main-table-row-cell -working">
            <b>Работают</b>
          </div>
          <div class="hr_stats-main-table-row-cell -actions"></div>
        </div>
        <div v-for="country in formattedStats.list" class="hr_stats-main-table-row" @click="toggleCountryCollapse(country.id)">
          <div class="hr_stats-main-table-row-cell -title">
            <span class="flag-icon mr-1" :class="`flag-icon-${country.flag || 'default'}`"></span>
            <span>{{ country.title }}</span>
          </div>
          <div class="hr_stats-main-table-row-cell -responses">
            <span>{{ country.data.responses }}</span>
          </div>
          <div class="hr_stats-main-table-row-cell -interviews">
            <span>{{ country.data.interviews }}</span>
          </div>
          <div class="hr_stats-main-table-row-cell -registrations">
            <span>{{ country.data.registrations }}</span>
          </div>
          <div class="hr_stats-main-table-row-cell -working">
            <span>{{ country.data.working }}</span>
          </div>
          <div class="hr_stats-main-table-row-cell -actions">
            <div class="abc-checkbox">
              <input v-model="activeElements"
                     :value="`group-${country.id}`"
                     type="checkbox"
                     :id="`group-${country.id}`"
                     @change="toggleActiveElement(country)"
                     @click.stop
              />
              <label :for="`group-${country.id}`" />
            </div>
            <i class="fa fa-angle-down hr_stats-main-table-row-cell-arrow" :class="{'-active': countriesCollapses.includes(country.id)}"/>
          </div>
          <b-collapse :id="`country-${country.id}`" class="hr_stats-main-table-row-children">
            <div v-for="city in country.cities" class="hr_stats-main-table-row" @click.stop="toggleCityCollapse(city.id)">
              <div class="hr_stats-main-table-row-cell -title">
                <span>{{ city.title }}</span>
              </div>
              <div class="hr_stats-main-table-row-cell -responses">
                <span>{{ city.data.responses }}</span>
              </div>
              <div class="hr_stats-main-table-row-cell -interviews">
                <span>{{ city.data.interviews }}</span>
              </div>
              <div class="hr_stats-main-table-row-cell -registrations">
                <span>{{ city.data.registrations }}</span>
              </div>
              <div class="hr_stats-main-table-row-cell -working">
                <span>{{ city.data.working }}</span>
              </div>
              <div class="hr_stats-main-table-row-cell -actions">
                <div class="abc-checkbox">
                  <input v-model="activeElements"
                         :value="`group-${city.id}`"
                         type="checkbox"
                         :id="`group-${city.id}`"
                         @change="toggleActiveElement(city)"
                         @click.stop
                  />
                  <label :for="`group-${city.id}`" />
                </div>
                <i class="fa fa-angle-down hr_stats-main-table-row-cell-arrow" :class="{'-active': citiesCollapses.includes(city.id)}"/>
              </div>
              <b-collapse :id="`city-${city.id}`" class="hr_stats-main-table-row-children">
                <div v-for="element in city.elements" class="hr_stats-main-table-row" @click.stop>
                  <div class="hr_stats-main-table-row-cell -title">
                    <div class="hr_stats-main-table-row-cell-content">
                      <p class="hr_stats-main-table-row-cell-content-main">{{ element.title || element.uid }}</p>
                      <p class="hr_stats-main-table-row-cell-content-additional">{{ element.type === 'vacancy' ? element.info : 'Агент' }}</p>
                    </div>
                  </div>
                  <div class="hr_stats-main-table-row-cell -responses">
                    <span>{{ element.data.responses }}</span>
                  </div>
                  <div class="hr_stats-main-table-row-cell -interviews">
                    <span>{{ element.data.interviews }}</span>
                  </div>
                  <div class="hr_stats-main-table-row-cell -registrations">
                    <span>{{ element.data.registrations }}</span>
                  </div>
                  <div class="hr_stats-main-table-row-cell -working">
                    <span>{{ element.data.working }}</span>
                  </div>
                  <div class="hr_stats-main-table-row-cell -actions">
                    <div class="abc-checkbox mr-2">
                      <input v-model="activeElements"
                             :value="element.uniqueId"
                             type="checkbox"
                             :id="element.uniqueId"
                             @change="toggleActiveElement(element)"
                      />
                      <label :for="element.uniqueId" />
                    </div>
                  </div>
                </div>
              </b-collapse>
            </div>
          </b-collapse>
        </div>
        <div class="hr_stats-main-table-row -foot">
          <div class="hr_stats-main-table-row-cell -title">
            <span>Общее количество</span>
          </div>
          <div class="hr_stats-main-table-row-cell -responses">
            <b>{{ formattedStats.all.responses }}</b>
          </div>
          <div class="hr_stats-main-table-row-cell -interviews">
            <b>{{ formattedStats.all.interviews }}</b>
          </div>
          <div class="hr_stats-main-table-row-cell -registrations">
            <b>{{ formattedStats.all.registrations }}</b>
          </div>
          <div class="hr_stats-main-table-row-cell -working">
            <b>{{ formattedStats.all.working }}</b>
          </div>
          <div class="hr_stats-main-table-row-cell -actions"></div>
        </div>
      </div>
    </div>
    <div v-if="activeElements.length" class="row hr_stats-graphs">
      <div class="col-8">
        <div class="card hr_stats-graphs-periods">
          <chart :options="periodsChartData"/>
        </div>
      </div>
      <div class="col-4">
        <div class="card hr_stats-graphs-circle">
          <chart v-if="showPieChart" :options="pieChartData"/>
          <div class="hr_stats-graphs-circle-empty" v-else>
            <pie-empty class="hr_stats-graphs-circle-empty-svg" />
            <p>Выбранные регионы нельзя<br/>сравнить между собой</p>
            <p class="text-gray-text">Поменяйте регионы в таблице, чтобы<br/>увидеть отображение данных в диаграмме </p>
          </div>
        </div>
      </div>
      <div class="col-12 mt-4">
        <div class="card hr_stats-graphs-bars">
          <chart :options="barsChartData"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GroupsFilter from "@/components/Common/Filters/GroupsFilter";
import SelectMultiple from "@/components/Common/Select/SelectMultiple";
import DatePicker from 'vue2-datepicker';
import { Chart } from 'highcharts-vue';
import pieEmpty from '@/assets/vue-svg/pie-empty.svg';
import { pluralizeWords } from "@/tools/tools";
import moment from 'moment';
moment.locale('ru');

export default {
  name: 'hr-stats',
  components: {
    GroupsFilter,
    SelectMultiple,
    DatePicker,
    Chart,
    'pie-empty': pieEmpty,
  },
  data() {
    return {
      activeGroups: [],
      dateFrom: null,
      dateTo: new Date(),
      activeFilters: {
        resources: [],
        vacancies: [],
        agents: [],
      },
      countriesCollapses: [],
      citiesCollapses: [],
      activeElements: [],
      activeElementsData: [],
    }
  },
  computed: {
    groups() {
      if (!this.$store.state.dictionaries.groupsNonSystem.length) return [];
      return this.$store.state.dictionaries.groupsNonSystem.filter(group => !!group.children?.length);
    },
    responsesStats() {
      return this.$store.state.hr.responsesStats;
    },
    cities() {
      return this.groups.flatMap(country => country.children.map(city => ({...city, countryId: country.id})));
    },
    formattedStats() {
      let list = [],
          all = {
            interviews: 0,
            registrations: 0,
            responses: 0,
            working: 0,
          };

      if (!this.cities.length || !this.responsesStats.length) return {list, all};

      this.responsesStats.forEach(element => {
        if (element.type === 'vacancy') {
          if (this.activeFilters.agents.length && !this.activeFilters.resources.length && !this.activeFilters.vacancies.length) return;
          if ((this.activeFilters.resources.length && !this.activeFilters.resources.includes(element.resource_id)) || (this.activeFilters.vacancies.length && !this.activeFilters.vacancies.includes(element.id))) return;
        } else {
          if (!this.activeFilters.agents.length && (this.activeFilters.resources.length || this.activeFilters.vacancies.length)) return;
          if (this.activeFilters.agents.length && !this.activeFilters.agents.includes(element.id)) return;
        }

        all = {
          interviews: all.interviews + element.data.interviews,
          registrations: all.registrations + element.data.registrations,
          responses: all.responses + element.data.responses,
          working: all.working + element.data.working,
        };
        let city = this.cities.find(currentCity => currentCity.id === element.group_id);
        if (!city) return;
        let countryInStats = list.find(country => country.id === city.countryId);
        if (!countryInStats) {
          countryInStats = {
            id: city.countryId,
            title: city.build_group.country,
            flag: city.build_group.flag,
            data: {...element.data},
            cities: [],
          };
          list.push(countryInStats);
        } else countryInStats.data = {
          interviews: countryInStats.data.interviews + element.data.interviews,
          registrations: countryInStats.data.registrations + element.data.registrations,
          responses: countryInStats.data.responses + element.data.responses,
          working: countryInStats.data.working + element.data.working,
        }

        let cityInStats = countryInStats.cities.find(currentCity => currentCity.id === city.id);
        if (!cityInStats) {
          cityInStats = {
            id: city.id,
            title: city.title,
            data: {...element.data},
            elements: [],
          };
          countryInStats.cities.push(cityInStats);
        } else cityInStats.data = {
          interviews: cityInStats.data.interviews + element.data.interviews,
          registrations: cityInStats.data.registrations + element.data.registrations,
          responses: cityInStats.data.responses + element.data.responses,
          working: cityInStats.data.working + element.data.working,
        }
        cityInStats.elements.push({
          ...element,
          uniqueId: `${element.type}-${element.id}${element.type === 'agent' ? ('_' + city.id) : ''}`,
        });
      });
      return {list, all};
    },
    filtersOptions() {
      let resources = [],
          vacancies = [],
          agents = [];

      this.responsesStats.forEach(element => {
        if (element.type === 'vacancy') {
          if (!vacancies.some(vacancy => vacancy.id === element.id)) vacancies.push({
            id: element.id,
            resourceId: element.resource_id,
            resourceTitle: element.info,
            title: element.title,
          });
          if (!resources.some(resource => resource.id === element.resource_id)) resources.push({
            id: element.resource_id,
            title: element.info,
          });
        } else if (!agents.some(agent => agent.id === element.id)) agents.push({
          id: element.id,
          avatar: element.avatar,
          uid: element.uid,
          surname: element.surname,
        });
      });
      return {resources, vacancies, agents};
    },
    activeFiltersPlaceholders() {
      return {
        resources: this.activeFilters.resources.length ? (this.activeFilters.resources.length === this.filtersOptions.resources.length ? 'Выбраны все ресурсы' : `${pluralizeWords(this.activeFilters.resources.length, ['Выбран', 'Выбрано', 'Выбраны'])} ${this.activeFilters.resources.length} ${pluralizeWords(this.activeFilters.resources.length, ['ресурс', 'ресурса', 'ресурсов'])}`) : 'Ресурсы',
        vacancies: this.activeFilters.vacancies.length ? (this.activeFilters.vacancies.length === this.filtersOptions.vacancies.length ? 'Выбраны все вакансии' : `${pluralizeWords(this.activeFilters.vacancies.length, ['Выбрана', 'Выбрано', 'Выбраны'])} ${this.activeFilters.vacancies.length} ${pluralizeWords(this.activeFilters.vacancies.length, ['вакансия', 'вакансии', 'вакансий'])}`) : 'Вакансии',
        agents: this.activeFilters.agents.length ? (this.activeFilters.agents.length === this.filtersOptions.agents.length ? 'Выбраны все агенты' : `${pluralizeWords(this.activeFilters.agents.length, ['Выбран', 'Выбрано', 'Выбраны'])} ${this.activeFilters.agents.length} ${pluralizeWords(this.activeFilters.agents.length, ['агент', 'агента', 'агентов'])}`) : 'Агенты',
      };
    },
    status() {
      return this.$store.state.hr.hrStatus;
    },
    responsesStatsPeriods() {
      return this.$store.state.hr.responsesStatsPeriods;
    },
    formattedResponsesStatsPeriods() {
      if (!this.responsesStatsPeriods.length) return [];
      return this.responsesStatsPeriods.map(element => {
        let formattedData = element.data.map(dataElement => [new Date(dataElement[0]).getTime(), dataElement[1]]);
        switch (element.type) {
          case 'group':
            let group = this.groups.find(country => country.id === element.id) || this.cities.find(city => city.id === element.id);
            return {
              type: 'spline',
              name: group.title,
              data: formattedData,
            };
          case 'vacancy':
            let vacancy = this.responsesStats.find(stat => (stat.id === element.id) && (stat.type === element.type));
            return {
              type: 'spline',
              name: vacancy.title,
              data: formattedData,
            };
          case 'agent':
            let agent = this.responsesStats.find(stat => (stat.id === element.id) && (stat.type === element.type) && (stat.group_id === element.group_id));
            return {
              type: 'spline',
              name: agent.title || agent.uid,
              data: formattedData,
            };
        }
        return element;
      });
    },
    periodsChartData() {
      return {
        credits: {
          enabled: false
        },
        chart: {
          height: 325
        },
        title: {
          style: {
            display: 'none',
          },
        },
        exporting: {
          enabled: false
        },
        legend: {
          verticalAlign: 'bottom'
        },
        yAxis: {
          title: false
        },
        xAxis: {
          type: 'datetime',
          tickInterval: 3600000 * 24,
          crosshair: true,
          labels: {
            overflow: 'justify',
            formatter: function () {
              return moment(this.value).format('DD.MM.YY')
            }
          }
        },
        annotations: {
          visible: false
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false,
              symbol: 'circle'
            },
            tooltip: {
              headerFormat: '',
              formatter() {
                return `<span style="color: ${this.color}">${this.series.name} at ${this.y.toFixed(2)}</span>`;
              }
            },
          },
        },
        series: this.formattedResponsesStatsPeriods
      }
    },
    showPieChart() {
      return this.activeElementsData.every(element => element.subtype === this.activeElementsData[0].subtype);
    },
    pieChartData() {
      return {
        credits: {
          enabled: false,
        },
        chart: {
          type: 'pie',
          height: 170,
        },
        title: false,
        plotOptions: {
          series: {
            showInLegend: true,
            dataLabels: {
              enabled: false,
            },
          },
        },
        legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          labelFormatter: function () {
            return `${this.name}: ${this.y}`;
          },
          itemMarginBottom: 5,
          symbolRadius: 0,
          itemWidth: 100,
        },
        series: [
          {
            name: '',
            size: '100%',
            data: this.activeElementsData.map(element => ({name: element.title || element.uid, y: element.data.responses})),
          },
        ],
        tooltip: {
          headerFormat: '',
          formatter() {
            return `<span>${this.key}: <b>${this.y} ${pluralizeWords(this.y, ['заявка', 'заявки', 'заявок'])}</b></span>`;
          },
        },
      };
    },
    percentagesData() {
      let series = [{
        name: 'Конверсия % из заявки в собеседование',
        data: [],
      }, {
        name: 'Конверсия % из заявки в регистрацию',
        data: [],
      }, {
        name: 'Конверсия % из собеседования в регистрацию',
        data: [],
      }, {
        name: 'Конверсия % из регистрации в работают',
        data: [],
      }],
          categories = [];

      this.activeElementsData.forEach(element => {
        series[0].data.push(Math.round(element.data.interviews * 1000 / element.data.responses) / 10);
        series[1].data.push(Math.round(element.data.registrations * 1000 / element.data.responses) / 10);
        series[2].data.push(element.data.interviews && (Math.round(element.data.registrations * 1000 / element.data.interviews) / 10) || 0);
        series[3].data.push(element.data.registrations && (Math.round(element.data.working * 1000 / element.data.registrations) / 10) || 0);
        categories.push(element.title || element.uid);
      });

      return {series, categories};
    },
    barsChartData() {
      return {
        chart: {
          type: 'column',
          height: 470,
        },
        credits: {
          enabled: false,
        },
        title: false,
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              format: '{y} %'
            },
          },
        },
        xAxis: {
          categories: this.percentagesData.categories,
        },
        yAxis: {
          title: false,
          min: 0,
          max: 100,
        },
        series: this.percentagesData.series,
      };
    },
  },
  watch: {
    formattedStats() {
      this.activeElements = [];
      this.activeElementsData = [];
      this.changeActiveElements();
    },
  },
  created() {
    let savedApiFilters = localStorage.getItem('hrStatsApiFilters');
    if (savedApiFilters) {
      let parsedApiFilters = JSON.parse(savedApiFilters);
      this.activeGroups = parsedApiFilters.activeGroups;
      this.dateFrom = parsedApiFilters.dateFrom;
      this.dateTo = parsedApiFilters.dateTo;
    } else {
      let dateFrom = new Date();
      dateFrom.setDate(1);
      this.dateFrom = dateFrom;
    }

    let savedLocalFilters = localStorage.getItem('hrStatsLocalFilters');
    if (savedLocalFilters) this.activeFilters = JSON.parse(savedLocalFilters);

    this.$store.dispatch('dictionaries/fetchGroupsNonSystem');
    this.updateFilters();
  },
  methods: {
    updateFilters() {
      localStorage.setItem('hrStatsApiFilters', JSON.stringify({activeGroups: this.activeGroups, dateFrom: this.dateFrom, dateTo: this.dateTo}));
      if (!this.activeGroups.length) return;
      this.$store.dispatch('hr/fetchResponsesStats', {
        groups: this.activeGroups,
        'period[from]': moment(this.dateFrom).format('YYYY-MM-DD'),
        'period[to]': moment(this.dateTo).format('YYYY-MM-DD'),
      });
    },
    toggleCountryCollapse(countryId) {
      if (this.countriesCollapses.includes(countryId)) this.countriesCollapses = this.countriesCollapses.filter(id => id !== countryId);
      else this.countriesCollapses = [...this.countriesCollapses, countryId];
      this.$root.$emit('bv::toggle::collapse', `country-${countryId}`);
    },
    toggleCityCollapse(cityId) {
      if (this.citiesCollapses.includes(cityId)) this.citiesCollapses = this.citiesCollapses.filter(id => id !== cityId);
      else this.citiesCollapses = [...this.citiesCollapses, cityId];
      this.$root.$emit('bv::toggle::collapse', `city-${cityId}`);
    },
    toggleActiveElement(element) {
      let elementData = {
        id: element.id,
        title: element.title,
        uid: element.uid,
        data: element.data,
        type: element.type || 'group',
        uniqueId: element.uniqueId || `group-${element.id}`,
        subtype: element.type || !!element.cities ? 'country' : 'city',
      }
      this.activeElementsData = this.activeElementsData.some(currentElement => currentElement.uniqueId === elementData.uniqueId) ? this.activeElementsData.filter(currentElement => currentElement.uniqueId !== elementData.uniqueId) : [...this.activeElementsData, elementData];
      this.changeActiveElements();
    },
    changeActiveElements() {
      let filters = {
        group: [],
        vacancy: [],
        agent: [],
      };
      this.activeElements.forEach(element => {
        let data = element.split('-');
        filters[data[0]].push(data[1]);
      });
      this.$store.dispatch('hr/fetchResponsesStatsPeriods', {
        groups: filters.group,
        agents: filters.agent,
        vacancies: filters.vacancy,
        'period[from]': moment(this.dateFrom).format('YYYY-MM-DD'),
        'period[to]': moment(this.dateTo).format('YYYY-MM-DD'),
      })
    },
    changeLocalFilters() {
      localStorage.setItem('hrStatsLocalFilters', JSON.stringify(this.activeFilters));
    },
  },
}
</script>