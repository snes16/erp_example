<template>
  <div class="profile_main">
    <div class="profile_main-block -main">
      <div class="card profile_main-card">
        <div class="profile_main-card-header d-block">
          <h3>Отчет о смене</h3>
          <date-scroll-type v-model="currentDate"
                            class="profile_main-card-header-date_picker"
                            type="week"
                            :show-type-picker="false"
                            @change="updateReports"
          />
        </div>
        <div v-if="formattedReports.length" class="profile_main-card-body -fixed -paddingless">
          <div v-for="report in formattedReports" class="profile_main-card-body-report" @click="clickReport(report.id)">
            <div class="profile_main-card-body-report-main">
              <b>{{ report.date }}</b>
              <template v-if="userType === 'operator'">
                <span class="ml-2">Модель:</span>
                <span v-if="userPermissions.model.profile.view" class="ml-2 text-info" @click.stop="clickUser(report.model.id)"
                >{{ userPermissions.fullname_model.view ? report.model.fullname : report.model.uid }}</span>
                <span v-else class="ml-2">{{ userPermissions.fullname_model.view ? report.model.fullname : report.model.uid }}</span>
              </template>
              <template v-else-if="report.operator">
                <span class="ml-2">Оператор:</span>
                <span v-if="userPermissions.operator.profile.view" class="ml-2 text-info" @click.stop="clickUser(report.operator.id)"
                >{{ userPermissions.fullname_operator.view ? report.operator.fullname : report.operator.uid }}</span>
                <span v-else class="ml-2">{{ userPermissions.fullname_operator.view ? report.operator.fullname : report.operator.uid }}</span>
              </template>
              <div v-else class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло</div>
            </div>
            <i class="profile_main-card-body-report-icon fa fa-angle-right"/>
          </div>
        </div>
        <div v-else class="profile_main-card-body">
          <span>{{ shownText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DateScrollType from "@/pages/Workshifts/components/DateScrollType/DateScrollType";
import moment from "moment";

export default {
  name: 'reports',
  props: {
    userId: Number,
    userType: String,
  },
  components: {
    DateScrollType,
  },
  data() {
    return {
      currentDate: moment().format('YYYY-MM-DD'),
    };
  },
  computed: {
    status() {
      return this.$store.state.profile.status;
    },
    shownText() {
      return this.status === 'error' ? 'Не удалось получить отчеты' : 'На этой неделе нет отчётов';
    },
    reports() {
      return this.$store.state.profile.workshiftReports;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    formattedReports() {
      return this.reports ?
          this.reports?.map(report => ({...report, date: moment.parseZone(report.date).format('DD.MM.YYYY')})) : [];
    },
  },
  created() {
    this.updateReports();
  },
  methods: {
    updateReports() {
      this.$store.dispatch('profile/fetchWorkshiftReports', {
        [this.userType === 'model' ? 'workshift.model.id' : 'workshift.operator.id']: this.userId,
        workweek: this.currentDate,
      });
    },
    clickUser(userId) {
      this.$emit('clickUser', userId);
    },
    clickReport(reportId) {
      this.$emit('clickReport', reportId);
    },
  }
}
</script>