<template>
  <b-form class="white_list-add" @submit.prevent="editTemplate">
    <div class="theme-helper-content-main-header">
      <b-button v-if="editPermission" type="submit" variant="outline-primary" size="sm">Сохранить группу</b-button>
    </div>
    <div class="group_parameters-parameters">
      <div class="group_parameters-parameters-title pb-0">
        <h3 class="mb-0">{{ template.title }}</h3>
      </div>
      <div class="group_parameters-parameters-title">
        <h4 class="mb-0">Настройка параметров</h4>
        <div v-if="editPermission" class="group_parameters-parameters-title-add_parameter" @click="addParameter">
          <p class="group_parameters-parameters-title-add_parameter-text">Добавить параметр</p>
          <div class="group_parameters-parameters-title-add_parameter-image btn-add"/>
        </div>
      </div>
      <div v-for="parameter in defaultParameters" class="group_parameters-parameters-parameter_field-parameter" :key="parameter.id">
        <div class="group_parameters-parameters-parameter_field-parameter-container -disabled">
          <div class="group_parameters-parameters-parameter_field-parameter-content">
            <div class="group_parameters-parameters-parameter_field-parameter-value">
              <textarea-autosize v-model="parameter.title"
                                 :min-height="32"
                                 rows="1"
                                 class="group_parameters-parameters-parameter_field-parameter-value-textarea -editable_fields"
                                 placeholder="Название"
                                 disabled
                                 required
              ></textarea-autosize>
            </div>
            <span class="text-gray">{{ parameterTypesObject[parameter.type] }}</span>
<!--            <custom-select v-model="parameter.type"
                           class="group_parameters-parameters-parameter_field-parameter-type"
                           valueField="value"
                           titleField="title"
                           defaultText="Укажите тип"
                           disabled
                           :options="parameterTypes"
            />-->
          </div>
        </div>
      </div>
      <draggable v-model="editableParameters"
                 class="group_parameters-parameters-parameter_field"
                 :disabled="!editPermission"
                 :preventOnFilter="false"
                 :options="draggableParameterOptions"
                 :forceFallback="true"
                 fallbackClass="sortable-fallback"
      >
        <div v-for="(parameter, key) in editableParameters"
             class="group_parameters-parameters-parameter_field-parameter"
             :key="parameter.id"
        >
          <div class="group_parameters-parameters-parameter_field-parameter-container">
            <div class="group_parameters-parameters-parameter_field-parameter-content">
              <i class="fi flaticon-points group_parameters-parameters-parameter_field-parameter-content-icon"></i>
              <div class="group_parameters-parameters-parameter_field-parameter-value">
                <textarea-autosize v-model="parameter.title"
                                   :min-height="32"
                                   rows="1"
                                   class="group_parameters-parameters-parameter_field-parameter-value-textarea -editable_fields"
                                   placeholder="Название"
                                   :disabled="!editPermission"
                                   required
                ></textarea-autosize>
              </div>
              <custom-select v-model="parameter.type"
                             class="group_parameters-parameters-parameter_field-parameter-type"
                             valueField="value"
                             titleField="title"
                             defaultText="Укажите тип"
                             :disabled="!editPermission"
                             :options="parameterTypes"
                             required
                             @change="editType(parameter)"
              />
              <div v-if="editPermission && !parameter.read_only" class="group_parameters-parameters-parameter_field-parameter-image">
                <i class="btn-remove" @click="removeParameter(key)"/>
              </div>
              <template v-if="parameter.type === 'range'">
                <input v-model="parameter.minValue"
                       type="number"
                       class="form-control group_parameters-parameters-parameter_field-parameter-input"
                       :class="{'-error': parameterWithRangeError === key}"
                       placeholder="Мин. значение"
                       :disabled="!editPermission || parameter.read_only"
                       required
                       @input="onInputRange(key)"
                />
                <input v-model="parameter.maxValue"
                       type="number"
                       class="form-control group_parameters-parameters-parameter_field-parameter-input"
                       :class="{'-error': parameterWithRangeError === key}"
                       placeholder="Макс. значение"
                       :disabled="!editPermission || parameter.read_only"
                       required
                       @input="onInputRange(key)"
                />
              </template>
              <div v-if="parameter.type === 'select'"
                   class="group_parameters-parameters-parameter_field-parameter-choice_block">
                <div v-for="(answer, name2, index2) in parameter.answers"
                     class="group_parameters-parameters-parameter_field-parameter-choice_block-option"
                     :key="index2"
                >
                  <p class="group_parameters-parameters-parameter_field-parameter-choice_block-option-text">Вариант
                    №{{ name2 + 1 }}</p>
                  <input v-model="answer.answer"
                         class="group_parameters-parameters-parameter_field-parameter-choice_block-option-value"
                         :class="editPermission ? '-editable_fields' : ''"
                         placeholder="Название"
                         :disabled="!editPermission || parameter.read_only"
                         required
                  >
                  <div v-if="(parameter.answers.length >= 3) && editPermission && !parameter.read_only"
                       class="group_parameters-parameters-parameter_field-parameter-choice_block-option-delete"
                  ><i class="btn-remove" @click="deleteAnswer(key, name2)"/></div>
                </div>
                <div v-if="editPermission && !parameter.read_only" class="group_parameters-parameters-title-add_parameter" @click="addAnswer(parameter)">
                  <p class="group_parameters-parameters-title-add_parameter-text">Добавить вариант</p>
                  <div class="group_parameters-parameters-title-add_parameter-image btn-add"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </draggable>
    </div>
  </b-form>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import Draggable from "vuedraggable";
