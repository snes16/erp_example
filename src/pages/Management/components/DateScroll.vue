<template>
  <div class="management-week_scroll">
    <div v-if="type !== 'all'" class="management-week_scroll-datepicker">
      <div class="management-week_scroll-datepicker-prev" @click="subtractDate"><i class="fa fa-angle-left"></i>
      </div>
      <div class="management-week_scroll-datepicker-current">
        <span v-if="showIcon" class="management-week_scroll-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
        <span class="management-week_scroll-datepicker-current-text" :class="{'-bold': bold}">{{ formattedDate }}</span>
      </div>
      <div class="management-week_scroll-datepicker-next" @click="addDate"><i class="fa fa-angle-right"></i></div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
name: "DateScroll",
  props: {
    value: String,
    type: {
      type: String,
      default: 'week'
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    bold: {
      type: Boolean,
      default: false
    },
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    formattedDate() {
      let date = moment(this.value);
      switch (this.type) {
        case 'day':
          return date.format('dddd, DD.MM.YYYY')
        case 'week':
          if (date.weekday() !== 6) date.weekday(-1);
          let text = date.format('DD.MM.YYYY');
          date.add(6, 'd');
          return `${text} - ${date.format('DD.MM.YYYY')}`
        case 'month':
          return date.format('MMMM, YYYY')
        case 'year':
          return date.format('YYYY')
      }
    },
  },
  methods: {
    changeDate(date) {
      this.$emit('change', date);
    },
    addDate() {
      let date = moment(this.value);
      this.$emit('beforeChange', date.format('YYYY-MM-DD'));
      switch (this.type) {
        case 'day':
          date.add(1, 'd');
          break;
        case 'week':
          date.add(7, 'd');
          break;
        case 'month':
          date.add(1, 'months');
          break;
        case 'year':
          date.add(1, 'y');
          break;
      }
      this.changeDate(date.format('YYYY-MM-DD'));
    },
    subtractDate() {
      let date = moment(this.value);
      this.$emit('beforeChange', date.format('YYYY-MM-DD'));
      switch (this.type) {
        case 'day':
          date.subtract(1, 'd');
          break;
        case 'week':
          date.subtract(7, 'd');
          break;
        case 'month':
          date.subtract(1, 'months');
          break;
        case 'year':
          date.subtract(1, 'y');
          break;
      }
      this.changeDate(date.format('YYYY-MM-DD'));
    },
  }
}
</script>