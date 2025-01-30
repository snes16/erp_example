<template>
  <div class="edit_service">
    <div class="theme-helper-content-main-header">
      <template v-if="editedService.id && (service.status !== 'locked')">
        <button-throbber v-if="(editPermission || userPermissions.credential_status.change) && !shownBlockType"
                         class="mr-2"
                         variant="outline-primary"
                         size="sm"
                         color-throbber="primary"
                         :loading="isLoading"
                         @click="editService"
        >Сохранить</button-throbber>
        <b-button v-if="(editPermission || userPermissions.credential_status.change) && (service.status !== 'unimprovable')"
                  :variant="shownBlockType === 'blocking' ? 'danger' : 'outline-danger'"
                  size="sm"
                  :disabled="!!service.blocking_reason"
                  @click="showBlockingCard"
        >Сообщить о блокировке</b-button>
        <b-button v-if="(editPermission || userPermissions.credential_status.change) && (service.status === 'unimprovable')"
                  :variant="shownBlockType === 'improving' ? 'primary' : 'outline-primary'"
                  size="sm"
                  :disabled="!!service.blocking_reason"
                  @click="showImprovingCard"
        >Отправить на доработку</b-button>
        <i v-if="editPermission"
           class="edit_service-header-delete glyphicon glyphicon-trash"
           @click="deleteService"
        />
      </template>
      <b-button v-else-if="service.status !== 'locked'" variant="outline-primary" size="sm" @click="createService">Сохранить</b-button>
    </div>
    <div v-if="service.blocking_reason && service.blocking_reason.id" class="edit_service-blocking">
      <div class="card">
        <div class="card-body">
          <h4 class="mb-3">Причина блокировки</h4>
          <span class="edit_service-blocking-reason">{{ credentialBlockingReasons[service.blocking_reason.id] }}</span>
        </div>
      </div>
    </div>
    <div v-else-if="shownBlockType" class="edit_service-blocking">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">{{ shownBlockText }}</h4>
            <div class="helper-close" @click="hideBlockingCard"></div>
          </div>
          <custom-select v-if="shownBlockType === 'blocking'"
                         v-model="editedService.blocking_reason"
                         :options="credentialBlockingReasons"
                         class="-white mb-4"
                         :class="shownErrors.includes('blocking_reason') ? '-error_text' : ''"
                         default-text="Выберите причину"
                         :disabled="isLoading"
                         @change="focusField('blocking_reason')"
          />
          <div class="d-flex justify-content-between">
            <div class="response-action_form-action_field-date -md">
              <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
              <date-picker v-model="editedService.planned_start_at"
                           lang="ru"
                           type="date"
                           input-class="form-control"
                           :input-class="'input-plain' + (shownErrors.includes('planned_start_at') ? '-error' : '')"
                           placeholder="Выберите дату"
                           format="DD.MM.YYYY"
                           value-type="YYYY-MM-DD"
                           :disabled="isLoading"
                           @change="focusField('planned_start_at')"
              >
                <i slot="calendar-icon"/>
              </date-picker>
            </div>
            <button-throbber variant="primary"
                             :loading="isLoading"
                             @click="submitShownBlock"
            >Сохранить</button-throbber>
          </div>
        </div>
      </div>
    </div>
    <div class="edit_service-body">
      <h4 class="edit_service-body-title">Аккаунт на сервисе</h4>
      <span v-if="service.reason_history" class="edit_service-blocking-reason mb-3">{{ service.reason_history }}</span>
      <div class="edit_service-body-row">
        <div class="edit_service-body-row-col">
          <b>Название сервиса</b>
        </div>
        <div class="edit_service-body-row-col">
          <custom-select v-model="editedService.resource"
                         class="ml-3 pt-1 pb-1"
                         :disabled="areFieldsDisabled"
                         defaultText="Выберите сервис"
                         valueField="id"
                         :options="resources"
                         :class="shownErrors.includes('resource') ? '-error_text' : ''"
                         @change="focusField('resource')"
          />
        </div>
      </div>
      <div class="edit_service-body-row">
        <div class="edit_service-body-row-col">
          <b>Статус</b>
        </div>
        <div class="edit_service-body-row-col">
          <span v-if="service.status === 'unimprovable'" class="px-3">Требует доработки</span>
          <custom-select v-else
                         v-model="editedService.status"
                         class="ml-3 pt-1 pb-1"
                         :disabled="areFieldsDisabled"
                         defaultText="Выберите статус"
                         :options="serviceStatuses"
                         :class="shownErrors.includes('status') ? '-error_text' : ''"
                         @change="focusField('status')"
          />
        </div>
      </div>
      <div class="edit_service-body-row">
        <div class="edit_service-body-row-col">
          <b>Логин</b>
        </div>
        <div class="edit_service-body-row-col">
          <input v-model="editedService.login"
                 class="edit_service-body-row-col-input"
                 :class="[shownErrors.includes('login') ? '-error' : '', '-edit']"
                 placeholder="Введите логин"
                 :disabled="areFieldsDisabled"
                 @change="focusField('login')"
          />
        </div>
      </div>
      <div class="edit_service-body-row">
        <div class="edit_service-body-row-col">
          <b>Скриннейм</b>
        </div>
        <div class="edit_service-body-row-col">
          <input v-model="editedService.model_screen_name"
                 class="edit_service-body-row-col-input"
                 :class="[shownErrors.includes('model_screen_name') ? '-error' : '', '-edit']"
                 placeholder="Введите скреннейм"
                 :disabled="areFieldsDisabled"
                 autocomplete="new-password"
                 @change="focusField('model_screen_name')"
          />
        </div>
      </div>
      <div class="edit_service-body-row">
        <div class="edit_service-body-row-col">
          <b>Пароль</b>
        </div>
        <div class="edit_service-body-row-col">
          <password-field v-model="editedService.password"
                          class="px-3"
                          :class="shownErrors.includes('password') ? '-error' : ''"
                          placeholder="Введите пароль"
                          :disabled="areFieldsDisabled"
                          autocomplete="new-password"
                          @change="focusField('password')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import PasswordField from "@/components/Common/PasswordField/PasswordField";
