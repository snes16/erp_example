<template>
  <div class="response-action_form">
    <div v-if="taskPropCopy.status === 'check'">
      <div class="response-action_form-title">
        <p class="response-action_form-title-text">Обнаружена модель с такими же данными</p>
      </div>
      <div v-if="taskPropCopy.model" class="response-action_form-user">
        <avatar class="mr-2"
                :url="taskPropCopy.model.avatar"
                is-large
                :telegram="taskPropCopy.model.telegram_connected"
                :is-fin-admin="taskPropCopy.model.is_fin_admin"
        />
        <div class="response-action_form-user-item">
          <div class="d-flex flex-wrap cursor-pointer" @click="clickUser(taskPropCopy.model)">
            <b v-if="taskPropCopy.model.uid" class="text-gray mr-1">{{ taskPropCopy.model.uid }}</b>
            <b v-if="taskPropCopy.model.fullname">{{ taskPropCopy.model.fullname }}</b>
            <template v-if="taskPropCopy.model.is_resign">
              <div :id="`resign_info-${taskPropCopy.model.id}`" class="glyphicon-fired ml-1"></div>
              <b-tooltip :target="`resign_info-${taskPropCopy.model.id}`" triggers="hover">
                <div class="profile-main-info-data-resign-tooltip">
                  <div>Сотрудник уволен</div>
                  <div><b>Причина увольнения:</b> {{ taskPropCopy.model.resign }}</div>
                </div>
              </b-tooltip>
            </template>
            <div v-else-if="taskPropCopy.model.blocked" class="glyphicon-blocked ml-1" v-b-tooltip.hover title="Сотрудник заблокирован"></div>
          </div>
          <div v-if="taskPropCopy.model.model_nickname" class="d-flex align-items-center">
            <at class="mr-1"/>
            <b>{{ taskPropCopy.model.model_nickname }}</b>
          </div>
        </div>
      </div>
      <div v-if="isSuperAdmin">
        <div v-if="taskPropCopy.model && parameter.value" v-for="(parameter, key) in parametersDuplicate" class="row align-items-center pt-4">
          <div class="col-sm-6 col-xs-12 mb-1">
            <b>{{ parameter.label }}</b>
          </div>
          <div class="col-sm-6 col-xs-12 mb-1 d-flex align-items-center">
            <div v-if="parameter.field === 'birthday'"  class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
            {{ parameter.value }}
            <template v-if="parameter.duplicate">
              <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" :id="`task-duplicated-field-${key}`"/>
              <b-tooltip :target="`task-duplicated-field-${key}`"
                         triggers="hover"
                         placement="top"
              >
                <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
              </b-tooltip>
            </template>
          </div>
        </div>
        <div class="response-action_form-buttons">
          <b-button variant="outline-primary" class="mr-2" @click="openModalConfirm('create')">Создать новый профиль</b-button>
          <b-button variant="outline-primary" class="mr-2" @click="openModalConfirm('join')">Объединить профили</b-button>
        </div>
      </div>
      <div v-else>
        <span>Для решения проблемы сообщите об этом администратору.</span>
        <div class="response-action_form-buttons justify-content-end">
          <b-button variant="primary" class="mr-2" @click="copyLinkTask">Скопировать ссылку на задачу</b-button>
        </div>
      </div>
    </div>
    <div v-else >
      <div class="response-action_form-title">
        <p class="response-action_form-title-text">Профиль модели обновлен с новыми данными</p>
      </div>
      <div class="response-action_form-user">
        <avatar class="mr-2"
                :url="taskPropCopy.model.avatar"
                is-large
                :telegram="taskPropCopy.model.telegram_connected"
                :is-fin-admin="taskPropCopy.model.is_fin_admin"
        />
        <div class="response-action_form-user-item">
          <div class="d-flex flex-row align-items-center">
            <b v-if="taskPropCopy.model.uid" class="text-gray mr-1">{{ taskPropCopy.model.uid }}</b>
            <b v-if="taskPropCopy.model.fullname">{{ taskPropCopy.model.fullname }}</b>
            <template v-if="taskPropCopy.model.is_resign">
              <div :id="`resign_info-${taskPropCopy.model.id}`" class="glyphicon-fired ml-1"></div>
              <b-tooltip :target="`resign_info-${taskPropCopy.model.id}`" triggers="hover">
                <div class="profile-main-info-data-resign-tooltip">
                  <div>Сотрудник уволен</div>
                  <div><b>Причина увольнения:</b> {{ taskPropCopy.model.resign }}</div>
                </div>
              </b-tooltip>
            </template>
            <div v-else-if="taskPropCopy.model.blocked" class="glyphicon-blocked ml-1" v-b-tooltip.hover title="Сотрудник заблокирован"></div>
          </div>
          <span v-if="taskPropCopy.model.main_group && taskPropCopy.model.main_group.office">{{ taskPropCopy.model.main_group.office }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import avatar from "@/components/Common/Avatar/Avatar.vue";
import at from "@/assets/vue-svg/at.svg";

export default {
  components: {at, avatar},
  props: {
    taskPropCopy: Object,
    parametersDuplicate: Array
  },
  computed: {
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN'
    },
  },
  methods: {
    clickUser(model) {
      this.$emit("clickUser", model);
    },
    openModalConfirm(type) {
      this.$emit("openModalConfirm", type);
    },
    copyLinkTask() {
      this.copyTextToClipboard(window.location.href);
    },
  }
};
</script>
