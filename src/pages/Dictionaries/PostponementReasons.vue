<template>
  <dictionary-list title="переноса собеседования"
                   titleСount="переносов"
                   :dictionaryList="postponementReasons"
                   :editPermissions="userPermissions.admin.postponementReason.edit"
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
  name: "PostponementReasons",
  components: {
    DictionaryList,
  },
  computed: {
    postponementReasons() {
      return this.$store.state.postponementReasons.postponementReasons;
    },
    pagination() {
      return this.$store.state.postponementReasons.pagination;
    },
    status() {
      return this.$store.state.postponementReasons.status;
    },
    errorMessage() {
      return this.$store.state.postponementReasons.errorMessage;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    }
  },
  methods: {
    updateReasons(query) {
      this.$store.dispatch('postponementReasons/fetchPostponementReasons', query);
    },
    deleteReason(id) {
      this.$store.dispatch('postponementReasons/deletePostponementReason', id);
    },
    createReason(reason) {
      this.$store.dispatch('postponementReasons/createPostponementReason', reason);
    },
    editReason(reason) {
      this.$store.dispatch('postponementReasons/editPostponementReason', reason);
    },
  }
}
</script>