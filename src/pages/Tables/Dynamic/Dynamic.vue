<template>
  <div class="dynamic-tables">
    <!-- <h2 class="page-title">Tables - <span class="fw-semi-bold">Dynamic</span></h2> -->
    <Widget
      customHeader
    >
    <div class="d-flex justify-content-between">
      <span class='users-header'>Справочник ресурсов</span>
      <b-button variant="outline-info" @click="switchToggle()">Добавить ресурс</b-button>
      <Helper hide/>
    </div>
      <v-client-table :data="this.resources" :columns="columnsDatatable" :options="optionsDatatable">
        <div
          slot="logotype"
          slot-scope="props"
          class="users-avatar"
          :style="props.row.link ? 'background-image: url(' + props.row.logotype + '); background-size: cover;' : ''">
        </div>
        <div slot="link" slot-scope="props">{{props.row.link}}</div>
        <div class="text-center" slot="credentials" slot-scope="props">{{props.row.credentials.length}}</div>
      </v-client-table>
    </Widget>
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';
import Helper from '@/pages/Tables/Dynamic/Helper/Helper.vue';
// import { vueTableData, vueDatatableData } from './data';
import { mapState, mapActions } from 'vuex';
export default {
  name: 'Dynamic',
  components: {Widget, Helper},
  data() {
    return {
      helper: false,
      columnsDatatable: ['logotype', 'title', 'link', 'type', 'credentials'],
      optionsDatatable: {
        perPage: 10,
        pagination: {chunk: 10, dropdown: false},
        texts: {filter: '', count: '', limit: ''},
        headerClass: {bacground: 'none'},
        // columnsClasses: { id: 'width-100', description: 'width-100', status: 'width-190' },
        skin: 'table table-striped',
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down',
        },
      },
      data: this.resources,
      columns: ['logotype', 'title', 'link', 'type', 'credentials'],
      options: {
        filterByColumn: true,
        perPage: 10,
        pagination: {chunk: 10, dropdown: false},
        filterable: ['title', 'link', 'type', 'credentials'],
      },
    };
  },
  mounted() {
    this.getResources()
  },
  computed: {
    ...mapState('directory', ['resources']),
  },
  methods: {
    ...mapActions('directory', ['getResources']),
    ...mapActions('layout', ['toggleHelper']),
    switchToggle() {
      this.helper = !this.helper
      this.toggleHelper(this.helper)
    }
  }
};
</script>

<style src="./Dynamic.scss" lang="scss" />
