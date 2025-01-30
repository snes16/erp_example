<template>
  <b-navbar class="app-header d-print-none"
            :class="[navbarTypeClass,
            'header-' + navbarColorScheme,
            {'-without_sidebar': isOperator || isModel},
            {'-sidebar_opened': !sidebarClose}
            ]">
    <b-nav v-if="!isOperator && !isModel">
      <b-nav-item v-if="!mobileSearchStatus">
        <a class="burger d-md-down-none px-2" href="#" @click="toggleSidebarMethod"><i class='la la-bars la-lg'/></a>
        <a class="fs-lg d-lg-none" href="#" @click="switchSidebarMethod"><i class="la la-bars la-lg"/></a>
      </b-nav-item>
      <div v-else class="d-flex align-items-center p-3" @click="toggleMobileSearch">
        <arrow/>
      </div>
    </b-nav>
    <b-nav>
      <b-form v-if="!isOperator && !isModel" class="search ml-2" inline>
        <b-form-group class="search-field">
          <b-input-group>
            <template v-slot:prepend>
              <b-input-group-text>
                <search_large/>
              </b-input-group-text>
            </template>
            <b-form-input v-model="searchString"
                          id="search-input"
                          placeholder="Поиск"
                          autocomplete="new-password"
                          @input="onInputSearchString"
                          @click.stop="onClickSearchInput"
            />
          </b-input-group>
        </b-form-group>
        <search v-if="!mobileSearchStatus" class="search-mobile_icon" @click="toggleMobileSearch"/>
        <div v-else class="search-mobile_input">
          <input v-model="searchString"
                 id="search-input-mobile"
                 autocomplete="new-password"
                 class="input-plain"
                 ref="search-input-mobile"
                 @input="onInputSearchString"
                 @click.stop="onClickSearchInput"
          />
          <close @click.stop="clearSearchString"/>
        </div>
        <div v-if="searchPanelStatus" class="search-panel" @click.stop>
          <div v-if="status === 'request'" class="search-panel-loading">
            <throbber class="throbber search-panel-loading-throbber"/>
            <div class="ml-2">Идет поиск</div>
          </div>
          <div v-else-if="!isAnyResults" class="search-panel-empty">
            <span>По запросу “{{ requestedSearchString }}” ничего не найдено</span>
          </div>
          <div v-else class="search-panel-main">
            <template v-if="results.users.length">
              <p class="search-panel-main-subheader">Пользователи</p>
              <div class="search-panel-main-results">
                <div v-for="user in results.users"
                     class="search-panel-main-results-result search-panel-main-results-user" @click="onClickUser(user)">
                  <avatar size="-md"
                          :url="user.avatar"
                          is-large
                          :telegram="user.telegram_connected"
                          :is-fin-admin="user.is_fin_admin"
                  />
                  <div class="search-panel-main-results-user-info">
                    <div class="search-panel-main-results-user-info-name">
                      <b>
                        <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                        <template v-else>
                          <span class="text-gray mr-1">{{ user.uid }}</span>
                          <span>{{ user.fullname }}</span>
                        </template>
                      </b>
                      <user-resign-icon v-if="user.resign_date" :user="user" :id="`resign_info-${user.id}`"/>
                      <div v-else-if="user.blocked" class="glyphicon-blocked" v-b-tooltip.hover
                           title="Сотрудник заблокирован"></div>
                      <template v-if="user.new_model">
                        <div
                            class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2"
                            :id="`new-user-search-${user.id}`"/>
                        <b-tooltip :target="`new-user-search-${user.id}`" triggers="hover" placement="top">
                          <div class="text-center">Обратите внимание,<br/>девушка работает недавно</div>
                        </b-tooltip>
                      </template>
                      <div v-if="user.is_solo"
                           class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло
                      </div>
                    </div>
                    <span>{{ user.role.title }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="results.accounts.length">
              <p class="search-panel-main-subheader">Аккаунты на сервисах</p>
              <div class="search-panel-main-results">
                <div v-for="account in results.accounts"
                     class="search-panel-main-results-result search-panel-main-results-account"
                     @click="onClickUser(account.model)">
                  <avatar size="-md"
                          :url="account.model.avatar"
                          is-large
                          :telegram="user.telegram_connected"
                          :is-fin-admin="user.is_fin_admin"
                  />
                  <div class="search-panel-main-results-account-info">
                    <div class="search-panel-main-results-account-info-title">
                      <b>{{ account.login }}</b>
                    </div>
                    <div class="search-panel-main-results-account-info-name">
                      <span>{{ account.resource }}</span>
                      <span class="text-gray ml-1 mr-1">•</span>
                      <template v-if="!account.model.uid || !account.model.fullname">
                        {{ account.model.uid || account.model.fullname }}
                      </template>
                      <template v-else>
                        <span class="text-gray mr-1">{{ account.model.uid }}</span>
                        <span>{{ account.model.fullname }}</span>
                      </template>
                    </div>
                  </div>
                  <div class="search-panel-main-results-account-status" :class="`-${account.status}`">
                    {{ credentialStatuses[account.status] }}
                  </div>
                </div>
              </div>
            </template>
            <template v-if="results.responses.length">
              <p class="search-panel-main-subheader">Заявки</p>
              <div class="search-panel-main-results">
                <div v-for="response in results.responses"
                     class="search-panel-main-results-result search-panel-main-results-response"
                     @click="onClickResponse(response)">
                  <div class="search-panel-main-results-response-info">
                    <div class="search-panel-main-results-response-info-title">{{ response.title }}</div>
                    <div class="search-panel-main-results-response-info-vacancy">{{ response.vacancy_title }}</div>
                  </div>
                  <div v-if="response.status && responseStatuses[response.status]"
                       class="search-panel-main-results-response-type" :class="`-${response.status}`">
                    {{ responseStatuses[response.status] }}
                  </div>
                  <div v-else-if="response.task && response.task.type" class="search-panel-main-results-response-type"
                       :class="`-${response.task.type}`">{{ allTaskTypes[response.task.type] }}
                  </div>
                </div>
              </div>
            </template>
            <template v-if="results.vacancies.length">
              <p class="search-panel-main-subheader">Вакансии</p>
              <div class="search-panel-main-results">
                <div v-for="vacancy in results.vacancies"
                     class="search-panel-main-results-result search-panel-main-results-vacancy"
                     @click="onClickVacancy(vacancy)">
                  <div class="search-panel-main-results-vacancy-info">
                    <div class="search-panel-main-results-vacancy-info-title"><b>{{ vacancy.title }}</b></div>
                    <div v-if="vacancy.group_path" class="search-panel-main-results-vacancy-info-group">
                      <span class="flag-icon mr-1" :class="`flag-icon-${vacancy.group_path.flag || 'default'}`"
                            :title="vacancy.group_path.country"></span>
                      <span class="text-gray mr-1">{{ vacancy.group_path.city }}</span>
                      <span>{{ vacancy.group_path.office }}</span>
                    </div>
                  </div>
                  <div class="search-panel-main-results-vacancy-responses">Заявки: {{ vacancy.count_responses }}</div>
                </div>
              </div>
            </template>
            <template v-if="results.tasks.length">
              <p class="search-panel-main-subheader">Задачи</p>
              <div class="search-panel-main-results">
                <div v-for="task in results.tasks"
                     class="search-panel-main-results-result search-panel-main-results-task" @click="onClickTask(task)">
                  <div class="search-panel-main-results-task-info">
                    <div class="search-panel-main-results-task-info-title"><b>{{ task.title }}</b></div>
                    <div class="search-panel-main-results-task-info-type">{{ allTaskTypes[task.type] }}</div>
                  </div>
                  <div class="search-panel-main-results-task-status" :class="`-${task.status}`">
                    {{ taskStatuses[task.status] }}
                  </div>
                </div>
              </div>
            </template>
            <template v-if="results.groups.length">
              <p class="search-panel-main-subheader">Группы</p>
              <div class="search-panel-main-results">
                <div v-for="group in results.groups"
                     class="search-panel-main-results-result search-panel-main-results-group"
                     @click="onClickGroup(group)">
                  <div class="search-panel-main-results-group-info">
                    <div class="search-panel-main-results-group-info-title">
                      <span class="color_picker-dot" :style="`background-color: ${ group.color }`"></span>
                      <b>{{ group.title }}</b>
                    </div>
                    <div class="search-panel-main-results-group-info-type">{{ groupTypes[group.type] }}</div>
                  </div>
                  <div class="search-panel-main-results-group-users">Сотрудники: {{ group.count_users }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </b-form>
    </b-nav>
    <b-nav v-if="!mobileSearchStatus" class="ml-auto flex-row flex-nowrap header-user"
           :class="[sidebarClose ? '-sidebar_closed' : '-sidebar_opened', sidebarStatic ? '-sidebar_opened' : '-sidebar_closed', {'-sm': isOperator || isModel}]"
    >
      <b-nav-item-dropdown v-if="editButtonPermission"
                           class="header-add"
                           menu-class="notificationsWrapper py-0 animated animated-fast fadeIn"
                           toggle-class="header-add-button"
                           ref="createDropdown"
                           right
      >
        <template slot="button-content">
          <b class="text-cyan header-add-button-text">Добавить</b>
          <div class="btn btn-add ml-2"/>
          <div class="header-add-button-border"/>
        </template>


        <section class="header_dropdown navbar-notifications">
          <header class="cardHeader">
            <a v-if="userCreatePermission"
               class="dropdown-item d-flex align-items-center"
               @click="createUser"
            >
              <user class="mr-2"/>
              Сотрудника</a>
            <a v-if="responseCreatePermission"
               class="dropdown-item d-flex align-items-center"
               @click="createResponse"
            >
              <response class="mr-2"/>
              Заявку</a>
            <a v-if="taskCreatePermission"
               class="dropdown-item d-flex align-items-center"
               @click="createTask"
            >
              <task class="mr-2"/>
              Задачу</a>
            <a v-if="shiftCreatePermission"
               class="dropdown-item d-flex align-items-center"
               @click="createShift"
            >
              <shift class="mr-2"/>
              Смену</a>
          </header>
        </section>
      </b-nav-item-dropdown>
      <li v-if="isOperator || isModel" class="d-flex align-items-center cursor-pointer" @click="openSupportMessages">
        <question-mark-circled class="text-primary" />
        <b class="ml-2 hidden-below_md border-right pr-4">Помощь</b>
      </li>
      <li id="notification_modal" class="nav-item b-nav-dropdown dropdown notificationsMenu" :class="{'ml-2': !isOperator && !isModel}">
        <div id='wrapper-bell' class="nav-link dropdown-toggle header-bell-button dropdown-toggle-no-caret">
          <div class="header-add-button-border border-0"/>
          <div class="header-bell-button-block"
               :class="{'-with_badge' : unreadNotifications}" @click="onTooltipNotificationToggle">
            <div v-if="unreadNotifications" class="header-bell-button-block-badge">
              {{ unreadNotifications }}
            </div>
            <bell class="header-bell-button-block-icon"/>
            <b-tooltip
                :show="showTooltip"
                placement="auto"
                triggers="focus"
                custom-class="header-bell-button-block-tooltip"
                target="wrapper-bell"
            >
              <span>новое уведомление</span>
              <div type="button"
                   class="btn-close header-bell-button-block-close"
                   aria-label="Close"
                   @click="closeTooltip"/>
            </b-tooltip>

            <b-tooltip
                ref="tooltipNotification"
                triggers="focus"
                target="notification_modal"
                :offset="-35"
                placement="bottom"
                custom-class="dropdown-menu notificationsWrapper py-0 animated animated-fast fadeIn"
                @click.stop
            >

              <Notifications/>
            </b-tooltip>
          </div>
          <div class="header-add-button-border"/>
        </div>
      </li>
      <b-nav-item-dropdown class="headerDropdown"
                           :class="{ '-right_shift' : !isOperator && !isModel}"
                           menu-class="notificationsWrapper py-0 animated animated-fast fadeIn"
                           ref="dropdown"
                           right
                           :no-caret="isOperator || isModel">
        <template slot="button-content">
          <span v-if="!isOperator && !isModel"
                class="small name ml-2_5">{{ user.name + " " + user.surname || user.email || 'Philip smith' }}</span>
          <span class="thumb-sm float-left mr-2">
            <div v-if="user.avatar || user.email === 'admin@flatlogic.com'" class="avatar"
                 :style="user.avatar || avatarImage ?
                 `background-image: url(${getSmallImage(user.avatar || avatarImage)}); background-size: cover;` : ''"/>
            <span class="first-letter" v-else>{{ firstUserLetter }}</span>
          </span>
        </template>
        <header-dropdown @notification-selected="closeDropdown"/>
      </b-nav-item-dropdown>
    </b-nav>
    <helper contentClass="-paddingless" type="header">
      <mini-profile v-if="droverType === 'mini-profile'"
                    :userId="activeUser.id"
                    :breadcrumbs-title="droverBreadcrumbs"
                    @close="returnTask"
      />
      <vacancy-creation v-else-if="droverType === 'vacancy-details'"
                        :vacancy-prop="activeVacancy"
                        @add-response="openResponseCreation"
                        @open-response="openResponse"
                        @open-task="openTask"
                        @save-vacancy-title="saveVacancyTitle"
      />
      <response-creation v-else-if="droverType === 'response-details'"
                         :vacancy-prop="activeVacancy"
                         :response-prop="activeResponse"
                         forbidden
                         @close="closeVacancyDetails"
                         @open-mini-profile="openMiniProfile"
      />
      <task-control v-else-if="droverType === 'task-details'"
                    :task-prop="activeTask"
                    :vacancy-title="activeVacancy.title"
                    :open-block="taskFlag"
                    @open-vacancy-creation="openVacancyCreation"
                    @open-mini-profile="openMiniProfile"
      />
      <shift-details v-else-if="droverType === 'shift-details'"
                     :workshift="defaultShift"
                     all-groups
      />
      <user-create v-else-if="droverType === 'user-create'"
                   type="all"
      />
    </helper>
  </b-navbar>
</template>

<script>
import {mapState, mapActions} from 'vuex';
import Helper from '@/components/Helper/Helper.vue';
import Notifications from '@/components/Notifications/Notifications';
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import VacancyCreation from '@/pages/HR/VacancyCreation/VacancyCreation.vue';
import ResponseCreation from '@/pages/HR/ResponseCreation/ResponseCreation.vue';
import TaskControl from '@/pages/Tasks/components/TaskControl.vue';
import ShiftDetails from '@/pages/Workshifts/components/Details';
import UserCreate from '@/pages/Organization/Groups/components/UserCreate/UserCreate';
import UserResignIcon from "@/components/Common/UserResignIcon";
import Avatar from "@/components/Common/Avatar/Avatar";
import HeaderDropdown from "@/components/HeaderDropdown/HeaderDropdown.vue";
import avatarImage from '@/assets/people/a5.jpg';
import bell from '@/assets/vue-svg/bell.svg';
import throbber from "@/assets/vue-svg/throbber.svg";
import search from "@/assets/vue-svg/search-mobile.svg";
import arrow from "@/assets/vue-svg/arrow-left.svg";
import close from "@/assets/vue-svg/close_filled.svg";
import user from "@/assets/vue-svg/creation/user.svg";
import response from "@/assets/vue-svg/creation/response.svg";
import task from "@/assets/vue-svg/creation/task.svg";
import shift from "@/assets/vue-svg/creation/shift.svg";
import search_large from "@/assets/vue-svg/search-large.svg"
import questionMarkCircled from "@/assets/vue-svg/question-mark-circled.svg"
import {getSmallImage} from "@/tools/tools";

export default {
  name: 'Header',
  components: {
    Notifications,
    throbber,
    'helper': Helper,
    'mini-profile': MiniProfile,
    'vacancy-creation': VacancyCreation,
    'task-control': TaskControl,
    'avatar': Avatar,
    'response-creation': ResponseCreation,
    'shift-details': ShiftDetails,
    'header-dropdown': HeaderDropdown,
    UserCreate,
    UserResignIcon,
    'search': search,
    'arrow': arrow,
    'close': close,
    'bell': bell,
    'user': user,
    'response': response,
    'task': task,
    'shift': shift,
    'search_large': search_large,
    'question-mark-circled': questionMarkCircled,
  },
  data() {
    return {
      avatarImage,
      searchString: '',
      requestedSearchString: '',
      searchPanelStatus: false,
      mobileSearchStatus: false,
      droverType: '',
      taskFlag: false,
      activeUser: {},
      activeVacancy: {},
      activeTask: {},
      activeResponse: {},
      showTooltip: false,
      showTooltipNotificationStatus: false,
      credentialStatuses: {
        active: 'Активен',
        need_improved: 'Требует доработки',
        reregistration: 'Перерегистрация',
        inactive: 'Неактивен',
        locked: 'Заблокирован',
        new: 'Новый'
      },
      responseStatuses: {
        new: 'Новая заявка',
        processed: 'Обработана',
        reject: 'Отказ',
        archive: 'Архив'
      },
      droverBreadcrumbs: '',
      showGroupsForOperator: false,
      defaultShift: {
        model: {},
      },
      responseCreationFromVacancy: false,
    }
  },
  computed: {
    ...mapState('layout', [
      'sidebarStatic',
      'navbarType',
      'navbarColorScheme'
    ]),
    ...mapState('auth', ['user']),
    firstUserLetter() {
      return (this.user.name || this.user.email || "P")[0].toUpperCase();
    },
    newNotificationId() {
      return this.$store.state.notifications.newNotification?.id;
    },
    sidebarClose() {
      return this.$store.state.layout.sidebarClose;
    },
    navbarTypeClass: function () {
      return "navbar-" + this.navbarType + "-type"
    },
    results() {
      return this.$store.state.search.results;
    },
    status() {
      return this.$store.state.search.status;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    isAnyResults() {
      return this.results.users?.length ||
          this.results.accounts?.length ||
          this.results.vacancies?.length ||
          this.results.tasks?.length ||
          this.results.responses?.length ||
          this.results.groups?.length;
    },
    allTaskTypes() {
      return this.$store.state.dictionaries.allTaskTypes;
    },
    taskStatuses() {
      return this.$store.state.dictionaries.taskStatuses;
    },
    groupTypes() {
      return this.$store.state.groups.groupTypes;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    userCreatePermission() {
      return this.userPermissions.user.create;
    },
    responseCreatePermission() {
      return this.userPermissions.hr_response.edit || this.userPermissions.hr.edit || this.userPermissions.vacancy_response.management;
    },
    taskCreatePermission() {
      return this.userPermissions.task.custom.edit;
    },
    shiftCreatePermission() {
      return this.userPermissions.schedule.edit;
    },
    editButtonPermission() {
      return this.userCreatePermission || this.responseCreatePermission || this.taskCreatePermission || this.shiftCreatePermission;
    },
    task() {
      return this.$store.state.tasks.task;
    },
    isOperator() {
      return this.$store.state.auth.user.role.code === 'ROLE_OPERATOR';
    },
    isModel() {
      return this.$store.state.auth.user.role.code === 'ROLE_MODEL';
    },
    unreadNotifications() {
      return this.$store.state.auth.unreadNotificationsCount;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if ((newStatus === '') && (prevStatus === 'request') && (this.requestedSearchString !== this.searchString)) this.onInputSearchString();
      else if (newStatus === 'request') this.searchPanelStatus = true;
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
    userStatus: function (newStatus, prevStatus) {
      if (newStatus !== '') return;
      if ((prevStatus === 'editing') && (this.droverType === 'add-groups')) {
        this.droverBreadcrumbs = ''
        this.droverType = 'mini-profile';
      }
      if (prevStatus === 'creating') {
        this.$toasted.success(`Сотрудник создан`, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
        this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: false});
      }
    },
    newNotificationId: function (newNotificationId) {
      this.openTooltip();
    }
  },
  created() {
    document.addEventListener('click', this.hideSearchPanel);
    this.$store.dispatch('dictionaries/fetchGroupsByType', 'country');
    this.$store.dispatch('dictionaries/fetchGroupsByType', 'city');
    this.$store.dispatch('dictionaries/fetchResources', {type: 'hr'});
    this.$store.dispatch('dictionaries/fetchTaskStatuses');
    this.$store.dispatch('dictionaries/fetchAllTaskTypes');
  },
  destroyed() {
    document.removeEventListener('click', this.hideSearchPanel);

  },
  methods: {
    ...mapActions('layout', [
      'toggleSidebar',
      'switchSidebar',
      'changeSidebarActive',
    ]),
    ...mapActions('auth', ['logoutUser']),
    onTooltipNotificationShown() {
      this.$refs.tooltipNotification.$emit('open')
      this.showTooltipNotificationStatus = true
      this.showTooltip = false
    },
    onTooltipNotificationToggle(e) {
      if (e) {
        e.stopPropagation()
      }
      if (this.showTooltipNotificationStatus) {
        this.onTooltipNotificationHidden()
      } else {
        this.onTooltipNotificationShown()
      }
    },
    onTooltipNotificationHidden() {
      this.$refs.tooltipNotification.$emit('close')
      this.showTooltipNotificationStatus = false
    },
    switchSidebarMethod() {
      if (!this.sidebarClose) {
        this.switchSidebar(true);
        this.changeSidebarActive(null);
      } else {
        this.switchSidebar(false);
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    closeTooltip() {
      this.showTooltip = false;
    },
    openTooltip() {
      if (!this.showTooltipNotificationStatus) {
        this.showTooltip = true;
      }
      setTimeout(() => {
        this.showTooltip = false;
      }, 5000);
    },
    toggleSidebarMethod() {
      if (this.sidebarStatic) {
        this.toggleSidebar();
        this.changeSidebarActive(null);
      } else {
        this.toggleSidebar();
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    onInputSearchString() {
      if (this.searchString.length < 3) {
        this.hideSearchPanel();
        this.$store.dispatch('search/clearSearchResults');
        return;
      }
      let searchString = this.searchString;
      setTimeout(() => this.fetchSearchResults(searchString), 500);
    },
    clearSearchString() {
      this.searchString = '';
      this.onInputSearchString();
    },
    fetchSearchResults(searchString) {
      if ((searchString !== this.searchString) || (this.status === 'request')) return;
      this.requestedSearchString = searchString;
      this.$store.dispatch('search/fetchSearchResults', {search: searchString});
    },
    hideSearchPanel() {
      this.onTooltipNotificationHidden()
      this.searchPanelStatus = false;
    },
    onClickSearchInput() {
      if (this.isAnyResults || (this.status === 'request')) this.searchPanelStatus = true;
    },
    closeDropdown() {
      this.$refs.dropdown.hide();
    },
    onClickUser(user) {
      if (!this.userPermissions[user?.role.code === 'ROLE_MODEL' ?
          'model' : (user?.role.code === 'ROLE_OPERATOR' ? 'operator' : 'employee')].profile.view) return;
      this.activeUser = user;
      this.droverBreadcrumbs = '';
      this.droverType = 'mini-profile';
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
      this.hideSearchPanel();
    },
    userEditGroups() {
      this.showGroupsForOperator = false;
      this.droverType = 'add-groups';
    },
    userEditOperatorGroups() {
      this.showGroupsForOperator = true;
      this.droverType = 'add-groups';
    },
    backToUserDetails() {
      this.droverType = 'mini-profile';
    },
    onClickVacancy(vacancy) {
      if (vacancy) this.activeVacancy = {...vacancy, group: vacancy.group_path};
      this.droverType = 'vacancy-details';
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
      this.hideSearchPanel();
    },
    openResponseCreation() {
      this.activeResponse = {};
      this.droverType = 'response-details';
      this.responseCreationFromVacancy = true;
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
      this.hideSearchPanel();
    },
    openResponse(response) {
      this.activeResponse = response;
      this.droverType = 'response-details';
    },
    openTask(task) {
      this.activeTask = task;
      this.taskFlag = false;
      this.droverType = 'task-details';
    },
    saveVacancyTitle(title) {
      console.log(title);
    },
    openVacancyCreation() {
      this.taskFlag = false;
      this.droverType = 'vacancy-details';
    },
    openMiniProfile(userProfile) {
      this.droverBreadcrumbs = userProfile.breadcrumbsTitle;
      this.activeUser = {id: userProfile.id, fullname: userProfile.fullname}
      this.droverType = 'mini-profile';
    },
    returnTask() {
      this.droverBreadcrumbs = ''
      if (this.droverType !== 'mini-profile') this.taskFlag = true;
      this.$store.dispatch('tasks/fetchCurrentTask', this.activeTask.id);
      this.droverType = 'task-details';
    },
    onClickTask(task) {
      if (task) this.activeTask = task;
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
      this.hideSearchPanel();
      this.taskFlag = false;
      this.droverType = 'task-details';
    },
    onClickResponse(response) {
      if (response.task && response.status === 'in_progress') {
        this.activeTask = response.task;
        this.droverType = 'task-details';
      } else {
        this.activeResponse = response;
        this.droverType = 'response-details';
      }
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
      this.hideSearchPanel();
    },
    onClickGroup(group) {
      localStorage.setItem('groupToShow', group.id);
      if (this.$route.name === 'Groups') this.$root.$emit('showGroupFromStorage');
      else this.$router.push({name: 'Groups'});
      this.hideSearchPanel();
    },
    openPartnerProfile(user) {
      this.activeUser = user
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    toggleMobileSearch() {
      this.mobileSearchStatus = !this.mobileSearchStatus;
      setTimeout(() => {
        this.$refs['search-input-mobile']?.focus();
      }, 10);
    },
    createTask() {
      this.activeTask = {
        id: null,
        status: 'new',
        type: 'custom',
        title: '',
        description: '',
      }
      this.droverType = 'task-details';
      this.$refs.createDropdown.hide(true);
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
    },
    createShift() {
      this.droverType = 'shift-details';
      this.$refs.createDropdown.hide(true);
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
    },
    createUser() {
      this.droverType = 'user-create';
      this.$refs.createDropdown.hide(true);
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
    },
    createResponse() {
      this.activeResponse = {
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
      this.droverType = 'response-details';
      this.responseCreationFromVacancy = false;
      this.$refs.createDropdown.hide(true);
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: true});
    },
    closeVacancyDetails(isTaskCreated) {
      if (isTaskCreated) return this.onClickTask(this.task);
      if (this.responseCreationFromVacancy) return this.onClickVacancy();
      this.$store.dispatch('layout/toggleHelperWithType', {type: 'header', status: false});
    },
    openSupportMessages() {
      this.$root.$emit('set-profile-tab', 'support');
    },
  }
};
</script>
