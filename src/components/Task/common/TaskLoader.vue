<template>
  <div class="response-load">
    <throbber class="throbber"/>
    <span class="vacancies-table-load-title">Данные загружаются, пожалуйста, подождите</span>
  </div>
</template>
<script>
import throbber from "@/assets/vue-svg/throbber.svg";

export default {
  name: "TaskLoader",
  components: {
    'throbber': throbber,
  },
}
</script>


