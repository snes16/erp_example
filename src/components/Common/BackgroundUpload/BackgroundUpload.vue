<template>
  <div class="background_upload">
    <upload v-if="!value" class="background_upload-icon"/>
    <div class="background_upload-main"
         :style="value ? `background-image: url(${value}); background-position: center;` : '' "
         v-b-tooltip.hover
         :title="tip"
    />
    <div v-if="!disabled">
      <span v-if="!value" class="background_upload-add-text">Добавить обложку</span>
      <clipper-upload v-if="useClipper"
                      v-model="rawImage"
                      class="background_upload-add"
                      :class="`btn-${showEditButton ? 'edit' : 'add'}`"
                      ref="clipperUploadRef"
                      :exif="false"
      />
      <template v-else>
        <input :id="`background-input-${tag}`"
               type="file"
               accept="image/png, image/jpeg, image/svg+xml, image/svg"
               class="avatar_upload-add-input"
               ref="inputRef"
               @change="change"
        />
      </template>
    </div>
    <b-modal :id="`image-upload-${tag}`"
             centered
             class="background_upload-modal"
             title='Загрузка изображения'
             body-bg-variant="white"
             ok-title="Загрузить"
             ok-variant="primary"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             hide-header-close
             @ok="sendImage"
    >
      <p>Выделите желаемую область изображения и нажмите кнопку “Загрузить”</p>
      <clipper-basic class="my-clipper"
                     :src="rawImage"
                     ref="cropRef"
                     id="cropId"
                     shadow="rgba(234, 240, 246, 0.5)" :wrap-ratio=2 :min-width=10 :min-height=10
                     :init-height=50
                     :init-width=100
                     cross-origin="anonymous"
      >
        <div class="placeholder" slot="placeholder">No image</div>
      </clipper-basic>
    </b-modal>
    <b-modal :id="`images-list-${tag}`"
             centered
             title='Загрузка фонового изображения'
             body-bg-variant="white"
             ok-only
             ok-title="Отменить"
             ok-variant="outline-primary"
             hide-header-close
    >
      <div class="background_upload-list_modal-main">
        <span class="text-gray-text">Выберите загруженное фото</span>
        <div class="background_upload-list_modal-main-new">
          <clipper-upload v-if="useClipper"
                          v-model="rawImage"
                          class="background_upload-list_modal-main-new-button btn-add"
                          ref="clipperUploadRef"
                          :exif="false"
          />
        </div>
      </div>
    </b-modal>
    <slot></slot>
  </div>
</template>

<script>
import {clipperBasic, clipperUpload} from 'vuejs-clipper'
import {getSmallImage, showToast} from "@/tools/tools";
import upload from "@/assets/vue-svg/upload.svg";

export default {
  name: 'background-upload',
  props: {
    altPlaceholder: Boolean,
    tag: {
      type: String,
      default: 'background'
    },
    size: {
      type: String,
      default: '-xl'
    },
    tip: String,
    useClipper: Boolean,
    context: String,
    disabled: Boolean,
    value: [Object, String],
  },
  components: {
    'clipper-basic': clipperBasic,
    'clipper-upload': clipperUpload,
    'upload': upload,
  },
  data() {
    return {
      rawImage: '',
    }
  },
  computed: {
    file() {
      return this.$store.state.files.file;
    },
    fileTag() {
      return this.$store.state.files.tag;
    },
    status() {
      return this.$store.state.files.fileStatus;
    },
    errorMessage() {
      return this.$store.state.files.errorMessage;
    },
    showEditButton() {
      if (this.value && typeof this.value === 'object') return this.value.url;
      return this.value;
    },
  },
  watch: {
    file: function (newFile) {
      if (this.fileTag !== this.tag) return;
      this.$emit("input", {id: newFile.id, url: newFile.link});
      this.$emit("change");
    },
    status: function (newStatus) {
      if (newStatus === 'error') {
        if (this.fileTag !== this.tag) return;
        if (this.errorMessage) showToast(this.$toasted, this.errorMessage, 'error');
      }
    },
    rawImage: function (newImage) {
      if (newImage) this.showUploadModal();
    }
  },
  methods: {
    change() {
      if (!this.$refs.inputRef || !this.$refs.inputRef.files || !this.$refs.inputRef.files.length) return null;
      this.$store.dispatch('files/createFile', {
        file: this.$refs.inputRef.files[0],
        tag: this.tag,
        context: this.context,
      });
      this.$refs.inputRef.value = '';
    },
    showUploadModal() {
      this.$bvModal.hide(`images-list-${this.tag}`);
      this.$bvModal.show(`image-upload-${this.tag}`);
    },
    sendImage() {
      this.$refs.cropRef.clip().toBlob((blob) => {
        this.$store.dispatch('files/createFile', {
          file: new File([blob], this.$refs.clipperUploadRef?.file?.name || 'default'),
          tag: this.tag,
          context: this.context,
        });
      }, 'image/jpeg');
    },
  }
}
</script>