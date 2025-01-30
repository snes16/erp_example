<template>
  <dictionary-list title="Национальность"
                   titleСount="моделей"
                   :dictionaryList="nationalities"
                   :editPermissions="userPermissions.admin.nationality.edit"
                   :status="status"
                   :pagination="pagination"
                   :errorMessage="errorMessage"
                   @update="updateNationalities"
                   @delete="deleteNationality"
                   @create="createNationality"
                   @edit="editNationality"
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
    nationalities() {
      return this.$store.state.nationalities.nationalities;
    },
    pagination() {
      return this.$store.state.nationalities.pagination;
    },
    status() {
      return this.$store.state.nationalities.status;
    },
    errorMessage() {
      return this.$store.state.nationalities.errorMessage;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
  },
  methods: {
    updateNationalities(query) {
      this.$store.dispatch('nationalities/fetchNationalities', query);
    },
    deleteNationality(id) {
      this.$store.dispatch('nationalities/deleteNationality', id);
    },
    createNationality(nationality) {
      this.$store.dispatch('nationalities/createNationality', nationality);
    },
    editNationality(nationality) {
      this.$store.dispatch('nationalities/editNationality', nationality);
    },
  }
}
</script>