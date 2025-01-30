<template>
  <div class="incomes-details">
    <div class="workshift_details-header theme-helper-content-main-header">
      <button-throbber
          class="incomes-button"
          size="sm"
          variant="outline-primary"
          colorThrobber="primary"
          :class="{'-border': isLoading}"
          :loading="isLoading"
          :disabled="!isEdited || isAllDisabled"
          @click="editIncomes"
      >{{ buttonText }}
      </button-throbber>
    </div>
    <div class="workshift_details-body">
      <div class="workshift_details-body-container">
        <div class="incomes-details-shift_info mt-4">
          <div class="d-flex flex-column">
            <div class="title d-inline-flex">
              <h4>Смена</h4>
              <div class="incomes-details-shift_info-status"
                   :class="`-${changedWorkshift.status}`">
                <span>{{ statusTitles[changedWorkshift.status] }}</span>
              </div>
            </div>
            <div class="incomes-details-shift_data">
              <span>{{formattedDate}}&nbsp;</span>
              <span class="incomes-details-shift_data-time"
                    v-if="changedWorkshift.start_at && changedWorkshift.end_at">
                {{ `${changedWorkshift.start_at} - ${changedWorkshift.end_at}` }}
              </span>
              <span v-else-if="changedWorkshift.planned_start_at && changedWorkshift.planned_end_at">
                {{ `${changedWorkshift.planned_start_at} - ${changedWorkshift.planned_end_at}` }}
              </span>
            </div>
          </div>
          <div v-if="changedWorkshift.model" class="user_details-main-user pt-4">
            <div class="user_details-main-user-avatar">
              <avatar class="mr-2"
                      size="-lg"
                      :url="changedWorkshift.model.avatar"
                      :telegram="changedWorkshift.model.telegram_connected"
                      :is-fin-admin="changedWorkshift.model.is_fin_admin"
              />
            </div>
            <div class="incomes-details-info">
              <div v-if="changedWorkshift.id && changedWorkshift.model.model_nickname" class="d-flex align-items-center">
                    <at class="mr-1"/>
                    <span>{{ changedWorkshift.model.model_nickname }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="incomes-details-body">
          <h4 class="mt-3">Поступления</h4>
          <div v-for="profit in changedWorkshift.profits" class="incomes-details-body-line">
            <div class="incomes-details-body-line-profit">
              <div class="incomes-details-body-line-profit-logo"
                   slot="logotype"
                   :style="profit.resource.logo ? 'background-image: url(' + getSmallImage(profit.resource.logo) + '); background-size: cover;' : ''"
              ></div>
              <span class="incomes-details-body-line-profit-income-text">{{ profit.resource.title }}</span>
              <span class="incomes-details-body-line-profit-income"
              :class="{'-disabled' : !profit.are_editable}">
                        <span class="mr-3">$</span>
                        <input v-model="profit.sum"
                               v-autowidth="{maxWidth: '135px', minWidth: '26px', comfortZone: 4}"
                               v-mask="incomeMask"
                               :disabled="!profit.are_editable"
                               class="input-plain incomes-details-input"
                               type="text"
                               placeholder="0"
                               @change="toggleEditStatus"
                        />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";
import at from "@/assets/vue-svg/at.svg";
import moment from 'moment';
import {getSmallImage, deepClone, showToast} from "@/tools/tools";
import buttonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";

moment.locale('ru');

export default {
  name: 'income-details',
  props: {
    shiftId: Number,
    userId: Number,
  },
  components: {
    buttonThrobber,
    'avatar': Avatar,
    'at': at,
  },
  data() {
    return {
      changedWorkshift: {},
      statusTitles: {
        assigned: 'Назначена',
        completed: 'Завершена'
      },
      isEdited: false,
    }
  },
  computed: {
    status() {
      return this.$store.state.profile.status;
    },
    buttonText() {
      return this.isBlankWorkshift ? 'Отправить' : 'Изменить';
    },
    isBlankWorkshift() {
      return this.incomeDetailsData?.profits?.every(profit => profit.sum === null);
    },
    formattedDate() {
      const formattedDate = this.changedWorkshift.date?.length ? moment(this.changedWorkshift.date, 'YYYY-MM-DD').format('dddd, D MMMM') : '';
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    },
    incomeDetailsData() {
      return this.$store.state.profile.incomeDetailsData;
    },
    isAllDisabled() {
      return this.incomeDetailsData?.profits?.every(profit => !profit.are_editable);
    },
    isLoading() {
      return this.status === 'editing-incomes';
    },
  },
  watch: {
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'editing-incomes':
          case 'fetching':
            this.changedWorkshift = deepClone(this.incomeDetailsData);
            break;
        }
      }
    },
  },
  created() {
    this.$store.dispatch('profile/fetchIncomeDetails', {id: this.userId, shift_id: this.shiftId})
  },
  methods: {
    getSmallImage(link) {
      return getSmallImage(link);
    },
    editIncomes() {
      this.sendWorkshiftState();
      const profitsData = this.changedWorkshift.profits.reduce((acc, profit) => {
        if (profit.are_editable) {
          const sum = Number(profit.sum) || 0;
          acc.push({
            resource: profit.resource.id,
            sum: sum
          });
        }
        return acc;
      }, []);

      this.$store.dispatch('profile/editIncomes', {
        id: this.userId,
        shift_id: this.shiftId,
        profits: {profits: profitsData}
      });
    },
    sendWorkshiftState() {
      this.$emit('sendWorkshiftState', this.isBlankWorkshift);
    },
    toggleEditStatus() {
      this.isEdited = true;
    },
    incomeMask(value) {
      const number = value.replace(/[^0-9\.]/g, ''),
          result = number.match(/\d+\.?(\d{1,2})?/);

      if (!result) return [];
      return [...result[0]];
    },
  }
}
</script>