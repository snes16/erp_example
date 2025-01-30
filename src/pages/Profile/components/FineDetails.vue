<template>
  <div class="add_groups">
    <div class="theme-helper-content-main-header">
      <button-throbber v-if="!(fineInfo && fineInfo.canceled_at)"
          size="sm"
          variant="outline-primary"
          class="fine_details-button mr-2"
          colorThrobber="primary"
          :class="{ '-primary_borders': isEditingLoading}"
          :loading="isEditingLoading"
          @click="choseAction"
      >{{ fineInfo ? 'Сохранить' : 'Назначить штраф' }}
      </button-throbber>
      <b-button v-if="fineInfo && !fineInfo.canceled_at" variant="outline-danger" class="fine_details-button" size="sm"
                @click="showDeleteModal">Отменить штраф
      </b-button>
    </div>
    <div v-if="subheader" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>{{ subheader }}</span>
      </div>
    </div>
    <div class="fine_details-parameters">
      <div class="fine_details-parameters-row">
        <div class="fine_details-parameters-row-title">
          <span class="widget_fine-text-titles">Дата назначения штрафа</span>
        </div>
        <div class="d-inline-flex">
          <calendar_icon v-if="!fineInfo"
              class="fine_details-parameters-row-date-icon"
              :class="{ '-error' : fieldErrors.date}"
          />
          <date-picker v-model="changedInfo.date"
                       class="datepicker-plain fine_details-parameters-row-date"
                       lang="ru"
                       format="DD.MM.YYYY"
                       :class="{ '-error' : fieldErrors.date, '-without_calendar': fineInfo }"
                       :disabled="fineInfo"
                       @input="removeError('date')"
          ><i slot="calendar-icon"/>
          </date-picker>
        </div>
      </div>
      <div class="fine_details-parameters-row">
        <div class="fine_details-parameters-row-title">
          <span class="widget_fine-text-titles">Причина штрафа</span>
        </div>
        <custom-select v-model="changedInfo.reason"
                       class="fine_details-parameters-row-reason"
                       :class="{ '-error' : fieldErrors.reason}"
                       :options="finesReasons"
                       :disabled="fineInfo"
                       default-text="Выберите причину"
                       value-field="id"
                       @input="removeError('reason')"
        />
      </div>
      <div v-if="activeFine && activeFine.id" class="fine_details-parameters-row">
        <div class="fine_details-parameters-row-title">
          <span class="widget_fine-text-titles">Размер штрафа</span>
        </div>
        <div class="fine_details-parameters-row-type">
          <input v-model="changedInfo.amount"
                 class="input-plain fine_details-parameters-row-type-input mr-2"
                 type="number"
                 placeholder="0"
                 :class="{'-error' : fieldErrors.amount}"
                 :disabled="fineInfo && fineInfo.canceled_at"
                 @input="validateAmount"
          />
        </div>
      </div>
      <div class="fine_details-parameters-row">
        <div class="fine_details-parameters-row-title">
          <span class="widget_fine-text-titles">Комментарий</span>
        </div>
      </div>
      <textarea-autosize-custom v-model="changedInfo.details"
                                rows="1"
                                maxlength="255"
                                placeholder="Укажите комментарий к штрафу"
                                required
                                class="input-plain fine_details-parameters-comment"
                                :disabled="fineInfo && fineInfo.canceled_at"
                                :class="{ '-error' : fieldErrors.details}"
                                :min-height="24"
                                @input="removeError('details')"
      />
    </div>
    <b-modal id="remove_fine"
             centered
             hide-header-close
             :no-close-on-backdrop="isCancelLoading"
             title="Вы точно хотите отменить штраф?"
             body-bg-variant="white"
             modal-class="widget_fine-approve_modal"
             header-class="widget_fine-approve_modal-header"
             body-class="widget_fine-approve_modal-body"
             footer-class="widget_fine-approve_modal-footer"
    >
      <template #modal-footer>
        <div class="m-0">
          <b-button variant="outline-primary" class="fine_details-cancel_button" @click="$bvModal.hide('remove_fine')">Назад</b-button>
          <b-button variant="danger" class="throbber-button button_remove" @click="cancelFine">
            <div v-if="isCancelLoading" class="throbber-button-block">
              <throbber class="throbber -button -button-white -button-larger"/>
            </div>
            <span :class="{ 'text-inherit': isCancelLoading }">Отменить штраф</span>
          </b-button>
        </div>
      </template>
      <span> Штраф останется в списке штрафов у сотрудника с маркировкой «отменён»</span>
    </b-modal>
    <b-modal id="approve_fine"
             centered
             hide-header-close
             :no-close-on-backdrop="isCancelLoading"
             title="Вы точно хотите назначить штраф?"
             body-bg-variant="white"
             modal-class="widget_fine-approve_modal"
             header-class="widget_fine-approve_modal-header"
             body-class="widget_fine-approve_modal-body"
             footer-class="widget_fine-approve_modal-footer"
    >
      <template #modal-footer>
        <div class="m-0">
          <b-button variant="outline-primary" class="fine_details-cancel_button" @click="$bvModal.hide('approve_fine')">Назад</b-button>
          <b-button variant="danger" class="throbber-button button_remove" @click="editFineInfo">
            <div v-if="isCreatingLoading" class="throbber-button-block">
              <throbber class="throbber -button -button-white -button-larger"/>
            </div>
            <span :class="{ 'text-inherit': isCreatingLoading }">Назначить штраф</span>
          </b-button>
        </div>
      </template>
      <span> Штраф появится в списке штрафов в профиле сотрудника</span>
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
import DatePicker from 'vue2-datepicker';
import calendar_icon from "@/assets/vue-svg/calendar_icon.svg";
import moment from 'moment';

