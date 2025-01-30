<template>
  <div :class="isOperatorPersonal || isModelPersonal ? 'profile-header' : 'profile-main-info' ">
    <background-upload v-if="isOperatorPersonal || isModelPersonal"
                       v-model="changedUser.background"
                       class="profile-header-info-cover"
                       useClipper
                       context="background"
                       @change="editUserBackground"
    />
    <template v-if="!isMyProfile">
      <avatar-upload v-if="userPermissions.manager_avatar.management"
                     v-model="changedUser.manager_avatar"
                     class="profile-main-info-avatar"
                     size="-xl"
                     tag="manager-avatar"
                     tip="Административный аватар"
                     useClipper
                     context="manager_avatar"
                     @change="editUserAvatar"
      />
      <div v-else-if="!userPermissions.personal_avatar.view"
           class="profile-main-info-avatar avatar -xl"
           :style="changedUser.manager_avatar ? `background-image: url(${changedUser.manager_avatar}); background-size: cover;` : ''"
           v-b-tooltip.hover
           title="Административный аватар"
      />
    </template>
    <avatar-upload v-if="isMyProfile"
                   v-model="changedUser.avatar"
                   class="profile-header-info-avatar"
                   :class="{'-operator_personal': isOperatorPersonal || isModelPersonal}"
                   :size="isOperatorPersonal || isModelPersonal ? 'xxxl' : '-xl'"
                   :tip="!isOperatorPersonal && !isModelPersonal ? 'Личный аватар': ''"
                   tag="personal-avatar"
                   :is-telegram-icon-shown="isOperatorPersonal || isModelPersonal"
                   :useBorder="isOperatorPersonal || isModelPersonal"
                   useClipper
                   context="avatar"
                   :telegram="changedUser.telegram_connected"
                   :is-fin-admin="changedUser.is_fin_admin"
                   @change="editUserAvatar"
    >
      <profile-avatar-icons v-if="!isOperatorPersonal && !isModelPersonal"
                            :telegram-connected="changedUser.telegram_connected"
                            :is-fin-admin="changedUser.is_fin_admin"
                            :current-telegram-link="currentTelegramLink"
                            :is-my-profile="isMyProfile"
                            :is-link-loading="userStatus === 'fetching-link'"
                            :user-id="userId"
                            :user-type="userType"
                            @get-telegram-link="getTelegramLink"
      />
    </avatar-upload>
    <template v-else-if="userPermissions.personal_avatar.view">
      <avatar-upload v-model="changedUser.avatar"
                     class="profile-main-info-avatar"
                     size="-xl"
                     tip="Личный аватар"
                     useClipper
                     context="avatar"
                     :disabled="!editPermission"
                     @change="editUserAvatar"
      >
        <profile-avatar-icons :telegram-connected="changedUser.telegram_connected"
                              :is-fin-admin="changedUser.is_fin_admin"
                              :current-telegram-link="currentTelegramLink"
                              :is-my-profile="isMyProfile"
                              :show-tooltip="!changedUser.telegram_connected && ((userStatus === 'fetching-link') || currentTelegramLink)"
                              :is-link-loading="userStatus === 'fetching-link'"
                              :user-id="userId"
                              :user-type="userType"
                              @get-telegram-link="getTelegramLink"
        />
      </avatar-upload>
    </template>
    <div class="profile-main-info-data">
      <div class="profile-main-info-data-name">
          <span v-if="changedUser.uid && !isMyProfile" class="mr-1"
                :class="{'text-gray': nameViewPermissions}">{{ changedUser.uid }}</span>
        <template v-if="nameViewPermissions">
          <div v-if="editPermission">
            <input v-model="changedUser.surname"
                   placeholder="Фамилия"
                   type="text"
                   class="input-plain user_create-body-main-info-name"
                   :class="{'-error': !changedUser.surname || fieldErrors.surname}"
                   v-autowidth="{maxWidth: '100%', minWidth: '25px', comfortZone: 4}"
                   @change="editUserName"
                   @input="inputUserName('surname')"
                   @dragstart.prevent
            />
            <input v-model="changedUser.name"
                   placeholder="Имя"
                   type="text"
                   class="input-plain user_create-body-main-info-name"
                   :class="{'-error': !changedUser.name || fieldErrors.name}"
                   v-autowidth="{maxWidth: '400px', minWidth: '20px', comfortZone: 4}"
                   @change="editUserName"
                   @input="inputUserName('name')"
                   @dragstart.prevent
            />
          </div>
          <div v-else>
                <span class="input-plain user_create-body-main-info-name">
                  {{ changedUser.surname !== undefined ? changedUser.surname : "Фамилия" }}
                </span>
            <span class="input-plain user_create-body-main-info-name">
                  {{ changedUser.name !== undefined ? changedUser.name : "Имя" }}
                </span>
          </div>
          <div v-if="!isOperatorPersonal && !isModelPersonal" class="profile-main-info-data-name-block">
            <input v-if="editPermission"
                   v-model="changedUser.patronymic"
                   placeholder="Отчество"
                   type="text"
                   class="input-plain user_create-body-main-info-name"
                   :class="{'-error': fieldErrors.patronymic}"
                   v-autowidth="{maxWidth: '100%', minWidth: '30px', comfortZone: 0}"
                   @change="editUserName"
                   @input="inputUserName('patronymic')"
                   @dragstart.prevent
            />
            <span v-else class="input-plain user_create-body-main-info-name ml-1">
                  {{ changedUser.patronymic !== undefined ? changedUser.patronymic : "Отчество" }}
                </span>
            <user-resign-icon v-if="changedUser.resign_date" :user="changedUser"/>
            <div v-if="changedUser.blocked" class="glyphicon-blocked ml-1" v-b-tooltip.hover
                 title="Сотрудник заблокирован"></div>
            <template v-if="changedUser.new_model">
              <div
                  class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2"
                  id="new-user-profile"/>
              <b-tooltip target="new-user-profile" triggers="hover" placement="top">
                <div class="text-center">Обратите внимание,<br/>девушка работает недавно</div>
              </b-tooltip>
            </template>
            <div v-if="changedUser.is_solo"
                 class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло
            </div>
          </div>
        </template>
      </div>
      <div v-if="userType !== 'employee' && !isModelPersonal" class="profile-main-info-data-nickname">
        <div v-if="userType === 'model'" class="d-flex align-items-center mr-2">
          <at class="mr-1"/>
          <input v-if="editPermission"
                 v-model="changedUser.model_nickname"
                 placeholder="Никнейм"
                 type="text"
                 class="input-plain user_create-body-main-info-name"
                 :class="{'-error': fieldErrors.patronymic}"
                 v-autowidth="{maxWidth: '100%', minWidth: '30px', comfortZone: 0}"
                 @change="editNickname"
                 @input="inputUserName('model_nickname')"
                 @dragstart.prevent
          />
          <span v-else class="input-plain user_create-body-main-info-namespan">
                {{ changedUser.model_nickname !== undefined ? changedUser.model_nickname : "Никнейм" }}
              </span>
        </div>
        <template v-if="arePercentagesPermitted && isSuperAdmin">
          <payment-percentages-info :data="profile.payment_percentages_data"
                                    class="cursor-pointer"
          />
          <pen class="text-gray-400 ml-2 cursor-pointer" @click="showParentDrover('paymentPercentages')"/>
        </template>
        <template v-if="profile.connected_models_with_ref && isSuperAdmin">
          <div class="user_details-main-user-info-ref_models-icon mx-2">
            <model/>
          </div>
          <span class="cursor-pointer" @click="showParentDrover('refSystemModelsView')">{{
              profile.connected_models_with_ref
            }}</span>
        </template>
      </div>
      <div v-if="!isOperatorPersonal && !isModelPersonal" class="profile-main-info-data-info">
        <custom-select v-if="editPermission && userType === 'employee'"
                       v-model="profileRole"
                       return-whole-object
                       class="profile-main-info-data-info-role"
                       :defaultText="profileRole && profileRole.title || 'Выберите роль'"
                       valueField="id"
                       :options="optionsRoles"
                       @change="editRole"
        >
          <template v-slot:chosen-variant="{value}">
            <div class="d-flex align-items-center">
              <headset v-if="value.type === 'operator'"/>
              <span>{{ value.title }}</span>
            </div>
          </template>
          <template v-slot:list-variant="{variant}">
            <div class="d-flex align-items-center">
              <headset v-if="variant.type === 'operator'"/>
              <span>{{ variant.title }}</span>
            </div>
          </template>
        </custom-select>
        <p v-else class="profile-main-info-data-info-role d-flex align-items-center mr-2" :class="{'-operator': profileRole.type === 'operator'}">
          <headset v-if="profileRole.type === 'operator'"/>
          <span>{{ profileRole.title }}</span>
        </p>
        <span class="text-gray mr-2">•</span>
        <custom-select v-if="editPermission"
                       v-model="changedUser.position"
                       return-whole-object
                       class="profile-main-info-data-info-role"
                       :class="{'-empty': !(changedUser.position && changedUser.position.id)}"
                       :defaultText="changedUser.position && changedUser.position.title || 'Выберите должность'"
                       valueField="id"
                       :options="positions"
                       @change="editPosition"
        />
        <p v-else class="profile-main-info-data-info-role"></p>
      </div>
      <div v-if="(userType === 'employee') && viewPermission" class="profile-main-info-data-salary">
        <div id="profile-salary" class="d-flex align-items-center">
          <span class="mr-1">$</span>
          <input v-if="editPermission"
                 v-model="changedUser.salary"
                 placeholder="Укажите оклад"
                 type="number"
                 class="input-plain user_create-body-main-info-name"
                 :class="{'-error': fieldErrors.salary}"
                 v-autowidth="{maxWidth: '100%', minWidth: '30px', comfortZone: 0}"
                 @change="editSalary"
                 @input="inputSalary"
                 @keypress="keypressSalary"
                 @paste="pasteSalary"
                 @dragstart.prevent
          />
          <span v-else>{{ changedUser.salary }}</span>
        </div>
        <b-tooltip target="profile-salary" boundary="html">
          Оклад сотрудника
        </b-tooltip>
        <div v-if="(userType === 'employee') && profile.connected_models_with_ref"
             class="d-flex align-items-center ml-2">
          <div class="user_details-main-user-info-ref_models-icon mr-2">
            <model/>
          </div>
          <span class="cursor-pointer" @click="showParentDrover('refSystemModelsView')">{{
              profile.connected_models_with_ref
            }}</span>
        </div>
      </div>
      <div class="profile-main-info-data-switches">
        <div v-if="viewPermission && !isMyProfile && userType === 'model'"
             class="profile-main-info-data-switches-block">
          <p class="profile-main-info-data-switches-block-label">Соло-модель</p>
          <div class="custom-control custom-switch">
            <input v-model="changedUser.is_solo"
                   type="checkbox"
                   class="custom-control-input"
                   id="solo"
                   :disabled="!editPermission"
                   @change="editSoloStatus"
            >
            <label class="custom-control-label custom-control-label-stylization" for="solo"></label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select.vue";
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload.vue";
import BackgroundUpload from "@/components/Common/BackgroundUpload/BackgroundUpload.vue";
import RefSystemModelsView from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersView.vue";
import RefSystemModelsAdd from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersAdd.vue";
import Edit from "@/pages/Workshifts/components/Edit.vue";
import pen from "@/assets/vue-svg/pen.svg";
import telegram from "@/assets/vue-svg/telegram.svg";
import dollarInCircle from "@/assets/vue-svg/dollar-in-circle.svg";
import copy from "@/assets/vue-svg/copy-transparent.svg";
import headset from "@/assets/vue-svg/headset.svg";
import at from "@/assets/vue-svg/at.svg";
import gear from "@/assets/vue-svg/gear.svg";
import model from "@/assets/vue-svg/model.svg";
import { getTypeEditUser, removeQuery } from "@/tools/tools.js";
import PaymentPercentagesInfo from "@/components/Common/PaymentPercentagesInfo.vue";
import UserResignIcon from "@/components/Common/UserResignIcon.vue";
import ProfileAvatarIcons from "@/pages/Profile/components/ProfileAvatarIcons.vue";

