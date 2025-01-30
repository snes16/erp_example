<template>
  <div class="payment_info">
    <div class="theme-helper-content-main-header d-flex">
      <button-throbber
          size="sm"
          variant="outline-primary"
          class="fine_reasons-details-buttons mr-2"
          colorThrobber="primary"
          :class="{ '-primary_borders' : isLoading }"
          :loading="isLoading"
          @click="editPaymentInfo"
      >{{!paymentInfo ? 'Добавить' : 'Применить'}}
      </button-throbber>
      <b-button v-if="paymentInfo && !isOperatorPersonal && !isModelPersonal" variant="outline-danger" class="fine_reasons-details-buttons" size="sm" @click="showDeleteModal">Удалить</b-button>
    </div>
    <div v-if="subheader" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>{{ subheader }}</span>
      </div>
    </div>
    <div>
      <div v-if="paymentInfo && !subheader" class="theme-helper-content-main-subheader">
        <div class="theme-helper-content-main-subheader-link" @click="clickBack">
          <i class="fa fa-angle-left"></i>
          <span>Платежные данные</span>
        </div>
      </div>
      <div class="payment_template-parameters-parameter_field-parameter p-0">
        <div class="payment_template-parameters-parameter_field-parameter-container pt-4 -disabled">
          <div v-if="!paymentInfo" class="payment_template-parameters-parameter_field-parameter-content_static border-0 pb-3">
            <div class="payment_info-body-block-bank-line-parameter -text">
              <b>Укажите способ платежа</b>
            </div>
            <custom-select v-model="changedInfo.template_id"
                           class="payment_info-body-block-bank-line-select"
                           :options="paymentTemplates"
                           value-field="id"
                           titleField="title"
                           default-text="Выберите тип"
                           @change="changeTemplate"
            />
          </div>
        </div>
      </div>
      <div v-for="(parameter, index) in activeTemplate.parameters"
           class="payment_template-parameters-parameter_field-parameter p-0" :key="parameter.serial_number">
        <div class="payment_template-parameters-parameter_field-parameter-container -disabled">
          <div class="payment_info-body-block-content_static border-0 pb-3"
          :class="parameter.type === 'text' ? '-offset' : ''">
            <div class="payment_template-parameters-parameter_field-parameter-value" :class="parameter.type === 'text' ? '-multi_line' : ''">
              <textarea-autosize-custom :value="parameter.title"
                                        rows="1"
                                        class="payment_info-body-block-bank-line-textarea-disabled pl-0"
                                        placeholder="Название"
                                        disabled
                                        :min-height="20"
                                        :class="{'-error': !!fieldErrors[parameter.code]}"
                                        @input="removeError(parameter.code)"
              />
            </div>
            <div v-if="parameter.type === 'choice'">
              <custom-select v-model="changedInfo.parameters[index].value"
                             :options="parameter.answers"
                             class="payment_info-body-block-bank-line-select"
                             :class="parameter.code === 'currency' ? '-currency' : ''"
                             required
                             :default-text="parameter.code === 'currency' ? 'Выберите валюту' : parameter.code ==='token_type' ? 'Выберите стандарт' : 'Выберите вариант'"
                             :error="!!fieldErrors[parameter.code]"
                             @change="removeError(parameter.code)"
              />
            </div>
            <div v-else-if="parameter.type === 'text'" class="payment_info-body-block-bank-right" >
              <card-number-input v-if="parameter.code === 'bank_number'"
                                 v-model="changedInfo.parameters[index].value"
                                 class="input-plain number ml-2 w-100"
                                 :class="{ '-error': !!fieldErrors[parameter.code] }"
                                 placeholder="0000 0000 0000 0000"
                                 @input="removeError(parameter.code)"
              />
              <card-expires-at-input v-else-if="parameter.code === 'bank_expired'"
                                     v-model="changedInfo.parameters[index].value"
                                     class="input-plain date ml-2 w-100"
                                     :class="{'-error': !!fieldErrors[parameter.code]}"
                                     placeholder="00 / 00"
                                     @input="removeError(parameter.code)"
              />
              <textarea-autosize-custom v-else
                                        v-model="changedInfo.parameters[index].value"
                                        rows="1"
                                        class="payment_info-body-block-bank-line-textarea input-plain"
                                        :placeholder="parameter.code === 'bank_holder' ? 'Укажите фамилию и имя' : 'Введите значение'"
                                        required
                                        :min-height="20"
                                        :class="{'-error': !!fieldErrors[parameter.code]}"
                                        @input="removeError(parameter.code)"
              />
            </div>
            <div class="payment_info-body-block-resource_select" v-else>
              <span v-if="paymentInfo" class="ml-2">{{ chosenPaymentResourceForEdit.title }}</span>
              <custom-select v-else
                             v-model="changedInfo.parameters[index].value"
                             class="payment_info-body-block-bank-line-select"
                             :options="types"
                             default-text="Выберите ресурс"
                             value-field="id"
                             :error="!!fieldErrors[parameter.code]"
                             @change="removeError(parameter.code)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal id="delete_resource"
             centered
             hide-header-close
             :no-close-on-backdrop="isRemovingLoading"
             :title="`Вы точно хотите удалить способ платежа «${paymentVariant}»?`"
             body-bg-variant="white"
             modal-class="payment_info-remove_modal"
             header-class="payment_info-remove_modal-header"
             body-class="payment_info-remove_modal-body"
             footer-class="payment_info-remove_modal-footer"
    >
      <template #modal-footer>
        <div class="m-0">
          <b-button variant="outline-primary" class="pl-4 pr-4" @click="$bvModal.hide('delete_resource')">Отменить</b-button>
          <b-button variant="danger" class="throbber-button button_remove" @click="deletePaymentInfo()">
            <div v-if="isRemovingLoading" class="throbber-button-block">
              <throbber class="throbber -button -button-white -button-larger"/>
            </div>
            <span :class="{ 'text-inherit': isRemovingLoading }">Удалить</span>
          </b-button>
        </div>
      </template>
      <span> Данные нельзя будет восстановить после удаления.</span>
    </b-modal>
    </div>
