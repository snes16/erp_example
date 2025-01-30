<template>
  <div class="communication_create">
    <div class="communication_create-header theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" @click="createCommunication">Добавить способ коммуникации</b-button>
    </div>
    <div class="communication_create-body theme-helper-content-main-body">
      <div class="row align-items-center mb-3">
        <div class="col-5 mr-3">
          <b>Логотип</b>
        </div>
        <div class="col-6">
          <avatar-upload v-model="communication.logo"
                         useClipper
                         altPlaceholder
                         context="communication"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-5">
          <b>Название</b>
        </div>
        <div class="col-7">
          <input v-model="communication.title"
                 class="communication_create-body-input"
                 :class="[fieldsStatuses.title ? '' : '-error', '-edit']"
                 placeholder="Введите название"
                 @input="inputTitle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload";
import {removeQuery} from "@/tools/tools";

export default {
  name: 'communication-create',
  components: {
    'avatar-upload': AvatarUpload,
  },
  data() {
    return {
      communication: {},
      fieldsStatuses: {
        title: true,
        logo: true,
      },
    };
  },
  computed: {
    status() {
      return this.$store.state.communications.status;
    },
  },
  methods: {
    createCommunication() {
      if (this.status === 'creating') return;
      if (!this.communication.title) return Vue.set(this.fieldsStatuses, 'title', false);
      this.$store.dispatch('communications/createCommunication', {
        ...this.communication,
        logo: removeQuery(this.communication.logo?.url),
      });
    },
    inputTitle() {
      Vue.set(this.fieldsStatuses, 'title', true);
    },
  }
}
</script>