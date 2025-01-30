<template>
  <form class="payment_percentage_edit" @submit.prevent="editPersonalPercentages">
    <div class="theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" type="submit">Сохранить</b-button>
    </div>
    <div v-if="subheader" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="closeDrover">
        <i class="fa fa-angle-left"></i>
        <span>{{ subheader }}</span>
      </div>
    </div>
    <div class="theme-helper-content-main-body pt-0">
      <group-setting-payment-percentage v-model="changedPercentages"
                                        :settings-type="settingsType"
                                        id="personal"
                                        ref="percentages-personal"
                                        @clear="togglePersonalPercentages"
      />
    </div>
  </form>
</template>

<script>
import GroupSettingPaymentPercentage from "@/pages/Organization/Groups/components/GroupSettingPaymentPercentage";

export default {
  name: 'payment-percentages-edit',
  props: {
    percentages: Array,
    subheader: String,
    userId: Number,
    arePersonalSettingsActive: Boolean,
  },
  components: {
    GroupSettingPaymentPercentage,
  },
  data() {
    return {
      changedPercentages: [],
    }
  },
  computed: {
    settingsType() {
      return this.arePersonalSettingsActive ? 'personal' : 'group';
    },
  },
  watch: {
    percentages: function (newPercentages) {
      if (this.arePersonalSettingsActive) this.changedPercentages = newPercentages.map(percentage => ({...percentage}));
    },
  },
  created() {
    if (this.arePersonalSettingsActive) this.changedPercentages = this.percentages.map(percentage => ({...percentage}));
  },
  methods: {
    closeDrover() {
      this.$emit('close');
    },
    editPersonalPercentages() {
      if (!this.$refs['percentages-personal'].validate()) return;
      this.$store.dispatch('profile/editPersonalPercentages', {
        id: this.userId,
        data: {
          are_personal_settings_active: true,
          has_personal_settings: true,
          payment_percentages: this.changedPercentages.filter(percentage => percentage.amount_to).map(percentage => ({
            amount_to: parseFloat(percentage.amount_to),
            percent: parseFloat(percentage.percent),
          })),
        },
      });
    },
    togglePersonalPercentages() {
      this.$emit('togglePersonalPercentages');
    },
  }
}
</script>