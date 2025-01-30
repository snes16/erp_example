<template>
  <div class="avatar-wrap" :class="{[size]: true, '-border': useBorder}">
    <div class="avatar_upload-main avatar"
         :class="{[size]: true, '-alt': altPlaceholder}"
         :style="smallImage ? `background-image: url(${smallImage}); background-size: cover;` : ''"
         v-b-tooltip.hover
         :title="tip"
    />
    <template v-if="isTelegramIconShown">
      <div v-if="telegram"
           class="avatar-icon -telegram"
           v-b-tooltip.hover.bottom
           title="Уведомления подключены"
      >
        <telegram/>
      </div>
      <div v-else
           class="avatar-icon -telegram -inactive"
           v-b-tooltip.hover.bottom
           title="Уведомления отключены"
      >
        <telegram/>
      </div>
    </template>
    <div v-if="!disabled">
      <label v-if="showImageChoiceModal"
           class="avatar_upload-add"
           :class="`btn-${showEditButton ? 'edit' : 'add'}`"
           @click="clickAddButton"
      />
      <clipper-upload v-else-if="useClipper"
                      v-model="rawImage"
                      class="avatar_upload-add"
                      :class="`btn-${showEditButton ? 'edit_alt' : 'add'}`"
                      ref="clipperUploadRef"
                      :exif="false"
      />
      <template v-else>
        <label :for="`avatar-input-${tag}`"
              class="avatar_upload-add"
              :class="`btn-${showEditButton ? 'edit_alt' : 'add'}`"
        />
        <input :id="`avatar-input-${tag}`"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/svg"
              class="avatar_upload-add-input"
              ref="inputRef"
              @change="change"
        />
      </template>
    </div>
    <!--<b-button :variant="showEditButton ? 'edit' : 'add'" class="avatar_upload-add">
    </b-button>-->
    <b-modal :id="`image-upload-${tag}`"
             centered
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
                     shadow="rgba(234, 240, 246, 0.5)" :wrap-ratio=2 :min-width=10 :min-height=10 :init-width=50
                     :init-height=100
                     cross-origin="anonymous"
      >
        <div class="placeholder" slot="placeholder">No image</div>
      </clipper-basic>
    </b-modal>
    <b-modal :id="`images-list-${tag}`"
             centered
             title='Загрузка аватара пользователя'
             body-bg-variant="white"
             ok-only
             ok-title="Отменить"
             ok-variant="outline-primary"
             hide-header-close
    >
      <div class="avatar_upload-list_modal-main">
        <span class="text-gray-text">Выберите загруженное фото</span>
        <div class="avatar_upload-list_modal-main-new">
<!--          <span>Загрузить новое</span>-->
<!--          <b-button variant="add"/>-->
          <clipper-upload v-if="useClipper"
                          v-model="rawImage"
                          class="avatar_upload-list_modal-main-new-button btn-add"
                          ref="clipperUploadRef"
                          :exif="false"
          />
        </div>
      </div>
      <div class="avatar_upload-list_modal-card">
        <div v-for="image in imagesList"
             class="avatar_upload-list_modal-card-item"
             :style="image ? `background-image: url(${image}); background-size: cover;` : ''"
             @click="chooseImageFromList(image)"
        />
      </div>
    </b-modal>
    <slot></slot>
  </div>
</template>

<script>
import {clipperBasic, clipperUpload} from 'vuejs-clipper'
import {getSmallImage} from "@/tools/tools";
import telegram from "@/assets/vue-svg/telegram.svg";

export default {
  name: 'avatar-upload',
  props: {
    value: [Object, String],
    altPlaceholder: Boolean,
    tag: {
      type: String,
      default: 'avatar'
    },
    size: {
      type: String,
      default: '-xl'
    },
    tip: String,
    telegram: Boolean,
    useBorder: Boolean,
    useClipper: Boolean,
    imagesList: Array,
    context: String,
    disabled: Boolean,
    isTelegramIconShown: Boolean,
  },
  components: {
    telegram,
    'clipper-basic': clipperBasic,
    'clipper-upload': clipperUpload,
  },
  data() {
    return {
      rawImage: ''
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
    smallImage() {
      return getSmallImage(this.value?.url || this.value);
    },
    showImageChoiceModal() {
      return !!this.imagesList?.length;
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
        if (this.errorMessage) this.$toasted.error(this.errorMessage, {
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
    closeToast(e, toast) {
      toast.goAway(0);
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
    clickAddButton() {
      this.$bvModal.show(`images-list-${this.tag}`);
    },
    chooseImageFromList(image) {
      this.rawImage = '';
      this.$nextTick(() => this.rawImage = image);
    },
  }
}
</script>