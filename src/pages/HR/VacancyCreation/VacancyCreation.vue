<template>
  <access-users-add v-if="accessModal"
                    :vacancy-prop="this.vacancyProp"
                    :visible-users="visibleUsersIds"
                    @back="toggleModal"
  />
  <b-form v-else class="vacancy_creation" @submit.prevent="vacancyAction(vacancyCopy)">
    <div class="vacancy_creation-title">
      <b-button v-if="!vacancyCopy.id" class="vacancy_creation-title-button" type="sumbit" size="sm"
                variant="outline-info">Создать вакансию
      </b-button>
      <div v-if="vacancyCopy.id && vacancyCopy.status !== 'archive' && isSuperAdmin"
           class="vacancy_creation-title-delete_archive"
      >
        <trash v-if="!vacancyCopy.response_count"
               class="vacancy_creation-title-delete_archive-delete"
               id="vacancy_delete"
               @click="deleteVacancies(vacancyCopy)"
        />
        <archive class="vacancy_creation-title-delete_archive-archive"
                 id="vacancy_archive"
                 @click="archiveVacancies(vacancyCopy)"
        />
      </div>
      <div v-if="vacancyCopy.status === 'archive'" class="vacancy_creation-title-unzip">
        <unzip class="vacancy_creation-title-unzip-unzip" @click="unzipVacancies(vacancyCopy)"/>
      </div>
    </div>
    <div class="vacancy_creation-body" ref="vacancyBody" @scroll="handleScroll">
      <div class="vacancy_creation-name">
        <modal-title
            v-model="vacancyCopy.title"
            max-width="100%"
            min-width="20px"
            placeholder="Введите название вакансии"
            field="title"
            required
            :disabled="!userPermissions.hr.edit || (!isSuperAdmin && vacancyCopy.id)"
            id="vacancy_title"
            @setTitle="setTitle"
            @changeTitle="changeVacancy"
        />
      </div>
      <div class="vacancy_creation-table">
        <div class="vacancy_creation-table-row">
          <div class="vacancy_creation-table-row-name">Страна</div>
          <custom-select v-model="countryId"
                         :options="countries"
                         class="vacancy_creation-table-row-select"
                         valueField="id"
                         titleField="title"
                         defaultText="Выберите страну"
                         :disabled="!userPermissions.hr.edit || (!isSuperAdmin && vacancyCopy.id)"
                         id="vacancy_country_select"
                         @change="changeVacancy($event, 'group')"
          >
            <template v-slot:chosen-variant="props">
              <div v-if="props.value && props.value.settings" class="d-flex align-items-center">
                <span class="flag-icon mr-1" :class="`flag-icon-${props.value.settings.flag || 'default'}`"></span>
                <span>{{ props.value.title }}</span>
              </div>
              <span v-else>{{ props.shownText }}</span>
            </template>
            <template v-slot:list-variant="props">
              <div class="d-flex align-items-center">
                <span class="flag-icon mr-1" :class="`flag-icon-${props.variant.settings.flag || 'default'}`"></span>
                <span>{{ props.variant.title }}</span>
              </div>
            </template>
          </custom-select>
        </div>
        <div class="vacancy_creation-table-row">
          <div class="vacancy_creation-table-row-name">Город</div>
          <custom-select v-model="cityId"
                         :options="cities"
                         class="vacancy_creation-table-row-select"
                         valueField="id"
                         titleField="title"
                         defaultText="Выберите город"
                         :required="true"
                         :disabled="!userPermissions.hr.edit || (!isSuperAdmin && vacancyCopy.id)"
                         id="vacancy_city_select"
                         @change="changeVacancy($event, 'group')"
          />
        </div>
        <div class="vacancy_creation-table-row">
          <div class="vacancy_creation-table-row-name">Ресурсы размещения</div>
          <custom-select v-model="resourceId"
                         :options="resourcesList"
                         class="vacancy_creation-table-row-select"
                         valueField="id"
                         titleField="title"
                         defaultText="Выберите ресурс"
                         :disabled="!userPermissions.hr.edit || (!isSuperAdmin && vacancyCopy.id)"
                         required
                         id="vacancy_resource_select"
                         @change="changeVacancy($event, 'resource')"
          />
        </div>
      </div>

      <div v-if="vacancyCopy.id && currentVacancy.users_access" class="vacancy_creation-view_access">
        <div class="vacancy_creation-view_access-title" @click="toggleCollapse('usersCollapse')">
          <div class="vacancy_creation-view_access-title-text">
            <span>Доступ на просмотр ({{currentVacancy.users_access.length}})</span>
            <div v-if="userPermissions.hr.edit"
                 class="vacancy_creation-view_access-title-creation ml-2"
                 @click="toggleModal"
            >
              <div class="btn-add vacancy_creation-responses-title-response-add"/>
            </div>
          </div>
          <i v-if="currentVacancy.users_access.length" class="fa angle mr-2 m-1" :class="usersCollapse ? 'fa-angle-up' : 'fa-angle-down'"/>
        </div>
      </div>
      <b-collapse v-model="usersCollapse">
        <div v-for="user in currentVacancy.users_access" :key="user.id" class="vacancy_creation-view_access-modal-user mr-4 ml-4">
          <avatar class="-xs"
              :url="user.avatar"
              :telegram="user.telegram_connected"
              :is-fin-admin="user.is_fin_admin"
          />
          <div class="vacancy_creation-view_access-modal-user-info-column">
            <div v-if="!user.uid || !user.fullname" class="vacancy_creation-view_access-modal-user-info-fullname mt-1">
                  <span>{{ user.uid || user.fullname }}</span>
            </div>
            <div v-else class="vacancy_creation-view_access-modal-user-info-fullname mt-1">
              <span class="text-gray">{{ user.uid }}</span>
              <span class="ml-2">{{ user.fullname }}</span>
            </div>
            <div class="vacancy_creation-view_access-modal-user-info-role mb-1">
              <span class="vacancy_creation-view_access-text">{{user.role.title}}</span>
            </div>
          </div>
          <div class="vacancy_creation-view_access-modal-user-info">
            <div v-if="user.main_group" class="d-flex align-items-center">
              <span class="vacancy_creation-view_access-modal-user-info-chosen_user_office">{{ user.main_group.office || user.main_group.city || user.main_group.country }}</span>
            </div>
          </div>
          <trash class="cursor-pointer" @click="removeFromVisibleUsers(user.id)"/>
        </div>
      </b-collapse>
      <div v-if="vacancyCopy.id" class="vacancy_creation-responses" :class="!usersCollapse? '-border_top' : ''">
        <div class="vacancy_creation-responses-title">
          <p class="vacancy_creation-responses-title-text">Заявки</p>
          <div v-if="userPermissions.vacancy_response.management || userPermissions.hr.edit"
               class="vacancy_creation-responses-title-response"
               @click="addResponse(vacancyProp)"
          >
            <p class="vacancy_creation-responses-title-response-text">Добавить заявку</p>
            <div class="btn-add vacancy_creation-responses-title-response-add"/>
          </div>
        </div>
        <div>
          <dropdown-checkbox :response-types="responseTypes"
                             :handle-select="handleSelect"
                             id="vacancy_filter_status"
                             variant-id-prefix="vacancy_filter_status_checkbox"
          />
          <div v-if="responsesStatus === 'request'" class="vacancy_creation-responses-loader">
            <throbber class="throbber"/>
            <span>Заявки загружаются, пожалуйста, подождите</span>
          </div>
          <div v-else-if="vacancyResponses && !vacancyResponses.length" class="vacancy_creation-responses-notfound">
            <span>Заявки не найдены,<br/> попробуйте выбрать другой статус</span>
          </div>
          <div v-else class="vacancy_creation-responses-responses_list">
            <div class="vacancy_creation-responses-responses_list-item" v-for="(response, index) in vacancyResponses"
                 :key="index" @click="openResponse(response)" :ref="`response-${index}`">
              <p class="vacancy_creation-responses-responses_list-item-date">
                {{ moment(response.created_at).format('DD.MM.YYYY') }}</p>
              <p class="vacancy_creation-responses-responses_list-item-model">
                {{ response.title || 'Название заявки' }}</p>
              <div class="vacancy_creation-responses-responses_list-item-status">
                <p class="vacancy_creation-responses-responses_list-item-status-item"
                   :style="{ background: response.color }">{{ response.status_trans }}</p>
              </div>
            </div>
            <div v-if="responsesStatus === 'request_responses'" class="vacancy_creation-responses-loader -smaller">
              <throbber class="throbber -smaller"/>
            </div>
          </div>
        </div>
      </div>
      <div class="vacancy_creation-table-description">
        <div class="vacancy_creation-table-description-title" @click="toggleAccordion('accordionFirst', 0)">
          <p class="vacancy_creation-table-description-title-text">Описание вакансии</p>
          <i class="fa fa-angle-down"/>
        </div>
        <b-collapse :visible="accordionFirst === -1">
          <textarea-autosize
              class="vacancy_creation-table-description-text"
              v-model="vacancyCopy.description"
              placeholder="Добавьте описание..."
              autosize
              :min-height="100"
              :disabled="!userPermissions.hr.edit || (!isSuperAdmin && vacancyCopy.id)"
              @change.native="changeVacancy(vacancyCopy.description, 'description')"
          />
        </b-collapse>
      </div>
    </div>
  </b-form>
