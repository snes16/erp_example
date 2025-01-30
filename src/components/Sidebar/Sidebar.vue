<template>
  <div class="sidebar-wrapper">
    <nav
        :class="{sidebar: true, sidebarStatic, sidebarOpened}"
    >
      <header class="logo logo-custom_styles">
        <router-link :to="mainPage"><span class="primary-word">In</span><span class="second-word">studio</span>
        </router-link>
      </header>
      <ul class="nav">
        <NavLink v-if="infoLinks.length"
                 :activeItem="activeItem"
                 header="Информационная панель"
                 link="/app/management"
                 iconName="flaticon-management"
                 index="management"
                 isHeader
                 :children-links="infoLinks"
        />
        <NavLink v-if="organizationLinks.length"
                 :activeItem="activeItem"
                 header="Организация"
                 link="/app/organization/groups"
                 iconName="flaticon-home"
                 index="organization"
                 :children-links="organizationLinks"
        />
        <NavLink
            v-if="hrLinks.length"
            :activeItem="activeItem"
            header="HR"
            link="/app/forms"
            iconName="flaticon-hold"
            index="forms"
            :childrenLinks="hrLinks"
        />
        <NavLink
            v-if="tasksLinks.length"
            :activeItem="activeItem"
            header="Задачи"
            :link="defaultTasksLink"
            common-link="/app/tasks"
            iconName="flaticon-hide"
            index="tables"
            :badge="badgeTasksQuantity"
            isHeader
        />
        <NavLink
            v-if="calendarPermission"
            :activeItem="activeItem"
            header="Календарь"
            link="/app/calendar"
            iconName="flaticon-calendar-page"
            index="calendar"
            isHeader
        />
        <NavLink
            v-if="administrationLinks.length"
            :activeItem="activeItem"
            header="Администрирование"
            link="/app/core"
            iconName="flaticon-help"
            index="core"
            :childrenLinks="administrationLinks"
        />
        <NavLink
            v-if="schedulePermission"
            :activeItem="activeItem"
            header="Расписание"
            :link="scheduleLink"
            iconName="flaticon-timetable"
            index="workshifts"
            isHeader
        />
        <NavLink
            v-if="notificationsPermission"
            :activeItem="activeItem"
            header="Оповещения"
            link="/app/notifications"
            iconName="flaticon-speaker-full"
            index="workshifts"
            isHeader
        />
        <NavLink
            :activeItem="activeItem"
            header="Профиль"
            link="/app/profile"
            iconName="flaticon-home-1"
            index="profile"
            isHeader
        />
      </ul>
    </nav>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import { mapState, mapActions } from 'vuex';
import NavLink from './NavLink/NavLink';
import { isScheduleSectionPermitted } from "@/tools/tools";

