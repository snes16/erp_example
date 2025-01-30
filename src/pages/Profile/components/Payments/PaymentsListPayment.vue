<template>
  <div class="payment_list_item_body-wrapper" @click="onClick">
    <div class="payment_list_item_body-wrapper-inner_left">
      <circle-dollar-icon v-if="payment.type === 'salary'" class="payment_list_item_body-wrapper-inner_left-icon" />
      <girl-head-dollar-icon v-else class="payment_list_item_body-wrapper-inner_left-icon" />
      <div class="payment_list_item_body-wrapper-inner_left-content">
        <div class="payment_list_item_body-wrapper-inner_left-content-period_payment">{{ periodText }}</div>
        <div v-if="paymentMethodInfo" class="payment_list_item_body-wrapper-inner_left-content-payment_type">{{ paymentMethodInfo }}</div>
      </div>
    </div>
    <div class="payment_list_item_body-wrapper-inner_right">
      <span>$ {{ payment.sum }}</span>
      <paid-circle-icon class="payment_list_item_body-wrapper-inner_right-status" :class="{'-paid': payment.status === 'paid'}" />
    </div>
  </div>
</template>

<script>
import circleDollarIcon from '@/assets/vue-svg/circle-dollar.svg';
import girlHeadDollarIcon from '@/assets/vue-svg/girl-head-dollar-icon.svg';
import paidCircleIcon from '@/assets/vue-svg/paid-circle-icon.svg';
import moment from "moment";

export default {
  name: "payments-list-payment",
  props: {
    payment: Object,
  },
  components: {
    'circle-dollar-icon': circleDollarIcon,
    'girl-head-dollar-icon': girlHeadDollarIcon,
    'paid-circle-icon': paidCircleIcon,
  },
  data() {
    return {
      typesTitles: {
        'bank_card': 'Банковская карта',
        'cash': 'Наличные',
        'cryptocurrency': 'Кошелек',
        'other': 'Другие способы платежа',
      },
    }
  },
  computed: {
    periodText() {
      if (!this.payment.period?.from || !this.payment.period?.to) return '';
      return `${moment(this.payment.period.from).format('DD.MM.YYYY')}-${moment(this.payment.period.to).format('DD.MM.YYYY')}`;
    },
    paymentMethodInfo() {
      if (!(this.payment.payment_method?.type)) return '';
      let paramText;
      switch (this.payment.payment_method.type) {
        case 'bank_card':
          paramText = this.payment.payment_method.parameters.find(parameter => parameter.code === 'bank_number').value.replace(/(^[\d ]*)(\d{4}$)/g, (fullFind, replacedPart, savedPart) => `...${savedPart}`);
          break;
        case 'cash':
          paramText = this.payment.payment_method.parameters.find(parameter => parameter.code === 'currency').value;
          break;
        case 'cryptocurrency':
          paramText = this.payment.payment_method.parameters.find(parameter => parameter.code === 'crypto_address').value.replace(/(^[\d ]*)(\d{4}$)/g, (fullFind, replacedPart, savedPart) => `...${savedPart}`);
          break;
        default: return this.payment.payment_method.payment_resource_title;
      }
      return `${this.typesTitles[this.payment.payment_method.type]} ${paramText}`;
    },
  },
  methods: {
    onClick(e) {
      this.$emit('click', e);
    },
  },
}
</script>

