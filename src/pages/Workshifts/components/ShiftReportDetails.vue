<template>
  <b-form class="white_list-add" @submit.prevent="showSaveModal">
    <div class="theme-helper-content-main-header">
      <b-button v-if="editPermission" type="submit" variant="outline-primary" size="sm">Сохранить</b-button>
    </div>
    <div class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>Завершённая смена</span>
      </div>
    </div>
    <div class="theme-helper-content-main-body pt-3 pb-0">
      <div class="border-bottom pb-3">
        <h3 class="mb-0">Отчет о смене: <template v-if="!reportId">не </template>заполнен</h3>
      </div>
    </div>
    <div class="theme-helper-content-main-body pt-3">
      <div v-for="group in templates"
           v-if="group.parameters && group.parameters.length"
           class="mb-3 border-bottom"
      >
        <h4>{{ group.title }}</h4>
        <div v-for="parameter in group.parameters" class="row pt-2 mb-2" :class="parameter.type !== 'text' ? 'align-items-center' : ''" >
          <div class="col-sm-6 col-xs-12">
            <b>{{ parameter.title }}</b>
          </div>
          <div class="col-sm-6 col-xs-12 pl-1">
            <div v-if="reportId && ((parameter.code === 'common_info_available_sites_count') || (parameter.code === 'common_info_opened_sites_count'))"
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
            <div v-else-if="parameter.code === 'common_info_available_sites_count'" class="d-flex align-items-center px-3">
              <span>{{ allAccounts.length }}</span>
              <div id="all-accounts-info" class="response-info_data-field-info ml-2">
                <info />
              </div>
              <b-tooltip target="all-accounts-info" triggers="hover" placement="bottom">
                <div v-for="resource in allAccounts" class="d-flex align-items-center mb-2">
                  <div class="avatar -sm mr-2" :style="(resource.logoSmall) ? `background-image: url(${resource.logoSmall}); background-size: cover;` : ''"/>
                  <span>{{ resource.short_title }}</span>
                </div>
              </b-tooltip>
            </div>
            <div v-else-if="parameter.code === 'common_info_opened_sites_count'" class="d-flex align-items-center px-3">
              <select-multiple v-model="parameter.value"
                               :options="allAccounts"
                               value-field="accounts"
                               title-field="short_title"
                               :showAllVariantsCheckbox="false"
                               :id="`shift_report_select_multiple-${parameter.id}`"
                               required
              >
                <template v-slot:list-variant="{variant}">
                  <div class="d-flex align-items-center">
                    <div class="avatar -sm mr-2" :style="(variant.logoSmall) ? `background-image: url(${variant.logoSmall}); background-size: cover;` : ''"/>
                    <span>{{ variant.short_title }}</span>
                  </div>
                </template>
              </select-multiple>
            </div>
            <textarea-autosize v-else-if="parameter.type === 'text'"
                               v-model="parameter.value"
                               class="response-info_data-field-input pt-0"
                               :id="`shift_report_text-${parameter.id}`"
                               placeholder="Введите значение"
                               :disabled="!!reportId"
                               maxlength="255"
                               required
            />
            <date-picker v-else-if="parameter.type === 'date'"
                         v-model="parameter.value"
                         class="datepicker-plain response-info_data-field-input"
                         :id="`shift_report_date-${parameter.id}`"
                         lang="ru"
                         input-class="input-plain"
                         placeholder="Выберите дату"
                         :clearable="false"
                         format="DD.MM.YYYY"
                         value-type="YYYY-MM-DD"
                         :input-attr="{ required: true }"
                         :disabled="!!reportId"
                         required
            ><i style="display: none;" slot="calendar-icon" /></date-picker>
            <div v-else-if="parameter.type === 'time'" class="workshift_details-body-main-row-time-block">
              <time-input v-model="parameter.value"
                          class="response-info_data-field-input -time"
                          :id="`shift_report_time-${parameter.id}`"
                          :disabled="!!reportId"
                          placeholder="--:--"
                          required
              />
              <span class="glyphicon glyphicon-time"></span>
            </div>
            <custom-select v-else-if="parameter.type === 'select'"
                           v-model="parameter.value"
                           :options="parameter.answers"
                           class="response-info_data-field-input -editable_fields"
                           :id="`shift_report_select-${parameter.id}`"
                           valueField="value"
                           titleField="value"
                           defaultText="Выберите вариант"
                           :disabled="!!reportId"
                           required
            />
            <div v-else-if="parameter.type === 'range'" class="response-info_data-field-range">
              <div class="response-info_data-field-range-input">
                <input v-model="parameter.value"
                       class="response-info_data-field-input"
                       :id="`shift_report_range-${parameter.id}`"
                       placeholder="00"
                       :disabled="!!reportId"
                       required
                       @change="editRangeParameter(parameter)"
                />
              </div>
              <div class="response-info_data-field-range-slider">
                <input v-model="parameter.value"
                       type="range"
                       class="input-range"
                       :min="parameter.answers && parameter.answers.min || 100"
                       :max="parameter.answers && parameter.answers.max || 200"
                       :disabled="!!reportId"
                       @change="editRangeParameter(parameter)"
                />
                <span class="response-info_data-field-range-slider-min">{{ parameter.answers && parameter.answers.min || 100 }}</span>
                <span class="response-info_data-field-range-slider-max">{{ parameter.answers && parameter.answers.max || 200 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
        id="save_report_modal"
        centered
        title="Вы уверены, что хотите сохранить отчёт о смене?"
        body-bg-variant="white"
        ok-title="Сохранить"
        ok-variant="primary"
        cancel-title="Отменить"
        cancel-variant="outline-primary"
        @ok="saveReport"
    >Проверьте заполненные данные, после сохранения отчет станет недоступен для редактирования</b-modal>
  </b-form>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import DatePicker from '@/components/Common/Datepicker/index';
import TimeInput from "@/pages/Workshifts/components/TimeInput";
import SelectMultiple from "@/components/Common/Select/SelectMultiple";
import info from '@/assets/vue-svg/info.svg';
import { getSmallImage } from "@/tools/tools";

export default {
  name: 'shift-report-details',
  props: {
    shiftId: Number,
    reportId: Number,
    activeAccounts: Array,
    value: Array,
  },
  components: {
    'custom-select': Select,
    'date-picker': DatePicker,
    TimeInput,
    SelectMultiple,
    info,
  },
  computed: {
    reportParameterGroups: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.workshift.report.create && !this.reportId;
    },
    workshiftReportTemplates() {
      return this.$store.state.dictionaries.workshiftReportTemplates;
    },
    report() {
      if (!this.reportId) return null;
      return this.$store.state.schedule.workshiftReports[this.reportId] || {};
    },
    templates() {
      return this.reportId ? this.report.group_responses : this.reportParameterGroups;
    },
    allAccounts() {
      return this.activeAccounts ? this.formatResources(this.activeAccounts) : [];
    },
  },
  watch: {
    workshiftReportTemplates: function (newTemplates) {
      if (this.reportId || this.reportParameterGroups.length) return;
      this.reportParameterGroups = newTemplates.map(group => ({
        ...group,
        parameters: group.parameters.map(parameter => ({...parameter})),
      }));
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchWorkshiftReportTemplates');
    if (this.reportId) this.$store.dispatch('schedule/fetchWorkshiftReport', this.reportId);
  },
  methods: {
    showSaveModal() {
      this.$bvModal.show('save_report_modal');
    },
    saveReport() {
      let result = {
        workshift: this.shiftId,
        group_responses: this.templates.map(group => ({
          template_group: group.id,
          parameters: group.parameters.map(parameter => ({
            template_answer: parameter.id,
            value: parameter.code === 'common_info_available_sites_count' ? this.activeAccounts.length.toString() :
                parameter.code === 'common_info_opened_sites_count' ? parameter.value.map(accounts => accounts[0].id).join(',') :
                parameter.type === 'range' ? parameter.value.toString() : parameter.value,
          })),
        })),
      };

      // console.log(result);
      this.$store.dispatch('schedule/createWorkshiftReport', result);
    },
    clickBack() {
      this.$emit('click-back');
    },
    editRangeParameter(changedParameter) {
      let parsedValue = parseInt(changedParameter.value),
          minValue = changedParameter.answers?.min || 100,
          maxValue = changedParameter.answers?.max || 200;

      changedParameter.value = isNaN(parsedValue) || (parsedValue < minValue) ? minValue :
          (parsedValue > maxValue ? maxValue : parsedValue);
    },
    formatResources(resources) {
      return resources.map(resource => ({
        ...resource,
        logoSmall: getSmallImage(resource.logotype),
      }));
    },
    getSmallImage(image) {
      return getSmallImage(image);
    },
  },
}
</script>