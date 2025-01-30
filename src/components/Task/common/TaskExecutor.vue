<template>
  <div class="response-task-parameters" :class="{'-support': taskPropCopy.type === 'support' }">
    <div class="response-task-parameters-title">
      <div class="response-task-parameters-title-executor">
        <template
          v-if="currentUsersUpdated.length && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'completed')">
          <avatar class="mr-2"
                  :url="currentExecutor && currentExecutor.avatar"
                  is-large
                  :telegram="currentExecutor && currentExecutor.telegram_connected"
                  :is-fin-admin="currentExecutor && currentExecutor.is_fin_admin"
          />
          <custom-select v-model="currentExecutor"
                         :options="optionsCurrentUsersUpdated"
                         class="response-task-parameters-title-executor-full_name response-task-parameters-title-executor-settings"
                         :class="shownErrors.includes('user') ? ' -error_text' : ''"
                         valueField="id"
                         titleField="surname"
                         altTitleField="surname"
                         defaultText="Исполнитель не назначен"
                         return-whole-object
                         :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                         searchable
                         @change="setNewExecutor"
          >
            <template v-slot:chosen-variant="props">
              <template v-if="props.value">
                <span v-if="props.value.uid || props.value.surname">
                  <template v-if="!props.value.uid || !props.value.surname">{{
                      props.value.uid || props.value.surname
                    }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.value.uid }}</span>
                    <span>{{ props.value.surname }}</span>
                  </template>
                </span>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <span v-else>{{ props.shownText }}</span>
            </template>
            <template v-slot:list-variant="props">
              <div class="response-task-parameters-title-executor-settings-setting">
                <avatar class="mr-2"
                        :url=" props.variant.avatar"
                        is-large
                        :telegram="props.variant.telegram_connected"
                        :is-fin-admin="props.variant.is_fin_admin"
                />
                <div class="response-task-parameters-title-executor-settings-setting-item">
                  <template v-if="!props.variant.uid || !props.variant.surname">
                    {{ props.variant.uid || props.variant.surname }}
                  </template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.surname }}</span>
                  </template>
                  <template v-for="absence in props.variant.checkedAbsences"
                            class="response-task-parameters-title-executor-settings-setting-item-absence">
                    <b class="text-gray mr-1">
                      <absence/>
                      {{ absence }}</b>
                  </template>
                </div>
              </div>
            </template>
          </custom-select>
        </template>
        <span v-else-if="!(currentExecutor && currentExecutor.id) && !currentUsersUpdated.length"
              class="response-task-parameters-title-executor-full_name">Исполнитель не назначен</span>
        <div v-else-if="currentExecutor && currentExecutor.id" class="d-flex align-items-center">
          <avatar class="mr-1"
                  :url="currentExecutor.avatar"
                  is-large
                  :telegram="currentExecutor.telegram_connected"
                  :is-fin-admin="currentExecutor.is_fin_admin"
          />
          <span class="response-task-parameters-title-executor-full_name">{{ currentExecutor.surname }}</span>
        </div>
        <span v-else
              class="response-task-parameters-title-executor-full_name">{{
            taskPropCopy.user && taskPropCopy.user.surname || 'Исполнитель не назначен'
          }}</span>
        <user-resign-icon v-if="currentExecutor.resign_date" :offset="40" :user="currentExecutor"/>
        <user-resign-icon v-else-if="!currentExecutor && taskPropCopy.user && taskPropCopy.user.resign_date"
                          :offset="40" :user="taskPropCopy.user"/>
        <div v-else-if="currentExecutor.blocked || (taskPropCopy.user && taskPropCopy.user.blocked)"
             class="glyphicon-blocked" v-b-tooltip.hover title="Сотрудник заблокирован"></div>
      </div>
      <div class="response-action_form-action_field-date"
           :class="(taskPropCopy.type === 'call_center' || taskPropCopy.type === 'interview') ? '-sm' : '-xs'"
      >
        <div v-if="taskPropCopy.type !== 'support'" class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
        <date-picker v-if="taskPropCopy.type === 'call_center' || taskPropCopy.type === 'interview'"
                     v-model="taskPropCopy.planned_start_at"
                     lang="ru"
                     format="DD.MM.YYYY, HH:mm"
                     value-type="YYYY-MM-DDTHH:mm"
                     type="datetime"
                     placeholder="Дата не назначена"
                     :input-class="'input-plain' + (shownErrors.includes('planned_start_at') ? '-error' : '')"
                     :time-picker-options="timePickerOptionsTask"
                     :disabled="!editPermissions || !editPlannedAtPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                     @change="checkNewTime"
                     @focus="focusField('planned_start_at')"
        >
          <i slot="calendar-icon"/>
        </date-picker>
        <date-picker v-else-if="taskPropCopy.type !== 'support'"
                     v-model="taskPropCopy.planned_start_at"
                     lang="ru"
                     format="DD.MM.YYYY"
                     value-type="YYYY-MM-DD"
                     type="date"
                     placeholder="Дата"
                     :clearable="false"
                     :input-class="'input-plain -sm text-right' + (shownErrors.includes('planned_start_at') ? '-error' : '')"
                     :disabled="!editPermissions || (taskPropCopy.status !== 'new' && !editPlannedAtPermissions) || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                     @change="checkNewTime"
                     @focus="focusField('planned_start_at')"
        >
          <i slot="calendar-icon"/>
        </date-picker>
      </div>
    </div>
    <div class="response-task-parameters-current_task" :class="`-${taskPropCopy.status}`">
      {{ taskStatuses[taskPropCopy.status] }}
    </div>
    <div class="response-task-parameters-model" :class="{'-avatar': taskPropCopy.type === 'registration'}">
      <avatar-upload v-if="taskPropCopy.type === 'registration'"
                     v-model="taskPropCopy.model.avatar"
                     class="profile-main-info-avatar"
                     tag="registration-task-avatar"
                     size="-lg"
                     useClipper
                     :images-list="filesForAvatar"
                     context="registration"
                     @change="editUserAvatar"
      />
      <div class="response-task-parameters-model-main">
        <div v-if="(taskPropCopy.type === 'support') && taskPropCopy.recipient"
          class="response-task-parameters-model-main-support"
        >
          <avatar :url="taskPropCopy.recipient.avatar"
                  :telegram="taskPropCopy.recipient.telegram_connected"
                  :is-fin-admin="taskPropCopy.recipient.is_fin_admin"
                  class="profile-main-info-avatar_support"
                  size="-lg"
          />
          <div>
            <div class="response-task-parameters-full_name">{{taskPropCopy.recipient.fullname}}</div>
            <span class="text-gray">{{taskPropCopy.title}}</span>
          </div>
        </div>
        <input v-else-if="taskPropCopy.status === 'new'"
               placeholder="Введите название задачи"
               v-model="taskPropCopy.title"
               class="input-plain response-task-parameters-full_name -input "
               :class="shownErrors.includes('title') ? ' -error_text' : ''"
               @focus="focusField('title')"
        />
        <div v-else class="response-task-parameters-full_name cursor-pointer" @click="clickTaskTitle">
          {{ taskPropCopy.title }}
        </div>
        <div v-if="isShowGroup"
        >
          <span class="flag-icon mr-1" :class="`flag-icon-${taskPropCopy.group.flag || 'default'}`"
                :title="taskPropCopy.group.country"></span>
          <span class="text-gray mr-1">{{ taskPropCopy.group.city }}</span>
          <span>{{ taskPropCopy.group.office }}</span>
        </div>
      </div>
    </div>
    <b-form v-if="(activeTask === 'registration') && !taskPropCopy.is_repeat" class="card mt-3"
            @submit.prevent="registartionAction">
      <div class="card-body">
        <div class="response-action_form-title">
          <h4>{{
              (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed') ? 'Р' : 'Укажите р'
            }}абочий email и никнейм для модели</h4>
          <div v-if="(taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'completed')" class="helper-close"
               @click="closeForm"></div>
        </div>
        <email-field v-model="taskPropCopy.model.email"
                     class="form-control"
                     :error="shownErrors.includes('email')"
                     required
                     :disabled="(taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                     @focus="focusField('email')"
                     @input="setNicknameFromEmail"
        />
        <input v-model="taskPropCopy.model.model_nickname"
               placeholder="Введите никнейм"
               class="form-control"
               :class="shownErrors.includes('model_nickname') ? ' -error_text' : ''"
               required
               :disabled="(taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
               @focus="focusField('model_nickname')"
        />
        <div class="response-action_form-send_field -planned_date">
          <div class="response-action_form-action_field-date -lg">
            <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
            <date-picker
              v-model="taskPropCopy.next_planned_start_at"
              lang="ru"
              type="date"
              input-class="form-control response-action_form-action_field-block-date"
              :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
              :placeholder="formattedDateWithoutTime(taskPropCopy.result_date) || 'Выберите дату проверки'"
              :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'check')"
              format="DD.MM.YYYY"
              value-type="YYYY-MM-DD"
              @focus="focusField('next_planned_start_at')"
            >
              <i slot="calendar-icon"/>
            </date-picker>
          </div>
          <b-button
            v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'check')"
            size="md" variant="primary" type="submit">Добавить
          </b-button>
        </div>
      </div>
    </b-form>
    <b-form
      v-if="(activeTask === 'registration') && taskPropCopy.is_repeat && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'completed')"
      class="card mt-3" @submit.prevent="registartionAction">
      <div class="card-body">
        <div class="response-action_form-title -no_bottom">
          <h4>Укажите срок выполнения проверки аккаунтов</h4>
          <div class="helper-close" @click="closeForm"></div>
        </div>
        <div class="response-action_form-send_field -planned_date">
          <div class="response-action_form-action_field-date -lg">
            <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
            <date-picker
              v-model="taskPropCopy.next_planned_start_at"
              lang="ru"
              type="date"
              input-class="form-control response-action_form-action_field-block-date"
              :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
              placeholder="Выберите дату проверки"
              format="DD.MM.YYYY"
              value-type="YYYY-MM-DD"
              @focus="focusField('next_planned_start_at')"
            >
              <i slot="calendar-icon"/>
            </date-picker>
          </div>
          <b-button size="md" variant="primary" type="submit">Выполнить</b-button>
        </div>
      </div>
    </b-form>
    <b-form
      v-if="activeTask === 'checking_new' && (taskPropCopy.status !== 'archive' || taskPropCopy.status !== 'completed') "
      class="card mt-3" @submit.prevent="checkingNewAction">
      <div class="card-body">
        <div class="response-action_form-title -no_bottom">
          <h4>Укажите срок выполнения для доработки или создания аккаунтов</h4>
          <div class="helper-close" @click="closeForm"></div>
        </div>
        <div class="response-action_form-send_field -planned_date">
          <div class="response-action_form-action_field-date -lg">
            <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
            <date-picker
              v-model="taskPropCopy.next_planned_start_at"
              lang="ru"
              type="date"
              input-class="form-control response-action_form-action_field-block-date"
              :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
              placeholder="Выберите дату"
              format="DD.MM.YYYY"
              value-type="YYYY-MM-DD"
              @focus="focusField('next_planned_start_at')"
            >
              <i slot="calendar-icon"/>
            </date-picker>
          </div>
          <b-button size="md" variant="primary" type="submit">Выполнить</b-button>
        </div>
      </div>
    </b-form>
    <b-form
      v-if="activeTask === 'revision_new' && (taskPropCopy.status !== 'archive' || taskPropCopy.status !== 'completed') "
      class="card mt-3" @submit.prevent="revisionNewAction()">
      <div class="card-body">
        <div class="response-action_form-title -no_bottom">
          <h4>Укажите дату проверки для доработки аккаунтов</h4>
          <div class="helper-close" @click="closeForm"></div>
        </div>
        <div class="response-action_form-send_field -planned_date">
          <div class="response-action_form-action_field-date -lg">
            <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
            <date-picker
              v-model="taskPropCopy.next_planned_start_at"
              lang="ru"
              type="date"
              input-class="form-control response-action_form-action_field-block-date"
              :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
              placeholder="Выберите дату проверки"
              format="DD.MM.YYYY"
              value-type="YYYY-MM-DD"
              @focus="focusField('next_planned_start_at')"
            >
              <i slot="calendar-icon"/>
            </date-picker>
          </div>
          <b-button size="md" variant="primary" type="submit">Выполнить</b-button>
        </div>
      </div>
    </b-form>
  </div>
