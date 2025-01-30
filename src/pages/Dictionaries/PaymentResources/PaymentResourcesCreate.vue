<template>
  <form class="resource_creation" @submit.prevent="createPaymentResource()">
    <div class="theme-helper-content-main-header">
      <b-button v-if="!paymentResourceData.id" type="submit" size="sm" variant="outline-primary">Добавить ресурс</b-button>
      <template v-else>
        <b-button class="mr-2" type="button" size="sm" variant="outline-primary" @click="closeModal">Сохранить</b-button>
        <b-button v-if="!paymentResourceData.code" type="button" size="sm" variant="outline-danger" @click="deletePaymentResource">Удалить ресурс</b-button>
      </template>
    </div>
    <div class="theme-helper-content-main-body resource_creation-body">
      <div class="resource_creation-body-main">
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Логотип</b>
          </div>
          <div class="col-7">
            <avatar-upload v-model="paymentResourceData.logo"
                           size="-lg"
                           class="ml-3"
                           context="resource"
                           altPlaceholder
                           useClipper
                           @change="editPaymentResource"
            />
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Название</b>
          </div>
          <div class="col-7">
            <input v-model="paymentResourceData.title"
                   class="input-plain -padding -editable_fields"
                   type="text"
                   placeholder="Введите название"
                   required
                   :disabled="!!paymentResourceData.code"
                   @blur="editPaymentResource"
            />
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-5 mb-3"><b>Страна</b></div>
          <div class="col-7 mb-3">
            <custom-select v-model="paymentResourceData.country"
                           :options="countries"
                           class="resource_creation-table-row_title-input d-inline-flex"
                           valueField="id"
                           titleField="title"
                           defaultText="Выберите страну"
                           id="vacancy_country_select"
                           :disabled="!!paymentResourceData.code"
                           @change="editPaymentResource"
            >
              <template v-slot:chosen-variant="props">
                <div v-if="props.value && props.value.settings" class="d-flex align-items-center">
                  <span class="flag-icon mr-1" :class="`flag-icon-${props.value.settings.flag || 'default'}`"></span>
                  <span>{{ props.value.title }}</span>
                </div>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <template v-slot:list-variant="props">
                <div class="d-flex align-items-center">
                  <span class="flag-icon mr-1" :class="`flag-icon-${props.variant.settings.flag || 'default'}`"></span>
                  <span>{{ props.variant.title }}</span>
                </div>
              </template>
            </custom-select>
          </div>
          <div class="col-5"><b>Тип ресурса</b></div>
          <div class="col-7">
            <custom-select v-model="paymentResourceData.template_payments_types_id"
                           :options="paymentTemplates"
                           class="resource_creation-table-row_title-input d-inline-flex"
                           valueField="id"
                           titleField="title"
                           required
                           defaultText="Выберите ресурс"
                           id="resource_select"
                           :disabled="!!paymentResourceData.code"
                           @change="editPaymentResource"
            >
            </custom-select>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload";
import Select from "@/components/Common/Select/Select";

export default {
  name: "PaymentResourcesCreate",
  components: {
    'custom-select': Select,
    'avatar-upload': AvatarUpload,
  },
  props: {
    activePaymentResource: Object,
  },
  data() {
    return {
      paymentResourceData: {
        title: '',
        logo: null,
        country: null,
        template_payments_types_id: null,
      },
      formStatus: {},
    };
  },
  computed: {
    directoryStatus() {
      return this.$store.state.directory.directoryStatus;
    },
    status() {
      return this.$store.state.paymentResource.status;
    },
    requestError() {
      return this.$store.state.directory.error;
    },
    paymentTemplates() {
      return this.$store.state.dictionaries.paymentTemplates;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    countries() {
      return this.$store.state.dictionaries.countries;
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchPaymentTemplates');
    if (this.activePaymentResource) {
      this.paymentResourceData = {
        ...this.activePaymentResource,
        logo: {
          id: this.activePaymentResource.logo ? this.activePaymentResource.logo.id : null,
          url: this.activePaymentResource.logo ? this.activePaymentResource.logo.link : null,
        },
        country: this.activePaymentResource.country ? this.activePaymentResource.country.id : null
      };
    }
  },
  methods: {
    createPaymentResource() {
      if (this.status === 'creating' || this.paymentResourceData.id) return;
      this.$store.dispatch('paymentResource/createPaymentResource', {
        ...this.paymentResourceData,
        logo: this.paymentResourceData.logo ? this.paymentResourceData.logo.id : null
      });
    },
    editPaymentResource() {
      if (!this.activePaymentResource) return;
      this.$store.dispatch('paymentResource/editPaymentResource', {
        ...this.paymentResourceData,
        logo: this.paymentResourceData.logo ? this.paymentResourceData.logo.id : null
      });
    },
    deletePaymentResource() {
      if (this.status === 'deleting') return;
      this.$store.dispatch('paymentResource/deletePaymentResource', this.activePaymentResource.id);
    },
    closeModal(){
      this.$store.dispatch('layout/toggleHelper', false);
    },
  }
}
</script>
