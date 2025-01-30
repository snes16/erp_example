<template>
  <div v-if="allShiftsNumber">
    <div :id="id" class="profile_main-card-header-title-badge -secondary ml-2">{{ shiftsNumbers.completed || 'Нет завершенных' }}</div>
    <b-tooltip :target="id"
               boundary="window"
               triggers="hover"
               placement="top"
               custom-class="solid"
    >
      <div class="profile_main-card-body-row-value-shifts_numbers">
        <div v-for="status in shiftStatusesOrder"
             v-if="shiftsNumbers[status]"
             class="d-flex justify-content-between align-items-center mb-2"
        >
                          <span class="profile_main-card-body-row-value-shifts_numbers-status cursor-pointer"
                                :class="`-${status}`"
                                @click="navigateToPastWorkshifts(status)"
                          >{{ shiftStatuses[status] }}</span>
          <span class="text-gray-text">{{ shiftsNumbers[status] }}</span>
        </div>
      </div>
    </b-tooltip>
  </div>
</template>

<script>
export default {
  name: 'shifts-numbers-badge',
  props: {
    shiftsNumbers: Object,
    id: String,
    fullname: String,
    group: Object,
  },
  data() {
    return {
      shiftStatusesOrder: ['process', 'completed', 'assigned', 'created', 'canceled'],
    }
  },
  computed: {
    allShiftsNumber() {
      if (!this.shiftsNumbers) return 0;
      return Object.values(this.shiftsNumbers).reduce((acc, number) => acc + number, 0);
    },
    shiftStatuses() {
      if (!this.shiftsNumbers) return {};
      return {
        process: 'В процессе',
        completed: this.shiftsNumbers.completed > 1 ? 'Завершены' : 'Завершена',
        assigned: this.shiftsNumbers.assigned > 1 ? 'Назначены' : 'Назначена',
        created: 'Резерв',
        canceled: this.shiftsNumbers.canceled > 1 ? 'Отменены' : 'Отменена',
      }
    },
  },
  methods: {
    navigateToPastWorkshifts(status) {
      this.$store.dispatch('schedule/setActiveInfo',
          {
            status: status,
            fullname: this.fullname,
            group: this.group,
            activeTab: 'past-workshift',
          });
      this.$router.push('/app/workshifts');
    },
  }
}
</script>