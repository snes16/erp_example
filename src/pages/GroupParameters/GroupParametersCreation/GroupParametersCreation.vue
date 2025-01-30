<template>
  <b-form class="group_parameters"
          :disabled="groupParametersStatus === 'creating'"
          @submit.prevent="onSubmit"
  >
    <div class="group_parameters-title">
      <b-button v-if="permission" type="sumbit" variant="outline-info" size="sm">
        {{ groupParametersList.id ? 'Сохранить группу' : 'Добавить группу' }}
      </b-button>
    </div>
    <div class="group_parameters-name">
      <modal-title v-model="groupParametersList.title"
                   :max-width="'100%'"
                   :min-width="'20px'"
                   :placeholder="'Введите название группы'"
                   :required="true"
                   :field="'title'"
                   @setTitle="setTitle"
                   @changeTitle="changeGroupParametersTitle"
      />
    </div>
    <div class="group_parameters-permissions" :class="roleTitles.length ? '-selected_roles' : ''">
      <p class="group_parameters-permissions-text">Настройка доступов</p>
      <div v-if="permission" class="group_parameters-permissions-editing" @click="accessSettings(groupParametersList)">
        <p class="group_parameters-permissions-editing-text">Редактировать</p>
        <div class="group_parameters-permissions-editing-image glyphicon-pencil_blue"/>
      </div>
    </div>
    <div v-if="roleTitles.length" class="group_parameters-roles">
      <div class="group_parameters-roles-item" v-for="(role, index) in roleTitles" :key="index">
        {{ role.title }}
      </div>
    </div>
    <div class="group_parameters-parameters">
      <div class="group_parameters-parameters-title">
        <p class="group_parameters-parameters-title-text">Настройка параметров</p>
        <div v-if="permission" class="group_parameters-parameters-title-add_parameter" @click="addParameters()">
          <p class="group_parameters-parameters-title-add_parameter-text">Добавить параметр</p>
          <div class="group_parameters-parameters-title-add_parameter-image btn-add"/>
        </div>
      </div>
      <draggable v-model="groupParametersList.parameters"
                 class="group_parameters-parameters-parameter_field"
                 :preventOnFilter="false"
                 :options="draggableParameterOptions"
                 :forceFallback="true"
                 fallbackClass="sortable-fallback"
                 @change="moveParameter"
      >
        <div v-for="(parameter, name, index) in groupParametersList.parameters"
             class="group_parameters-parameters-parameter_field-parameter"
             :key="index"
             @mousedown="startMoved"
             @mouseup="stopMoved"
        >
          <div class="group_parameters-parameters-parameter_field-parameter-container">
            <div class="group_parameters-parameters-parameter_field-parameter-content">
              <i class="fi flaticon-points group_parameters-parameters-parameter_field-parameter-content-icon"></i>
              <div class="group_parameters-parameters-parameter_field-parameter-value">
                <textarea-autosize v-model="parameter.title"
                                   :min-height="32"
                                   rows="1"
                                   class="group_parameters-parameters-parameter_field-parameter-value-textarea -editable_fields"
                                   :class="permission ? '-editable_fields' : ''"
                                   placeholder="Название"
                                   :disabled="!permission"
                                   required
                                   @change="editParameter"
                ></textarea-autosize>
              </div>
              <custom-select v-model="parameter.type"
                             class="group_parameters-parameters-parameter_field-parameter-type"
                             valueField="value"
                             titleField="title"
                             defaultText="Укажите тип"
                             :disabled="!permission"
                             :options="parameterTypes"
                             @change="editType(parameter)"
              />
              <div v-if="permission" class="group_parameters-parameters-parameter_field-parameter-image">
                <i class="btn-remove" @click="deleteParameters(name)"/>
              </div>
              <template v-if="parameter.type === 'range'">
                <input v-model="parameter.minValue"
                       type="number"
                       class="form-control group_parameters-parameters-parameter_field-parameter-input"
                       placeholder="Мин. значение"
                       :disabled="!permission"
                       required
                       @change="editParameter"
                />
                <input v-model="parameter.maxValue"
                       type="number"
                       class="form-control group_parameters-parameters-parameter_field-parameter-input"
                       placeholder="Макс. значение"
                       :disabled="!permission"
                       required
                       @change="editParameter"
                />
              </template>
              <div class="custom-control custom-checkbox group_parameters-parameters-parameter_field-parameter-use_dossier">
                <input v-model="parameter.use_in_dossier"
                       type="checkbox"
                       class="custom-control-input"
                       :id="name"
                       :disabled="!permission"
                       @change="editParameter"
                >
                <label class="custom-control-label" :for="name">Использовать при создании досье модели</label>
              </div>
              <div v-if="parameter.type === 'choice'"
                   class="group_parameters-parameters-parameter_field-parameter-choice_block">
                <div v-for="(answer, name2, index2) in parameter.answers"
                     class="group_parameters-parameters-parameter_field-parameter-choice_block-option"
                     :key="index2"
                >
                  <p class="group_parameters-parameters-parameter_field-parameter-choice_block-option-text">Вариант
                    №{{ name2 + 1 }}</p>
                  <input v-model="answer.answer"
                         class="group_parameters-parameters-parameter_field-parameter-choice_block-option-value"
                         :class="permission ? '-editable_fields' : ''"
                         placeholder="Название"
                         :required="answer === parameter.answers[0] || answer === parameter.answers[1]"
                         :disabled="!permission"
                         @change="editParameter"
                  />
                  <div v-if="(parameter.answers.length >= 3) && (answer !== parameter.answers[parameter.answers.length - 1]) && permission"
                       class="group_parameters-parameters-parameter_field-parameter-choice_block-option-delete"
                  ><i class="btn-remove" @click="deleteAnswer(name, name2)"/></div>
                </div>
                <div v-if="permission" class="group_parameters-parameters-title-add_parameter" @click="addAnswer(parameter)">
                  <p class="group_parameters-parameters-title-add_parameter-text">Добавить параметр</p>
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
import {mapState, mapActions} from 'vuex';
import Select from "@/components/Common/Select/Select";
import ModalTitle from "@/components/Common/ModalTitle/ModalTitle";
import Draggable from "vuedraggable";

