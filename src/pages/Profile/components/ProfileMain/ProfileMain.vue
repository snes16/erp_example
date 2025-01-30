<template>
  <div>
    <div v-if="profile.profile" class="profile_main">
      <div class="profile_main-block -main">
        <div v-if="!isMyProfile && viewPermission" class="card profile_main-card">
          <div class="profile_main-card-header">
            <h3>Дополнительная информация</h3>
          </div>
          <div class="profile_main-card-body">
            <template v-if="profile.profile && profile.profile.user && profile.profile.user.resign">
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title">
                  <b>Дата увольнения</b>
                </div>
                <div class="profile_main-card-body-row-value">
                  <div class="profile_main-card-body-row-value-icon glyphicon glyphicon-glyph-calendar"/>
                  {{ resignDate }}
                </div>
              </div>
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title">
                  <b>Причина увольнения</b>
                </div>
                <div class="profile_main-card-body-row-value">
                  {{ profile.profile.user.resign }}
                </div>
              </div>
            </template>
            <div v-if="lastDate" class="profile_main-card-body-row">
              <div class="profile_main-card-body-row-title">
                <b>Последняя смена</b>
              </div>
              <div class="profile_main-card-body-row-value">
                {{ lastDate }}
              </div>
            </div>
            <template v-if="seniorityInfo">
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title">
                  <b>Стаж работы</b>
                </div>
                <div class="profile_main-card-body-row-value d-flex">
                  <span>{{ totalSeniority }}</span>
                  <shifts-numbers-badge :shifts-numbers="profile.shifts_numbers"
                                        :group="profile.profile.user.main_group"
                                        :fullname="profile.profile.user.fullname || profile.profile.user.model_nickname"
                                        id="profile-shifts-numbers"/>
                </div>
              </div>
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title">
                  <b>Дата выхода</b>
                  <info v-if="prevSeniorityInfo && !profile.profile.user.resign"
                        class="profile_main-card-body-row-title-icon" id="info-seniority"/>
                </div>
                <div class="profile_main-card-body-row-value">
                  <div class="profile_main-card-body-row-value-icon glyphicon glyphicon-glyph-calendar"/>
                  {{ formattedDate(seniorityInfo.start_at) }}
                </div>
              </div>
            </template>
            <div v-if="profile.profile.user.source_user" class="profile_main-card-body-row">
              <div class="profile_main-card-body-row-title">
                <b>Источник прихода</b>
              </div>
              <div class="profile_main-card-body-row-value">
                <b>{{ profile.profile.user.source_user.fullname }}</b>
                <div class="profile_main-card-body-row-value-group">
                  <span class="flag-icon mr-1"
                        :class="`flag-icon-${profile.profile.user.source_user.main_group.flag || (profile.profile.user.source_user.main_group.build_group && profile.profile.user.source_user.main_group.build_group.flag) || 'default'}`"
                        :title="profile.profile.user.source_user.main_group.country || (profile.profile.user.source_user.main_group.build_group && profile.profile.user.source_user.main_group.build_group.country)"></span>
                  <span class="text-gray mr-1">{{
                      profile.profile.user.source_user.main_group.city || (profile.profile.user.source_user.main_group.build_group && profile.profile.user.source_user.main_group.build_group.city)
                    }}</span>
                  <span v-if="profile.profile.user.source_user.main_group.office">
                        {{ profile.profile.user.source_user.main_group.office }}
                      </span>
                  <span
                      v-else-if="profile.profile.user.source_user.main_group.build_group && profile.profile.user.source_user.main_group.build_group.office">
                        {{ profile.profile.user.source_user.main_group.build_group.office }}
                      </span>
                </div>
              </div>
            </div>
          </div>
          <b-tooltip v-if="prevSeniorityInfo && !profile.profile.user.resign" target="info-seniority"
                     triggers="hover"
                     placement="right" custom-class="profile_main-card-body-tooltip">
            <h4 class="text-left">Предыдущие периоды работы</h4>
            <div v-for="info in prevSeniorityInfo" class="profile_main-card-body-tooltip-body">
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title -more">
                  <b>Дата выхода</b>
                </div>
                <div class="profile_main-card-body-row-value">
                  <div class="profile_main-card-body-row-value-icon glyphicon glyphicon-glyph-calendar"/>
                  {{ formattedDate(info.start_at) }}
                </div>
              </div>
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title -more">
                  <b>Дата увольнения</b>
                </div>
                <div class="profile_main-card-body-row-value">
                  <div class="profile_main-card-body-row-value-icon glyphicon glyphicon-glyph-calendar"/>
                  {{ formattedDate(info.end_at) }}
                </div>
              </div>
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title -more">
                  <b>Стаж работы</b>
                </div>
                <div class="profile_main-card-body-row-value">
                  {{ formattedSeniority(info.seniority) }}
                </div>
              </div>
              <div class="profile_main-card-body-row">
                <div class="profile_main-card-body-row-title -more">
                  <b>Причина увольнения</b>
                </div>
                <div class="profile_main-card-body-row-value">
                  {{ info.resign }}
                </div>
              </div>
            </div>
          </b-tooltip>
        </div>
        <widget-personal-data
            :profile="profile"
            :userPermissions="userPermissions"
            :userId="userId"
            :user-type="userType"
            :is-my-profile="isMyProfile"
        />
        <widget-payment-info v-if="paymentInfoViewPermission"
                             :profile="profile"
                             :userPermissions="userPermissions"
                             @edit="editPaymentInfo"
        />
        <widget-fine v-if="isSuperAdmin" :user-id="userId"
                     @openFineDetails="openFineDetails"/>
      </div>
      <widget-job-duties v-if="viewPermission"
                         :profile="profile"
                         :user-permissions="userPermissions"
                         :is-my-profile="isMyProfile"
                         :changed-user="changedUser"
                         :user-type="userType"
                         @changeJobDuties="changeJobDuties"
      />
      <div class="profile_main-block -additional">
        <widget-profit v-if="isSuperAdmin"
                       :user-id="userId"
        />
        <div v-if="(userType === 'model') && !isMyProfile && userPermissions.model[isMyProfile ? 'personal' : 'profile'].history.view"
            class="card profile_main-card">
          <div class="profile_main-card-header">
            <h3>История работы</h3>
          </div>
          <div class="profile_main-card-body -fixed">
            <template v-if="profile.profile.history.length">
              <div v-for="(comment, key) in profile.profile.history" class="profile_main-card-body-comment" :key="key">
                <div class="avatar profile_main-card-body-comment-avatar"
                     :style="comment.user.avatar ? `background-image: url(${comment.user.avatar}); background-size: cover;` : ''"></div>
                <div class="profile_main-card-body-comment-main">
                  <p class="m-0">
                    <b>{{ comment.user.fullname }}</b>
                    <span v-if="comment.system_message" class="text-gray"> {{ comment.system_message.message }}</span>
                  </p>
                  <p class="profile_main-card-body-comment-main-description">
                    {{ comment.message }}
                  </p>
                  <p class="profile_main-card-body-comment-main-time">
                    {{ dateFormat(comment.created_at) }}
                  </p>
                </div>
              </div>
            </template>
            <template v-else>
              <span class="text-center d-block">Данные отсутствуют</span>
            </template>
          </div>
          <form class="profile_main-card-footer" @submit.prevent="sendComment">
            <b-input v-model="newComment" type="text" placeholder="Комментарий"/>
          </form>
        </div>
