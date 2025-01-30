<template>
  <div class="vacancies">
    <div class="vacancies-title">
      <span class='vacancies-title-text'>Заявки</span>
      <b-button v-if="userPermissions.hr_response.edit" class='vacancies-title-add_vacancy'
                variant="outline-primary" @click="openNewResponses">Добавить заявку
      </b-button>
    </div>
    <widget class="vacancies-table" customHeader>
      <div class="vacancies-filtration -responses">
        <div class="vacancies-filtration-selects">
          <b-input-group class="vacancies-filtration-selects-search_field">
            <b-input-group-text slot="append" class="vacancies-filtration-selects-search_field-button">
              <search />
            </b-input-group-text>
            <b-form-input v-model="filters.search"
                          type="text"
                          id="responses_search"
                          placeholder="Поиск"
                          @input="setFilter"
            />
          </b-input-group>
          <div class="vacancies-filtration-selects-user">
            <group-select v-model="filters.group"
                          class="-filter"
                          :groups="groupsNonOperators"
                          id="responses_group_select"
                          @change="setFilter"
            />
          </div>
          <div class="vacancies-filtration-selects-user">
            <custom-select v-model="filters.user"
                           class="-filter"
                           defaultText="Источник заявки"
                           :options="usersOptions"
                           valueField="id"
                           titleField="surname"
                           searchable
                           :disabled="hrStatus === 'responses-request'"
                           id="responses_source_select"
                           @change="setFilter"
            >
              <template v-slot:chosen-variant="props">
              <span v-if="props.value && (props.value.uid || props.value.surname)">
                <template v-if="!props.value.uid || !props.value.surname">{{props.value.uid || props.value.surname }}</template>
                <template v-else>
                  <span class="text-gray mr-1">{{ props.value.uid }}</span>
                  <span>{{ props.value.surname }}</span>
                </template>
              </span>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <template v-slot:list-variant="props">
                <div class="d-flex align-items-center">
                  <div v-if="props.variant.id" class="avatar mr-2"
                       :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>
                  <template v-if="!props.variant.uid || !props.variant.surname">
                    {{ props.variant.uid || props.variant.surname }}
                  </template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.surname }}</span>
                  </template>
                </div>
              </template>
            </custom-select>
          </div>
        </div>
        <div class="vacancies-filtration-checkboxes">
          <div v-for="(title, type) in responseTypes"
               class="abc-checkbox vacancies-filtration-checkboxes-checkbox"
               :class="`-${type}`">
            <input type="checkbox" :id="type" :value='type'
                   v-model="selectedTypes" @change="setFilter">
            <label :for="type">{{ title }}</label>
          </div>
          <p class="vacancies-filtration-options-cancel" @click="clearFilter">Сбросить</p>
        </div>
      </div>
      <div v-if="hrStatus === 'responses-request'" class="vacancies-table-load">
        <throbber class="throbber -sm"/>
        <span class="vacancies-table-load-title">Заявки загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else>
        <v-client-table class="vacancies-table-container"
                        :data="responses"
                        :columns="columns"
                        :options="options"
                        @row-click="openResponse"
        >
          <div class="vacancies-table-container-cell-content -title" slot="title" slot-scope="props">
            {{ props.row.title }}
          </div>
          <div class="vacancies-table-container-cell-content -group" slot="group" slot-scope="props">
            <div class="d-flex align-items-center">
                            <span class="flag-icon mr-1" :class="`flag-icon-${props.row.group.flag || 'default'}`"
                                  :title="props.row.group.country"></span>
              <span v-if="props.row.group.city">{{ props.row.group.city }}</span>
            </div>
          </div>
          <div v-if="props.row.user" class="vacancies-table-container-cell-content -user" slot="user"
               slot-scope="props">
            <div v-if="props.row.user.avatar" class="avatar -xs mr-2"
                 :style="`background-image: url(${getSmallImage(props.row.user.avatar)}); background-size: cover;`"></div>
            <span>{{ props.row.user.surname }}</span>
          </div>
          <div class="vacancies-table-container-cell-content -responses" slot="status" slot-scope="props">
            <p class="vacancy_creation-responses-responses_list-item-status-item"
               :class="`-${getResponseStatus(props.row)}`">
              {{ responseTypes[getResponseStatus(props.row)] }}
            </p>
          </div>
        </v-client-table>
        <b-pagination :value="currentPage"
                      class="vacancies-pagination"
                      align="left"
                      :total-rows="responsesPagination.totalItems"
                      :per-page="perPage"
                      @change="changePage"
        >
        </b-pagination>
      </div>
    </widget>
    <helper>
      <response-creation v-if="droverType === 'response-opened'"
                         :response-prop="showResponse"
                         @close="closeResponseCreation"
                         @open-mini-profile="openMiniProfile"
      />
      <task-control v-else-if="droverType === 'task-opened'"
                    :task-prop="showTask"
                    :open-block="flag"
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
import CustomSelect from "@/components/Common/Select/Select";
import Helper from "@/components/Helper/Helper";
import TaskControl from '@/pages/Tasks/components/TaskControl.vue';
import ResponseCreation from '@/pages/HR/ResponseCreation/ResponseCreation.vue';
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import Widget from "@/components/Widget/Widget";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import throbber from "@/assets/vue-svg/throbber.svg";
import {getSmallImage} from "@/tools/tools";
import search from "@/assets/vue-svg/search.svg";

