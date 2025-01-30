<template>
  <div class="d-flex">
    <div :id="id" class="d-flex align-items-center">
      <component :is="data.are_personal_settings_active ? 'percent-circled' : 'percent'" class="mr-2" @click="clickIcon"/>
      <template v-if="data.payment_percentages.length">
        <span>{{ data.payment_percentages[0].percent }}%</span>
        <span v-if="data.payment_percentages.length > 1"
              class="ml-1"
        >- {{ data.payment_percentages[data.payment_percentages.length - 1].percent }}%</span>
      </template>
    </div>
    <b-tooltip :target="id">
      <div class="px-2 py-1">
        <div v-if="!data.payment_percentages.length">Процент не указан</div>
        <template v-else>
          <div v-for="percentage in data.payment_percentages"
               class="d-flex align-items-center justify-content-between"
          >
            <b class="pr-4">До $ {{ percentage.amount_to }}</b>
            <span>{{ percentage.percent }}%</span>
          </div>
        </template>
        <div v-if="data.are_personal_settings_active" class="border-top mt-2 pt-2">Изменено администратором</div>
        <div v-else class="d-flex align-items-center text-left mt-2 pt-2 border-top border-gray-700">
          <span class="flag-icon mr-1" :class="`flag-icon-${data.group.flag || 'default'}`" :title="data.group.country"></span>
          <div>
            <p class="mb-0">{{ data.group.city }}</p>
            <p class="text-gray mb-0">{{ data.group.office }}</p>
          </div>
        </div>
      </div>
    </b-tooltip>
  </div>
</template>

<script>
import percent from "@/assets/vue-svg/percent.svg";
import percentCircled from "@/assets/vue-svg/percent-circled.svg";

export default {
  name: 'payment-percentages-info',
  props: {
    data: Object,
    id: {
      type: String,
      default: 'payment_percentages_info',
    }
  },
  components: {
    'percent': percent,
    'percent-circled': percentCircled,
  },
  methods: {
    clickIcon() {
      this.$emit('click-icon');
    }
  },
}
</script>