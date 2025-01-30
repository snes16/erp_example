<template>
  <div class="add_services">
    <div class="theme-helper-content-main-header">
      <b-button :variant="creatingCardStatus ? 'primary' : 'outline-primary'" size="sm" @click="showCreating" :disabled="!chosenResources.length">Добавить</b-button>
    </div>
    <div v-if="creatingCardStatus" class="add_services-creating">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">Укажите дату регистрации аккаунтов</h4>
            <div class="helper-close" @click="hideCreating"></div>
          </div>
          <div class="d-flex justify-content-between">
            <div class="response-action_form-action_field-date -md">
              <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
              <date-picker
                v-model="plannedDate"
                lang="ru"
                type="date"
                input-class="form-control"
                :input-class="'input-plain' + (showError === 'planned_start_at' ? '-error' : '')"
                placeholder="Выберите дату регистрации"
                format="DD.MM.YYYY"
                value-type="YYYY-MM-DD"
                @focus="focusPlannedDate"
              >
                <i slot="calendar-icon" />
              </date-picker>
            </div>
            <b-button variant="primary" @click="addServices">Выполнить</b-button>
          </div>
        </div>
      </div>
    </div>
    <div class="theme-helper-content-main-body">
      <h4>Добавить дополнительные аккаунты</h4>
      <div class="add_services-resources">
        <div class="add_services-resources-content">
          <div v-for="(resourceTitle, resourceId) in resources" class="add_services-resources-resource">
            <b class="add_services-resources-resource-title">{{ resourceTitle }}</b>
            <div class="add_services-resources-resource-checkbox">
              <span v-if="resourcesProcess[resourceId]"
                    class="text-gray add_services-resources-resource-checkbox-process">Аккаунт на регистрации</span>
              <span class="add_services-resources-resource-checkbox-message">Зарегистрировать</span>
              <div class="abc-checkbox">
                <input v-model="chosenResources" :value="resourceId" type="checkbox" :id="`resource-${resourceId}`"
                       :disabled="resourcesProcess[resourceId] || creatingCardStatus"/>
                <label :for="`resource-${resourceId}`"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/Common/Datepicker/index';
export default {
  name: 'add-services',
  components: {
    'date-picker': DatePicker,
  },
  props: {
    userId: [Number, String],
    resourcesProcess: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      chosenResources: [],
      creatingCardStatus: false,
      plannedDate: '',
      showError: ''
    }
  },
  computed: {
    resources() {
      return this.$store.state.dictionaries.resourcesWebcam;
    },
    profileStatus() {
      return this.$store.state.profile.status;
    }
  },
  methods: {
    addServices() {
      if(!this.plannedDate) return this.showError = 'planned_start_at';
      if (!this.chosenResources.length || (this.profileStatus === 'adding-resources')) return;
      this.$store.dispatch('profile/addResources', {
        userId: this.userId,
        data: {
          resources: this.chosenResources,
          next: {planned_start_at: this.plannedDate}
        }
      }).then(() => {
        this.$store.dispatch('profile/fetchResourcesProcess', {id: this.userId});
        this.hideCreating()
      })
    },
    showCreating() {
      this.creatingCardStatus = true
    },
    hideCreating() {
      this.creatingCardStatus = false
    },
    focusPlannedDate() {
      this.showError = ''
    }
  }
}
</script>