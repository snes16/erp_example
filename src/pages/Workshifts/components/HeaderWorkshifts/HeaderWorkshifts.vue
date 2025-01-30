<template>
  <div class="workshifts-header card">
    <div class="workshifts-header-tabs" ref="tabs">
      <template v-if="workshiftTabs.length">
        <div v-for="(tab, key) in workshiftTabs"
             class="workshifts-header-tabs-tab"
             :class="key === activeTabId ? '-active' : ''"
             :key="key"
             :id="`tab-${key}`"
             @click="setActiveTab(key)"
        >
          <span class="workshifts-header-tabs-tab-title">{{ tab.group && tab.group.id && tab.group.title || 'Новая группа' }}</span>
          <close v-if="workshiftTabs.length > 1" class="workshifts-header-tabs-tab-delete" :class="key === activeTabId ? '-active' : ''" @click="deleteTab($event, key)"/>
          <b-tooltip :target="`tab-${key}`" triggers="hover" :placement="isManyTabs ? 'bottomright' : 'bottom'" boundary="viewport" custom-class="workshifts-header-tooltip">
            <div v-if="tab && tab.group && tab.group.id" class="profile-main-info-data-resign-tooltip d-flex align-items-start">
              <span v-if="tab.group.build_group" class="flag-icon mr-1 mt-1" :class="`flag-icon-${tab.group.build_group.flag || 'default'}`"></span>
              <div>
                <span v-if="tab.group.type === 'office'" class="text-white mr-1">{{ tab.group.city ? tab.group.city.title : tab.group.build_group.city }}</span>
                <span class="text-white">{{ tab.group.title }}</span><br/>
                <span class="text-gray">{{ workshiftSections[tab.tab] }}</span>
              </div>
            </div>
            <template v-else>
              <div>
                <span class="text-white">Новая вкладка</span>
              </div>
            </template>
          </b-tooltip>
        </div>
      </template>
      <div class="workshifts-header-tabs-add" ref="tab-add-new">
        <div class="workshifts-header-tabs-tab -new" key="new" @click="addNewTab()">
          <plus class="workshifts-header-tabs-tab-plus"/>
          <span v-if="!isManyTabs" class="workshifts-header-tabs-tab-title -new">Новая группа</span>
        </div>
      </div>
    </div>
    <div class="workshifts-header-config">
      <div class="workshifts-header-config-main">
        <group-select v-model="activeGroup"
                      :groups="groupsNonSystem"
                      id="schedule-group-select"
                      class="workshifts-header-config-main"
        />
        <slot name="date-picker"/>
      </div>
      <div v-if="isAdaptiveModile" class="workshifts-header-config-adaptive navbar-light">
        <div class="workshifts-header-config-adaptive-active_section" @click="openWorkshiftSections">
          <span class="workshifts-header-config-adaptive-active_section-text">
            {{ workshiftSections[activeSection] }}
          <span v-if="activeSection === 'free-models'">({{ freeModelsCount.count }})</span>
          </span>
          <button type="button" class="navbar-toggler">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
      </div>
      <div v-else class="workshifts-header-config-sections">
        <template v-for="(section, value) in workshiftSections">
          <template v-if="checkDisableSection(value)">
            <div class="workshifts-header-config-sections-section"
                 :class="value === activeSection ? '-active' : 'text-gray'"
                 :id="`schedule-tab-${value}`"
                 @click="changeSection(value)"
            >
              <span>{{ section }}</span> <span v-if="(value === 'free-models') && freeModelsCount.count" class="ml-1">({{ freeModelsCount.count }})</span>
            </div>
            <b-tooltip v-if="value === 'free-models'" :target="`schedule-tab-${value}`">
              <div class="d-flex justify-content-between">
                <b class="px-2">Без назначенных смен:</b>
                <span class="px-2">{{ freeModelsCount.without_workshifts }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <b class="px-2">Отсутствующие модели:</b>
                <span class="px-2">{{ freeModelsCount.absent }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <b class="px-2">Неактивные модели:</b>
                <span class="px-2">{{ freeModelsCount.inactive }}</span>
              </div>
            </b-tooltip>
          </template>
          <template v-else>
            <div class="workshifts-header-config-sections-section -disable" :id="`section-${value}`" :key="value">
              <span>{{ section }}</span> <span v-if="(value === 'free-models') && freeModelsCount.count" class="ml-1">({{ freeModelsCount.count }})</span>
            </div>
            <b-tooltip :target="`section-${value}`" :key="value" triggers="hover">Раздел недоступен, для просмотра выберите {{activeGroup.sub_type === 'operator' ? 'модельный' : 'операторский'}} офис.</b-tooltip>
          </template>
        </template>
      </div>
    </div>
    <b-collapse v-if="isAdaptiveModile" v-model="showWorkshiftSections" class="workshifts-header-config_collapse">
      <template v-for="(section, value) in workshiftSections">
        <div v-if="checkDisableSection(value)" class="workshifts-header-config_collapse-sections-section"
             @click="changeSection(value)">
          <span>{{ section }}</span>
          <span v-if="value === 'free-models'">({{ freeModelsCount.count }})</span>
        </div>
        <div v-else class="workshifts-header-config_collapse-sections-section -disable">
          <span>{{ section }}</span>
          <span v-if="value === 'free-models'">({{ freeModelsCount.count }})</span>
        </div>
      </template>
    </b-collapse>
  </div>
</template>

<script>
import CustomSelect from "@/components/Common/Select/Select";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import { isScheduleSectionPermitted } from "@/tools/tools";
import plus from "@/assets/plus-grey.svg";
import close from "@/assets/close-grey.svg";

export default {
  name: "HeaderWorkshifts",
  components: {
    CustomSelect,
    GroupSelect,
    'plus': plus,
    'close': close,
  },
  props: {
    freeModelsCount: Object,
  },
  data() {
    return {
      activeGroup: {},
      activeSection: 'show',
      activeDateType: 'day',
      isManyTabs: true,
      isAdaptiveModile: false,
      showWorkshiftSections: false,
    }
  },
  computed: {
    activeTabId: {
      get() {
        return this.$store.state.schedule.activeTabId;
      },
      set(tabId) {
        this.$store.dispatch('schedule/setActiveTab', tabId);
      },
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    workshiftTabs() {
      return this.$store.state.schedule.workshiftTabs;
    },
    activeTab() {
      return this.workshiftTabs[this.activeTabId] || {};
    },
    workshiftSections() {
      let workshiftSections = {};
      if (isScheduleSectionPermitted('show', this.userPermissions)) workshiftSections.show = 'Расписание';
      if (isScheduleSectionPermitted('free-models', this.userPermissions)) workshiftSections['free-models'] = 'Модели без смен';
      if (isScheduleSectionPermitted('past-workshift', this.userPermissions)) workshiftSections['past-workshift'] = 'Прошедшие смены';
      if (isScheduleSectionPermitted('operator', this.userPermissions)) workshiftSections.operator = 'Операторы';
      return workshiftSections;
    },
    groupsNonSystem() {
      return this.$store.state.dictionaries.groupsNonSystem;
    },
    activeInfo() {
      return this.$store.state.schedule.activeInfo;
    },
    groupsOptions() {
      if (!this.groupsNonSystem.length) return [];
      let result = [],
          // hideModelsOffices = !this.userPermissions.schedule.view && !this.userPermissions.schedule.reserve.view && !this.userPermissions.schedule.past.view,
          hideModelsOffices = false,
          hideOperatorsOffices = !this.userPermissions.setup.workshift.operator;

      this.groupsNonSystem.forEach(groupCountry => {
        let currentCountry = {
          build_group: groupCountry.build_group,
          id: groupCountry.id,
          title: groupCountry.title,
          type: groupCountry.type,
          color: groupCountry.color,
          children: groupCountry.children,
          settings: groupCountry.settings,
          path: groupCountry.path
        }
        result.push(currentCountry);
        groupCountry.children.forEach(groupCity => {
          let currentCity = {
            country: {
              build_group: currentCountry.build_group,
              id: currentCountry.id,
              title: currentCountry.title,
            },
            build_group: groupCity.build_group,
            id: groupCity.id,
            title: groupCity.title,
            type: groupCity.type,
            color: groupCity.color,
            children: groupCity.children,
            settings: groupCity.settings,
            path: groupCity.path
          }
          result.push(currentCity);
          groupCity.children.forEach(groupOffice => {
            if (groupOffice.sub_type === 'operator') {
              if (hideOperatorsOffices) return;
            } else if (hideModelsOffices) return;
            result.push({
              city: {
                build_group: currentCity.build_group,
                id: currentCity.id,
                title: currentCity.title,
              },
              country: {
                build_group: currentCountry.build_group,
                id: currentCountry.id,
                title: currentCountry.title,
              },
              build_group: groupOffice.build_group,
              sub_type: groupOffice.sub_type,
              id: groupOffice.id,
              title: groupOffice.title,
              type: groupOffice.type,
              color: groupOffice.color,
              settings: groupOffice.settings,
              path: groupOffice.path,
              rooms: groupOffice.rooms});
          })
        })
      })
      return result;
    },
    groupsList() {
      let result = {};
      this.groupsOptions.forEach(group => result[group.id] = group);
      return result;
    },
  },
  watch: {
    activeTab(newTab) {
      if (!newTab) return;
      this.updateTabData(newTab);
    },
    groupsList(newGroupsList) {
      this.workshiftTabs.forEach((workshift, id) => {
        if (workshift.group?.id && newGroupsList[workshift.group.id]) this.editTab({date_type: workshift.date_type, group: newGroupsList[workshift.group.id], tab: workshift.tab}, id);
      });
    },
    workshiftTabs(newTabs, prevTabs) {
      this.$nextTick(() => {
        this.isManyTabs = (this.$refs['tab-add-new'].clientWidth < 120);
        localStorage.setItem('workshiftConfigs', JSON.stringify(newTabs));
        localStorage.setItem('workshiftConfigsDate', JSON.stringify(new Date()));
      });
    },
    activeGroup(newGroup, prevGroup) {
      if (prevGroup?.id && (newGroup.sub_type !== prevGroup.sub_type)) this.changeSectionByGroup(newGroup);
      this.editTab(null, this.activeTabId, newGroup);
    },
    activeInfo: {
      handler(newInfo) {
        if (!newInfo.group || !newInfo.activeTab) return;
        this.addNewTab(newInfo.group.id);
        this.activeGroup = newInfo.group;
        this.changeSection(newInfo.activeTab);
      },
      immediate: true,
    },
  },
  created() {
    this.updateTabData();
    this.$store.dispatch('dictionaries/getGroupsNonSystem');
    if (!this.workshiftTabs?.length) this.addNewTab();
    else if (this.groupsList && Object.keys(this.groupsList)?.length) this.workshiftTabs.forEach((workshift, id) => {
      if (workshift.group?.id && this.groupsList[workshift.group.id]) this.editTab({date_type: workshift.date_type, group: this.groupsList[workshift.group.id], tab: workshift.tab}, id);
    });
    // window.addEventListener('beforeunload', this.saveWorkshiftConfig);
    window.onbeforeunload = this.saveWorkshiftConfig;
  },
  mounted() {
    this.$nextTick(() => this.resizeWidth());
    this.$root.$on('resize', this.resizeWidth);
  },
  beforeDestroy() {
    this.saveWorkshiftConfig();
    // window.removeEventListener('beforeunload', this.saveWorkshiftConfig);
    this.$root.$off('resize', this.resizeWidth);
  },
  destroyed() {
    this.$store.dispatch('schedule/clearActiveInfo');
    window.onbeforeunload = null;
  },
  methods: {
    setActiveTab(id) {
      this.activeTabId = id;
    },
    updateTabData(newActiveTab = this.activeTab) {
      this.activeGroup = newActiveTab.group;
      this.activeSection = newActiveTab.tab;
      this.activeDateType = newActiveTab.date_type;
      this.saveActiveTab({...this.activeTab});
      this.$nextTick(() => { if (this.$refs.tabs) this.$refs.tabs.scrollTo(this.$refs.tabs.scrollWidth + 45,0)});
    },
    addNewTab(groupId = null) {
      if (this.workshiftTabs.length === 25) return this.$toasted.error('Нельзя открыть больше 25 вкладок одновременно', {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 2500,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast,
        },
      });
      this.$store.dispatch('schedule/addWorkshiftTab', {
        group: {id: groupId},
        tab: 'show',
        date_type: 'day',
      });
      this.setActiveTab(this.workshiftTabs.length - 1);
    },
    deleteTab(e, id) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.$store.dispatch('schedule/deleteWorkshiftTab', id);
      if (this.activeTabId === 0 || id > this.activeTabId) return;
      this.activeTabId--;
    },
    editTab(tabInfo = null, id = this.activeTabId, activeGroup = this.activeGroup) {
      this.$store.dispatch('schedule/editWorkshiftTab', {
        id,
        tab: {
          date_type: tabInfo?.date_type || this.activeDateType,
          group: tabInfo?.group || this.activeGroup,
          tab: tabInfo?.tab || this.activeSection
        }
      });
    },
    changeSectionByGroup(activeGroup = this.activeGroup) {
      if (activeGroup.type === 'office') {
        if (activeGroup.sub_type === 'operator') this.activeSection = 'operator';
        else this.activeSection = this.userPermissions.schedule.view ? 'show' :
            this.userPermissions.schedule.reserve.view ? 'free-models' :
                this.userPermissions.schedule.past.view ? 'past-workshift' :
                    (activeGroup.type === 'city') ? 'operator' : 'show';
      }
    },
    changeSection(section) {
      this.activeSection = section;
      this.editTab();
      this.showWorkshiftSections = false;
    },
    saveWorkshiftConfig() {
      //TODO save settings periodically or before refresh/close
      this.$store.dispatch('schedule/saveWorkshiftConfig');
      // return true;
    },
    saveActiveTab(activeTabInfo) {
      this.$store.dispatch('schedule/saveActiveTab', {id: this.activeTabId, tab: activeTabInfo});
    },
    checkDisableSection(section) {
      if (!this.activeGroup || this.activeGroup.type === 'city' || this.activeGroup.type === 'country') return true;
      if (this.activeGroup.sub_type === 'operator') return section === 'operator';
      else return section !== 'operator';
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    resizeWidth(e) {
      let windowWidth = e || window.innerWidth;
      this.isAdaptiveModile = windowWidth <= 1200;
      if (!this.isAdaptiveModile) this.showWorkshiftSections = false;
    },
    openWorkshiftSections() {
      this.showWorkshiftSections = !this.showWorkshiftSections;
    },
  }
}
</script>
