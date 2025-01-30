<template>
  <div class="groups_select-item">
    <div class="groups_select-item-indent" :class="`-lvl-${lvl}`">
      <div class="groups_select-item-container" :class="{'-no-children': lvl && !(group.children && group.children.length)}">
        <i v-if="group.children && group.children.length"
           class="fa fa-angle-down groups_select-item-container-arrow"
           :class="{'-active': collapseState}"
           @click.stop="changeCollapseState"
        />
        <div class="groups_select-item-container-color" :style="`background-color: ${group.color || 'red'}`"></div>
        <span class="groups_select-item-container-title">{{ group.title }}</span>
        <div class="d-flex align-items-center groups_select-item-container-actions">
          <i v-if="chosenGroup === group.id" class="groups_select-item-container-actions-main fa fa-home"/>
          <div v-if="group.type === 'office'" class="abc-checkbox-circle groups_select-item-container-actions-radio">
            <input v-model="selectedGroup"
                   :value="group.id"
                   name="input-radio"
                   type="radio"
                   :id="`group-${group.id}`"
                   required
                   @change="editGroupId(group)"
            />
            <label :for="`group-${group.id}`"/>
          </div>
        </div>
      </div>
    </div>
    <b-collapse v-if="group.children && group.children.length"
                v-model="collapseState"
                :id="`group-list-${group.id}`"
                class="groups_select-item-children"
    >
      <group-list-select-item
          v-for="(childGroup, key) in group.children"
          :group="childGroup"
          :key="key"
          :group-id="groupId"
          :parentTitle="group.title"
          :chosenGroup="chosenGroup"
          :lvl="lvl + 1"
          @input="updateActiveGroups"
          @newGroupId="processEvent"
      />
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'group-list-select-item',
  props: {
    groupId: Number,
    group: Object,
    hideCheckBoxes: {
      type: Boolean,
      default: false
    },
    parentTitle: String,
    chosenGroup: Number,
    lvl: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isActive: false,
      selectedGroup: this.groupId,
      officeGroup: {},
      collapseState: false,
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    }
  },
  watch: {
    groupId: function (newId) {
      this.selectedGroup = newId
    }
  },
  created() {
    this.$root.$on('clearFilters', this.onClearFilters);
  },
  destroyed() {
    this.$root.$off('clearFilters', this.onClearFilters);
  },
  methods: {
    updateActiveGroups() {
      let groups = this.activeGroups && this.activeGroups.length ? [...this.activeGroups] : [];
      if (this.isActive) groups.push({id: this.group.id, title: this.group.title});
      this.$emit('input', groups);
    },
    onClearFilters() {
      this.isActive = false;
      this.activeGroups = [];
    },
    editGroupId(group) {
      this.$emit('newGroupId', {...group, parent: this.parentTitle});
    },
    processEvent(group) {
      this.$emit('newGroupId', group);
    },
    changeCollapseState() {
      this.$root.$emit('bv::toggle::collapse', `group-list-${this.group.id}`);
    },
  }
}
</script>