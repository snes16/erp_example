<template>
  <div class="group_settings-responsible_users">
    <div class="theme-helper-content-main-header">
      <b-button size="sm" variant="outline-primary" class="theme-helper-content-main-header-button" @click="back">Сохранить</b-button>
    </div>
    <div class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="back">
        <i class="fa fa-angle-left"/>
        <span>{{ group.title }}</span>
      </div>
    </div>
    <div class="theme-helper-content-main-body">
      <div v-for="(title, type) in availableTaskTypes" class="row mb-3">
        <div class="col-6"><b>{{ title }}</b></div>
        <div class="col-6">
          <custom-select v-model="changedUsers[type]"
                         :options="potentialResponsibleUsersWithDefault[type] || []"
                         :loading="status === 'request'"
                         class="group_settings-responsible_users-select"
                         :class="{
                           '-default' : !changedUsers[type] || activeType === type && status === 'request',
                           '-success' : validateForm[type] === 'success',
                           '-error' : validateForm[type] === 'error'
                         }"
                         defaultText="Выберите ответственного"
                         return-whole-object
                         infinity-scroll
                         right
                         searchable-request
                         @change="changeUser(type)"
                         @getNextPage="getUsersNextPage(type)"
                         @searchList="searchUsers(type, $event)"
          >
            <template v-slot:chosen-variant="props">
              <div v-if="props.value && (props.value.uid || props.value.fullname)" class="d-flex align-items-center">
                <div v-if="props.value.id"
                     class="avatar mr-2"
                     :style="props.value.avatar ? `background-image: url(${props.value.avatar}); background-size: cover;` : ''"
                ></div>
                <span>
                  <template v-if="!props.value.uid || !props.value.fullname">{{props.value.uid || props.value.fullname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.value.uid }}</span>
                    <span>{{ props.value.fullname }}</span>
                  </template>
                </span>
              </div>
              <span v-else>{{ props.shownText }}</span>
            </template>
            <template v-slot:list-variant="props">
              <div class="group_settings-block-select-item">
                <div v-if="props.variant.id"
                     class="avatar mr-2"
                     :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"
                ></div>
                <span v-if="!props.variant.uid || !props.variant.fullname"
                      class="group_settings-block-select-item-text"
                >{{props.variant.uid || props.variant.fullname}}</span>
                <span v-else class="group_settings-block-select-item-text">
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.fullname }}</span>
                  </span>
              </div>
            </template>
          </custom-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";

export default {
  name: 'responsible-users',
  props: {
    group: Object,
  },
  components: {
    'custom-select': Select,
  },
  data() {
    return {
      changedUsers: {},
      searchStrings: {},
      validateForm: {},
      activeType: '',
    }
  },
  computed: {
    status() {
      return this.$store.state.groups.responsibleStatus;
    },
    responsibleUsers() {
      return this.$store.state.groups.responsibleUsers;
    },
    allTaskTypes() {
      return this.$store.state.dictionaries.allTaskTypes;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    availableTaskTypes() {
      if (!this.allTaskTypes) return;
      let types = {};
      for (let type in this.allTaskTypes) {
        if (['custom', 'dossier', 'restore_password', 'support'].includes(type)) continue;
        if (this.userPermissions.task[type] && this.userPermissions.task[type].view) types[type] = this.allTaskTypes[type];
      }
      return types;
    },
    potentialResponsibleUsers() {
      return this.$store.state.groups.potentialResponsibleUsers;
    },
    potentialResponsibleUsersWithDefault() {
      const modifiedUsers = {};
      for (const key in this.potentialResponsibleUsers) {
            modifiedUsers[key] = [{fullname: 'Нет ответственного', id: null}, ...this.potentialResponsibleUsers[key]];
      }
      return modifiedUsers;
    },
    potentialResponsibleUsersHeaders() {
      return this.$store.state.groups.potentialResponsibleUsersHeaders;
    },
  },
  watch: {
    responsibleUsers: function (newUsers) {
      this.changedUsers = JSON.parse(JSON.stringify(newUsers));
    },
    status: function (newStatus, prevStatus) {
      if (prevStatus === 'request') {
        switch(newStatus) {
          case '':
            this.validateForm[this.activeType] = 'success';
            break;
          case 'error':
            this.validateForm[this.activeType] = 'error';
            this.changedUsers[this.activeType] = null;
            break;
        }
      }
    }
  },
  async created() {
    await this.$store.dispatch('groups/fetchCurrentResponsibleUsers', this.group.id);
    this.validateFields();
    for (let type in this.availableTaskTypes) {
      this.getUsers(type);
    }
  },
  destroyed() {
    this.$store.dispatch('groups/clearPotentialResponsibleUsers');
  },
  methods: {
    back() {
      this.$emit('back');
    },
    changeUser(type) {
      this.activeType = type;
      this.$store.dispatch('groups/editCurrentResponsibleUsers', {
        groupId: this.group.id,
        data: {
          [type]: this.changedUsers[type]?.id,
        },
      });
    },
    getUsersNextPage(type) {
      const headers = this.potentialResponsibleUsersHeaders[type];
      if (!headers) return;
      if ((this.status === 'request') || (headers.currentPage >= headers.totalPages)) return;
      this.getUsers(type, headers.currentPage + 1);
    },
    searchUsers(type, string) {
      this.searchStrings[type] = string;
      this.getUsers(type, 1);
    },
    validateFields() {
      for (const type in this.responsibleUsers) {
        this.$set(this.validateForm, type, this.responsibleUsers[type] !== null ? 'success' : null);
      }
    },
    getUsers(type, page = 1) {
      this.$store.dispatch('groups/fetchPotentialResponsibleUsers', {
        query: {
          groups: [this.group.id],
          ['access.permissions.code']: [`task.${type}.edit`],
          is_active: true,
          page: page,
          per_page: 20,
          surname: this.searchStrings[type],
        },
        type,
      });
    },
  },
}
</script>