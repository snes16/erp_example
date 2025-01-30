<template>
  <div class="hidden_data -wallet_address">
    <span>{{ shownData }}</span>
    <div class="password_field-toggle">
      <i class="glyphicon"
         :class="showFullData ? 'glyphicon-eye-close' : 'glyphicon-eye-open'"
         @click="toggleType"
      />
      <copy class="workshift_details-body-main-services-service-block-copy-icon ml-2_5" @click="copyToClipboard(address)"/>
    </div>
  </div>
</template>

<script>
import {clipboard, showToast} from "@/tools/tools";
import copy from "@/assets/vue-svg/copy-transparent.svg";

export default {
  name: 'crypto-address',
  components: { copy },
  props: {
    address: String,
  },
  data() {
    return {
      showFullData: false,
    }
  },
  computed: {
    shownData() {
      return this.showFullData ? this.address : '•'.repeat(this.address.length - (this.address.length / 4)) + this.address.slice(-this.address.length / 4);
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
