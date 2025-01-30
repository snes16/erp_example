<template>
  <div class="profile_main-block -duties">
    <div class="card profile_main-card">
      <div class="profile_main-card-header">
        <div class="profile_main-card-header-title">
          <h3>Обязанности</h3>
          <template
              v-if="profile.profile.user.job_duty_settings && profile.profile.user.job_duty_settings.confirmed_at">
            <i class="fi flaticon-done-sm d-flex ml-2" id="job-duties-confirm"/>
            <b-tooltip target="job-duties-confirm" triggers="hover">
              <div class="mt-1 mb-1">
                    <span>Должностные обязаности <br/> приняты {{
                        moment(profile.profile.user.job_duty_settings.confirmed_at).format('DD.MM.YYYY')
                      }}</span>
              </div>
            </b-tooltip>
          </template>
        </div>
        <div v-if="!isMyProfile && editPermission && jobDutiesPermissionsEdit" class="profile_main-card-header-edit d-flex"
             @click="changeJobDuties">
          <template v-if="jobDutiesProfile.length">
            <span>Изменить</span>
            <pen/>
          </template>
          <template v-else>
            <span class="mr-2">Добавить</span>
            <div class="btn-add"/>
          </template>
        </div>
      </div>
      <div class="profile_main-card-body -duties">
        <template v-if="jobDutiesProfile.length">
          <div v-for="jobDuties in filteredJobDutiesList" class="profile_main-card-body-list">
            <div class="profile_main-card-body-list-title"><b>{{ jobDuties.title }}</b></div>
            <ul>
              <li v-for="duty in jobDuties.children">
                &mdash; {{ duty.title }}
              </li>
            </ul>
          </div>
        </template>
        <div v-else class="profile_main-card-body-empty_duties">
          <b class="text-gray">У сотрудника нет <br/> должностных обязанностей</b>
        </div>
      </div>
      <div v-if="!isMyProfile && editPermission && jobDutiesPermissionsEdit"
           class="profile_main-card-footer profile_main-card-footer-job-duties">
        <div class="d-flex">
          <i class="fi flaticon-management-grey"></i>
          <span class="ml-2">Отображать на информационной панели</span>
        </div>
        <div class="custom-control custom-switch">
          <input v-model="showDutiesDashboard"
                 type="checkbox"
                 class="custom-control-input"
                 id="show_duties"
                 :disabled="!editPermission"
                 @change="editUser()"
          >
          <label class="custom-control-label custom-control-label-stylization" for="show_duties"></label>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import pen from "@/assets/vue-svg/pen.svg";
import moment from "moment";
import {getTypeEditUser} from "@/tools/tools";

export default {
  name: 'widget-job-duties',
  components: {pen},
  props: {
    profile: Object,
    userPermissions: Object,
    userType: String,
    isMyProfile: Boolean,
  },
  data() {
    return {
      moment: moment,
      showDutiesDashboard: false
    }
  },
  computed: {
    editPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.edit;
    },
    viewPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.view;
    },
    jobDutiesPermissionsEdit() {
      return this.userPermissions.admin.roles.edit;
    },
    jobDutiesProfile() {
      return this.profile?.profile?.user?.job_duties || [];
    },
    jobDutiesList() {
      return this.$store.state.dictionaries.jobDuties;
    },
    filteredJobDutiesList() {
      if (!this.profile?.role?.type) return [];
      return this.jobDutiesList.filter(duty => this.jobDutiesProfile.includes(duty.id)).map(duty => ({
        ...duty,
        children: duty.children.filter(childDuty => this.jobDutiesProfile.includes(childDuty.id)),
      }));
    },
  },
  watch: {
    profile: function (newProfile) {
      if (newProfile)
        this.showDutiesDashboard = newProfile.profile.user?.job_duty_settings?.is_show_on_dashboard;
    },
  },
  created() {
    if (this.jobDutiesPermissionsEdit)
      this.$store.dispatch('dictionaries/getJobDuties');
    this.showDutiesDashboard = this.profile.profile?.user?.job_duty_settings?.is_show_on_dashboard;
  },
  methods: {
    changeJobDuties() {
      this.$emit('changeJobDuties');
    },
    editUser() {
      let data = {id: this.profile.id};
      data.job_duty_settings = {is_show_on_dashboard: this.showDutiesDashboard};
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, data);
    },
  },
}
</script>