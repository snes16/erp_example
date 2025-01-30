<template>
  <add-payment-type v-if="droverType === 'editing'"
                    :user-id="userId"
                    :payment-info="activePaymentInfo"
                    :is-first-info="!formattedPaymentInfo.length"
                    @back="hideNestedDrover"
  />
  <div v-else class="payment_info">
    <div v-if="!isUserDetails" class="theme-helper-content-main-header">
        <b-button class="fine_reasons-details-buttons" variant="outline-primary" size="sm" @click="closeDrover">Сохранить</b-button>
    </div>
    <div v-if="subheader && !isUserDetails" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="closeDrover">
        <i class="fa fa-angle-left"></i>
        <span>{{ subheader }}</span>
      </div>
    </div>
    <div :class="!isUserDetails ? 'theme-helper-content-main-body' : ''">
      <div v-if="!isUserDetails" class="payment_info-header">
        <h4 class="mb-3">Платежные данные</h4>
        <div class="d-inline-flex cursor-pointer"
             @click="openAddType">
          <p class="payment_info-text-blue"> Добавить способ платежа</p>
          <div class="btn-add vacancy_creation-responses-title-response-add"/>
        </div>
      </div>
      <div v-for="template in formattedPaymentInfo" class="payment_info-body-block-bank mb-3" :key="template.id">
        <div class="payment_info-body-block-bank-line">
          <div v-if="template.paymentResource" class="d-flex align-items-center mb-3">
            <div class="avatar -alt -xs mr-2"
                 :style="template.paymentResource.logo && template.paymentResource.logo.preview_link ? `background-image: url(${template.paymentResource.logo.preview_link}); background-size: cover;` : ''">
            </div>
            <div>
              <b>{{template.paymentResource.title}}</b>
              <p v-if="template.subtitle" class="payment_info-text-gray mb-0">{{ template.subtitle }}</p>
            </div>
          </div>
          <div v-if="paymentInfoEditPermission" class="d-inline-flex align-items-center cursor-pointer payment_info-text-blue" @click="openEditType(template)">
            <span>Изменить</span>
            <pen class="payment_info-icons-pen ml-2"/>
          </div>
        </div>
        <div class="payment_info-body-block">
        <div v-for="parameter in template.parameters"
             v-if="!(parameter.code === 'payment_resource' || parameter.code === 'currency')"
             class="mb-2_5 d-inline-flex"
             :key="parameter.serial_number"
        >
          <div v-if="parameter.code === 'bank_number'"
               class="payment_info-body-block-bank-line-card_number d-inline-flex flex-column col-12 mr-3 ml-4 mr-4 p-0"
          >
            <span class="payment_info-text-gray">Номер карты</span>
            <div class="d-inline-flex align-items-center">
              <card-number :number="parameter.value"
                           class="payment_info-body-block-bank-line-input col-12"
              />
            </div>
          </div>
          <div v-else-if="parameter.code === 'bank_expired'" class="payment_info-body-block-bank-line-card_expires_at d-inline-flex flex-column ml-4">
            <span class="payment_info-text-gray ml-4">Срок действия</span>
            <div class="d-inline-flex align-items-center">
              <card-expires-at :date="parameter.value"
                               class="payment_info-body-block-bank-line-input number col-12"
              />
            </div>
          </div>
          <div v-else-if="parameter.code === 'crypto_address'"
               class="payment_info-body-block-bank-line-card_number d-inline-flex flex-column col-12 mr-3 ml-4 mr-4 p-0">
            <span class="payment_info-text-gray">{{ parameter.title }}</span>
            <div class="d-inline-flex align-items-center">
              <crypto-address :address="parameter.value"
                              class="payment_info-body-block-bank-line-input col-12"
              />
            </div>
          </div>
          <div v-else-if="parameter.code === 'token_type'" class="payment_info-body-block-bank-line-card_expires_at d-inline-flex flex-column ml-4">
            <span class="payment_info-text-gray ml-4">{{ parameter.title }}</span>
            <div class="d-inline-flex align-items-center">
              <div class="payment_info-body-block-bank-line-input number col-12 hidden_data -card_expires_at">
                <span>{{ parameter.value }}</span>
                <div class="password_field-toggle">
                  <copy class="workshift_details-body-main-services-service-block-copy-icon ml-2_5" @click="copyToClipboard(parameter.value)"/>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="payment_info-body-block-bank-line-data pl-4 pr-4">
            <span class="payment_info-text-gray">{{ parameter.title }}</span>
            <div class="payment_info-body-block-bank-line-input holder -wide pl-3">
              <span>{{ parameter.value }}</span>
              <copy class="workshift_details-body-main-services-service-block-copy-icon" @click="copyToClipboard(parameter.value)"/>
            </div>
          </div>
        </div>
        </div>
        <div v-if="formattedPaymentInfo.length > 1" class="abc-radio payment_info-body-block-bank-line-radio ml-2 mt-3">
            <input name="input-radio"
                   type="radio"
                   :id="`template-${template.id}`"
                   :checked="template.is_main"
                   :disabled="!paymentInfoEditPermission"
                   @change="setMainType(template)"
            />
            <label class="payment_info-main_type d-inline-flex mb-4" :for="`template-${template.id}`">
              <span class="payment_info-text-main_type">Основной способ платежа</span>
            </label>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomSelect from "@/components/Common/Select/Select.vue";
