<template>
  <responsible-users v-if="droverType === 'responsible-users'" :group="group" @back="closeDrover"/>
  <group-settings v-else-if="droverType === 'child-settings'"
                  :group="activeGroup"
                  :back-button="group.title"
                  @clickBack = "comeBack"
  />
  <add-groups v-else-if="droverType === 'addGroups'"
              @clickBack = "comeBack"
              :currentGroups="currentGroups"
              :back-button="group.title"
              :role="user.role"
              :userId="userId"
              :showGroupsForOperator="showGroupsForOperator"
              :currentMainGroupId="user.main_group.id"
              :isOnlyHomeGroup="true"
              :is-operator="isOperator"
  />
  <b-form v-else class="group_settings" @submit.prevent="submitForm">
    <b-modal
        id="resign_modal"
        centered
        :title='`Вы уверены, что хотите уволить пользователя?`'
        body-bg-variant="white"
        hide-header-close
        ok-title="Уволить"
        ok-variant="danger"
        cancel-title="Отменить"
        class="group_settings-error-resign_modal"
        cancel-variant="outline-primary"
        header-class="group_settings-error-resign_modal-header"
        body-class="group_settings-error-resign_modal-body"
        footer-class="group_settings-error-resign_modal-footer">
      <p class="mb-2">Укажите причину увольнения</p>
      <custom-select v-model="chosenResignReason"
                     :options="resignReasonsForSelect"
                     class="resign-select pt-2 pb-2 -white -alt"
                     :error="resignReasonError"
                     @click="activeUser(this.activeUser.id)"
                     defaultText="Выберите причину"
                     value-field="id"
                     returnWholeObject
                     @change="changeReasons"
      />
      <textarea v-model="resignComment"
                class="form-control resize-none mt-2 h-auto overflow-auto"
                placeholder="Комментарий к причине увольнения"
                rows="6"
                maxlength="350"
      />
      <template #modal-footer>
        <div class="m-0">
          <b-button variant="outline-primary" class="pl-4 pr-4" @click="$bvModal.hide('resign_modal')">Отменить</b-button>
          <b-button variant="danger" class="group_settings-error-button  pl-4 pr-4" @click="resignUser">
            <span>Уволить</span>
          </b-button>
        </div>
      </template>
    </b-modal>
    <div class="theme-helper-content-main-header">
      <b-button size="sm" variant="outline-primary" type="submit" class="theme-helper-content-main-header-button">Сохранить</b-button>
      <button-throbber v-if="!group.deactivate_at"
                       size="sm"
                       variant="outline-danger"
                       class="theme-helper-content-main-header-button"
                       colorThrobber="danger"
                       @click.prevent="deactivateRegion"
                       :class="isLoadingCheck ? 'group_settings-error-header-danger_borders' : ''"
                       :loading="isLoadingCheck"
                       :disabled="isLoadingCheck"
      >Деактивировать
      </button-throbber>
      <b-button v-if="!group.deactivate_at"
                size="sm"
                variant="outline-danger"
                class="theme-helper-content-main-header-button"
                @click="onClickDelete"
      >Удалить группу</b-button>
      <b-button v-if=" group.deactivate_at"
                size="sm"
                variant="outline-success"
                class="theme-helper-content-main-header-button throbber-button"
                :disabled="isLoading"
                @click="activateOffice"
      >
        <div v-if="isLoading" class="throbber-button-block">
          <throbber class="throbber -button -button-success"/>
        </div>
        <span :class="{ 'text-inherit': isLoading }">Активировать</span>
      </b-button>
    </div>
    <div v-if="backButton" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="prevGroup">
        <i class="fa fa-angle-left"></i>
        <span>{{ backButton }}</span>
      </div>
    </div>
    <div class="theme-helper-content-main-body">
      <deactivation-group v-if="showDeactivateBlock"
                          :group="group"
                          @mainGroup="mainGroupSelect"
                          @child="deactivateChild"
                          @activeUser="activeUser"
      />
      <div v-if="group.deactivate_at" class="group_settings-error-action_block">
        <div class="group_settings-error-action_form">
          <div class="response-action_form-title -no_border">
            <p class="response-action_form-title-text">
              Группа деактивирована</p>
            <div v-if="showDeactivateBlock" class="helper-close" @click="closeForm"></div>
          </div>
          <div class="response-action_form-action_field align-items-center p-0">
            <b class="ml-1">Дата деактивации</b>
            <div class="response-action_form-action_field-date input align-items-center p-0">
              <new_calendar_icon class="group_settings-error-calendar_icon"/>
              <date-picker
                  v-model="deactivatedDate"
                  lang="ru"
                  type="date"
                  placeholder="Выберите дату"
                  disabled
                  class="group_settings-error-date_picker"
                  :input-class="'input-plain' + (showError === 'empty-date' ? ' -error' : '')"
                  format="DD.MM.YYYY"
                  @input="showError = ''"
              >
                <i slot="calendar-icon"/>
              </date-picker>
            </div>
          </div>
        </div>
      </div>
      <b-modal id="deactivate_modal"
               centered
               hide-header-close
               :no-close-on-backdrop="isLoading"
               :title="`Вы точно хотите деактивировать ${ this.group.type === 'office' ? 'офис' : 'группу'} «${group.title}»?`"
               body-bg-variant="white"
               modal-class="group_settings-error-deactivation_modal"
               header-class="group_settings-error-deactivation_modal-header"
               body-class="group_settings-error-deactivation_modal-body"
               footer-class="group_settings-error-deactivation_modal-footer"
      >
        <template #modal-footer>
          <div class="m-0">
          <b-button variant="outline-primary" class="pl-4 pr-4" @click="$bvModal.hide('deactivate_modal')">Отменить</b-button>
          <b-button variant="danger" class="throbber-button group_settings-error-button  pl-4 pr-4" @click="editDeactivateOffice()">
            <div v-if="isLoading" class="throbber-button-block">
              <throbber class="throbber -button -button-white -button-larger"/>
            </div>
            <span :class="{ 'text-inherit': isLoading }">Деактивировать</span>
          </b-button>
          </div>
        </template>
        <span>{{this.group.type === 'office' ? 'Офис и сотрудники, находящиеся в нем, не будут доступны для работы, пока вы не активируете группу.' : 'Подгруппы и сотрудники, находящиеся в них, не будут доступны для работы, пока вы не активируете группу.'}}</span>
      </b-modal>
      <div class="group_settings-header">
        <h3 class="groups-details-card-header-data-title">
        <span v-if="group.type === 'country'" class="groups-details-card-header-data-title-flag flag-icon"
              :class="`flag-icon-${settings && settings.flag || 'default'}`"
        ></span>
          <input v-model="title"
                 v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 8}"
                 id="title"
                 type="text"
                 class="input-plain groups-details-card-header-data-title-text"
                 :disabled="group.deactivate_at"
          />
          <pen v-if="!group.deactivate_at"
                 for="title"
                 class="groups-details-card-header-data-title-btn "
          ></pen>
        </h3>
        <div class="groups-details-card-header-data-additional">
          <span class="groups-details-card-header-data-additional-type">{{ groupTypes[group.type] }}</span>
          <color-picker v-model="color" id="color-edit" title="Цвет группы" :disabled="group.deactivate_at !== null"/>
        </div>
      </div>
      <div v-if="group.type === 'office'" class="group_settings-block">
        <div class="group_settings-block-header">
          <h4>Основные параметры</h4>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>Код группы</b>
          </div>
          <div class="col-6">
            <input v-model="settings.code"
                   id="settings-code"
                   class="input-plain"
                   placeholder="Введите код"
                   :disabled="group.deactivate_at"
            />
          </div>
        </div>
        <div v-if="group.sub_type === 'model'" class="group_settings-block-row row">
          <div class="col-6">
            <b>Количество комнат</b>
          </div>
          <div class="col-6">
            <input v-model="settings.count_rooms"
                   :disabled="group.deactivate_at"
                   class="input-plain"
                   id="settings-count_rooms"
                   placeholder="Введите количество"
                   required
            />
          </div>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>IP адрес офиса</b>
          </div>
          <div class="col-6">
            <input v-model="settings.ip"
                   id="settings-ip"
                   class="input-plain"
                   placeholder="Введите IP"
                   :disabled="group.deactivate_at"
            />
          </div>
        </div>
      </div>
      <div v-else-if="group.type === 'country'" class="group_settings-block">
        <div class="group_settings-block-header">
          <h4>Основные параметры</h4>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>Код телефона</b>
          </div>
          <div class="col-6">
            <input v-model="settings.phone_code" class="input-plain" id="settings-phone_code"
                   placeholder="Введите код"/>
          </div>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>Количество символов в номере</b>
          </div>
          <div class="col-6">
            <input v-model="settings.length_phone" class="input-plain" id="settings-max_length_phone"
                   placeholder="Введите количество"/>
          </div>
        </div>
      </div>
      <div v-else class="group_settings-block">
        <div class="group_settings-block-header">
          <h4>Основные параметры</h4>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>Код группы</b>
          </div>
          <div class="col-6">
            <input v-model="settings.code" class="input-plain" id="settings-code" placeholder="Введите код"/>
          </div>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>Часовой пояс</b>
          </div>
          <div class="col-6">
            <custom-select v-model="settings.timezone"
                           :options="timezones"
                           id="settings-timezone"
                           defaultText="Выберите часовой пояс"
                           required
            />
          </div>
        </div>
        <div class="group_settings-block-row row">
          <div class="col-6">
            <b>Офис по-умолчанию при создании заявки</b>
          </div>
          <div class="col-6">
            <custom-select v-model="settings.default_office"
                           :options="modelOffices"
                           id="settings-default_office"
                           defaultText="Выберите офис"
                           returnWholeObject
            />
          </div>
        </div>
      </div>
      <template v-if="arePercentagesPermitted">
        <group-setting-payment-percentage v-if="group.sub_type !== 'operator'"
                                          v-model="settings.payment_percentages.model"
                                          id="model"
                                          ref="group_settings-payment-model"
                                          users-title="модели"
                                          with-collapse
        />
        <group-setting-payment-percentage v-if="group.sub_type !== 'model'"
                                          v-model="settings.payment_percentages.operator"
                                          id="operator"
                                          ref="group_settings-payment-operator"
                                          users-title="оператора"
                                          with-collapse
        />
        <group-setting-payment-percentage v-if="group.sub_type !== 'operator'"
                                          v-model="settings.payment_percentages.solo_model"
                                          id="solo_model"
                                          ref="group_settings-payment-solo_model"
                                          users-title="Соло модели"
                                          with-collapse
        />
      </template>
      <div v-if="group.type === 'city'" class="group_settings-block">
        <div class="group_settings-block-header">
          <h4>Настройки смен</h4>
          <p>Настройте обязательное количество смен и время периодов</p>
        </div>
        <div class="group_settings-settings-table">
          <div class="group_settings-settings-table-quantity">
            <div class="group_settings-settings-table-quantity-title">Минимальное количество смен</div>
            <input v-model="settings.min_shifts" class="group_settings-settings-table-quantity-value" type="number"
                   id="settings-min_shifts" placeholder="0"
                   v-autowidth="{maxWidth: '20px', minWidth: '8px', comfortZone: 8}">
          </div>
          <div class="group_settings-settings-table-period_field">
            <div v-for="(shift, key) in settings.work_shift" :key="key"
                 class="group_settings-settings-table-period_field-period">
              <div class="group_settings-settings-table-period_field-period-title">Период {{ key + 1 }}</div>
              <div class="group_settings-settings-table-period_field-period-time_period">
                <div class="group_settings-settings-table-period_field-period-time_period-first">
                  <p>C</p>
                  <date-picker class="hide_styles_datepicker" v-model="shift.from" :id="`settings-shift-${key}-from`"
                               lang="ru" type="time" placeholder="00:00" :time-picker-options="time_periods"
                               format="HH:mm">
                    <i style="display: none;" slot="calendar-icon"/>
                  </date-picker>
                  <span class="glyphicon glyphicon-time"/>
                </div>
                <div class="group_settings-settings-table-period_field-period-time_period-second">
                  <p>До</p>
                  <date-picker class="hide_styles_datepicker" v-model="shift.to" :id="`settings-shift-${key}-to`"
                               lang="ru" type="time" placeholder="00:00" :time-picker-options="time_periods"
                               format="HH:mm">
                    <i style="display: none;" slot="calendar-icon"/>
                  </date-picker>
                  <span class="glyphicon glyphicon-time"/>
                </div>
                <div v-if="settings.work_shift.length > 1"
                     class="group_settings-settings-table-period_field-period-delete btn-remove"
                     :id="`settings-shift-${key}-delete`" @click="deletePeriod(shift)"/>
              </div>
            </div>
          </div>
          <div class="group_settings-settings-add_period" id="settings-shift-add" @click="addPeriod">
            <p class="group_settings-settings-add_period-text">Добавить период</p>
            <div class="group_settings-settings-add_period-image btn-add"/>
          </div>
        </div>
      </div>
      <div v-if="group.type && (group.sub_type !== 'operator') && showResponsibleUsersBlock" class="group_settings-block pb-2">
        <div class="group_settings-block-header">
          <h4>Ответственные по задачам</h4>
          <div class="model_mini_profile-schedule-edit" @click="openResponsibleUsers">
            <span>Изменить</span>
            <pen/>
          </div>
        </div>
      </div>
    </div>
  </b-form>
