<template>
  <div class="resource_guide">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/templates">Шаблоны</router-link>
      <span class="ml-1">> Шаблон отчета о смене</span>
    </p>
    <p class="resource_guide-title">Шаблон отчета о смене</p>
    <div class="resource_guide-tab_field">
      <div class="resource_guide-tab_field-tab">
        <b class="resource_guide-tab_field-tab-title">ГРУППА ПАРАМЕТРОВ</b>
      </div>
      <div v-for="template in workshiftReportTemplates" class="resource_guide-tab_field-tab" @click="showTemplateDetails(template)">
        <p class="resource_guide-tab_field-tab-title">{{ template.title }}</p>
      </div>
    </div>
    <helper contentClass="-paddingless">
      <workshift-report-template-details v-if="activeTemplate" :template-id="activeTemplate"/>
    </helper>
  </div>
</template>

<script>
import Helper from "@/components/Helper/Helper";
import WorkshiftReportTemplateDetails from "./WorkshiftReportTemplateDetails";
import { closeToast } from "@/tools/tools";

export default {
  name: 'workshift_report_templates',
  components: {
    Helper,
    WorkshiftReportTemplateDetails,
  },
  data() {
    return {
      activeTemplate: null,
    };
  },
  computed: {
    workshiftReportTemplates() {
      return this.$store.state.workshiftReportTemplates.workshiftReportTemplates;
    },
    status() {
      return this.$store.state.workshiftReportTemplates.status;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
  },
  watch: {
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.activeTemplate = null;
      }
    },
    status: function (newStatus, prevStatus) {
      if ((prevStatus === 'editing') && (newStatus === '')) {
        this.$toasted.success('Изменения сохранены', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: closeToast,
          },
        });
        this.$store.dispatch('layout/toggleHelper', false);
      }
    },
  },
  created() {
    this.$store.dispatch('workshiftReportTemplates/fetchWorkshiftReportTemplates');
  },
  methods: {
    showTemplateDetails(template) {
      this.activeTemplate = template.id;
      this.$store.dispatch('layout/toggleHelper', true);
    },
  },
}
</script>