export default {
  name: 'group-parameters-creation',
  components: {
    'custom-select': Select,
    'modal-title': ModalTitle,
    'draggable': Draggable,
  },
  props: {
    groupParameterProp: Object,
    permission: Boolean,
    newGroup: Object,
  },
  data() {
    return {
      parameterTypes: [
        {value: 'text', title: 'Текст'},
        {value: 'date', title: 'Дата'},
        {value: 'choice', title: 'Выбор варианта'},
        {value: 'range', title: 'Диапазон'},
      ],
      groupParametersList: {},
      draggableParameterOptions: {
        group: 'group_parameters-parameters-parameter_field-parameter',
        chosenClass: 'group_parameters-parameters-parameter_field-parameter-chosen',
        dragClass: 'group_parameters-parameters-parameter_field-parameter-dragging',
        ghostClass: 'group_parameters-parameters-parameter_field-parameter-ghost',
      },
      move: false,
      index: 0,
    }
  },
  computed: {
    ...mapState('layout', ['helperOpened', 'layoutStatus']),
    ...mapState('groupparameters', ['groupParametersStatus']),
    roles() {
      return this.$store.state.dictionaries.roles;
    },
    roleTitles() {
      if (this.groupParametersList.roles) {
        let rolesCopy = this.roles;
        return this.groupParametersList.roles.map(function (roleId) {
          let newRole = {}
          rolesCopy.map(function (role) {
            if (role.id === roleId) {
              newRole.id = role.id;
              newRole.title = role.title;
            }
            return role;
          });
          return newRole;
        })
      } else return []
    },
  },
  watch: {
    groupParameterProp: function (newGroupParameter) {
      this.groupParametersList = this.formatParametersList(newGroupParameter);
    },
    groupParameter: function (newGroupParameter) {
      this.groupParametersList = newGroupParameter;
    },
  },
  created() {
    this.groupParametersList = this.groupParameterProp.id ? this.formatParametersList(this.groupParameterProp) : this.formatParametersList(this.newGroup);
    this.groupParametersList.parameters.forEach(parameter => {
      if (parameter.type === 'range') {
        parameter.maxValue = parameter.answers.maxValue;
        parameter.minValue = parameter.answers.minValue;
      }
    });
    this.$store.dispatch('dictionaries/fetchRoles');
  },
  methods: {
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('groupparameters', ['createGroupParameters', 'changeGroupParameters']),
    setTitle(event) {
      this.groupParametersList.title = event;
    },
    groupParametersAction() {
      if (this.groupParametersStatus === 'creating') return;
      let groupParametersList = JSON.parse(JSON.stringify(this.groupParametersList));
      groupParametersList.parameters = groupParametersList.parameters && groupParametersList.parameters.map(function (parameter, index) {
        parameter.serial_number = index;
        switch (parameter.type) {
          case 'choice':
            parameter.answers = parameter.answers?.map(answer => typeof answer === 'object' ? Object.values(answer).join() : answer).filter((answer) => answer) || [];
            break;
          case 'range':
            parameter.answers = {
              maxValue: parameter.maxValue,
              minValue: parameter.minValue,
            };
            delete parameter.maxValue;
            delete parameter.minValue;
        }

        return parameter;
      });
      if (groupParametersList.id) this.changeGroupParameters(groupParametersList);
      else this.createGroupParameters(groupParametersList);
    },
    changeGroupParametersTitle() {
      if (!this.groupParametersList.id) return;
      this.groupParametersAction(this.groupParametersList);
    },
    addParameters() {
      this.groupParametersList.parameters.push({
        title: '',
        use_in_dossier: false,
        type: 'choice',
        answers: [{answer: ''}, {answer: ''}],
        serial_number: this.index,
      });
      this.index++;
    },
    deleteParameters(index) {
      this.groupParametersList.parameters.splice(index, 1);
      this.editParameter();
    },
    addAnswer(parameter) {
      parameter.answers.push({answer: ''});
    },
    editType(parameter) {
      if (parameter.type === 'choice' && !parameter.answers.length) parameter.answers = [{answer: ''}, {answer: ''}];
      else if (parameter.type !== 'choice') parameter.answers = [];
      this.editParameter();
    },
    deleteAnswer(parameterIndex, answerIndex) {
      this.groupParametersList.parameters[parameterIndex].answers.splice(answerIndex, 1);
      this.editParameter();
    },
    accessSettings(groupParametersList) {
      this.$emit('open-settings', groupParametersList);
      if (groupParametersList.id) this.groupParametersAction(groupParametersList);
    },
    moveParameter() {
      this.groupParametersAction();
    },
    startMoved() {
      this.move = true;
    },
    stopMoved() {
      this.move = false;
    },
    formatParametersList(list) {
      return {
        ...list,
        parameters: list.parameters?.map(listParameter => {
          let parameter = {...listParameter};
          if (parameter.type === 'choice' && parameter.answers.length) {
            parameter.answers = parameter.answers.map(answer => {
              const answerType = typeof answer;
              if (answerType === 'string') return {answer: answer};
              else if (answerType === 'object') return answer;
            }) || [];
            parameter.answers.push({answer: ''});
          } else if (parameter.type === 'range') {
            parameter.maxValue = parameter.answers.maxValue;
            parameter.minValue = parameter.answers.minValue;
          }
          return parameter;
        }),
      };
    },
    onSubmit() {
      if (this.groupParametersList.id) this.$emit('close');
      else this.groupParametersAction();
    },
    editParameter() {
      if (this.groupParametersList.id) this.groupParametersAction();
    },
  }
};
</script>