export default {
  name: 'profile-header',
  components: {
    ProfileAvatarIcons,
    UserResignIcon, PaymentPercentagesInfo,
    Edit,
    'custom-select': Select,
    'avatar-upload': AvatarUpload,
    'background-upload': BackgroundUpload,
    RefSystemModelsView,
    RefSystemModelsAdd,
    'pen': pen,
    'telegram': telegram,
    'dollar-in-circle': dollarInCircle,
    'copy': copy,
    'headset': headset,
    'at': at,
    'gear': gear,
    'model': model,
  },
  props: {
    isSuperAdmin: Boolean,
    isMyProfile: Boolean,
    isOperator: Boolean,
    userId: Number,
    userType: String,
    changedUser: Object,
    profileRole: Object,
  },
  data() {
    return {
      resignReasonError: false,
      currentGroup: 0,
      currentGroupTitle: '',
      droverType: '',
      activeServiceId: null,
      officeId: null,
      modelScheduleArray: [],
      activeOffice: {},
      activeUser: {},
      deletedServiceTitle: '',
      editVariant: '',
      chosenResignReason: {},
      resignComment: '',
      showGroupsForOperator: true,
      eventDate: {},
      eventInfo: {},
      fieldErrors: {},
      currentScheduleDate: null,
      activeReport: null,
      currentTelegramLink: null,
      refType: String,
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    viewPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.view;
    },
    editPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.edit;
    },
    groupEditPermissions() {
      return this.userPermissions[this.userType].profile.group.edit;
    },
    availableRoles() {
      return this.$store.state.auth.user.role?.available_roles || [];
    },
    roles() {
      if (this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN') return this.$store.state.dictionaries.roles;
      if (!this.userRoleCode || this.availableRoles.find(role => role.code === this.userRoleCode)) return this.availableRoles;
      return [this.profile.role, ...this.availableRoles];
    },
    optionsRoles() {
      return this.roles.filter(role => (role.type === this.profileRole.type) && (role.code !== 'ROLE_OPERATOR') && (role.code !== 'ROLE_MODEL'));
    },
    positions() {
      return this.$store.state.dictionaries.positions;
    },
    isOperatorPersonal() {
      return this.isMyProfile && this.isOperator;
    },
    isModelPersonal(){
      return this.isMyProfile && this.userType === 'model';
    },
    profile() {
      return this.$store.getters["profile/profile"](this.userId);
    },
    activeService() {
      if (!(this.profile && this.profile.credentials)) return {};
      return this.profile.credentials?.find(service => service.id === this.activeServiceId) || {};
    },
    nameViewPermissions() {
      if (this.isMyProfile) return true;
      switch (this.userType) {
        case "model":
          return this.userPermissions.fullname_model.view;
        case "operator":
          return this.userPermissions.fullname_operator.view;
      }
      return true;
    },
    resourcesProcess() {
      let resourcesProcess = {};
      this.$store.state.profile.resourcesProcess.forEach(resource => resourcesProcess[resource.id] = resource.title);
      return resourcesProcess;
    },
    telegramLink() {
      return this.$store.state.users.telegramLink;
    },
    arePercentagesPermitted() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
  },
  watch: {
    userStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'fetching-link') && (newStatus === '')) return this.currentTelegramLink = this.telegramLink;
    },
    userId: function () {
      this.currentTelegramLink = null;
    },
  },
  methods: {
    inputUserName(fieldName) {
      let errors = {...this.fieldErrors};
      delete errors[fieldName];
      this.fieldErrors = errors;
    },
    inputSalary(e) {
      e.preventDefault();
      let errors = {...this.fieldErrors};
      delete errors.salary;
      this.fieldErrors = errors;
    },
    keypressSalary(e) {
      if (!this.changedUser.salary) return;
      if (this.changedUser.salary.toString().length > 6) e.preventDefault();
    },
    pasteSalary(e) {
      if (e.clipboardData?.getData("text").length + this.changedUser.salary.toString().length > 7) e.preventDefault();
    },
    editUserName() {
      if (!this.changedUser.name || !this.changedUser.surname) return;
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.changedUser.id,
        name: this.changedUser.name,
        surname: this.changedUser.surname,
        patronymic: this.changedUser.patronymic,
      });
    },
    editNickname() {
      if (!this.changedUser.model_nickname) return;
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.changedUser.id,
        model_nickname: this.changedUser.model_nickname,
      });
    },
    editSalary() {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.changedUser.id,
        salary: parseFloat(this.changedUser.salary),
      });
    },
    editUserAvatar() {
      let query = {id: this.changedUser.id};
      if (this.changedUser.avatar && this.changedUser.avatar.url) query.avatar = removeQuery(this.changedUser.avatar.url);
      if (this.changedUser.manager_avatar && this.changedUser.manager_avatar.url) query.manager_avatar = removeQuery(this.changedUser.manager_avatar.url);
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, query);
    },
    editRole(role) {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {id: this.changedUser.id, role: role.id});
    },
    editPosition(position) {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {id: this.changedUser.id, position: position.id});
    },
    editSoloStatus() {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.changedUser.id,
        is_solo: this.changedUser.is_solo
      });
    },
    editUserBackground() {
      let query = {id: this.changedUser.id};
      if (this.changedUser.background) query.background = removeQuery(this.changedUser.background.url);
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, query);
    },
    getTelegramLink() {
      if (this.changedUser.telegram_connected) return;
      this.$store.dispatch('users/fetchTelegramLink', this.userId);
    },
    showParentDrover(type) {
      this.$emit('showDrover', type);
    },
    editService(serviceId) {
      this.$emit('editService', serviceId);
    },
    editPermissions() {
      this.$emit('editPermissions');
    },
  }
}
</script>