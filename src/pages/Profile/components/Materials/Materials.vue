<template>
  <div>
    <div v-if="materials" class="materials">
      <div v-if="(userType === 'model') && userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.view" class="materials-container">
        <div v-for="(album, key) in materials.first_album" class="materials-block">
          <div class="materials-block-card card">
            <div class="materials-block-card-header">
              <h3>{{ album.title }}</h3>
              <div v-if="Array.isArray(album.attachments) || (album.attachments === null)"
                   class="tasks_files-main-album-header d-flex">
                <div v-if="userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.edit"
                     class="tasks_files-main-album-add">
                  <input id="upload-document-model" class="d-none" type="file" ref="additionalInput"
                         @change="uploadAdditionalDocument" multiple/>
                  <label class="btn-add ml-2 mb-0" for="upload-document-model"/>
                </div>
              </div>
              <div v-else>
                <i class="fi" :class="albumIsFull[key] ? 'flaticon-done' : 'flaticon-important'"></i>
              </div>
            </div>
            <div class="materials-block-card-body">
              <div class="tasks_files-main-album">
                <template v-if="Array.isArray(album.attachments) || (album.attachments === null)">
                  <div
                      v-if="album.attachments && album.attachments.length || ((fileStatus === 'request') && (currentFileParams.albumTitle === materials.first_album[materials.first_album.length - 1].title))"
                      class="tasks_files-main-album-additional">
                    <div v-for="(file,index) in album.attachments" class="tasks_files-main-album-files-file-image">
                      <div class="materials-files-field-file-image image_placeholder"
                           :style="file.type.includes('image') && file.link ? `background-image: url(${file.preview_link || file.link}); background-size: cover;` : ''"
                           :class="getClassFromApplicationType(file.type)"
                           @click="openGallery(index, album.attachments, !!userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.edit)"
                      >
                        <!--                                            <div class="materials-files-field-file-image-active">-->
                        <!--                                                <div class="materials-files-field-file-image-active-remove">-->
                        <!--                                                    <i v-if="userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.edit" class="fi flaticon-remove-file" @click="removeFile(file.id)"></i>-->
                        <!--                                                </div>-->
                        <!--                                                <div class="materials-files-field-file-image-active-field_link">-->
                        <!--                                                    <a :href="file.download_link" :download="file.filename">-->
                        <!--                                                        <i class="fi flaticon-download-file"></i>-->
                        <!--                                                    </a>-->
                        <!--                                                </div>-->
                        <!--                                            </div>-->
                      </div>
                    </div>
                    <throbber
                        v-if="(fileStatus === 'request') && (currentFileParams.albumTitle === materials.first_album[materials.first_album.length - 1].title)"
                        class="throbber m-3 -sm"/>
                  </div>
                </template>
                <template v-else>
                  <div
                      :class="Array.isArray(album.attachments) || (album.attachments === null) ? 'tasks_files-main-album-additional' : 'tasks_files-main-album-files'">
                    <div v-for="(file, index) in album.attachments" class="tasks_files-main-album-files-file"
                         :class="`-rows-${albumsLengths[key]}`">
                      <p class="tasks_files-main-album-files-file-title">{{ attachments[file.code] }}</p>
                      <div v-if="file.id" class="tasks_files-main-album-files-file-image">
                        <div class="materials-files-field-file-image image_placeholder"
                             :style="file.type.includes('image') && file.link ? `background-image: url(${file.preview_link || file.link}); background-size: cover;` : ''"
                             :class="getClassFromApplicationType(file.type)"
                             @click="openGallery(index, album.attachments, !!userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.edit)"
                        >
                          <!--                                                <div class="materials-files-field-file-image-active">-->
                          <!--                                                    <div class="materials-files-field-file-image-active-remove">-->
                          <!--                                                        <i v-if="userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.edit" class="fi flaticon-remove-file" @click="removeFile(file.id)"></i>-->
                          <!--                                                    </div>-->
                          <!--                                                    <div class="materials-files-field-file-image-active-field_link">-->
                          <!--                                                        <a :href="file.download_link" :download="file.filename">-->
                          <!--                                                            <i class="fi flaticon-download-file"></i>-->
                          <!--                                                        </a>-->
                          <!--                                                    </div>-->
                          <!--                                                </div>-->
                        </div>
                      </div>
                      <div
                          v-else-if="(fileStatus === 'request') && (currentFileParams.albumTitle === album.title) && (currentFileParams.code === file.code)"
                          class="tasks_files-main-album-files-file-throbber">
                        <throbber class="throbber m-3 -sm"/>
                      </div>
                      <drop-zone
                          v-else-if="userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.edit"
                          :id="`file-${file.code}`"
                          :ref="`file-${file.code}`"
                          :useCustomSlot="true"
                          :options="{
                                                    url: `${config.baseURLApi}/files`,
                                                    headers: { authorization: `Bearer ${accessToken}` },
                                                    clickable: true,
                                                    thumbnailWidth: 80,
                                                    thumbnailHeight: 80,
                                                    dictRemoveFile: 'Удалить файл',
                                                    accept: addFileToDropzone(file.code, album.title, `file-${file.code}`)
                                                }"
                          @vdropzone-success="addFile(...arguments, file.code, album.title)"
                          @vdropzone-error="onUploadError(...arguments, `file-${file.code}`)"
                      >
                        <div class="dropzone-custom-content">
                          <p class="dropzone-custom-title">Загрузить изображение</p>
                        </div>
                      </drop-zone>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-else>
        <div class="materials-col">
          <div class="card profile_main-card">
            <div class="profile_main-card-header">
              <h3 class="d-flex align-items-center">
                <span>Договоры</span>
                <template v-if="contracts.length && userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.contracts.edit">
                  <input id="upload-contract"
                         class="d-none"
                         type="file"
                         ref="contractsInput"
                         multiple
                         @change="uploadContracts"
                  />
                  <label class="btn-add ml-2 mb-0" for="upload-contract"/>
                </template>
              </h3>
            </div>
            <div class="profile_main-card-body -fixed_large">
              <template v-if="!contracts.length">
                <div v-if="!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.contracts.edit"
                     class="dropzone vue-dropzone -disabled">
                  <div class="dz-message">
                    <div class="dropzone-custom-content">
                      <h3 class="dropzone-custom-title">У вас нет прав доступа для загрузки файлов</h3>
                    </div>
                  </div>
                </div>
                <throbber v-else-if="(fileStatus === 'request') && (currentFileParams.albumTitle === materials.first_album[0].title)"
                          class="throbber m-3"
                />
                <drop-zone v-else
                           ref="contracts"
                           id="contracts"
                           :useCustomSlot="true"
                           :options="{
                                        url: `${config.baseURLApi}/files`,
                                        headers: { authorization: `Bearer ${accessToken}` },
                                        clickable: true,
                                        thumbnailWidth: 80,
                                        thumbnailHeight: 80,
                                        dictRemoveFile: 'Удалить файл',
                                        accept: addFileToDropzone(null, materials.first_album[0].title, 'contracts')
                                    }"
                           @vdropzone-removed-file="removeContracts"
                           @vdropzone-success="addFile(...arguments, null, materials.first_album[0].title)"
                           @vdropzone-error="onUploadError(...arguments, 'contracts')"
                >
                  <div class="dropzone-custom-content">
                    <h3 class="dropzone-custom-title">Нажмите или перетащите файлы прямо сюда</h3>
                  </div>
                </drop-zone>
              </template>
              <div v-else class="materials-files-field">
                <div class="materials-files-field-file" v-for="(contract, index) in contracts" :key="index">
                  <div class="materials-files-field-file-image image_placeholder"
                       :style="contract.type.includes('image') && contract.link ? `background-image: url(${contract.preview_link || contract.link}); background-size: cover;` : ''"
                       :class="getClassFromApplicationType(contract.type)"
                       @click="openGallery(index, contracts, !!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.contracts.edit)"
                  ></div>
                  <p class="materials-files-field-file-description"
                     @click="openGallery(index, contracts, !!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.contracts.edit)"
                  >{{ contract.title }}</p>
                  <throbber
                      v-if="(fileStatus === 'request') && (currentFileParams.albumTitle === materials.first_album[0].title)"
                      class="throbber m-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="materials-col">
          <div class="card profile_main-card">
            <div class="profile_main-card-header">
              <h3 class="d-flex align-items-center">
                <span>Документы</span>
                <template v-if="documents.length && userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.documents.edit">
                  <input id="upload-document"
                         class="d-none"
                         type="file"
                         ref="documentsInput"
                         multiple
                         @change="uploadDocuments"
                  />
                  <label class="btn-add ml-2 mb-0" for="upload-document"/>
                </template>
              </h3>
            </div>
            <div class="profile_main-card-body -fixed_large">
              <template v-if="!documents.length">
                <div v-if="!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.documents.edit"
                     class="dropzone vue-dropzone -disabled">
                  <div class="dz-message">
                    <div class="dropzone-custom-content">
                      <h3 class="dropzone-custom-title">У вас нет прав доступа для загрузки файлов</h3>
                    </div>
                  </div>
                </div>
                <throbber v-else-if="(fileStatus === 'request') && (currentFileParams.albumTitle === materials.second_album[0].title)"
                          class="throbber m-3"
                />
                <drop-zone v-else
                           ref="documents"
                           id="documents"
                           :useCustomSlot="true"
                           :options="{
                                    url: `${config.baseURLApi}/files`,
                                    headers: { authorization: `Bearer ${accessToken}` },
                                    clickable: true,
                                    thumbnailWidth: 80,
                                    thumbnailHeight: 80,
                                    dictRemoveFile: 'Удалить файл',
                                    accept: addFileToDropzone(null, materials.second_album[0].title, 'documents')
                                }"
                           :disabled="!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.documents.edit"
                           @vdropzone-removed-file="removeDocuments"
                           @vdropzone-success="addFile(...arguments, null, materials.second_album[0].title)"
                           @vdropzone-error="onUploadError(...arguments, 'documents')"
                >
                  <div class="dropzone-custom-content">
                    <h3 class="dropzone-custom-title">Нажмите или перетащите файлы прямо сюда</h3>
                  </div>
                </drop-zone>
              </template>
              <div v-else class="materials-files-field">
                <div class="materials-files-field-file" v-for="(document, index) in documents" :key="index">
                  <div class="materials-files-field-file-image image_placeholder"
                       :style="document.type.includes('image') && document.link ? `background-image: url(${document.preview_link || document.link}); background-size: cover;` : ''"
                       :class="getClassFromApplicationType(document.type)"
                       @click="openGallery(index, documents, !!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.documents.edit)"
                  ></div>
                  <p class="materials-files-field-file-description"
                     @click="openGallery(index, documents, !!userPermissions[userType][isMyProfile ? 'personal' : 'profile'].materials.documents.edit)"
                  >{{ document.title }}</p>
                </div>
                <throbber
                    v-if="(fileStatus === 'request') && (currentFileParams.albumTitle === materials.second_album[0].title)"
                    class="throbber m-3"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <b-modal id="materials-image-upload"
               centered
               title='Загрузка изображения'
               body-bg-variant="white"
               ok-title="Загрузить"
               ok-variant="primary"
               cancel-title="Отменить"
               cancel-variant="outline-primary"
               @ok="sendCurrentImage">
        <p class="mb-2">Выделите желаемую область изображения и нажмите кнопку “Загрузить”</p>
        <clipper-basic class="my-clipper" :src="currentFileParams.url" ref="cropRef">
          <div class="placeholder" slot="placeholder">No image</div>
        </clipper-basic>
      </b-modal>
      <album-gallery :albumData="albumData"
                     :index="albumIndex"
                     :withoutRemove="!albumShowRemove"
                     @removeFile="removeFile"
                     @closeGallery="closeGallery"/>
    </div>
    <div v-if="isHasDuplicate && archiveMaterials" class="profile-collapse">
      <div class="profile-collapse-title" v-b-toggle.collapse>
        <h3 class="profile-collapse-title-text">Архивные данные</h3>
        <i :class="`fa fa-angle-down`"/>
      </div>
      <b-collapse visible id="collapse">
        <div class="materials">
          <template
              v-if="(userType === 'model') && userPermissions.model[isMyProfile ? 'personal' : 'profile'].materials.registration.view">
            <div v-for="(album, key) in archiveMaterials.first_album" class="materials-block">
              <div class="materials-block-card card">
                <div class="materials-block-card-header">
                  <h3>{{ album.title }}</h3>
                  <div v-if="!(Array.isArray(album.attachments) || (album.attachments === null))">
                    <i class="fi" :class="archiveAlbumIsFull[key] ? 'flaticon-done' : 'flaticon-important'"></i>
                  </div>
                </div>
                <div class="materials-block-card-body">
                  <div class="tasks_files-main-album">
                    <template v-if="Array.isArray(album.attachments) || (album.attachments === null)">
                      <div
                          v-if="album.attachments && album.attachments.length"
                          class="tasks_files-main-album-additional">
                        <div v-for="(file,index) in album.attachments" class="tasks_files-main-album-files-file-image">
                          <div class="materials-files-field-file-image image_placeholder"
                               :style="file.type.includes('image') && file.link ? `background-image: url(${file.preview_link || file.link}); background-size: cover;` : ''"
                               :class="getClassFromApplicationType(file.type)"
                               @click="openGallery(index, album.attachments, false)"
                          >
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                          :class="Array.isArray(album.attachments) || (album.attachments === null) ? 'tasks_files-main-album-additional' : 'tasks_files-main-album-files'">
                        <div v-for="(file, index) in album.attachments" class="tasks_files-main-album-files-file"
                             :class="`-rows-${archiveAlbumsLengths[key]}`">
                          <p class="tasks_files-main-album-files-file-title">{{ attachments[file.code] }}</p>
                          <div v-if="file.id" class="tasks_files-main-album-files-file-image">
                            <div class="materials-files-field-file-image image_placeholder"
                                 :style="file.type.includes('image') && file.link ? `background-image: url(${file.preview_link || file.link}); background-size: cover;` : ''"
                                 :class="getClassFromApplicationType(file.type)"
                                 @click="openGallery(index, album.attachments, false)"
                            >
                            </div>
                          </div>
                          <div v-else class="tasks_files-main-album-files-file-empty">
                            <i class="fi flaticon-image"></i>
                            <span> Нет изображения </span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import vueDropzone from 'vue2-dropzone';
