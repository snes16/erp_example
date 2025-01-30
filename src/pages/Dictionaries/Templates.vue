<template>
  <div class="resource_guide">
    <p class="resource_guide-title">Шаблоны</p>
    <div class="resource_guide-tab_field mb-3">
<!--      <div v-if="userPermissions.admin.dossier.view" class="resource_guide-tab_field-router" @click="switchToggle">-->
      <div v-if="isSuperAdmin" class="resource_guide-tab_field-router" @click="switchToggle">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Шаблон досье модели</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </div>
<!--      <router-link v-if="userPermissions.admin.templateWorkshiftReport.view" class="resource_guide-tab_field-router" to="/app/templates/workshift_report_templates">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/templates/workshift_report_templates">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Шаблон отчета о смене</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.response.view" class="resource_guide-tab_field-router" to="/app/templates/group_parameters">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/templates/group_parameters">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Шаблон анкеты для заявки</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/templates/payment_info_templates">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Шаблоны платёжных данных</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
    </div>
    <Helper>
      <DossierTemplateCreation v-if="droverOpened" :permission="userPermissions.admin.dossier.edit"/>
    </Helper>
  </div>
</template>

<script>
import Helper from '@/components/Helper/Helper.vue';
import DossierTemplateCreation from '@/pages/Catalog/DossierTemplateCreation/DossierTemplateCreation.vue';

export default {
  name: 'resource_guide',
  components: {Helper, DossierTemplateCreation},
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    droverOpened() {
      return this.$store.state.layout.helperOpened;
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
  },
  methods: {
    switchToggle() {
      this.$store.dispatch('layout/toggleHelper', true);
    }
  }
};
</script>