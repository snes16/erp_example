<template>
  <div class="tasks_files theme-helper-content-main">
    <div v-if="!isModelPersonal" class="theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" @click="save">Сохранить</b-button>
    </div>
    <div v-if="!isModelPersonal" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="close">
        <i class="fa fa-angle-left"></i>
        <span>{{ taskTitle }}</span>
      </div>
    </div>
    <div class="tasks_files-main theme-helper-content-main-body">
      <div v-for="(album, key) in formattedAlbums" v-if="albumsLengths[key]" class="tasks_files-main-album">
        <div class="tasks_files-main-album-title">
          <h4>{{ album.title }}</h4>
          <template v-if="album && album.requiredAttachments && album.requiredAttachments.length">
            <div class="tasks_files-main-album-title-icon" :id="`tasks_files-album-title-icon-${key}`">
              <warning/>
            </div>
            <b-tooltip :target="`tasks_files-album-title-icon-${key}`" custom-class="tasks_files-main-album-title-tooltip">
              <p><b>Необходимо загрузить:</b></p>
              <ul class="tasks_files-main-album-title-tooltip-list">
                <li v-for="code in album.requiredAttachments">{{ attachments[code] }}</li>
              </ul>
            </b-tooltip>
          </template>
          <success class="tasks_files-main-album-title-success" v-else-if="album.hasRequiredAttachments"/>
        </div>
        <div class="tasks_files-main-album-files">
          <div v-for="(file) in album.attachments" class="tasks_files-main-album-files-file"
               :class="`-rows-${albumsLengths[key]}`">
            <p class="tasks_files-main-album-files-file-title">{{ attachments[file.code] }}</p>
            <div v-if="value[file.code]" class="tasks_files-main-album-files-file-image">
              <div class="materials-files-field-file-image"
                   :style="value[file.code].type.includes('image') && value[file.code].link ? `background-image: url(${value[file.code].preview_link || value[file.code].link}); background-size: cover;` : ''"
                   :class="getClassFromApplicationType(value[file.code].type)"
                   @click="openGallery(0, value[file.code], file.code)"
              >
                <!--                                <div class="materials-files-field-file-image-active">-->
                <!--                                    <div class="materials-files-field-file-image-active-remove">-->
                <!--                                        <i class="fi flaticon-remove-file" @click="removeFile(file.code)"></i>-->
                <!--                                    </div>-->
                <!--                                    <div class="materials-files-field-file-image-active-field_link">-->
                <!--                                        <a :href="value[file.code].download_link" :download="value[file.code].filename">-->
                <!--                                            <i class="fi flaticon-download-file"></i>-->
                <!--                                        </a>-->
                <!--                                    </div>-->
                <!--                                </div>-->
              </div>
            </div>
            <div v-else-if="(fileStatus === 'request') && (currentFileParams.code === file.code)"
                 class="tasks_files-main-album-files-file-throbber">
              <throbber class="throbber mt-2 mb-2 -sm"/>
            </div>
            <drop-zone v-else
                       :id="`file-${file.code}`"
                       :ref="`file-${file.code}`"
                       :useCustomSlot="true"
                       :options="{
                                        url: `#`,
                                        clickable: true,
                                        thumbnailWidth: 80,
                                        thumbnailHeight: 80,
                                        dictRemoveFile: 'Удалить файл',
                                        accept: addFileToDropzone(file.code)
                                    }"
                       :class="{'-error': errorsList.includes(file.code)}"
                       @vdropzone-success="addFile(...arguments, file.code)"
                       @vdropzone-error="onUploadError(...arguments, `file-${file.code}`)"
            >
              <div class="dropzone-custom-content">
                <p class="dropzone-custom-title">Загрузить изображение</p>
              </div>
            </drop-zone>
          </div>
        </div>
      </div>
      <div class="tasks_files-main-album">
        <div class="tasks_files-main-album-header d-flex">
          <h4>Дополнительно</h4>
          <div class="tasks_files-main-album-add">
            <input id="upload-document" class="d-none" type="file" ref="additionalInput"
                   @change="uploadAdditionalDocument" multiple/>
            <label class="btn-add ml-2 mb-0" for="upload-document"/>
          </div>
        </div>
        <div v-if="(value.additional && value.additional.length) || ((fileStatus === 'request') && (currentFileParams.code === 'additional'))"
             class="tasks_files-main-album-additional">
          <div v-for="(file,index) in value.additional" class="tasks_files-main-album-files-file-image">
            <div class="materials-files-field-file-image"
                 :style="file.type.includes('image') && file.link ? `background-image: url(${file.preview_link || file.link}); background-size: cover;` : ''"
                 :class="getClassFromApplicationType(file.type)"
                 @click="openGallery(index, value.additional)"
            >
            </div>
          </div>
          <throbber v-if="(fileStatus === 'request') && (currentFileParams.code === 'additional')"
                    class="throbber m-3 -sm"/>
        </div>
        <drop-zone v-else
                   id="file-additional"
                   ref="file-additional"
                   :useCustomSlot="true"
                   :options="{
                                        url: `#`,
                                        clickable: true,
                                        thumbnailWidth: 80,
                                        thumbnailHeight: 80,
                                        dictRemoveFile: 'Удалить файл',
                                        accept: addFileToDropzone('additional')
                                    }"
                   @vdropzone-success="addAdditionalFile"
                   @vdropzone-error="onUploadError(...arguments, 'file-additional')"
        >
          <div class="dropzone-custom-content">
            <p class="dropzone-custom-title">Загрузить изображение</p>
          </div>
        </drop-zone>
      </div>
    </div>
    <album-gallery :albumData="albumData"
                   :index="albumIndex"
                   @removeFile="removeFileFromGallery"
                   @closeGallery="closeGallery"
    />
    <b-modal id="task-avatar-crop"
             centered
             title='Загрузка изображения'
             body-bg-variant="white"
             ok-title="Загрузить"
             ok-variant="primary"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="uploadAvatar"
    >
      <p>Выбранная область будет сохранена как аватар пользователя</p>
      <clipper-basic class="my-clipper"
                     :src="rawAvatar"
                     ref="cropRef"
                     id="cropId"
                     shadow="rgba(234, 240, 246, 0.5)"
                     :wrap-ratio=2
                     :min-width=10
                     :min-height=10
                     :init-width=50
                     :init-height=100
      >
        <div class="placeholder" slot="placeholder">No image</div>
      </clipper-basic>
    </b-modal>
  </div>
