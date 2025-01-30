<template>
  <div class="custom_select text-left" :class="{ '-hidden': disabled, '-error_text': error, '-active': isActive }">
    <b-dropdown class="custom_select-dropdown d-flex justify-content-between custom_show -default"
                :class="{'-empty': !filteredGroups.length}"
                :disabled="disabled"
                variant="default"
                :right="right"
                ref="groupSelectDropdown"
                boundary="body"
                @show="onDropdownShow"
                @hide="onDropdownHide"
    >
      <template v-slot:button-content>
        <div class="custom_select-dropdown-container custom_select-dropdown-search">
          <input v-model="searchString"
                 class="custom_select-dropdown-search-input input-plain -transparent"
                 ref="search-input"
                 :disabled="disabled"
                 v-autowidth="{maxWidth: '400px', minWidth: '118px', comfortZone: 4}"
                 @keydown.enter="selectSingleGroup"
                 @click="disableDropdownHide"
                 @keydown.space.stop.prevent="insertSpace"
          />
          <div class="custom_select-dropdown-container">
            <span v-if="searchString.length" class="workshifts-header-config-group-title">{{ searchString }}</span>
            <div v-else-if="value && value.id" class="workshifts-header-config-group-title">
            <span v-if="value.build_group || value.flag"
                  class="flag-icon mr-1"
                  :class="`flag-icon-${value.flag || value.build_group.flag || 'default'}`"
            ></span>
              <span v-if="(value.type === 'office') || value.office" class="text-gray mr-1">{{ (value.city && value.city.title) || (value.build_group && value.build_group.city) || value.city }}</span>
              <span v-if="((value.type !== 'office') && !value.office) || !altButtonForOffice" class="workshifts-header-config-group-title-office text-dark">{{ value.title || value.office || value.city }}</span>
            </div>
            <span v-else>{{ placeholder }}</span>
          </div>
          <div v-if="value && value.id && ((value.type === 'office') || value.office) && altButtonForOffice" class="groups_select-dropdown-office">
            <span class="text-gray mr-1">Офис:</span>
            <span class="text-dark">{{ value.title || value.office }}</span>
          </div>
        </div>
      </template>
      <div class="custom_select-content">
        <div v-if="searchString && !filteredGroups.length" class="groups_select-empty">По запросу «{{ searchString }}» ничего не найдено</div>
        <group-select-item v-for="group in filteredGroups"
                           v-model="chosenGroup"
                           :group="group"
                           :lvl="0"
                           :disable-rule="disableRule"
                           :default-collapse="defaultCollapse"
                           @change="selectGroup"
        />
      </div>
    </b-dropdown>
  </div>
</template>

<script>
import GroupSelectItem from "@/components/Common/GroupSelect/GroupSelectItem";
import plus from "@/assets/plus-grey.svg";
import { filterListRecursively } from "@/tools/tools";

export default {
  name: 'group-select',
  props: {
    groups: Array,
    value: Object,
    placeholder: {
      type: String,
      default: 'Выберите группу',
    },
    disabled: Boolean,
    right: {
      type: Boolean,
      default: false,
    },
    disableRule: {
      type: Function,
      default: () => true
    },
    defaultCollapse: {
      type: Boolean,
      default: false,
    },
    altButtonForOffice: Boolean,
    error: Boolean,
  },
  components: {
    GroupSelectItem,
    'plus': plus,
  },
  data() {
    return {
      searchString: '',
      isActive: false,
    }
  },
  computed: {
    chosenGroup: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
        this.$emit('change', value);
      },
    },
    filteredGroups() {
      if (!this.searchString) return this.groups;
      let searchString = this.searchString.toLowerCase();
      return filterListRecursively(this.groups, (group => group.title.toLowerCase().includes(searchString)));
    },
  },
  methods: {
    clearSearchString() {
      this.searchString = '';
    },
    selectGroup() {
      this.clearSearchString();
      this.$refs.groupSelectDropdown.hide();
    },
    insertSpace() {
      const selectionStart = this.$refs['search-input'].selectionStart;
      this.searchString = this.searchString.slice(0, selectionStart) + " " + this.searchString.slice(selectionStart);
      this.$nextTick(() => this.$refs['search-input'].setSelectionRange(selectionStart + 1, selectionStart + 1));
    },
    focusSearchInput() {
      setTimeout(() => {
        this.$refs['search-input']?.focus();
      }, 10);
    },
    selectSingleGroup() {
      if (this.filteredGroups.length === 1) {
        let selectedGroup = this.filteredGroups[0];
        while (selectedGroup.children && selectedGroup.children.length === 1) {
          if (selectedGroup.children[0].children && selectedGroup.children[0].children.length > 1)
            break;
          selectedGroup = selectedGroup.children[0];
        }
        this.chosenGroup = selectedGroup;
      }
    },
    onDropdownShow() {
      this.focusSearchInput();
      this.isActive = true;
    },
    onDropdownHide() {
      this.clearSearchString();
      this.isActive = false;
    },
    disableDropdownHide(e) {
      this.focusSearchInput();
      if (this.$refs.groupSelectDropdown.visible) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    },
  },
}
</script>
