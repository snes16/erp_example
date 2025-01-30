<template>
  <b-form class="white_list-add" @submit.prevent="editTemplate">
    <div class="theme-helper-content-main-header">
      <button-throbber v-if="editPermission"
                       size="sm"
                       variant="outline-primary"
                       class="payment_template-header-button"
                       colorThrobber="primary"
                       type="submit"
                       :loading="isLoading"
      >{{ this.template ? 'Сохранить' : 'Добавить шаблон'}}
      </button-throbber>
    </div>
    <div class="payment_template">
      <div class="payment_template-parameters-title pb-3">
        <h3 v-if="template && template.read_only" class="pb-2 pt-2 mb-0">{{ template.title }}</h3>
        <modal-title v-else
                     v-model="activeTitle"
                     class="payment_template-modal_title"
                     :required="true"
                     max-width="100%"
                     min-width="20px"
                     @setTitle="setTitle"
                     placeholder="Введите название шаблона"
        />
      </div>
      <div v-for="parameter in defaultParameters" class="payment_template-parameters-parameter_field-parameter p-0" :key="parameter.serial_number">
        <div class="payment_template-parameters-parameter_field-parameter-container -disabled">
          <div class="payment_template-parameters-parameter_field-parameter-content_static border-0 pb-3">
            <div class="payment_template-parameters-parameter_field-parameter-value">
              <b>{{parameter.title}}</b>
            </div>
            <span class="payment_template-parameters-parameter_field-parameter-type payment_template-text-gray ml-2">{{ parameterTypesObject[parameter.type] }}</span>
          </div>
        </div>
      </div>
      <div class="payment_template-parameters-title pb-0 pt-3">
        <h4 class="mb-0">{{template && template.read_only ? 'Дополнительные параметры' : 'Настройка параметров'}}</h4>
        <div v-if="editPermission" class="payment_template-parameters-title-add_parameter" @click="addParameter">
          <p class="payment_template-parameters-title-add_parameter-text">Добавить параметр</p>
          <div class=" btn-add payment_template-parameters-parameter_field-parameter-image"/>
        </div>
      </div>
      <draggable v-if="editPermission"
                 v-model="editableParameters"
                 class="payment_template-parameters-parameter_field"
                 :preventOnFilter="false"
                 :options="draggableParameterOptions"
                 :forceFallback="true"
                 fallbackClass="sortable-fallback"
      >
        <div v-for="(parameter, key) in editableParameters"
             class="payment_template-parameters-parameter_field-parameter p-0"
             :key="parameter.id"
        >
          <div class="payment_template-parameters-parameter_field-parameter-container">
            <div class="payment_template-parameters-parameter_field-parameter-content">
              <i class="fi flaticon-points payment_template-parameters-parameter_field-parameter-content-icon"></i>
              <div class="payment_template-parameters-parameter_field-parameter-value mr-3">
                <textarea-autosize v-model="parameter.title"
                                   rows="1"
                                   class="payment_template-parameters-parameter_field-parameter-value-textarea -editable_fields"
                                   placeholder="Название"
                                   required
                                   :min-height="32"
                                   :disabled="!editPermission"
                ></textarea-autosize>
              </div>
              <custom-select v-model="parameter.type"
                             class="payment_template-parameters-parameter_field-parameter-type"
                             valueField="value"
                             titleField="title"
                             defaultText="Укажите тип"
                             :options="parameterTypes"
                             required
                             @change="editType(parameter)"
              />
              <div v-if="!parameter.read_only && editPermission && editableParameters.length > 1" class="payment_template-parameters-parameter_field-parameter-image">
                <i class="btn-remove" @click="removeParameter(key)"/>
              </div>
              <div v-if="parameter.type === 'choice'"
                   class="payment_template-line-choice_block">
                <div v-for="(answer, index, index2) in parameter.answers"
                     class="payment_template-line-choice_block-option d-flex justify-content-between"
                     :key="index2"
                >
                  <p class="payment_template-line-choice_block-option-text">Вариант
                    №{{ index + 1 }}</p>
                  <textarea-autosize v-model="answer.answer"
                                     class="payment_template-line-choice_block-option-value"
                                     :class="editPermission ? '-editable_fields' : ''"
                                     placeholder="Введите название"
                                     :min-height="32"
                                     rows="1"
                                     :disabled="parameter.read_only || !editPermission"
                                     required
                  />
                  <div v-if="(parameter.answers.length > 1) && !parameter.read_only"
                       class="payment_template-line-choice_block-option-delete"
                  ><i class="btn-remove payment_template-line-choice_block-option-remove_icon"
                      @click="deleteAnswer(parameter, index)"/></div>
                </div>
                <div v-if="!parameter.read_only && editPermission" class="payment_template-parameters-title-add_parameter" @click="addAnswer(parameter)">
                  <p class="payment_template-parameters-title-add_parameter-text">Добавить вариант</p>
                  <div class="payment_template-parameters-title-add_parameter-image btn-add"/>
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
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import ModalTitle from "@/components/Common/ModalTitle/ModalTitle";
import Vue from "vue";