</template>

<script>
import moment from 'moment';
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";
import ColorPicker from "@/components/Common/ColorPicker/ColorPicker";
import ResponsibleUsers from "@/pages/Organization/Groups/components/ResponsibleUsers";
import GroupSettingPaymentPercentage from "@/pages/Organization/Groups/components/GroupSettingPaymentPercentage";
import AddGroups from "@/pages/Profile/components/AddGroups/AddGroups.vue";
import {findInListRecursively, getTypeEditUser, showToast} from "@/tools/tools";
import throbber from "@/assets/vue-svg/throbber.svg";
import resignUser from "@/assets/vue-svg/resign-user.svg";
import pen from "@/assets/vue-svg/pen.svg";
import deactivation from "@/assets/vue-svg/deactivation.svg";
import DeactivationGroup from "@/pages/Organization/Groups/components/GroupSettings/DeactivationGroup/DeactivationGroup.vue";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import new_calendar_icon from "@/assets/vue-svg/calendar_icon.svg";

export default {
  name: 'group-settings',
  components: {
    ButtonThrobber,
    'date-picker': DatePicker,
    'custom-select': Select,
    'color-picker': ColorPicker,
    'resign-user': resignUser,
    'new_calendar_icon': new_calendar_icon,
    AddGroups,
    ResponsibleUsers,
    DeactivationGroup,
    GroupSettingPaymentPercentage,
    'throbber': throbber,
    'pen': pen,
    'deactivation': deactivation,
  },
  props: {
    group: Object,
    backButton: String
  },
  data() {
    return {
      moment: moment,
      settings: {psych_enabled: false, video_enabled: false, min_shifts: 4, work_shift: []},
      time_periods: {start: '00:00', step: '00:30', end: '23:30'},
      editedGroup: {},
      title: this.group.title,
      color: this.group.color,
      showError: '',
      showDeactivateBlock: false,
      deactivatedDate: this.group.deactivate_at,
      isLoading: false,
      droverType: null,
      userId: null,
      showGroupsForOperator: false,
      resignReasonError: null,
      resignComment: '',
      chosenResignReason: {},
      childGroupId: null,
      user: {},
      isOperator : false
    }
  },
  computed: {
    timezones() {
      return this.$store.state.dictionaries.timezones;
    },
    status() {
      return this.$store.state.groups.status;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    isLoadingCheck() {
      if (this.status === 'fetching')
        return true;
    },
    groupTypes() {
      return this.$store.state.groups.groupTypes;
    },
    modelOffices() {
      if (!this.group?.children?.length) return [];
      return this.group.children.filter(group => group.sub_type === 'model');
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    showResponsibleUsersBlock() {
      for (let type in this.userPermissions.task) {
        if ((type === 'custom') || (type === 'dossier') || (type === 'restore_password') || (type === 'my')) continue;
        if (this.userPermissions.task[type].view) return true;
      }
      return false;
    },
    arePercentagesPermitted() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
    deactivationInfo() {
      return this.$store.state.groups.deactivationInfo;
    },
    readyDeactivate() {
      if (this.deactivationInfo.children?.length === 0 && this.deactivationInfo.models_workshifts?.length === 0 && this.deactivationInfo.staff?.length === 0)
        return true;
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    users() {
      return this.$store.state.profile.currentModels;
    },
    resignReasonsForSelect() {
      return  [...this.resignReasons.filter(reason => reason.role_type === this.user.role?.type), {title: 'Другое', id: 'other'}];
    },
    resignReasons() {
      return this.$store.state.dictionaries.resignReasons;
    },
    currentGroups() {
      const fieldName = this.showGroupsForOperator ? 'groups' : 'operator_groups';
      return this.profile?.profile?.[fieldName]?.map(group => group.id) || [];
    },
    activeGroup() {
      return findInListRecursively(this.groups, (group) => group.id === this.childGroupId);
    },
  },
  watch: {
    group: function (nextGroup) {
      if (this.group.sub_type !== 'operator') this.settings = nextGroup.settings ? JSON.parse(JSON.stringify(nextGroup.settings)) : {
        psych_enabled: false,
        video_enabled: false,
        min_shifts: 4,
        work_shift: [],
      };
      this.editedGroup = {...nextGroup};
    },
    settings: function () {
      this.settings.work_shift = this.settings.work_shift.map(shift => ({
        ...shift,
        from: `1970-01-01T${shift.from}:00`,
        to: `1970-01-01T${shift.to}:00`,
      }));
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'editing':
            if (!this.backButton)
            break;
          case 'fetching':
            if (this.readyDeactivate)
              this.$bvModal.show('deactivate_modal');
            this.showDeactivateBlock = true;
            break;
        }
      }
    },
    userStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'editing':
            this.$store.dispatch('groups/deactivateGroupCheck', this.group.id);
            if (!this.backButton)
              showToast(this.$toasted, `Сотрудник "${this.user?.fullname || this.user?.uid}" уволен`);
            break;
          case 'editing-groups':
            if (!this.backButton)
              showToast(this.$toasted, 'Основная группа для сотрудника успешно изменена');
            break;
        }
      }
    },
  },
  created() {
    const headerElement = document.querySelector('.theme-helper-content-main-header');
    if (headerElement) {
      headerElement.scrollIntoView({
        block: 'start'
      });
    }
    this.$store.dispatch('groups/clearDeactivationData');
    this.settings = this.group.settings ? JSON.parse(JSON.stringify(this.group.settings)) : {
      psych_enabled: false,
      video_enabled: false,
      min_shifts: 4,
      work_shift: [],
    };
    this.editedGroup = {...this.group};
  },
  methods: {
    deactivateChild( params ) {
      this.droverType = 'child-settings';
      this.childGroupId = params.child.id;
    },
    comeBack() {
      this.droverType = '';
      this.$store.dispatch('groups/deactivateGroupCheck', this.group.id);
      this.showDeactivateBlock = true;
    },
    prevGroup() {
      this.$emit('clickBack');
    },
    mainGroupSelect() {
      this.droverType = 'addGroups';
    },
    activeUser(user) {
      this.user = user;
      this.userId = user.id;
      this.chosenResignReason = {};
      this.resignComment = '';
    },
    resignUser(bvModalEvt) {
      bvModalEvt.preventDefault();
      if (!this.chosenResignReason.title) {
        this.resignReasonError = true;
        return;
      }
      this.editVariant = 'resigning';
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.userId,
        resign: this.chosenResignReason.title,
        resign_comment: this.resignComment,
        is_resign: true
      });
      this.$nextTick(() => {
        this.$bvModal.hide('resign_modal');
      })
    },
    changeReasons() {
      this.resignReasonError = false
    },
    submitForm() {
      if (this.status === 'editing') return;
      let settingsCopy = JSON.parse(JSON.stringify(this.settings));
      if (this.arePercentagesPermitted) {
        const payment_percentages = {};
        for (const userType in settingsCopy.payment_percentages) {
          if ((userType === 'operator') && (this.group.sub_type === 'model')) continue;
          if (((userType === 'model') || (userType === 'solo_model')) && (this.group.sub_type === 'operator')) continue;
          if (!this.$refs[`group_settings-payment-${userType}`].validate()) return;
          payment_percentages[userType] = settingsCopy.payment_percentages[userType]
              .filter(percentage => percentage.amount_to && percentage.percent)
              .map(percentage => ({
                amount_to: parseFloat(percentage.amount_to),
                percent: parseFloat(percentage.percent),
              }));
        }
        settingsCopy.payment_percentages = payment_percentages;
      }
      settingsCopy.work_shift = settingsCopy.work_shift.map(function (shift) {
        shift.from = moment(shift.from).format('HH:mm');
        shift.to = moment(shift.to).format('HH:mm');
        return shift;
      });
      settingsCopy.min_shifts = Number(settingsCopy.min_shifts);
      settingsCopy.length_phone = settingsCopy.length_phone ? parseInt(settingsCopy.length_phone) : null;
      settingsCopy.count_rooms = settingsCopy.count_rooms ? parseInt(settingsCopy.count_rooms) : null;
      settingsCopy.default_office = settingsCopy.default_office ? settingsCopy.default_office.id : null;
      this.$store.dispatch('groups/editGroup', {
        id: this.group.id,
        settings: settingsCopy,
        title: this.title,
        color: this.color,
      });
    },
    addPeriod() {
      this.settings.work_shift.push({from: '1970-01-01T00:00:00', to: '1970-01-01T00:00:00'});
    },
    clickBack() {
      this.$emit('clickBack');
    },
    deletePeriod(shift) {
      let workShiftsCopy = [...this.settings.work_shift],
          deletedWorkShiftIndex = workShiftsCopy.findIndex((oldShift) => oldShift === shift);
      if (deletedWorkShiftIndex === -1) return;
      workShiftsCopy.splice(deletedWorkShiftIndex, 1);
      this.settings.work_shift = workShiftsCopy;
    },
    deactivateRegion() {
      this.$store.dispatch('groups/deactivateGroupCheck', this.group.id)
    },
    onClickDelete() {
      this.$emit('delete');
    },
    activateOffice() {
      this.editDeactivateOffice();
    },
    editDeactivateOffice() {
      if (!this.isLoading) {
        this.isLoading = true;
        let currentGroup = {...this.group}
        delete currentGroup.children;
        delete currentGroup.rooms;
        delete currentGroup.users;
        delete currentGroup.parent;
        delete currentGroup.settings;
        !currentGroup.deactivate_at ?
            currentGroup.deactivate_at = moment().format('YYYY-MM-DD') :
            currentGroup.deactivate_at = null;
        this.$store.dispatch('groups/editGroup', currentGroup).then(() => {
          if (currentGroup.deactivate_at) this.$bvModal.hide('deactivate_modal');
          else this.deactivatedDate = null;
          showToast(this.$toasted, `Группа ${currentGroup?.deactivate_at ? 'деактивирована' : 'активирована'}`);
          this.isLoading = false;
          !this.backButton ? this.$store.dispatch('layout/toggleHelper', false) : this.prevGroup();
        })
      }
    },
    closeForm() {
      this.showDeactivateBlock = false;
    },
    openResponsibleUsers() {
      this.droverType = 'responsible-users';
    },
    closeDrover() {
      this.droverType = '';
    },
  }
}
</script>