<template>
  <b-dropdown class="custom_select-checkboxes" :text=buttonText variant="filter">
    <b-dropdown-form>
      <b-form-group>
        <div class="abc-checkbox custom_select-checkboxes-checkbox">
          <div class="abc-checkbox custom_select-checkboxes-checkbox-block">
            <span>Все заявки</span>
            <input type="checkbox" id="week-select" v-model="allResponseSelected" @change="toggleAll">
            <label for="week-select"></label>
          </div>
        </div>
        <div class="abc-checkbox custom_select-checkboxes-checkbox" v-for="responseType in responseTypes">
          <div class="abc-checkbox custom_select-checkboxes-checkbox-block">
            <span>{{ responseType.title }}</span>
            <input type="checkbox" :id="`${variantIdPrefix}-${responseType.value}`" :value='responseType.value' v-model="selectedItem">
            <label :for="`${variantIdPrefix}-${responseType.value}`"></label>
          </div>
        </div>
      </b-form-group>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script>
import {pluralize} from "@/tools/tools";

export default {
  name: "DropdownCheckbox",
  props: {
    responseTypes: Array,
    handleSelect: Function,
    variantIdPrefix: String,
  },
  data() {
    return {
      allResponseSelected: false,
      selectedItem: [],
    }
  },
  mounted() {
    let filterSelectedResponse = JSON.parse(localStorage.getItem('filterSelectedResponse'));
    if (filterSelectedResponse && filterSelectedResponse.length) this.selectedItem = filterSelectedResponse;
    else this.selectedItem = ['new', 'call_center', 'interview'];
  },
  computed: {
    buttonText() {
      if (!(this.selectedItem && this.selectedItem.length)) return 'Статус заявки';
      if (this.selectedItem.length === 1) return this.responseTypes.filter(type => type.value === this.selectedItem[0])[0].title;
      return 'Выбрано ' + pluralize(this.selectedItem.length, ['статус', 'статуса', 'статусов']);
    },
  },
  watch: {
    selectedItem: function (newSelected) {
      localStorage.setItem('filterSelectedResponse', JSON.stringify(newSelected));
      if (!newSelected.length) this.allResponseSelected = false;
      else if (newSelected.length === this.responseTypes.length) this.allResponseSelected = true;
      else this.allResponseSelected = false;
      this.handleSelect(newSelected);
    },
  },
  methods: {
    toggleAll() {
      this.selectedItem = []
      if (this.allResponseSelected) this.responseTypes.forEach(responseType => this.selectedItem.push(responseType.value))
    },
  }
}
</script>