import config from '@/config';
import {clipperBasic} from 'vuejs-clipper';
import throbber from "@/assets/vue-svg/throbber.svg";
import AlbumGallery from "@/components/Common/AlbumGallery/AlbumGallery";

export default {
  name: 'materials',
  components: {
    AlbumGallery,
    'drop-zone': vueDropzone,
    'clipper-basic': clipperBasic,
    'throbber': throbber
  },
  props: {
    materials: Object,
    archiveMaterials: Object,
    userType: String,
    isMyProfile: Boolean,
    albums: Array,
    userId: [Number, String],
    isHasDuplicate: Boolean
  },
  data() {
    return {
      config: config,
      documentAdded: false,
      contractAdded: false,
      contracts: [],
      documents: [],
      currentFileParams: {},
      albumIndex: null,
      albumData: [],
      albumShowRemove: false
    }
  },
  computed: {
    /*materialsCopy() {
        let materialsCopy = JSON.parse(JSON.stringify(this.materials))
        return materialsCopy.map(function(attachment) {
            if(attachment.title === 'На регистрацию') attachment.code = 'registration'
            else if(attachment.title === 'Видеотестирование') attachment.code = 'video'
            return attachment

        })
    },*/
    accessToken() {
      return this.$store.state.auth.password
    },
    user() {
      return this.$store.state.auth.user
    },
    file() {
      return this.$store.state.files.file;
    },
    fileTag() {
      return this.$store.state.files.tag;
    },
    fileStatus() {
      return this.$store.state.files.fileStatus
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    attachments() {
      return this.$store.state.dictionaries.attachments;
    },
    albumsLengths() {
      if ((this.userType !== 'model') || !this.materials) return null;
      return this.materials.first_album.map(album => album.attachments && Object.keys(album.attachments) && Object.keys(album.attachments).length || 0);
    },
    archiveAlbumsLengths() {
      if ((this.userType !== 'model') || !this.archiveMaterials) return null;
      return this.archiveMaterials.first_album.map(album => album.attachments && Object.keys(album.attachments) && Object.keys(album.attachments).length || 0);
    },
    albumIsFull() {
      if ((this.userType !== 'model') || !this.materials) return null;
      return this.materials.first_album.map(album => {
        if (album.attachments && !Array.isArray(album.attachments)) {
          return Object.values(album.attachments).every(attachment => attachment.filename);
        }
      })
    },
    archiveAlbumIsFull() {
      if ((this.userType !== 'model') || !this.archiveMaterials) return null;
      return this.archiveMaterials.first_album.map(album => {
        if (album.attachments && !Array.isArray(album.attachments)) {
          return Object.values(album.attachments).every(attachment => attachment.filename);
        }
      })
    }
  },
  watch: {
    fileStatus: function (newFiles) {
      if (newFiles === 'contract-added' || newFiles === 'document-added' || newFiles === 'file-removed' || newFiles === 'file-connected') this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
    },
    documentAdded: function () {
      this.documentAdded = false;
    },
    contractAdded: function () {
      this.contractAdded = false;
    },
    materials: function (newMaterials) {
      if (this.userType !== 'model' && newMaterials) this.getFiles(newMaterials);
    },
    file: function (newFile) {
      if (this.fileTag !== 'materials') return;
      this.addFile(null, newFile, this.currentFileParams.code, this.currentFileParams.albumTitle);
    },
  },
  created() {
    if (this.userType !== 'model' && this.materials) this.getFiles(this.materials);
  },
  methods: {
    getFiles(albums) {
      this.contracts = albums?.first_album && albums.first_album[0] && albums.first_album[0].attachments && [...albums.first_album[0].attachments] || [];
      this.documents = albums?.second_album && albums.second_album[0] && albums.second_album[0].attachments && [...albums.second_album[0].attachments] || [];
      /*albums.map(album => {
          if(album.title === 'Документы') this.documents = [...album.attachments];
          else if(album.title === 'Договоры') this.contracts = [...album.attachments];
      })*/
    },
    removeContracts(file) {
      this.contracts = this.contracts.filter(fileObject => fileObject.name !== file.name)
    },
    removeDocuments(file) {
      this.documents = this.documents.filter(fileObject => fileObject.name !== file.name)
    },
    removeFile(id) {
      this.$store.dispatch('files/removeFile', id)
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
            onClick: this.closeToast
          }
        });
      }
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    showUserEditErrorMessage() {
      this.$toasted.error('Ошибка', {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast
        }
      });
    },
    getClassFromApplicationType(type) {
      switch (type) {
        case 'application/pdf':
          return '-pdf';
        case 'application/vnd.ms-excel':
          return '-xls';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return '-xlsx';
        case 'application/msword':
          return '-doc';
        case 'application/docx':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return '-docx';
      }
      return '';
    },
    uploadContracts() {
      let input = this.$refs.contractsInput ? this.$refs.contractsInput[0] || this.$refs.contractsInput : this.$refs.contractsInput;
      if (!(input && input.files && input.files.length)) return null;
      // this.$store.dispatch('files/createFile', {file: input.files[0], tag: 'contract'});
      Array.from(input.files).forEach(file => this.addFileToDropzone(null, this.materials.first_album[0].title)(file))
      input.value = '';
    },
    uploadDocuments() {
      let input = this.$refs.documentsInput ? this.$refs.documentsInput[0] || this.$refs.documentsInput : this.$refs.documentsInput;
      if (!(input && input.files && input.files.length)) return null;
      // this.$store.dispatch('files/createFile', {file: input.files[0], tag: 'document'});
      Array.from(input.files).forEach(file => this.addFileToDropzone(null, this.materials.second_album[0].title)(file))
      input.value = '';
    },
    addFile(_, response, code, album) {
      this.$store.dispatch('files/addFileToUser', {userId: this.userId, file: {file: response.id, code, album}});
    },
    uploadAdditionalDocument() {
      let input = this.$refs.additionalInput ? this.$refs.additionalInput[0] || this.$refs.additionalInput : this.$refs.additionalInput;
      if (!(input && input.files && input.files.length)) return null;
      // this.$store.dispatch('files/createFile', {file: input.files[0], tag: 'additional'});
      Array.from(input.files).forEach(file => this.addFileToDropzone(null, this.materials.first_album[this.materials.first_album.length - 1].title)(file))
      input.value = '';
    },
    addFileToDropzone(code, albumTitle, ref) {
      return (file, done) => {
        if (typeof done === 'function') done({errorMessage: false});
        let element = this.$refs[ref];
        if (element) {
          if (element[0]) element[0].removeFile(file);
          else element.removeFile(file);
        }
        this.currentFileParams = {
          code,
          albumTitle
        }
        this.$store.dispatch('files/createFile', {file, tag: 'materials', context: 'profile'});
        /*const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            this.currentFileParams = {
                url: e.target.result,
                code,
                albumTitle,
                name: file.name
            }
            this.$bvModal.show(`materials-image-upload`);
        })
        reader.readAsDataURL(file);*/
      }
    },
    sendCurrentImage() {
      this.$refs.cropRef.clip().toBlob((blob) => {
        this.$store.dispatch('files/createFile', {
          file: new File([blob], this.currentFileParams.name),
          tag: 'materials'
        });
      }, 'image/jpeg');
    },
    openGallery(index, albumData, showRemove) {
      this.albumIndex = Array.isArray(albumData) ? index : Object.keys(albumData).indexOf(index)
      this.albumData = Array.isArray(albumData) ? albumData : Object.values(albumData)
      this.albumShowRemove = showRemove
    },
    closeGallery() {
      this.albumIndex = null
    }
  }
}
</script>
