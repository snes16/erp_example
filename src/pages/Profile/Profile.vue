<template>
  <error-page v-if="profileStatus === 'access-denied'"/>
  <div v-else-if="userPermissions" class="profile"
       :class="{'-personal_operator': isOperatorPersonal || isModel}">
    <div v-if="!isMyProfile" class="profile-header-top">
      <h1><span class="text-thin">Профиль</span> {{ userType === 'model' ? 'модели' : 'пользователя' }}</h1>
      <div class="profile-header-actions">
        <b-dropdown v-if="areProfileEditButtonsShown.anyButtons"
                    class="profile-header-actions-dropdown"
                    menu-class="py-0 animated animated-fast fadeIn"
                    right
        >
          <template slot="button-content">
            <gear/>
          </template>
          <b-dropdown-item v-if="areProfileEditButtonsShown.permissionsChange"
                           class="profile-header-actions-dropdown-item -full"
                           @click="editPermissions"
          >
            <lock class="profile-header-actions-dropdown-item-icon ml-2_5"/>
            <span>Права доступа</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="areProfileEditButtonsShown.refSystemModelsEdit"
                           class="profile-header-actions-dropdown-item -full"
                           @click="showDrover('refSystemModelsView')"
          >
            <model class="profile-header-actions-dropdown-item-icon ml-2_5"/>
            <span>Бонусная программа</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="isHaveRestorePassword"
                           class="profile-header-actions-dropdown-item"
                           v-b-modal.restore_password_modal
          >
            <arrow-circle class="profile-header-actions-dropdown-item-icon"/>
            <span>Сбросить пароль</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="areProfileEditButtonsShown.userActivation"
                           class="profile-header-actions-dropdown-item -success"
                           @click="activateUser"
          >
            <arrow-circle class="profile-header-actions-dropdown-item-icon"/>
            <span>Активировать</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="areProfileEditButtonsShown.userResignation"
                           class="profile-header-actions-dropdown-item -danger"
                           v-b-modal.resign_modal_profile
          >
            <i class="glyphicon-fired profile-header-actions-dropdown-item-icon"/>
            <span>Уволить</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="areProfileEditButtonsShown.userDeletion"
                           class="profile-header-actions-dropdown-item -danger"
                           v-b-modal.remove_modal
          >
            <trash class="profile-header-actions-dropdown-item-icon-trash"/>
            <span>Удалить</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="areProfileEditButtonsShown.togglePin"
                           class="profile-header-actions-dropdown-item"
                           @click="togglePin"
          >
            <pin-input class="profile-header-actions-dropdown-item-icon"/>
            <span>{{ hasPin ? 'Отключить' : 'Подключить' }} PIN</span>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
    <div class="profile-main card" :class="{'mb-4': activeTab !== 'finances', 'mb-0': activeTab === 'finances'}">
      <profile-header
        :is-super-admin="isSuperAdmin"
        :is-my-profile="isMyProfile"
        :is-operator="isOperator"
        :profile="profile"
        :userId="userId"
        :userType="userType"
        :changed-user="changedUser"
        :profile-role="profileRole"
        :class="{'hidden-below_md': activeTab === 'finances'}"
        @showDrover="showDrover"
        @editService="editService"
        @editPermissions="editPermissions"
      />
      <b-navbar toggleable="md"
                class="profile-main-tabs"
                :class="{'-bottomPosition': isBottomPositionTab}">
        <template v-if="showMobile">
          <a v-for="tab in filteredTabs"
             v-if="!tab.hideForMobile"
             class="nav-link text-fw-400"
             :class="{'active': activeTab === tab.value}"
             href="#"
             :key="tab.value"
             @click.prevent="setActiveTab(tab.value)"
          >
            <div v-if="!isNeedScheduleFilled && tab.value === 'schedule_and_finances' && isModel"
                 class="profile-main-tabs-icons-point"/>
            <component :is="tab.icon"
                       class="profile-main-tabs-icons"
                       :class="{'mb-2 mt-1' : tab.value === 'personal_data', '-circled': !isNeedScheduleFilled && tab.value === 'schedule_and_finances' && isModel}"
            />
            <span>{{ tab.title }}</span>
          </a>
        </template>
        <template v-else>
          <div class="profile-main-tabs-toggle pl-4">
            <span class="text-cyan text-fw-400">{{ activeTabName }}</span>
            <b-navbar-toggle target="tabs-collapse"></b-navbar-toggle>
          </div>
          <b-collapse id="tabs-collapse" is-nav>
            <a v-for="tab in filteredTabs"
               href="#"
               class="nav-link text-fw-400"
               :class="{'active': activeTab === tab.value, 'hidden-above_xl': tab.hideForDesktop}"
               :key="tab.value"
               @click.prevent="setActiveTab(tab.value)"
            >
              <template v-if="tab.desktopTitle">
                <span class="hidden-below_xl">{{ tab.desktopTitle }}</span>
                <span class="hidden-above_xl">{{ tab.title }}</span>
              </template>
              <template v-else>{{ tab.title }}</template>
            </a>
          </b-collapse>
        </template>
      </b-navbar>
    </div>
    <personal-operator
        v-if="viewPersonalOperatorPermission"
        :active-tab="activeTab"
        :profile="profile"
        :userId="userId"
        :user-permissions="userPermissions"
        :show-mobile="showMobile"
        :is-my-profile="isMyProfile"
        :schedule-ability="scheduleAbility"
        :show-status-point="showStatusPoint"
        :userType="userType"
        :is-has-duplicate="isHasDuplicate"
        @openIncomeDetails="showIncomeDetails"
        @editPaymentInfo="showDrover('paymentInfo')"
        @fineDetails="showFineDetails"
        @open-payment="openPayment"
        @open-support-chat="showDrover('supportChat')"
    />
    <personal-model
        v-else-if="viewPersonalModelPermission"
        :active-tab="activeTab"
        :profile="profile"
        :userId="userId"
        :show-mobile="showMobile"
        :show-status-point="showStatusPoint"
        :user-permissions="userPermissions"
        :is-my-profile="isMyProfile"
        :userType="userType"
        :ref-link="refLink"
        @goToMessagesTab="setActiveTab('support')"
        @openScheduleFilling="showScheduleFilling"
        @editPaymentInfo="showDrover('paymentInfo')"
        @open-payment="openPayment"
        @open-support-chat="showDrover('supportChat')"
    />
    <div v-else>
      <profile-main
        v-if="activeTab === 'profile'"
        :profile="profile"
        :userId="userId"
        :user-permissions="userPermissions"
        :is-my-profile="isMyProfile"
        :schedule-ability="scheduleAbility"
        :userType="userType"
        :is-has-duplicate="isHasDuplicate"
        :is-super-admin="isSuperAdmin"
        @deleteGroup="deleteGroup"
        @addGroups="addGroups"
        @addOperatorGroups="addOperatorGroups"
        @setSchedule="setSchedule"
        @setOffice="setOffice"
        @startWeek="startWeek"
        @openModelMiniProfile="openMiniProfile"
        @changeJobDuties="showDrover('changeJobDuties')"
        @editPaymentInfo="showDrover('paymentInfo')"
        @editPaymentPercentages="showDrover('paymentPercentages')"
        @fineDetails="showFineDetails"
      />
      <services v-else-if="activeTab === 'services'"
                :userId="userId"
                :services="profile.credentials"
                :user-permissions="userPermissions"
                :isMyProfile="isMyProfile"
                @editService="editService"
                @addServices="showDrover('addServices')"
      />
      <response v-else-if="activeTab === 'response'"
                :response="profile.response || {}"
                :user-permissions="userPermissions"
                :is-has-duplicate="isHasDuplicate"
      />
      <dossier v-else-if="activeTab === 'dossier'"
               :userId="userId" :dossier="profile.dossier"
               :isMyProfile="isMyProfile"
      />
      <materials v-else-if="activeTab === 'materials'"
                 :userId="userId"
                 :materials="profile.materials && profile.materials.actual"
                 :archiveMaterials="profile.materials && profile.materials.archive"
                 :userType="userType"
                 :isMyProfile="isMyProfile"
                 :albums="profile.profile.user.albums"
                 :is-has-duplicate="isHasDuplicate"
      />
      <work-calendar v-else-if="activeTab === 'calendar'"
                     :absences="absences"
                     :editPermission="absenceEditPermission"
                     @fetchProfileAbsence="fetchProfileAbsence"
                     @openAbsenceDetails="openAbsenceDetails"
                     @deleteAbsence="deleteUserAbsence"
      />
      <reports v-else-if="activeTab === 'reports'"
               :user-id="userId"
               :user-type="userType"
               @clickUser="openMiniProfileFromId"
               @clickReport="openReportDetails"
      />
    </div>
    <helper contentClass="-paddingless">
      <mini-profile v-if="droverType === 'miniProfile'"
                    :user-id="activeUser.id"
                    :office-id="activeUser.office.id"
      />
      <add-groups v-else-if="droverType === 'addGroups'"
                  :currentGroups="currentGroups"
                  :userId="userId"
                  :showGroupsForOperator="showGroupsForOperator"
                  isProfilePage
      />
      <edit-service v-else-if="droverType === 'editService'"
                    :service="activeService"
                    :userId="userId"
                    :isMyProfile="isMyProfile"
                    @deleteService="deleteService"
      />
      <add-services v-else-if="droverType === 'addServices'"
                    :resourcesProcess="resourcesProcess"
                    :userId="userId"
      />
      <model-schedule v-else-if="droverType === 'setSchedule'"
                      :drover-state="layoutStatus"
                      :is-model="isModel"
                      :modelData="profile.profile.user"
                      :office="activeOffice"
                      :operators="currentWorkshift.operators"
                      :hasCredentials="profile.credentials && !!profile.credentials.length"
                      :rooms="currentWorkshift.rooms"
                      :user-permissions="userPermissions"
                      :default-date="currentScheduleDate"
                      :workshiftPeriods="currentWorkshift.periods"
                      showAddAbsences
                      @saveSchedule="saveSchedule"
                      @fetchSchedule="fetchSchedule"
                      @open-absence-details="openAbsenceDetailsFromSchedule"
                      @open-mini-profile="openOperatorProfile"
      />
      <user-edit-permissions v-else-if="droverType === 'editPermissions'"
                             :userId="userId"
                             isProfilePage
                             @close="closeDrover"
      />
      <absence-details v-else-if="droverType === 'absenceDetails'"
                       :absence-date="eventDate"
                       :absence-info="eventInfo"
                       :backButton="addAbsencesFromSchedule ? 'Расписание на неделю' : null"
                       @createAbsence="createUserAbsence"
                       @editAbsence="editUserAbsence"
                       @deleteAbsence="deleteUserAbsence"
                       @close="returnModelSchedule"
      />
      <set-job-duties v-else-if="droverType === 'changeJobDuties'"
                      :currentDuties="profile.profile.user.job_duties"
                      :role-type="profileRole.type"
                      @saveJobDuties="saveJobDuties"
      />
      <report-details v-else-if="droverType === 'reportDetails'"
                      :report-id="activeReport"
                      :user-type="userType"
                      @clickUser="openMiniProfileFromId"
      />
      <payment-info v-else-if="droverType === 'paymentInfo'"
                    :user-id="userId"
                    :payment-info="profile.payment_info"
                    :user-permissions="userPermissions"
                    :user-type="userType"
                    :is-my-profile="isMyProfile"
                    @close="closeDrover"
      />
      <payment-percentages-edit v-else-if="droverType === 'paymentPercentages'"
                                :user-id="userId"
                                :subheader="profile.profile.user.fullname"
                                :percentages="profile.payment_percentages_data.payment_percentages"
                                :are-personal-settings-active="profile.payment_percentages_data.are_personal_settings_active"
                                @close="closeDrover"
                                @togglePersonalPercentages="togglePersonalPercentages"
      />
      <ref-system-models-view v-else-if="droverType === 'refSystemModelsView'"
                              :user-id="userId"
                              :ref-users="profile.ref_system_connected_users_referal"
                              :trainer-users="profile.ref_system_connected_users_trainer"
                              @add="showRefSystemModelsAdd"
                              @close="closeDrover"
      />
      <ref-system-models-add v-else-if="droverType === 'refSystemModelsAdd'"
                             :ref-type="refType"
                             :user-id="userId"
                             @close="closeDrover"
                             @back="showDrover('refSystemModelsView')"
      />
      <fine-details v-else-if="droverType === 'fineDetails'"
                    :user-id="userId"
                    :fine-info="activeFine"
                    @back="closeDrover"
      />
      <income-details v-else-if="droverType === 'incomeDetails'"
                      :shift-id="activeShiftId"
                      :user-id="userId"
                      @sendWorkshiftState="checkWorkshiftState"
      />
      <schedule-filling v-else-if="droverType === 'scheduleFilling'"
                        :week="activeScheduleData.week"
                        :workshifts="activeScheduleData.workshifts"
                        :absences="profile.absences"
                        :min_shifts="profile.profile.user.main_group.min_workshifts_count"
                        :user-id="userId"
                        @closeDrover="closeDrover"
      />
      <payment-details v-else-if="droverType === 'paymentDetails'"
                       :payment-id="paymentId"
                       :user-type="isModel ? 'model' : 'operator'"
      />
      <support-chat-drover v-else-if="droverType === 'supportChat'" />
    </helper>
    <b-modal
      id="user_block_modal"
      centered
      :title="`Вы уверены, что хотите заблокировать сотрудника?`"
      body-bg-variant="white"
      ok-title="Заблокировать"
      ok-variant="danger"
      cancel-title="Отменить"
      cancel-variant="outline-primary"
      @ok="blockUser">
      Заблокированному сотруднику нельзя поставить задачу.
    </b-modal>
    <b-modal
      id="delete_group_modal"
      centered
      title="Вы точно хотите исключить сотрудника из группы?"
      body-bg-variant="white"
      ok-title="Удалить"
      ok-variant="danger"
      cancel-title="Отменить"
      cancel-variant="outline-primary"
      @ok="removeCurrentGroup">
      Сотрудник будет исключен из группы "{{ currentGroupTitle }}"
    </b-modal>
    <b-modal id="restore_password_modal"
             centered
             title="Вы уверены, что хотите сбросить пароль?"
             body-bg-variant="white"
             ok-title="Сбросить"
             ok-variant="primary"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="restorePasswords"
    >Email-уведомление с новым паролем придёт на почту admin@el-ws.com
    </b-modal>
    <b-modal
      id="delete_service_modal"
      centered
      :title='`Удалить аккаунт на сервисе «${activeService && activeService.resource && activeService.resource.title}»?`'
      body-bg-variant="white"
      ok-title="Удалить"
      ok-variant="danger"
      cancel-title="Отменить"
      cancel-variant="outline-primary"
      @ok="removeActiveService">
      Вы уверены, что хотите безвозвратно удалить этот сервис?
    </b-modal>
    <b-modal
      id="remove_modal"
      centered
      title="Вы уверены, что хотите удалить пользователя?"
      body-bg-variant="white"
      ok-title="Удалить профиль"
      ok-variant="danger"
      cancel-title="Отменить"
      cancel-variant="outline-primary"
      @ok="removeUser"
    >Это навсегда удалит пользователя и связанную с ним информацию. Этот профиль больше не будут доступны вам или
      кому-либо еще.
    </b-modal>
    <b-modal
      id="resign_modal_profile"
      centered
      :title='`Вы уверены, что хотите уволить пользователя?`'
      body-bg-variant="white"
      ok-title="Уволить"
      ok-variant="danger"
      cancel-title="Отменить"
      cancel-variant="outline-primary"
      @ok="resignUser">
      <p class="mb-2">Укажите причину увольнения</p>
      <custom-select v-model="chosenResignReason"
                     :options="resignReasonsForSelect"
                     class="-white -alt"
                     :error="resignReasonError"
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
    </b-modal>
    <b-modal
        id="toggle_pin_modal"
        centered
        title="Вы уверены, что хотите отключить PIN-код?"
        body-bg-variant="white"
        ok-title="Отключить"
        ok-variant="primary"
        cancel-title="Отменить"
        cancel-variant="outline-primary"
        @ok="removeUserPin"
    >Без PIN-кода к вашему профилю могут получить доступ посторонние лица.</b-modal>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
