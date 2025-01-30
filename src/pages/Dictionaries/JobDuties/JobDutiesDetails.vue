<template>
  <div class="communication_create">
    <div class="communication_create-header theme-helper-content-main-header">
      <template v-if="editPermissions">
        <div v-if="jobDuty.id">
          <button-throbber class="mr-2"
                           variant="outline-primary"
                           colorThrobber="primary"
                           size="sm"
                           :loading="status === 'editing'"
                           @click="changeDuty"
          >Сохранить</button-throbber>
          <b-button variant="outline-danger" size="sm" type="button" @click="deleteJobDuty">Удалить группу</b-button>
        </div>
        <button-throbber v-else
                         variant="outline-primary"
                         colorThrobber="primary"
                         size="sm"
                         :loading="status === 'creating'"
                         @click="createJobDuty"
        >Добавить группу</button-throbber>
      </template>
    </div>
    <div class="communication_create-body theme-helper-content-main-body">
      <h3 class="mb-4">
        <textarea-autosize v-model="jobDutyTitle"
                           class="input-plain -stretch_width"
                           :class="{'-error': showErrors.includes('title')}"
                           rows="1"
                           placeholder="Введите название"
                           @input="inputField('title')"
        />
      </h3>
      <div class="border-bottom mb-3">
        <div class="row mb-3">
          <div class="col-5">
            <b>Оргструктура</b>
          </div>
          <div class="col-7">
            <custom-select v-model="jobDutyRoleType"
                           :options="roleTypes"
                           :error="showErrors.includes('role_type')"
                           :disabled="!editPermissions"
                           @input="inputField('role_type')"
            />
          </div>
        </div>
      </div>
      <div v-for="(duty, key) in changedDuties" class="display-flex justify-content-between mb-3" :key="key">
        <textarea-autosize v-model="duty.title"
                           class="input-plain -stretch_width"
                           :class="{'-error': showErrors.includes('duty')}"
                           rows="1"
                           placeholder="Введите название обязанности"
                           @input="inputField('duty')"
        />
        <div v-if="editPermissions" class="btn-remove" @click="removeDuty(key)"/>
      </div>
      <div class="display-flex">
        <div v-if="editPermissions" class="text-info display-flex align-items-center cursor-pointer" @click="addDuty">
          <span class="mr-2">Добавить обязанность</span>
          <div class="btn-add"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
import CustomSelect from "@/components/Common/Select/Select";
import { showToast } from "@/tools/tools";

export default {
  name: "JobDutiesDetails",
  components: {
    ButtonThrobber,
    'custom-select': CustomSelect,
  },
  props: {
    jobDuty: Object,
    editPermissions: Boolean,
  },
  data() {
    return {
      jobDutyTitle: '',
      jobDutyRoleType: '',
      changedDuties: [],
      showErrors: [],
      roleTypes: [
        {
          value: 'main',
          title: 'Основная',
        },
        {
          value: 'operator',
          title: 'Операторская',
        },
      ],
    }
  },
  computed: {
    status() {
      return this.$store.state.jobDuties.status;
    },
  },
  created() {
    this.jobDutyTitle = this.jobDuty?.title;
    this.jobDutyRoleType = this.jobDuty?.role_type;
    this.changedDuties = this.jobDuty?.children ? this.jobDuty.children.map(duty => ({title: duty.title, id: duty.id})) : [{}];
  },
  methods: {
    createJobDuty() {
      if (!this.jobDutyTitle) this.showErrors.push('title');
      if (!this.jobDutyRoleType) this.showErrors.push('role_type');
      if (!this.changedDuties[0].title) {
        this.showErrors.push('duty');
        showToast(this.$toasted, 'Необходимо что бы была как минимум обязанность', 'error');
      }
      if (this.showErrors.length) return;
      this.$emit('create', {title: this.jobDutyTitle, role_type: this.jobDutyRoleType, children: this.changedDuties.filter(duty => duty.title)});
    },
    deleteJobDuty() {
      this.$emit('delete');
    },
    changeDuty() {
      if (!this.jobDuty.id) return;
      this.$emit('edit', {title: this.jobDutyTitle, role_type: this.jobDutyRoleType, children: this.changedDuties});
    },
    removeDuty(key) {
      if (this.changedDuties.length === 1) return showToast(this.$toasted, 'Необходимо что бы была как минимум обязанность', 'error');
      this.changedDuties = this.changedDuties.filter((_, index) => index !== key);
    },
    addDuty() {
      this.changedDuties = [...this.changedDuties, {}];
    },
    inputField(fieldName) {
      this.showErrors = this.showErrors.filter(error => error !== fieldName);
    },
  }
}
</script>