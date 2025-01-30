<template>
  <div class="white_list-add">
    <div class="theme-helper-content-main-header"></div>
    <div class="theme-helper-content-main-body pt-3 pb-0">
      <div class="border-bottom pb-3">
        <h3 class="mb-0">Отчет о смене {{ reportDate }}</h3>
        <p v-if="userType === 'operator'" class="mb-0">
          <span>Модель:</span>
          <span v-if="userPermissions.model.profile.view"
                class="text-primary cursor-pointer ml-2"
                @click="clickModel"
          >{{ userPermissions.fullname_model.view ? report.model.fullname : report.model.uid }}</span>
          <span v-else class="ml-2">{{ userPermissions.fullname_model.view ? report.model.fullname : report.model.uid }}</span>
        </p>
        <p v-else-if="report.operator" class="mb-0">
          <span>Оператор:</span>
          <span v-if="userPermissions.operator.profile.view"
                class="text-primary cursor-pointer ml-2"
                @click="clickOperator"
          >{{ userPermissions.fullname_operator.view ? report.operator.fullname : report.operator.uid }}</span>
          <span v-else class="ml-2">{{ userPermissions.fullname_operator.view ? report.operator.fullname : report.operator.uid }}</span>
        </p>
      </div>
    </div>
    <div class="theme-helper-content-main-body pt-3">
      <div v-for="(group, key) in report.group_responses"
           v-if="group.parameters && group.parameters.length"
           class="mb-3 border-bottom"
      >
        <div class="workshifts-collapse border-bottom-0 p-0 pb-2"
             :class="{'-active': collapseState[key]}"
             @click="collapseBlock(`collapse-report-${key}`)"
        >
          <h4 class="workshifts-collapse-text -plain">{{ group.title }}</h4>
          <i class="fa fa-angle-down workshifts-collapse-arrow"/>
        </div>
        <b-collapse v-model="collapseState[key]" :id="`collapse-report-${key}`" class="workshifts-card-main -white" @show="onCollapseShow(key)">
          <div class="overflow-hidden">
            <div v-for="parameter in group.parameters" class="row pt-2 mb-2" :class="parameter.type !== 'text' ? 'align-items-center' : 'align-items-start'" >
              <div class="col-sm-6 col-xs-12">
                <b>{{ parameter.title }}</b>
              </div>
              <div class="col-sm-6 col-xs-12 pl-1">
                <div v-if="(parameter.code === 'common_info_available_sites_count') || (parameter.code === 'common_info_opened_sites_count')"
                     class="d-flex align-items-center px-3"
                >
                  <span>{{ parameter.answers.length }}</span>
                  <div :id="`${parameter.code === 'common_info_opened_sites_count' ? 'active' : 'all'}-accounts-info`" class="response-info_data-field-info ml-2">
                    <info />
                  </div>
                  <b-tooltip :target="`${parameter.code === 'common_info_opened_sites_count' ? 'active' : 'all'}-accounts-info`"
                             triggers="hover"
                             placement="bottom"
                  >
                    <div v-for="account in parameter.answers" class="d-flex align-items-center mb-2">
                      <div class="avatar -sm mr-2" :style="(account.resource.logotype) ? `background-image: url(${getSmallImage(account.resource.logotype)}); background-size: cover;` : ''"/>
                      <span>{{ account.resource.short_title }}</span>
                    </div>
                  </b-tooltip>
                </div>
                <div v-else-if="parameter.type === 'time'" class="response-info_data-field-time">
                  <date-picker v-model="parameter.value"
                               class="datepicker-plain response-info_data-field-input"
                               type="time"
                               lang="ru"
                               input-class="input-plain"
                               placeholder="--:--"
                               :clearable="false"
                               format="HH:mm"
                               value-type="HH:mm"
                               :input-attr="{ required: true }"
                               disabled
                  ><i style="display: none;" slot="calendar-icon" /></date-picker>
                  <span class="glyphicon glyphicon-time response-info_data-field-time-icon"/>
                </div>
                <date-picker v-else-if="parameter.type === 'date'"
                             v-model="parameter.value"
                             class="datepicker-plain response-info_data-field-input"
                             lang="ru"
                             input-class="input-plain"
                             placeholder="Выберите дату"
                             :clearable="false"
                             format="DD.MM.YYYY"
                             value-type="YYYY-MM-DD"
                             :input-attr="{ required: true }"
                             disabled
                ><i style="display: none;" slot="calendar-icon" /></date-picker>
                <textarea-autosize-custom v-else-if="parameter.type === 'text'"
                                          v-model="parameter.value"
                                          class="response-info_data-field-input pt-0"
                                          :id="`shift_report_text-${parameter.id}`"
                                          ref="autosizeTextarea"
                                          placeholder="Введите значение"
                                          disabled
                />
                <input v-else
                       v-model="parameter.value"
                       class="response-info_data-field-input"
                       placeholder="Введите значение"
                       disabled
                />
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import DatePicker from '@/components/Common/Datepicker/index';
import info from '@/assets/vue-svg/info.svg';
import { getSmallImage } from "@/tools/tools";
import moment from "moment";
import TextareaAutosizeCustom from "@/components/Common/TextareaAutosize";

export default {
  name: 'report-details',
  props: {
    reportId: Number,
    userType: String,
  },
  components: {
    TextareaAutosizeCustom,
    'custom-select': Select,
    'date-picker': DatePicker,
    info,
  },
  data() {
    return {
      collapseState: [],
    };
  },
  computed: {
    report() {
      return this.$store.getters['profile/workshiftReport'](this.reportId);
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    reportDate() {
      if (!this.report.date) return null;
      return moment.parseZone(this.report.date).format('DD.MM.YYYY');
    },
  },
  watch: {
    report: function (newReport) {
      this.collapseState = newReport.group_responses?.map(() => true) || [];
    },
  },
  created() {
    this.$store.dispatch('profile/fetchWorkshiftReport', this.reportId);
  },
  methods: {
    onCollapseShow(key) {
      this.$refs.autosizeTextarea[key]?.resize();
    },
    clickOperator() {
      this.$emit('clickUser', this.report.operator.id);
    },
    clickModel() {
      this.$emit('clickUser', this.report.model.id);
    },
    collapseBlock(id) {
      this.$root.$emit('bv::toggle::collapse', id);
    },
    getSmallImage(image) {
      return getSmallImage(image);
    },
  }
}
</script>