</template>
<script>
import Vue from 'vue';
import {mapState, mapActions} from 'vuex';
import moment from 'moment';
import vSelect from 'vue-select';
import Select from "@/components/Common/Select/Select";
import ModalTitle from "@/components/Common/ModalTitle/ModalTitle";
import Trash from "@/assets/vue-svg/trash.svg";
import Archive from "@/assets/vue-svg/archive.svg";
import Unzip from "@/assets/vue-svg/unzip.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import DropdownCheckbox from "@/components/Common/DropdownCheckbox/DropdownCheckbox";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import AccessUsersAdd from "@/pages/HR/AccessUsersAdd/AccessUsersAdd.vue";
import {showToast} from "@/tools/tools";

export default {
  name: 'vacancy-creation',
  components: {
    AccessUsersAdd,
    Avatar,
    DropdownCheckbox,
    'vue-select': vSelect,
    'custom-select': Select,
    'modal-title': ModalTitle,
    trash: Trash,
    archive: Archive,
    unzip: Unzip,
    'throbber': throbber
  },
  props: {
    vacancyProp: Object
  },
  data() {
    return {
      moment: moment,
      countryId: '',
      cityId: '',
      removeStatus: '',
      resourceId: null,
      vacancyCopy: {},
      status: true,
      accordionFirst: -1,
      selectedResponse: [],
      defaultselectedResponses: [],
      usersCollapse: false,
      accessModal: false,
      responseStatus: 'Статус заявки',
      responseTypes: [
        {value: 'new', title: 'Новая заявка'},
        {value: 'call_center', title: 'Call-центр'},
        {value: 'interview', title: 'Собеседование'},
        {value: 'reject', title: 'Отказ'},
        {value: 'processed', title: 'Обработана'},
        {value: 'archive', title: 'Архив'}
      ],
      allResponseSelected: false,
      pageResponses: 1
    }
  },
  computed: {
    ...mapState('layout', ['helperOpened', 'layoutStatus']),
    ...mapState('hr', ['vacancyResponses', 'responsesPagination']),
    ...mapState('dictionaries', ['responseStatuses']),
    hrStatus() {
      return this.$store.state.hr.hrStatus;
    },
    responsesStatus() {
      return this.$store.state.hr.responsesStatus;
    },
    groups() {
      return this.$store.state.hr.groups;
    },
    droverState() {
      return this.$store.state.layout.helperOpened;
    },
    visibleUsersIds() {
        return this.currentVacancy.users_access?.map(user => user.id);
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
    countries() {
      return this.$store.state.dictionaries.countries;
    },
    selectedCountry() {
      return this.countries.find(country => country.children && country.children.find(city => city.id === this.cityId));
    },
    cities() {
      return this.$store.state.dictionaries.cities.filter(city => !this.countryId || (city.parent && city.parent.id === this.countryId));
    },
    resourcesList() {
      return this.$store.state.dictionaries.resourcesHr;
    },
    vacancy() {
      return this.$store.state.hr.vacancy;
    },
    currentVacancy() {
      return this.$store.state.hr.currentVacancy;
    },
    vacancyResponses() {
      return this.updateVacancyResponse(this.$store.state.hr.vacancyResponses);
    },
    responsesPagination() {
      return this.$store.state.hr.responsesPagination;
    },
    editStatus() {
      return this.$store.state.hr.editStatus;
    },
    isEditingLoading() {
      return this.editStatus === 'editing';
    },
  },
  watch: {
    isEditingLoading: function (newStatus, prevStatus) {
      if (newStatus === false && prevStatus === true) {
        if (this.accessModal) {
          this.toggleModal();
        }
      }
    },
    editStatus: function editStatusFunction (newStatus, prevStatus) {
      if (newStatus === '' && prevStatus === 'editing') {
        if (this.removeStatus !== 'removing')
          showToast(this.$toasted, 'Сотруднику предоставлен доступ к просмотру вакансии.');
        else
          this.removeStatus = '';
      }
    },
    hrStatus: function (newStatus, prevStatus) {
      if (newStatus === 'vacancy-created') {
        this.countryId = '';
        this.cityId = '';
      }
      if (newStatus === 'vacancy-deleted') this.vacancyDeletedNotification()
      else if (newStatus === 'vacancy-archived') {
        this.toggleHelper(false)
        this.vacancyArchivedNotification()
      } else if (newStatus === 'vacancy-unzip') {
        this.toggleHelper(false)
      }
    },
    selectedCountry: function (newCountry) {
      if (newCountry) this.countryId = newCountry.id
    },
    droverState: function (newState) {
      if (newState && this.vacancyProp && this.vacancyProp.resource) this.resourceId = this.vacancyProp.resource?.id
      else if (!newState) this.resourceId = null
    },
    vacancyProp: function (newVacancy, prevVacancy) {
      // this.vacancyCopy = JSON.parse(JSON.stringify(newVacancy))
      if (newVacancy.id) {
        this.resourceId = newVacancy.resource?.id
        this.cityId = newVacancy.group.id
      }
      this.updateVacancy(newVacancy);
      if (newVacancy.id !== prevVacancy.id) this.$store.dispatch('hr/getCurrentVacancy', newVacancy.id);
    },
    vacancy: function (newVacancy) {
      this.updateVacancy(newVacancy);
    },
    currentVacancy: function (newVacancy) {
      if (!this.resourceId) this.resourceId = newVacancy.resource?.id;
      this.updateVacancy(newVacancy);
    },
    pageResponses: function (newPage) {
      this.getVacancyResponses({vacancy: this.vacancyCopy.id, types: this.selectedResponse, page: newPage})
    },
    responsesPagination: function (newPagination) {
      if (this.pageResponses === 1 && newPagination.totalPages > 1) this.pageResponses++;
    }
  },
  created() {
    if (this.vacancyProp.id) {
      this.resourceId = this.vacancyProp.resource?.id;
      this.cityId = this.vacancyProp.group.id;
      this.$store.dispatch('hr/getCurrentVacancy', this.vacancyProp.id);
    }
    // this.vacancyCopy = JSON.parse(JSON.stringify(this.vacancyProp));
    // this.getGroupsCountries({type: 'country'})
    // this.getGroupsCities({type: 'city'})
    this.updateVacancy(this.vacancyProp);
  },
  methods: {
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('hr', ['getGroups', 'createVacancy', 'changeVacancies', 'changeCurrentVacancy', 'deleteVacancy', 'getVacancyResponses', 'saveFilterResponses']),
    ...mapActions('responses', ['fetchResponses']),
    ...mapActions('dictionaries', ['fetchResponseStatuses']),
    ...mapActions('tasks', ['fetchCurrentTask']),
    setTitle(event) {
      this.vacancyCopy.title = event;
    },
    handleScroll() {
      if (this.pageResponses >= this.responsesPagination.totalPages) return;
      let middleElement = this.responsesPagination.perPage * this.pageResponses - 10;
      if (this.$refs[`response-${middleElement}`]) {
        let middleElementPosition = this.$refs[`response-${middleElement}`][0].getBoundingClientRect().top;
        if (middleElementPosition < window.innerHeight) this.pageResponses++;
      }
    },
    toggleCollapse() {
      this.usersCollapse=!this.usersCollapse;
    },
    handleSelect(newSelected) {
      this.saveFilterResponses(newSelected)
      this.selectedResponse = newSelected;
      this.$refs.vacancyBody.scrollTop = 0;
      if (this.pageResponses === 1) this.getVacancyResponses({
        vacancy: this.vacancyCopy.id,
        types: this.selectedResponse,
        page: this.pageResponses
      })
      else this.pageResponses = 1;
    },
    /*fetchCurrentResponse(id) {
        return this.$store.dispatch('responses/fetchCurrentResponse', id)
    },*/
    vacancyAction(vacancyCopy) {
      vacancyCopy.group = this.cityId;
      vacancyCopy.resource = this.resourceId;
      if (vacancyCopy.id) {
        this.changeVacancies(vacancyCopy);
      } else {
        this.createVacancy(vacancyCopy);
      }
      if (this.status) {
        this.toggleHelper(false);
      }
      this.status = true;
    },
    toggleModal() {
      this.accessModal=!this.accessModal;
      this.$store.dispatch('hr/getCurrentVacancy', this.vacancyProp.id);
    },
    removeFromVisibleUsers(userId) {
      this.removeStatus = 'removing';
      this.$store.dispatch('hr/changeCurrentVacancy', {
        id: this.vacancyProp.id,
        users_access: this.visibleUsersIds?.filter(id => id !== userId)
      });
    },
    changeVacancy(event, field) {
      if (this.vacancyProp.id) this.changeCurrentVacancy({id: this.vacancyProp.id, [field]: event})
    },
    deleteVacancies(vacancy) {
      this.deleteVacancy(vacancy);
      this.toggleHelper(false);
    },
    archiveVacancies(vacancy) {
      if (this.hrStatus === 'editing') return;
      vacancy.group = vacancy.group.id;
      vacancy.resource = vacancy.resource?.id
      vacancy.status = 'archive';
      this.changeVacancies(vacancy);
    },
    unzipVacancies(vacancy) {
      if (this.hrStatus === 'editing') return;
      vacancy.group = vacancy.group.id;
      vacancy.resource = vacancy.resource?.id;
      vacancy.status = 'active';
      this.changeVacancies(vacancy);
    },
    toggleAccordion(field, index) {
      if (this[field] !== index) {
        Vue.set(this, field, index);
      } else {
        Vue.set(this, field, -1);
      }
    },
    filterResponses(field, city) {
      Vue.set(this, field, city);
    },
    addResponse(vacancy) {
      this.$emit('add-response', vacancy);
    },
    addAccess(vacancy) {
      this.$emit('add-access', vacancy);
    },
    openResponse(response) {
      this.$emit('save-vacancy-title', this.vacancyProp.title)
      // if (response.task) this.fetchCurrentTask(response.task.id)
      // else this.fetchCurrentResponse(response.id)
      if (response.task && (response.task.status === 'active' || response.task.status === 'check')) this.$emit('open-task', response.task);
      else this.$emit('open-response', {...response, vacancy_id: this.vacancyProp.id});
      // this.$emit('open-response', response)
    },
    vacancyDeletedNotification() {
      this.$toasted.options.position = 'bottom-left'
      this.$toasted.success(`Вакансия удалена`, {
        action: {
          text: 'X',
          class: 'toasts-close',
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          }
        },
      })
    },
    vacancyArchivedNotification() {
      this.$toasted.options.position = 'bottom-left'
      this.$toasted.success(`Вакансия заархивирована`, {
        action: {
          text: 'Х',
          class: 'toasts-close',
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          }
        },
      })
    },
    updateVacancyResponse(responses) {
      if (!responses.length) return []
      let resultResponses = [...responses]
      resultResponses.map(response => {
        switch (response.status) {
          case 'new':
            response.status_trans = 'Новая заявка', response.color = '#21AE8C';
            break;
          case 'processed':
            response.status_trans = 'Обработана', response.color = '#C1CCD3';
            break;
          case 'reject':
            response.status_trans = 'Отказ', response.color = '#FD5F00';
            break;
          case 'archive':
            response.status_trans = 'Архив', response.color = '#495057';
            break;
        }
        if (response.status === 'in_progress') {
          switch (response.task.type) {
            case 'interview':
              response.status_trans = 'Собеседование', response.color = '#B3E645';
              break;
            case 'call_center':
              response.status_trans = 'Call-центр', response.color = '#FDA700';
              break;
            case 'psych':
              response.status_trans = 'Психолог. тестирование', response.color = '#37A8E5';
              break;
            case 'video':
              response.status_trans = 'Видео-тестирование', response.color = '#B05AE6';
              break;
          }
        }
      })
      return resultResponses
    },
    updateVacancy(vacancy) {
      this.vacancyCopy = JSON.parse(JSON.stringify(vacancy))
      if (!vacancy.group?.id) this.cityId = null
      else this.cityId = vacancy.group.id
    },
  },
};
</script>
