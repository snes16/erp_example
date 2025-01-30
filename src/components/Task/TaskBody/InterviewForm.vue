<template>
  <div class="response-action_form">
    <div class="response-action_form-title">
      <p class="response-action_form-title-text">{{ task.status === 'completed' ? 'Назначено собеседование' : 'Назначить собеседование' }}</p>
      <div v-if="task.status !== 'completed'" class="helper-close" @click="$emit('close')"></div>
    </div>
    <div class="row">
      <div class="col-sm-6 col-xs-12">
        <b>Способ коммуникации</b>
      </div>
      <div class="col-sm-6 col-xs-12">
        <custom-select v-model="communication"
                       :options="communications"
                       :error="!communicationStatus"
                       valueField="id"
                       defaultText="Выберите способ"
                       required
                       @change="changeCommunication" />
      </div>
    </div>
    <div class="response-action_form-action_field">
      <div class="response-action_form-action_field-block">
        <template v-if="(task.result_author && task.type === 'call_center') || !nextUsers.length">
          <avatar class="mr-2"
                  :url="task.result_author && task.result_author.avatar"
                  is-large
                  :telegram="task.result_author && task.result_author.telegram_connected"
                  :is-fin-admin="task.result_author && task.result_author.is_fin_admin" />
          <p v-if="task.result_author && task.type === 'call_center'" class="response-action_form-action_field-block-executor">{{task.result_author.fullname}}</p>
          <p v-else class="response-action_form-action_field-block-executor">Исполнитель не назначен</p>
        </template>
        <custom-select v-else
                       class="response-action_form-action_field-block-choice response-task-parameters-title-executor-settings -icon"
                       valueField="id"
                       titleField="fullname"
                       v-model="executor"
                       defaultText="Выберите исполнителя"
                       :disabled="task.status === 'completed'"
                       :options="optionsNextCurrentUsersUpdated"
                       @change="setExecutor">
          <template v-slot:chosen-variant="props">
            <div class="d-flex align-items-center">
              <avatar class="mr-2" :url="props.value.avatar" is-large :telegram="props.value.telegram_connected" :is-fin-admin="props.value.is_fin_admin" />
              <span v-if="props.value && (props.value.uid || props.value.surname)">
                <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname }}</template>
                <template v-else>
                  <span class="text-gray mr-1">{{ props.value.uid }}</span>
                  <span>{{ props.value.surname }}</span>
                </template>
              </span>
              <span v-else>{{ props.shownText }}</span>
            </div>
          </template>
          <template v-slot:list-variant="props">
            <div class="response-task-parameters-title-executor-settings-setting">
              <avatar class="mr-2" :url="props.variant.avatar" is-large :telegram="props.variant.telegram_connected" :is-fin-admin="props.variant.is_fin_admin" />
              <div class="response-task-parameters-title-executor-settings-setting-item">
                <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>
                <template v-else>
                  <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                  <span>{{ props.variant.surname }}</span>
                </template>
                <template v-for="absence in props.variant.checkedAbsences" class="response-task-parameters-title-executor-settings-setting-item-absence">
                  <b class="text-gray mr-1">{{ absence }}</b>
                </template>
              </div>
            </div>
          </template>
        </custom-select>
      </div>
      <div class="response-action_form-action_field-date">
        <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"></div>
        <p class="response-action_form-action_field-block-result_date" v-if="task.result_date && task.type === 'call_center' && task.status === 'completed'">
          {{ formattedResultDate }}
        </p>
        <p class="response-action_form-action_field-block-result_date" v-else-if="!task.result_date && task.type === 'call_center' && task.status === 'completed'">
          Дата не назначена
        </p>
        <date-picker v-else
                     v-model="task.next_planned_start_at"
                     lang="ru"
                     type="datetime"
                     placeholder="Выберите дату"
                     :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
                     :time-picker-options="timePickerOptionsTask"
                     format="DD.MM.YYYY, HH:mm"
                     value-type="YYYY-MM-DDTHH:mm"
                     :disabled="task.status === 'completed'"
                     :marked-dates="busyDates"
                     @focus="focusField('next_planned_start_at')"
                     @open="updateBusyDates"
                     @calendar-change="updateBusyDates"
                     @change="setTimeWithExecutor">
          <i slot="calendar-icon"></i>
        </date-picker>
      </div>
    </div>
    <div class="response-action_form-send_field" v-if="task.status !== 'completed'">
      <b-button size="md" variant="primary" @click="send" :disabled="errorSendInterview">Назначить</b-button>
    </div>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import Select from "@/components/Common/Select/Select";
import DatePicker from "@/components/Common/Datepicker";
import {timePickerOptionsTask} from "@/components/Task/utils/CommonTaskUtils";
import moment from "moment";

export default {
  props: {
    task: Object,
    communications: Array,
    errorSendInterview: Boolean,
    shownErrors: Array,
    nextUsers: Array,
    busyDates: Array,
    taskPropCopy: Object
  },
  components:{
    'avatar': Avatar,
    'custom-select': Select,
    'date-picker': DatePicker,
  },
  computed: {
    timePickerOptionsTask() {
      return timePickerOptionsTask
    },
    formattedResultDate() {
      if (!this.taskPropCopy.result_date) return '';
      return moment.parseZone(this.taskPropCopy.result_date).format('DD.MM.YYYY, HH.mm');
    },
    optionsNextCurrentUsersUpdated() {
      if (!this.nextUsers.length) return []
      return this.nextUsers.map(user => {
        if (!user.id || !user.absences) return user
        user.checkedAbsences = this.isDayAbsence(moment(this.taskPropCopy.next_planned_start_at).format('YYYY-MM-DD'), user.absences)
        user.disabled = !!user.checkedAbsences
        return user
      })
    },
  },

  data() {
    return {
      communication: null,
      communicationStatus: true,
      executor: null,
    };
  },
  methods: {
    changeCommunication() {
      this.communicationStatus = !!this.communication;
    },
    setExecutor(id) {
      this.$emit('setExecutor',  id);
    },
    setTimeWithExecutor(time) {
      this.$emit('setTimeWithExecutor',  time);
    },
    send() {
      this.$emit('send', { communication: this.communication, executor: this.executor });
    },
    focusField(field) {
      this.$emit('focusField',  field);
    },
    updateBusyDates() {
      this.$emit('updateBusyDates');
    },
    isDayAbsence(day, absences) {
      if (!absences?.length) return false
      let absencesCurrentDay = absences.filter(absence => moment.parseZone(day).isBetween(moment.parseZone(absence.start_at), moment.parseZone(absence.end_at), undefined, '[]'))
      return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {return ` ${this.absenceTypes[absence.type]} ${moment.parseZone(absence.start_at).format('DD.MM')} - ${moment.parseZone(absence.end_at).format('DD.MM')} `}) : null
    },
  }
}
</script>
