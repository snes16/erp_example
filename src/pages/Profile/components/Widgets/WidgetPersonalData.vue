<template>
  <div class="card personal_operator-card">
    <div class="personal_operator-card-header">
      <h5 v-if="showMobile">Личные данные</h5>
      <h3 v-else>Личные данные</h3>
    </div>
    <div class="personal_operator-card-body">
      <div v-if="!isOperatorPersonal || changedUser.phone"
           class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title">
          <b>Телефон</b>
        </div>
        <div class="personal_operator-card-body-row-value">
          <phone-number-input v-model="changedUser.phone"
                              :error="fieldErrors.phone"
                              :disabled="!editPermission"
                              :key="`profile-phone-input-main-${userId}`"
                              @change="editUser('phone', $event)"
                              @input="inputField('phone')"
          />
        </div>
      </div>
      <div v-if="!isOperatorPersonal && !isModelPersonal || changedUser.additional_phone"
           class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title">
          <b>Доп. телефон</b>
        </div>
        <div class="personal_operator-card-body-row-value">
          <phone-number-input v-model="changedUser.additional_phone"
                              :error="fieldErrors.additional_phone"
                              :disabled="!editPermission"
                              :key="`profile-phone-input-additional-${userId}`"
                              @change="editUser('additional_phone', $event)"
                              @input="inputField('additional_phone')"
          />
        </div>
      </div>
      <div v-if="!isOperatorPersonal && !isModelPersonal || changedUser.email"
           class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title -email">
          <b>Email</b>
        </div>
        <div class="personal_operator-card-body-row-value">
          <input v-if="editPermission"
                 v-model="changedUser.email"
                 class="personal_operator-card-body-row-value-input"
                 :class="editPermission ? '-editable_fields' : ''"
                 @change="editUser('email')"
          />
          <span class="personal_operator-card-body-row-value-email" v-else>{{ changedUser.email }}</span>
        </div>
      </div>
      <div v-if="!isOperatorPersonal && !isModelPersonal" class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title">
          <b>Пол</b>
        </div>
        <div class="personal_operator-card-body-row-value">
          <div class="personal_operator-card-body-row-value-select"
               :class="editPermission ? '-editable_fields' : ''">
            <custom-select v-model="changedUser.gender"
                           :options="genders"
                           :disabled="!editPermission"
                           defaultText="Выберите пол"
                           class="-alt -border"
                           @change="editUser('gender')"
            />
          </div>
        </div>
      </div>
      <div v-if="profile.role && profile.role.code === 'ROLE_MODEL' && !isModelPersonal" class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title">
          <b>Национальность</b>
        </div>
        <div class="personal_operator-card-body-row-value">
          <div class="personal_operator-card-body-row-value-select"
               :class="editPermission ? '-editable_fields' : ''">
            <custom-select v-model="changedUser.nationality"
                           defaultText="Выберите национальность"
                           titleField="title"
                           valueField="id"
                           :options="nationalities"
                           searchable
                           returnWholeObject
                           :disabled="!editPermission"
                           class="-alt -border"
                           @change="editUser('nationality')"
            />
          </div>
        </div>
      </div>
      <div v-if="!isOperatorPersonal && !isModelPersonal" class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title">
          <b>Возраст</b>
        </div>
        <div class="personal_operator-card-body-row-value">
          <div class="personal_operator-card-body-row-value-input">
            <span v-if="changedUser.birthday">{{ getAgeByBirthday(changedUser.birthday) }}</span>
            <span v-else class="text-gray">Не выбрана дата рождения</span>
          </div>
        </div>
      </div>
      <div v-if="!isOperatorPersonal && !isModelPersonal" class="personal_operator-card-body-row">
        <div class="personal_operator-card-body-row-title">
          <b>Дата рождения</b>
        </div>
        <div class="personal_operator-card-body-row-value-date"
             :class="editPermission ? '-editable_fields' : ''">
          <date-picker class="datepicker-plain personal_operator-card-body-row-value-date-picker"
                       lang="ru"
                       v-model="changedUser.birthday"
                       :disabled="!editPermission"
                       :input-class="'input-plain' + (shownErrors.includes('birthday') ? ' -error' : '')"
                       format="DD.MM.YYYY"
                       @change="editUser('birthday')"
          ><i slot="calendar-icon"/>
          </date-picker>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PhoneNumberInput from "@/components/Common/PhoneNumberInput.vue";
