<template>
  <div v-if="group" class="groups-main-title card">
    <div class="groups-main-title-info">
      <div class="groups-main-title-info-top">
        <i v-if="group.type === 'country'"
           class="flag-icon groups-main-title-info-top-flag mr-2"
           :class="`flag-icon-${group.settings && group.settings.flag || 'default'}`"
        />
        <i v-else class="color_picker-dot d-block mr-2" :style="`background-color: ${group.color}`"/>
        <template v-if="isTitleEditable">
          <input v-model="title"
                 id="title"
                 class="input-plain groups-main-title-info-top-input"
                 v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 4}"
                 @change="changeGroupTitle"
          />
          <div v-if="group.deactivate_at">
            <deactivation :id="`deactivated-${group.id}`"/>
            <b-tooltip :target="`deactivated-${group.id}`" triggers="hover">
              <div class="profile-main-info-data-resign-tooltip" >
                <div class="pt-1">{{group.type === 'country' ? 'Страна деактивирована' : group.type === 'city' ? 'Город деактивирован' : group.type === 'office' ? 'Офис деактивирован' : ''}}</div>
                <div class="pb-1"><b>Дата деактивации: </b>{{ deactivateDate }}</div>
              </div>
            </b-tooltip>
          </div>
          <div v-if="isTitleEditable">
            <label for="title" class="groups-main-title-info-top-edit" :class="group.deactivate_at ? 'ml-2': ''"><pen /></label>
          </div>
        </template>
        <h3 v-else class="mb-0">{{ group.title }}</h3>
      </div>
      <p class="mb-0">{{ groupBottomText }}</p>
    </div>
    <div class="groups-main-title-actions">
      <b-button v-if="group.type && editPermission"
                variant="outline-primary"
                id="show-settings"
                @click="onClickSettings"
      >Настройки</b-button>
      <b-button v-if="!group.is_system && editPermission"
                variant="outline-danger"
                id="remove-group"
                @click="onClickDelete"
      >Удалить группу</b-button>
    </div>
  </div>
  <div v-else class="groups-main-title card">
    <h3>Instudio</h3>
    <p class="mb-0">Все сотрудники основной системы</p>
  </div>
</template>

<script>
import moment from "moment";
import pen from "@/assets/vue-svg/pen.svg";
import deactivation from "@/assets/vue-svg/deactivation.svg";

export default {
  name: 'groups-title',
  props: {
    group: Object,
  },
  components: {
    'deactivation': deactivation,
    'pen': pen,
  },
  data() {
    return {
      title: '',
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    groupTypes() {
      return this.$store.state.groups.groupTypes;
    },
    editPermission() {
      return this.group.sub_type === 'operator' ? this.userPermissions.group.operator.edit : this.userPermissions.group.main.edit;
    },
    isTitleEditable() {
      return this.group && !this.group.is_system && this.editPermission;
    },
    deactivateDate() {
      return this.group?.deactivate_at && moment(this.group.deactivate_at).format('DD.MM.YYYY');
    },
    groupBottomText() {
      if (!this.group) return '';
      return this.group.is_system ? 'Системная' : this.groupTypes[this.group.type];
    },
  },
  watch: {
    group: function (newGroup) {
      this.title = newGroup?.title || '';
    },
  },
  created() {
    if (this.group) this.title = this.group.title;
  },
  methods: {
    changeGroupTitle() {
      this.$store.dispatch('groups/editGroup', {id: this.group.id, title: this.title});
    },
    onClickSettings() {
      this.$emit('settings');
    },
    onClickDelete() {
      this.$emit('delete');
    },
  },
}
</script>