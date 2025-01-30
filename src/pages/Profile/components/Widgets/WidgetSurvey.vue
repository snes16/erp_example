<template>
  <div class="card personal_operator-card -survey">
    <div class="personal_operator-card-header">
      <div>
        <h3>Анкета</h3>
        <span class="text-gray text-fw-400 text-lh-24">{{headerSubText}}</span>
      </div>
      <span class="text-gray text-lh-24">
        Шаг {{ stepCount }} из 3
      </span>
    </div>
    <div class="personal_operator-card-body">
      <div v-if="stepCount === 1" class="row align-items-center pt-4">
        <template v-for="parameter in currentParameters">
          <div class="col-sm-6 col-xs-12 mb-4">
            <b>{{ parameter.title }}</b>
          </div>
          <div class="col-sm-6 col-xs-12 mb-4 pl-1">
            <input
                v-if="parameter.type === 'text'"
                class="response-info_data-field-input"
                placeholder="Введите значение"
                v-model="parameter.value"
                @change="editParameter(parameter)"
            />
            <date-picker
                v-else-if="parameter.type === 'date'"
                v-model="parameter.value"
                class="datepicker-plain response-info_data-field-input"
                lang="ru"
                input-class="input-plain"
                placeholder="Выберите дату"
                :clearable="false"
                format="DD.MM.YYYY"
                value-type="YYYY-MM-DD"
                :input-attr="{ required: true }"
                @change="editParameter(parameter)"
            >
              <i style="display: none;" slot="calendar-icon" />
            </date-picker>
            <custom-select
                v-else-if="parameter.type === 'choice'"
                class="response-info_data-field-submit response-info_data-field-input -editable_fields"
                valueField="value"
                titleField="value"
                defaultText="Выберите вариант"
                :options="parameter.answers"
                v-model="parameter.value"
                @change="editParameter(parameter)"
            />
            <div v-else-if="parameter.type === 'range'" class="widget_survey-body-field-range">
              <div class="response-info_data-field-range-input">
                <input v-model="parameter.value"
                       class="form-control"
                       @change="editParameter(parameter)"
                />
              </div>
              <div class="response-info_data-field-range-slider w-100 p-0">
                <input v-model="parameter.value"
                       type="range"
                       class="input-range"
                       :max="parameter.answers.maxValue"
                       :min="parameter.answers.minValue"
                       @change="editParameter(parameter)"
                />
                <span class="response-info_data-field-range-slider-min">{{ parameter.answers.minValue }}</span>
                <span class="response-info_data-field-range-slider-max">{{ parameter.answers.maxValue }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="stepCount === 2">
        <files-upload v-model="resultFiles"
                      :albums="albums"
                      is-model-personal
        />
      </div>
      <div v-if="stepCount === 3">
        <span class="text-fw-400">Спасибо, ваши данные отправлены. Подождите пока пройдет проверка.</span>
      </div>
      <b-button v-if="stepCount !== 3"
                variant="primary"
                size="md"
                class="widget_survey-body-btn"
                @click="nextStep">
        {{ buttonText }}
      </b-button>
    </div>
  </div>
</template>
<script>
import PhoneNumberInput from "@/components/Common/PhoneNumberInput.vue";
import moment from "moment";
import Select from "@/components/Common/Select/Select";
import DatePicker from "vue2-datepicker";
import EmailField from "@/components/Common/EmailField.vue";
import FilesUpload from "@/pages/Tasks/components/FilesUpload";

export default {
  name: 'widget-survey',
  components: {
    'files-upload': FilesUpload,
    'date-picker': DatePicker,
    'custom-select': Select,
    PhoneNumberInput,
    EmailField,
  },
  props: {
    profile: Object,
    userPermissions: Object,
    userId: Number,
    userType: String,
    isMyProfile: Boolean,
    isOperatorPersonal: Boolean,
    isModelPersonal: Boolean,
    showMobile: Boolean,
  },
  data() {
    return {
      resultFiles: {},
      moment: moment,
      materialsSendData: {},
      surveySendData: {},
    }
  },
  computed: {
    stepCount() {
      return this.profile.has_worksheet + this.profile.has_materials + this.profile.has_finished_registration + 1;
    },
    buttonText() {
      return this.stepCount === 2 ? 'Отправить форму' : 'Продолжить';
    },
    headerSubText() {
      switch (this.stepCount) {
        case 1:
          return 'Для регистрации заполните данные анкеты';
        case 2:
          return 'Загрузите фото';
        case 3:
          return 'Идет проверка';
      }
      return '';
    },
    groupParameters() {
      return this.$store.state.groupparameters.groupParameters;
    },
    currentParameters() {
      return this.groupParameters[0]?.parameters;
    },
    albums() {
      return this.$store.state.profile.albums?.first_album;
    },
    editPermission() {
      return this.userPermissions[this.userType].profile.personal.edit;
    },
  },
  created() {
    this.$store.dispatch('tasks/getRequiredAttachmentsForInterviewTasks');
    this.$store.dispatch('groupparameters/fetchGroupParameters');
    this.$store.dispatch('profile/fetchAlbums');
  },
  methods: {
    editParameter() {

    },
    nextStep() {
      switch (this.stepCount) {
        case 1:
          this.$store.dispatch('profile/sendModelSurvey');
              break;
        case 2:
          this.$store.dispatch('profile/sendModelMaterials')
      }
    },
  }
}
</script>
