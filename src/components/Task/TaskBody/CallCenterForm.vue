<template>
  <div class="response-action_form">
    <div class="response-action_form-title">
      <p class="response-action_form-title-text">{{ task.status === 'completed' ? 'Отправлено в call-центр' : 'Отправить в call-центр' }}</p>
      <div v-if="!(task.type === 'call_center' && task.status === 'completed')" class="helper-close" @click="close"></div>
    </div>
    <div class="response-action_form-action_field">
      <div class="response-action_form-action_field-block-executor">
        <div class="response-action_form-action_field-block-icon glyphicon glyphicon-user"></div>
        <custom-select class="response-action_form-action_field-block-choice"
                       valueField="id"
                       titleField="fullname"
                       v-model="executor"
                       defaultText="Выберите исполнителя"
                       :options="users"
                       :setAvatar="true" />
      </div>
      <div class="response-action_form-action_field-date">
        <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"></div>
        <date-picker lang="ru"
                     type="datetime"
                     placeholder="Выберите дату"
                     input-class="form-control response-action_form-action_field-block-date"
                     v-model="datetime"
                     :time-picker-options="{ start: '09:00', step: '00:30', end: '19:00' }"
                     format="DD.MM.YYYY, HH:mm"
                     value-type="YYYY-MM-DDTHH:mm">
          <i slot="calendar-icon"></i>
        </date-picker>
      </div>
    </div>
    <div class="response-action_form-send_field" v-if="!(task.type === 'call_center' && task.status === 'completed')">
      <b-button size="md" variant="info" @click="send">Отправить в call-центр</b-button>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import DatePicker from "@/components/Common/Datepicker";

export default {
  props: {
    task: {
      type: Object,
      default: () => ({}),
    },
    users: Array,
    executor: Object,
    datetime: Object
  },
  components: {
    'custom-select': Select,
    'date-picker': DatePicker,
  },
  methods: {
    send() {
      this.$emit('send', { executor: this.executor, datetime: this.datetime });
    },
    close() {
      this.$emit('close');
    }
  }
}
</script>
