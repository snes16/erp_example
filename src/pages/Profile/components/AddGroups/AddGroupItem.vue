<template>
  <div class="groups_select-item">
    <div class="groups_select-item-indent" :class="`-lvl-${lvl}`">
      <div class="groups_select-item-container"
           :class="{'-no-children': lvl && !(group.children && group.children.length)}"
           @click="changeChosenGroup(group.id)"
      >
        <i v-if="group.children && group.children.length"
           class="fa fa-angle-down groups_select-item-container-arrow"
           :class="{'-active': collapseState}"
           @click.stop="changeCollapseState"
        />
        <div class="groups_select-item-container-color" :style="`background-color: ${group.color || 'red'}`"></div>
        <span class="groups_select-item-container-title">{{ group.title }}</span>
        <span v-if="group.numberOfActiveChildren && !isOnlyHomeGroup" class="groups_select-item-container-number">{{ group.numberOfActiveChildren }}</span>
        <div v-if="(((group.sub_type === 'operator') === editOperatorGroups) || userPermissions.group.operator.view) && ((group.type === 'office') || !onlyEditOffices)"
             class="groups_select-item-container-actions"
             @click.stop
        >
          <home v-if="changedMainGroup === group.id" class="fa fa-home groups_select-item-container-actions-main"/>
          <home v-else-if="!showOnly && (!onlyEditOffices || editOperatorGroups)"
             class="fa fa-home groups_select-item-container-actions-mainify"
             :class="{'-active': group.id === chosenGroup}"
             @click="updateMainGroup(group.id)"
          />
          <div v-if="editOperatorGroups && isOperator" class="abc-radio groups_select-item-container-actions-radio">
            <input :value="group.id"
                   name="input-radio"
                   type="radio"
                   :id="`group-${group.id}`"
                   required
                   :checked="changedMainGroup === group.id"
                   @change="setSingleGroup(group.id)"
            />
            <label :for="`group-${group.id}`"/>
          </div>
          <div v-else-if="isOnlyHomeGroup" class="abc-radio groups_select-item-container-actions-radio">
            <input :value="group.id"
                   name="input-radio"
                   type="radio"
                   required
                   :id="`group-${group.id}`"
                   :checked="changedMainGroup === group.id"
                   @change="setSingleGroup(group.id)"
            />
            <label :for="`group-${group.id}`"/>
          </div>
          <div v-else class="abc-checkbox groups_select-item-container-actions-checkbox">
            <input v-model="isActive"
                   type="checkbox"
                   :id="`group-${group.id}`"
                   :disabled="disableInput"
                   @change="updateActiveGroups(group)"
            />
            <label :for="`group-${group.id}`"/>
          </div>
        </div>
      </div>
    </div>
    <b-collapse v-if="group.children && group.children.length"
                v-model="collapseState"
                :id="`group-select-${group.id}`"
                class="groups_select-item-children"
    >
      <add-group-item v-for="(childGroup, key) in group.children"
                      v-if="!editOperatorGroups || (childGroup.type !== 'office') || (childGroup.sub_type === 'operator')"
                      :group="childGroup"
                      :key="childGroup.id"
                      :currentGroups="currentGroups"
                      :parentDisabled="parentDisabled || showOnly"
                      :showOnly="showOnly"
                      :ref="`children`"
                      :changedMainGroup="changedMainGroup"
                      :editOperatorGroups="editOperatorGroups"
                      :onlyEditOffices="onlyEditOffices"
                      :lvl="lvl + 1"
                      :chosenGroup="chosenGroup"
                      :is-only-home-group="isOnlyHomeGroup"
                      :is-operator="isOperator"
                      @toggleGroup="updateActiveGroups"
                      @updateMainGroup="updateMainGroup"
                      @setSingleGroup="setSingleGroup"
                      @changeChosenGroup="changeChosenGroup"
      />
    </b-collapse>
  </div>
</template>

<script>
import {filterListRecursively} from "@/tools/tools";
import home from '@/assets/vue-svg/home.svg'
export default {
  name: 'add-group-item',
  components: {
    home,
  },
  props: {
    group: Object,
    currentGroups: Array,
    parentDisabled: {
      type: Boolean,
      default: false
    },
    showOnly: Boolean,
    changedMainGroup: Number,
    editOperatorGroups: Boolean,
    onlyEditOffices: Boolean,
    lvl: {
      type: Number,
      default: 0,
    },
    chosenGroup: Number,
    isOnlyHomeGroup: Boolean,
    isOperator: Boolean,
  },
  data() {
    return {
      isActive: false,
      collapseState: false,
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    disableInput() {
      return this.showOnly || (this.changedMainGroup === this.group.id) || this.parentDisabled;
    },
  },
  watch: {
    currentGroups: function (newGroups) {
      this.isActive = newGroups.includes(this.group.id);
    },
    group: function () {
      this.isActive = this.currentGroups.includes(this.group.id);
    }
  },
  created() {
    this.$root.$on('clearFilters', this.onClearFilters);
    this.isActive = this.currentGroups.includes(this.group.id);
    this.collapseState = (this.changedMainGroup === this.group.id) || (this.group.children?.length && !!filterListRecursively(this.group.children, (group => this.changedMainGroup === group.id), true).length);
  },
  destroyed() {
    this.$root.$off('clearFilters', this.onClearFilters);
  },
  methods: {
    changeCollapseState() {
      this.$root.$emit('bv::toggle::collapse', `group-select-${this.group.id}`);
    },
    updateActiveGroups(group) {
      this.$emit('toggleGroup', group);
    },
    onClearFilters() {
      this.isActive = false;
      this.activeGroups = [];
    },
    updateMainGroup(groupId) {
      this.$emit('updateMainGroup', groupId);
    },
    setSingleGroup(id) {
      this.$emit('setSingleGroup', id);
    },
    changeChosenGroup(groupId) {
      this.$emit('changeChosenGroup', groupId);
    },
  }
}
</script>