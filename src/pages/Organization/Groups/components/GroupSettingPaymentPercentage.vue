<template>
  <div class="collapse_block group_settings-block">
    <div class="collapse_block-toggle group_settings-block-collapse_toggle" @click="toggleCollapse">
      <div>
        <h4 class="mb-0">Процент заработка {{ usersTitle }}</h4>
        <span v-if="settingsType" class="text-gray">{{ settingsType === 'personal' ? 'Изменено администратором' : 'Согласно настройкам группы ' }}</span>
      </div>
      <div v-if="settingsType === 'personal'" class="text-link" @click="clear">Сбросить до настроек группы</div>
      <i v-if="withCollapse" class="fa fa-angle-down collapse_block-toggle-icon" :class="{'-active': collapseStatus}"/>
    </div>
    <component :is="withCollapse ? 'b-collapse' : 'div'"
               :visible="collapseStatus"
               :id="`group_settings-payment-collapse-${id}`"
               class="collapse_block-main"
    >
      <div v-for="(percentage, key) in paymentPercentages" class="group_settings-block-percentage">
        <b class="group_settings-block-percentage-title">Ставка {{ key + 1 }}</b>
        <div class="group_settings-block-percentage-main">
          <coins-stack class="group_settings-block-percentage-main-icon mr-2" />
          <span class="mr-2">≤</span>
          <div class="group_settings-block-percentage-main-input">
            <input v-model="percentage.amount_to"
                   v-autowidth="{maxWidth: '100px', minWidth: '20px', comfortZone: 8}"
                   :id="`group_settings-payment-${id}-input-amount_to-${key}`"
                   class="input-plain"
                   :class="{'-error': amountErrors.includes(key)}"
                   type="number"
                   min="0"
                   step="0.01"
                   placeholder="Сумма"
                   :required="!!percentage.percent"
                   :disabled="disabled"
                   @input="onInputField('amount_to', key)"
            />
            <label :for="`group_settings-payment-${id}-input-amount_to-${key}`" class="group_settings-block-percentage-main-input-symbol">$</label>
          </div>
          <span class="ml-4 mr-2">=</span>
          <div class="group_settings-block-percentage-main-input">
            <input v-model="percentage.percent"
                   v-autowidth="{maxWidth: '100px', minWidth: '20px', comfortZone: 8}"
                   :id="`group_settings-payment-${id}-input-percent-${key}`"
                   class="input-plain"
                   type="number"
                   min="0"
                   max="100"
                   step="0.01"
                   placeholder="Укажите"
                   :required="!!percentage.amount_to"
                   :disabled="disabled"
            />
            <label :for="`group_settings-payment-${id}-input-percent-${key}`" class="group_settings-block-percentage-main-input-symbol">%</label>
          </div>
        </div>
        <div class="group_settings-block-percentage-delete">
          <b-button v-if="!disabled && (paymentPercentages.length > 1)" variant="remove" @click="removePercentage(key)"/>
        </div>
      </div>
      <div v-if="!disabled" class="d-flex align-items-center cursor-pointer mb-3" @click="addPercentage">
        <span class="text-link">Добавить ставку</span>
        <b-button variant="add" class="ml-2"/>
      </div>
    </component>
  </div>
</template>

<script>
import coinsStack from "@/assets/vue-svg/coins-stack.svg";
import { showToast } from "@/tools/tools";

export default {
  name: "group-settings-payment-percentage",
  props: {
    value: Array,
    usersTitle: String,
    id: String,
    withCollapse: Boolean,
    disabled: Boolean,
    settingsType: String,
  },
  components: {
    "coins-stack": coinsStack,
  },
  data() {
    return {
      collapseStatus: false,
      amountErrors: [],
    }
  },
  computed: {
    paymentPercentages: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  },
  created() {
    if (!this.paymentPercentages.length) this.addPercentage();
  },
  methods: {
    toggleCollapse() {
      this.collapseStatus = !this.collapseStatus;
    },
    addPercentage() {
      this.paymentPercentages = [...this.paymentPercentages, {}];
    },
    removePercentage(keyToDelete) {
      this.paymentPercentages = this.paymentPercentages.filter((percentage, key) => key !== keyToDelete);
      this.amountErrors = [];
    },
    validate() {
      let isValid = true;
      this.paymentPercentages.forEach((percentage, key) => {
        if (key === 0) return;
        if (parseFloat(percentage.amount_to) <= parseFloat(this.paymentPercentages[key - 1].amount_to)) {
          showToast(this.$toasted, 'Ставка не может быть ниже предыдущих', 'error');
          this.amountErrors = [...this.amountErrors, key];
          isValid = false;
        }
      });
      return isValid;
    },
    onInputField(field, key) {
      switch (field) {
        case 'amount_to': this.amountErrors = this.amountErrors.filter(keyWithError => keyWithError !== key);
      }
    },
    clear() {
      this.$emit('clear');
    },
  }
}
</script>