<template>
  <div class="communications">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > Справочник должностей
    </p>
    <div class="resources-header">
      <p class="resources-header-title">Справочник должностей</p>
      <b-button v-if="editPermissions"
                class="resources-header-add_resource"
                variant="outline-primary"
                @click="showDrover('creation')"
      >Добавить должность</b-button>
    </div>
    <widget class="resources-table" customHeader>
      <div v-if="status === 'fetching'" class="resources-load">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else>
        <v-client-table :data="positions"
                        :columns="columns"
                        :options="options"
                        @row-click="openDetails"
        >
          <div class="resources-table-values-title"
               slot="title"
               slot-scope="props"
          >{{ props.row.title }}</div>
          <div class="resources-table-values-credentials"
               slot="count"
               slot-scope="props"
          >{{ props.row.count || props.row.counter || props.row.count_workshifts || 0 }}</div>
        </v-client-table>
        <div class="resources-table-footer">
          <b-pagination v-model="currentPage"
                        class="resources-table-footer-pagination"
                        align="left"
                        :total-rows="pagination.totalItems"
                        :per-page="perPage"
          />
        </div>
      </div>
    </widget>
    <helper contentClass="-paddingless">
      <position-creation v-if="droverType === 'creation'" />
      <position-details v-if="droverType === 'details'"
                        :position="activePosition"
                        @close="showDrover('')"
                        @delete="showDeleteModal"
                        @add-users="showDrover('add-users')"
      />
      <position-creation v-if="droverType === 'add-users'"
                         :position="activePosition"
                         @back="showDrover('details')"
      />
    </helper>
    <b-modal
        id="delete_position_modal"
        centered
        :title="`Вы уверены, что хотите удалить должность “${activePosition.title}”?`"
        body-bg-variant="white"
        ok-title="Удалить"
        ok-variant="danger"
        cancel-title="Отменить"
        cancel-variant="outline-primary"
        @ok="deleteActivePosition"
    >Должность будет безвозвратно удалена</b-modal>
  </div>
</template>

<script>
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
import Widget from "@/components/Widget/Widget";
import Helper from "@/components/Helper/Helper";
import PositionCreation from "@/pages/Dictionaries/Positions/PositionCreation";
import PositionDetails from "@/pages/Dictionaries/Positions/PositionDetails.vue";
import throbber from "@/assets/vue-svg/throbber.svg";
import { showToast } from "@/tools/tools";

export default {
  name: "Positions",
  components: {
    ButtonThrobber,
    'widget': Widget,
    'throbber': throbber,
    Helper,
    PositionCreation,
    PositionDetails,
  },
  data() {
    return {
      columns: ['title', 'users_number'],
      currentPage: 1,
      perPage: 10,
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'resources-table-cell-title ',
          users_number: 'resources-table-cell-count_task ',
        },
        headings: {title: 'Название', users_number: 'Количество сотрудников'},
        texts: {
          noResults: 'По вашему запросу результатов не найдено',
          loading: 'Подождите, идет загрузка',
        },
        skin: 'table table-striped',
        filterable: false,
        sortable: [],
      },
      droverType: '',
      activePosition: {},
    }
  },
  computed: {
    pagination() {
      return this.$store.state.positions.positionsPagination;
    },
    positions() {
      return this.$store.state.positions.positions;
    },
    status() {
      return this.$store.state.positions.status;
    },
    editPermissions() {
      return this.$store.state.auth.userPermissions.admin.position.edit;
    },
    errorMessage() {
      return this.$store.state.positions.errorMessage;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    position() {
      return this.$store.state.positions.position;
    },
  },
  watch: {
    currentPage: function () {
      this.updateDictionary();
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'creating':
            this.showDrover('');
            this.updateDictionary();
            showToast(this.$toasted, `Должность “${this.position.title}” добавлена`);
            break;
          case 'deleting':
            this.updateDictionary();
            showToast(this.$toasted, `Должность “${this.activePosition.title}” удалена`);
            break;
          case 'deleting-users':
            this.$nextTick(() => this.updateDictionary());
            break;
          case 'adding-users':
            this.updateDictionary();
            this.showDrover('details');
        }
      } else if (newStatus === 'error') {
        showToast(this.$toasted, this.errorMessage, 'error');
      }
    },
  },
  created() {
    this.updateDictionary();
    this.$store.dispatch('groups/getGroups');
    this.$store.dispatch('dictionaries/fetchRoles');
  },
  methods: {
    updateDictionary() {
      let query = {page: this.currentPage, per_page: this.perPage}
      this.$store.dispatch('positions/fetchPositions', query);
    },
    showDrover(type) {
      this.$store.dispatch('layout/toggleHelper', !!type);
      this.droverType = type;
    },
    openDetails({row}) {
      this.activePosition = row;
      this.showDrover('details');
    },
    showDeleteModal() {
      this.showDrover('');
      this.$bvModal.show('delete_position_modal');
    },
    deleteActivePosition() {
      this.$store.dispatch('positions/deletePosition', this.activePosition.id);
    },
  }
}
</script>