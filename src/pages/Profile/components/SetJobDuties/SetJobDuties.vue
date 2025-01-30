<template>
  <div class="job-duties">
    <div class="theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" @click="saveJobDuties">Сохранить</b-button>
    </div>
    <div class="job-duties-body">
      <div v-for="duties in filteredDutiesList" class="job-duties-body-list">
        <div class="job-duties-body-list-header">
          <span>{{duties.title}}</span>
          <div class="custom-control custom-switch">
            <input v-model="mainDuties"
                   type="checkbox"
                   class="custom-control-input"
                   :id="duties.id"
                   :value="duties.id"
                   @change="changeMainDuties($event)"
            >
            <label class="custom-control-label custom-control-label-stylization" :for="duties.id"></label>
          </div>
        </div>
        <div v-if="mainDuties.includes(duties.id)">
          <div v-for="role in duties.children" class="abc-checkbox custom_select-checkboxes-checkbox-block justify-content-start mb-2">
            <input v-model="childrenDuties" :value="role.id" type="checkbox" :id="role.id">
            <label class="custom-control-label" :for="role.id">{{ role.title }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SetJobDuties",
  props: {
    currentDuties: Array,
    roleType: String,
  },
  data() {
    return {
      mainDuties: [],
      childrenDuties: []
    }
  },
  computed: {
    dutiesList() {
      return this.$store.state.dictionaries.jobDuties;
    },
    filteredDutiesList() {
      if (this.roleType === 'all') return this.dutiesList;
      return this.dutiesList.filter(duty => duty.role_type === this.roleType);
    }
  },
  created() {
    this.setActiveRoleDuties();
  },
  methods: {
    changeMainDuties(event) {
      let currentJobDuty = this.dutiesList.find(dutyList => dutyList.id === Number(event.target.id))
      if (event.target.checked) currentJobDuty.children.forEach(duty => this.childrenDuties.push(duty.id))
      else currentJobDuty.children.forEach(duty => this.childrenDuties = this.childrenDuties.filter(childrenDuty => childrenDuty !== duty.id))
    },
    setActiveRoleDuties() {
      this.mainDuties = [];
      this.childrenDuties =[];
      this.currentDuties?.forEach(jobDuty => {
        if (this.dutiesList.some(dutyList => dutyList.id === jobDuty)) this.mainDuties.push(jobDuty);
        else this.childrenDuties.push(jobDuty);
      })
    },
    saveJobDuties() {
      this.$emit('saveJobDuties', [...this.mainDuties, ...this.childrenDuties]);
    }
  }
}
</script>