<template>
  <div class="management-main-widget management-main-duties">
    <div class="profile_main-card-header">
      <div class="profile_main-card-header-title">
        <h3>Обязанности</h3>
        <template v-if="settingDuties.confirmed_at">
          <i class="fi flaticon-done-sm d-flex ml-2" id="job-duties-confirm"/>
          <b-tooltip target="job-duties-confirm" triggers="hover">
            <div class="mt-1 mb-1">
              <span>Должностные обязаности <br/> приняты {{ formattedDate(settingDuties.confirmed_at) }}</span>
            </div>
          </b-tooltip>
        </template>
      </div>
    </div>
    <div class="profile_main-card-body management-main-duties-body">
      <template v-if="jobDutiesProfile.length">
        <div v-for="jobDuties in jobDutiesList" class="profile_main-card-body-list">
          <template v-if="jobDutiesProfile.some(duties => jobDuties.id === duties)">
            <div class="profile_main-card-body-list-title"><b>{{jobDuties.title}}</b></div>
            <ul>
              <li v-for="duty in jobDuties.children" v-if="jobDutiesProfile.some(duties => duty.id === duties)">
                &mdash; {{duty.title}}
              </li>
            </ul>
          </template>
        </div>
      </template>
      <div v-else class="management-main-duties-load">
        <h3>У сотрудника нет <br/> должностных обязанностей</h3>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: "WidgetDuties",
  props: {
    jobDutiesProfile: Array,
    settingDuties: Object,
  },
  computed: {
    jobDutiesList() {
      return this.$store.state.dictionaries.jobDuties;
    }
  },
  methods: {
    formattedDate(date) {
      return moment(date).format('DD.MM.YYYY');
    }
  }
}
</script>