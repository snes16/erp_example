<template>
  <div class="payment_details">
    <div class="theme-helper-content-main-header payment_details-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="payment_details-body">
      <div class="payment_details-body-main">
        <circle-dollar-icon v-if="payment.type === 'salary'" class="payment_details-body-main-icon" />
        <girl-head-dollar-icon v-else class="payment_details-body-main-icon" />
        <div class="payment_details-body-main-info">
          <div class="payment_details-body-main-info-sum">
            <b>${{ payment.sum }}</b>
            <paid-circle-icon class="payment_list_item_body-wrapper-inner_right-status" :class="{'-paid': payment.status === 'paid'}" />
          </div>
          <p class="mb-0">{{ paymentTypeTitles[payment.type] }}</p>
        </div>
      </div>
      <div class="payment_details-body-additional">
        <div v-if="payment.payment_method" class="payment_details-body-additional-block">
          <div class="payment_details-body-additional-block-title" @click="toggleCollapse('infoCollapseStatus')">
            <div class="d-flex align-items-center">
              <h4 class="mb-0">Подробности</h4>
              <div class="payment_list_item_top-arrow ml-2 hidden-above_md" :class="{'-active': infoCollapseStatus}">
                <i class="fa fa-angle-down" />
              </div>
            </div>
            <div class="payment_list_item_top-arrow hidden-below_md" :class="{'-active': infoCollapseStatus}">
              <i class="fa fa-angle-down" />
            </div>
          </div>
          <b-collapse v-model="infoCollapseStatus">
            <div class="row mb-4">
              <div class="col-sm-5 col-12">
                <b>Способ получения</b>
              </div>
              <div class="col-sm-7 col-12">
                <div class="d-flex align-items-center">
                  <span class="mr-2">{{ paymentMethodInfo }}</span>
                  <avatar v-if="(payment.payment_method.type === 'bank_card') || (payment.payment_method.type === 'cryptocurrency')"
                          :url="payment.payment_method.logo"
                          size="sm"
                          hasAltDefaultPic
                  />
                </div>
              </div>
            </div>
            <div class="row mb-4">
              <div class="col-sm-5 col-12">
                <b>Период</b>
              </div>
              <div class="col-sm-7 col-12">
                <span>{{ periodText }}</span>
              </div>
            </div>
            <div v-if="formattedPaymentDate" class="row mb-4">
              <div class="col-sm-5 col-12">
                <b>Дата зачисления</b>
              </div>
              <div class="col-sm-7 col-12">
                <span>{{ formattedPaymentDate }}</span>
              </div>
            </div>
            <div v-if="payment.payment_percentage" class="row mb-4">
              <div class="col-sm-5 col-12">
                <b>Процент дохода</b>
              </div>
              <div class="col-sm-7 col-12">
                <span>{{ payment.payment_percentage }}%</span>
              </div>
            </div>
          </b-collapse>
        </div>
        <div class="payment_details-body-additional-block">
          <div class="payment_details-body-additional-block-title" @click="toggleCollapse('sourcesCollapseStatus')">
            <div class="payment_details-body-additional-block-row">
              <div class="d-flex align-items-center">
                <h4 class="mb-0">Источники</h4>
                <div class="payment_list_item_top-arrow ml-2 hidden-above_md" :class="{'-active': sourcesCollapseStatus}">
                  <i class="fa fa-angle-down" />
                </div>
              </div>
              <b>${{ earningsSum }}</b>
            </div>
            <div class="payment_list_item_top-arrow hidden-below_md" :class="{'-active': sourcesCollapseStatus}">
              <i class="fa fa-angle-down" />
            </div>
          </div>
          <b-collapse v-model="sourcesCollapseStatus" class="payment_details-body-additional-block-container">
            <div v-for="source in sources" class="payment_details-body-additional-block-row mb-4">
              <div class="d-flex align-items-center">
                <avatar v-if="areSourcesResources" :url="source.icon" size="sm" hasAltDefaultPic />
                <at v-else />
                <b class="ml-2">{{ areSourcesResources ? source.short_title : source.nickname }}</b>
              </div>
              <span>${{ source.sum }}</span>
            </div>
          </b-collapse>
        </div>
        <div v-if="payment.fines && payment.fines.length" class="payment_details-body-additional-block">
          <div class="payment_details-body-additional-block-title" @click="toggleCollapse('finesCollapseStatus')">
            <div class="payment_details-body-additional-block-row">
              <div class="d-flex align-items-center">
                <h4 class="mb-0">Штрафы</h4>
                <div class="payment_list_item_top-arrow ml-2 hidden-above_md" :class="{'-active': finesCollapseStatus}">
                  <i class="fa fa-angle-down" />
                </div>
              </div>
              <span>-${{ finesSum }}</span>
            </div>
            <div class="payment_list_item_top-arrow hidden-below_md" :class="{'-active': finesCollapseStatus}">
              <i class="fa fa-angle-down" />
            </div>
          </div>
          <b-collapse v-model="finesCollapseStatus" class="payment_details-body-additional-block-container">
            <div v-for="fine in payment.fines" class="payment_details-body-additional-block-row mb-4">
              <p class="mb-0">-{{ fine.reason }}</p>
              <span>-${{ fine.sum }}</span>
            </div>
          </b-collapse>
        </div>
        <div v-if="payment.bonuses && payment.bonuses.length" class="payment_details-body-additional-block">
          <div class="payment_details-body-additional-block-title" @click="toggleCollapse('bonusesCollapseStatus')">
            <div class="payment_details-body-additional-block-row">
              <div class="d-flex align-items-center">
                <h4 class="mb-0">Бонусы</h4>
                <div class="payment_list_item_top-arrow ml-2 hidden-above_md" :class="{'-active': bonusesCollapseStatus}">
                  <i class="fa fa-angle-down" />
                </div>
              </div>
              <span>+${{ bonusesSum }}</span>
            </div>
            <div class="payment_list_item_top-arrow hidden-below_md" :class="{'-active': bonusesCollapseStatus}">
              <i class="fa fa-angle-down" />
            </div>
          </div>
          <b-collapse v-model="bonusesCollapseStatus" class="payment_details-body-additional-block-container">
            <div v-for="bonus in payment.bonuses" class="payment_details-body-additional-block-row mb-4">
              <p class="mb-0">+{{ bonus.reason }}</p>
              <span>+${{ bonus.sum }}</span>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import circleDollarIcon from '@/assets/vue-svg/circle-dollar.svg';
