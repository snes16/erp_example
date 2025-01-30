<template>
  <div class="groups_select-item">
    <div class="groups_select-item-indent -clickable" :class="`-lvl-${lvl}`" @click="selectGroup(group, $event)">
      <div class="groups_select-item-container" :class="{'-no-children': lvl && !(group.children && group.children.length)}">
        <i v-if="group.children && group.children.length"
           class="fa fa-angle-down groups_select-item-container-arrow"
           :class="{'-active': collapseState}"
           @click.stop="changeCollapseState"
        />
        <div class="groups_select-item-container-color" :style="`background-color: ${group.color || 'red'}`"></div>
        <span class="groups_select-item-container-title">{{ group.title }}</span>
      </div>
    </div>
    <b-collapse v-if="group.children && group.children.length"
                v-model="collapseState"
                :id="`group-select-${group.id}`"
                class="groups_select-item-children"
    >
      <group-select-item v-for="childGroup in group.children"
                         v-model="activeGroup"
                         :group="childGroup"
                         :parent="group"
                         :lvl="lvl + 1"
                         :disable-rule="disableRule"
                         :default-collapse="defaultCollapse"
      />
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'group-select-item',
  props: {
    group: Object,
    value: Object,
    parent: Object,
    lvl: Number,
    disableRule: Function,
    defaultCollapse: Boolean,
  },
  data() {
    return {
      collapseState: this.defaultCollapse,
    }
  },
  computed: {
    activeGroup: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
        this.$emit('change', value);
      },
    },
    isVariantDisabled() {
      return !this.disableRule(this.group);
    },
  },
  methods: {
    changeCollapseState() {
      this.$root.$emit('bv::toggle::collapse', `group-select-${this.group.id}`);
    },
    selectGroup(group, e) {
      if (this.isVariantDisabled) return e.stopPropagation();
      this.activeGroup = (group.type === 'office') && !group.city ? {...group, city: this.parent} : group;
    },
  },
}
</script>