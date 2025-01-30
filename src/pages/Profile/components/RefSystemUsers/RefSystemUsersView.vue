<template>
  <div class="ref_system_models theme-helper-content-main">
    <div class="theme-helper-content-main-header">
      <b-button variant="outline-primary" size="sm" @click="close">Сохранить</b-button>
    </div>
    <div class="ref_system_models-main">
      <ref-system-models-view-block title="Реферальная система" type="referal" :users="refUsers" :user-id="userId" @add="addUsers" backButton="Выбор модели" />
      <ref-system-models-view-block title="Тренерская система" type="trainer" :users="trainerUsers" :user-id="userId" @add="addUsers" backButton="Выбор модели"  />
    </div>
  </div>
</template>

<script>
import RefSystemModelsViewBlock from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersViewBlock.vue";

export default {
  name: 'ref-system-models-view',
  props: {
    userId: Number,
    refUsers: Object,
    trainerUsers: Object,
  },
  components: {
    RefSystemModelsViewBlock,
  },
  data() {
    return {
      refCollapseStatus: false,
      trainerCollapseStatus: false,
    }
  },
  created() {
    this.$store.dispatch("profile/fetchRefSystemConnectedUsers", {userId: this.userId, type: "referal"});
    this.$store.dispatch("profile/fetchRefSystemConnectedUsers", {userId: this.userId, type: "trainer"});
  },
  methods: {
    addUsers(refType) {
      this.$emit('add', refType);
    },
    close() {
      this.$emit('close');
    },
  }
}
</script>