import Helper from '@/components/Helper/Helper.vue';
import Select from "@/components/Common/Select/Select.vue";
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload.vue";
import ProfileHeader from "./components/ProfileHeader/ProfileHeader.vue";
import ProfileMain from "./components/ProfileMain/ProfileMain.vue";
import Services from "./components/Services/Services.vue";
import Response from "./components/Response/Response.vue";
import Dossier from "./components/Dossier/Dossier.vue";
import Materials from "./components/Materials/Materials.vue";
import AddGroup from "./components/AddGroups/AddGroups.vue";
import EditService from "./components/EditService/EditService.vue";
import addServices from "./components/AddServices.vue";
import ModelSchedule from '@/components/ModelSchedule/ModelSchedule.vue';
import ErrorPage from '@/components/ErrorPage/ErrorPage.vue';
import UserEditPermissions from "@/pages/Organization/Groups/components/UserEditPermissions/UserEditPermissions.vue";
import WorkCalendar from "@/pages/Profile/components/WorkCalendar/WorkCalendar.vue";
import AbsenceDetails from "@/pages/Profile/components/WorkCalendar/AbsenceDetails.vue";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails.vue";
import SetJobDuties from "@/pages/Profile/components/SetJobDuties/SetJobDuties.vue";
import UserResignIcon from "@/components/Common/UserResignIcon.vue";
import Reports from "@/pages/Profile/components/Reports.vue";
import ReportDetails from "@/pages/Profile/components/ReportDetails.vue";
import PaymentInfo from "@/pages/Profile/components/PaymentInfo.vue";
import PaymentPercentagesEdit from "@/pages/Profile/components/PaymentPercentagesEdit.vue";
import PaymentPercentagesInfo from "@/components/Common/PaymentPercentagesInfo.vue";
import RefSystemModelsView from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersView.vue";
import RefSystemModelsAdd from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersAdd.vue";
import FineDetails from "@/pages/Profile/components/FineDetails.vue";
import IncomeDetails from "@/pages/Profile/components/IncomeDetails.vue";
import Edit from "@/pages/Workshifts/components/Edit";
import PersonalOperator from "@/pages/Profile/components/PersonalOperator/PersonalOperator.vue";
import PersonalModel from "@/pages/Profile/components/PersonalModel/PersonalModel.vue";
import scheduleFilling from "@/pages/Profile/components/scheduleFilling.vue";
import PaymentDetails from "@/pages/Profile/components/PaymentDetails/PaymentDetails.vue";
import SupportChatDrover from "@/pages/Profile/components/Support/SupportChatDrover.vue";
import schedule from "@/assets/schedule.svg";
import human from "@/assets/vue-svg/human.svg";
import info from '@/assets/vue-svg/info.svg';
import pen from "@/assets/vue-svg/pen.svg";
import telegram from "@/assets/vue-svg/telegram.svg";
import dollarInCircle from "@/assets/vue-svg/dollar-in-circle.svg";
import throbberWhite from "@/assets/vue-svg/throbber-white.svg";
import copy from "@/assets/vue-svg/copy-transparent.svg";
import headset from "@/assets/vue-svg/headset.svg";
import at from "@/assets/vue-svg/at.svg";
import gear from "@/assets/vue-svg/gear.svg";
import lock from "@/assets/vue-svg/lock.svg";
import arrowCircle from "@/assets/vue-svg/arrow-circle.svg";
import trash from "@/assets/vue-svg/trash.svg";
import coinsStackIcon from "@/assets/vue-svg/coins-stack.svg";
import model from "@/assets/vue-svg/model.svg";
import envelope from "@/assets/vue-svg/envelope.svg";
import pinInput from "@/assets/vue-svg/pin-input.svg";
import { getTypeEditUser, showToast, clipboard } from "@/tools/tools";
import procentCard from "@/assets/vue-svg/procent-card.svg";
import moment from 'moment';
import config from '@/config';

