<template>
  <div class="custom_select -multiple text-left" :class="{ '-hidden': disabled, '-error_text': error }">
    <b-dropdown class="custom_select-dropdown d-flex justify-content-between custom_show"
                variant="default"
                :disabled="disabled"
                ref="dropdown"
    >
      <template v-slot:button-content>
        <div class="custom_select-dropdown-container custom_select-dropdown-search">
          <span class="custom_select-dropdown-search-value">{{ placeholder }}</span>
        </div>
      </template>
      <ul class="custom_select-content" @click="disableDropdownHide">
        <li v-if="showAllVariantsCheckbox" role="presentation">
          <a class="dropdown-item custom_select-content-container">
            <b>{{ allVariantsText }}</b>
            <div class="abc-checkbox custom_select-content-container-checkbox">
              <input v-model="allElementsStatus" type="checkbox" :id="`${id}-all`"/>
              <label :for="`${id}-all`"/>
            </div>
          </a>
        </li>
        <li v-for="(variant, key) in options" role="presentation" :key="key">
          <a class="dropdown-item custom_select-content-container">
            <slot name="list-variant" v-bind:variant="variant">
              <span>{{ variant && variant[titleField] || variant }}</span>
            </slot>
            <div class="abc-checkbox custom_select-content-container-checkbox">
              <input v-model="activeElements"
                     :value="variant[valueField]"
                     type="checkbox"
                     :id="`${id}-${variant[valueField]}`"
              />
              <label :for="`${id}-${variant[valueField]}`" />
            </div>
          </a>
        </li>
      </ul>
    </b-dropdown>
    <input class="custom_select-input" type="text" :value="inputValue" :required="required"/>
  </div>
</template>

<script>
export default {
  name: 'select-multiple',
  props: {
    value: Array,
    options: Array,
    disabled: Boolean,
    error: Boolean,
    required: Boolean,
    id: String,
    placeholder: {
      type: String,
      default: 'Выберите варианты',
    },
    valueField: {
      type: String,
      default: 'value',
    },
    titleField: {
      type: String,
      default: 'title',
    },
    allVariantsText: {
      type: String,
      default: 'Выбрать все',
    },
    showAllVariantsCheckbox: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    activeElements: {
      get() {
        return this.value || [];
      },
      set(value) {
        this.$emit('input', value);
        this.$emit('change', value);
      }
    },
    allElementsStatus: {
      get() {
        return this.activeElements?.length === this.options.length;
      },
      set(value) {
        this.activeElements = value ? this.options.map(element => element[this.valueField]) : [];
      },
    },
    inputValue() {
      if (!this.activeElements.length) return;
      return this.activeElements.length;
    },
  },
  created() {
    if (!this.value) this.$emit('input', []);
  },
  methods: {
    changeValue(variant) {
      if (this.activeElements.includes(variant[this.valueField])) this.activeElements = this.activeElements.filter(element => element !== variant[this.valueField]);
      else this.activeElements = [...this.activeElements, variant[this.valueField]];
    },
    disableDropdownHide(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
  },
}
</script>