</template>

<script>
import CustomSelect from "@/components/Common/Select/Select.vue";
import CardNumberInput from "@/components/Common/MaskedInputs/CardNumberInput.vue";
import CardExpiresAtInput from "@/components/Common/MaskedInputs/CardExpiresAtInput.vue";
import TextareaAutosizeCustom from '@/components/Common/TextareaAutosize';
import pen from "@/assets/vue-svg/pen.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";

export default {
  name: 'add-payment-type',
  props: {
    userId: Number,
    paymentInfo: Object,
    subheader: String,
    isFirstInfo: Boolean,
  },
  components: {
    ButtonThrobber,
    CustomSelect,
    CardNumberInput,
    CardExpiresAtInput,
    TextareaAutosizeCustom,
    throbber,
    pen,
  },
  data() {
    return {
      changedInfo: {parameters: [{}]},
      activeTemplate: {},
      paymentType: null,
      fieldErrors: {},
    }
  },
  computed: {
    paymentTemplates() {
      return this.$store.state.dictionaries.paymentTemplates;
    },
    isModelPersonal(){
      return this.$store.state.auth.user.role.code === 'ROLE_MODEL';
    },
    isOperatorPersonal() {
      return this.$store.state.auth.user.role.code === 'ROLE_OPERATOR';
    },
    types() {
      return this.paymentResources.filter(resource => (resource.template_payments_types_id === this.activeTemplate.id));
    },
    paymentResources() {
      return this.$store.state.dictionaries.paymentResources;
    },
    paymentVariant() {
      return (this.paymentInfo?.paymentResource?.title || this.activeTemplate?.title);
    },
    status() {
      return this.$store.state.profile.status;
    },
    paymentStatus() {
      return this.$store.state.profile.paymentStatus;
    },
    isLoading() {
      return this.paymentStatus === ('creating-payment-info' || 'editing-payment-info');
    },
    isRemovingLoading() {
      return this.paymentStatus === 'deleting-payment-info';
    },
    chosenPaymentResourceForEdit() {
      if (!this.paymentInfo || !this.paymentResources.length) return {};
      return this.paymentResources.find(resource => resource.id.toString() === this.paymentInfo.parameters[0]?.value) || {};
    },
  },
  watch: {
    paymentStatus: function ( newStatus, prevStatus ) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'deleting-payment-info':
            this.$bvModal.hide('delete_resource');
            break;
        }
      }
    },
  },
  created() {
    if (!this.paymentInfo) return
    this.activeTemplate = this.paymentInfo;
    this.changedInfo = {
      id: this.paymentInfo.id,
      parameters: this.paymentInfo.parameters?.map((parameter) => ({
        ...parameter,
      })),
    };
  },
  methods: {
    editPaymentInfo() {
      if (!this.changedInfo.parameters) return;
      // this.changedInfo.parameters[0].value = this.changedInfo.parameters[0].value?.id;
      if (this.validateForm()) return;
      const params = {
        userId: this.userId,
        data: {
          ...this.changedInfo,
          is_main: this.isFirstInfo,
        },
      };
      if (this.validateForm()) return;
      this.paymentInfo ?
          this.$store.dispatch('profile/editPaymentInfo', params) :
          this.$store.dispatch('profile/createPaymentInfo', params);
    },

    validateForm() {
      if (!this.activeTemplate?.parameters?.length) return true;
      let errors = {...this.fieldErrors};
      this.changedInfo.parameters.forEach((parameter, key) => {
        if (!parameter.value)
          errors[this.activeTemplate.parameters[key].code] = "Ошибка";
      });
      this.fieldErrors = errors;
      return Object.values(errors).some(error => error);
    },
    showDeleteModal () {
      this.$bvModal.show('delete_resource');
    },
    removeError(field) {
      this.fieldErrors = {
        ...this.fieldErrors,
        [field]: false,
      };
    },
    clickBack () {
      this.$emit('back');
    },
    deletePaymentInfo() {
      this.$store.dispatch('profile/deletePaymentInfo', {id: this.paymentInfo?.id, userId: this.userId});
    },
    changeTemplate() {
      this.fieldErrors = {};
      this.activeTemplate = this.paymentTemplates.find(template => template.id === this.changedInfo.template_id);
      this.changedInfo = {
          ...this.changedInfo,
          parameters: this.activeTemplate?.parameters?.map((parameter, index) => ({
            template_parameter_id: parameter.id,
            value: '',
            serial_number: index,
          })),
        };
    },
  },
}
</script>