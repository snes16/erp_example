<template>
  <div class="dossier card">
    <div class="dossier-header">
      <h3>Досье</h3>
    </div>
    <div class="dossier-body">
      <div v-for="(parameter, key) in dossierParameters" class="dossier-body-block" :key="key">
        <div class="dossier-body-block-header" @click="clickCollapse(key)">
          <p>{{ parameter.title }}</p>
        </div>
        <b-collapse class="dossier-body-block-body" :id="'parameter_' + key">
          <tiny-mce plugins="image" v-model="parameter.value" :disabled="!editPermission" :init="tinymceInit"
                    @onChange="editParameters"/>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dossier',
  props: {
    dossier: Object,
    userId: [Number, String],
    isMyProfile: Boolean
  },
  data() {
    return {
      tinymceInit: {
        selector: 'textarea',  // change this value according to your HTML
        language: 'ru',
        toolbar: 'undo redo | fontsizeselect | bold italic underline | link image',
        plugins: 'link image',
        fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px',
        images_upload_handler: async (blobInfo, success, failure) => {
          try {
            await this.$store.dispatch('files/createFile', {file: blobInfo.blob(), context: 'profile'});
            success(this.uploadedFile.download_link);
          } catch (e) {
            failure('Ошибка');
          }
        }
      },
      dossierParameters: [],
    }
  },
  computed: {
    uploadedFile() {
      return this.$store.state.files.file;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions.model[this.isMyProfile ? 'personal' : 'profile'].dossier.edit;
    },
  },
  created() {
    this.dossierParameters = JSON.parse(JSON.stringify(this.dossier.parameters));
  },
  methods: {
    clickCollapse(key) {
      this.$root.$emit('bv::toggle::collapse', 'parameter_' + key);
    },
    editParameters() {
      this.$store.dispatch('profile/editDossier', {id: this.dossier.id, parameters: this.dossierParameters});
    },
  }
}
</script>