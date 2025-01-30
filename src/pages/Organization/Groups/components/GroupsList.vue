<template>
  <div class="groups-nav">
    <div class="groups-nav-header">
      <div class="groups-nav-header-main">
        <h3 class="mb-0">Группы</h3>
        <b-button v-if="editPermission"
                  id="add-group"
                  variant="add"
                  class="ml-2_5"
                  @click="createGroup(null)"
        ></b-button>
        <div v-if="isDragPermitted"
             class="groups-nav-header-main-edit"
             @click="toggleMobileDrag"
        >
          <pen class="groups-nav-header-main-edit-icon"/>
        </div>
      </div>
      <div class="groups-nav-header-blocked"
           id="filters-icon"
           @click="toggleInactiveGroupsVisibility"
      >
        <gear class="groups-nav-header-blocked-icon" :class="{'-active': filters.inactiveGroups || filters.emptyGroups}" />
      </div>
      <b-tooltip target="filters-icon" boundary="window">
        <div class="px-2 pt-2">
          <div class="abc-checkbox -white -transparent">
            <input v-model="filtersInactiveGroups" type="checkbox" id="filters-checkbox-inactive" />
            <label for="filters-checkbox-inactive">Показать неактивные группы</label>
          </div>
          <div class="abc-checkbox -white -transparent">
            <input v-model="filtersEmptyGroups" type="checkbox" id="filters-checkbox-empty" />
            <label for="filters-checkbox-empty">Показать группы без сотрудников</label>
          </div>
        </div>
      </b-tooltip>
    </div>
    <div class="card">
      <div v-if="userPermissions.group.main.view && userPermissions.group.operator.view" class="groups-nav-tabs">
        <div class="groups-nav-tabs-tab -main"
             id="groups-type-main"
             :class="{'-active': groupsType === 'model'}"
             @click="setGroupsType('model')"
        >Основная</div>
        <div class="groups-nav-tabs-tab -operator"
             id="groups-type-operator"
             :class="{'-active': groupsType === 'operator'}"
             @click="setGroupsType('operator')"
        >Операторская</div>
      </div>
      <b-form-group class="search-field groups-nav-search">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text><search_large/></b-input-group-text>
          </template>
          <b-form-input v-model="searchString"
                        id="groups-search-input"
                        placeholder="Поиск"
                        autocomplete="new-password"
          />
        </b-input-group>
      </b-form-group>
      <div class="groups-nav-list"
           :class="{'-small': userPermissions.group.main.view && userPermissions.group.operator.view}"
      >
        <draggable v-model="groupsForDragging"
                   group="groups-parent-none"
                   :preventOnFilter="false"
                   :forceFallback="true"
                   :disabled="!isDragEnabled"
        >
          <group-block v-for="group in groupsForDragging"
                       :group="group"
                       :activeGroupId="activeGroupId"
                       :groupLevel="0"
                       :is-drag-enabled="isDragEnabled"
                       :active-role="activeRole"
                       :groups-type="groupsType"
                       :key="group.id"
                       @create-subgroup="createGroup"
          />
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
import GroupBlock from "./GroupBlock";
import Draggable from "vuedraggable";
import gear from "@/assets/vue-svg/gear.svg";
import pen from "@/assets/vue-svg/pen.svg";
import search_large from "@/assets/vue-svg/search-large.svg"
import { filterListRecursively } from '@/tools/tools';

export default {
  name: 'groups-list',
  props: {
    value: String,
    isMobileGroupsDrag: Boolean,
    filters: Object,
  },
  components: {
    GroupBlock,
    Draggable,
    'search_large': search_large,
    'gear': gear,
    'pen': pen,
  },
  data() {
    return {
      searchString: '',
      isMobile: false,
    }
  },
  computed: {
    groupsType: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    filtersInactiveGroups: {
      get() {
        return this.filters.inactiveGroups;
      },
      set(value) {
        this.$emit('change-filters', {
          ...this.filters,
          inactiveGroups: value,
        });
      },
    },
    filtersEmptyGroups: {
      get() {
        return this.filters.emptyGroups;
      },
      set(value) {
        this.$emit('change-filters', {
          ...this.filters,
          emptyGroups: value,
        });
      },
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    activeGroupId() {
      let rawId = this.$route.query.group;
      return rawId && parseInt(rawId);
    },
    activeRole() {
      return this.$route.query.role;
    },
    filteredGroups() {
      return filterListRecursively(this.groups, this.searchRule);
    },
    groupsForDragging: {
      get() {
        return this.filteredGroups;
      },
      set(value) {
        this.$store.dispatch('groups/editGroupsOrder', {data: value.map(group => group.id)});
      },
    },
    editPermission() {
      return this.userPermissions.group.operator.edit || this.userPermissions.group.main.edit;
    },
    isDragPermitted() {
      return this.$store.state.auth.user.role.code === 'ROLE_SUPERADMIN';
    },
    isDragEnabled() {
      return this.isDragPermitted && (!this.isMobile || this.isMobileGroupsDrag);
    },
  },
  watch: {
    userPermissions: function (newPermissions) {
      if (!newPermissions.group.main.view && newPermissions.group.operator.view) this.groupsType = 'operator';
    }
  },
  created() {
    if (!this.userPermissions.group.main.view && this.userPermissions.group.operator.view) this.groupsType = 'operator';
  },
  mounted() {
    this.$nextTick(() => this.resizeWindow());
    this.$root.$on('resize', this.resizeWindow);
  },
  beforeDestroy() {
    this.$root.$off('resize', this.resizeWindow);
  },
  methods: {
    setGroupsType(type) {
      this.groupsType = type;
    },
    searchRule(group) {
      return ((group.type !== 'office') || (group.sub_type === this.groupsType))
          && (group.title?.toLowerCase().includes(this.searchString?.toLowerCase()))
          && (this.filters.inactiveGroups || !group.deactivate_at)
          && (this.filters.emptyGroups || (this.groupsType === 'model' ? group.has_user_types?.main : group.has_user_types?.operator) || group.deactivate_at);
    },
    createGroup(parentGroup) {
      this.$emit('create', parentGroup);
    },
    toggleInactiveGroupsVisibility() {
      this.$emit('toggle-inactive-groups-visibility');
    },
    resizeWindow(windowWidth = window.innerWidth) {
      this.isMobile = windowWidth < 992;
    },
    toggleMobileDrag() {
      this.$emit('toggle-mobile-drag');
    },
  }
}
</script>