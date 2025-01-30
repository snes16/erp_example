<template>
  <div class="communications">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > {{ isReasonDictionary ? 'Причины' : '' }} {{ title }}
    </p>
    <div class="resources-header">
      <p class="resources-header-title">{{ isReasonDictionary ? 'Причины' : '' }} {{ title }}</p>
      <b-button v-if="editPermissions" class="resources-header-add_resource"
                variant="outline-primary" @click="openDetails">Добавить {{ isReasonDictionary ? 'причину' : '' }}
      </b-button>
    </div>
    <widget class="resources-table" customHeader>
      <div v-if="status === 'fetching'" class="resources-load">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else>
        <v-client-table :data="dictionaryList"
                        :columns="columns"
                        :options="options"
                        @row-click="openDetails"
        >
          <div class="resources-table-values-title d-flex align-items-center" slot="title" slot-scope="{row}">
            <span>{{ row.title }}</span>
            <headset v-if="row.role_type === 'operator'"/>
          </div>
          <div class="resources-table-values-credentials" slot="count" slot-scope="{row}"
          >{{ row.count || row.counter || row.count_workshifts || 0 }}</div>
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
      <dictionary-details v-if="droverType === 'details'"
                          :inputTitle="title"
                          :dictionaryElement="activeDictionaryElement"
                          :editPermissions="editPermissions"
                          :isReasonDictionary="isReasonDictionary"
                          :titleCount="titleCount"
                          :role-type-select="roleTypeSelect"
                          @delete="showDeleteModal"
                          @create="createDictionaryElement"
                          @edit="editElement"
      />
    </helper>
    <b-modal id="delete_modal"
             centered
             :title="`Вы уверены, что хотите удалить выбранную ${isReasonDictionary ? 'причину' : title.toLowerCase()}?`"
             body-bg-variant="white"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" @click="hideDeleteModal">Отменить</b-button>
        <button-throbber variant="danger" :loading="status === 'deleting'" @click="deleteDictionaryElement">Удалить
        </button-throbber>
      </template>
      {{ isReasonDictionary ? 'Причина' : title }} будет безвозвратно удалена
    </b-modal>
  </div>
</template>

<script>
import DictionaryDetails from "@/pages/Dictionaries/DefaultDictionary/DictionaryDetails";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
import Widget from "@/components/Widget/Widget";
import Helper from "@/components/Helper/Helper";
import throbber from "@/assets/vue-svg/throbber.svg";
import headset from "@/assets/vue-svg/headset.svg";
import { showToast } from "@/tools/tools";

export default {
  name: "DictionaryList",
  props: {
    title: String,
    editPermissions: Boolean,
    dictionaryList: Array,
    newDictionaryElement: {
      type: String,
      default: '',
    },
    status: String,
    pagination: Object,
    errorMessage: String,
    isReasonDictionary: {
      type: Boolean,
      default: false,
    },
    withTitleSort: {
      type: Boolean,
      default: false,
    },
    titleCount: {
      type: String,
      default: '',
    },
    roleTypeSelect: Boolean,
  },
  components: {
    DictionaryDetails,
    ButtonThrobber,
    'widget': Widget,
    'helper': Helper,
    'throbber': throbber,
    'headset': headset,
  },
  data() {
    return {
      activeDictionaryElement: {},
      sortBy: '',
      sortAscending: false,
      columns: ['title', 'count'],
      currentPage: 1,
      perPage: 10,
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'resources-table-cell-title ',
          count: 'resources-table-cell-count_task ',
        },
        headings: {title: 'Название', count: `Количество ${this.titleCount}`},
        texts: {
          noResults: 'По вашему запросу результатов не найдено',
          loading: 'Подождите, идет загрузка',
        },
        skin: 'table table-striped',
        filterable: false,
        sortable: this.withTitleSort ? ['title'] : [],
        sortIcon: {base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down'},
        customSorting: {title: this.sortReasons('title')},
      },
      droverType: '',
    }
  },
  computed: {
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    }
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
          case 'deleting':
            this.hideDeleteModal();
            this.$store.dispatch('layout/toggleHelper', false);
            this.updateDictionary();
            showToast(this.$toasted, `${this.isReasonDictionary ? 'Причина' : ''}  ${this.title} ${prevStatus === 'creating' ? 'создана' : 'удалена'}`);
            break;
          case 'editing': return this.updateDictionary();
        }
      } else if (newStatus === 'error') {
        showToast(this.$toasted, this.errorMessage, 'error');
      }
    },
    sortAscending: function () {
      this.updateDictionary();
    },
    sortBy: function () {
      this.updateDictionary();
    },
  },
  created() {
    this.updateDictionary();
  },
  methods: {
    openDetails(e) {
      this.activeDictionaryElement = e?.row || {};
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    updateDictionary() {
      let query = {page: this.currentPage, per_page: this.perPage}
      if (this.sortBy) query[`order[${this.sortBy}]`] = this.sortAscending ? 'asc' : 'desc';
      this.$emit('update', query);
    },
    deleteDictionaryElement() {
      if (this.status === 'deleting') return;
      this.$emit('delete', this.activeDictionaryElement.id);
    },
    createDictionaryElement(element) {
      if (this.status === 'creating') return;
      this.$emit('create', element);
    },
    showDeleteModal() {
      this.$bvModal.show('delete_modal');
    },
    hideDeleteModal() {
      this.$bvModal.hide('delete_modal');
    },
    sortReasons(field) {
      return (ascending) => {
        this.sortBy = field;
        this.sortAscending = ascending;
      };
    },
    editElement(element) {
      this.$emit('edit', {id: this.activeDictionaryElement.id, ...element});
    },
  }
}
</script>