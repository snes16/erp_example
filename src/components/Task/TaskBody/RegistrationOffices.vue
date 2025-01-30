<template>
  <div class="response-task-office">
    <div class="response-info_data-files-add_office-title">{{ groups.length === 1 ? 'Офис' : 'Офисы' }}</div>
    <div class="response-info_data-files-add_office-description mt-2" v-for="(group, key) in groups" :key="key">
      <div class="response-info_data-files-add_office-description-group">
        <span class="flag-icon mr-1" :class="`flag-icon-${group.flag || 'default'}`" :title="group.country"></span>
        <span v-if="group.city" class="text-gray mr-1">{{ group.city }}</span>
        <span v-if="group.office">{{ group.office }}</span>
        <div v-if="mainGroup && mainGroup.id === group.id" class="groups_select-item-container-actions-main ml-2">Основная</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    groups: Array,
    mainGroup: Object
  }
}
</script>
