<template>
  <div class="response-action_form">
    <div class="response-action_form-title">
      <p class="response-action_form-title-text">
        {{
          (taskPropCopy && (taskPropCopy.status === 'completed' || taskPropCopy.status === 'check')) ? 'Собеседование проведено' : 'Результат собеседования'
        }}</p>
      <div
        v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'check')"
        class="helper-close" @click="closeForm"></div>
    </div>
    <div class="response-action_form-action_field-date_appoint">
      <div class="response-action_form-action_field-date_appoint-title">
        <b>{{
            (taskPropCopy.status === 'completed' || taskPropCopy.status === 'check') ? 'Дата регистрации' : 'Назначить регистрацию'
          }}</b>
      </div>
      <div class="response-action_form-action_field-date response-task-parameters-title-date">
        <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
        <date-picker v-model="taskPropCopy.next_planned_start_at"
                     lang="ru"
                     format="DD.MM.YYYY"
                     value-type="YYYY-MM-DD"
                     type="date"
                     :placeholder="formattedDateWithoutTime(taskPropCopy.result_date) || 'Дата не назначена'"
                     class="datepicker-plain response-info_data-field-date_executor"
                     :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'check')"
                     :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
                     @focus="focusField('next_planned_start_at')"
        >
          <i slot="calendar-icon"/>
        </date-picker>
      </div>
    </div>
    <b-input placeholder="Добавьте комментарий" v-model="taskPropCopy.result"
             :disabled="taskPropCopy && (taskPropCopy.status === 'completed' || taskPropCopy.status === 'check')"/>
    <div v-if="!(taskPropCopy.response.group && taskPropCopy.response.group.id)"
         class="response-info_data-files-add_office">
      <div class="response-info_data-files-add_office-title">
        Офис
        <div
          v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'check') && !chosenGroup"
          class="btn-add" @click="setDroverType('office-list')"></div>
      </div>
      <div v-if="chosenGroup" class="response-info_data-files-add_office-offices">
        <div class="response-info_data-files-add_office-offices-info">
          <span class="response-info_data-files-add_office-offices-info-flag flag-icon"
                :class="`flag-icon-${chosenGroup.build_group.flag || 'default'}`"></span>
          <span class="response-info_data-files-add_office-offices-info-parent">{{ chosenGroup.parent }}</span>
          <span class="response-info_data-files-add_office-offices-info-title">{{ chosenGroup.title }}</span>
        </div>
        <div
          v-if="taskPropCopy.status !== 'completed' && taskPropCopy.status !== 'archive' && taskPropCopy.status !== 'check'"
          class="response-info_data-files-add_office-edit d-flex align-items-center"
          @click="setDroverType('office-list')">
          <span>Изменить</span>
          <div class="response-info_data-files-add_office-edit-image glyphicon-pencil_blue"></div>
        </div>
      </div>
      <div v-else class="response-info_data-files-add_office-description" :class="showOfficeError ? '-error_text' : ''">
        Выберите офис, в котором будет работать модель
      </div>
    </div>
    <div v-else class="response-info_data-files-add_office">
      <div class="response-info_data-files-add_office-title">Офис</div>
      <div class="d-flex justify-content-between align-items-center">
        <div class="response-info_data-files-add_office-offices d-flex align-items-center flex-row" :class="'mt-2'">
          <template v-if="taskPropCopy.response.group && taskPropCopy.response.group.parent">
            <span class="flag-icon mr-1" :class="`flag-icon-${taskPropCopy.response.group.parent.flag || 'default'}`"
                  :title="taskPropCopy.response.group.parent.country"></span>
            <span v-if="taskPropCopy.response.group.parent.city"
                  class="text-gray mr-1">{{ taskPropCopy.response.group.parent.city }}</span>
            <span v-if="taskPropCopy.response.group.parent.office">{{
                taskPropCopy.response.group.parent.office
              }}</span>
          </template>
        </div>
        <div
          v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'check')"
          class="response-info_data-files-add_office-edit d-flex align-items-center" @click="openOfficeList">
          <span>Изменить</span>
          <div class="response-info_data-files-add_office-edit-image glyphicon-pencil_blue"></div>
        </div>
      </div>
    </div>
    <div class="response-info_data-files pl-0 pr-0" :style="'border-bottom: none'">
      <div class="response-info_data-title">
        <p class="response-info_data-title-text">Файлы задачи</p>
        <template
          v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'check')">
          <div v-if="anyFilesAdded" class="response-info_data-files-add_office-edit d-flex align-items-center"
               @click="setDroverType('files-upload')">
            <span>Редактировать</span>
            <div class="response-info_data-files-add_office-edit-image glyphicon-pencil_blue"></div>
          </div>
          <div v-else class="response-info_data-files-add_office-edit d-flex align-items-center"
               @click="setDroverType('files-upload')">
            <span>Загрузить</span>
            <div class="btn-add ml-2"></div>
          </div>
        </template>
      </div>
      <div class="response-info_data-files-list">
        <div v-for="(album, key) in filesInAlbums" class="response-info_data-files-list-row">
          <div class="response-info_data-files-list-row-title">
            <span>{{ album.title }}</span>
            <template v-if="album.requiredAttachments && album.requiredAttachments.length">
              <div class="tasks_files-main-album-title-icon ml-2" :id="`tasks_files-album-title-icon-${key}`">
                <warning/>
              </div>
              <b-tooltip :target="`tasks_files-album-title-icon-${key}`"
                         custom-class="tasks_files-main-album-title-tooltip">
                <p><b>Необходимо загрузить:</b></p>
                <ul class="tasks_files-main-album-title-tooltip-list">
                  <li v-for="code in album.requiredAttachments">{{ attachments[code] }}</li>
                </ul>
              </b-tooltip>
            </template>
          </div>
          <b-badge v-if="album.quantity" pill variant="success" class="response-info_data-files-list-row-quantity">
            {{ getNumberOfFiles(album.quantity) }}
          </b-badge>
          <b-badge v-else pill variant="danger" class="response-info_data-files-list-row-quantity -empty">Не загружено
          </b-badge>
        </div>
      </div>
    </div>
    <div v-if="taskPropCopy && taskPropCopy.status !== 'completed' && taskPropCopy.status !== 'check'"
         class="response-action_form-send_field" :style="'border-top: none'">
      <b-button size="md" variant="primary" @click="interviewTaskAction">Направить <span
        class="text-lowercase">{{ btnName }}</span></b-button>
    </div>
  </div>
