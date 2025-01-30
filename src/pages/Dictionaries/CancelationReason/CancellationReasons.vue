<template>
  <div class="communications">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > Причины отказа
    </p>
    <div class="resources-header">
      <p class="resources-header-title">Причины отказа</p>
      <b-button v-if="userPermissions.admin.cancellationReason.edit"
                class="resources-header-add_resource"
                variant="outline-primary"
                @click="createReasonsGroup"
      >Добавить группу причин отказа</b-button>
    </div>
    <widget class="resources-table" customHeader>
      <v-client-table :data="reasonGroups" :columns="columns" :options="options" @row-click="openReasonsGroup">
        <div class="resources-table-values-title"
             slot="title"
             slot-scope="props"
        >{{ props.row.title }}</div>
        <div class="resources-table-values-task_type"
             slot="type"
             slot-scope="props"
        >{{ getTypesNames(props.row.type) }}</div>
        <div class="resources-table-values-credentials"
             slot="rejections"
             slot-scope="props"
        >{{ props.row.rejections ? props.row.rejections.length : 0 }}</div>
      </v-client-table>
    </widget>
    <helper contentClass="-paddingless">
      <reasons-group-details v-if="droverType"
                             :reasons-group="activeReasonGroup"
                             @delete="showDeleteModal"
                             @close="closeDrover"
      />
    </helper>
    <b-modal id="delete_modal"
             centered
             :title="`Удалить группу причин «${activeReasonGroup.title}»?`"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="deleteGroup"
    >Все причины, содержащиеся в группе, будут удалены</b-modal>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Helper from '@/components/Helper/Helper.vue';
import ReasonsGroupDetails from "./ReasonsGroupDetails";
import {closeToast} from "@/tools/tools";

export default {
  name: 'cancellation-reasons',
  components: {
    'widget': Widget,
    'helper': Helper,
    'reasons-group-details': ReasonsGroupDetails,
  },
  data() {
    return {
      sortAscending: false,
      columns: ['title', 'type', 'rejections'],
      currentPage: 1,
      perPage: 10,
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'resources-table-cell-title ',
          type: 'resources-table-cell-task_type ',
          rejections: 'resources-table-cell-count_task ',
        },
        headings: {title: 'Название', type: 'Типы задач', rejections: 'Количество причин'},
        sortable: [],
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
          is: 'fa-chevron-down',
        }
      },
      droverType: '',
      activeReasonGroup: {},
    }
  },
  computed: {
    reasonGroups() {
      return this.$store.state.cancellationReasons.reasonsGroups;
    },
    status() {
      return this.$store.state.cancellationReasons.status;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    taskTypes() {
      return this.$store.state.dictionaries.taskTypes;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if (prevStatus === 'deleting') {
          let title = this.activeReasonGroup.title
          this.$toasted.success(`Группа причин «${title}» удалена`, {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: {
              text: '',
              class: 'btn-close',
              onClick: closeToast
            }
          });
          this.$store.dispatch('layout/toggleHelper', false);
        } else if (prevStatus === 'creating') {
          this.updateReasonsGroups();
          this.$store.dispatch('layout/toggleHelper', false);
        }
      }
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') this.droverType = '';
    },
  },
  created() {
    this.updateReasonsGroups();
  },
  methods: {
    updateReasonsGroups() {
      this.$store.dispatch('cancellationReasons/fetchReasonsGroups');
    },
    getTypesNames(types) {
      if (!this.taskTypes[types[0]]) return '';
      return types.map(type => this.taskTypes[type]).join(', ');
    },
    createReasonsGroup() {
      this.activeReasonGroup = {};
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openReasonsGroup(e) {
      this.activeReasonGroup = e.row;
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
    showDeleteModal() {
      this.$bvModal.show('delete_modal');
    },
    deleteGroup() {
      this.$store.dispatch('cancellationReasons/deleteReasonsGroup', this.activeReasonGroup.id);
    },
  }
}
</script>