import CardNumberInput from "@/components/Common/MaskedInputs/CardNumberInput.vue";
import CardExpiresAtInput from "@/components/Common/MaskedInputs/CardExpiresAtInput.vue";
import AddPaymentType from "@/pages/Profile/components/AddPaymentType.vue";
import pen from "@/assets/vue-svg/pen.svg";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import CryptoAddress from "@/components/Common/HiddenData/CryptoAddress.vue"
import CardNumber from "@/components/Common/HiddenData/CardNumber.vue";
import CardExpiresAt from "@/components/Common/HiddenData/CardExpiresAt.vue";
import {clipboard, showToast} from "@/tools/tools.js";
import copy from "@/assets/vue-svg/copy-transparent.svg";

export default {
  name: 'payment-info',
  props: {
    userId: Number,
    subheader: String,
    userType: String,
    isUserDetails: Boolean,
    paymentInfo: Array,
    userPermissions: Object,
    isMyProfile: Boolean,
  },
  components: {
    Avatar,
    'add-payment-type': AddPaymentType,
    pen,
    CustomSelect,
    CryptoAddress,
    CardNumber,
    CardExpiresAt,
    CardNumberInput,
    CardExpiresAtInput,
    copy,
  },
  data() {
    return {
      activePaymentInfo: null,
      droverType: '',
    }
  },
  computed: {
    paymentResources() {
      return this.$store.state.dictionaries.paymentResources;
    },
    paymentInfoEditPermission() {
      return this.isMyProfile ? (this.userPermissions[this.userType].personal.payment_information.edit || this.userPermissions.operator.personal.view || this.userPermissions.model.personal.view) :
          this.userPermissions[this.userType].profile.payment.information.edit;
    },
    formattedPaymentInfo() {
      return this.paymentInfo?.map((template) => {
        const currency = template.parameters?.find(parameter => parameter.code === 'currency')?.value;
        const isBank = template.parameters?.some(parameter => parameter.code === 'bank_number');
        return {
          ...template,
          paymentResource: this.paymentResources?.find((resource) => (
              template.parameters.find((param) => param.code === 'payment_resource')?.value === resource.id.toString()
          )) || {},
          subtitle: currency ? `${isBank ? 'Счет' : 'Получение'} в ${currency}` : '',
        };
      }) || [];
    },
    paymentStatus() {
      return this.$store.state.profile.paymentStatus;
    },
  },
  created() {
    if (this.isUserDetails) {
      this.$store.dispatch('dictionaries/fetchPaymentResources');
    }
    this.$store.dispatch('dictionaries/fetchPaymentTemplates');
  },
  watch: {
      'paymentInfo': {
        deep: true,
        handler(newTemplates, oldTemplates) {
          newTemplates?.forEach(newTemplate => {
            const oldTemplate = oldTemplates?.find(template => template.id === newTemplate.id);
            if (oldTemplate && newTemplate.is_main !== oldTemplate.is_main) {
              const params =
                  {
                    userId: this.userId,
                    data: newTemplate
                  };
              this.$store.dispatch('profile/editPaymentInfo', params);
            }
          });
        }
      },
    paymentStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'editing-payment-info':
            if (this.isUserDetails) return;
            this.hideNestedDrover();
            showToast(this.$toasted, 'Изменения сохранены');
            break;
          case 'creating-payment-info':
            this.hideNestedDrover();
            showToast(this.$toasted, 'Способ платежа добавлен');
            break;
          case 'deleting-payment-info':
            this.hideNestedDrover();
            showToast(this.$toasted, 'Способ платежа удален');
            break;
        }
      }
      if (newStatus === 'error') {
        switch (prevStatus) {
          case 'editing-payment-info':
            showToast(this.$toasted, 'Изменения не сохранены', 'error');
            break;
          case 'creating-payment-info':
            showToast(this.$toasted, 'Платёжные данные не добавлены. Пожалуйста, попробуйте еще раз', 'error');
            break;
          case 'deleting-payment-info':
            showToast(this.$toasted, 'Не удалось удалить способ платежа. Пожалуйста, попробуйте еще раз', 'error');
            break;
        }
      }
    }
  },
  methods: {
    copyToClipboard(text) {
      clipboard(text, this.copyToClipboardSuccess);
    },
    copyToClipboardSuccess() {
      showToast(this.$toasted, 'Данные скопированны');
    },
    openEditType(template) {
      this.activePaymentInfo = template;
      this.isUserDetails ? this.$emit('add', template) : this.droverType = 'editing';
    },
    openAddType() {
      this.droverType = 'editing';
    },
    hideNestedDrover() {
      this.droverType = '';
      this.activePaymentInfo = null;
    },
    setMainType(template) {
      const params = {
        userId: this.userId,
        data: {...template, is_main: true}
      };
      this.$store.dispatch('profile/editPaymentInfo', params);
    },
    closeDrover() {
      this.$emit('close');
    },
  },
}
</script>