export default {
  name: 'Sidebar',
  components: {NavLink, 'custom-select': Select},
  data() {
    return {
      alerts: [
        {
          id: 0,
          title: 'Sales Report',
          value: 15,
          footer: 'Calculating x-axis bias... 65%',
          color: 'danger',
        },
        {
          id: 1,
          title: 'Personal Responsibility',
          value: 20,
          footer: 'Provide required notes',
          color: 'primary',
        },
      ],
    };
  },
  computed: {
    ...mapState('layout', {
      sidebarStatic: state => state.sidebarStatic,
      sidebarOpened: state => !state.sidebarClose,
      activeItem: state => state.sidebarActiveElement
    }),
    ...mapState('auth', ['user']),
    badgeTasksQuantity() {
      return this.$store.state.tasks.badgeTasksQuantity;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    user() {
      return this.$store.state.auth.user;
    },
    mainPage() {
      return this.user?.role?.main_page || localStorage.getItem('mainPage') || '/app/profile'
    },
    infoLinks() {
      let infoLinks = [];
      if (this.userPermissions.widget.view) infoLinks.push({
        header: 'Информация',
        link: '/app/management'
      });
      if (this.userPermissions.widget.hr.view) infoLinks.push({
        header: 'Статистика HR',
        link: '/app/vacancies/stats'
      });
      return infoLinks;
    },
    organizationLinks() {
      let organizationLinks = [];
      if (this.userPermissions.group.main.view || this.userPermissions.group.operator.view || this.user.manager_operator_groups?.length) organizationLinks.push({
        header: 'Информация',
        link: '/app/organization/groups'
      });
      if (this.isSuperAdmin) organizationLinks.push({
        header: 'Бонусная программа',
        link: '/app/organization/ref_system_connections'
      });
      if (this.userPermissions.finance_system) organizationLinks.push({
        header: 'Поступления',
        link: '/app/organization/fin_system'
      });
      return organizationLinks;
    },
    hrLinks() {
      let hrLinks = [];
      if (this.userPermissions.hr.view) hrLinks.push({
        header: 'Вакансии',
        link: '/app/vacancies/active'
      });
      if (this.userPermissions.hr_response.view) hrLinks.push({
        header: 'Заявки',
        link: '/app/responses'
      });
      if (this.userPermissions.hr.view) hrLinks.push({
        header: 'Архив',
        link: '/app/vacancies/archive'
      });
      return hrLinks;
    },
    tasksLinks() {
      let tasksLinks = [];
      // Все задачи
      if (this.userPermissions.task.call_center.view ||
          this.userPermissions.task.interview.view ||
          this.userPermissions.task.psych.view ||
          this.userPermissions.task.video.view ||
          this.userPermissions.task.registration.view ||
          this.userPermissions.task.dossier.view ||
          this.userPermissions.task.checking.view) tasksLinks.push({
        header: 'Все задачи',
        link: '/app/tasks/all'
      })
      // Мои задачи
      if (this.userPermissions.task.my.view) tasksLinks.push({
        header: 'Мои задачи',
        link: '/app/tasks/my'
      })
      return tasksLinks;
    },
    administrationLinks() {
      if (this.isSuperAdmin) return [
        {
          header: 'Роли',
          link: '/app/roles'
        },
        {
          header: 'Справочники',
          link: '/app/catalog'
        },
        {
          header: 'Шаблоны',
          link: '/app/templates'
        },
        {
          header: 'История авторизаций',
          link: '/app/auth_history'
        },
      ];
      return [];
      
      const administrationLinks = [];
      if (this.userPermissions.admin.roles.view) administrationLinks.push({
        header: 'Роли',
        link: '/app/roles'
      })
      // Справочники
      if (this.userPermissions.admin.resource.view ||
          this.userPermissions.admin.cancel.workshifts.view ||
          this.userPermissions.admin.communication.view ||
          this.userPermissions.admin.cancellationReason.view ||
          this.userPermissions.admin.credentialBlockingReason.view ||
          this.userPermissions.admin.postponementReason.view ||
          this.userPermissions.admin.jobDuty.view ||
          this.userPermissions.admin.paymentResource.view ||
          this.userPermissions.admin.position.view
      ) administrationLinks.push({
        header: 'Справочники',
        link: '/app/catalog'
      });
      if (this.userPermissions.admin.dossier.view ||
          this.userPermissions.admin.response.view ||
          this.userPermissions.admin.templateWorkshiftReport.view
      ) administrationLinks.push({
        header: 'Шаблоны',
        link: '/app/templates'
      });
      if (this.userPermissions.admin.authorizationHistory.view) administrationLinks.push({
        header: 'История авторизаций',
        link: '/app/auth_history'
      });

      return administrationLinks;
    },
    schedulePermission() {
      return isScheduleSectionPermitted('show', this.userPermissions) ||
          isScheduleSectionPermitted('free-models', this.userPermissions) ||
          isScheduleSectionPermitted('past-workshift', this.userPermissions) ||
          isScheduleSectionPermitted('operator', this.userPermissions);
    },
    notificationsPermission() {
      return this.userPermissions.notification.view;
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
    scheduleLink() {
      switch (this.user.role?.code) {
        case 'ROLE_MODEL': return '/app/schedule';
        case 'ROLE_OPERATOR': return '/app/operator_schedule';
      }
      return '/app/workshifts';
    },
    calendarPermission() {
      return this.userPermissions.calendar.view
    },
    taskTypes() {
      return this.$store.state.dictionaries.taskTypes;
    },
    defaultTasksLink() {
      if (this.userPermissions.task.my.view) return '/app/tasks/all';
      if (!this.taskTypes) return '';
      for (let type in this.taskTypes) {
        if (this.userPermissions.task[type] && this.userPermissions.task[type].view && type !== 'custom') return `/app/tasks/${type}`;
      }
      if (this.userPermissions.user.restore_password && this.taskTypes.restore_password) return '/app/tasks/restore_password';
      return null;
    },
  },
  created() {
    this.setActiveByRoute()
  },
  methods: {
    ...mapActions('layout', ['changeSidebarActive', 'switchSidebar', 'toggleSidebar',]),
    ...mapActions('hr', ['getVacancies', 'saveVacancyStatus']),
    setActiveByRoute() {
      const paths = this.$route.fullPath.split('/');
      paths.pop();
      this.changeSidebarActive(paths.join('/'));
    },
  }
};
</script>