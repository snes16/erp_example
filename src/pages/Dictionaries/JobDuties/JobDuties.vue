<template>
  <div class="communications">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > Должностные обязанности
    </p>
    <div class="resources-header">
      <p class="resources-header-title">Должностные обязанности</p>
      <b-button v-if="editPermissions" class="resources-header-add_resource"
                variant="outline-primary" @click="openDetails">Добавить группу
      </b-button>
    </div>
    <widget class="resources-table" customHeader>
      <div v-if="status === 'fetching'" class="resources-load">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else>
        <v-client-table :data="jobDutiesList" :columns="columns" :options="options" @row-click="openDetails">
          <div class="resources-table-values-title" slot="title" slot-scope="{row}">
            {{ row.title }}
          </div>
          <div class="d-flex justify-content-end align-items-center" slot="role_type" slot-scope="{row}">
            <headset v-if="row.role_type === 'operator'"/>
          </div>
        </v-client-table>
        <div class="resources-table-footer">
          <b-pagination class="resources-table-footer-pagination" align="left" v-model="currentPage"
                        :total-rows="pagination.totalItems" :per-page="perPage"/>
        </div>
      </div>
    </widget>
    <helper contentClass="-paddingless">
      <job-duties-details v-if="droverType === 'details'"
                          :jobDuty="activeJobDuty"
                          :editPermissions="editPermissions"
                          @edit="editJobDuty"
                          @delete="showDeleteModal"
                          @create="createJobDuty"/>
    </helper>
    <b-modal id="delete_modal"
             centered
             title="Вы уверены, что хотите удалить выбранную должностную обязанность?"
             body-bg-variant="white"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" @click="hideDeleteModal">Отменить</b-button>
        <button-throbber variant="danger" :loading="status === 'deleting'" @click="deleteJobDuty">Удалить
        </button-throbber>
      </template>
      Должностная обязанность будет безвозвратно удалена
    </b-modal>
  </div>
</template>

<script>
import DictionaryDetails from "@/pages/Dictionaries/DefaultDictionary/DictionaryDetails";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
import Widget from "@/components/Widget/Widget";
import Helper from "@/components/Helper/Helper";
import JobDutiesDetails from "@/pages/Dictionaries/JobDuties/JobDutiesDetails";
import throbber from "@/assets/vue-svg/throbber.svg";
import headset from "@/assets/vue-svg/headset.svg";
import { showToast } from "@/tools/tools";

export default {
  name: "JobDuties",
  components: {
    JobDutiesDetails,
    DictionaryDetails,
    ButtonThrobber,
    'widget': Widget,
    'helper': Helper,
    'throbber': throbber,
    'headset': headset,
  },
  data() {
    return {
      activeJobDuty: {},
      sortBy: '',
      sortAscending: false,
      columns: ['title', 'role_type'],
      currentPage: 1,
      perPage: 10,
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'resources-table-cell-title ',
          count: 'resources-table-cell-count_task ',
        },
        headings: {title: 'Название', role_type: ''},
        texts: {
          noResults: 'По вашему запросу результатов не найдено',
          loading: 'Подождите, идет загрузка'
        },
        skin: 'table table-striped',
        filterable: false,
        sortable: []
      },
      droverType: ''
    }
  },
  computed: {
    jobDutiesList() {
      return this.$store.state.jobDuties.jobDuties;
    },
    newJobDuty() {
      return this.$store.state.jobDuties.newJobDuty;
    },
    pagination() {
      return this.$store.state.jobDuties.pagination;
    },
    status() {
      return this.$store.state.jobDuties.status;
    },
    errorMessage() {
      return this.$store.state.jobDuties.errorMessage;
    },
    editPermissions() {
      return this.$store.state.auth.userPermissions.admin.jobDuty.edit;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    }
  },
  watch: {
    currentPage: function () {
      this.updateJobDuties()
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.updateJobDuties();
      }
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        this.hideDeleteModal()
        this.$store.dispatch('layout/toggleHelper', false);
        if (prevStatus === 'creating') showToast(this.$toasted, `Должностная обязанность "${this.newJobDuty.title}" создана`);
        else if (prevStatus === 'deleting') showToast(this.$toasted, `Должностная обязанность "${this.activeJobDuty.title}" удалена`);
      } else if (newStatus === 'error') showToast(this.$toasted, this.errorMessage, 'error');

    }
  },
  created() {
    this.updateJobDuties();
  },
  methods: {
    openDetails(e) {
      this.activeJobDuty = e?.row || {};
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    updateJobDuties() {
      this.$store.dispatch('jobDuties/fetchJobDuties', {
        page: this.currentPage,
        per_page: this.perPage,
        lvl: 0
      });
    },
    deleteJobDuty() {
      if (this.status === 'deleting') return;
      this.$store.dispatch('jobDuties/deleteJobDuties', this.activeJobDuty.id);
    },
    createJobDuty(jobDuty) {
      if (this.status === 'creating') return;
      this.$store.dispatch('jobDuties/createJobDuties', jobDuty);
    },
    editJobDuty(jobDuty) {
      if (this.status === 'editing') return;
      this.$store.dispatch('jobDuties/editJobDuties', {id: this.activeJobDuty.id, jobDuty});
    },
    showDeleteModal() {
      this.$bvModal.show('delete_modal');
    },
    hideDeleteModal() {
      this.$bvModal.hide('delete_modal');
    },
  }
}
</script>
