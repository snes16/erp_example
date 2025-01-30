<template>
  <div class="communications">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > Способы коммуникации
    </p>
    <div class="resources-header">
      <p class="resources-header-title">Способы коммуникации</p>
      <b-button v-if="userPermissions.admin.communication.edit"
                class="resources-header-add_resource"
                variant="outline-primary"
                @click="createCommunication"
      >Добавить способ коммуникации</b-button>
    </div>
    <widget class="resources-table" customHeader>
      <v-client-table :data="communications" :columns="columns" :options="options" @row-click="openCommunication">
        <div class="resources-table-values-logotype"
             slot="logo"
             slot-scope="props"
             :style="props.row.logo ? 'background-image: url(' + getSmallImage(props.row.logo) + '); background-size: cover;' : ''"
        ></div>
        <div class="resources-table-values-title"
             slot="title"
             slot-scope="props"
        >{{ props.row.title }}
        </div>
        <div class="resources-table-values-credentials"
             slot="count_task"
             slot-scope="props"
        >{{ props.row.count_task }}</div>
      </v-client-table>
      <div class="resources-table-footer">
        <b-pagination v-model="currentPage"
                      class="resources-table-footer-pagination"
                      align="left"
                      :total-rows="pagination.totalItems"
                      :per-page="perPage"
                      @change="updateCommunications"
        />
      </div>
    </widget>
    <helper contentClass="-paddingless">
      <communication-create v-if="droverType === 'create'"/>
      <communication-details v-else-if="droverType === 'details'"
                             :communication="activeCommunication"
                             @delete="showDeleteModal"
      />
    </helper>
    <b-modal id="delete_modal"
             centered
             :title="`Удалить способ коммуникации «${activeCommunication.title}»?`"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="deleteCommunication"
    >Вся информация об этом способе коммуникации будет удалена</b-modal>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Helper from '@/components/Helper/Helper.vue';
import CommunicationCreate from "./CommunicatonCreate";
import CommunicationDetails from "./CommunicationDetails";
import {getSmallImage} from "@/tools/tools";

export default {
  name: 'communications',
  components: {
    'widget': Widget,
    'helper': Helper,
    'communication-create': CommunicationCreate,
    'communication-details': CommunicationDetails,
  },
  data() {
    return {
      sortAscending: false,
      columns: ['logo', 'title', 'count_task'],
      currentPage: 1,
      perPage: 10,
      options: {
        initialPage: 1,
        columnsClasses: {
          logo: 'resources-table-cell-logotype ',
          title: 'resources-table-cell-title ',
          count_task: 'resources-table-cell-count_task ',
        },
        headings: {logo: 'Логотип', title: 'Название', count_task: 'Количество контактов'},
        sortable: ['title'],
        texts: {
          filter: '',
          count: '',
          limit: '',
          noResults: 'По вашему запросу результатов не найдено',
          loading: 'Подождите, идет загрузка'
        },
        skin: 'table table-striped',
        sortIcon: {
          base: 'fa text-muted',
          up: 'fa-chevron-up',
          down: 'fa-chevron-down',
          is: 'fa-chevron-down'
        },
        customSorting: {
          title: this.changeSortAscending,
        },
      },
      droverType: '',
      activeCommunication: {},
    };
  },
  computed: {
    communications() {
      return this.$store.state.communications.communications;
    },
    pagination() {
      return this.$store.state.communications.pagination;
    },
    status() {
      return this.$store.state.communications.status;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if (prevStatus === 'deleting') {
          let title = this.activeCommunication.title
          this.$toasted.success(`Способ коммуникации «${title}» удалён`, {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: {
              text: '',
              class: 'btn-close',
              onClick: this.closeToast
            }
          });
          this.$store.dispatch('layout/toggleHelper', false);
          this.updateCommunications();
        } else if (prevStatus === 'creating') {
          this.$store.dispatch('layout/toggleHelper', false);
          this.updateCommunications();
        } else if (prevStatus === 'editing') {
          this.updateCommunications();
        }
      }

    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
  },
  created() {
    this.updateCommunications();
  },
  methods: {
    changeSortAscending(ascending) {
      if (ascending === this.sortAscending) return;
      this.sortAscending = ascending;
      this.updateCommunications();
      return () => {
        return true
      };
    },
    updateCommunications(page = this.currentPage) {
      this.$store.dispatch('communications/fetchCommunications', {
        'order[title]': this.sortAscending ? 'asc' : 'desc',
        page,
        perPage: this.perPage,
      });
    },
    createCommunication() {
      this.droverType = 'create';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openCommunication(e) {
      this.activeCommunication = e.row;
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    showDeleteModal() {
      this.$bvModal.show('delete_modal');
    },
    deleteCommunication() {
      this.$store.dispatch('communications/deleteCommunications', this.activeCommunication.id);
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
  }
}
</script>