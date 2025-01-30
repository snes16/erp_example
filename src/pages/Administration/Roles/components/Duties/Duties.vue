<template>
  <div class="roles-content-actions">
    <div v-for="duties in filteredDutiesList" class="roles-content-actions-action-roles">
      <div class="roles-content-actions-action">
        <div class="roles-content-rights-right-title">
          <span>{{duties.title}}</span>
        </div>
        <div class="custom-control custom-switch">
          <input v-model="mainDuties"
                 type="checkbox"
                 class="custom-control-input"
                 :id="duties.id"
                 :value="duties.id"
                 :disabled="!isUserPermissions && !userPermissions.admin.roles.edit"
                 @change="changeMainDuties($event)"
          >
          <label class="custom-control-label custom-control-label-stylization" :for="duties.id"></label>
        </div>
      </div>
      <div v-if="!isUserPermissions && mainDuties.includes(duties.id)">
        <div v-for="role in duties.children" class="abc-checkbox custom_select-checkboxes-checkbox-block justify-content-start mb-2">
          <input v-model="childrenDuties" :value="role.id" type="checkbox" :id="role.id" @change="updateJobDuties">
          <label class="custom-control-label" :for="role.id">{{ role.title }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Duties",
  props: {
    activeRole: Object,
    isUserPermissions: Boolean,
  },
  data() {
    return {
      mainDuties: [],
      childrenDuties: []
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    dutiesList() {
      return this.$store.state.dictionaries.jobDuties;
    },
    filteredDutiesList() {
      if (this.activeRole.type === 'all') return this.dutiesList;
      return this.dutiesList.filter(duty => !(((this.activeRole.type === 'main') && (duty.role_type === 'operator')) || ((this.activeRole.type === 'operator') && (duty.role_type === 'main'))));
    },
  },
  watch: {
    activeRole (newRole, oldRole) {
      if (newRole.id !== oldRole.id) this.setActiveRoleDuties();
    },
  },
  created() {
    this.setActiveRoleDuties();
  },
  methods: {
    updateJobDuties() {
      if (this.activeRole.id) this.$store.dispatch('roles/editRole', {id: this.activeRole.id, job_duties: [...this.mainDuties, ...this.childrenDuties]});
    },
    changeMainDuties(event) {
      let currentJobDuty = this.dutiesList.find(dutyList => dutyList.id === Number(event.target.id))
      if (event.target.checked) currentJobDuty.children.forEach(duty => this.childrenDuties.push(duty.id))
      else currentJobDuty.children.forEach(duty => this.childrenDuties = this.childrenDuties.filter(childrenDuty => childrenDuty !== duty.id))
      this.updateJobDuties()
    },
    setActiveRoleDuties() {
      this.mainDuties = [];
      this.childrenDuties =[];
      this.activeRole.job_duties.forEach(jobDuty => {
        if (this.dutiesList.some(dutyList => dutyList.id === jobDuty.id)) this.mainDuties.push(jobDuty.id);
        else this.childrenDuties.push(jobDuty.id);
      })
    }
  }
}
</script>