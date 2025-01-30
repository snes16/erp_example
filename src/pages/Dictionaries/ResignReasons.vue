<template>
  <dictionary-list title="увольнения сотрудников"
                   titleСount="увольнений"
                   :dictionaryList="resignReasons"
                   :editPermissions="userPermissions.admin.resignReason.edit"
                   :status="status"
                   :pagination="pagination"
                   :errorMessage="errorMessage"
                   isReasonDictionary
                   role-type-select
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
    resignReasons() {
      return this.$store.state.resignReasons.resignReasons;
    },
    status() {
      return this.$store.state.resignReasons.status;
    },
    pagination() {
      return this.$store.state.resignReasons.pagination;
    },
    errorMessage() {
      return this.$store.state.nationalities.errorMessage;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  methods: {
    updateReasons(query) {
      this.$store.dispatch('resignReasons/fetchResignReasons', query);
    },
    deleteReason(id) {
      this.$store.dispatch('resignReasons/deleteResignReason', id);
    },
    createReason(reason) {
      this.$store.dispatch('resignReasons/createResignReason', reason);
    },
    editReason(reason) {
      this.$store.dispatch('resignReasons/editResignReason', reason);
    },
  }
}
</script>