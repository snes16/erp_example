<template>
  <div v-if="!group.is_deleted"
       class="groups-nav-list-group"
       :class="group.id === activeGroupId ? '-active' : ''"
  >
    <div class="groups-nav-list-group-container">
      <component :is="forDrag ? 'div' : 'router-link'"
                 :to="groupLink"
                 class="groups-nav-list-group-container-link"
                 :class="{'-for_drag': forDrag, '-inactive': !doesIncludeCurrentRole}"
      >
        <i v-if="group.type === 'country'"
           class="groups-nav-list-group-container-link-icon flag-icon mr-2"
           :class="`flag-icon-${group.build_group.flag || 'default'}`"
        />
        <i v-else class="groups-nav-list-group-container-link-icon color_icon mr-3" :style="`background-color: ${group.color || 'red'}`"/>
        <hamburger-arrows class="groups-nav-list-group-container-link-icon -dragging"/>
        <span class="groups-nav-list-group-container-title">{{ group.title }}</span>
        <div v-if="group.deactivate_at"
             v-b-tooltip:hover
             title="Неактивная группа"
             class="groups-nav-list-group-container-deactivated mr-1"
        >
          <circle-crossed/>
        </div>
        <div v-if="isGroupEmpty && !group.deactivate_at"
             v-b-tooltip:hover
             title="Группа без сотрудников"
             class="groups-nav-list-group-container-empty"
        >
          <folder-error/>
        </div>
      </component>
      <div v-if="!forDrag" class="groups-nav-list-group-container-actions">
        <hamburger-plus v-if="editPermission"
                        class="groups-nav-list-group-container-actions-create"
                        :class="group.children && !group.children.length ? 'mr-4' : ''"
                        @click.stop="createSubgroup(group)"
        />
        <i v-if="group.children && group.children.length"
           class="fa fa-angle-down groups-nav-list-group-container-actions-collapse"
           :class="showCollapse ? '-active' : ''"
           @click="clickCollapse"
        />
      </div>
    </div>
    <b-collapse v-if="group.children && group.children.length && !forDrag"
                class="groups-nav-list-group-children"
                :id="'group_' + group.id"
    >
      <draggable v-model="childrenForDragging"
                 :group="`groups-parent-${group.id}`"
                 :preventOnFilter="false"
                 :forceFallback="true"
                 :disabled="!isDragEnabled"
      >
        <group-block v-for="childGroup in childrenForDragging"
                     :group="childGroup"
                     :activeGroupId="activeGroupId"
                     :parent-id="group.id"
                     :key="childGroup.id"
                     :is-drag-enabled="isDragEnabled"
                     :active-role="activeRole"
                     :groups-type="groupsType"
                     @create-subgroup="createSubgroup"
        />
      </draggable>
    </b-collapse>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import hamburgerPlus from "@/assets/vue-svg/hamburger-plus.svg";
import hamburgerArrows from "@/assets/vue-svg/hamburger-arrows.svg";
import circleCrossed from "@/assets/vue-svg/circle-crossed.svg";
import folderError from "@/assets/vue-svg/folder-error.svg";

export default {
  name: 'group-block',
  props: {
    group: {
      type: Object,
      default: {},
    },
    activeGroupId: Number,
    parentId: Number,
    isDragEnabled: Boolean,
    forDrag: Boolean,
    activeRole: String,
    groupsType: String,
  },
  components: {
    Draggable,
    'hamburger-plus': hamburgerPlus,
    'hamburger-arrows': hamburgerArrows,
    'circle-crossed': circleCrossed,
    'folder-error': folderError,
  },
  data() {
    return {
      showCollapse: false
    }
  },
  computed: {
    groupLink() {
      const currentRoute = this.$route;
      return {
        ...currentRoute,
        query: {
          ...currentRoute.query,
          group: this.activeGroupId === this.group.id ? undefined : this.group.id,
        },
      };
    },
    childrenForDragging: {
      get() {
        return this.group.children;
      },
      set(value) {
        this.$store.dispatch('groups/editGroupsOrder', {
          data: value.map(group => group.id),
          query: {
            parent: this.group.id,
          },
          parentId: this.parentId,
        });
      },
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.group.operator.edit || this.userPermissions.group.main.edit;
    },
    doesIncludeCurrentRole() {
      if (!this.activeRole) return this.group.roles.length;
      return this.group.roles?.includes(this.activeRole);
    },
    isGroupEmpty() {
      return this.groupsType === 'model' ? !this.group.has_user_types?.main : !this.group.has_user_types?.operator;
    },
  },
  methods: {
    clickCollapse(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.showCollapse = !this.showCollapse;
      this.$root.$emit('bv::toggle::collapse', 'group_' + this.group.id);
    },
    createSubgroup(parentGroup) {
      this.$emit('create-subgroup', parentGroup);
    },
  }
}
</script>