export default {
  name: 'payment-template-details',
  props: {
    template: Object,
  },
  components: {
    'modal-title': ModalTitle,
    ButtonThrobber,
    'custom-select': Select,
    Draggable,
  },
  data() {
    return {
      defaultParameters: [],
      editableParameters: [],
      activeTitle: '',
      draggableParameterOptions: {
        group: 'group_parameters-parameters-parameter_field-parameter',
        chosenClass: 'group_parameters-parameters-parameter_field-parameter-chosen',
        dragClass: '-dragging',
        ghostClass: 'group_parameters-parameters-parameter_field-parameter-ghost',
      },
      parameterTypes: [
        {value: 'choice', title: 'Выбор варианта'},
        {value: 'text', title: 'Текст'},
      ],
      parameterTypesObject: {
          select: 'Выбор варианта',
          choice: 'Выбор варианта',
          text: 'Текст'
      }
    };
  },
  created() {
    if (this.template) {
      this.activeTitle = this.template.title;
    }
    this.splitTemplateParameters();
  },
  computed: {
    status() {
      return this.$store.state.paymentInfoTemplates.status;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.admin.templateWorkshiftReport.edit;
    },
    isLoading() {
      return ['editing', 'creating'].includes(this.status);
    }
  },

  methods: {
    editTemplate() {
      const copiedEditableParameters = this.editableParameters.map(parameter => {
        const copiedParameter = { ...parameter };
        if (copiedParameter.type === 'choice' && Array.isArray(copiedParameter.answers)) {
          copiedParameter.answers = copiedParameter.answers.filter(answer => answer)
              .map(answer => typeof answer === 'object' ? answer.answer.trim() : answer.trim()) || [];
        }
        return copiedParameter;
      });
      const lastSerialNumber = this.defaultParameters.length > 0
          ? this.defaultParameters[this.defaultParameters.length - 1].serial_number
          : -1;
      const templateData = {
        'title': (this.template && this.template.read_only ? this.template.title : this.activeTitle).trim(),
        'parameters': [
          ...this.defaultParameters.map(parameter => ({
            ...parameter,
          })),
          ...copiedEditableParameters.map((parameter, index) => ({
            ...parameter,
            title: parameter.title.trim(),
            serial_number: lastSerialNumber + 1 + index,
          })),
        ],
      };

      const actionType = this.template ? 'editPaymentTemplate' : 'createPaymentTemplate';
      if (this.template) {
        templateData.id = this.template.id;
      }
      this.$store.dispatch(`paymentInfoTemplates/${actionType}`, templateData);
    },
    addParameter() {
      this.editableParameters = [...this.editableParameters, {answers: []}];
    },
    setTitle(event) {
      this.activeTitle = event;
    },
    removeParameter(key) {
      this.editableParameters = this.editableParameters.filter((parameter, currentKey) => currentKey !== key);
    },
    addAnswer(parameter) {
      Vue.set(parameter.answers, parameter.answers.length, { answer: '' });
    },
    deleteAnswer(parameter, answerIndex) {
      Vue.delete(parameter.answers, answerIndex);
    },
    splitTemplateParameters() {
      const payment_resource = {
        "title": "Платежный ресурс",
        "type": "select",
        "code": "payment_resource",
        "answers": [],
        "read_only": true,
        "serial_number": 0
      };
      if (this.template) {
        this.defaultParameters = [];
        this.editableParameters = [];
        this.template.parameters.forEach(parameter => {
          if (parameter.read_only) {
            this.defaultParameters.push(parameter);
          } else {
            const editableParameter = {
              ...parameter,
              answers: Array.isArray(parameter.answers) ? parameter.answers.map(answer => ({ answer })) : []
            };
            this.editableParameters.push(editableParameter);
          }
        });
      } else {
        this.defaultParameters = [payment_resource];
        this.editableParameters = [{answers: [], type: '', title: ''}];
      }
    },
    editType(parameter) {
      if (parameter.type !== 'select') {
        Vue.set(parameter, 'answers', []);
      }
    },
  },
}
</script>