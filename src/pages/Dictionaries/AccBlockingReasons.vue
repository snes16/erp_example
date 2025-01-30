<template>
  <dictionary-list title="блокировки аккаунта"
                   titleСount="блокировок"
                   :dictionaryList="resignReasons"
                   :editPermissions="userPermissions.admin.credentialBlockingReason.edit"
                   :status="status"
                   :pagination="pagination"
                   :errorMessage="errorMessage"
                   isReasonDictionary
                   @update="updateReasons"
                   @delete="deleteReason"
                   @create="createReason"
                   @edit="editReason"
  />
</template>

<script>
import DictionaryList from "@/pages/Dictionaries/DefaultDictionary/DictionaryList";

export default {
  name: "AccBlockingReasons",
  components: {
    DictionaryList,
  },
  computed: {
    resignReasons() {
      return this.$store.state.accBlockingReasons.reasons;
    },
    status() {
      return this.$store.state.accBlockingReasons.status;
    },
    pagination() {
      return this.$store.state.accBlockingReasons.reasonsPagination;
    },
    errorMessage() {
      return this.$store.state.accBlockingReasons.errorMessage;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  methods: {
    updateReasons(query) {
      this.$store.dispatch('accBlockingReasons/fetchReasons', query);
    },
    deleteReason(id) {
      this.$store.dispatch('accBlockingReasons/removeReason', id);
    },
    createReason(reason) {
      this.$store.dispatch('accBlockingReasons/createReason', reason);
    },
    editReason(reason) {
      this.$store.dispatch('accBlockingReasons/editReason', reason);
    },
  }
}
</script>