</template>

<script>
import vueDropzone from 'vue2-dropzone';
import {clipperBasic} from 'vuejs-clipper';
import AlbumGallery from "@/components/Common/AlbumGallery/AlbumGallery";
import throbber from "@/assets/vue-svg/throbber.svg";
import success from "@/assets/vue-svg/success.svg";
import warning from "@/assets/vue-svg/warning.svg";
import {closeToast} from "@/tools/tools";

export default {
  name: 'files-upload',
  props: {
    value: Object,
    albums: Array,
    taskTitle: String,
    isModelPersonal: Boolean,
  },
  components: {
    AlbumGallery,
    'drop-zone': vueDropzone,
    'clipper-basic': clipperBasic,
    'throbber': throbber,
    'success': success,
    'warning': warning,
  },
  data() {
    return {
      currentFileParams: {},
      albumIndex: null,
      albumData: [],
      currentFileCode: '',
      rawAvatar: null,
      errorsList: [],
    }
  },
  computed: {
    attachments() {
      return this.$store.state.dictionaries.attachments;
    },
    albumsLengths() {
      return this.shownAlbums.map(album => album.attachments && Object.keys(album.attachments)?.length || 0);
    },
    file() {
      return this.$store.state.files.file;
    },
    fileStatus() {
      return this.$store.state.files.fileStatus;
    },
    fileTag() {
      return this.$store.state.files.tag;
    },
    currentTask() {
      return this.$store.state.tasks.currentTask;
    },
    shownAlbums() {
      return this.albums || (this.currentTask.response && this.currentTask.response.albums && this.currentTask.response.albums.first_album) || [];
    },
    formattedAlbums() {
      return this.shownAlbums.map(album => {
        if (!album.attachments) return album;
        let hasRequiredAttachments = false,
            requiredAttachments = [];
        for (let code in album.attachments) {
          if (this.requiredAttachmentsForInterviewTasks.includes(code)) {
            hasRequiredAttachments = true;
            if (!this.value[code]) requiredAttachments.push(code);
          }
        }
        return {...album, requiredAttachments, hasRequiredAttachments};
      });
    },
    requiredAttachmentsForInterviewTasks() {
      return this.$store.state.tasks.requiredAttachmentsForInterviewTasks;
    },
  },
  watch: {
    file: function (newFile) {
      switch (this.fileTag) {
        case 'task-avatar': return this.saveAvatar(newFile);
        case 'additional': return this.addAdditionalFile(null, newFile);
      }
      return this.addFile(null, newFile, this.fileTag);
    },
  },
  methods: {
    addFile(_, response, code) {
      this.$emit('input', {...this.value, [code]: response});
    },
    removeFile(code) {
      this.$emit('input', {...this.value, [code]: null});
    },
    addAdditionalFile(_, response) {
      this.$emit('input', {
        ...this.value,
        additional: (this.value.additional ? [...this.value.additional, response] : [response])
      });
    },
    removeAdditionalFile(id) {
      this.$emit('input', {...this.value, additional: this.value.additional.filter(file => file.id !== id)});
    },
    removeFileFromGallery(id) {
      if (this.currentFileCode?.length) this.removeFile(this.currentFileCode)
      else this.removeAdditionalFile(id)
    },
    uploadAdditionalDocument() {
      if (!this.$refs.additionalInput || !this.$refs.additionalInput.files || !this.$refs.additionalInput.files?.length) return null;
      Array.from(this.$refs.additionalInput.files).forEach(file => this.addFileToDropzone('additional')(file));
      // this.$store.dispatch('files/createFile', {file: this.$refs.additionalInput.files[0], tag: 'additional'});
      this.$refs.additionalInput.value = '';
    },
    getClassFromApplicationType(type) {
      switch (type) {
        case 'application/pdf':
          return 'image_placeholder -pdf';
        case 'application/vnd.ms-excel':
          return 'image_placeholder -xls';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'image_placeholder -xlsx';
        case 'application/msword':
          return 'image_placeholder -doc';
        case 'application/docx':
          return 'image_placeholder -docx';
      }
      return '';
    },
    save() {
      let errors = [];
      this.requiredAttachmentsForInterviewTasks.forEach(code => {
        if (!this.value[code]) errors.push(code);
      });
      if (errors?.length) return this.errorsList = errors;
      this.close();
    },
    close() {
      this.$emit('close');
    },
    onUploadError(file, _b, error, ref) {
      if (error?.response) {
        let element = this.$refs[ref];
        if (element[0]) element[0].removeFile(file);
        else element.removeFile(file);
        let message = JSON.parse(error.response)?.violations[0]?.message;
        if (message) this.$toasted.error(message, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: closeToast,
          }
        });
      }
    },
    addFileToDropzone(code) {
      return (file, done) => {
        if (typeof done === 'function') done({errorMessage: false});
        let element = this.$refs[`file-${code}`];
        if (element) {
          if (element[0]) element[0].removeFile(file);
          else element.removeFile(file);
        }
        this.currentFileParams = {code, name: file.name};
        this.$store.dispatch('files/createFile', {file, tag: code, context: 'interview'});
        if (code === 'photo_face') {
          const reader = new FileReader();
          reader.addEventListener('load', (e) => {
            this.rawAvatar = e.target.result;
            this.$bvModal.show(`task-avatar-crop`);
          });
          reader.readAsDataURL(file);
        }
      }
    },
    openGallery(index, albumData, fileCode = '') {
      this.albumIndex = index
      this.albumData = Array.isArray(albumData) ? albumData : [albumData]
      this.currentFileCode = fileCode
    },
    closeGallery() {
      this.albumIndex = null
    },
    uploadAvatar() {
      this.$refs.cropRef.clip().toBlob((blob) => {
        this.$store.dispatch('files/createFile', {
          file: new File([blob], this.currentFileParams.name || ''),
          tag: 'task-avatar',
          context: 'interview',
        });
      }, 'image/jpeg');
    },
    saveAvatar(file) {
      this.$emit('save-avatar', file);
    },
  }
}
</script>