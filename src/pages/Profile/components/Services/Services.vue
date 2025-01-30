<template>
  <div class="services card">
    <div class="services-header">
      <div class="services-header-main">
        <h3>Сервисы</h3>
        <div v-if="userPermissions.model_credential.request" class="btn-add" @click="addService"></div>
      </div>
      <div class="services-header-filters">
        <b-button size="sm"
                  variant="default"
                  class="btn-tab"
                  :class="{active: showActiveServices}"
                  @click="setStatusFilter(true)"
        >Активные {{ activeServices.length }}</b-button>
        <b-button size="sm"
                  variant="default"
                  class="btn-tab"
                  :class="{active: !showActiveServices}"
                  @click="setStatusFilter(false)"
        >Неактивные {{ inactiveServices.length }}</b-button>
      </div>
    </div>
    <div class="services-list">
      <div class="services-list-content">
        <div class="services-list-row -head">
          <div class="services-list-row-cell -service">Сервис</div>
          <div class="services-list-row-cell -login">Логин</div>
          <div class="services-list-row-cell -screenname">Скриннейм</div>
          <div class="services-list-row-cell -password">Пароль</div>
          <div class="services-list-row-cell -status">Статус</div>
          <div class="services-list-row-cell -copy">
            <copy class="services-list-row-cell-copy" v-b-tooltip.hover title="Скопировать данные всех аккаунтов" @click.stop="copyAllCredentials" />
          </div>
        </div>
        <div v-for="service in shownServices"
             class="services-list-row"
             :key="service.id"
             @click="editService(service)"
        >
          <div class="services-list-row-cell -service">
            <div class="avatar -sm -alt mr-2"
                 :style="service.resource.logotype ? `background-image: url(${service.resource.logotype}); background-size: cover;` : ''"
            />
            <span>{{ service.resource.title }}</span>
          </div>
          <div class="services-list-row-cell -login">{{ service.login }}</div>
          <div class="services-list-row-cell -screenname">{{ service.model_screen_name }}</div>
          <div class="services-list-row-cell -password">********</div>
          <div class="services-list-row-cell -status">
            <span class="services-list-row-cell-status"
                  :class="service.status === 'active' ? '-active' : '-inactive'"
            >{{ shownStatusesNames[service.status] }}</span>
          </div>
          <div class="services-list-row-cell -copy">
            <copy class="services-list-row-cell-copy" v-b-tooltip.hover title="Скопировать данные" @click.stop="copySingleAccount(service)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import copy from "@/assets/vue-svg/copy-transparent.svg";
import { clipboard, showToast } from "@/tools/tools";

export default {
  name: 'services',
  props: {
    services: Array,
    userId: [Number, String],
    userPermissions: Object,
    isMyProfile: Boolean,
  },
  components: {
    'copy': copy,
  },
  data() {
    return {
      showActiveServices: true,
    }
  },
  computed: {
    serviceStatuses() {
      return this.$store.state.dictionaries.profileCredentialStatuses;
    },
    shownStatusesNames() {
      return {
        ...this.serviceStatuses,
        'unimprovable': 'Требует доработки',
      }
    },
    filteredServices() {
      return this.services?.filter(service => !service.is_deleted) || [];
    },
    activeServices() {
      return this.filteredServices.filter(service => service.status === 'active');
    },
    inactiveServices() {
      return this.filteredServices.filter(service => service.status !== 'active');
    },
    shownServices() {
      return this.showActiveServices ? this.activeServices : this.inactiveServices;
    },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchCredentialBlockingReasons');
    this.$store.dispatch('dictionaries/fetchProfileCredentialStatuses');
  },
  methods: {
    addService() {
      this.$emit('addServices');
    },
    editService(service) {
      this.$emit('editService', service.id);
    },
    setStatusFilter(status) {
      this.showActiveServices = status;
    },
    copyAllCredentials() {
      clipboard(this.shownServices.reduce((result, account, key) => `${result}${key === 0 ? '' : '\n\n'}${account.resource.link}\n${account.login}\n${account.password}`, ''), this.copyCredentialsSuccess);
    },
    copySingleAccount(account) {
      clipboard(`${account.resource.link}\n${account.login}\n${account.password}`, this.copyCredentialsSuccess);
    },
    copyCredentialsSuccess() {
      showToast(this.$toasted, 'Данные скопированы');
    },
  }
}
</script>