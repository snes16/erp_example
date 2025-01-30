<template>
  <div v-if="profile.profile && activeTab === 'personal_data'" class="personal_operator">
    <widget-personal-data class="personal_operator-block -main"
                          :profile="profile"
                          :userPermissions="userPermissions"
                          :userId="userId"
                          :user-type="userType"
                          :is-my-profile="isMyProfile"
                          isOperatorPersonal
    />
    <widget-payment-info class="personal_operator-block -additional"
                         :profile="profile"
                         :userPermissions="userPermissions"
                         @edit="editPaymentInfo"
    />
  </div>
  <div v-else-if="profile.profile && activeTab === 'schedule_and_finances'" class="personal_operator -main">
    <div class="personal_operator-block -main -operator_schedule">
      <widget-personal-schedule
          :profile="profile"
          :user-permissions="userPermissions"
          :user-type="userType"
          :is-my-profile="isMyProfile"
          :user-id="userId"
          :show-mobile="showMobile"
          :show-status-point="showStatusPoint"
          @openIncomeDetails="openIncomeDetails"
      />
    </div>
    <div class="personal_operator-block -additional hidden-below_xl">
      <widget-payments :user-id="userId" @open-payment="openPayment"/>
    </div>
    <div class="personal_operator-block -profit hidden-below_xl">
      <widget-profit :user-id="userId" :ref-link="refLink"/>
    </div>
  </div>
  <div v-else-if="profile.profile && activeTab === 'profit'" class="personal_operator">
    <div class="personal_operator-block -main -fullscreen_mobile">
      <widget-profit :user-id="userId" :ref-link="refLink"/>
    </div>
  </div>
  <div v-else-if="profile.profile && activeTab === 'finances'" class="personal_operator">
    <div class="personal_operator-block -main -fullscreen_mobile">
      <widget-payments :user-id="userId" @open-payment="openPayment"/>
    </div>
  </div>
  <div v-else-if="profile.profile && activeTab === 'support'" class="personal_operator">
    <div class="personal_operator-block -main -fullscreen">
      <widget-support :user-id="userId" @open-support-chat="openSupportChat"/>
    </div>
  </div>
</template>

<script>
import WidgetProfit from "../Widgets/WidgetProfit.vue";
import WidgetFine from "../Widgets/WidgetFine.vue";
import WidgetPaymentInfo from "../Widgets/WidgetPaymentInfo.vue";
import WidgetPersonalData from "../Widgets/WidgetPersonalData.vue";
import WidgetPersonalSchedule from "@/pages/Profile/components/Widgets/WidgetPersonalSchedule.vue";
import WidgetPayments from "@/pages/Profile/components/Payments/WidgetPayments.vue";
import WidgetSupport from "@/pages/Profile/components/Support/WidgetSupport.vue";

export default {
  name: 'personal-operator',
  props: {
    profile: Object,
    activeTab: String,
    userPermissions: Object,
    userId: Number,
    userType: String,
    isMyProfile: Boolean,
    isHasDuplicate: Boolean,
    showMobile: Boolean,
    showStatusPoint: Boolean,
    refLink: String,
  },
  components: {
    'widget-payments': WidgetPayments,
    'widget-personal-schedule': WidgetPersonalSchedule,
    'widget-profit': WidgetProfit,
    'widget-fine': WidgetFine,
    'widget-payment-info': WidgetPaymentInfo,
    'widget-personal-data': WidgetPersonalData,
    WidgetSupport,
  },
  methods: {
    editPaymentInfo() {
      this.$emit('editPaymentInfo');
    },
    openFineDetails(fine) {
      this.$emit('fineDetails', fine);
    },
    openIncomeDetails(shiftId) {
      this.$emit('openIncomeDetails', shiftId);
    },
    openPayment(payment) {
      this.$emit('open-payment', payment);
    },
    openSupportChat() {
      this.$emit('open-support-chat');
    },
  }
}
</script>
