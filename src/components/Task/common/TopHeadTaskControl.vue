<template>
  <div>
    <div v-if="breadcrumbsTitle" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="close">
        <i class="fa fa-angle-left"></i>
        <span>{{ breadcrumbsTitle }}</span>
      </div>
    </div>
    <div v-if="vacancyTitle" class="response-link">
      <div class="theme-helper-content-main-subheader-link" @click="openVacancyCreation">
        <i class="fa fa-angle-left"></i>
        <span>{{ vacancyTitle }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "TopHeadTaskControl",
  props: {
    breadcrumbsTitle: String,
    vacancyTitle: {
      type: String,
      default: null
    },
  },
  
  methods: {
    close() {
      this.$emit("close");
    },
    openVacancyCreation() {
      this.$emit('open-vacancy-creation')
    },
  }
}
</script>

