<template>
  <div class="vacancies">
    <div class="vacancies-title">
      <span class='vacancies-title-text'>{{ type === 'active' ? 'Вакансии' : 'Архив' }}</span>
      <b-button v-if="type === 'active' && userPermissions.hr.edit"
                class='vacancies-title-add_vacancy'
                id="vacancies_add"
                variant="outline-primary"
                @click="openEmptyVacancy"
      >Добавить вакансию</b-button>
    </div>
    <widget class="vacancies-table" customHeader>
      <div class="vacancies-filtration">
        <div class="vacancies-filtration-selects">
          <b-input-group class="vacancies-filtration-selects-search_field">
            <b-input-group-text slot="append">
              <search />
            </b-input-group-text>
            <b-form-input v-model="filters.title"
                          type="text"
                          id="vacancies_filters_search"
                          placeholder="Поиск"
                          @input="changeFilters"
            />
          </b-input-group>
          <div class="vacancies-filtration-selects-user">
            <custom-select v-model="countryId"
                           :options="countries"
                           class="-filter"
                           valueField="id"
                           titleField="title"
                           defaultText="Страна"
                           id="vacancies_filters_country_select"
                           @click="filterCity"
                           @change="changeFilters"
            >
              <template v-slot:list-variant="{variant}">
                <div class="d-flex align-items-center" :id="`vacancies_filters_variant-${variant.id}`">
                  <span class="flag-icon mr-1" :class="`flag-icon-${variant.settings.flag || 'default'}`"></span>
                  <span>{{ variant.title }}</span>
                </div>
              </template>
            </custom-select>
          </div>
          <div class="vacancies-filtration-selects-user">
            <custom-select v-model="cityId"
                           :options="cities"
                           class="-filter"
                           valueField="id"
                           titleField="title"
                           defaultText="Город"
                           id="vacancies_filters_city_select"
                           variant-id-prefix="vacancies_filters_city_variant"
                           right
                           @click="filterCountry"
                           @change="changeFilters"
            />
          </div>
          <p class="vacancies-filtration-options-cancel" id="vacancies_filters_clear" @click="clearFilters">Сбросить</p>
        </div>
<!--        <div class="vacancies-filtration-options">
          <p class="vacancies-filtration-options-apply" id="vacancies_filters_apply" @click="changeFilters">Применить фильтры</p>
        </div>-->
      </div>
      <v-client-table class="vacancies-table-container"
                      :class="{'-with_add': isAddResponseButtonShown}"
                      :loading="hrStatus === 'request'"
                      :data="filteredVacancies"
                      :columns="columns"
                      :options="options"
                      @row-click="openVacancy"
      >
        <div class="vacancies-table-container-cell-content -title" slot="title" slot-scope="props">
          {{ props.row.title }}
        </div>
        <!--                <div class="vacancies-table-container-cell-content" slot="parent_group" slot-scope="props">{{props.row.group.country}}</div>-->
        <div class="vacancies-table-container-cell-content" slot="group" slot-scope="props">
          <div class="d-flex align-items-center">
            <span class="flag-icon mr-1" :class="`flag-icon-${props.row.group.flag || 'default'}`"
                  :title="props.row.group.country"></span>
            <span v-if="props.row.group.city">{{ props.row.group.city }}</span>
          </div>
        </div>
        <div class="vacancies-table-container-cell-content -responses"
             :class="{'justify-content-center': !isAddResponseButtonShown}"
             slot="responses"
             slot-scope="props"
        >
          <span>{{ props.row.responses }}</span>
          <div v-if="isAddResponseButtonShown"
               class="btn-add vacancies-table-container-cell-content-add"
               :id="`vacancies_table_add-${props.row.id}`"
               @click="openResponseCreate($event, props)"
          />
        </div>
      </v-client-table>
      <b-pagination :value="currentPage"
                    class="vacancies-pagination"
                    align="left"
                    :total-rows="vacancyPagination.totalItems"
                    :per-page="perPage"
                    @change="changePage"
      />
    </widget>
    <helper>
      <vacancy-creation v-if="droverType === 'vacancy-opened'"
                        :vacancy-prop="openedVacancy"
                        @add-response="openResponseCreation"
                        @open-response="openResponse"
                        @open-task="openTask"
                        @save-vacancy-title="saveVacancyTitle"
      />
      <response-creation v-else-if="droverType === 'response-opened'"
                         :vacancy-prop="openedVacancy"
                         :response-prop="submittedResponse"
                         isSourceVacancy
                         @close="openVacancyCreation"
                         @open-mini-profile="openMiniProfile"
      />
      <task-control v-else-if="droverType === 'task-opened'"
                    :task-prop="submittedTask"
                    :vacancy-title="vacancyTitle"
                    :open-block="flag"
                    @open-vacancy-creation="openVacancyCreation"
                    @open-mini-profile="openMiniProfile"
      />
      <mini-profile
          v-else-if="droverType === 'mini-profile'"
          :user-id="userProfile.id"
          :breadcrumbs-title="userProfile.breadcrumbsTitle"
          @close="returnTask"
      />
    </helper>
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';
import Helper from '@/components/Helper/Helper.vue';
import Select from "@/components/Common/Select/Select";
import VacancyCreation from '@/pages/HR/VacancyCreation/VacancyCreation.vue';
import TaskControl from '@/pages/Tasks/components/TaskControl.vue';
import ResponseCreation from '@/pages/HR/ResponseCreation/ResponseCreation.vue';
import {mapState, mapActions, mapGetters} from 'vuex';
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import {showToast} from "@/tools/tools";
import search from "@/assets/vue-svg/search.svg";

