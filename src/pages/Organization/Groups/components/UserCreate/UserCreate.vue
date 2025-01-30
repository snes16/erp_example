<template>
  <div class="user_create">
    <form v-if="droverType === null" class="theme-helper-content-main" @submit.prevent="submitForm(false)">
      <div class="user_create-header">
        <b-button variant="outline-primary" size="sm" id="user-create-submit" type="submit">Создать сотрудника</b-button>
      </div>
      <div v-if="group" class="user_create-subheader">
        <div class="user_create-subheader-back" id="user-create-back" @click="goBack">< {{ group.title }}</div>
      </div>
      <div class="user_create-body">
        <div class="user_create-body-main">
          <avatar-upload v-model="user.avatar"
                         class="user_create-body-main-avatar"
                         id="user-create-avatar"
                         useClipper
                         tag="create-user-drover-avatar"
                         context="manager_avatar"
          />
          <div class="user_create-body-main-info">
            <div class="user_create-body-main-info-name">
              <input v-model="user.surname" placeholder="Фамилия" type="text" required
                     class="input-plain user_create-body-main-info-name" id="user-create-surname"
                     v-autowidth="{maxWidth: '100%', minWidth: '20px', comfortZone: 4}"
                     :class="shownErrors.includes('surname') ? ' -error' : ''" @focus="focusField('surname')"/>
              <input v-model="user.name" placeholder="Имя" type="text" required
                     class="input-plain user_create-body-main-info-name" id="user-create-name"
                     v-autowidth="{maxWidth: '400px', minWidth: '20px', comfortZone: 4}"
                     :class="shownErrors.includes('name') ? ' -error' : ''" @focus="focusField('name')"/>
              <input v-model="user.patronymic" placeholder="Отчество" type="text"
                     class="input-plain user_create-body-main-info-name" id="user-create-patronymic"
                     v-autowidth="{maxWidth: '100%', minWidth: '20px', comfortZone: 0}"
                     :class="shownErrors.includes('patronymic') ? ' -error' : ''" @focus="focusField('patronymic')"/>
            </div>
            <div class="d-flex">
              <custom-select v-if="!pageRoleCode"
                             v-model="user.role"
                             valueField="id"
                             :options="roles"
                             id="user-create-role"
                             required
                             defaultText="Выберите роль"
              />
              <span v-else class="mr-2">{{ pageRole.title }}</span>
              <custom-select v-model="user.position"
                             valueField="id"
                             :options="positions"
                             id="user-create-position"
                             :required="isUserStandardEmployee"
                             defaultText="Выберите должность"
              />
            </div>
          </div>
        </div>
        <div v-if="duplicateModel.id" class="user_create-body-duplicate">
          <div class="user_create-body-duplicate-title" :style="'border-bottom: none;'">
            <p class="user_create-body-duplicate-title-text">Обнаружена модель с такими же данными</p>
          </div>
          <div class="user_create-body-duplicate-user">
            <div class="avatar mr-2"
                 :style="duplicateModel.avatar ? `background-image: url(${duplicateModel.avatar}); background-size: cover;` : ''"></div>
            <div class="user_create-body-duplicate-user-item">
              <div class="d-flex flex-row align-items-center" @click="openDuplicatedModelDetails">
                <b v-if="duplicateModel.uid" class="text-gray mr-1">{{ duplicateModel.uid }}</b>
                <b v-if="duplicateModel.fullname">{{ duplicateModel.fullname }}</b>
                <template v-if="duplicateModel.is_resign">
                  <div :id="`resign_info-${duplicateModel.id}`" class="glyphicon-fired ml-1"></div>
                  <b-tooltip :target="`resign_info-${duplicateModel.id}`" triggers="hover">
                    <div class="profile-main-info-data-resign-tooltip">
                      <div>Сотрудник уволен</div>
                      <div><b>Причина увольнения:</b> {{ duplicateModel.resign }}</div>
                    </div>
                  </b-tooltip>
                </template>
                <div v-else-if="duplicateModel.blocked" class="glyphicon-blocked ml-1" v-b-tooltip.hover
                     title="Сотрудник заблокирован"></div>
              </div>
              <span v-if="duplicateModel.main_group && duplicateModel.main_group.office">{{
                  duplicateModel.main_group.office
                }}</span>
            </div>
          </div>
          <div>
            <div v-if="duplicateModel.surname" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Фамилия</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center" @click="openDuplicatedModelDetails">
                {{ duplicateModel.surname }}
                <template v-if="duplicatedModelsFields.surname">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-surname"/>
                  <b-tooltip target="duplicated-field-name"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div v-if="duplicateModel.name" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Имя</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center" @click="openDuplicatedModelDetails">
                {{ duplicateModel.name }}
                <template v-if="duplicatedModelsFields.name">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-name"/>
                  <b-tooltip target="duplicated-field-name"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div v-if="duplicateModel.phone" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Телефон</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center">
                {{ duplicateModel.phone }}
                <template v-if="duplicatedModelsFields.phone">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-phone"/>
                  <b-tooltip target="duplicated-field-phone"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div v-if="duplicateModel.additional_phone" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Дополнительный телефон</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center">
                {{ duplicateModel.additional_phone }}
                <template v-if="duplicatedModelsFields.additional_phone">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-additional_phone"/>
                  <b-tooltip target="duplicated-field-additional_phone"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div v-if="duplicateModel.email" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Email</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center">
                {{ duplicateModel.email }}
                <template v-if="duplicatedModelsFields.email">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-email"/>
                  <b-tooltip target="duplicated-field-email"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div v-if="duplicateModel.document_number" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Номер документа</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center">
                {{ duplicateModel.document_number }}
                <template v-if="duplicatedModelsFields.document_number">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-document_number"/>
                  <b-tooltip target="duplicated-field-document_number"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div v-if="duplicateModel.birthday" class="row align-items-center pt-4">
              <div class="col-6 mb-1">
                <b>Дата рождения</b>
              </div>
              <div class="col-6 mb-1 pl-1 d-flex align-items-center">
                <div class="profile_main-card-body-row-value-icon glyphicon glyphicon-glyph-calendar"/>
                {{ formattedDate(duplicateModel.birthday) }}
                <template v-if="duplicatedModelsFields.birthday">
                  <div class="glyphicon glyphicon-attention workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new" id="duplicated-field-birthday"/>
                  <b-tooltip target="duplicated-field-birthday"
                             triggers="hover"
                             placement="top"
                  >
                    <div class="text-center">Пользователь с такими данными<br/>уже есть в системе.</div>
                  </b-tooltip>
                </template>
              </div>
            </div>
            <div class="user_create-body-duplicate-buttons">
              <b-button variant="primary" class="mr-2" v-b-modal.modal_confirm_create>Создать</b-button>
            </div>
          </div>
        </div>
        <div v-if="!group" class="user_details-main-groups">
          <h4>Группы</h4>
          <b-badge v-if="mainGroupBadgeCounter" pill variant="primary" class="user_details-main-groups-badge">
            {{ mainGroupBadgeCounter }}
          </b-badge>
          <div v-if="user.role"
               class="user_details-main-groups-edit"
               id="details-groups"
               @click="editGroups"
          >
            <span>Добавить</span>
            <plus-circled class="ml-2"/>
          </div>
          <template v-else>
            <div class="user_details-main-groups-edit -disabled" id="details-groups">
              <span>Добавить</span>
              <plus-circled class="ml-2"/>
            </div>
            <b-tooltip target="details-groups" triggers="hover">
              <div class="p-1 text-left">
                <span>Чтобы выбрать группу, сначала<br/>необходимо выбрать роль</span>
              </div>
            </b-tooltip>
          </template>
        </div>
        <div v-if="!group && (currentRole.type === 'operator')" class="user_details-main-groups">
          <h4>Доступ к группам</h4>
          <b-badge v-if="newUserGroups.groups && newUserGroups.groups.length" pill variant="primary" class="user_details-main-groups-badge">
            {{ newUserGroups.groups.length }}
          </b-badge>
          <div class="user_details-main-groups-edit"
               id="operator-details-groups"
               @click="editOperatorGroups"
          >
            <span>Добавить</span>
            <plus-circled class="ml-2"/>
          </div>
        </div>
        <div class="user_create-body-collapse">
          <div class="user_create-body-collapse-title" @click="changeCollapse('additional')">
            <h4>Дополнительная информация</h4>
            <i :class="`fa fa-angle-${collapseState.additional ? 'up' : 'down'}`"/>
          </div>
          <b-collapse v-model="collapseState.additional" id="collapse-additional">
            <div class="row align-items-center mt-4 mb-2">
              <div class="col-6">
                <b>Источник прихода</b>
              </div>
              <div class="col-6">
                <custom-select v-model="user.source_user"
                               :options="usersOptions"
                               class="response-info_data-select"
                               valueField="id"
                               titleField="title"
                               defaultText="Выберите пользователя"
                               :error="shownErrors.includes('source_user')"
                               returnWholeObject
                               infinityScroll
                               searchableRequest
                               @change="focusField('source_user')"
                               @getNextPage="getSourceUsersNextPage"
                               @searchList="searchSourceUsers"

                >
                  <template v-slot:chosen-variant="props">
                  <span v-if="props.value" class="text-dark">
                        <b>{{ props.value.surname }}</b>
                        <div v-if="props.value.main_group.build_group.id" class="profile_main-card-body-row-value-group">
                            <span class="flag-icon mr-1" :class="`flag-icon-${props.value.main_group.build_group.flag || 'default'}`" :title="props.value.main_group.build_group.country"></span>
                            <span class="text-gray mr-1">{{ props.value.main_group.build_group.city }}</span>
                            <span v-if="props.value.main_group.build_group.office">
                              {{ props.value.main_group.build_group.office }}
                            </span>
                        </div>
                   </span>
                    <span v-else>{{ props.shownText }}</span>
                  </template>
                  <template v-slot:list-variant="props">
                    <div class="d-flex align-items-center">
                      <div v-if="props.variant.id" class="avatar mr-2"
                           :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>
                      <template v-if="!props.variant.uid || !props.variant.surname">
                        {{ props.variant.uid || props.variant.surname }}
                      </template>
                      <template v-else>
                        <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                        <span>{{ props.variant.surname }}</span>
                      </template>
                    </div>
                  </template>
                </custom-select>
              </div>
            </div>
          </b-collapse>
        </div>
        <div class="user_create-body-collapse">
          <div class="user_create-body-collapse-title" @click="changeCollapse('main')">
            <h4>Данные сотрудника</h4>
            <i :class="`fa fa-angle-${collapseState.main ? 'up' : 'down'}`"/>
          </div>
          <b-collapse v-model="collapseState.main" id="collapse-additional">
            <div class="user_create-body-additional">
              <template v-if="isUserModel">
                <div class="row user_create-body-additional-field">
                  <div class="col-6">
                    <b>Номер документа</b>
                  </div>
                  <div class="col-6">
                    <b-input v-model="doc.number"
                             class="input-plain"
                             id="user-create-number"
                             placeholder="Введите номер"
                             required
                             :class="shownErrors.includes('number') ? '-error' : ''"
                             @change="focusField('number')"
                    />
                  </div>
                </div>
                <div class="row user_create-body-additional-field">
                  <div class="col-6">
                    <b>Дата выдачи</b>
                  </div>
                  <div class="col-6">
                    <date-picker v-model="doc.date_of_issue"
                                 class="datepicker-plain"
                                 id="user-create-date_of_issue"
                                 lang="ru"
                                 :clearable="false"
                                 :input-class="'input-plain' + (shownErrors.includes('date_of_issue') ? ' -error' : '')"
                                 :input-attr="{
                             required: true
                           }"
                                 format="DD.MM.YYYY"
                                 @change="focusField('date_of_issue')"
                    ><i class="glyphicon glyphicon-th" slot="calendar-icon"/></date-picker>
                  </div>
                </div>
                <div class="row user_create-body-additional-field">
                  <div class="col-6">
                    <b>Срок действия</b>
                  </div>
                  <div class="col-6">
                    <date-picker v-model="doc.validity"
                                 class="datepicker-plain"
                                 id="user-create-validity"
                                 lang="ru"
                                 :clearable="false"
                                 :input-class="'input-plain' + (shownErrors.includes('validity') ? ' -error' : '')"
                                 format="DD.MM.YYYY"
                                 @change="focusField('validity')"
                    ><i class="glyphicon glyphicon-th" slot="calendar-icon"/></date-picker>
                  </div>
                </div>
              </template>
              <div class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Телефон</b>
                </div>
                <div class="col-6 vue-phone-number-input-col">
                  <phone-number-input v-model="user.phone"
                                      :error="shownErrors.includes('phone')"
                                      @update="focusField('phone', $event)"
                  />
                </div>
              </div>
              <div class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Дополнительный телефон</b>
                </div>
                <div class="col-6 vue-phone-number-input-col">
                  <phone-number-input v-model="user.additional_phone"
                                      :error="shownErrors.includes('additional_phone')"
                                      @update="focusField('additional_phone')"
                  />
                </div>
              </div>
              <div class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Email</b>
                </div>
                <div class="col-6">
                  <email-field v-model="user.email"
                               class="input-plain"
                               :error="shownErrors.includes('email')"
                               id="user-create-email"
                               required
                               @focus="focusField('email')"
                               @input="setNicknameFromEmail"
                  />
                </div>
              </div>
              <div v-if="isUserModel" class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Никнейм</b>
                </div>
                <div class="col-6">
                  <b-input v-model="user.model_nickname"
                           class="input-plain"
                           id="user-nickname"
                           placeholder="Введите никнейм"
                           required
                           :class="shownErrors.includes('model_nickname') ? '-error' : ''"
                           @change="focusField('model_nickname')"
                  />
                </div>
              </div>
              <div class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Дата рождения</b>
                </div>
                <div class="col-6">
                  <date-picker v-model="user.birthday" class="datepicker-plain" id="user-create-birthday" lang="ru"
                               :clearable="false"
                               :input-class="'input-plain' + (shownErrors.includes('birthday') ? ' -error' : '')"
                               format="DD.MM.YYYY" @change="focusField('birthday')">
                    <i class="glyphicon glyphicon-th" slot="calendar-icon"/>
                  </date-picker>
                </div>
              </div>
              <div v-if="isUserModel" class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Национальность</b>
                </div>
                <div class="col-6">
                  <custom-select v-model="user.nationality"
                                 :class="shownErrors.includes('nationality') ? '-error' : ''"
                                 defaultText="Выберите национальность"
                                 titleField="title"
                                 valueField="id"
                                 :options="nationalities"
                                 required
                                 searchable
                                 @focus="focusField('nationality')"
                  />
                </div>
              </div>
              <div class="row user_create-body-additional-field">
                <div class="col-6">
                  <b>Пол</b>
                </div>
                <div class="col-6">
                  <custom-select v-model="user.gender" id="user-create-gender" :options="genders" defaultText="Выберите пол"/>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
        <b-modal id="modal_confirm_create"
                 centered
                 :title="`Создать новый профиль и сделать офис “${duplicateModel && duplicateModel.main_group ? duplicateModel.main_group.office : ''}“ основным для модели?`"
                 body-bg-variant="white"
                 ok-title="Создать профиль"
                 ok-variant="primary"
                 cancel-title="Отменить"
                 cancel-variant="outline-primary"
                 @ok="submitForm(true)">
          Будет создан новый профиль с введенными при создании данными
        </b-modal>
      </div>
    </form>
    <add-groups v-else-if="droverType === 'add-groups'"
                :userId="user.id"
                backButton="Добавление сотрудника"
                :showGroupsForOperator="showGroupsForOperator"
                :current-groups="currentGroupsForAdd"
                :current-main-group-id="newUserGroups.main_group"
                :role="currentRole"
                userCreate
                newUser
                :isOperator="isUserOperator"
                @clickBack="backToUserCreate"
                @save="setNewUserGroups"
    />
    <user-details v-else-if="droverType === 'user-details'"
                  :user-id="duplicateModel.id"
                  breadcrumbs-title="Назад"
                  @close="backToUserCreate"
    />
  </div>
