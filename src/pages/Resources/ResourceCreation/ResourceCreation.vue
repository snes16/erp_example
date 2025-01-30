<template>
  <form class="resource_creation"
        @submit.prevent="!resourceData.id ? addResources(resourceData) : deleteResources(resourceData)">
    <div class="theme-helper-content-main-header">
      <b-button v-if="editPermission" type="submit" size="sm" variant="outline-primary">
        {{ !resourceData.id ? 'Добавить ресурс' : 'Удалить ресурс' }}
      </b-button>
    </div>
    <div class="theme-helper-content-main-body resource_creation-body">
      <div class="resource_creation-body-main">
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Логотип</b>
          </div>
          <div class="col-7">
            <avatar-upload v-if="editPermission"
                           v-model="logo"
                           size="-lg"
                           altPlaceholder
                           useClipper
                           context="resource"
                           @change="changeResources"
            />
            <div v-else-if="resourceData.logotype" class="avatar -md -alt"
                 :style="`background-image: url(${getSmallImage(resourceData.logotype)}); background-size: cover;`"/>
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Название</b>
          </div>
          <div class="col-7">
            <input v-model="resourceData.title"
                   class="resource_creation-table-row_title-input"
                   type="text"
                   placeholder="Введите название"
                   :class="editPermission ? '-editable_fields' : ''"
                   :disabled="!editPermission"
                   required
                   @blur="changeResources(resourceData)"
                   @input="inputField('title')"
            />
          </div>
        </div>
        <div class="row align-items-center pb-2 mb-2 border-bottom">
          <div class="col-5">
            <b>Краткое наименование</b>
          </div>
          <div class="col-7">
            <input v-model="resourceData.short_title"
                   class="resource_creation-table-row_title-input"
                   type="text"
                   placeholder="Введите название"
                   :class="editPermission ? '-editable_fields' : ''"
                   :disabled="!editPermission"
                   required
                   @blur="changeResources(resourceData)"
                   @input="inputField('short_title')"
            />
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Ссылка</b>
          </div>
          <div class="col-7">
            <input v-model="resourceData.link"
                   class="resource_creation-table-row_title-input"
                   type="text"
                   placeholder="Введите ссылку"
                   :class="editPermission ? '-editable_fields' : ''"
                   :disabled="!editPermission"
                   required
                   @blur="changeResources(resourceData)"
                   @input="inputField('link')"
            />
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Тип ресурса</b>
          </div>
          <div class="col-7">
            <custom-select v-model="resourceData.type"
                           class="resource_creation-table-values-type ml-3"
                           valueField="value"
                           titleField="title"
                           defaultText="Выберите ресурс"
                           :options="resourceArray"
                           :disabled="!editPermission"
                           required
                           @change="changeResources(resourceData)"
            />
          </div>
        </div>
      </div>
      <div v-if="resourceData.type === 'webcam'" class="resource_creation-body-webcam">
        <p class="resource_creation-webcam_info">
          Для ресурсов, которые выполняют расчеты в собственной валюте,
          необходимо указывать коэффициент приведения валюты сервиса к доллару США.
          Приведение валюты ресурса к доллару США выполняется умножением валюты
          ресурса на значение коэффициента.
        </p>
        <div class="row align-items-center mb-3">
          <div class="col-5">
            <b>Коэффициент</b>
          </div>
          <div class="col-7">
            <input v-model="resourceData.factor"
                   class="resource_creation-table-values-coef"
                   type="number"
                   step="0.01"
                   placeholder="Введите значение"
                   :disabled="!editPermission"
                   @blur="changeResources(resourceData)"
            />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload";
import Vue from 'vue';
import Select from "@/components/Common/Select/Select";
import {mapState, mapActions} from 'vuex';
import {getSmallImage, removeQuery} from "@/tools/tools";

export default {
  name: 'resource-creation',
  components: {
    'custom-select': Select,
    'avatar-upload': AvatarUpload,
  },
  props: {
    resource: Object,
  },
  data() {
    return {
      resourceData: {
        title: '',
        type: 'webcam',
        link: '',
        factor: null,
        logotype: '',
      },
      resourceArray: [
        {value: 'webcam', title: 'Webcam'},
        {value: 'social', title: 'Социальная сеть'},
        {value: 'room', title: 'Сервис'},
        {value: 'hr', title: 'HR'},
      ],
      formStatus: {},
      logo: null,
    };
  },
  computed: {
    ...mapState('layout', ['navbarColorName', 'sidebarColorName', 'helperOpened']),
    directoryStatus() {
      return this.$store.state.directory.directoryStatus;
    },
    requestError() {
      return this.$store.state.directory.error;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.admin.resource.edit;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
  },
  watch: {
    directoryStatus: function (newStatus) {
      if (newStatus === 'error') {
        this.requestError.violations && this.requestError.violations.map(error => {
          Vue.set(this.formStatus, error.propertyPath, false);
        });
      }
    },
    resource: function (newResource) {
      if (newResource) this.resourceData = {...newResource};
    },
  },
  created() {
    if (this.resource) {
      this.resourceData = {...this.resource};
      if (this.resource.logotype) this.logo = {
        id: null,
        url: this.resource.logotype
      }
    }
  },
  methods: {
    ...mapActions('layout', ['changeTheme', 'updateLayoutComponentType', 'updateLayoutComponentColor', 'toggleHelper', 'blackoutScreen']),
    ...mapActions('directory', ['addResource', 'changeResource', 'deleteResource']),
    addResources() {
      if (this.directoryStatus === 'creating') return;
      let type = this.resourceData.type;
      if (type === 'социальная сеть') type = 'social';
      else if (type === 'HR') type = 'hr';
      else if (type === 'сервис') type = 'room';
      this.addResource({
        creds: {
          ...this.resourceData,
          type,
          factor: Number(this.resourceData.factor),
          logotype: removeQuery(this.logo?.url),
          credentials: undefined,
        }
      });
    },
    changeResources(resource = this.resourceData) {
      if (resource.id) this.changeResource({
        creds: {
          ...resource,
          factor: Number(resource.factor),
          logotype: removeQuery(this.logo?.url),
          credentials: undefined,
        }
      })
    },
    deleteResources(resource) {
      this.deleteResource({creds: {resource}});
      this.toggleHelper(false);
    },
    inputField(field) {
      Vue.set(this.formStatus, field, true);
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
  }
};
</script>