import { closeToast } from "@/tools/tools";

export default {
  name: 'workshift-report-template-details',
  props: {
    templateId: Number,
  },
  components: {
    'custom-select': Select,
    Draggable,
  },
  data() {
    return {
      defaultParameters: [],
      editableParameters: [],
      draggableParameterOptions: {
        group: 'group_parameters-parameters-parameter_field-parameter',
        chosenClass: 'group_parameters-parameters-parameter_field-parameter-chosen',
        dragClass: '-dragging',
        ghostClass: 'group_parameters-parameters-parameter_field-parameter-ghost',
      },
      parameterTypes: [
        {value: 'text', title: 'Текст'},
        {value: 'date', title: 'Дата'},
        {value: 'time', title: 'Время'},
        {value: 'select', title: 'Выбор варианта'},
        {value: 'range', title: 'Диапазон'},
      ],
      parameterWithRangeError: null,
    };
  },
  computed: {
    template() {
      return this.$store.getters["workshiftReportTemplates/getTemplateById"](this.templateId);
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.admin.templateWorkshiftReport.edit;
    },
    parameterTypesObject() {
      let types = {
        multiselect: 'Выбор вариантов',
      };

      this.parameterTypes.forEach(parameter => types[parameter.value] = parameter.title);
      return types;
    },
  },
  watch: {
    template: function (nextTemplate) {
      let defaultParameters = [],
          editableParameters = [];

      nextTemplate.parameters.forEach(parameter => {
        if (parameter.read_only) return defaultParameters.push(parameter);
        editableParameters.push({
          ...parameter,
          answers: Array.isArray(parameter.answers) ? parameter.answers?.map(answer => ({answer})) : {...parameter.answers},
          minValue: parameter.answers?.min || undefined,
          maxValue: parameter.answers?.max || undefined,
        });
      });

      this.defaultParameters = defaultParameters;
      this.editableParameters = editableParameters;
    },
  },
  created() {
    this.$store.dispatch('workshiftReportTemplates/fetchWorkshiftReportTemplate', this.templateId);
  },
  methods: {
    editTemplate() {
      let parameters = this.defaultParameters.map(parameter => ({id: `/template_workshift_reports/${parameter.id}`})),
          countStart = parameters.length;

      for (let key = 0; key < this.editableParameters.length; key++) {
        let result = {...this.editableParameters[key]};
        if (result.id) result.id = `/template_workshift_reports/${result.id}`;
        result.serial_number = key + countStart;

        switch (result.type) {
          case 'select':
            result.answers = result.answers?.filter(answer => answer)
                .map(answer => typeof answer === 'object' ? answer.answer : answer) || [];
            break;
          case 'range':
            if (parseInt(result.maxValue) <= parseInt(result.minValue)) {
              this.$toasted.error('Ошибка. Минимальное значение должно быть меньше максимального', {
                className: ['toasted-error'],
                action: {
                  class: 'btn-close',
                  onClick: closeToast,
                },
              });
              return this.parameterWithRangeError = key;
            }
            result.answers = {
              max: result.maxValue,
              min: result.minValue,
            };
            delete result.maxValue;
            delete result.minValue;
        }

        parameters.push(result);
      }

      this.$store.dispatch('workshiftReportTemplates/editWorkshiftReportTemplate', {
        ...this.template,
        parameters,
      });
    },
    addParameter() {
      this.editableParameters = [...this.editableParameters, {answers: []}];
    },
    removeParameter(key) {
      this.editableParameters = this.editableParameters.filter((parameter, currentKey) => currentKey !== key);
    },
    addAnswer(parameter) {
      parameter.answers.push({answer: ''});
    },
    deleteAnswer(parameterIndex, answerIndex) {
      this.editableParameters[parameterIndex].answers.splice(answerIndex, 1);
    },
    editType(parameter) {
      if (parameter.type === 'select' && !parameter.answers.length) parameter.answers = [{answer: ''}, {answer: ''}]
      else if (parameter.type !== 'select') parameter.answers = []
    },
    onInputRange(key) {
      if (this.parameterWithRangeError === key) this.parameterWithRangeError = null;
    },
  },
}
</script>