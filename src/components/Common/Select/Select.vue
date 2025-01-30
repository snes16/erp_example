<template>
  <div class="custom_select text-left" :class="{ '-hidden': disabled, '-error_text': error, '-clearable': clearable, '-active': isActive }">
    <b-dropdown class="custom_select-dropdown d-flex justify-content-between custom_show"
                :class="shownText === defaultText ? '-default' : ''"
                variant="default"
                :disabled="disabled"
                ref="dropdown"
                :right="right"
                @show="onShow"
                @shown="onShown"
                @hide="onHide"
    >
      <template v-slot:button-content>
        <div class="custom_select-dropdown-container custom_select-dropdown-search">
          <input v-if="searchable || searchableRequest"
                 v-model="searchString"
                 class="custom_select-dropdown-search-input input-plain -transparent"
                 ref="search-input"
                 :placeholder="shownText"
                 :disabled="disabled"
                 v-autowidth="{maxWidth: '400px', minWidth: '118px', comfortZone: 4}"
                 @input="changeSearchString"
                 @click="disableDropdownHide"
          />
          <slot name="chosen-variant" v-bind:value="chosenVariant" v-bind:shownText="shownText">
            <span class="custom_select-dropdown-search-value">{{ shownText }}</span>
          </slot>
        </div>
      </template>
      <div class="custom_select-content" ref="select-content" @scroll="onContentScroll"
           :style="{ width: selectWidth}">
        <div v-if="!isFilled" class="ml-2 text-gray pt-1 pb-1">
          <span>Нет совпадений</span>
        </div>
        <template v-else>
          <template v-for="(title, variant, key) in filteredOptions">
            <div v-if="variantSubheaderRule(variant)" class="custom_select-content-subheader">{{ variantSubheaderRule(variant) }}</div>
            <b-dropdown-item-button :key="variant"
                                    :ref="`select-element-${key || variant}`"
                                    :disabled="title.disabled || variantDisabledRule(title)"
                                    :active="(chosenVariantKey === variant) || (chosenVariantKey === key)"
                                    @click="changeValue(variant)"
            >
              <slot name="list-variant" v-bind:variant="title">
                <div v-if="setAvatar" class="d-flex align-items-center" :id="variantIdPrefix ? `${variantIdPrefix}-${variant[valueField]}` : undefined">
                  <div class="avatar -sm mr-2"
                       :style="title.avatar ? `background-image: url(${title.avatar}); background-size: cover;` : ''"
                  ></div>
                  <span>{{ title && (title[titleField] || title[altTitleField]) || title }}</span>
                </div>
                <span v-else :id="variantIdPrefix ? `${variantIdPrefix}-${title[valueField] || variant}` : undefined">{{ title && (title[titleField] || title[altTitleField]) || title }}</span>
              </slot>
            </b-dropdown-item-button>
          </template>
          <div v-if="loading" class="custom_select-content-loading">
            <throbber class="throbber" />
            <span class="custom_select-content-loading-text">Загрузка</span>
          </div>
        </template>
      </div>
    </b-dropdown>
    <input class="custom_select-input" type="text" :value="value" :required="required"/>
    <div v-if="clearable && !disabled" class="custom_select-clear helper-close" @click="clear"></div>
  </div>
</template>

<script>
import throbber from "@/assets/vue-svg/throbber.svg";

