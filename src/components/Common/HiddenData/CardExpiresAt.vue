<template>
  <div class="hidden_data -card_expires_at">
    <span>{{ shownData }}</span>
    <div class="password_field-toggle">
      <i class="glyphicon"
         :class="showFullData ? 'glyphicon-eye-close' : 'glyphicon-eye-open'"
         @click="toggleType"
      />
      <copy class="workshift_details-body-main-services-service-block-copy-icon ml-2_5" @click="copyToClipboard(date)"/>
    </div>
  </div>
</template>

<script>
import {clipboard, showToast} from "@/tools/tools";
import copy from "@/assets/vue-svg/copy-transparent.svg";

export default {
  name: 'card-number',
  props: {
    date: String,
  },
  components: {
    copy,
  },
  data() {
    return {
      showFullData: false,
    }
  },
  computed: {
    shownData() {
      return this.showFullData ? this.date : '•• / ••';
    },
  },
  methods: {
    toggleType() {
      this.showFullData = !this.showFullData;
    },
    copyToClipboard(text) {
      clipboard(text, this.copyToClipboardSuccess);
    },
    copyToClipboardSuccess() {
      showToast(this.$toasted, 'Данные скопированны');
    },
  }
}
</script>