export default {
  name: 'Profile',
  components: {
    Edit,
    SetJobDuties,
    'helper': Helper,
    'coins-stack-icon': coinsStackIcon,
    'procent-card': procentCard,
    'custom-select': Select,
    'avatar-upload': AvatarUpload,
    'profile-header': ProfileHeader,
    'profile-main': ProfileMain,
    'services': Services,
    'response': Response,
    'dossier': Dossier,
    'materials': Materials,
    'add-groups': AddGroup,
    'edit-service': EditService,
    'add-services': addServices,
    'model-schedule': ModelSchedule,
    'error-page': ErrorPage,
    'user-edit-permissions': UserEditPermissions,
    'absence-details': AbsenceDetails,
    'work-calendar': WorkCalendar,
    'mini-profile': MiniProfile,
    'income-details': IncomeDetails,
    'schedule-filling': scheduleFilling,
    PersonalModel,
    PersonalOperator,
    UserResignIcon,
    Reports,
    FineDetails,
    ReportDetails,
    PaymentInfo,
    PaymentPercentagesEdit,
    PaymentPercentagesInfo,
    RefSystemModelsView,
    RefSystemModelsAdd,
    PaymentDetails,
    SupportChatDrover,
    'human': human,
    'schedule': schedule,
    'info': info,
    'pen': pen,
    'telegram': telegram,
    'dollar-in-circle': dollarInCircle,
    'throbber-white': throbberWhite,
    'copy': copy,
    'headset': headset,
    'at': at,
    'gear': gear,
    'lock': lock,
    'arrowCircle': arrowCircle,
    'trash': trash,
    'model': model,
    'envelope': envelope,
    'pin-input': pinInput,
  },
  data() {
    return {
      moment: moment,
      activeTab: '',
      activeShiftId: null,
      isBlankWorkshift: false,
      showMobile: false,
      showStatusPoint: true,
      paymentList: [],
      tabs: [
        {
          title: 'Профиль',
          value: 'profile'
        },
        {
          title: 'Сервисы',
          value: 'services'
        },
        {
          title: 'Отклик',
          value: 'response'
        },
        {
          title: 'Досье',
          value: 'dossier'
        },
        {
          title: 'Материалы',
          value: 'materials'
        }
      ],
      resignReasonError: false,
      changedUser: {},
      currentGroup: 0,
      currentGroupTitle: '',
      droverType: '',
      activeServiceId: null,
      officeId: null,
      modelScheduleArray: [],
      firstDayWeek: moment().isoWeekday(1).format('YYYY-MM-DD'),
      profileRole: {},
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
      addAbsencesFromSchedule: false,
      currentScheduleDate: null,
      activeReport: null,
      refType: String,
      activeFine: null,
      activeScheduleData: null,
      paymentId: null,
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    isHaveRestorePassword() {
      return this.userPermissions.user.restore_password;
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
    scheduleAbility() {
      return this.$store.state.schedule.scheduleAbility;
    },
    isOperator() {
      return this.userType === 'operator';
    },
    currentGroups() {
      const fieldName = this.showGroupsForOperator ? 'groups' : 'operator_groups';
      return this.profile?.profile?.[fieldName]?.map(group => group.id) || [];
    },
    absences() {
      return this.profile.absences || [];
    },
    absenceRequestStatus() {
      return this.$store.state.profile.absenceStatus;
    },
    userId() {
      return this.$route.params.id ? parseInt(this.$route.params.id) : this.$store.state.auth.user.id;
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    refStatus() {
      return this.$store.state.profile.refStatus;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    fineStatus() {
      return this.$store.state.profile.fineStatus;
    },
    isOperatorPersonal() {
      return this.$store.state.auth.user.role?.code === 'ROLE_OPERATOR';
    },
    isModel() {
      return this.$store.state.auth.user.role?.code === 'ROLE_MODEL';
    },
    isBottomPositionTab() {
      return this.isModel || this.isOperatorPersonal
    },
    incomesMessage() {
      return this.isBlankWorkshift ? 'Поступления отправлены' : 'Поступления изменены';
    },
    filteredTabs() {
      const tabs = [];
      if (this.viewPersonalOperatorPermission) {
        tabs.push({
          desktopTitle: 'Главная',
          title: 'Расписание',
          value: 'schedule_and_finances',
          icon: 'schedule',
        });
        tabs.push({
          title: 'Финансы',
          value: 'finances',
          hideForDesktop: true,
          icon: 'coins-stack-icon',
        });
        tabs.push({
          title: 'Личные данные',
          value: 'personal_data',
          hideForMobile: true,
          icon: 'human',
        });
        tabs.push({
          title: 'Бонусы',
          value: 'profit',
          hideForDesktop: true,
          icon: 'procent-card',
        });
        tabs.push({
          title: 'Сообщения',
          value: 'support',
          icon: 'envelope',
        });
      } else if (this.viewPersonalModelPermission) {
        tabs.push({
          desktopTitle: 'Главная',
          title: 'Расписание',
          value: 'schedule_and_finances',
          icon: 'schedule',
        });
        tabs.push({
          title: 'Финансы',
          value: 'finances',
          hideForDesktop: true,
          icon: 'coins-stack-icon',
        });
        tabs.push({
          title: 'Бонусы',
          value: 'profit',
          hideForDesktop: true,
          icon: 'procent-card',
        });
        tabs.push({
          title: 'Личные данные',
          value: 'personal_data',
          hideForMobile: true,
          icon: 'human',
        });
        tabs.push({
          title: 'Сообщения',
          value: 'support',
          icon: 'envelope',
        });
      } else {
        tabs.push({
          title: 'Профиль',
          value: 'profile',
        });
        if (this.userType === 'model') {
          if ((this.profile.credentials && this.profile.credentials.length && this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].service.view) || this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].service.edit) tabs.push({
            title: 'Сервисы',
            value: 'services',
          });
          if (this.profile.response && (this.profile.response.history || this.profile.response.id || this.profile.response.vacancy || this.profile.response.worksheet) && this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].response.view || this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].response.edit) tabs.push({
            title: 'Отклик',
            value: 'response',
          });
          if (this.profile.dossier && this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].dossier.view || this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].dossier.edit) tabs.push({
            title: 'Досье',
            value: 'dossier',
          });
        }
        if (!this.isMyProfile && (((this.userType === 'model') && this.userPermissions.model.profile.report.view) || ((this.userType === 'operator') && this.userPermissions.operator.profile.report.view))) tabs.push({
          title: 'Отчеты',
          value: 'reports',
        });
        if (this.userType === 'model' ? (this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].materials.registration.view || this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].materials.video.view) : (this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].materials.documents.view || this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].materials.contracts.view)) tabs.push({
          title: 'Материалы',
          value: 'materials',
        });
        if (this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].absence.view || this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].absence.edit) tabs.push({
          title: 'Рабочий календарь',
          value: 'calendar',
        });
      }
      return tabs;
    },
    viewPersonalOperatorPermission() {
      return this.userPermissions.operator.personal.view;
    },
    viewPersonalModelPermission() {
      return this.userPermissions.model.personal.view;
    },
    editPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.edit;
    },
    absenceEditPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].absence.edit;
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
    isMyProfile() {
      return !this.$route.params.id || (this.$route.params.id == this.user.id);
    },
    profile() {
      return this.$store.getters["profile/profile"](this.userId);
    },
    activeService() {
      if (!(this.profile && this.profile.credentials)) return {};
      return this.profile.credentials?.find(service => service.id === this.activeServiceId) || {};
    },
    errorMessage() {
      return this.$store.state.profile.errorMessage;
    },
    resignReasons() {
      return this.$store.state.dictionaries.resignReasons;
    },
    resignReasonsForSelect() {
      return [...this.resignReasons.filter(reason => reason.role_type === this.profileRole.type), {
        title: 'Другое',
        id: 'other'
      }];
    },
    resetPasswordsStatus() {
      return this.$store.state.authHistory.status
    },
    userErrorMessage() {
      return this.$store.state.users.errorMessage;
    },
    userFieldsErrors() {
      return this.$store.state.users.fieldsErrors;
    },
    currentWorkshift() {
      return this.profile.profile?.workshift || {};
    },
    refLink() {
      return `${config.baseURLApi}/dossier.html?link=` + this.user.referral_codes.model;
    },
    userType() {
      switch (this.profile.role?.code) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
      }
      return 'employee';
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
    isHasDuplicate() {
      return this.profile['is_has_duplicate'] || false;
    },
    activeTabName() {
      return this.filteredTabs.find(tab => tab.value === this.activeTab)?.title;
    },
    isNeedScheduleFilled() {
      return this.$store.state.profile.isNeedScheduleFilled;
    },
    areProfileEditButtonsShown() {
      const statuses = {
        permissionsChange: this.userPermissions.permissions_users.management,
        refSystemModelsEdit: this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN',
        passRecovery: !this.isMyProfile && this.userPermissions.user.restore_password && !this.changedUser.resign_date,
        userActivation: !this.isMyProfile && this.userPermissions.resign_users.management && this.changedUser.resign_date,
        userResignation: !this.isMyProfile && this.userPermissions.resign_users.management && !this.changedUser.resign_date,
        userDeletion: !this.isMyProfile && this.userPermissions.user.remove,
        togglePin: this.isMyProfile && this.userPermissions.auth_without_pin,
      };
      return {
        ...statuses,
        anyButtons: Object.values(statuses).includes(true),
      };
    },
    hasPin() {
      return this.$store.state.auth.hasPin;
    },
  },
  watch: {
    isOperatorPersonal: function (newValue) {
      this.handleProfileChange();
    },
    isModel: function (newValue) {
      this.handleProfileChange();
    },
    profile: function (newProfile, prevProfile) {
      this.changedUser = {...newProfile.profile.user};
      this.profileRole = {...newProfile.role};
      if (this.activeTab === 'profile' && !['refSystemModelsView', 'refSystemModelsAdd', 'editPermissions', 'setSchedule', 'paymentInfo'].includes(this.droverType))
        this.closeDrover();
      if ((newProfile.id !== prevProfile?.id) && (newProfile.role?.code === 'ROLE_MODEL') && this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].service.view)
        this.$store.dispatch('profile/fetchProfileServices', {
          user: this.userId,
          status: ['active', 'inactive', 'locked', 'unimprovable'],
          pagination: false,
        });
    },
    layoutStatus: function (newStatus) {
      if (this.droverType === 'setSchedule' && newStatus === 'blackout-screen-close' && this.isModel) {
        this.createSchedule({
          work_shift_interval: this.modelScheduleArray,
          model: this.profile.profile.user.id,
          group: this.activeOffice.id
        });
      }
      if (newStatus === 'blackout-screen-close') {
        this.activeUser = {};
        this.droverType = '';
      }
    },
    profileStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'creating-service':
            this.closeDrover();
            break;
          case 'deleting-service':
            this.closeDrover();
            showToast(this.$toasted, `Аккаунт на сервисе «${this.deletedServiceTitle}» удалён`);
            break;
          case 'blocking-service':
            this.closeDrover();
            showToast(this.$toasted, 'Аккаунт успешно заблокироваан');
            break;
          case 'adding-resources':
            this.closeDrover();
            showToast(this.$toasted, 'Создана задача для добавления новых аккаунтов');
            break;
          case 'editing-incomes':
            this.closeDrover();
            showToast(this.$toasted, this.incomesMessage);
            break;
          case 'removing':
            this.$root.$emit('showSuccessToast', `Пользователь “${this.changedUser.surname} ${this.changedUser.name}” успешно удален`);
            this.$router.back();
            this.$router.push({name: 'Groups'});
            break;
          case 'adding':
            this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
            break;
          case 'sending-personal-schedule':
            this.closeDrover()
            showToast(this.$toasted, 'Расписание успешно отправлено');
            break;
        }
      } else if ((newStatus === 'error') && this.errorMessage) showToast(this.$toasted, this.errorMessage, 'error');
    },
    userStatus: function (newStatus, prevStatus) {
      if (newStatus === 'error') {
        if (this.droverType === 'addGroups') return;
        if (this.userFieldsErrors && this.userFieldsErrors[0]?.message) {
          showToast(this.$toasted, this.userFieldsErrors[0].message, 'error');
          let errors = {...this.fieldErrors};
          this.userFieldsErrors.forEach(field => errors[field.propertyPath] = true);
          this.fieldErrors = errors;
          return;
        }
        if (this.userErrorMessage) showToast(this.$toasted, this.userErrorMessage, 'error');
        return;
      }
      if ((newStatus === '') && (prevStatus === 'editing')) {
        if (this.editVariant === 'blocking') showToast(this.$toasted, `Сотрудник "${this.profile.profile.user.fullname}" заблокирован`);
        else if (this.editVariant === 'resigning') {
          showToast(this.$toasted, `Сотрудник "${this.profile.profile.user.fullname}" уволен`);
          this.chosenResignReason = {};
          this.resignComment = '';
        } else if (this.editVariant === 'unresigning') showToast(this.$toasted, `Сотрудник "${this.profile.profile.user.fullname}" активен`);
        this.editVariant = '';
      }
      if ((prevStatus === 'resetting') && (newStatus === '')) return showToast(this.$toasted, `Письмо с новым паролем отправлено на email сотрудника`);
    },
    resetPasswordsStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'resetting') && (newStatus === '')) return showToast(this.$toasted, 'Пароль успешно сброшен');
      if (newStatus === 'errorRequest') return showToast(this.$toasted, 'Пароль не сброшен. Пожалуйста, попробуйте ещё раз', 'error');
    },
    refStatus: function (newStatus, prevStatus) {
      if (prevStatus === 'adding-refs') {
        switch (newStatus) {
          case '':
            this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
            showToast(this.$toasted, `Сотрудник добавлен`);
            break;
          case 'error':
            showToast(this.$toasted, `Сотрудник не добавлен. Пожалуйста, попробуйте ещё раз`, 'error');
            break;
        }
      }
      if (prevStatus === 'deleting-refs') {
        switch (newStatus) {
          case '':
            this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
            break;
          case 'error':
            showToast(this.$toasted, `Пользователь не удален. Пожалуйста, попробуйте еще раз `, 'error');
            break;
        }
      }
    },
    absenceRequestStatus: function (newStatus) {
      if (newStatus === 'created' || newStatus === 'edited') showToast(this.$toasted, `Отсутствие ${newStatus === 'created' ? 'добавлено' : 'изменено'}`);
      else if (newStatus === 'deleted' || newStatus === 'error') showToast(this.$toasted, `${newStatus === 'deleted' ? 'Отсутствие удалено' : this.errorMessage || 'Ошибка'}`, 'error');
    },
    fineStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'creating-fine':
            this.closeDrover();
            showToast(this.$toasted, 'Сотруднику назначен штраф');
            break;
          case 'editing-fine':
            this.closeDrover();
            showToast(this.$toasted, 'Штраф сохранён');
            break;
          case 'canceling-fine':
            this.closeDrover();
            showToast(this.$toasted, 'Штраф отменён');
            break;
        }
      }
      if (newStatus === 'error') {
        switch (prevStatus) {
          case 'creating-fine':
            showToast(this.$toasted, 'Штраф не назначен. Пожалуйста, попробуйте ещё раз', 'error');
            break;
          case 'editing-fine':
            showToast(this.$toasted, 'Штраф не сохранен. Пожалуйста, попробуйте ещё раз', 'error');
            break;
          case 'canceling-fine':
            showToast(this.$toasted, 'Штраф не отменён. Пожалуйста, попробуйте ещё раз', 'error');
            break;
        }
      }
    },
    officeId: function (newId, prevId) {
      if (newId !== prevId && this.status !== 'request') this.$store.dispatch('profile/fetchProfile', {
        userId: this.changedUser.id,
        data: {office: newId, workweek: this.firstDayWeek}
      });
    },
    firstDayWeek: function (newDate) {
      if (this.userType === 'model' && this.officeId && this.status !== 'request') {
        this.$store.dispatch('profile/fetchProfile', {
          userId: this.changedUser.id,
          data: {office: this.officeId, workweek: newDate}
        });
      } else if (this.userType === 'operator') {
        this.$store.dispatch('profile/fetchProfile', {userId: this.changedUser.id, data: {workweek: newDate}});
      }
    },
    userId: function (newId) {
      this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
      if (this.isMyProfile && this.isOperator)
        this.setActiveTab('schedule_and_finances');
      else
        this.setActiveTab('profile');
    },
    userType(type) {
      if (type === 'model') this.$store.dispatch('profile/fetchResourcesProcess', {id: this.profile.id});
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsNonSystem');
    this.$store.dispatch('dictionaries/fetchRoles');
    this.$store.dispatch('dictionaries/fetchAttachments');
    if (this.userId) this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
    // if (this.profile.profile) this.changedUser = {...this.profile.profile.user};
    this.$store.dispatch('dictionaries/fetchResources', {type: 'webcam'});
    this.$store.dispatch('dictionaries/fetchResignReasons');
    this.$store.dispatch('dictionaries/fetchAbsenceTypes');
    this.$store.dispatch('dictionaries/getNationalities');
    this.$store.dispatch('dictionaries/getPositions');
    this.$store.dispatch('dictionaries/fetchPaymentResources');
    if (this.userPermissions.permissions_users.management) {
      this.$store.dispatch('roles/getRights');
      this.$store.dispatch('roles/getActions');
    }
    if (this.isModel || this.isOperatorPersonal)
      this.setActiveTab('schedule_and_finances');
    else
      this.setActiveTab('profile');
  },
  mounted() {
    this.$nextTick(() => this.resizeWidth());
    this.$root.$on('resize', this.resizeWidth);
    this.$root.$on('set-profile-tab', this.setActiveTab);
  },
  beforeDestroy() {
    this.$root.$off('resize', this.resizeWidth);
    this.$root.$off('set-profile-tab', this.setActiveTab);
  },
  methods: {
    ...mapActions('profile', ['createAbsence', 'deleteAbsence', 'editAbsence']),
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('schedule', ['createSchedule', 'fetchNextWeekSchedule']),
    restorePasswords() {
      this.$store.dispatch('authHistory/resetPasswords', [this.userId]);
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    checkWorkshiftState(isBlank) {
      this.isBlankWorkshift = isBlank;
    },
    showScheduleFilling(scheduleData) {
      this.showDrover('scheduleFilling');
      this.activeScheduleData = scheduleData;
    },
    showIncomeDetails(shiftId) {
      this.showDrover('incomeDetails');
      this.activeShiftId = shiftId;
    },
    handleProfileChange() {
      if (this.isMyProfile && this.isOperator)
        this.setActiveTab('schedule_and_finances');
      else
        this.setActiveTab('profile');
    },
    blockUser() {
      if (!this.profile.profile.user.blocked) this.editVariant = 'blocking';
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.userId,
        blocked: !this.profile.profile.user.blocked
      });
    },
    removeCurrentGroup() {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.userId,
        groups: this.profile.profile.groups.map(group => group.id).filter(groupId => groupId !== this.currentGroup),
      });
    },
    deleteGroup(group) {
      this.currentGroup = group.id;
      this.currentGroupTitle = group.title;
      this.$bvModal.show('delete_group_modal');
    },
    addGroups() {
      this.showGroupsForOperator = true;
      this.showDrover('addGroups');
    },
    addOperatorGroups() {
      this.showGroupsForOperator = false;
      this.showDrover('addGroups');
    },
    setSchedule(office) {
      this.droverBreadcrumbs = '';
      this.currentScheduleDate = null;
      this.activeOffice = office;
      this.showDrover('setSchedule');
    },
    setOffice(officeId) {
      this.officeId = officeId;
    },
    editService(serviceId) {
      this.activeServiceId = serviceId;
      this.showDrover('editService');
    },
    editPermissions() {
      this.editVariant = 'permissions';
      this.showDrover('editPermissions');
    },
    closeDrover() {
      this.droverType = '';
      this.toggleHelper(false);
    },
    deleteService() {
      this.$bvModal.show('delete_service_modal');
      this.toggleHelper(false);
    },
    removeActiveService() {
      this.deletedServiceTitle = this.activeService.resource?.title;
      this.$store.dispatch('profile/deleteUserService', {...this.activeService, user: this.userId});
    },
    saveSchedule(schedule) {
      this.modelScheduleArray = schedule;
    },
    startWeek(data) {
      this.firstDayWeek = data.date;
    },
    fetchSchedule() {
      this.$store.dispatch('profile/fetchProfile',
        {userId: this.changedUser.id, data: {office: this.officeId, workweek: this.firstDayWeek}});
    },
    fetchProfileAbsence(currentDate) {
      this.$store.dispatch('profile/fetchProfile', {userId: this.userId, data: {absence_at: currentDate}});
    },
    removeUser() {
      this.$store.dispatch('profile/removeUser', this.userId);
    },
    resignUser(bvModalEvt) {
      bvModalEvt.preventDefault();
      if (!this.chosenResignReason.title) {
        this.resignReasonError = true;
        return;
      }
      this.editVariant = 'resigning';
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.changedUser.id,
        resign: this.chosenResignReason.title,
        resign_comment: this.resignComment,
        is_resign: true
      });
      this.$nextTick(() => {
        this.$bvModal.hide('resign_modal_profile');
      })
    },
    changeReasons() {
      this.resignReasonError = false;
    },
    activateUser() {
      this.editVariant = 'unresigning';
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {id: this.changedUser.id, is_resign: false});
    },
    saveJobDuties(newJobDuties) {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.changedUser.id,
        job_duties: newJobDuties
      });
    },
    openAbsenceDetails(absenceData = null) {
      this.eventDate = absenceData?.date || {};
      this.eventInfo = absenceData?.info || {};
      this.showDrover('absenceDetails');
    },
    openAbsenceDetailsFromSchedule(currentScheduleDate) {
      this.addAbsencesFromSchedule = true;
      this.currentScheduleDate = currentScheduleDate;
      this.openAbsenceDetails();
    },
    returnModelSchedule() {
      this.addAbsencesFromSchedule = false;
      this.showDrover('setSchedule');
    },
    openOperatorProfile({user}) {
      this.openMiniProfile(user);
    },
    createUserAbsence(absence, currentDate) {
      absence.user = this.userId;
      this.createAbsence(absence).then(() => {
        this.fetchProfileAbsence(currentDate);
        if (this.addAbsencesFromSchedule) this.returnModelSchedule();
        else this.toggleHelper(false);
      })
    },
    editUserAbsence(data, currentDate) {
      data.absence.user = this.userId;
      this.editAbsence(data).then(() => {
        this.fetchProfileAbsence(currentDate);
        this.toggleHelper(false);
      })
    },
    deleteUserAbsence(id, currentDate) {
      this.deleteAbsence(id).then(() => {
        this.fetchProfileAbsence(currentDate);
        this.toggleHelper(false);
      })
    },
    openMiniProfile(profile) {
      this.activeUser = {id: profile.id, fullname: profile.fullname, office: {id: profile.office.id || profile.office}};
      this.showDrover('miniProfile');
    },
    openMiniProfileFromId(userId) {
      this.activeUser = {id: userId, office: {}};
      this.showDrover('miniProfile');
    },
    openReportDetails(reportId) {
      this.activeReport = reportId;
      this.showDrover('reportDetails');
    },
    copyLinkSuccess() {
      showToast(this.$toasted, 'Ссылка скопирована в буфер');
    },
    showDrover(type) {
      this.droverType = type;
      this.toggleHelper(true);
    },
    showRefSystemModelsAdd(userType) {
      this.refType = userType;
      this.droverType = 'refSystemModelsAdd';
      this.toggleHelper(true);
    },
    showFineDetails(fine) {
      this.activeFine = fine;
      this.showDrover('fineDetails');
    },
    resizeWidth(e) {
      const width = e || window.innerWidth;
      this.showMobile = width <= 767;
      this.showStatusPoint = (width >= 1280 && width <= 1700 && this.isOperatorPersonal) || (width <= 500 && this.isModel);
    },
    togglePersonalPercentages() {
      this.$store.dispatch('profile/editPersonalPercentages', {
        id: this.userId,
        data: {
          are_personal_settings_active: !this.profile.payment_percentages_data.are_personal_settings_active,
        },
      });
    },
    openPayment(payment) {
      this.paymentId = payment;
      this.showDrover('paymentDetails');
    },
    togglePin() {
      if (this.hasPin) return this.$bvModal['toggle_pin_modal'].show();
      if (this.profileStatus === 'setting-pin') return;
      return this.$store.dispatch('profile/setUserPin');
    },
    removeUserPin() {
      if (this.profileStatus === 'deleting-pin') return;
      return this.$store.dispatch('profile/deleteUserPin');
    },
  }
};
</script>
