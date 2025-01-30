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
        <div class="abc-checkbox groups_select-item-container-checkbox ml-auto">
          <input type="checkbox" v-model="isActive" :id="`group-${group.id}`" @change="updateActiveGroups"/>
          <label :for="`group-${group.id}`"/>
        </div>
      </div>
    </div>
    <b-collapse v-if="group.children && group.children.length"
                v-model="collapseState"
                :id="`group-select-${group.id}`"
                class="groups_select-item-children"
    >
      <group-select-item v-for="(childGroup, key) in group.children"
                         v-model="activeGroups[key]"
                         :group="childGroup"
                         :key="key"
                         :lvl="lvl + 1"
                         @input="updateActiveGroups"
      />
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'group-select-item',
  props: {
    group: Object,
    lvl: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isActive: false,
      activeGroups: [],
      collapseState: false,
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
    changeCollapseState() {
      this.$root.$emit('bv::toggle::collapse', `group-select-${this.group.id}`);
    },
  }
}
</script>