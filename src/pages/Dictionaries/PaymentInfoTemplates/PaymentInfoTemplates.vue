<template>
  <div class="resource_guide">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link payment_template-text-breadcrumbs" to="/app/templates">Шаблоны</router-link>
      <span class="payment_template-text-breadcrumbs ml-1">> Шаблоны платёжных данных</span>
    </p>
    <div class="resources-header mb-3">
      <span class="group_parameters-header-title mt-2"><h3>Шаблоны платёжных данных</h3></span>
      <b-button v-if="editPermission" variant="outline-primary"
                class="pb-2 pt-2 pl-4 pr-4"
                @click="createTemplate">
        Добавить новый шаблон
      </b-button>
    </div>
    <div class="resource_guide-tab_field">
      <div class="resource_guide-tab_field-tab">
        <b class="resource_guide-tab_field-tab-title">СПОСОБ ПЛАТЕЖА</b>
      </div>
      <div v-for="template in paymentInfoTemplates" class="payment_template-tab" :key="template.id" @click="showTemplateDetails(template)">
        <p class="resource_guide-tab_field-tab-title payment_template-text-type">{{ template.title }}</p>
        <trash v-if="!template.read_only && editPermission"
            class="payment_template-tab-trash_icon"
            @click.stop="deleteTemplateModal(template)"
        />
      </div>
    </div>
    <b-modal id="delete_modal"
             centered
             hide-header-close
             :title="deleteWarning"
             body-bg-variant="white"
             header-class="payment_template-delete_modal-header"
             body-class="payment_template-delete_modal-body"
             footer-class="payment_template-delete_modal-footer"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" class="m-0 pl-4 pr-4" @click="$bvModal.hide('delete_modal')">Отменить</b-button>
        <b-button variant="danger" class="throbber-button group_settings-error-button mt-0 mb-0 mr-0" @click="deleteTemplate">
          <div v-if="isRemovingLoading" class="throbber-button-block">
            <throbber class="throbber -button -button-white -button-larger"/>
          </div>
          <span :class="{ 'text-inherit': isRemovingLoading }">Удалить</span>
        </b-button>
      </template>
      <span class="group_settings-error-text">Шаблон нельзя будет восстановить. При необходимости его придется создавать заново.</span>
    </b-modal>
    <helper contentClass="-paddingless">
      <payment-info-template-details v-if="droverType === 'editing'"
                                     :template="activeTemplate"/>
    </helper>
  </div>
</template>

<script>
import Helper from "@/components/Helper/Helper";
import PaymentInfoTemplateDetails from "./PaymentInfoTemplateDetails";
import {showToast} from "@/tools/tools";
import trash from "@/assets/vue-svg/trash.svg"
import throbber from "@/assets/vue-svg/throbber.svg";
export default {
  name: 'payment_info_templates',
  components: {
    throbber,
    Helper,
    PaymentInfoTemplateDetails,
    trash
  },
  data() {
    return {
      activeTemplate: {},
      droverType: '',
    };
  },
  computed: {
    paymentInfoTemplates() {
      return this.$store.state.paymentInfoTemplates.paymentInfoTemplates;
    },
    status() {
      return this.$store.state.paymentInfoTemplates.status;
    },
    deleteStatus() {
      return this.$store.state.paymentInfoTemplates.deleteStatus;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    isRemovingLoading() {
      return this.deleteStatus === 'deleting';
    },
    deleteWarning() {
      if(this.activeTemplate?.title)
        return `Вы точно хотите удалить шаблон «${this.activeTemplate.title}»?`;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.admin.paymentResource.edit;
    }
  },
  watch: {
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.activeTemplate = null;
        this.droverType = '';
      }
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'editing':
            showToast(this.$toasted, 'Шаблон изменен');
            this.$store.dispatch('layout/toggleHelper', false);
            break;
          case 'creating':
            showToast(this.$toasted, 'Шаблон добавлен');
            this.$store.dispatch('layout/toggleHelper', false);
            break;
        }
      }
    },
    deleteStatus: function (newStatus, prevStatus) {
      if (prevStatus === 'deleting' && newStatus === '') {
        showToast(this.$toasted, 'Шаблон удален');
        this.$store.dispatch('paymentInfoTemplates/fetchPaymentTemplates');
        this.$bvModal.hide('delete_modal');
      }
    }
  },
  created() {
    this.$store.dispatch('paymentInfoTemplates/fetchPaymentTemplates');
  },
  methods: {
    createTemplate() {
      this.activeTemplate = null;
      this.$store.dispatch('layout/toggleHelper', true);
      this.droverType = "editing";
    },
    deleteTemplateModal(template) {
      this.activeTemplate = template;
      this.$bvModal.show('delete_modal');
    },
    deleteTemplate() {
      this.$store.dispatch('paymentInfoTemplates/deleteTemplate', this.activeTemplate.id);
    },
    showTemplateDetails(template) {
      this.activeTemplate = template;
      this.$store.dispatch('layout/toggleHelper', true);
      this.droverType = "editing";
    },
  },
}
</script>