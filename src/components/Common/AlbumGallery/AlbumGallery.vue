<template>
  <div class="album">
    <b-modal
        id="delete-file"
        centered
        :title="`Удалить файл '${gallery[currentIndex] ? gallery[currentIndex].title : ''}'?`"
        body-bg-variant="white"
        ok-title="Удалить"
        ok-variant="danger"
        cancel-title="Отменить"
        cancel-variant="outline-primary"
        @ok="removeFile(gallery[currentIndex].id)">
      Это навсегда удалит файл и он больше не будет доступен вам или кому-либо ещё
    </b-modal>
    <div v-if="index!==null && gallery[currentIndex] && (gallery[currentIndex].mediaType !== 'image')" class="album-download">
      <h3>Предварительный просмотр недоступен</h3>
      <p>Скачайте файл себе на устройство что бы посмотреть его</p>
      <div>
        <b-button variant="primary" class="album-download-btn">
          <a :href="gallery[currentIndex].download_link" :download="gallery[currentIndex].filename">Скачать</a>
        </b-button>
      </div>
    </div>
    <light-box
        :items="gallery"
        :index="galleryIndex"
        useZoomBar
        loop
        :zIndex="110"
        overlayColor="rgba(0, 0, 0, 0.8)"
        :slideshow="false"
        @on-change="changeGallery"
        @close="closeGallery">
      <template v-slot:close>
        <i class="fi flaticon-close-file"></i>
      </template>
      <template v-slot:icon-previous>
        <i class="fi flaticon-icon-previous"></i>
      </template>
      <template v-slot:icon-next>
        <i class="fi flaticon-icon-next"></i>
      </template>
    </light-box>
  </div>
</template>

<script>
  import CoolLightBox from 'vue-cool-lightbox'
  import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css';
  export default {
    name: "AlbumGallery",
    components: { 'light-box': CoolLightBox },
    props: {
      albumData: Array,
      index: Number,
      withoutRemove: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        currentIndex: null,
        galleryIndex: null
      }
    },
    computed: {
      gallery() {
        let galleryData = []
        this.albumData.forEach(data => {
          if (data.filename) galleryData.push({
            src: data.link,
            id: data.id,
            title: data.title,
            filename: data.filename,
            download_link: data.download_link,
            mediaType: data.type.includes('image') ? 'image' : 'pdf',
          })
        })
        return galleryData
      }
    },
    watch: {
      index(newIndex) {
        this.galleryIndex = this.currentIndex = newIndex
        if (newIndex !== null) {
          this.galleryIndex = this.currentIndex = this.gallery.findIndex(image => image.id === this.albumData[newIndex].id)
          this.$nextTick(() => {
            // download button
            let downloadBtn = document.createElement("a");
            downloadBtn.id = 'download_link';
            downloadBtn.href = this.gallery[this.currentIndex].download_link;
            downloadBtn.download=this.gallery[this.currentIndex].filename;
            let downloadIcon = document.createElement("i");
            downloadIcon.classList.add("fi", "flaticon-download-link")
            downloadBtn.classList.add("cool-lightbox-toolbar__btn")
            downloadBtn.appendChild(downloadIcon);

            let toolBar = document.getElementsByClassName('cool-lightbox-toolbar')[0]
            let groupsBtn = document.querySelector('[title="Show thumbnails"]')
            if (groupsBtn) toolBar.removeChild(groupsBtn)
            toolBar.insertBefore(downloadBtn, toolBar.firstChild);

            // delete button
            if (!this.withoutRemove) {
              let deleteBtn = document.createElement("btn");
              let deleteIcon = document.createElement("i");
              deleteIcon.classList.add("fi", "flaticon-trash-file")
              deleteBtn.id = 'delete_btn';
              deleteBtn.classList.add("cool-lightbox-toolbar__btn")
              deleteBtn.appendChild(deleteIcon);
              deleteBtn.addEventListener('click', this.openRemoveModal)
              toolBar.insertBefore(deleteBtn, toolBar.firstChild);
            }
          });
        }
      }
    },
    methods: {
      changeGallery(index) {
        this.currentIndex = index
        let download = document.getElementById('download_link')
        download.href=this.gallery[this.currentIndex].download_link;
        download.download=this.gallery[this.currentIndex].filename;
      },
      removeFile(id) {
        this.$emit("removeFile", id);
        this.closeGallery()
      },
      openRemoveModal() {
        this.$bvModal.show('delete-file');
      },
      closeGallery() {
        if (!this.withoutRemove) {
          let deleteBtn = document.getElementById('delete_btn')
          deleteBtn.removeEventListener('click', this.openRemoveModal)
        }
        this.$emit("closeGallery");
      }
    }
  }
</script>