export default {
  name: 'fine-details',
  props: {
    userId: Number,
    paymentInfo: Object,
    subheader: String,
    fineInfo: Object,
  },
  components: {
    ButtonThrobber,
    CustomSelect,
    CardNumberInput,
    CardExpiresAtInput,
    TextareaAutosizeCustom,
    DatePicker,
    'calendar_icon': calendar_icon,
    throbber,
    pen,
  },
  data() {
    return {
      changedInfo: {
        date: '',
        reason: null,
        details: '',
        amount: null,
      },
      fieldErrors: {},
      fineOptions: {
        sum: `$`,
        percent: `%`
      },
    }
  },
  computed: {
    finesReasons() {
      return this.$store.state.dictionaries.finesReasons;
    },
    status() {
      return this.$store.state.profile.fineStatus;
    },
    paymentStatus() {
      return this.$store.state.profile.paymentStatus;
    },
    isCreatingLoading() {
      return this.status === 'creating-fine';
    },
    isEditingLoading() {
      return this.status === 'editing-fine';
    },
    isCancelLoading() {
      return this.status === 'canceling-fine';
    },
    activeFine() {
      if (this.changedInfo.reason) {
        return this.finesReasons.find((fine) => fine.id === this.changedInfo.reason);
      } else {
        return {};
      }
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'canceling-fine':
            this.$bvModal.hide('remove_fine');
            break;
        }
      }
      if (newStatus === 'error') {
        switch (prevStatus) {
          case 'creating-fine':
            this.validateForm();
            this.$bvModal.hide('approve_fine');
            break;
          case 'editing-fine':
            this.validateForm();
            break;
          case 'canceling-fine':
            this.$bvModal.hide('remove_fine')
        }
      }
    },
  },
  created() {
    if (this.fineInfo) {
      this.changedInfo = {
        ...this.changedInfo,
        amount: this.fineInfo.amount,
        date: this.fineInfo.date,
        details: this.fineInfo.details,
        reason: this.fineInfo.reason?.id,
      };
    }
    this.$store.dispatch('dictionaries/fetchFineReasons');
  },
  methods: {
    editFineInfo() {
      const params = {
        userId: this.userId,
        id: this.fineInfo?.id,
        data: {
          created_at: moment(this.changedInfo.date).format('YYYY-MM-DD'),
          reason: this.changedInfo.reason,
          details: this.changedInfo.details,
          amount: this.changedInfo.amount,
        },
      };
      this.fineInfo ?
          this.$store.dispatch('profile/editFine', params) :
          this.$store.dispatch('profile/createFine', params);
    },
    validateForm() {
      const {date, reason, details, amount} = this.changedInfo;
      let errors = {
        date: !date,
        reason: !reason,
        details: !details,
        amount: !amount
      };
      this.fieldErrors = errors;
      this.validateAmount();
      return Object.values(errors).some((error) => error);
    },
    removeError(field) {
      this.fieldErrors = {
        ...this.fieldErrors,
        [field]: false,
      };
    },
    validateAmount() {
      const amount = parseInt(this.changedInfo.amount, 10);
      if (isNaN(amount) || (amount <= 0) || (amount > 9999)) {
        this.fieldErrors.amount = true;
      } else {
        this.fieldErrors.amount = false;
        this.changedInfo.amount = amount;
      }
    },
    showDeleteModal() {
      this.$bvModal.show('remove_fine');
    },
    choseAction() {
      if (this.validateForm()) return;
      this.fineInfo ?
        this.editFineInfo():
        this.$bvModal.show('approve_fine');
    },
    clickBack() {
      this.$emit('back');
    },
    cancelFine() {
      this.$store.dispatch('profile/cancelFine', {id: this.fineInfo?.id, userId: this.userId});
    },
  },
}
</script>