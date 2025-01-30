<template>
  <b-dropdown class="groups_select" :text="buttonText" variant="filter">
    <div class="groups_select-search">
      <b-form-group class="search-field">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text><i class="la la-search"/></b-input-group-text>
          </template>
          <b-form-input v-model="searchString" placeholder="Поиск"/>
        </b-input-group>
      </b-form-group>
      <plus v-if="searchString" class="groups_select-search-clear" @click.stop="clearSearchString"/>
    </div>
    <div v-if="searchString && !filteredGroups.length" class="groups_select-empty">
      <span>По запросу «{{ searchString }}» ничего не найдено</span>
    </div>
    <div v-if="!searchString" class="groups_select-item">
      <div class="groups_select-item-container">
        <span class="groups_select-item-container-title -all">Все регионы</span>
        <div class="abc-checkbox groups_select-item-container-checkbox">
          <input v-model="allGroupsStatus" type="checkbox" id="groups-all"/>
          <label for="groups-all"/>
        </div>
      </div>
    </div>
    <div v-for="(country, key) in filteredGroups" class="groups_select-item">
      <div class="groups_select-item-indent -lvl-0">
        <div class="groups_select-item-container">
          <i v-if="country.children && country.children.length"
             class="fa fa-angle-down groups_select-item-container-arrow"
             :class="{
              '-active': collapseState[country.id],
            }"
             @click.stop="changeCollapseState(country.id)"
          />
          <div class="groups_select-item-container-color" :style="`background-color: ${country.color || 'red'}`"></div>
          <span class="groups_select-item-container-title">{{ country.title }}</span>
          <div class="abc-checkbox groups_select-item-container-checkbox">
            <div class="groups_select-item-container-checkbox-triple"
                 :class="countriesStatuses[key]"
                 @click="changeCountry(key)"/>
          </div>
        </div>
      </div>
      <b-collapse v-if="country.children && country.children.length"
                  v-model="collapseState[country.id]"
                  :id="`group-select-${country.id}`"
                  class="groups_select-item-children"
      >
        <div v-for="city in country.children" class="groups_select-item">
          <div class="groups_select-item-indent -lvl-1">
            <div class="groups_select-item-container -no-children">
              <div class="groups_select-item-container-color" :style="`background-color: ${city.color || 'red'}`"/>
              <span class="groups_select-item-container-title">{{ city.title }}</span>
              <div class="abc-checkbox groups_select-item-container-checkbox">
                <input v-model="activeGroups" :value="city.id" type="checkbox" :id="`group-${city.id}`"/>
                <label :for="`group-${city.id}`"/>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>
    </div>
  </b-dropdown>
</template>

<script>
import plus from "@/assets/plus-grey.svg";
import {filterListRecursively, pluralize} from '@/tools/tools';

export default {
  name: 'groups-filter',
  props: {
    value: Array,
    groups: Array,
    allGroupsDefault: Boolean,
  },
  components: {
    'plus': plus,
  },
  data() {
    return {
      searchString: '',
      collapseState: {},
    }
  },
  computed: {
    activeGroups: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
        this.$emit('change', value);
      }
    },
    buttonText() {
      if (!this.activeGroups?.length) return 'Регион';
      if (this.allGroupsStatus) return 'Выбраны все регионы';
      return `Выбран${this.activeGroups.length > 1 ? 'ы' : ''} ${pluralize(this.activeGroups.length, ['регион', 'региона', 'регионов'])}`;
    },
    countriesStatuses() {
      if (!this.groups?.length) return [];
      if (!this.activeGroups?.length) return this.groups.map(() => '-none');
      return this.groups.map(country => {
        let someActive = false,
            someInactive = false;

        country.children.some(city => {
          if (this.activeGroups.includes(city.id)) someActive = true;
          else someInactive = true;
          return someActive && someInactive;
        });

        return someActive ? (someInactive ? '-some' : '-all') : '-none';
      });
    },
    allGroupsStatus: {
      get() {
        return !this.countriesStatuses.some(status => status !== '-all');
      },
      set(value) {
        this.activeGroups = value ? this.groups.flatMap(country => country.children.map(city => city.id)) : [];
      },
    },
    filteredGroups() {
      if (!this.searchString) return this.groups;
      let searchString = this.searchString.toLowerCase();
      return filterListRecursively(this.groups, (group => group.title.toLowerCase().includes(searchString)));
    },
  },
  watch: {
    groups(newGroups, oldGroups) {
      if (!oldGroups?.length && newGroups?.length && !this.activeGroups?.length && this.allGroupsDefault) this.allGroupsStatus = true;
    },
  },
  created() {
    if (this.allGroupsDefault && !this.activeGroups?.length) this.allGroupsStatus = true;
  },
  methods: {
    changeCountry(key) {
      if (this.countriesStatuses[key] === '-all') return this.activeGroups = this.activeGroups.filter(groupId => !this.groups[key].children.some(group => group.id === groupId));
      let activeGroups = [...this.activeGroups];
      this.groups[key].children.forEach(group => {
        if (!activeGroups.includes(group.id)) activeGroups.push(group.id);
      });
      this.activeGroups = activeGroups;
    },
    changeCollapseState(groupId) {
      this.$root.$emit('bv::toggle::collapse', `group-select-${groupId}`);
    },
    clearSearchString() {
      this.searchString = '';
    },
  },
}
</script>
