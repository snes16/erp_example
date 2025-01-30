<template>
  <b-form class="response-action_form" @submit.prevent="submit">
    <div class="response-action_form-title">
      <p class="response-action_form-title-text">Результат тестирования</p>
      <div v-if="!(taskPropCopy && taskPropCopy.type === 'psych' && taskPropCopy.status === 'completed')" class="helper-close" @click="closeForm"></div>
    </div>
    <b-textarea placeholder="Добавьте комментарий" v-model="taskPropCopy.result" :disabled="taskPropCopy && taskPropCopy.status === 'completed'" required/>
    <div v-if="taskPropCopy && taskPropCopy.status !== 'completed'" class="response-action_form-send_field" :style="'border-top: none'">
      <b-button size="md" variant="info" type="submit">Выполнить</b-button>
    </div>
  </b-form>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar.vue";

export default {
  props: {
    model: Object,
    taskPropCopy: Object
  },
  components: {
  'avatar': Avatar,
  },
  methods: {
    closeForm() {
      this.$emit('closeForm');
    },
    submit(e) {
      this.$emit('submit', e);
    }
  }
  
};
</script>