</template>

<script>

import {pluralize} from "@/tools/tools";
import {makeTaskButtonName} from "@/components/Task/utils/CommonTaskUtils";
import DatePicker from "@/components/Common/Datepicker";
import warning from "@/assets/vue-svg/warning.svg";

export default {
  props: {
    chosenGroup: Object,
    taskPropCopy: Object,
    showOfficeError: Boolean,
    resultFiles: Object,
    shownErrors: Array
  },
  components: {
    'date-picker': DatePicker,
    'warning': warning,
    
  },
  computed: {
    requiredAttachmentsForInterviewTasks() {
      return this.$store.state.tasks.requiredAttachmentsForInterviewTasks ;
    },
    attachments() {
      return this.$store.state.dictionaries.attachments;
    },
    btnName() {
      return makeTaskButtonName(null, this.taskPropCopy.next_type_task)
    },
    anyFilesAdded() {
      if (!this.resultFiles) return false;
      return this.resultFiles.additional.length || Object.values(this.resultFiles).filter(file => file && !Array.isArray(file)).length;
    },
    filesInAlbums() {
      if (!this.resultFiles) return [];
      
      let path = this.taskPropCopy.type === 'registration' ? 'model' : 'response'
      
      if (!this.taskPropCopy[path]?.albums?.first_album) return [];
      if ((this.taskPropCopy.status === 'completed') || (this.taskPropCopy.status === 'archive') || (this.taskPropCopy.status === 'check')) return this.taskPropCopy[path].albums.first_album?.map(album => {
        let quantity = 0;
        if (Array.isArray(album.attachment)) quantity = album.attachment.length;
        else for (let code in album.attachments) {
          if (album.attachments[code].id) quantity++;
        }
        return {
          title: album.title,
          quantity: quantity
        }
      })
      return [...this.taskPropCopy[path].albums.first_album?.map(album => {
        if (!album.attachments) return null;
        let keys = Object.keys(album.attachments);
        return {
          title: album.title,
          quantity: keys.filter(code => this.resultFiles[code]).length,
          requiredAttachments: keys.filter(code => this.requiredAttachmentsForInterviewTasks.includes(code) && !this.resultFiles[code]),
        }
      }).filter(album => album), {
        title: 'Дополнительные файлы',
        quantity: this.resultFiles.additional.length
      }]
    },
    
  },
  methods: {
    formattedDateWithoutTime(time) {
      this.$emit('formattedDateWithoutTime', time)
    },
    getNumberOfFiles(number) {
      return pluralize(number, ['файл', 'файла', 'файлов']);
    },
    openOfficeList() {
      this.$emit('openOfficeList')
    },
    interviewTaskAction() {
      this.$emit('interviewTaskAction')
    },
    setDroverType(type) {
      this.$emit('setDroverType', type)
    },
    focusField(type) {
      this.$emit('focusField', type)
    },
    closeForm() {
      this.$emit('closeForm')
    }
  }
};
</script>
