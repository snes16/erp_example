<template>
  <div v-if="!profile.has_finished_registration && activeTab === 'schedule_and_finances'" class="personal_operator">
    <widget-survey :profile="profile" class="personal_operator-block -main"/>
  </div>
  <div v-else-if="profile.profile && activeTab === 'personal_data'" class="personal_operator">
    <widget-personal-data class="personal_operator-block -main"
                          :profile="profile"
                          :userPermissions="userPermissions"
                          :userId="userId"
                          :user-type="userType"
                          :is-my-profile="isMyProfile"
                          :show-mobile="showMobile"
                          is-model-personal
    />
    <widget-payment-info class="personal_operator-block -additional"
                         :profile="profile"
                         :show-mobile="showMobile"
                         :userPermissions="userPermissions"
                         @edit="editPaymentInfo"
    />
  </div>
  <div v-else-if="!profile.has_finished_registration && profile.profile && activeTab === 'schedule_and_finances'"
       class="personal_operator -main">
    <div class="personal_operator-block -main">
      <widget-personal-schedule
          v-if="!profile.profile.user.resign_date"
          :profile="profile"
          :user-permissions="userPermissions"
          :user-type="userType"
          :is-my-profile="isMyProfile"
          :user-id="userId"
          :show-status-point="showStatusPoint"
          :show-mobile="showMobile"
          @openScheduleFilling="openScheduleFilling"
      />
      <widget-inactivity v-else @goToMessagesTab="goToMessagesTab"/>
    </div>
    <div class="personal_operator-block -additional hidden-below_xl">
      <widget-payments :user-id="userId" @open-payment="openPayment"/>
    </div>
    <div class="personal_operator-block -profit hidden-below_xl">
      <widget-profit :user-id="userId" :ref-link="refLink" :show-mobile="showMobile"/>
    </div>
  </div>
  <div v-else-if="profile.profile && activeTab === 'profit' && !profile.has_finished_registration" class="personal_operator">
    <div class="personal_operator-block -main -fullscreen_mobile">
      <widget-profit :user-id="userId" :ref-link="refLink" :show-mobile="showMobile"/>
    </div>
  </div>
  <div v-else-if="profile.profile && activeTab === 'finances' && !profile.has_finished_registration" class="personal_operator">
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
import WidgetSurvey from "@/pages/Profile/components/Widgets/WidgetSurvey.vue";
import WidgetInactivity from "@/pages/Profile/components/Widgets/WidgetInactivity.vue";

export default {
  name: 'personal-model',
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
    'widget-survey': WidgetSurvey,
    'widget-inactivity': WidgetInactivity,
    'widget-personal-schedule': WidgetPersonalSchedule,
    'widget-profit': WidgetProfit,
    'widget-payments': WidgetPayments,
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
    openScheduleFilling(scheduleData) {
      this.$emit('openScheduleFilling', scheduleData);
    },
    openPayment(payment) {
      this.$emit('open-payment', payment);
    },
    openSupportChat() {
      this.$emit('open-support-chat');
    },
    goToMessagesTab() {
      this.$emit('goToMessagesTab');
    }
  }
}
</script>
