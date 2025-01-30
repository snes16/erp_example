<template>
  <div class="communications">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/catalog">Справочники</router-link>
      > Справочник платёжных ресурсов
    </p>
    <div class="resources-header">
      <p class="resources-header-title">Справочник платёжных ресурсов</p>
      <b-button v-if="userPermissions.admin.paymentResource.edit"
                class="resources-header-add_resource"
                variant="outline-primary"
                @click="createPaymentResource"
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
      <div v-if="status === 'fetching'" class="resources-load">
        <throbber class="throbber -sm"/>
        <span class="resources-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <div v-else>
        <v-client-table :data="paymentResources"
                        :columns="columns"
                        :options="options"
                        @row-click="openPaymentResources"
        >
          <div class="avatar -xs -alt"
               slot="logo"
               slot-scope="props"
               :style="props.row.logo ? 'background-image: url(' + props.row.logo.preview_link + '); background-size: cover;' : ''"
          ></div>

          <div v-if="props.row.country" class="vacancies-table-container-cell-content" slot="country" slot-scope="props">
            <div class="d-flex align-items-center">
            <span class="flag-icon mr-2" :class="`flag-icon-${props.row.country.flag || 'default'}`"
                  :title="props.row.country.country"></span>
              <span>{{ props.row.country.country }}</span>
            </div>
          </div>

        </v-client-table>
        <div class="resources-table-footer">
          <b-pagination class="resources-table-footer-pagination" align="left" v-model="currentPage"
                        :total-rows="pagination.totalItems" :per-page="perPage"/>
        </div>
      </div>
    </widget>
    <helper contentClass="-paddingless">
        <payment-resources-create v-if="droverType === 'create'" :active-payment-resource="activePaymentResource"/>
    </helper>
    <b-modal id="delete_modal"
             centered
             body-bg-variant="white"
    >
    </b-modal>
  </div>
</template>

<script>
import Widget from "@/components/Widget/Widget";
import Helper from "@/components/Helper/Helper";
import throbber from "@/assets/vue-svg/throbber.svg";
import PaymentResourcesCreate from "@/pages/Dictionaries/PaymentResources/PaymentResourcesCreate.vue";

export default {
  name: 'paymentResources',
  components: {
    'widget': Widget,
    'helper': Helper,
    'throbber': throbber,
    'payment-resources-create': PaymentResourcesCreate
  },
  data() {
    return {
      sortBy: '',
      sortAscending: false,
      activePaymentResource: null,
      columns: ['logo','title', 'country'],
      currentPage: 1,
      perPage: 10,
      options: {
        initialPage: 1,
        columnsClasses: {
          title: 'paymentResources-table-title',
          logo: 'paymentResources-table-logo',
          country: 'paymentResources-table-country',
        },
        headings: {logo:'Логотип', title: 'Название', country: 'Страна'},
        texts: {
          noResults: 'Здесь пока ничего нет. Добавьте первый ресурс',
          loading: 'Подождите, идет загрузка'
        },
        skin: 'table table-striped',
        filterable: false,
        sortable: [],
        sortIcon: { base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down' },
        customSorting: { title: this.sortReasons('title') }
      },
      activeTab: 'bank_card',
      tabs: [{value: 'bank_card', title: 'Банковская карта'},
        {value: 'cash', title: 'Наличные'},
        {value: 'cryptocurrency', title: 'Криптовалюта'},
        {value: 'other', title: 'Другие способы платежа'}],
      filters: {},
      droverType: '',
    }
  },
  computed: {
    paymentResources() {
      return this.$store.state.paymentResource.paymentResources;
    },
    status() {
      return this.$store.state.paymentResource.status;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    pagination() {
      return this.$store.state.paymentResource.paymentResourcesPagination;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    errorMessage() {
      return this.$store.state.paymentResource.errorMessage;
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
            this.$store.dispatch('layout/toggleHelper', false);
            this.updateDictionary();
            this.showNotification('success', `Ресурс создан`);
            break;
          case 'deleting':
            this.$store.dispatch('layout/toggleHelper', false);
            this.updateDictionary();
            this.showNotification('success', `Ресурс удалён`);
            break;
          case 'editing':
            this.updateDictionary();
        }
      } else if (newStatus === 'error') {
        this.showNotification('error', this.errorMessage);
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
    openPaymentResources(e) {
      if(!this.userPermissions.admin.paymentResource.edit) return;
      this.activePaymentResource = e.row;
      this.droverType = 'create';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    updateDictionary() {
      let query = { type: this.activeTab, page: this.currentPage, per_page: this.perPage };
      if (this.sortBy) query[`order[${this.sortBy}]`] = this.sortAscending ? 'asc' : 'desc';
      this.$store.dispatch('paymentResource/fetchPaymentResources', query);
    },
    setActiveTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      if (this.currentPage === 1) this.updateDictionary()
      else this.currentPage = 1;
    },
    createPaymentResource() {
      this.activePaymentResource = null;
      this.droverType = 'create';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    showDeleteModal() {
      this.$bvModal.show('delete_modal');
    },
    sortReasons(field) {
      return (ascending) => {
        this.sortBy = field;
        this.sortAscending = ascending;
      }
    },
    showNotification(type, message) {
      this.$toasted[type](message, {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 2500,
        action: [
          {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        ]
      });
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
  }
}
</script>
