<template>
  <div class="communication_create">
    <div class="communication_create-header theme-helper-content-main-header">
      <b-button v-if="userPermissions.admin.communication.edit"
                variant="outline-danger"
                size="sm"
                @click="deleteCommunication"
      >Удалить способ коммуникации</b-button>
    </div>
    <div class="communication_create-body theme-helper-content-main-body">
      <div class="row align-items-center mb-3">
        <div class="col-5">
          <b>Логотип</b>
        </div>
        <div class="col-6">
          <avatar-upload v-if="userPermissions.admin.communication.edit"
                         v-model="logo"
                         altPlaceholder
                         useClipper
                         context="communication"
                         @change="editCommunication"
          />
          <div v-else-if="communication.logo" class="avatar -md"
               :style="`background-image: url(${smallLogo}); background-size: cover;`"/>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-5">
          <b>Название</b>
        </div>
        <div class="col-7">
          <input v-model="title"
                 class="communication_create-body-input"
                 placeholder="Введите название"
                 :disabled="!userPermissions.admin.communication.edit"
                 @change="editCommunication"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-5">
          <b>Количество контактов</b>
        </div>
        <div class="col-7">
          <span class="ml-3">{{ communication.count_task }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload";
import {getSmallImage, removeQuery} from "@/tools/tools";

export default {
  name: 'communication-details',
  props: {
    communication: Object,
  },
  components: {
    'avatar-upload': AvatarUpload,
  },
  data() {
    return {
      logo: {
        id: null,
        url: this.communication.logo,
      },
      title: this.communication.title,
    };
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    smallLogo() {
      return getSmallImage(this.communication.logo);
    },
  },
  methods: {
    deleteCommunication() {
      this.$emit('delete');
    },
    editCommunication() {
      this.$store.dispatch('communications/editCommunication', {
        id: this.communication.id,
        logo: removeQuery(this.logo.url),
        title: this.title,
      });
    },
  }
}
</script>