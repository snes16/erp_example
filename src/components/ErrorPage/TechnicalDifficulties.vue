<template>
  <div class="loading">
    <gears class="mb-4" />
    <h3>Сервис временно недоступен</h3>
    <p>На сервисе ведутся технические работы.<br/>Это может занять некоторое время. Повторите попытку позже.</p>
  </div>
</template>

<script>
import gears from "@/assets/vue-svg/gears.svg";

export default {
  name: 'technical-difficulties',
  components: {
    'gears': gears,
  }
}
</script>