export default {
  name: "Responses",
  components: {
    'widget': Widget,
    'helper': Helper,
    'custom-select': CustomSelect,
    'response-creation': ResponseCreation,
    'task-control': TaskControl,
    'mini-profile': MiniProfile,
    GroupSelect,
    'throbber': throbber,
    'search': search,
  },
  data() {
    return {
      // currentPage: 1,
      perPage: window.innerWidth > 1600 ? 10 : 6,
      filters: {},
      selectedTypes: [],
      columns: ['title', 'group', 'user', 'status'],
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'vacancies-table-container-cell -title',
          group: 'vacancies-table-container-cell -country',
          user: 'vacancies-table-container-cell -user',
          status: 'vacancies-table-container-cell -status'
        },
        headings: {
          title: 'Название',
          group: 'Регион',
          user: 'Источник заявки',
          status: 'Статус'
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
      droverType: '',
      showGroupsForOperator: false,
      showResponse: {},
      showTask: {},
      flag: false,
      userProfile: {},
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    responses() {
      return this.$store.state.hr.responses;
    },
    responseFieldsError() {
      return this.$store.state.responses.fieldsErrors;
    },
    responsesPagination() {
      return this.$store.state.hr.allResponsesPagination;
    },
    hrStatus() {
      return this.$store.state.hr.hrStatus;
    },
    groupsNonOperators() {
      return this.$store.state.dictionaries.groupsNonOperators;
    },
    users() {
      return this.$store.state.dictionaries.usersReferralResponses;
    },
    usersOptions() {
      return [{id: null, surname: 'Все сотрудники'}, ...this.users];
    },
    responseStatus() {
      return this.$store.state.responses.responseStatus;
    },
    taskStatus() {
      return this.$store.state.tasks.taskStatus;
    },
    taskFieldsError() {
      return this.$store.state.tasks.fieldsErrors;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    responseTypes() {
      return this.$store.state.responses.responseTypes;
    },
    currentPage() {
      return this.$route.query.page || 1;
    },
    openedResponseId() {
      let rawId = this.$route.query.response;
      return rawId && parseInt(rawId);
    },
  },
  watch: {
    responseStatus(newStatus, oldStatus) {
      if (newStatus === 'response-fetched' && oldStatus === 'creating') {
        this.$toasted.success(`Заявка создана`, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        })
        this.getResponses()
      } else if (newStatus === 'response-deleted' || (newStatus === '' && oldStatus === 'creating-duplicate')) {
        this.getResponses();
      }/* else if (newStatus === 'error') this.$toasted.error(this.responseFieldsError[0].message, {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast
        }
      })*/
    },
    taskStatus: function (newStatus, oldStatus) {
      if ((newStatus === 'task-created' || newStatus === '') && (oldStatus === 'creating' || oldStatus === "editing")) {
        this.getResponses()
      } else if (newStatus === 'task-not-created') this.$toasted.error(this.taskFieldsError[0].message, {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast
        }
      })
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        if (this.openedResponseId) this.$router.push({
          name: this.$router.currentRoute.name,
          query: {
            ...this.$router.currentRoute.query,
            response: undefined,
          },
        });
      }
    },
    currentPage: function (newPage) {
      this.getResponses(newPage);
    },
    openedResponseId: function (newResponseId) {
      if (newResponseId && this.responses?.length) {
        this.showResponse = this.responses.find(response => response.id === newResponseId);
        if (this.showResponse.task && (this.showResponse.task.status === 'active' || this.showResponse.task.status === 'check')) {
          this.showTask = {...this.showResponse.task, response: this.showResponse, title: this.showResponse.title};
          this.droverType = 'task-opened';
        } else this.droverType = 'response-opened';
        this.$store.dispatch('layout/toggleHelper', true);
      }
    },
    responses: function (newResponses, prevResponses) {
      if (!prevResponses?.length && newResponses.length && this.openedResponseId) {
        this.showResponse = newResponses.find(response => response.id === this.openedResponseId);
        if (this.showResponse.task && (this.showResponse.task.status === 'active' || this.showResponse.task.status === 'check')) {
          this.showTask = {...this.showResponse.task, response: this.showResponse, title: this.showResponse.title};
          this.droverType = 'task-opened';
        } else this.droverType = 'response-opened';
        this.$store.dispatch('layout/toggleHelper', true);
      }
    }
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsNonOperators');
    this.$store.dispatch('dictionaries/fetchUsersReferralResponses');
    this.$store.dispatch('dictionaries/getNationalities');
    this.getResponses();
  },
  methods: {
    openNewResponses() {
      this.showResponse = {
        id: null,
        status: "",
        email: "",
        phone: "",
        title: "",
        gender: 'female',
        birthday: null,
        video_file: "",
        comments: {},
        source_user: null,
        source_city: null
      }
      this.droverType = 'response-opened';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openResponse(props) {
      // this.showResponse = response.row;
      // if (response.row.task && (response.row.task.status === 'active' || response.row.task.status === 'check')) {
      //   this.showTask = {...response.row.task, response: this.showResponse, title: this.showResponse.title};
      //   this.droverType = 'task-opened';
      // } else this.droverType = 'response-opened';
      // this.$store.dispatch('layout/toggleHelper', true);
      this.$router.push({
        name: this.$router.currentRoute.name,
        query: {
          ...this.$router.currentRoute.query,
          response: props.row.id,
        },
      });
    },
    getResponses(page = this.currentPage) {
      this.$store.dispatch('hr/getResponses', {
        group: this.filters.group?.id || null,
        search: this.filters.search || null,
        user: this.filters.user || null,
        types: this.selectedTypes?.length ? this.selectedTypes : null,
        pagination: true,
        page,
        per_page: this.perPage
      });
    },
    setFilter() {
      this.changePage(1);
    },
    clearFilter() {
      this.filters = {};
      this.selectedTypes = [];
      this.changePage(1);
    },
    changePage(page = this.currentPage) {
      if (page === this.currentPage) return this.getResponses();
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          page,
        },
      });
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    closeResponseCreation() {
      this.flag = false;
      this.$store.dispatch('layout/toggleHelper', false);
    },
    openOfficeList() {
      this.droverType = 'office-list';
    },
    openFilesUpload() {
      this.droverType = 'files-upload';
    },
    openMiniProfile(userProfile) {
      this.userProfile = userProfile;
      this.toggleHelper(true);
      this.droverType = 'mini-profile';
    },
    returnTask() {
      if (this.droverType !== 'mini-profile') this.flag = true;
      this.droverType = 'task-opened';
      this.$store.dispatch('tasks/fetchCurrentTask', this.showTask.id);
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    getResponseStatus(response) {
      if (response.task?.status === 'active' || response.task?.status === 'postponed' || response.task?.status === 'check') return response.task.type
      else return response.status
    },
  }
}
</script>