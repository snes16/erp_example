<template>
  <div class="card personal_operator-card">
    <div class="personal_operator-card-header pb-3">
      <div class="personal_operator-card-header-title">
        <h5 v-if="showMobile" class="m-0">Платежные данные</h5>
        <h3 v-else>Платежные данные</h3>
        <div v-if="paymentInfoLength" class="personal_operator-card-header-title-badge ml-2">
          {{ paymentInfoLength }}
        </div>
      </div>
      <div class="personal_operator-card-header-edit d-flex align-items-center"
           @click="editPaymentInfo">
        <div v-if="paymentInfoLength">
          <span class="payment_info-text-blue">Изменить</span>
          <pen class="mb-1"/>
        </div>
        <div v-else class="d-inline-flex">
          <span class="payment_info-text-blue">Добавить</span>
          <div class="btn-add"/>
        </div>
      </div>
    </div>
    <div v-if="mainTypePayment" class="personal_operator-card-payment">
      <div class="d-flex align-items-center">
        <b>{{ mainTypePayment.title }}</b>
      </div>
      <div class="personal_operator-card-payment-cell">Основной</div>
    </div>
    <div v-else class="personal_operator-card-body -empty">
      <b class="mb-2">Нет данных</b>
      <span>Добавьте платежные данные</span>
    </div>
  </div>
</template>
<script>
import pen from "@/assets/vue-svg/pen.svg";

export default {
  name: 'widget-payment-info',
  components: {pen},
  props: {
    profile: Object,
    userPermissions:  Object,
    showMobile: Boolean,
  },
  computed: {
    mainTypePayment() {
      return this.paymentResources?.find(resource => resource.id.toString() === this.profile?.payment_info?.find(type => type.is_main === true)?.parameters[0].value);
    },
    paymentInfoLength() {
      return this.profile.payment_info?.length;
    },
    paymentResources() {
      return this.$store.state.dictionaries.paymentResources;
    },
  },
  methods: {
    editPaymentInfo() {
      this.$emit('edit');
    }
  }
}
</script>