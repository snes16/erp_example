<template>
  <div class="workshifts-edit-main-datepicker">
    <div class="workshifts-edit-main-datepicker-border"/>
    <div class="workshifts-edit-main-datepicker-prev" @click="subtractDate"><i class="fa fa-angle-left"></i></div>
    <div class="workshifts-edit-main-datepicker-current">
      <span class="workshifts-edit-main-datepicker-current-icon glyphicon glyphicon-glyph-calendar mr-2"></span>
      <b class="workshifts-edit-main-datepicker-current-text">{{ formattedDate }}</b>
      <date-picker :value="value"
                   type="date"
                   :clearable="false"
                   input-class="input-plain workshifts-edit-main-datepicker-current-date"
                   lang="ru"
                   :format="formattedDate"
                   :editable="false"
                   @change="changeDate"
      >
        <template slot="header">
          <div v-if="showTypePicker" class="workshifts-filters-main-date">
            <div class="workshifts-filters-main-date-format" :class="activeTab.date_type === 'day' ? '-active' : ''" @click="changeDateType('day')">День</div>
            <div class="workshifts-filters-main-date-format" :class="activeTab.date_type === 'week' ? '-active' : ''" @click="changeDateType('week')">Неделя</div>
          </div>
        </template>
        <span slot="calendar-icon" class="workshifts-edit-main-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
      </date-picker>
      <calendar class="workshifts-edit-main-datepicker-current-mobile_icon"/>
    </div>
    <div class="workshifts-edit-main-datepicker-next" @click="addDate"><i class="fa fa-angle-right"></i></div>
  </div>
</template>

<script>
import moment from "moment";
import DatePicker from 'vue2-datepicker';
import calendar from "@/assets/vue-svg/calendar_mobile.svg";

export default {
  name: "DateScrollType",
  components: {
    'date-picker': DatePicker,
    'calendar': calendar,
  },
  props: {
    value: String,
    showTypePicker: Boolean,
    type: String,
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    activeTab() {
      return this.$store.state.schedule.activeTab;
    },
    activeTabId() {
      return this.$store.state.schedule.activeTabId;
    },
    formattedDate() {
      let date = moment(this.value);
      switch (this.type) {
        case 'day':
          return date.format('dd, DD.MM.YYYY')
        case 'week':
          if (date.weekday() !== 6) date.weekday(-1);
          let text = date.format('DD.MM.YYYY');
          date.add(6, 'd');
          return `${text} - ${date.format('DD.MM.YYYY')}`
      }
    },
  },
  methods: {
    changeDate(date = this.value) {
      this.$emit('change', moment(date).format('YYYY-MM-DD'));
    },
    changeDateType(type) {
      this.$store.dispatch('schedule/editWorkshiftTab', {
        id: this.activeTabId,
        tab: {date_type: type}
      });
      this.$store.dispatch('schedule/saveActiveTab', {
        id: this.activeTabId,
        tab: {date_type: type}
      });
    },
    addDate() {
      let date = moment(this.value);
      switch (this.type) {
        case 'day':
          date.add(1, 'd');
          break;
        case 'week':
          date.add(7, 'd');
          break;
      }
      this.changeDate(date.format('YYYY-MM-DD'));
    },
    subtractDate() {
      let date = moment(this.value);
      switch (this.type) {
        case 'day':
          date.subtract(1, 'd');
          break;
        case 'week':
          date.subtract(7, 'd');
          break;
      }
      this.changeDate(date.format('YYYY-MM-DD'));
    },
  }
}
</script>