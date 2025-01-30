<template>
  <div class="payment_list_item-wrapper">
    <div v-b-toggle="`payments-month-${paymentsMonth.month}`" class="payment_list_item_top">
      <div class="d-flex align-items-center">
        <span class="payment_list_item_top-month">{{ monthTitle }}</span>
        <div class="payment_list_item_top-arrow" :class="{'-active': collapseStatus}">
          <i class="fa fa-angle-down" />
        </div>
      </div>
      <div class="payment_list_item_top-right">
        <div v-if="!collapseStatus || (paymentsMonth.payments.length > 1)" class="payment_list_item_top-wrapperSum">
          <span>$ {{ paymentsMonth.sum }}</span>
        </div>
      </div>
    </div>
    <b-collapse v-model="collapseStatus" :id="`payments-month-${paymentsMonth.month}`">
      <payments-list-payment v-for="payment in paymentsMonth.payments" :payment="payment" @click="onClickPayment(payment)" />
    </b-collapse>
  </div>
</template>

<script>
import PaymentsListPayment from "@/pages/Profile/components/Payments/PaymentsListPayment.vue";
import moment from "moment";

export default {
  name: "PaymentsListItem",
  props: {
    paymentsMonth: Object,
  },
  components: {
    PaymentsListPayment,
  },
  data() {
    return {
      collapseStatus: true,
    }
  },
  computed: {
    monthTitle() {
      if (!this.paymentsMonth.month) return '';
      const date = moment(this.paymentsMonth.month + '-01'),
          today = moment(),
          isCurrentYear = date.year() === today.year();

      return date.format(isCurrentYear ? 'MMMM' : 'MMMM, YYYY');
    },
  },
  methods: {
    onClickPayment(payment) {
      this.$emit('open-payment', payment.id);
    },
  },
}
</script>