</template>

<script>
import moment from "moment";
import Select from "@/components/Common/Select/Select";
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload";
import AddGroups from "@/pages/Profile/components/AddGroups/AddGroups";
import EmailField from "@/components/Common/EmailField";
import PhoneNumberInput from "@/components/Common/PhoneNumberInput";
import UserDetails from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import DatePicker from 'vue2-datepicker';
import plusCircled from "@/assets/vue-svg/plus-circled.svg";
import { phoneMask, removeQuery, showToast, emailDomain } from "@/tools/tools";

export default {
  name: 'user-create',
  props: {
    group: Object,
    pageRoleCode: String,
  },
  components: {
    'custom-select': Select,
    'avatar-upload': AvatarUpload,
    AddGroups,
    EmailField,
    PhoneNumberInput,
    UserDetails,
    'date-picker': DatePicker,
    plusCircled,
  },
  data() {
    return {
      user: {},
      shownErrors: [],
      searchStringSourceUsers: '',
      collapseState: {
        additional: true,
        main: true,
      },
      doc: {},
      droverType: null,
      showGroupsForOperator: false,
      newUserGroups: {},
    }
  },
  computed: {
    genders() {
      return this.$store.state.dictionaries.genders;
    },
    nationalities() {
      return this.$store.state.dictionaries.nationalities;
    },
    fieldsErrors() {
      return this.$store.state.users.fieldsErrors;
    },
    status() {
      return this.$store.state.users.status;
    },
    roles() {
      if (this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN') return this.allRoles;
      return this.$store.state.auth.user.role?.available_roles || [];
    },
    currentRole() {
      return this.user.role && (this.allRoles.find(role => role.id === this.user.role)) || {};
    },
    isUserOperator() {
      return this.pageRoleCode || this.currentRole.code === 'ROLE_OPERATOR';
    },
    isUserModel() {
      return this.pageRoleCode || this.currentRole.code === 'ROLE_MODEL';
    },
    allRoles() {
      return this.$store.state.dictionaries.roles;
    },
    duplicateModel() {
      return this.$store.state.users.duplicateModel;
    },
    duplicatedModelsFields() {
      if (!this.duplicateModel.duplicate_fields) return {};
      let fields = {};
      this.duplicateModel.duplicate_fields.forEach(field => fields[field] = true);
      return fields;
    },
    usersOptions() {
      return this.$store.state.users.usersListWithPagination;
    },
    usersStatus() {
      return this.$store.state.users.status;
    },
    usersHeaders() {
      return this.$store.state.users.headers;
    },
    currentGroupsForAdd() {
      return !this.showGroupsForOperator && (this.currentRole.type === 'operator') ? (this.newUserGroups.operator_groups || []) : (this.newUserGroups.groups || []);
    },
    mainGroupBadgeCounter() {
      return (this.currentRole.type === 'operator') ? this.newUserGroups.operator_groups?.length : this.newUserGroups.groups?.length;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    pageRole() {
      return this.pageRoleCode && this.roles.find(role => role.code === this.pageRoleCode) || {};
    },
    positions() {
      return this.$store.state.dictionaries.positions;
    },
    isUserStandardEmployee() {
      return this.pageRoleCode || this.currentRole.code === 'ROLE_EMPLOYEE';
    },
  },
  watch: {
    fieldsErrors: function (newErrors) {
      if (newErrors && newErrors.violations) this.shownErrors = newErrors.violations.map(error => error.propertyPath);
      showToast(this.$toasted, newErrors && newErrors.detail || 'Форма заполена неверно', 'error');
    }
  },
  beforeDestroy() {
    this.$store.dispatch('users/clearDuplicateModel');
  },
  created() {
    this.getSourceUsers();
    this.$store.dispatch('dictionaries/getRoles');
    this.$store.dispatch('dictionaries/getNationalities');
    this.$store.dispatch('dictionaries/getPositions');
    if (this.group) this.newUserGroups = {
      main_group: this.group.id,
      [this.group.sub_type === 'operator' ? 'operator_groups' : 'groups'] : [this.group.id],
    };
  },
  methods: {
    submitForm(isForce) {
      if ((this.status === 'creating') || this.shownErrors.length) return;
      if (this.pageRoleCode) this.user.role = this.pageRole.id;
      if (!this.newUserGroups.main_group) return showToast(this.$toasted, 'Выберите основную группу', 'error');
      let data = {
        user: {
          ...this.user,
          avatar: removeQuery(this.user.avatar?.url),
          birthday: this.user.birthday && this.user.birthday.format('dd.mm.yyyy'),
          source_user: this.user.source_user && this.user.source_user.id,
          main_group: this.newUserGroups.main_group,
        },
        isOperator: this.isUserOperator,
        isModel: this.isUserModel,
      };
      if (this.newUserGroups.groups?.length || (this.currentRole.type !== 'operator')) data.user.groups = this.newUserGroups.groups || [this.group.id];
      if (this.currentRole.type === 'operator') data.user.operator_groups = this.newUserGroups.operator_groups || [this.group.id];
      else if (this.isUserModel) {
        data.query = {'is_force': isForce};
        data.user.docs = [this.doc];
      }
      this.$store.dispatch('users/createUser', data);
      if (isForce) this.$store.dispatch('users/clearDuplicateModel');
    },
    goBack() {
      this.$emit('goBack');
    },
    focusField(fieldName, data) {
      if ((fieldName === 'phone') && data && !data.isValid) return this.shownErrors = [...this.shownErrors, fieldName];
      this.shownErrors = this.shownErrors.filter(error => error !== fieldName);
    },
    formattedDate(date) {
      return date ? moment.parseZone(date).format('DD.MM.YYYY') : ''
    },
    getSourceUsers() {
      this.$store.dispatch('users/fetchUsersWithPagination', {
        surname: this.searchStringSourceUsers.length ? this.searchStringSourceUsers : null,
        is_active: true,
        per_page: 20,
        page: 1
      });
    },
    getSourceUsersNextPage() {
      if ((this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || (this.usersStatus === 'request')) return;
      this.$store.dispatch('users/fetchUsersNextPage', {
        surname: this.searchStringSourceUsers.length ? this.searchStringSourceUsers : null,
        is_active: true,
        per_page: 20,
        page: this.usersHeaders.currentPage + 1
      });
    },
    searchSourceUsers(search) {
      this.searchStringSourceUsers = search
      this.getSourceUsers()
    },
    changeCollapse(type) {
      this.collapseState = {
        ...this.collapseState,
        [type]: !this.collapseState[type],
      };
    },
    phoneMask(value) {
      return phoneMask(value);
    },
    backToUserCreate() {
      this.droverType = null;
    },
    editGroups() {
      this.showGroupsForOperator = false;
      this.droverType = 'add-groups';
    },
    editOperatorGroups() {
      this.showGroupsForOperator = true;
      this.droverType = 'add-groups';
    },
    setNewUserGroups(data) {
      this.newUserGroups = {
        main_group: data.main_group || this.newUserGroups.main_group,
        groups: data.groups || this.newUserGroups.groups,
        operator_groups: data.operator_groups || this.newUserGroups.operator_groups,
      };
      this.backToUserCreate();
    },
    openDuplicatedModelDetails() {
      if (!this.userPermissions.model.profile.view) return;
      this.droverType = 'user-details';
    },
    setNicknameFromEmail() {
      this.user.model_nickname = this.user.email?.replace(emailDomain, '');
    },
  }
}
</script>