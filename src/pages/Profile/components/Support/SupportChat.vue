<template>
  <div class="support_chat">
    <div class="support_chat-messages" @scroll="onScrollMessages">
      <template v-if="messages.length">
        <support-message v-for="message in messages"
                         :message="message"
                         :isSupport="isSupport"
                         :key="message.id"
                         ref="message"
                         @click-attachment="openAlbumImage(message.attachments, $event)"
        />
      </template>
      <support-message v-else placeholder />
    </div>
    <input :id="`file_input-${uid}`" type="file" class="support_chat-file_input" multiple @change="uploadFile" />
    <form class="support_chat-form" @submit.prevent="sendMessage">
      <div class="support_chat-form-main">
        <label :for="`file_input-${uid}`" class="btn btn-add hidden-below_md" />
        <label :for="`file_input-${uid}`" class="hidden-above_md support_chat-form-main-add">
          <plus-in-circle-outline />
        </label>
        <b-input-group>
          <b-form-input v-model="newMessage" class="hidden-below_md" placeholder="Напишите сообщение" required maxlength="255" />
          <textarea-autosize v-model="newMessage"
                             class="hidden-above_md form-control"
                             :min-height="40"
                             placeholder="Напишите сообщение"
                             rows="1"
                             required
                             maxlength="255"
          />
          <b-input-group-append>
            <button class="support_chat-form-main-submit hidden-above_lg" type="submit" :disabled="isLoading">
              <arrow-in-circle />
            </button>
            <b-button class="hidden-below_lg" variant="primary" :disabled="isLoading" type="submit">Отправить</b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <div v-if="newAttachments.length || (fileStatus === 'request')" class="support_chat-form-attachments">
        <div v-for="attachment in newAttachments" class="support_chat-form-attachments-attachment"
             :style="{backgroundImage: `url(${attachment.link})`, backgroundSize: 'cover'}"
             :class="{'-loading': attachment.isLoading}"
        >
          <template v-if="attachment.isLoading">
            <throbber class="throbber support_chat-form-attachments-attachment-throbber" />
            <span>Загрузка</span>
          </template>
          <div v-else class="btn btn-remove support_chat-form-attachments-attachment-remove" @click="removeAttachment(attachment.id)" />
        </div>
      </div>
    </form>
    <album-gallery :album-data="currentAlbum"
                   :index="currentImageIndex"
                   without-remove
                   @closeGallery="closeAlbum"
    />
  </div>
</template>

<script>
import SupportMessage from "@/pages/Profile/components/Support/SupportMessage";
import AlbumGallery from "@/components/Common/AlbumGallery/AlbumGallery.vue";
import throbber from "@/assets/vue-svg/throbber.svg";
import plusInCircleOutline from "@/assets/vue-svg/plus-in-circle-outline.svg";
import arrowInCircle from "@/assets/vue-svg/arrow-in-circle.svg";
import { showToastNew } from "@/tools/tools";

export default {
  name: 'SupportChat',
  props: {
    messages: Array,
    isLoading: Boolean,
    isSupport: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    SupportMessage,
    AlbumGallery,
    'throbber': throbber,
    'plus-in-circle-outline': plusInCircleOutline,
    'arrow-in-circle': arrowInCircle,
  },
  data() {
    return {
      newMessage: '',
      newAttachments: [],
      currentAlbum: [],
      currentImageIndex: null,
    }
  },
  computed: {
    uid() {
      return this._uid;
    },
    fileTag() {
      return this.$store.state.files.tag;
    },
    file() {
      return this.$store.state.files.file;
    },
    fileStatus() {
      return this.$store.state.files.fileStatus;
    },
  },
  watch: {
    file: function (newFile) {
      this.newAttachments = this.newAttachments.map(attachment => attachment.tag === this.fileTag ? newFile : attachment);
    },
    status: function (newStatus) {
      if (newStatus === 'error') showToastNew({message: 'Ошибка отправки файла', type: 'error'}).bind(this);
    },
  },
  methods: {
    sendMessage() {
      if (this.isLoading) return;
      this.$emit('send-message', {message: this.newMessage, attachments: this.newAttachments.map(attachment => attachment.id)});
    },
    clearMessageInput() {
      this.newMessage = '';
      this.newAttachments = [];
    },
    onScrollMessages(e) {
      const anchorElementRect = this.$refs.message[this.messages.length - 1].getBoundingClientRect();
      if (e.target.getBoundingClientRect().top > anchorElementRect.top + 30) return;
      this.$emit('scrolled-to-top');
    },
    uploadFile(e) {
      if (!e.target.files[0]) return;
      e.target.files.forEach((file, key) => {
        this.$store.dispatch('files/createFile', {
          file: file,
          tag: `${this.uid}-${key}`,
          context: 'support',
        });
        this.newAttachments.push({isLoading: true, tag: `${this.uid}-${key}`});
      });
      e.target.value = '';
    },
    removeAttachment(id) {
      this.newAttachments = this.newAttachments.filter(attachment => attachment.id !== id);
    },
    openAlbumImage(materials, id) {
      this.currentImageIndex = id;
      this.currentAlbum = materials;
    },
    closeAlbum() {
      this.currentImageIndex = null;
    },
  },
}
</script>