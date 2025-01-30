<template>
  <div class="tasks">
    <div class="tasks-header">
      <h3 class="tasks-header-title">Задачи</h3>
      <b-button v-if="userPermissions.task.custom.edit" variant="outline-primary" type="button" size="md"
                @click="createCustomTask">Добавить задачу
      </b-button>
    </div>
    <div class="tasks-body">
      <div class="tasks-body-sidebar">
        <div class="tasks-body-sidebar-types">
          <router-link v-if="userPermissions.task.my.view" to="/app/tasks/all" class="tasks-body-sidebar-types-type"
                       :class="currentTaskPage === 'my_tasks' ? '-active' : ''">
            <span>Мои задачи</span>
            <div v-if="tasksQuantity.my_tasks && tasksQuantity.my_tasks.count"
                 class="tasks-body-sidebar-types-type-badge">{{
                tasksQuantity.my_tasks && tasksQuantity.my_tasks.count
              }}
            </div>
          </router-link>
          <router-link v-for="(title, currentType) in availableTaskTypes"
                       :to="`/app/tasks/${currentType}`"
                       class="tasks-body-sidebar-types-type"
                       :class="currentType === currentTaskPage ? '-active' : ''"
                       :key="currentType"
          >
            <span>{{ title }}</span>
            <div v-if="tasksQuantity[currentType] && tasksQuantity[currentType].count"
                 class="tasks-body-sidebar-types-type-badge">
              {{ tasksQuantity[currentType] && tasksQuantity[currentType].count }}
            </div>
          </router-link>
        </div>
      </div>
      <div class="tasks-body-main">
        <div class="tasks-body-main-tabs">
          <div v-for="(tab, key) in tabs"
               v-if="tasksQuantity[type]"
               class="tasks-body-main-tabs-tab"
               :class="tab.value === activeTab ? ' -active' : ''"
               :key="key"
               @click="setActiveTab(tab.value)"
          >
            {{ getTasksQuantityText(tab) }}
          </div>
        </div>
        <div class="tasks-body-main-filters">
          <div class="tasks-body-main-filters-inputs">
            <div class="tasks-body-main-filters-inputs-field">
              <date-picker v-model="filters.date"
                           class="datepicker-filter"
                           placeholder="Дата"
                           lang="ru"
                           input-class="tasks-body-main-filters-inputs-input"
                           format="DD.MM.YYYY"
                           @change="changeFilters"
              ><i slot="calendar-icon"/></date-picker>
            </div>
            <div v-if="!currentTaskPage" class="tasks-body-main-filters-inputs-field">
              <custom-select v-model="filters.type"
                             class="-filter"
                             defaultText="Тип"
                             :options="taskTypes"
                             @change="changeFilters"
              />
            </div>
            <div v-if="activeTab === 'all'" class="tasks-body-main-filters-inputs-field">
              <custom-select v-model="filters.user"
                             class="-filter"
                             defaultText="Исполнитель"
                             titleField="fullname"
                             valueField="id"
                             searchable
                             :options="usersWithTasks"
                             @change="changeFilters"
              >
                <template v-slot:chosen-variant="props">
                  <div v-if="props.value" class="d-flex align-items-center">
                    <avatar class="mr-2"
                            :url="props.value.avatar"
                            is-large
                            :telegram="props.value.telegram_connected"
                            :is-fin-admin="props.value.is_fin_admin"
                    />
                    <span>{{ props.value.fullname }}</span>
                  </div>
                  <span v-else>{{ props.shownText }}</span>
                </template>
                <template v-slot:list-variant="props">
                  <div class="d-flex align-items-center">
                    <avatar class="mr-2"
                            :url="props.variant.avatar"
                            is-large
                            :telegram="props.variant.telegram_connected"
                            :is-fin-admin="props.variant.is_fin_admin"
                    />
                    <span>{{ props.variant.fullname }}</span>
                  </div>
                </template>
              </custom-select>
            </div>
            <div class="tasks-body-main-filters-inputs-field">
              <group-select v-model="filters.group"
                            class="-filter"
                            onlyModelsGroup
                            @input="changeFilters"
              />
            </div>
            <div
              v-if="(currentTaskPage === 'my_tasks' && userPermissions.task.interview.view) || currentTaskPage === 'interview'"
              class="tasks-body-main-filters-inputs-field"
            >
              <custom-select v-model="filters.postponement"
                             :options="optionsPostponementReasons"
                             class="-filter"
                             defaultText="Причина переноса"
                             value-field="id"
                             titleField="title"
                             right
                             @change="changeFilters"
              />
            </div>
          </div>
          <div class="tasks-body-main-filters-inputs justify-content-between">
            <div class="tasks-body-main-filters-inputs-checkboxes">
              <div v-for="optionTaskStatus in taskStatusesForFilters"
                   class="abc-checkbox tasks-body-main-filters-inputs-checkboxes-checkbox "
                   :class="`-${optionTaskStatus.status}`">
                <input type="checkbox" :id="optionTaskStatus.status" :value='optionTaskStatus.status'
                       v-model="status" @change="changeStatusTask">
                <label :for="optionTaskStatus.status">{{ optionTaskStatus.label }}</label>
              </div>
            </div>
            <span class="tasks-body-main-filters-buttons-button" @click="clearFilters">Сбросить</span>
          </div>
        </div>
        <div v-if="!preventLoading && (mainStatus === 'request')" class="tasks-body-main-table -empty">
          <throbber class="throbber"/>
          <span>Задачи загружаются, пожалуйста, подождите</span>
        </div>
        <div v-show="preventLoading || (mainStatus !== 'request')" class="tasks-body-main-container">
          <v-client-table
            :data="currentTasks"
            :columns="columns"
            :options="options"
            class="hide_row tasks-body-main-table"
            @row-click="openTask"
          >
            <div class="tasks-body-main-table-row" slot="title" slot-scope="props" :key="`task-title-${props.row.id}`">
              <div :id="`task-title-${props.row.id}`" :ref="`task-title-${props.row.id}`"
                   class="tasks-body-main-table-row-container">{{ props.row.title }}
              </div>
              <b-tooltip v-if="cellWidths[props.row.id] && cellWidths[props.row.id].title === 180"
                         :target="`task-title-${props.row.id}`" triggers="hover">
                {{ props.row.title }}
              </b-tooltip>
            </div>
            <div class="tasks-body-main-table-row" slot="status" slot-scope="props">
              <p class="tasks-body-main-table-row-status"
                 :class="`-${props.row.status}`">
                {{ taskStatuses[props.row.status] }}
              </p>
            </div>
            <div class="tasks-body-main-table-row" slot="postponements" slot-scope="props">
              <div :id="`task-postponement-${props.row.id}`" :ref="`task-postponement-${props.row.id}`"
                   class="tasks-body-main-table-row-container">{{ props.row.postponed_last_comment.text }}
              </div>
              <b-tooltip v-if="cellWidths[props.row.id] && cellWidths[props.row.id].postponement === 180"
                         :target="`task-postponement-${props.row.id}`" triggers="hover">
                {{ props.row.postponed_last_comment.text }}
              </b-tooltip>
            </div>
            <div class="tasks-body-main-table-row" slot="type" slot-scope="props">
              <div class="tasks-body-main-table-row-container">{{ allTaskTypes[props.row.type] }}</div>
            </div>
            <div class="tasks-body-main-table-row" slot="vacancy" slot-scope="props">
              <div class="tasks-body-main-table-row-container">{{
                  props.row.vacancy ? props.row.vacancy.title : '-'
                }}
              </div>
            </div>
            <div class="tasks-body-main-table-row d-flex justify-content-between" slot="planned_start_at"
                 slot-scope="props">
              <div class="tasks-body-main-table-row-container -sm">
                <div class="d-flex align-items-center">
                  <span v-if="props.row.planned_start_at" class="mr-2">{{
                      formatDate(props.row.planned_start_at)
                    }}</span>
                </div>
              </div>
            </div>
            <div class="tasks-body-main-table-row" slot="user" slot-scope="props">
              <div v-if="props.row.user" class="tasks-body-main-table-row-container">
                <div class="d-flex align-items-center">
                  <avatar class="mr-2"
                          :url="props.row.user.avatar"
                          is-large
                          :telegram="props.row.user.telegram_connected"
                          :is-fin-admin="props.row.user.is_fin_admin"
                  />
                  <span class="tasks-body-main-table-row-username">{{ props.row.user.surname }}</span>
                  <user-resign-icon v-if="props.row.user.resign_date" :offset="40" :user="props.row.user"
                                    :id="`resign_info-${props.row.user.id}`"/>
                  <div v-else-if="props.row.user.blocked" class="glyphicon-blocked" v-b-tooltip.hover
                       title="Сотрудник заблокирован"></div>
                </div>
              </div>
            </div>
            <div class="tasks-body-main-table-row" slot="group" slot-scope="props">
              <template v-if="props.row.group">
                <div :id="`task-group-${props.row.id}`" class="tasks-body-main-table-row-container"
                     :ref="`task-group-${props.row.id}`">
                  <span class="flag-icon mr-1" :class="`flag-icon-${props.row.group.flag || 'default'}`"
                        :title="props.row.group.country"></span>
                  <span class="text-gray mr-1">{{ props.row.group.city }}</span>
                  <span>{{ props.row.group.office }}</span>
                </div>
                <b-tooltip v-if="cellWidths[props.row.id] && cellWidths[props.row.id].group === 180"
                           :target="`task-group-${props.row.id}`" triggers="hover">
                  <span class="flag-icon mr-1" :class="`flag-icon-${props.row.group.flag || 'default'}`"
                        :title="props.row.group.country"></span>
                  <span class="text-gray mr-1">{{ props.row.group.city }}</span>
                  <span>{{ props.row.group.office }}</span>
                </b-tooltip>
              </template>
            </div>
            <div class="tasks-body-main-table-row" slot="accounts" slot-scope="props">
              <div class="tasks-body-main-table-row-container">
                <div :id="`task-accounts-${props.row.id}`" class="tasks-body-main-table-row-container"
                     :ref="`task-accounts-${props.row.id}`">
                  <template v-for="(account, key) in props.row.resource_titles">{{ key !== 0 ? ', ' : '' }}{{
                      account
                    }}
                  </template>
                </div>
                <b-tooltip v-if="cellWidths[props.row.id] && cellWidths[props.row.id].accounts === 180"
                           :target="`task-accounts-${props.row.id}`" triggers="hover">
                  <template v-for="(account, key) in props.row.resource_titles">{{ key !== 0 ? ', ' : '' }}{{
                      account
                    }}
                  </template>
                </b-tooltip>
              </div>
            </div>
            <div class="tasks-body-main-table-row" slot="info" slot-scope="props">
              <info :id="`task-info-${props.row.id}`"/>
              <b-tooltip :target="`task-info-${props.row.id}`" triggers="hover" placement="left"
                         custom-class="tasks-body-main-table-row-info_tooltip">
                <div class="tasks-body-main-table-row-info_tooltip-title"><span>Информация о задаче</span></div>
                <div v-if="props.row.author" class="tasks-body-main-table-row-info_tooltip-block">
                  <span class="text-gray mb-1">Автор задачи</span>
                  <div class="d-flex align-items-center">
                    <avatar class="mr-2"
                            :url="props.row.author.avatar"
                            is-large
                            :telegram="props.row.author.telegram_connected"
                            :is-fin-admin="props.row.author.is_fin_admin"
                    />
                    <span class="tasks-body-main-table-row-username">{{ props.row.author.surname }}</span>
                  </div>
                </div>
                <div v-if="props.row.created_at" class="tasks-body-main-table-row-info_tooltip-block">
                  <span class="text-gray mb-1">Дата создания задачи</span>
                  <div class="d-flex align-items-center">
                    {{ formatDate(props.row.created_at) }}
                  </div>
                </div>
                <div v-if="props.row.complete_at" class="tasks-body-main-table-row-info_tooltip-block">
                  <span class="text-gray mb-1">Дата выполнения задачи</span>
                  <div class="d-flex align-items-center">
                    {{ formatDate(props.row.complete_at) }}
                  </div>
                </div>
              </b-tooltip>
            </div>
            <div class="tasks-body-main-table-row" slot="recipient" slot-scope="props">
              <div v-if="props.row.recipient" class="tasks-body-main-table-row-container">
                <div class="d-flex align-items-center">
                  <avatar class="mr-2"
                          :url="props.row.recipient.avatar"
                          is-large
                          :telegram="props.row.recipient.telegram_connected"
                          :is-fin-admin="props.row.recipient.is_fin_admin"
                  />
                  <span class="tasks-body-main-table-row-username">{{ props.row.recipient.surname }}</span>
                  <user-resign-icon v-if="props.row.recipient.resign_date" :offset="40" :user="props.row.recipient"
                                    :id="`resign_info-${props.row.recipient.id}`"/>
                  <div v-else-if="props.row.recipient.blocked" class="glyphicon-blocked" v-b-tooltip.hover
                       title="Сотрудник заблокирован"></div>
                </div>
              </div>
            </div>
          
          </v-client-table>
          <b-pagination :value="currentPage"
                        align="left"
                        :total-rows="tasksPagination.totalItems"
                        :per-page="perPage"
                        @change="changePage"
          />
        </div>
      </div>
    </div>
    <helper>
      <task-control
        v-if="droverType === 'response'"
        :task-prop="activeTask"
        :task-opened="true"
        :open-block="flag"
        @open-mini-profile="openMiniProfile"
        @close="closeHelper"
        @update-tasks="updateTasks"
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
import {mapState, mapActions} from 'vuex';
import vSelect from 'vue-select';
import Stub from "@/components/Stub/Stub.vue";
import Select from "@/components/Common/Select/Select";
import GroupSelect from '../GroupsSelect/GroupsSelect';
import Helper from '@/components/Helper/Helper.vue';
import Avatar from "@/components/Common/Avatar/Avatar";
import TaskControl from '@/pages/Tasks/components/TaskControl.vue';
import DatePicker from 'vue2-datepicker';
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import UserResignIcon from "@/components/Common/UserResignIcon";
import throbber from "@/assets/vue-svg/throbber.svg";
import info from '@/assets/info.svg';
import {getSmallImage} from "@/tools/tools";
import moment from 'moment';

