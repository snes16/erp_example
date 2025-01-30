<template>
  <b-form class="dossier" @submit.prevent="checkTab()">
        <div v-if="dossierStatus !== 'dossier-added' && dossierStatus !== 'dossier-not-saved'" class="dossier-field">
            <div>
                <p class="dossier-title">Анкета</p>
                <div class="dossier-field-block">
                    <div class="dossier-field-block-title">Для отправления анкеты заполните все шаги</div>
                    <div class='dossier-field-block-buttons'>
                        <b-button
                            class='dossier-field-block-buttons-button'
                            v-for="(groupParameter, key) in groupParameters"
                            :key="key"
                            size="md"
                            variant="info"
                            type="button"
                            :disabled="activeTab !== key"
                        >
                            {{ key + 1 }}. {{groupParameter.title}}
                        </b-button>
                    </div>
                    <b-progress class="progress-xs" variant="info" :value="progress" :max="groupParameters.length" />
                    <div class='dossier-field-block-content' v-if="activeTab !== groupParameters.length - 1">
                        <div v-for="(groupParameter, index) in groupParameters" :key="index">
                            <div class='dossier-field-block-content-parameters' v-for="(parameter, element) in groupParameter.parameters" :key="element">
                                <div v-if="activeTab === index" class='dossier-field-block-content-parameters-parameter'>
                                    <div class='dossier-field-block-content-parameters-parameter-title'>{{parameter.title}}</div>
                                    <input
                                        v-if="parameter.type === 'text'"
                                        v-model="parameter.value"
                                        :type="parameter.type"
                                        class='dossier-field-block-content-parameters-parameter-input'
                                        :placeholder="parameter.type === 'text' ? 'Введите значение' : parameter.type === 'date' ? 'Введите дату' : ''"
                                        required
                                    />
                                    <date-picker 
                                        v-else-if="parameter.type === 'date'"
                                        class="dossier-field-block-content-parameters-parameter-date"
                                        lang="ru"
                                        v-model="parameter.value"
                                        :clearable="false"
                                        format="DD.MM.YYYY"
                                        :input-attr="{ required: true }"
                                    >
                                        <i style="display: none;" slot="calendar-icon" />
                                    </date-picker>
                                    <custom-select
                                        v-else-if="parameter.type === 'choice'"
                                        v-model="parameter.value"
                                        class='dossier-field-block-content-parameters-parameter-select'
                                        defaultText="Выберите значение"
                                        :options="parameter.answers"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class='dossier-field-block-access'>
                        <div class='dossier-field-block-access-title'>Анкета заполнена</div>
                        <div class='dossier-field-block-access-subtitle'>Чтобы отправить анкету, нажмите кнопку “Отправить”</div>
                    </div>
                    <div class="dossier-field-block-steps" :class="activeTab === 0 ? '-first_step' : ''">
                        <b-button class="dossier-field-block-steps-button" v-if="activeTab !== 0" size="md" variant="outline-info" type="button" @click="previousStep">Предыдущий шаг</b-button>
                        <b-button class="dossier-field-block-steps-button" v-if="activeTab !== groupParameters.length - 1" size="md" variant="outline-info" type="submit">Следующий шаг</b-button>
                        <b-button class="dossier-field-block-steps-button" v-else size="md" variant="outline-info" type="button" @click="addDossier">Отправить</b-button>
                    </div>
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
import Vue from 'vue';
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";

export default {
  name: 'Dossier',
  components: {
      'date-picker': DatePicker,
      'custom-select': Select
  },
  data() {
    return {
      progress: 1,
      groupParameters: [],
      activeTab: 0,
      taskId: null
    };
  },
  created() {
      this.taskId = localStorage.getItem('taskId');
      this.$store.dispatch('dossier/fetchDossier', this.$route.params.link)
  },
  watch: {
      taskId: function(newId) {
          this.$store.dispatch('tasks/fetchCurrentTask', newId)
      },
    //   dossier: function(newDossier) {
    //     this.groupParameters = JSON.parse(JSON.stringify(newDossier.group_template_params)).filter(groupParameter => groupParameter.parameters.length)
    //     this.groupParameters.push({ title: 'Отправить анкету'})
    //   },
      currentTask: function(newTask) {
        this.groupParameters = JSON.parse(JSON.stringify(newTask.response.worksheet)).filter(groupParameter => groupParameter.parameters.length)
        this.groupParameters.push({ title: 'Отправить анкету'})          
      }

  },
  computed: {
      dossierStatus() {
          return this.$store.state.dossier.status
      },
      link() {
          return this.$route.params.link
      },
      dossier() {
          return this.$store.state.dossier.dossier
      },
      currentTask() {
          return this.$store.state.tasks.currentTask
      }
  },
  methods: {
    checkTab() {
        this.activeTab++
        this.progress++
    },
    previousStep() {
        this.activeTab--
        this.progress--
    },
    addDossier() {
        let groupParameters = JSON.parse(JSON.stringify(this.groupParameters))
        groupParameters.pop()
        this.$store.dispatch('dossier/addModelDossier', { link: this.link, dossier: { worksheet: groupParameters }})
    }
  },
};
</script>