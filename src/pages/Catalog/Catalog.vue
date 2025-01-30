<template>
  <div class="resource_guide">
    <p class="resource_guide-title">Справочники</p>
    <div class="resource_guide-tab_field">
<!--      <router-link v-if="userPermissions.admin.paymentResource.view" class="resource_guide-tab_field-router" to="/app/catalog/paymentResources">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/paymentResources">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Справочник платёжных ресурсов</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.resource.view" class="resource_guide-tab_field-router" to="/app/catalog/resources">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/resources">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Справочник ресурсов</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.communication.view" class="resource_guide-tab_field-router" to="/app/catalog/communications">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/communications">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Способы коммуникации</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.cancellationReason.view" class="resource_guide-tab_field-router" to="/app/catalog/cancellation_reasons">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/cancellation_reasons">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Причины отказа</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.cancel.workshifts.view" class="resource_guide-tab_field-router" to="/app/catalog/cancel_workshift_reasons">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/cancel_workshift_reasons">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Причины отмены смен</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.credentialBlockingReason.view" class="resource_guide-tab_field-router" to="/app/catalog/acc_blocking_reasons">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/acc_blocking_reasons">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Причины блокировки аккаунта</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.resignReason.view" class="resource_guide-tab_field-router" to="/app/catalog/resign_reasons">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/resign_reasons">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Причины увольнения сотрудников</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.nationality.view" class="resource_guide-tab_field-router"-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router"
                   to="/app/catalog/nationality">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Национальность</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.postponementReason.view" class="resource_guide-tab_field-router" to="/app/catalog/postponement_reasons">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/postponement_reasons">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Причины переноса собеседования</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.jobDuty.view" class="resource_guide-tab_field-router" to="/app/catalog/job_duties">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/job_duties">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Должностные обязанности</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
<!--      <router-link v-if="userPermissions.admin.position.view" class="resource_guide-tab_field-router" to="/app/catalog/positions">-->
      <router-link v-if="isSuperAdmin" class="resource_guide-tab_field-router" to="/app/catalog/positions">
        <div class="resource_guide-tab_field-tab">
          <p class="resource_guide-tab_field-tab-title">Справочник должностей</p>
          <i class="fa fa-angle-right"></i>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>

export default {
  name: 'resource_guide',
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
  },
};
</script>