export default {
  name: 'vacancies',
  props: {
    type: String
  },
  components: {
    'widget': Widget,
    'helper': Helper,
    'custom-select': Select,
    'vacancy-creation': VacancyCreation,
    'response-creation': ResponseCreation,
    'task-control': TaskControl,
    'mini-profile': MiniProfile,
    'search': search,
  },
  data() {
    return {
      droverType: '',
      countryId: '',
      cityId: '',
      sortAscending: false,
      sortBy: '',
      selectedVacancy: '',
      vacanciesCopy: [],
      emptyVacancy: {
        id: null,
        title: '',
        status: 'active',
        group: {id: '', title: 'Выберите город'},
        responses: [],
        resources: [],
        description: ''
      },
      openedVacancy: {},
      // currentPage: 1,
      perPage: window.innerWidth > 1600 ? 10 : 6,
      totalRows: 4,
      resource: {},
      columns: ['title', 'group', 'responses'],
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'vacancies-table-container-cell -title',
          group: 'vacancies-table-container-cell -country',
          responses: 'vacancies-table-container-cell -responses'
        },
        headings: {
          title: 'Название',
          group: 'Регион',
          office: 'Офис',
          responses: 'Заявки'
        },
        sortable: [],
        texts: {
          filter: '',
          count: '',
          limit: '',
          noResults: 'По вашему запросу результатов не найдено',
          loading: 'Подождите, идет загрузка'
        },
        skin: 'table table-striped',
      },
      submittedResponse: {},
      submittedTask: {},
      countriesArray: [],
      citiesArray: [],
      vacanciesCopyList: [],
      filters: {},
      vacancyTitle: '',
      source: '',
      flag: false,
      resultFiles: {
        additional: []
      },
      userProfile: {},
      showGroupsForOperator: false
    };
  },
  computed: {
    ...mapGetters('hr', ['getCountryByCityId', 'getCitiesbyCountryId', 'getCountryById', 'getCityById']),
    ...mapState('hr', ['hrStatus', 'vacancies', 'vacancy', 'groups', 'headers', 'vacancyStatus', 'vacancyPagination']),
    ...mapState('tasks', ['currentTask']),
    taskStatus() {
      return this.$store.state.tasks.taskStatus;
    },
    vacancyStatus() {
      return this.$store.state.hr.hrStatus
    },
    filteredVacancies() {
      let vacancy = this.selectedVacancy
      return this.vacanciesCopy.filter(function (item) {
        if (vacancy === '') return true
        else return item.group.title.indexOf(vacancy) > -1 ||
            item.group.title.toLowerCase().indexOf(vacancy) > -1 ||
            // item.group.parent.title.indexOf(vacancy) > -1 ||
            // item.group.parent.title.toLowerCase().indexOf(vacancy) > -1 ||
            item.title.indexOf(vacancy) > -1 ||
            item.title.toLowerCase().indexOf(vacancy) > -1
      })
    },
    selectedCountry() {
      return this.countries.find(country => country.children && country.children.find(city => city.id === this.cityId));
    },
    countries() {
      return this.$store.state.dictionaries.countries;
    },
    cities() {
      // return this.getCitiesbyCountryId(this.countryId)
      return this.$store.state.dictionaries.cities.filter(city => !this.countryId || (city.parent && city.parent.id === this.countryId));
    },
    /*country() {
        return this.getCountryById(this.countryId)
    },
    city() {
        return this.getCityById(this.cityId)
    },*/
    droverState() {
      return this.$store.state.layout.helperOpened
    },
    currentVacancy() {
      return this.$store.state.hr.currentVacancy
    },
    currentResponse() {
      return this.$store.state.responses.currentResponse
    },
    taskFieldsError() {
      return this.$store.state.tasks.fieldsErrors
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    currentPage() {
      return this.$route.query.page || 1;
    },
    openedVacancyId() {
      let rawId = this.$route.query.vacancy;
      return rawId && parseInt(rawId);
    },
    isAddResponseButtonShown() {
      return this.type === 'active' && (this.userPermissions.vacancy_response.management || this.userPermissions.hr.edit);
    },
  },
  watch: {
    hrStatus: function (newStatus) {
      if (newStatus === 'vacancy-created') {
        this.addSuccessNotification();
        this.filterTable();
      } else if (newStatus === 'vacancy-deleted') {
        this.filterTable();
        showToast(this.$toasted, 'Вакансия удалена');
      }
    },
    vacancies: function (newVacancies, prevVacancies) {
      this.vacanciesCopyList = JSON.parse(JSON.stringify(newVacancies));
      this.vacanciesCopy = JSON.parse(JSON.stringify(newVacancies));
      this.vacanciesCopy = this.vacanciesCopy.map(vacancy => ({
        ...vacancy,
        responses: ((vacancy.response_count !== undefined) && (vacancy.response_count !== null)) ? vacancy.response_count : vacancy.responses?.filter(response => !response.is_deleted).length,
      }));
      if (!prevVacancies?.length && newVacancies.length && this.openedVacancyId) {
        this.openedVacancy = newVacancies.find(vacancy => vacancy.id === this.openedVacancyId);
        this.droverType = 'vacancy-opened';
        this.toggleHelper(true);
      }
    },
    /*vacancy: function (newVacancy) {
        this.openedVacancy = JSON.parse(JSON.stringify(newVacancy))
    },*/
    headers: function (newHeaders) {
      // this.currentPage = newHeaders['x-current-page']
      this.perPage = newHeaders['x-items-perpage'];
      this.totalRows = newHeaders['x-total-items'];
      if (this.currentPage !== newHeaders['x-current-page']) this.$router.replace({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          page: newHeaders['x-current-page'],
        },
      });
    },
    selectedCountry: function (newCountry) {
      if (newCountry) this.countryId = newCountry.id
    },
    // currentPage: function () {
    //     this.filterTable()
    // },
    /*currentTask: function (newTask) {
        this.submittedTask = newTask;
        // this.droverType = 'vacancy-opened'
        this.droverType = 'task-opened';
    },*/
    droverState: function (newState) {
      if (!newState) this.droverType = null
    },
    currentVacancy: function (newVacancy) {
      this.openedVacancy = JSON.parse(JSON.stringify(newVacancy))
    },
    taskStatus: function (newStatus) {
      if (newStatus === 'task-created-call_center') showToast(this.$toasted,`Заявка отправлена в Call-центр`)
      else if (newStatus === 'task-not-created') showToast(this.$toasted, this.taskFieldsError[0].message, 'error')
    },
    /*currentResponse: function(newResponse) {
        this.submittedResponse = newResponse;
        if ((this.droverType !== 'task-opened') && (this.droverType !== 'office-list')) this.droverType = 'response-opened';
    },*/
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.flag = false;
        if (this.openedVacancyId) this.$router.push({
          name: this.$router.currentRoute.name,
          query: {
            ...this.$router.currentRoute.query,
            vacancy: undefined,
          },
        });
      }
    },
    currentPage: function (newPage) {
      this.filterTable(newPage);
    },
    openedVacancyId: function (newVacancyId) {
      if (newVacancyId && this.vacancies?.length) {
        this.openedVacancy = this.vacancies.find(vacancy => vacancy.id === newVacancyId);
        this.droverType = 'vacancy-opened';
        this.toggleHelper(true);
      }
    },
  },
  created() {
    if (this.type === 'active') this.getVacancies({page: 1, per_page: this.perPage, status: 'active'})
    else if (this.type === 'archive') this.getVacancies({page: 1, per_page: this.perPage, status: 'archive'})
    this.$store.dispatch('dictionaries/getNationalities');
  },
  methods: {
    ...mapActions('hr', ['getVacancies', 'deleteVacancy']),
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('directory', ['getHrResources']),
    ...mapActions('tasks', ['fetchCurrentTask']),
    filterCountry(e) {
      let groupsFiltered = this.groups.filter((group) => group.parent.title === country)
      // this.cities = groupsFiltered.map((city) => city.title)
      this.cityVariant = 'Город'
      this.countryId = this.countries.find((currentCountry) => currentCountry.title === country).id
    },
    filterCity() {
      let groupsFiltered = this.groups.filter((group) => group.title === city)
      this.countryVariant = groupsFiltered.map((country) => country.parent.title)[0]
      this.countryId = this.countries.find((currentCountry) => currentCountry.title === this.countryVariant).id
    },
    changeFilters() {
      this.filterTable(1);
    },
    filterTable(page = this.currentPage) {
      let filters = {
        status: this.type,
        page,
        per_page: this.perPage,
      }
      if (this.filters.title) filters.title = this.filters.title;
      if (!this.cityId && this.countryId) filters.group = this.countryId;
      else if (this.cityId) filters.group = this.cityId;

      this.getVacancies(filters);
    },
    clearFilters() {
      this.getVacancies({page: 1, per_page: this.perPage, status: this.type});
      this.countryId = '';
      this.cityId = '';
    },
    cancelFilterTable() {
      this.selectedVacancy = '';
      this.changePage(1);
    },
    openVacancy(vacancy) {
      // this.openedVacancy = this.vacanciesCopyList.find(currentVacancy => currentVacancy.id === vacancy.row.id);
      // this.droverType = 'vacancy-opened';
      // this.toggleHelper(true);
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          vacancy: vacancy.row.id,
        },
      });
    },
    openEmptyVacancy() {
      this.openedVacancy = this.emptyVacancy;
      this.droverType = 'vacancy-opened';
      this.toggleHelper(true);
    },
    addErrorNotification() {
      showToast(this.$toasted, this.error, 'info');
    },
    openResponseCreation(vacancy) {
      this.submittedResponse = {
        id: null,
        status: "",
        email: "",
        phone: "",
        title: "",
        gender: 'female',
        birthday: null,
        resource: vacancy.resource.title,
        video_file: "",
        comments: {},
        vacancy_id: vacancy.id
      }
      this.droverType = 'response-opened'
      this.source = 'vacancy'
    },
    openResponseCreate(e, prop) {
      e.stopPropagation()
      this.openedVacancy = prop.row
      this.submittedResponse = {
        id: null,
        status: "",
        email: "",
        phone: "",
        name: "",
        surname: "",
        patronymic: "",
        gender: 'female',
        birthday: null,
        resource: null,
        video_file: "",
        comments: {},
        vacancy_id: prop.row.id
      }
      this.droverType = 'response-opened'
      this.source = 'vacancy-list'
      this.toggleHelper(true)
    },
    openResponse(response) {
      this.submittedResponse = response;
      this.droverType = 'response-opened';
    },
    openTask(task) {
      // this.fetchCurrentTask(task.id)
      this.submittedTask = task;
      this.droverType = 'task-opened';
    },
    openVacancyCreation() {
      this.droverType = 'vacancy-opened';
      this.flag = false;
    },
    changePage(page) {
      // this.currentPage = page;
      // this.filterTable();
      if (page === this.currentPage) return this.filterTable();
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          page,
        },
      });
    },
    addSuccessNotification() {
      this.$toasted.success(`Вакансия создана`, {
        action: {
          position: 'bottom-left',
          text: 'Отменить',
          class: 'toasts-success-cancel',
          onClick: () => {
            this.deleteVacancy(this.vacancy)
          }
        },
      })
    },
    saveVacancyTitle(title) {
      this.vacancyTitle = title
      this.source = 'vacancy'
    },
    openMiniProfile(userProfile) {
      this.userProfile = userProfile;
      this.toggleHelper(true);
      this.droverType = 'mini-profile';
    },
    returnTask() {
      if (this.droverType !== 'mini-profile') this.flag = true;
      this.droverType = 'task-opened';
      this.$store.dispatch('tasks/fetchCurrentTask', this.submittedTask.id);
    }
  }
};
</script>
