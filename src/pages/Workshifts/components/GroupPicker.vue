<template>
  <div class="workshifts-filters-groups">
    <div v-for="(group, key) in activeGroups" class="workshifts-filters-groups-content mr-2">
      <custom-select v-model="group.group"
                     :options="key === 0 ? groups : activeGroups[key - 1].group.children"
                     valueField="id"
                     return-whole-object
                     @change="changeGroup(key)"
      >
        <template v-slot:chosen-variant="{ value }">
          <div v-if="value" class="workshifts-filters-groups-content-group">
            <i v-if="value.type === 'country'" class="flag-icon mr-2" :class="`flag-icon-${value.build_group.flag || 'default'}`"/>
            <i v-else-if="value.color"
                 class="workshifts-filters-groups-content-group-color"
                 :style="`background-color: ${value.color};`"
            />
            <span class="workshifts-filters-groups-content-group-title">{{ value.title }}</span>
          </div>
          <span v-else>Выберите группу</span>
        </template>
        <template v-slot:list-variant="{variant}">
          <div class="workshifts-filters-groups-content-group">
            <i v-if="variant.type === 'country'" class="flag-icon mr-2" :class="`flag-icon-${variant.build_group.flag || 'default'}`"/>
            <i v-else-if="variant.color"
               class="workshifts-filters-groups-content-group-color"
               :style="`background-color: ${variant.color};`"
            />
            <span class="workshifts-filters-groups-content-group-title">{{ variant.title }}</span>
          </div>
        </template>
      </custom-select>
    </div>
    <div class="workshifts-filters-groups-slot">
      <slot/>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";

export default {
  name: 'group-picker',
  props: {
    value: Object,
    isOperatorsGroups: {
      type: Boolean,
      default: false
    },
    storageName: String,
    defaultGroup: Array,
    groups: Array,

  },
  components: {
    'custom-select': Select
  },
  data() {
    return {
      activeGroups: [{group: null}]
    }
  },
  computed: {
    savedGroup: {
      get: function () {
        return this.storageName ? JSON.parse(localStorage.getItem(this.storageName)) : this.defaultGroup ? this.defaultGroup : [];
      },
      set: function (newGroups) {
        if (this.storageName) localStorage.setItem(this.storageName, JSON.stringify(newGroups));
      }
    },
    activeGroupPath() {
      if (!(this.activeGroups && this.activeGroups.length)) return '';
      let lastCountryKey;
      if (!this.activeGroups.length) return [];
      for (let i = this.activeGroups.length - 1; i >= 0; i--) {
        if (this.activeGroups[i].group?.type === 'country') {
          lastCountryKey = i;
          break;
        }
      }
      if (lastCountryKey === undefined) return {};
      let activeGroupPath = {
        flag: this.activeGroups[lastCountryKey].group.settings?.flag,
        country: this.activeGroups[lastCountryKey].group.title
      };
      if (this.activeGroups[lastCountryKey + 1]) activeGroupPath.city = this.activeGroups[lastCountryKey + 1].group?.title;
      if (this.activeGroups[lastCountryKey + 2]) activeGroupPath.office = this.activeGroups[lastCountryKey + 2].group?.title;
      return activeGroupPath;
      // return this.activeGroups.slice(lastCountryKey).map(element => element.group && {title: element.group.title, type: element.group.type, flag: element.group.settings?.flag}).filter(element => !!element);

      /*this.activeGroups.map((group, key) => {
          if (group.group && group.group.title) path += key === 0 ? group.group.title : `, ${group.group.title}`;
      });
      return path;*/
    }
  },
  watch: {
    groups: function (newGroups, prevGroups) {
      if (newGroups.length) this.showSavedGroups(newGroups);
    }
  },
  created() {
    if (this.groups.length) this.showSavedGroups(this.groups);
  },
  methods: {
    changeGroup(key) {
      let groups = [...this.activeGroups];

      if (key !== this.activeGroups.length - 1) {
        groups.splice(key + 1);
      }
      if (groups[key].group.children && groups[key].group.children.length) groups = [...groups, {group: null}];

      this.activeGroups = groups;
      this.savedGroup = groups.map(group => group.group && group.group.id);
      let result = {...groups[key].group, path: this.activeGroupPath};
      this.$emit('input', result);
      this.$emit('change', result);
    },
    showSavedGroups(groups) {
      if (!(this.savedGroup && this.savedGroup.length)) {
        this.activeGroups = [{group: null}]
        return;
      }
      let currentGroups = [...groups],
          removeFromLength = 1,
          activeGroups = [],
          groupsExists = this.savedGroup.every(groupId => {
            if (!groupId) {
              activeGroups.push({group: null});
              removeFromLength = 2;
              return true;
            }
            let currentGroup = currentGroups.find(group => group.id === groupId);
            if (!currentGroup) return false;
            currentGroups = currentGroup.children;
            activeGroups.push({group: currentGroup});
            return true;
          });

      if (!groupsExists) return;
      this.activeGroups = activeGroups;
      this.changeGroup(this.activeGroups.length - removeFromLength);
    }
  }
}
</script>