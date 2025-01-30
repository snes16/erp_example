<template>
  <div class="resources">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > Справочники ресурсов
    </p>
    <div class="resources-header">
      <p class="resources-header-title">Справочник ресурсов</p>
      <b-button v-if="editPermission"
                class="resources-header-add_resource"
                variant="outline-primary"
                @click="createResource"
      >Добавить ресурс</b-button>
    </div>
    <widget class="resources-table" customHeader>
      <div class="resources-tabs">
        <div v-for="tab in tabs"
             class="resources-tabs-tab"
             :class="tab.value === activeTab ? '-active' : ''"
             :key="tab.value"
             @click="setActiveTab(tab.value)"
        >{{ tab.title }}</div>
      </div>
      <div v-if="directoryStatus === 'request'" class="resources-load">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Ресурсы загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else>
        <v-client-table :data="resources" :columns="columns" :options="options" @row-click="openResource">
          <div class="resources-table-values-logotype"
               slot="logotype"
               slot-scope="props"
               :style="props.row.link ? 'background-image: url(' + getSmallImage(props.row.logotype) + '); background-size: cover;' : ''"
          ></div>
          <div class="resources-table-values-title"
               slot="title"
               slot-scope="props"
          >{{ props.row.title }} <span v-if="props.row.short_title">({{ props.row.short_title }})</span></div>
          <div class="resources-table-values-link"
               slot="link"
               slot-scope="props"
          >{{ props.row.link }}</div>
          <div class="resources-table-values-credentials"
               slot="credentials"
               slot-scope="props"
          >{{ props.row.credentials.length || '' }}</div>
        </v-client-table>
        <div class="resources-table-footer">
          <b-pagination v-model="currentPage"
                        class="resources-table-footer-pagination"
                        align="left"
                        :total-rows="resourcesPagination.totalItems"
                        :per-page="perPage"
          />
        </div>
      </div>
    </widget>
    <helper>
      <resource-creation v-if="droverType === 'details'" :resource="resource"/>
    </helper>
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';
import Helper from '@/components/Helper/Helper.vue';
import Select from "@/components/Common/Select/Select";
import ResourceCreation from '@/pages/Resources/ResourceCreation/ResourceCreation.vue';
import throbber from "@/assets/vue-svg/throbber.svg";
import {mapState, mapActions} from 'vuex';
import {getSmallImage, closeToast, showToast} from "@/tools/tools";

export default {
  name: 'resources',
  components: {
    'widget': Widget,
    'helper': Helper,
    'resource-creation': ResourceCreation,
    'custom-select': Select,
    'throbber': throbber
  },
  data() {
    return {
      sortBy: '',
      sortAscending: false,
      currentPage: 1,
      perPages: ['10', '25', '50', '100'],
      perPage: 10,
      resource: null,
      columns: ['logotype', 'title', 'link', 'credentials'],
      options: {
        initialPage: 1,
        headings: {logotype: 'Логотип', title: 'Название', link: 'Ссылка', credentials: 'Количество аккаунтов'},
        sortable: ['title', 'link', 'credentials'],
        texts: {filter: '', count: '', limit: '', noResults: 'Нет ресурсов по выбранному типу'},
        skin: 'table table-striped',
        sortIcon: {base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down'},
        customSorting: {
          title: this.sortResources('title'),
          link: this.sortResources('link'),
          credentials: this.sortResources('credentials')
        },
      },
      activeTab: 'hr',
      tabs: [{value: 'hr', title: 'HR'},
        {value: 'webcam', title: 'Webcam'},
        {value: 'social', title: 'Социальная сеть'},
        {value: 'room', title: 'Сервис'}],
      filters: {},
      droverType: ''
    };
  },
  computed: {
    ...mapState('directory', ['directoryStatus', 'newResource', 'error', 'resourcesPagination']),
    ...mapState('files', ['file', 'fileStatus']),
    resources() {
      return this.$store.state.directory.resources
    },
    status() {
      return this.$store.state.directory.directoryStatus;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.admin.resource.edit;
    }
  },
  watch: {
    perPage: function () {
      this.updateResources()
    },
    currentPage: function () {
      this.updateResources()
    },
    sortBy: function () {
      this.updateResources()
    },
    sortAscending: function () {
      this.updateResources()
    },
    directoryStatus: function (newStatus, prevStatus) {
      if (newStatus === '') switch (prevStatus) {
        case 'creating':
          this.addSuccessNotification();
          this.updateResources();
          this.toggleHelper(false);
          break;
        case 'deleting':
          this.updateResources();
          showToast(this.$toasted, 'Ресурс удален');
          this.toggleHelper(false);
      }
    },
    status: function (newStatus) {
      if (newStatus === 'error' && this.error) showToast(this.$toasted, this.error?.violations?.[0]?.message || this.error?.detail || 'Ошибка', 'error');
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
    resources: function (newResources) {
      if (!newResources.length && this.currentPage !== 1) this.currentPage--
    }
  },
  created() {
    this.getResources({type: this.activeTab, page: this.currentPage, per_page: this.perPage});
  },
  methods: {
    ...mapActions('directory', ['getResources', 'deleteResource']),
    ...mapActions('layout', ['toggleHelper']),
    sortResources(field) {
      return (ascending) => {
        this.sortBy = field
        this.sortAscending = ascending
      }
    },
    updateResources() {
      let filters = {type: this.activeTab, page: this.currentPage, per_page: this.perPage}
      if (this.sortBy) filters[`order[${this.sortBy}]`] = this.sortAscending ? 'asc' : 'desc';
      this.getResources(filters)
    },
    deleteNewResource(e, toast) {
      this.deleteResources(this.newResource);
      closeToast(e, toast);
    },
    createResource() {
      this.resource = null;
      this.droverType = 'details';
      this.toggleHelper(true);
    },
    openResource(props) {
      this.resource = props.row;
      this.droverType = 'details';
      this.toggleHelper(true);
    },
    deleteResources(resource) {
      this.deleteResource({creds: {resource}})
    },
    addSuccessNotification() {
      this.$toasted.success(`Ресурс "${this.newResource.title}" добавлен`, {
        action: [
          {
            text: 'Отменить',
            class: 'toasts-success-cancel',
            onClick: this.deleteNewResource,
          },
          {
            text: 'X',
            class: 'toasts-close',
            onClick: closeToast,
          },
        ]
      })
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    setActiveTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      if (this.currentPage === 1) this.updateResources()
      else this.currentPage = 1
    }
  }
};
</script>