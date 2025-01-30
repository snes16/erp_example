<template>
  <div class="hidden_data -card_number">
    <span>{{ shownData }}</span>
    <div class="password_field-toggle">
      <i class="glyphicon"
         :class="showFullData ? 'glyphicon-eye-close' : 'glyphicon-eye-open'"
         @click="toggleType"
      />
      <copy class="workshift_details-body-main-services-service-block-copy-icon  ml-2_5" @click="copyToClipboard(number)"/>
    </div>
  </div>
</template>

<script>
import {clipboard, showToast} from "@/tools/tools";
import copy from "@/assets/vue-svg/copy-transparent.svg";

export default {
  name: 'card-expires-at',
  props: {
    number: String,
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
      return this.showFullData ? `${this.number.slice(0, 4)} ${this.number.slice(4, 8)} ${this.number.slice(8, 12)} ${this.number.slice(12)}` : this.number.replace(/\d{12}/, '•••• •••• •••• ');
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