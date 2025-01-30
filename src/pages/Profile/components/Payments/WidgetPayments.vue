<template>
  <div class="profile-main-card payments_widgets-wrapper">
    <div class="payments_widgets-top">
      <h2 class="payments_widgets-title">Финансы</h2>
    </div>
    <div class="payments_widgets-content" @scroll="onScrollPayments">
      <payments-list-item v-for="paymentsMonth in payments" :payments-month="paymentsMonth" @open-payment="openPayment" />
      <div v-if="(status === 'fetching-payments') || paymentsHeaders.hasNextPage"
           class="payments_widgets-content-throbber"
           ref="throbber"
      ><throbber class="throbber" /></div>
    </div>
  </div>
</template>

<script >
import PaymentsListItem from '@/pages/Profile/components/Payments/PaymentsListItem.vue';
import throbber from '@/assets/vue-svg/throbber.svg';

export default {
  name: "WidgetPayments",
  props: {
    userId: Number,
  },
  components: {
    PaymentsListItem,
    'throbber': throbber,
  },
  computed: {
    payments() {
      return this.$store.state.profile.payments;
    },
    paymentsHeaders() {
      return this.$store.state.profile.paymentsHeaders;
    },
    status() {
      return this.$store.state.profile.status;
    },
  },
  created() {
    this.$store.dispatch('profile/fetchPayments', {userId: this.userId});
  },
  methods: {
    openPayment(payment) {
      this.$emit('open-payment', payment);
    },
    onScrollPayments(e) {
      if ((this.status === 'fetching-payments') || (!this.paymentsHeaders.hasNextPage)) return;
      const containerParams = e.target.getBoundingClientRect(),
          throbberParams = this.$refs.throbber?.getBoundingClientRect();

      if (!containerParams || !throbberParams) return;

      if (throbberParams.top > containerParams.top + containerParams.height)
        this.$store.dispatch('profile/fetchPayments', {
          userId: this.userId,
          cursor: this.payments[this.payments.length - 1].month,
        });
    },
  },
}
</script>