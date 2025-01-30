<template>
  <div class="group_parameters">
    <p class="resources-breadcrumbs">
      <router-link class="resources-breadcrumbs-link" to="/app/templates">Шаблоны</router-link>
      <span class="ml-1">> Шаблон анкеты для заявки</span>
    </p>
    <div class="group_parameters-header">
      <p class="group_parameters-header-title">Шаблон анкеты для заявки</p>
      <b-button v-if="editPermission"
                variant="outline-info"
                @click="openGroupParameter(emptyGroupParameter)">
        Добавить группу параметров
      </b-button>
    </div>
    <div class="group_parameters-tab_field">
      <div class="group_parameters-tab_field-header">ГРУППА ПАРАМЕТРОВ</div>
      <div
          class="group_parameters-tab_field-tab"
          v-for="(groupParameter, index) in groupParameterFiltred"
          :key="index"
          @click="openGroupParameter(groupParameter)"
      >
        <p class="group_parameters-tab_field-tab-title">{{ groupParameter.title }}</p>
        <div v-if="editPermission" class="group_parameters-tab_fieldr-tab-delete glyphicon-trash_alt"
             @click.stop="deleteGroupParameters(groupParameter)"/>
      </div>
    </div>
    <helper>
      <GroupParametersCreation v-if="droverType === 'groupParameterHelper'"
                               :group-parameter-prop="openedParameter"
                               :permission="editPermission"
                               :newGroup="newGroup"
                               @open-settings="changeSlot"
                               @close="closeDrover"
      />
      <AddRoles v-else-if="droverType === 'accessSettingsHelper'"
                :access-prop="openedParameter"
                :newGroupRoles="newGroup.roles"
                @group-parameter="changeSlotParameter"
      />
    </helper>
  </div>
</template>
<script>
import Vue from 'vue';
import Helper from '@/components/Helper/Helper';
import GroupParametersCreation from '@/pages/GroupParameters/GroupParametersCreation/GroupParametersCreation';
import AddRoles from '@/pages/GroupParameters/AddRoles/AddRoles';
import {mapState, mapActions, mapGetters} from 'vuex';
import { showToast } from "@/tools/tools";

export default {
  name: 'group_parameters',
  components: {Helper, GroupParametersCreation, AddRoles},
  data() {
    return {
      droverType: '',
      accessSettings: {},
      openedParameterId: null,
      emptyGroupParameter: {id: null, title: '', parameters: [], roles: []},
      newGroup: {
        roles: [],
        parameters: []
      }
    }
  },
  computed: {
    ...mapState('groupparameters', ['groupParameters', 'groupParameter', 'groupParametersStatus']),
    ...mapGetters('groupparameters', ['groupParameterFiltred']),
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    openedParameter() {
      return this.groupParameters.find(parameter => parameter.id === this.openedParameterId) || {
        parameters: [],
        roles: []
      };
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.admin.response.edit;
    }
  },
  watch: {
    groupParametersStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        if (prevStatus === 'deleting') showToast(this.$toasted, 'Шаблон удалён');
        else if (prevStatus === 'creating') {
          showToast(this.$toasted, 'Шаблон создан');
          this.closeDrover();
        }
      }
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.newGroup = {
          roles: [],
          parameters: []
        };
      }
    }
  },
  created() {
    this.fetchGroupParameters();
  },
  methods: {
    ...mapActions('groupparameters', ['fetchGroupParameters', 'deleteGroupParameter', 'changeGroupParameter', 'changeGroupParameterStatus']),
    deleteGroupParameters(groupParameter) {
      this.$bvModal.msgBoxConfirm('Вы больше не будете заполнять эти параметры при создании анкеты. Заполненные по этим параметрам поля в существующих анкетах не удалятся.', {
        title: 'Удалить группу параметров «' + (groupParameter.title) + '»?',
        okTitle: 'Удалить',
        cancelTitle: 'Отменить',
        okVariant: 'danger',
        cancelVariant: 'outline-primary',
        centered: true,
        titleClass: 'font-weight-bold',
        headerClass: 'p-3',
        bodyClass: 'p-2-2 text-dark text-left bg-white',
        size: 'md'
      }).then(value => {
        if (value) {
          this.deleteGroupParameter(groupParameter);
          this.openedParameterId = groupParameter.id;
        }
      })
    },
    openGroupParameter(groupParameter) {
      this.$store.dispatch('layout/toggleHelper', true);
      this.openedParameterId = groupParameter.id;
      this.droverType = "groupParameterHelper"
    },
    changeSlot(groupParameters) {
      this.newGroup = groupParameters;
      this.droverType = "accessSettingsHelper";
    },
    changeSlotParameter(roles) {
      this.droverType = "groupParameterHelper";
      Vue.set(this.newGroup, 'roles', roles);
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
  },
};
</script>

<style src="./GroupParameters.scss" lang="scss" scoped/>
