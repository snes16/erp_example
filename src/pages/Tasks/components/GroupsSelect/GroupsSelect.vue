<template>
  <div class="custom_select text-left" :class="{ '-active': isActive }">
    <b-dropdown v-if="!groupsListOnly"
                class="custom_select-dropdown d-flex justify-content-between custom_show -default"
                :class="{'-empty': !filteredGroups.length}"
                variant="default"
                ref="groupSelectDropdown"
                @show="onDropdownShow"
                @hide="onDropdownHide"
    >
      <template v-slot:button-content>
        <div class="custom_select-dropdown-container custom_select-dropdown-search">
          <input v-model="searchString"
                 class="custom_select-dropdown-search-input input-plain -transparent"
                 ref="search-input"
                 v-autowidth="{maxWidth: '400px', minWidth: '118px', comfortZone: 4}"
                 @click="disableDropdownHide"
          />
          <span>{{ buttonText }}</span>
        </div>
      </template>
      <div class="custom_select-content">
        <div v-if="searchString && !filteredGroups.length" class="groups_select-empty">По запросу «{{ searchString }}» ничего не найдено</div>
        <group-select-item v-for="(group, key) in filteredGroups" v-model="activeGroups[key]" :group="group" :key="key"/>
      </div>
    </b-dropdown>
    <template v-else>
      <group-list-select-item v-for="(group, key) in value"
                              v-model="activeGroups[key]"
                              :group="group"
                              :key="key"
                              :hide-checkboxes="hideCheckBoxes"
                              :group-id="groupId"
                              parentTitle=""
                              :previousId="previousId"
                              @newGroupId="setNewGroupId"
      />
    </template>
  </div>
</template>

<script>
import GroupSelectItem from "./GroupSelectItem";
import GroupListSelectItem from "../GroupsList/GroupListSelectItem";
import plus from "@/assets/plus-grey.svg";
import { pluralize, filterListRecursively } from '@/tools/tools';

export default {
  name: 'groups-select',
  props: {
    value: Array,
    groupsListOnly: {
      type: Boolean,
      default: false,
    },
    hideCheckBoxes: {
      type: Boolean,
      default: false,
    },
    groupId: Number,
    previousId: Number,
    onlyModelsGroup: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'group-select-item': GroupSelectItem,
    'group-list-select-item': GroupListSelectItem,
    'plus': plus,
  },
  data() {
    return {
      activeGroups: [],
      searchString: '',
      isActive: false,
    }
  },
  computed: {
    groups() {
      return this.onlyModelsGroup ? this.$store.state.dictionaries.groupsNonOperators : this.$store.state.dictionaries.groups;
    },
    filteredGroups() {
      if (!this.searchString) return this.groups;
      let searchString = this.searchString.toLowerCase();
      return filterListRecursively(this.groups, (group => group.title.toLowerCase().includes(searchString)));
    },
    buttonText() {
      if (!(this.value && this.value.length)) return 'Группа';
      if (this.value.length === 1) return this.value[0].title;
      return pluralize(this.value.length, ['группа', 'группы', 'групп']);
    },
  },
  created() {
    if (this.onlyModelsGroup) this.$store.dispatch('dictionaries/fetchGroupsNonOperators');
    else this.$store.dispatch('dictionaries/fetchGroups');
    this.$root.$on('clearFilters', this.onClearFilters);
  },
  destroyed() {
    this.$root.$off('clearFilters', this.onClearFilters);
  },
  watch: {
    activeGroups: function (newGroups) {
      this.$emit('input', newGroups.flat(Infinity).filter(groupId => groupId !== undefined));
    }
  },
  methods: {
    onClearFilters() {
      this.activeGroups = [];
    },
    setNewGroupId(group) {
      this.$emit('new-group-id', group);
    },
    clearSearchString() {
      this.searchString = '';
    },
    onDropdownShow() {
      setTimeout(() => {
        this.$refs['search-input']?.focus();
      }, 10);
      this.isActive = true;
    },
    onDropdownHide() {
      this.isActive = false;
    },
    disableDropdownHide(e) {
      if (this.$refs.groupSelectDropdown.visible) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    },
  },
}
</script>