</template>

<script>
import avatar from "@/components/Common/Avatar/Avatar.vue";
import EmailField from "@/components/Common/EmailField.vue";
import UserResignIcon from "@/components/Common/UserResignIcon.vue";
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload.vue";
import {
  getOptionsCurrentUsersUpdated,
  makeIsEditTaskPermissions,
  taskStatuses,
  timePickerOptionsTask
} from "@/components/Task/utils/CommonTaskUtils";
import moment from "moment";
import DatePicker from '@/components/Common/Datepicker/index';
import Select from "@/components/Common/Select/Select.vue";

export default {
  name: "TaskExecutor",
  components: {
    AvatarUpload,
    UserResignIcon,
    EmailField,
    avatar,
    'custom-select': Select,
    'date-picker': DatePicker,
  },
  props: {
    taskPropCopy: {
      type: Object,
    },
    currentExecutor: {
      type: Object,
    },
    supportExecutorAndRequest: {
      type: Object
    },
    currentUsersUpdated: {
      type: Array,
    },
    shownErrors: {
      type: Array,
    },
    activeTask: {
      type: String,
    }
  },
  computed: {
    optionsCurrentUsersUpdated() {
      return getOptionsCurrentUsersUpdated({
        store: this.$store,
        currentUsersUpdated: this.currentUsersUpdated,
        taskPropCopy: this.taskPropCopy
      })
    },
    isShowGroup() {
      const taskPropCopy = this.taskPropCopy
      return taskPropCopy.group &&
        ((taskPropCopy.type === 'registration') ||
          (taskPropCopy.type === 'dossier') ||
          (taskPropCopy.type === 'restore_password') ||
          (taskPropCopy.type === 'checking_new') ||
          (taskPropCopy.type === 'revision_new') ||
          (taskPropCopy.type === 'reregistration') ||
          (taskPropCopy.type === 'checking') ||
          (taskPropCopy.type === 'password_change'))
    },
    taskStatuses() {
      return taskStatuses
    },
    timePickerOptionsTask() {
      return timePickerOptionsTask
    },
    filesForAvatar() {
      return this.taskPropCopy?.model?.albums?.first_album?.flatMap((album, key) => {
        let result = [];
        switch (key) {
          case 0:
          case 1:
            return;
          case 2:
            for (let imageType in album.attachments) {
              result.push(album.attachments[imageType]);
            }
            break;
          case 3:
            result = album.attachments;
        }
        return result?.map(image => image?.link);
      }).filter(image => !!image) || [];
    },
    focusField(fieldName) {
      this.$emit('focusField', fieldName)
    },
    editPermissions() {
      return makeIsEditTaskPermissions(this.$store, this.taskPropCopy)
    },
    editPlannedAtPermissions() {
      return this.userPermissions.task.planned_at_task
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    
    
  },
  methods: {
    getOptionsCurrentUsersUpdated,
    formattedDateWithoutTime(date) {
      return date ? moment(date).format('DD.MM.YYYY') : null
    },
    setNewExecutor(executor) {
      this.$emit("setNewExecutor", executor)
    },
    editUserAvatar() {
      if (!this.taskPropCopy.model?.avatar?.id) return;
      this.$store.dispatch('tasks/editTask', {
        id: this.taskPropCopy.id,
        avatar_attachment_id: this.taskPropCopy.model.avatar.id
      });
    },
    closeForm() {
      this.$emit('closeForm')
    },
    checkNewTime(time) {
      this.$emit('checkNewTime', time)
    },
    setNicknameFromEmail() {
      this.$emit('setNicknameFromEmail')
    },
    registartionAction() {
      this.$emit('registartionAction')
    },
    checkingNewAction() {
      this.$emit('checkingNewAction')
    },
    revisionNewAction() {
      this.$emit('revisionNewAction')
    },
    clickTaskTitle() {
      this.$emit('clickTaskTitle')
    },
  },
}
</script>

