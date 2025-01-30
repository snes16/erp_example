<template>
  <div class="card profile_main-card">
    <div class="profile_main-card-header d-block">
      <div class="d-flex align-start justify-content-between mb-1">
        <h3>Процент заработка</h3>
        <div v-if="editPermission && !(percentagesData.has_personal_settings && !percentagesData.are_personal_settings_active)"
             class="profile_main-card-header-edit d-flex align-items-center"
             @click="editPercentages"
        >
          <span>Изменить</span>
          <pen/>
        </div>
      </div>
      <div class="d-flex align-start justify-content-between">
        <div>
          <p class="mb-0">
            <template v-if="percentagesData.are_personal_settings_active">Изменено администратором</template>
            <template v-else>Согласно настройкам группы</template>
          </p>
          <div class="d-flex align-items-center" :class="{'filter-grayscale': percentagesData.are_personal_settings_active}">
            <i class="flag-icon mr-1" :class="`flag-icon-${percentagesData.group.flag || 'default'}`" :title="percentagesData.group.country"/>
            <span class="text-gray mr-1">{{ percentagesData.group.city }}</span>
            <span>{{ percentagesData.group.office }}</span>
          </div>
        </div>
        <div v-if="percentagesData.has_personal_settings" class="custom-control custom-switch" @click.prevent="togglePersonalPercentages">
          <input :checked="percentagesData.are_personal_settings_active"
                 type="checkbox"
                 class="custom-control-input"
                 id="percentages_is_personal"
                 :disabled="!editPermission"
          >
          <label class="custom-control-label custom-control-label-stylization" for="percentages_is_personal"></label>
        </div>
      </div>
    </div>
    <div v-if="percentagesData.payment_percentages.length" class="profile_main-card-body">
      <div v-for="percentage in percentagesData.payment_percentages" class="profile_main-card-body-row">
        <div class="profile_main-card-body-row-title">
          <b>Заработок до $ {{ percentage.amount_to }}</b>
        </div>
        <div class="profile_main-card-body-row-value">
          <span>{{ percentage.percent }}%</span>
        </div>
      </div>
    </div>
    <div v-else class="profile_main-card-body -empty">
      <b class="mb-2">Нет данных о проценте заработка</b>
      <p v-if="editPermission">Добавьте данные</p>
    </div>
  </div>
</template>

<script>
import pen from "@/assets/vue-svg/pen.svg";

export default {
  name: 'payment-percentages',
  props: {
    percentagesData: Object,
    editPermission: Boolean,
    userId: Number,
  },
  components: {
    'pen': pen,
  },
  computed: {
  },
  methods: {
    editPercentages() {
      this.$emit('edit');
    },
    togglePersonalPercentages() {
      this.$store.dispatch('profile/editPersonalPercentages', {
        id: this.userId,
        data: {
          are_personal_settings_active: !this.percentagesData.are_personal_settings_active,
        },
      });
    },
  },
}
</script>