export default {
  name: 'tasks-list',
  components: {
    'custom-select': Select,
    'group-select': GroupSelect,
    'date-picker': DatePicker,
    'helper': Helper,
    'task-control': TaskControl,
    // 'restore': RestorePassword,
    'stub': Stub,
    'v-select': vSelect,
    'mini-profile': MiniProfile,
    'avatar': Avatar,
    UserResignIcon,
    'throbber': throbber,
    'info': info
  },
  data() {
    return {
      activeTab: 'all',
      status: ['active', 'postponed', 'check'],
      isActiveOptions: [
        {
          title: 'Активные',
          value: true
        },
        {
          title: 'Неактивные',
          value: false
        }
      ],
      // currentPage: 1,
      perPage: window.innerWidth > 1600 ? 10 : 7,
      filters: {},
      sortBy: '',
      sortAscending: false,
      options: {
        headings: {
          title: 'Название',
          type: 'Тип',
          user: 'Исполнитель',
          vacancy: 'Вакансия',
          planned_start_at: 'Дата',
          group: 'Регион',
          accounts: 'Аккаунты',
          status: 'Статус',
          recipient: 'Сотрудник',
          postponements: 'Причины переноса',
          info: ''
        },
        texts: {filter: '', count: '', limit: '', noResults: 'Нет записей'},
        headerClass: {background: 'none'},
        // columnsClasses: { id: 'width-100', description: 'width-100', status: 'width-190' },
        skin: 'table table-striped',
        sortable: ['title', 'type', 'user', 'planned_start_at', 'vacancy', 'group', 'status', 'postponements','recipient'],
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down',
        },
        customSorting: {
          title: this.sortTasks('title'),
          type: this.sortTasks('type'),
          user: this.sortTasks('user.surname'),
          recipient: this.sortTasks('recipient.fullname'),
          planned_start_at: this.sortTasks('planned_start_at'),
          vacancy: this.sortTasks('response.vacancy.title'),
          group: this.sortTasks('response.vacancy.group.title'),
          status: this.sortTasks('status'),
          postponements: this.sortTasks('postponement')
        },
        rowClassCallback(row) {
          return row.isOverdue ? 'overdue' : '';
        },
        cellClasses: {
          planned_start_at: [
            {
              class: 'tasks-body-main-table-overdue_date',
              condition: row => row.isOverdue
            }
          ]
        },
      },
      activeTask: {},
      submittedResponse: {},
      responseCopy: {},
      droverType: '',
      // submittedTask: {},
      isPermission: {},
      forbidden: false,
      // postponedFilter: true,
      flag: false,
      userProfile: {},
      type: 'my_tasks',
      cellWidths: {},
      preventLoading: false,
      showGroupsForOperator: false,
      currentDate: moment(),
    }
  },
  computed: {
    ...mapState('tasks', ['tasksPagination', 'task']),
    ...mapState('dictionaries', ['taskTypes', 'usersWithTasks']),
    ...mapState('auth', ['user']),
    ...mapState('responses', ['currentResponse', 'errorCode', 'responseStatus']),
    currentTaskPage() {
      return this.$route.params.task_type === 'all' ? 'my_tasks' : this.$route.params.task_type;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    currentTask() {
      return this.$store.state.tasks.currentTask;
    },
    taskStatus() {
      return this.$store.state.tasks.taskStatus;
    },
    mainStatus() {
      return this.$store.state.tasks.mainStatus;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    allTaskTypes() {
      return this.$store.state.dictionaries.allTaskTypes;
    },
    taskStatuses() {
      return this.$store.state.dictionaries.taskStatuses;
    },
    optionTaskStatuses() {
      return this.$store.state.dictionaries.taskStatusesArray;
    },
    taskStatusesForFilters() {
      return this.optionTaskStatuses.filter(status => {
        switch (status.status) {
          case 'check':
            return ((this.currentTaskPage === 'my_tasks') && this.userPermissions.task.interview.view) || (this.currentTaskPage === 'interview');
          case 'archive':
            return ((this.currentTaskPage === 'my_tasks') && (this.userPermissions.task.interview.view || this.userPermissions.task.call_center.view)) || (this.currentTaskPage === 'interview') || (this.currentTaskPage === 'call_center');
          case 'postponed' :
            return this.currentTaskPage !== 'support';
        }
        return true;
      })
    },
    droverOpened() {
      return this.$store.state.layout.helperOpened;
    },
    tasksQuantity() {
      return this.$store.state.tasks.tasksQuantity;
    },
    postponedTasksQuantity() {
      return this.$store.state.tasks.postponedTasksQuantity;
    },
    availableTaskTypes() {
      if (!this.taskTypes) return;
      let types = {};
      
      for (let type in this.taskTypes) {
        if (this.userPermissions.task[type] && this.userPermissions.task[type].view && type !== 'custom') types[type] = this.taskTypes[type];
      }
      if (this.userPermissions.user.restore_password && this.taskTypes.restore_password) types['restore_password'] = this.taskTypes.restore_password;
      
      return types;
    },
    columns() {
      if (this.type === 'support') {
        return [
          'recipient',
          'title',
          'status',
          'group',
          'user',
        ]
      }
      let columns = ['title', 'status', 'group'];
      switch (this.type) {
        case 'custom':
          columns.pop();
          break;
        case 'interview':
          columns.push('postponements');
          break;
        case 'my_tasks':
        case 'revision_new':
          columns.push('type');
          break;
        case 'call_center':
          columns.push('vacancy');
          break;
        case 'registration':
        case 'checking_new':
        case 'reregistration':
          columns.push('accounts');
          break;
      }
      columns.push('user', 'planned_start_at', 'info');
      return columns;
    },
    tabs() {
      let tabs = [
        {
          title: 'Все задачи',
          value: 'all',
        },
        {
          title: 'Я исполнитель',
          value: 'user',
        },
      ]
      if (this.currentTaskPage === 'my_tasks') tabs.push({title: 'Я назначил', value: 'author'});
      return tabs;
    },
    currentTasks() {
      return this.$store.state.tasks.currentTasks.map(task => ({
        ...task,
        isOverdue: task.complete_at ? moment(task.planned_start_at) < moment(task.complete_at) : moment(task.planned_start_at) < this.currentDate
      }));
    },
    optionsPostponementReasons() {
      return [{title: 'Выбрать все причины', id: null}, ...this.$store.state.dictionaries.postponementReasons];
    },
    currentPage() {
      return this.$route.query.page || 1;
    },
    activeTaskId() {
      let rawId = this.$route.query.task;
      return rawId && parseInt(rawId);
    },
  },
  watch: {
    currentPage: function (newPage) {
      this.updateTasks(newPage);
    },
    currentResponse: function (newResponse) {
      this.responseCopy = JSON.parse(JSON.stringify(newResponse))
      this.responseCopy.workflow = this.activeTask
      this.responseCopy.task_sheet_status = true
      this.submittedResponse = this.responseCopy
    },
    user: function (newUser) {
      if (this.type === 'my') this.updateTasks();
      let permissions = newUser.role.permissions,
        currentTaskPage = this.currentTaskPage
      this.isPermission = {
        task_view: permissions.includes(`task.${currentTaskPage}.view`),
        task_edit: permissions.includes(`task.${currentTaskPage}.edit`),
        restore_password: permissions.includes('user.restore_password')
      }
    },
    currentTasks: function (nextTasks, prevTasks) {
      this.$nextTick(this.setCellWidths);
      if (!prevTasks?.length && nextTasks.length && this.activeTaskId) {
        this.activeTask = nextTasks.find(task => task.id === this.activeTaskId) || {id: this.activeTaskId};
        this.droverType = 'response';
        this.toggleHelper(true);
      }
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.preventLoading = true;
        this.updateTasksType();
        if (this.activeTaskId) this.$router.push({
          name: this.$router.currentRoute.name,
          query: {
            ...this.$router.currentRoute.query,
            task: undefined,
          },
        });
      }
    },
    currentTaskPage: function (newType) {
      this.type = newType;
      if (this.activeTab === 'author') this.activeTab = 'all';
      this.updateTasks();
    },
    taskStatus: function (newStatus, prevStatus) {
      if (prevStatus === 'request-list') return this.preventLoading = false;
    },
    activeTaskId: function (newTaskId) {
      if (newTaskId && this.currentTasks?.length) {
        this.activeTask = this.currentTasks.find(task => task.id === newTaskId) || {id: newTaskId};
        this.droverType = 'response';
        this.toggleHelper(true);
      }
    },
  },
  created() {
    const filterStatusesTasks = JSON.parse(localStorage.getItem('filterStatusesTasks'));
    if (filterStatusesTasks && filterStatusesTasks.length !== 0) this.status = filterStatusesTasks;
    this.type = this.$route.params.task_type === 'all' ? 'my_tasks' : this.$route.params.task_type;
    this.updateTasksType();
    this.$store.dispatch('dictionaries/fetchAllTaskTypes');
    this.$store.dispatch('dictionaries/fetchTaskStatusesArray');
    this.fetchUsersWithTasks();
    this.$store.dispatch('dictionaries/fetchAttachments');
    this.$store.dispatch('dictionaries/fetchCredentialStatuses');
    this.$store.dispatch('dictionaries/fetchAllCredentialStatuses');
    this.$store.dispatch('dictionaries/fetchProfileCredentialStatuses');
    this.$store.dispatch('dictionaries/getNationalities');
    this.$store.dispatch('dictionaries/fetchPostponementReasons');
    // this.changeColumns();
  },
  mounted() {
    this.setCellWidths();
  },
  methods: {
    ...mapActions('tasks', ['fetchTasks', 'fetchCurrentTask']),
    ...mapActions('dictionaries', ['fetchUsersWithTasks']),
    ...mapActions('responses', ['fetchCurrentResponse']),
    ...mapActions('layout', ['toggleHelper']),
    formatDate(rawDate) {
      return new Date(rawDate).format('dd.mm.yyyy');
    },
    sortTasks(field) {
      return (ascending) => {
        if ((this.sortAscending === ascending) && (this.sortBy === field)) return;
        this.sortBy = field;
        this.sortAscending = ascending;
        this.updateTasks();
      }
    },
    updateTasksQuantity() {
      this.$store.dispatch('tasks/getTasksQuantity', {status: this.status});
      this.preventLoading = false;
    },
    updateTasksType(pageTask) {
      this.updateTasks(pageTask ? 1 : undefined);
      this.updateTasksQuantity();
    },
    changeStatusTask() {
      localStorage.setItem('filterStatusesTasks', JSON.stringify(this.status))
      this.updateTasksType(true);
    },
    changeFilters() {
      this.updateTasks(1);
    },
    updateTasks(page = this.currentPage) {
      let filters = {
        ...this.filters,
        page,
        per_page: this.perPage,
        status: this.status,
        user: (this.activeTab === 'user') ? this.user.id : (this.activeTab === 'author') ? undefined : this.filters.user,
        author: (this.activeTab === 'author') ? this.user.id : undefined,
        group: this.filters.group?.map(group => group.id) || undefined,
        postponement: (this.currentTaskPage === 'interview' || this.currentTaskPage === 'my_tasks') ? this.filters.postponement : undefined
      }
      if (this.sortBy) filters[`order[${this.sortBy}]`] = this.sortAscending ? 'asc' : 'desc';
      if (this.filters.date) {
        filters['planned_start_at[after]'] = this.filters.date.format('dd.mm.yyyy');
        let secondDate = new Date(this.filters.date.getTime());
        secondDate.setDate(secondDate.getDate() + 1);
        filters['planned_start_at[strictly_before]'] = secondDate.format('dd.mm.yyyy');
        delete filters.date;
      }
      return this.fetchTasks({task: this.type, filters});
    },
    clearFilters() {
      this.filters = {};
      this.$root.$emit('clearFilters');
      this.status = [];
      this.changeStatusTask();
    },
    openTask(e) {
      this.flag = false;
      this.$router.push({
        name: this.$router.currentRoute.name,
        query: {
          ...this.$router.currentRoute.query,
          task: e.row.id,
        },
      });
    },
    createCustomTask() {
      this.flag = false;
      this.activeTask = {
        id: null,
        status: 'new',
        type: 'custom',
        title: '',
        description: '',
      }
      this.toggleHelper(true);
      this.droverType = 'response'
    },
    closeHelper() {
      this.toggleHelper(false);
      this.droverType = '';
    },
    openMiniProfile(userProfile) {
      this.userProfile = userProfile;
      this.toggleHelper(true);
      this.droverType = 'mini-profile';
    },
    returnTask() {
      this.toggleHelper(true);
      if (this.droverType !== 'mini-profile') this.flag = true;
      this.droverType = 'response';
    },
    setActiveTab(value) {
      this.activeTab = value;
      this.updateTasks();
    },
    setCellWidths() {
      let cellWidths = {};
      this.currentTasks.map(task => {
        cellWidths[task.id] = {
          title: this.$refs[`task-title-${task.id}`]?.clientWidth,
          group: this.$refs[`task-group-${task.id}`]?.clientWidth,
          postponement: this.$refs[`task-postponement-${task.id}`]?.clientWidth,
          accounts: this.$refs[`task-accounts-${task.id}`]?.clientWidth
        }
      });
      this.cellWidths = cellWidths;
    },
    getTasksQuantityText(tab) {
      if (tab.value === 'all') return tab.title;
      if (tab.value === 'postponed') return this.postponedTasksQuantity[this.type] ? `${tab.title} (${this.postponedTasksQuantity[this.type]})` : `${tab.title}`;
      return this.tasksQuantity[this.type]['count_' + tab.value] ? `${tab.title} (${this.tasksQuantity[this.type]['count_' + tab.value]})` : `${tab.title}`;
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    changePage(page) {
      this.preventLoading = false;
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          page,
        },
      });
    },
  },
}
</script>