import DatePicker from "@/components/Common/Datepicker";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
import { showToast } from "@/tools/tools";

export default {
  name: 'edit-service',
  props: {
    service: Object,
    userId: [Number, String],
    isMyProfile: Boolean
  },
  components: {
    'custom-select': Select,
    'password-field': PasswordField,
    'date-picker': DatePicker,
    ButtonThrobber,
  },
  data() {
    return {
      editedService: {},
      shownErrors: [],
      requiredFields: ['resource', 'login', 'password'],
      shownBlockType: null,
    }
  },
  computed: {
    resources() {
      return this.$store.state.dictionaries.resourcesWebcam;
    },
    serviceStatuses() {
      return this.$store.state.dictionaries.profileCredentialStatuses;
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    credentialBlockingReasons() {
      return this.$store.state.dictionaries.credentialBlockingReasons;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].service.edit;
    },
    shownBlockText() {
      switch (this.shownBlockType) {
        case 'blocking': return 'Статус аккаунта будет изменен';
        case 'improving': return 'Укажите дату доработки аккаунта';
      }
      return null;
    },
    isLoading() {
      return (this.profileStatus === 'editing-service') || (this.profileStatus === 'blocking-service');
    },
    areFieldsDisabled() {
      return this.isLoading || !this.editPermission || (this.service.status === 'locked');
    },
  },
  watch: {
    service: function (newService, prevService) {
      if (!newService?.id) this.$store.dispatch('layout/toggleHelper', false);
      else if (newService.blocking_reason?.id !== prevService.blocking_reason?.id) {
        this.editedService = {
          ...newService,
          blocking_reason: newService.blocking_reason ? newService.blocking_reason.id : null,
          resource: newService.resource?.id,
        };
        this.shownBlockType = null;
        showToast(this.$toasted, 'Причина блокировки добавлена в задачу проверки аккаунта');
      }
    }
  },
  created() {
    if (this.service) this.editedService = {
      ...this.service,
      blocking_reason: this.service.blocking_reason ? this.service.blocking_reason.id : null,
      resource: this.service.resource?.id,
    };
  },
  methods: {
    validate() {
      let errors = [];
      this.requiredFields.forEach(field => {
        if (!this.editedService[field]) errors.push(field)
      });
      this.shownErrors = errors;
      return !errors.length;
    },
    createService() {
      if (this.profileStatus === 'creating-service') return;
      if (!this.validate()) return;
      this.$store.dispatch('profile/createUserService', {...this.editedService, user: this.userId});
    },
    showBlockingCard() {
      this.shownBlockType = 'blocking';
      this.editedService = {...this.editedService, status: 'locked'};
    },
    showImprovingCard() {
      this.shownBlockType = 'improving';
    },
    hideBlockingCard() {
      this.shownBlockType = null;
      this.editedService = {...this.editedService, status: this.service.status};
    },
    editService() {
      if (!this.editedService.id) return;
      this.$store.dispatch('profile/editUserService', this.editedService);
    },
    deleteService() {
      this.$emit('deleteService');
    },
    submitShownBlock() {
      switch (this.shownBlockType) {
        case 'blocking': return this.blockAccount();
        case 'improving': return this.sendAccountToImprovement();
      }
    },
    blockAccount() {
      if (this.isLoading) return;
      if (!this.editedService.blocking_reason) return this.shownErrors.push('blocking_reason');
      if (!this.editedService.planned_start_at) return this.shownErrors.push('planned_start_at');
      this.editedService.next = {planned_start_at: this.editedService.planned_start_at};
      delete this.editedService.planned_start_at
      this.$store.dispatch('profile/blockUserService', this.editedService);
    },
    sendAccountToImprovement() {
      if (this.isLoading) return;
      if (!this.editedService.planned_start_at) return this.shownErrors.push('planned_start_at');
      this.$store.dispatch('profile/editUserService', {
        id: this.editedService.id,
        status: 'need_improved',
        login: this.editedService.login,
        password: this.editedService.password,
        next: {
          planned_start_at: this.editedService.planned_start_at,
        },
      });
    },
    focusField(fieldName) {
      this.shownErrors = this.shownErrors.filter(error => error !== fieldName);
      if (fieldName === 'status') {
        if (this.editedService.status === 'locked') return this.shownBlockType = 'blocking';
        else this.shownBlockType = null;
      }
    },
  }
}
</script>