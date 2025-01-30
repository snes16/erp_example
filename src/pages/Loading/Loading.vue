<template>
  <div class="loading">
    <throbber class="throbber"/>
  </div>
</template>

<script>
import throbber from "@/assets/vue-svg/throbber.svg";
export default {
  name: "Loading",
  components: { throbber }
}
</script>