import moment from "moment";
import {getTypeEditUser} from "@/tools/tools";
import Select from "@/components/Common/Select/Select";
import DatePicker from "vue2-datepicker";
import EmailField from "@/components/Common/EmailField.vue";

export default {
  name: 'widget-personal-data',
  components: {
    'date-picker': DatePicker,
    'custom-select': Select,
    PhoneNumberInput,
    EmailField,
  },
  props: {
    profile: Object,
    userPermissions: Object,
    userId: Number,
    userType: String,
    isMyProfile: Boolean,
    isOperatorPersonal: Boolean,
    isModelPersonal: Boolean,
    showMobile: Boolean,
  },
  data() {
    return {
      moment: moment,
      changedUser: {},
      shownErrors: [],
      fieldErrors: {},
      activeOffice: {},
      checkOffice: 'empty',
      week: 0,
    }
  },
  computed: {
    editPermission() {
      return this.userPermissions[this.userType].profile.personal.edit;
    },
    genders() {
      return this.$store.state.dictionaries.genders;
    },
    nationalities() {
      return this.$store.state.dictionaries.nationalities;
    },
    modelOffices() {
      return this.profile?.profile?.common_groups || [{id: null, title: "Выберите офис"}];
    },
  },
  watch: {
    profile: function (newProfile, oldProfile) {
      if (newProfile) {
        this.changedUser = {
          ...newProfile.profile.user,
          showDutiesDashboard: newProfile.profile.user?.job_duty_settings?.is_show_on_dashboard
        };
        if (this.userType === 'model' && (!newProfile.profile.groups?.some(group => group.id === this.activeOffice.id) || newProfile.profile.user.main_group?.id !== oldProfile.profile.user.main_group?.id)) ;
        this.setOfficeId(this.changedUser.main_group?.id);
        if (!oldProfile.id) this.week = 0;
      }
    },
  },
  created() {
    if (this.profile) {
      this.changedUser = {
        ...this.profile.profile?.user,
        showDutiesDashboard: this.profile.profile?.user?.job_duty_settings?.is_show_on_dashboard
      }
      if (this.userType === 'model') this.setOfficeId(this.profile.profile?.user.main_group.id);
    }
  },
  methods: {
    editUser(field, e) {
      let data = {id: this.changedUser.id};
      switch (field) {
        case 'phone':
          if (!e.isValid) return this.fieldErrors = {
            ...this.fieldErrors,
            phone: true,
          };
          data.phone = this.changedUser.phone;
          break;
        case 'additional_phone':
          if (!e.isValid) return this.fieldErrors = {
            ...this.fieldErrors,
            additional_phone: true,
          };
          data.additional_phone = this.changedUser.additional_phone;
          break;
        case 'email':
          data.email = this.changedUser.email;
          break;
        case 'birthday':
          data.birthday = this.changedUser.birthday ? moment(this.changedUser.birthday).format('YYYY-MM-DD') : null;
          break;
        case 'gender':
          data.gender = this.changedUser.gender;
          break;
        case 'nationality':
          data.nationality = this.changedUser.nationality?.id;
          break;
        case 'job_duty_settings':
          data.job_duty_settings = {is_show_on_dashboard: this.changedUser.showDutiesDashboard};
          break;
      }
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, data);
    },
    setOffice() {
      this.$emit('setOffice', this.activeOffice.id);
      if (!this.activeOffice.id) this.checkOffice = 'officeNotSelected';
      else if (this.activeOffice.id) this.checkOffice = 'officeSelected';
    },
    setOfficeId(mainGroupId) {
      let office = this.modelOffices.find(office => office.id === mainGroupId);
      if (office) this.activeOffice = office;
      else this.activeOffice = this.modelOffices[1] || {};
      this.setOffice();
    },
    getAgeByBirthday(date) {
      return moment().diff(date, 'years');
    },
    inputField(fieldName) {
      this.fieldErrors = {
        ...this.fieldErrors,
        [fieldName]: false,
      }
    },
  }
}
</script>
