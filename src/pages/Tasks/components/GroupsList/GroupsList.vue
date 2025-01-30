<template>
  <form class="groups_list" @submit="closeDrover">
    <div class="response-title">
      <b-button class="response-title-submit-button" size="sm" variant="outline-info" type="submit">Выбрать</b-button>
    </div>
    <div class="response-link groups_list-link" @click="closeDrover">
      &lt; {{ task.title }}
    </div>
    <div class="groups_list-search">
      <b-input-group>
        <b-input-group-text slot="append"><i class="fa fa-search"/></b-input-group-text>
        <b-form-input type="text" placeholder="Поиск" v-model="selectedGroup"></b-form-input>
      </b-input-group>
    </div>
    <div class="groups_list-list">
      <!--<group-select
          v-model="filteredGroups"
          :groups-list-only="true"
          :hide-checkboxes="true"
          :set-office-checkboxes="true"
          :group-id="groupId"
          :response-id="responseId"
          :previousId="previousGroup && previousGroup.id"
          @new-group-id="setNewGroupId"
      />-->
      <group-list-select-item
          v-for="(group, key) in filteredGroups"
          :group="group"
          :key="key"
          :group-id="groupId"
          parentTitle=""
          :chosenGroup="chosenGroup && chosenGroup.id"
          @newGroupId="setNewGroupId"
      />
    </div>
  </form>
</template>
<script>
import GroupSelect from '../GroupsSelect/GroupsSelect';
import GroupListSelectItem from "../GroupsList/GroupListSelectItem";
import {filterListRecursively} from '@/tools/tools';

export default {
  name: 'groups-list',
  components: {
    'group-select': GroupSelect,
    'group-list-select-item': GroupListSelectItem
  },
  props: {
    task: Object,
    setOfficeCheckboxes: {
      type: Boolean,
      default: false
    },
    previousGroup: Object
  },
  data() {
    return {
      selectedGroup: '',
      groupId: this.previousGroup && this.previousGroup.id || null,
      responseId: null,
      chosenGroup: this.previousGroup
    }
  },
  computed: {
    groups() {
      return this.$store.state.dictionaries.groupsModels;
    },
    currentResponse() {
      return this.$store.state.responses.currentResponse
    },
    filteredGroups() {
      return filterListRecursively(this.groups, this.searchGroup);
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    user() {
      return this.$store.state.auth.user;
    }
  },
  watch: {
    currentResponse: function (newResponse) {
      if (newResponse.group) this.groupId = newResponse.group.id
    }
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsModels');
    this.$store.dispatch('responses/fetchCurrentResponse', this.task.response.id);
  },
  methods: {
    openTask() {
      this.$emit('open-task')
    },
    searchGroup(item) {
      return (item.title?.toLowerCase().includes(this.selectedGroup?.toLowerCase()));
    },
    closeDrover(e) {
      e && e.preventDefault();
      this.$emit('return-task-complete', this.chosenGroup);
    },
    setNewGroupId(group) {
      this.chosenGroup = group;
    }
  }
}
</script>