<!--        <payment-percentages v-if="arePercentagesPermitted && (userType !== 'employee')"
                             :percentages-data="profile.payment_percentages_data"
                             :edit-permission="editPermission"
                             :user-id="userId"
                             @edit="editPaymentPercentages"
        />-->
        <widget-profile-schedule
            :profile="profile"
            :user-permissions="userPermissions"
            :user-type="userType"
            :is-my-profile="isMyProfile"
            :changed-user="changedUser"
            @openModelMiniProfile="openMiniProfile"
            @setSchedule="setSchedule"
            @setOffice="setOffice"
            @startWeek="startWeek"
        />
        <template v-if="userPermissions[userType][isMyProfile ? 'personal' : 'profile'].group.view">
          <div class="card profile_main-card">
            <div class="profile_main-card-header">
              <div class="profile_main-card-header-title">
                <h3>Группы</h3>
                <div v-if="groupsQuantity" class="profile_main-card-header-title-badge ml-2">{{ groupsQuantity }}</div>
              </div>
              <div v-if="groupsEditPermission" class="profile_main-card-header-edit" @click="addOperatorGroups">
                <span>Изменить</span>
                <pen/>
              </div>
            </div>
            <div class="profile_main-card-groups">
              <div v-if="profile.profile.user && profile.profile.user.main_group"
                   class="profile_main-card-groups-group"
              >
                <div><b>{{ profile.profile.user.main_group.title }}</b></div>
                <div v-if="profile.profile.user.main_group.path">{{ profile.profile.user.main_group.path }}</div>
                <div class="profile_main-card-groups-group-main">Основная</div>
              </div>
            </div>
          </div>
          <div v-if="(profile.role && profile.role.type === 'operator') && profile.profile.groups"
               class="card profile_main-card"
          >
            <div class="profile_main-card-header">
              <div class="profile_main-card-header-title">
                <h3>Модельные офисы</h3>
                <div v-if="profile.profile.groups.length"
                     class="profile_main-card-header-title-badge ml-2"
                >{{ profile.profile.groups.length }}</div>
              </div>
              <div v-if="groupsEditPermission" class="profile_main-card-header-edit" @click="addGroups">
                <span>Изменить</span>
                <pen/>
              </div>
            </div>
            <div class="profile_main-card-groups">
              <div v-for="group in profile.profile.groups" class="profile_main-card-groups-group">
                <div>
                  <b>{{ group.title }}</b>
                  <template v-if="group.deactivate_at">
                    <label class="groups-details-card-header-data-title-btn btn-cross"
                           :id="`deactivated-${group.id}`"></label>
                    <b-tooltip :target="`deactivated-${group.id}`" triggers="hover click">
                      <div class="profile-main-info-data-resign-tooltip">
                        <div>Офис деактивирован</div>
                        <div><b>Дата деактивации: </b>{{ group.deactivationDate }}</div>
                      </div>
                    </b-tooltip>
                  </template>
                </div>
                <div v-if="group.path">{{ group.path }}</div>
                <i v-if="groupsEditPermission"
                     class="profile_main-card-groups-group-delete glyphicon glyphicon-trash"
                     @click="deleteGroup(group)"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div v-if="isHasDuplicate" class="profile-collapse">
      <div class="profile-collapse-title" v-b-toggle.collapse>
        <h3 class="profile-collapse-title-text">Архивные данные</h3>
        <i :class="`fa fa-angle-down`"/>
      </div>
      <b-collapse visible id="collapse">
        <div class="profile_main">
          <div class="profile_main-col">
            <div v-if="viewPermission" class="card profile_main-card">
              <div class="profile_main-card-header">
                <h3>Личные данные</h3>
              </div>
              <div class="profile_main-card-body">
                <div v-if="changedUser.archive.phone" class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Телефон</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <span>{{ changedUser.archive.phone }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="changedUser.archive.additional_phone" class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Доп. телефон</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <span>{{ changedUser.archive.additional_phone }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="changedUser.archive.email" class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Email</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <span>{{ changedUser.archive.email }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="changedUser.archive.gender" class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Пол</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <span>{{ genders[changedUser.archive.gender] }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="changedUser.archive.nationality" class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Национальность</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <span>{{ changedUser.archive.nationality.title }}</span>
                    </div>
                  </div>
                </div>
                <div class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Возраст</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <span v-if="changedUser.archive.birthday">{{
                          getAgeByBirthday(changedUser.archive.birthday)
                        }}</span>
                      <span v-else class="text-gray">Не выбрана дата рождения</span>
                    </div>
                  </div>
                </div>
                <div v-if="changedUser.archive.birthday" class="profile_main-card-body-row">
                  <div class="profile_main-card-body-row-title">
                    <b>Дата рождения</b>
                  </div>
                  <div class="profile_main-card-body-row-value">
                    <div class="profile_main-card-body-row-value-input">
                      <div class="profile_main-card-body-row-value-icon glyphicon glyphicon-glyph-calendar"/>
                      <span>{{ formattedDate(changedUser.archive.birthday) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";
import EmailField from "@/components/Common/EmailField";
import PhoneNumberInput from "@/components/Common/PhoneNumberInput";
import CardNumber from "@/components/Common/HiddenData/CardNumber";
import CardExpiresAt from "@/components/Common/HiddenData/CardExpiresAt";
import ShiftsNumbersBadge from "@/components/Common/ShiftsNumbersBadge";
import WidgetProfit from "../Widgets/WidgetProfit.vue";
import WidgetFine from "../Widgets/WidgetFine.vue";
import WidgetJobDuties from "../Widgets/WidgetJobDuties.vue";
import WidgetPaymentInfo from "../Widgets/WidgetPaymentInfo.vue";
import WidgetPersonalData from "../Widgets/WidgetPersonalData.vue";
import WidgetProfileSchedule from "../Widgets/WidgetProfileSchedule.vue";
import pen from "@/assets/vue-svg/pen.svg";
import eye from "@/assets/vue-svg/eye.svg";
import info from '@/assets/info.svg';
import copy from "@/assets/vue-svg/copy-transparent.svg";
import moment from 'moment';
import { pluralize } from "@/tools/tools";

export default {
  name: 'profile-main',
  props: {
    profile: Object,
    userPermissions: Object,
    scheduleAbility: Boolean,
    userId: Number,
    userType: String,
    isMyProfile: Boolean,
    isSuperAdmin: Boolean,
    isHasDuplicate: Boolean,
  },
  components: {
    'date-picker': DatePicker,
    'custom-select': Select,
    'widget-profit': WidgetProfit,
    'widget-fine': WidgetFine,
    'widget-job-duties': WidgetJobDuties,
    'widget-payment-info': WidgetPaymentInfo,
    'widget-personal-data': WidgetPersonalData,
    'widget-profile-schedule': WidgetProfileSchedule,
    PhoneNumberInput,
    EmailField,
    CardNumber,
    CardExpiresAt,
    ShiftsNumbersBadge,
    eye: eye,
    pen: pen,
    info: info,
    copy: copy,
  },
  data() {
    return {
      moment: moment,
      changedUser: {},
      shownErrors: [],
      newComment: '',
      activeOffice: {},
      // changedGroups: [],
      week: 0,
      checkOffice: 'empty',
      nextWeekScheduleFormed: false,
      fieldErrors: {},
    }
  },
  computed: {
    genders() {
      return this.$store.state.dictionaries.genders;
    },
    paymentResources() {
      return this.$store.state.dictionaries.paymentResources;
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    editPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.edit;
    },
    groupsEditPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].group.edit;
    },
    paymentInfoViewPermission() {
      return this.isMyProfile ? this.userPermissions[this.userType].personal.payment_information.view : this.userPermissions[this.userType].profile.payment.information.view;
    },
    viewPermission() {
      return this.userPermissions[this.userType][this.isMyProfile ? 'personal' : 'profile'].personal.view;
    },
    lastDate() {
      if (!this.profile?.profile?.user?.last_date) return '';
      return moment.parseZone(this.profile.profile.user.last_date).format('DD.MM.YYYY, HH:mm');
    },
    resignDate() {
      if (!this.profile?.profile?.user?.resign_date) return '';
      return moment.parseZone(this.profile.profile.user.resign_date).format('DD.MM.YYYY');
    },
    seniorityInfo() {
      return this.profile.profile?.user.periods ? this.profile.profile?.user.periods[this.profile.profile?.user.periods.length - 1] : null;
    },
    prevSeniorityInfo() {
      return this.profile.profile?.user.periods?.length > 1 ? this.profile.profile?.user.periods.slice(0, -1) : null;
    },
    totalSeniority() {
      let days = this.seniorityInfo.seniority;
      if (this.prevSeniorityInfo) this.prevSeniorityInfo.forEach(info => {
        days += info.seniority;
      })
      return this.formattedSeniority(days);
    },
    modelOffices() {
      return this.profile?.profile?.common_groups || [{id: null, title: "Выберите офис"}];
    },
    mainGroup() {
      if (!this.profile.profile?.groups?.length) return {};
      const mainGroup =  this.profile.role.type === 'operator' ? this.profile.profile.groups[0] :
          this.profile.profile.groups.find(group => group.id === this.profile.profile.user.main_group.id);
      return {
        ...mainGroup,
        deactivationDate: moment(mainGroup.deactivate_at).format('DD.MM.YYYY'),
      }
    },
    groupsQuantity() {
      if (!this.profile.role?.type || !this.profile.profile) return null;
      if (this.profile.role.type === 'operator') return this.profile.profile.operator_groups?.length;
      return this.profile.profile.groups?.length;
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
  },
  watch: {
    profile: function (newProfile, oldProfile) {
      if (newProfile) {
        this.changedUser = {
          ...newProfile.profile.user,
        };
        if (this.userType === 'model' && (!newProfile.profile.groups?.some(group => group.id === this.activeOffice.id) || newProfile.profile.user.main_group?.id !== oldProfile.profile.user.main_group?.id));
          this.setOfficeId(this.changedUser.main_group?.id);
        if (!oldProfile.id) this.week = 0;
      }
    },
    profileStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'commenting') && (newStatus === '')) this.newComment = '';
    }
  },
  created() {
    if (this.profile) {
      this.changedUser = {
        ...this.profile.profile?.user,
      }
      if (this.userType === 'model') this.setOfficeId(this.profile.profile?.user.main_group.id);
    }
  },
  methods: {
    sendComment() {
      if (this.profileStatus === 'commenting') return;
      if (!(this.profile && this.profile.profile && this.profile.profile.user)) return;
      this.$store.dispatch('profile/commentProfile', {
        id: this.profile.profile.user.id,
        comment: {text: this.newComment}
      });
    },
    deleteGroup(group) {
      this.$emit('deleteGroup', group);
    },
    addGroups() {
      this.$emit('addGroups');
    },
    addOperatorGroups() {
      if (this.profile.role?.type !== 'operator') return this.addGroups();
      this.$emit('addOperatorGroups');
    },
    changeJobDuties() {
      this.$emit('changeJobDuties');
    },
    setSchedule(office) {
      this.$emit('setSchedule', office);
    },
    setOffice(activeOfficeId) {
      if (!activeOfficeId) return;
      this.$emit('setOffice', activeOfficeId);
    },
    setOfficeId(mainGroupId) {
      let office = this.modelOffices.find(office => office.id === mainGroupId);
      if (office) this.activeOffice = office;
      else this.activeOffice = this.modelOffices[1] || {};
      this.setOffice();
    },
    dateFormat(date) {
      return moment(date).format('DD.MM.YYYY HH:mm');
    },
    openMiniProfile(profile) {
      this.$emit('openModelMiniProfile', profile);
    },
    formattedDate(date) {
      return date ? moment.parseZone(date).format('DD.MM.YYYY') : '';
    },
    formattedSeniority(days) {
      if (days <= 30) {
        return pluralize(days, ['день', 'дня', 'дней']);
      } else {
        let diffMonths = moment().diff(moment().subtract(days, 'd'), 'months');
        let mounts = diffMonths % 12;
        let years = (diffMonths - mounts) / 12;
        return `${years ? pluralize(years, ['год', 'года', 'лет']) : ''} ${mounts ? pluralize(mounts, ['месяц', 'месяца', 'месяцев']) : ''}`;
      }
    },
    getAgeByBirthday(date) {
      return moment().diff(date, 'years');
    },
    editPaymentInfo() {
      this.$emit('editPaymentInfo');
    },
    openFineDetails(fine) {
      this.$emit('fineDetails', fine);
    },
    startWeek(data) {
      this.$emit('startWeek', data)
    },
    editPaymentPercentages() {
      this.$emit('editPaymentPercentages');
    },
  }
}
</script>
