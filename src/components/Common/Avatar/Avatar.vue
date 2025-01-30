<template>
  <div class="avatar-wrap" :class="size">
    <div :style="url ? `background-image: url(${formattedUrl}); background-size: cover;` : ''"
         class="avatar"
         :class="{'-alt': hasAltDefaultPic}"
    ></div>
    <div v-if="telegram"
         class="avatar-icon -telegram"
         v-b-tooltip.hover.bottom
         title="Уведомления подключены"
    >
      <telegram/>
    </div>
    <div v-else-if="showInactiveTelegramIcon"
         class="avatar-icon -telegram -inactive"
         v-b-tooltip.hover.bottom
         title="Уведомления отключены"
    >
      <telegram/>
    </div>
    <div v-if="isFinAdmin"
         class="avatar-icon -fin_admin"
         v-b-tooltip.hover.bottom
         title="Имеет доступ к фин. системе"
    >
      <dollar-in-circle/>
    </div>
    <div v-if="absences && absences.length" class="avatar-icon -is_absent" :class="{'-telegram_exist': telegram}">
      <absence-circled class="cursor-pointer" :id="`avatar-${generatedId}`" />
      <b-tooltip :target="`avatar-${generatedId}`" class="free_operators-block-content-row-col-tooltip" triggers="hover" placement="bottomright">
        <div v-for="absence in formattedAbsences" :key="absence.id" class="free_operators-block-content-row-col-tooltip-block">
          <div v-for="type in Object.keys(absenceTypes)" :key="type" v-if="absence.type === type">
            <span>{{ absenceTypes[type] }} {{ absence.start_at }} - {{ absence.end_at }}</span>
          </div>
        </div>
      </b-tooltip>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import telegram from "@/assets/vue-svg/telegram.svg";
import dollarInCircle from "@/assets/vue-svg/dollar-in-circle.svg";
import absenceCircled from "@/assets/vue-svg/absence-circled.svg";
import moment from 'moment';
import { getSmallImage } from "@/tools/tools";

export default {
  name: "avatar",
  props: {
    url: String,
    telegram: Boolean,
    size: String,
    isLarge: Boolean,
    showInactiveTelegramIcon: Boolean,
    isFinAdmin: Boolean,
    absences: {
      type: Array,
      default: () => [],
    },
    hasAltDefaultPic: Boolean,
  },
  components: {
    'telegram': telegram,
    'dollar-in-circle': dollarInCircle,
    'absence-circled': absenceCircled,
  },
  data() {
    return {
      absenceTypes: {
        vacation: 'Отпуск',
        sick_leave: 'Больничный',
        absence: 'Отгул'
      },
      generatedId: null,
    };
  },
  computed: {
    formattedUrl() {
      if (this.isLarge) return getSmallImage(this.url);
      return this.url;
    },
    formattedAbsences() {
      return this.absences.map(absence => ({
        ...absence,
        start_at: moment.utc(absence.start_at).format('DD.MM'),
        end_at: moment.utc(absence.end_at).format('DD.MM')
      }));
    },
  },
  created() {
    this.generatedId = this.$store.state.utility.currentId;
    this.$store.dispatch('utility/incrementIndex');
  },
};
</script>

