<template>
  <b-form class="dossier" @submit.prevent="checkTab()">
    <div v-if="dossierStatus !== 'dossier-added' && dossierStatus !== 'dossier-not-saved'" class="dossier-field">
      <p class="dossier-title">Анкета</p>
      <div class="dossier-field-block">
        <div class="dossier-field-block-title">Для отправления анкеты заполните все шаги</div>
        <div class='dossier-field-block-buttons'>
          <div v-for="(groupParameter, key) in groupParameters" class="dossier-field-block-buttons-button" :key="key">
            <b-button size="lg" variant="primary" type="button" :disabled="activeTab !== key">
              {{ key + 1 }}. {{ groupParameter.title }}
            </b-button>
          </div>
        </div>
        <b-progress class="progress-xs" variant="info" :value="progress" :max="groupParameters.length"/>
        <div class='dossier-field-block-content' v-if="activeTab !== groupParameters.length - 1">
          <div v-for="(groupParameter, index) in groupParameters" :key="index">
            <div class='dossier-field-block-content-parameters'
                 v-for="(parameter, element) in groupParameter.parameters" :key="element">
              <div v-if="activeTab === index" class='dossier-field-block-content-parameters-parameter'>
                <div class='dossier-field-block-content-parameters-parameter-title'>{{ parameter.title }}</div>
                <input v-if="parameter.type === 'text'"
                       v-model="parameter.value"
                       :type="parameter.type"
                       class='dossier-field-block-content-parameters-parameter-input'
                       :placeholder="parameter.type === 'text' ? 'Введите значение' : parameter.type === 'date' ? 'Введите дату' : ''"
                       required
                />
                <date-picker v-else-if="parameter.type === 'date'"
                             v-model="parameter.value"
                             class="dossier-field-block-content-parameters-parameter-date"
                             lang="ru"
                             :clearable="false"
                             format="DD.MM.YYYY"
                             :input-attr="{ required: true }"
                >
                  <i style="display: none;" slot="calendar-icon"/>
                </date-picker>
                <custom-select v-else-if="parameter.type === 'choice'"
                               v-model="parameter.value"
                               class='dossier-field-block-content-parameters-parameter-select'
                               defaultText="Выберите значение"
                               :options="parameter.answers"
                               required
                />
                <div v-else-if="parameter.type === 'range'" class="dossier-field-block-content-parameters-parameter-range">
                  <div class="dossier-field-block-content-parameters-parameter-range-input">
                    <input v-model="parameter.value"
                           class="form-control"
                           required
                           @change="editParameter(parameter)"
                    />
                  </div>
                  <div class="dossier-field-block-content-parameters-parameter-range-slider">
                    <input v-model="parameter.value"
                           type="range"
                           class="input-range"
                           :max="parameter.answers.maxValue"
                           :min="parameter.answers.minValue"
                           @change="editParameter(parameter)"
                    />
                    <span class="dossier-field-block-content-parameters-parameter-range-slider-min">{{ parameter.answers.minValue }}</span>
                    <span class="dossier-field-block-content-parameters-parameter-range-slider-max">{{ parameter.answers.maxValue }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class='dossier-field-block-access'>
          <div class='dossier-field-block-access-title'>Анкета заполнена</div>
          <div class='dossier-field-block-access-subtitle'>Чтобы отправить анкету, нажмите кнопку “Отправить”</div>
        </div>
        <div class="dossier-field-block-steps" :class="activeTab === 0 ? '-first_step' : ''">
          <b-button class="dossier-field-block-steps-button" v-if="activeTab !== 0" size="md" variant="outline-primary"
                    type="button" @click="previousStep">Предыдущий шаг
          </b-button>
          <b-button class="dossier-field-block-steps-button" v-if="activeTab !== groupParameters.length - 1" size="md"
                    variant="outline-primary" type="submit">Следующий шаг
          </b-button>
          <b-button class="dossier-field-block-steps-button" v-else size="md" variant="outline-primary" type="button"
                    @click="addDossier">Отправить
          </b-button>
        </div>
      </div>
    </div>
    <div v-else-if="dossierStatus !== 'dossier-not-saved'" class="dossier-success">
      <div class="dossier-success-field">
        <div class="dossier-success-field-info">
          <div class="dossier-success-field-info-icon"><i class="fi flaticon-dossier-added"/></div>
          <p class="dossier-success-field-info-title">Анкета отправлена</p>
          <p class="dossier-success-field-info-subtitle">Ваши данные были успешно отправлены</p>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="dossier-success-field">
        <div class="dossier-success-field-info">
          <div class="dossier-success-field-info-icon"><i class="fi flaticon-avatar"/></div>
          <p class="dossier-success-field-info-title">Ссылка недействительна</p>
          <p class="dossier-success-field-info-subtitle">Запросите ссылку на заполнение анкеты повторно</p>
        </div>
      </div>
    </div>
  </b-form>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";
import moment from "moment";

export default {
  name: 'Dossier',
  components: {
    'date-picker': DatePicker,
    'custom-select': Select
  },
  data() {
    return {
      groupParameters: [],
      activeTab: 0,
      taskId: null,
      dossier: {},
      dossierStatus: '',
      link: new URLSearchParams(window.location.search).get('link')
    };
  },
  created() {
    this.taskId = localStorage.getItem('taskId');
    this.fetchDossier();
  },
  watch: {
    dossier: function (newDossier) {
      this.groupParameters = JSON.parse(JSON.stringify(newDossier.worksheet)).filter(groupParameter => groupParameter.parameters.length)
      this.groupParameters.push({title: 'Отправить анкету'})
    },
    /*currentTask: function (newTask) {
        this.groupParameters = JSON.parse(JSON.stringify(newTask.response.worksheet)).filter(groupParameter => groupParameter.parameters.length)
        this.groupParameters.push({title: 'Отправить анкету'})
    }*/
  },
  computed: {
    progress() {
      return this.activeTab + 1;
    }
  },
  methods: {
    checkTab() {
      this.activeTab++
    },
    previousStep() {
      this.activeTab--
    },
    addDossier() {
      let groupParameters = JSON.parse(JSON.stringify(this.groupParameters))
      groupParameters.pop()
      this.dossierStatus = 'request';
      axios.post(`vacancy_responses/worksheet/${this.link}`, {worksheet: groupParameters.map(group => ({
          ...group,
          parameters: group.parameters.map(parameter => {
            if ((parameter.type !== 'date') || !parameter.value) return parameter;
            return {
              ...parameter,
              value: parameter.type === 'date' ? moment(parameter.value).format('YYYY-MM-DD') : parameter.value,
            }
          })
        }))})
          .then(() => {
            this.dossierStatus = 'dossier-added';
          })
          .catch(() => {
            this.dossierStatus = 'dossier-not-saved';
          });
    },
    fetchDossier() {
      this.dossierStatus = '';
      axios.get(`vacancy_responses/worksheet/${this.link}`).then(({data}) => {
        this.dossier = data;
        this.dossierStatus = 'dossier-saved';
      }).catch(() => {
        this.dossierStatus = 'dossier-not-saved';
      })
    },
    editParameter(parameter) {
      let parsedValue = parseInt(parameter.value);
      parameter.value = isNaN(parsedValue) || (parsedValue < parameter.answers.minValue) ? parameter.answers.minValue :
          (parsedValue > parameter.answers.maxValue ? parameter.answers.maxValue : parsedValue);
    },
  },
};
</script>

<style src="./Dossier.scss" lang="scss"/>