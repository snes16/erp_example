<template>
  <div class="management">
    <h1 class="management-title">Информационная панель</h1>
    <div v-if="availableWidgets" class="management-main">
      <div v-if="userPermissions.widget.new_models.view || userPermissions.widget.workshifts_actual.view" class="management-main-double">
        <widget-new-models v-if="userPermissions.widget.new_models.view"
                           :groups-options="groupsOptions"
        />
        <widget-workshifts-statuses v-if="userPermissions.widget.workshifts_actual.view"
                                    :groups-options="groupsNonOperatorsOptions"
                                    :groups-options-non-office="groupsOptionsNonOffice"
        />
      </div>
      <widget-calendar v-if="userPermissions.widget.events.view"
                       :groups-options="groupsOptions"
                       @openMiniProfile="openMiniProfile"
      />
      <widget-duties v-if="profile && profile.job_duty_settings && profile.job_duty_settings.is_show_on_dashboard"
                     :jobDutiesProfile="profile.job_duties"
                     :settingDuties="profile.job_duty_settings"
      />
      <widget-workloads v-if="userPermissions.widget.workload.view"
                        :groups-options="groupsOptionsNonOffice"
                        :groups="groupsNonOperators"
      />
      <widget-workshifts-info v-if="userPermissions.widget.without_workshift_model.view"
                              :groups-options="groupsOptionsNonOffice"
                              :groups="groupsNonOperators"
      />
      <widget-workshifts-info v-if="userPermissions.widget.without_workshift_operator.view"
                              showOperatorInfo
                              :groups-options="groupsOptionsNonOffice"
                              :groups="groupsNonOperators"
      />
      <widget-responsible-of-task v-if="userPermissions.widget.responsible.view"
                                  :groups-options="groupsOptionsNonOffice"
                                  @openMiniProfile="openMiniProfile"
      />
    </div>
    <div v-else class="management-empty">
      <h3>Доступные виджеты не найдены</h3>
    </div>
    <helper>
      <mini-profile
          v-if="droverType === 'mini-profile'"
          :user-id="userProfile.id"
      />
    </helper>
  </div>
</template>

<script>
import Helper from "@/components/Helper/Helper";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import WidgetCalendar from "@/pages/Management/WidgetCalendar/WidgetCalendar";
import WidgetWorkshiftsStatuses from "@/pages/Management/WidgetWorkshiftsStatuses/WidgetWorkshiftsStatuses";
import WidgetWorkloads from "@/pages/Management/WidgetWorkloads/WidgetWorkloads";
import WidgetNewModels from "@/pages/Management/WidgetNewModels/WidgetNewModels";
import WidgetWorkshiftsInfo from "@/pages/Management/WidgetWorkshiftsInfo/WidgetWorkshiftsInfo";
import WidgetResponsibleOfTask from "@/pages/Management/WidgetResponsibleOfTask/WidgetResponsibleOfTask";
import WidgetDuties from "@/pages/Management/WidgetDuties/WidgetDuties";
import {filterListRecursively} from "@/tools/tools";

export default {
  name: "Management",
  components: {
    WidgetDuties,
    WidgetResponsibleOfTask,
    WidgetWorkshiftsInfo,
    WidgetNewModels,
    WidgetWorkloads,
    WidgetWorkshiftsStatuses,
    WidgetCalendar,
    'helper': Helper,
    'mini-profile': MiniProfile,
  },
  data() {
    return {
      droverType: '',
      userProfile: {},
      showGroupsForOperator: false,
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    userId() {
      return this.$store.state.auth.user.id;
    },
    groupsNonOperators() {
      return this.$store.state.dictionaries.groupsNonOperators;
    },
    groups() {
      return this.$store.state.dictionaries.groups;
    },
    availableWidgets() {
      return this.userPermissions.widget.events.view
             || this.userPermissions.widget.workshifts_actual.view
             || this.userPermissions.widget.workload.view
             || this.userPermissions.widget.new_models.view
             || this.userPermissions.widget.without_workshift_model.view
             || this.userPermissions.widget.without_workshift_operator.view
             || this.userPermissions.widget.responsible.view
             || this.profile.job_duty_settings?.is_show_on_dashboard;
    },
    groupsNonOperatorsOptions() {
      return [{id: null, title: 'Все регионы'}, ...this.groupsNonOperators];
    },
    groupsOptions() {
      return [{id: null, title: 'Все регионы'}, ...this.groups];
    },
    groupsOptionsNonOffice() {
      return [{id: null, title: 'Все регионы'}, ...filterListRecursively(this.groupsNonOperators, group => group.type !== 'office')];
    },
    profile() {
      return this.$store.state.auth.user;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
  },
  watch: {
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsNonOperators');
    this.$store.dispatch('dictionaries/fetchGroups');
    this.$store.dispatch('dictionaries/fetchRoles');
    this.$store.dispatch('dictionaries/getJobDuties');
  },
  methods: {
    openMiniProfile(user) {
      if (!this.userPermissions[user.role ? this.userRole(user.role.code) : 'employee'].profile.view) return;
      this.userProfile = user;
      this.droverType = 'mini-profile';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    userRole(code) {
      switch (code) {
        case 'ROLE_MODEL': return 'model';
        case 'ROLE_OPERATOR': return 'operator';
        default: return 'employee';
      }
    }
  },
}
</script>