export default {
  name: 'custom-select',
  props: {
    value: [String, Number, Boolean, Object],
    options: [Object, Array],
    defaultText: {
      type: String,
      default: 'Выберите вариант'
    },
    defaultValue: {
      type: [String, Number, Boolean],
      default: undefined,
    },
    titleField: {
      type: String,
      default: 'title'
    },
    altTitleField: String,
    valueField: {
      type: String,
      default: 'value'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    keepSearchString: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    returnWholeObject: {
      type: Boolean,
      default: false
    },
    setAvatar: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    },
    searchableRequest: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    infinityScroll: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    perPage: {
      type: Number,
      default: 20
    },
    variantDisabledRule: {
      type: Function,
      default: () => false
    },
    variantSubheaderRule: {
      type: Function,
      default: () => null,
    },
    removeOldValue: Boolean,
    right: Boolean,
    variantIdPrefix: String,
    adjustWidth: Boolean,
  },
  components: {
    'throbber': throbber,
  },
  data() {
    return {
      inputFocused: false,
      selectedExecutor: '',
      searchString: '',
      isActive: false,
      selectWidth: ''
    }
  },
  computed: {
    type() {
      return Array.isArray(this.options) ? 'array' : 'object';
    },
    chosenVariant() {
      if (!this.value && (this.value !== 0) && (this.value !== false)) return null;
      return typeof this.value === 'object' ?
          this.value :
          this.options && (this.type === 'array' ? this.options.find(element => (element[this.valueField] === this.value) || (element === this.value)) : this.options[this.value]) || null;
    },
    chosenVariantKey() {
      if (!this.value && (this.value !== 0) && (this.value !== false) || !this.options) return null;
      const value = (typeof this.value === "object") ? this.value[this.valueField] : this.value;
      return this.type === 'array' ? this.options.findIndex(element => (element[this.valueField] === value) || (element === value)) : this.value;
    },
    shownText() {
      if (this.returnWholeObject && this.value) return this.value[this.titleField] || this.defaultText;
      let value = this.returnWholeObject && this.value ? this.value[this.valueField] : this.value;
      if ((value === this.defaultValue) && !this.options.hasOwnProperty(value)) return this.defaultText;
      if (this.type === 'array') {
        if (!(this.options && this.options.length)) return this.defaultText;
        let activeElement = this.options.find(element => element[this.valueField] !== undefined ? (element[this.valueField] === value) : (element === value));
        if (!activeElement) return this.defaultText;
        return activeElement && activeElement[this.titleField] || activeElement[this.altTitleField] || activeElement;
      }
      return (this.options[value] ? this.options[value][this.titleField] || this.options[value][this.altTitleField] || this.options[value] : this.defaultText);
    },
    filteredOptions() {
      if (!this.searchable || !this.searchString) return this.options;
      let searchString = this.searchString.toLowerCase();
      return this.options.filter(option => option[this.titleField]?.toLowerCase().includes(searchString) || (this.altTitleField && option[this.altTitleField]?.toLowerCase().includes(searchString)));
    },
    isFilled() {
      return this.type === 'Array' ? this.filteredOptions.length : Object.keys(this.filteredOptions).length;
    }
  },
  watch: {
    filteredOptions: function (newOptions) {
      if (this.returnWholeObject && this.removeOldValue && newOptions && this.value?.[this.valueField]) {
        if (Array.isArray(newOptions)) {
          if (newOptions.length) this.changeValue(newOptions.findIndex(element => element[this.valueField] === this.value[this.valueField]), true);
        } else if (Object.keys(newOptions).length) this.changeValue(this.value[this.valueField], true);
      }
      if (!this.infinityScroll) return;
      if (this.$refs['select-content'].scrollHeight && (this.$refs['select-content'].scrollHeight <= (this.$refs['select-content'].clientHeight * 2))) this.$emit('getNextPage');
    }
  },
  created() {
    if (this.returnWholeObject && this.removeOldValue && this.filteredOptions && this.value?.[this.valueField]) {
      if (Array.isArray(this.filteredOptions)) {
        if (this.filteredOptions.length) this.changeValue(this.filteredOptions.findIndex(element => element[this.valueField] === this.value[this.valueField]));
      } else if (Object.keys(this.filteredOptions).length) this.changeValue(this.value[this.valueField]);
    }
  },
  methods: {
    updateSelectWidth() {
      this.selectWidth = this.$refs.dropdown?.$el.clientWidth + 32 + 'px';
    },
    changeValue(variant, keepSearchString = false) {
      let value = this.returnWholeObject ? (this.filteredOptions && this.filteredOptions[variant]) : this.filteredOptions[variant][this.valueField] !== undefined ? this.filteredOptions[variant][this.valueField] : (this.type === 'array' ? this.filteredOptions[variant] : variant);
      if (!keepSearchString && !this.keepSearchString) {
        this.searchString = '';
        this.changeSearchString();
      }
      this.$emit('input', value);
      this.$emit('change', value);
    },
    onShow(e) {
      if (this.adjustWidth)
        this.updateSelectWidth();
      if (this.searchable || this.searchableRequest) setTimeout(() => {
        this.$refs['search-input']?.focus();
      }, 10);
      this.$emit('show', e);
      this.isActive = true;
    },
    onShown() {
      if (!this.infinityScroll) return;
      if (this.$refs['select-content'].scrollHeight <= (this.$refs['select-content'].clientHeight * 2)) this.$emit('getNextPage');
    },
    onHide(e) {
      if (this.searchableRequest && this.searchString) {
        this.searchString = '';
        this.changeSearchString();
      }
      this.$emit('hide', e);
      this.isActive = false;
    },
    clear() {
      this.$emit('input', this.defaultValue);
      this.$emit('change', this.defaultValue);
    },
    onContentScroll(e) {
      if (!this.infinityScroll) return;
      let middleElement = this.filteredOptions.length - (this.filteredOptions.length % this.perPage) - Math.floor(this.perPage / 2);
      if (this.$refs[`select-element-${middleElement}`] && (this.$refs[`select-element-${middleElement}`][0].$el.getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height) && !this.loading) this.$emit('getNextPage');
    },
    changeSearchString() {
      if (this.searchableRequest) this.$emit('searchList', this.searchString)
    },
    disableDropdownHide(e) {
      if (this.$refs.dropdown.visible) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    },
  }
}
</script>