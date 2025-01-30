<template>
  <div>
    <div class="groups-nav-header">
      <div class="groups-nav-header-main">
        <h3 class="mb-0">Изменение порядка групп</h3>
      </div>
    </div>
    <div class="groups-nav-list -for_drag">
      <draggable v-model="groupsForDragging"
                 group="groups-parent-none"
                 :preventOnFilter="false"
                 :forceFallback="true"
                 :delay="1000"
      >
        <group-block v-for="group in groupsForDragging"
                     :group="group"
                     :activeGroupId="activeGroupId"
                     :groupLevel="0"
                     :groups-type="groupsType"
                     :key="group.id"
                     for-drag
        />
      </draggable>
    </div>
    <div class="groups-nav-edit_header">
      <b-button variant="outline-primary" size="sm" @click="toggleMobileDrag">Сохранить</b-button>
      <div class="helper-close" @click="toggleMobileDrag"/>
    </div>
  </div>
</template>

<script>
import GroupBlock from "./GroupBlock";
import Draggable from "vuedraggable";
import pen from "@/assets/vue-svg/pen.svg";
import { findInListRecursively } from '@/tools/tools';

export default {
  name: 'groups-list-for-mobile-drag',
  props: {
    groupsType: String,
    filters: Object,
    isMobileGroupsDrag: Boolean,
  },
  components: {
    GroupBlock,
    Draggable,
    'pen': pen,
  },
  data() {
    return {
    }
  },
  computed: {
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
    activeGroupParent() {
      if (!this.activeGroupId) return null;
      return findInListRecursively(this.groups, group => group.children.some(child => child.id === this.activeGroupId));
    },
    shownGroups() {
      if (!this.activeGroupParent) return this.groups;
      return this.activeGroupParent.children;
    },
    filteredGroups() {
      return this.shownGroups.filter(this.searchRule);
    },
    groupsForDragging: {
      get() {
        return this.filteredGroups;
      },
      set(value) {
        this.$store.dispatch('groups/editGroupsOrder', {
          data: value.map(group => group.id),
          query: {
            parent: this.activeGroupParent?.id,
          },
          parentId: this.activeGroupParent?.parent ? parseInt(this.activeGroupParent.parent.replace('/groups/', '')) : null,
        });
      },
    },
    editPermission() {
      return this.userPermissions.group.operator.edit || this.userPermissions.group.main.edit;
    },
  },
  methods: {
    searchRule(group) {
      return ((group.type !== 'office') || (group.sub_type === this.groupsType))
          && (this.filters.inactiveGroups || !group.deactivate_at)
          && (this.filters.emptyGroups || (this.groupsType === 'model' ? group.has_user_types?.main : group.has_user_types?.operator));
    },
    toggleMobileDrag() {
      this.$emit('toggle-mobile-drag');
    },
  }
}
</script>