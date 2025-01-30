<template>
  <div class="d-flex align-items-center">
    <i class="flag-icon mr-2"
       :class="`flag-icon-${group.flag || 'default'}`"
    />
    <div class="workshifts-group_info">
      <p class="fs-13 text-gray mb-0">{{ group.city }}</p>
      <p class="fs-13 mb-0">{{ group.city ? group.office : group.country }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'group-info',
  props: {
    group: Object,
  },
}
</script>