<template>
  <dictionary-list title="отмены смен"
                   titleСount="отмененных смен"
                   :dictionaryList="resignReasons"
                   :editPermissions="userPermissions.admin.cancel.workshifts.edit"
                   :status="status"
                   :pagination="pagination"
                   :errorMessage="errorMessage"
                   isReasonDictionary
                   withTitleSort
                   @update="updateReasons"
                   @delete="deleteReason"
                   @create="createReason"
                   @edit="editReason"
  />
</template>

<script>
import DictionaryList from "@/pages/Dictionaries/DefaultDictionary/DictionaryList";

export default {
  name: "CancelWorkshiftReasons",
  components: {
    DictionaryList,
  },
  computed: {
    resignReasons() {
      return this.$store.state.cancelWorkshiftReasons.reasons;
    },
    status() {
      return this.$store.state.cancelWorkshiftReasons.status;
    },
    pagination() {
      return this.$store.state.cancelWorkshiftReasons.reasonsPagination;
    },
    errorMessage() {
      return this.$store.state.cancelWorkshiftReasons.errorMessage;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  methods: {
    updateReasons(query) {
      this.$store.dispatch('cancelWorkshiftReasons/fetchReasons', query);
    },
    deleteReason(id) {
      this.$store.dispatch('cancelWorkshiftReasons/removeReason', id);
    },
    createReason(reason) {
      this.$store.dispatch('cancelWorkshiftReasons/createReason', reason);
    },
    editReason(reason) {
      this.$store.dispatch('cancelWorkshiftReasons/editReason', reason);
    },
  }
}
</script>