import girlHeadDollarIcon from '@/assets/vue-svg/girl-head-dollar-icon.svg';
import paidCircleIcon from '@/assets/vue-svg/paid-circle-icon.svg';
import at from "@/assets/vue-svg/at.svg";
import moment from "moment";
import { getRoundAmount } from "@/tools/tools";

export default {
  name: 'PaymentDetails',
  props: {
    paymentId: String,
    userType: String,
  },
  components: {
    Avatar,
    'circle-dollar-icon': circleDollarIcon,
    'girl-head-dollar-icon': girlHeadDollarIcon,
    'paid-circle-icon': paidCircleIcon,
    'at': at,
  },
  data() {
    return {
      paymentTypeTitles: {
        'salary': 'заработная плата',
        'referal': 'рефферальные начисления',
      },
      infoCollapseStatus: true,
      sourcesCollapseStatus: true,
      bonusesCollapseStatus: true,
      finesCollapseStatus: true,
      typesTitles: {
        'bank_card': 'Банковская карта',
        'cash': 'Наличные',
        'cryptocurrency': 'Кошелек',
        'other': 'Другие способы платежа',
      },
    }
  },
  computed: {
    payment() {
      if (this.$store.state.profile.payment?.id !== this.paymentId) return {};
      return this.$store.state.profile.payment;
    },
    status() {
      return this.$store.state.profile.status;
    },
    title() {
      if (this.payment.status === 'paid') return 'Выплачено';
      return 'К выплате';
    },
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
    formattedPaymentDate() {
      if (!this.payment.payment_date) return '';
      return moment(this.payment.payment_date).format('DD.MM.YYYY HH:mm');
    },
    areSourcesResources() {
      return (this.userType === 'model') && (this.payment.type === 'salary');
    },
    sources() {
      if (this.areSourcesResources) return this.payment.resources;
      return this.payment.users;
    },
    earningsSum() {
      if (!this.sources) return 0;
      return getRoundAmount(this.sources.reduce((sum, user) => sum + user.sum, 0));
    },
    finesSum() {
      if (!this.payment.fines?.length) return 0;
      return getRoundAmount(this.payment.fines.reduce((sum, user) => sum + user.sum, 0));
    },
    bonusesSum() {
      if (!this.payment.bonuses?.length) return 0;
      return getRoundAmount(this.payment.bonuses.reduce((sum, user) => sum + user.sum, 0));
    },
  },
  created() {
    this.$store.dispatch('profile/fetchPayment', this.paymentId);
  },
  methods: {
    toggleCollapse(collapseStatus) {
      this[collapseStatus] = !this[collapseStatus];
    },
  },
}
</script>