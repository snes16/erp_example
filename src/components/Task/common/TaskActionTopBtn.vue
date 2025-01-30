<template>
  <b-button
            class="theme-helper-content-main-header-button"
            size="sm"
            variant="outline-primary"
            :type="button.type"
            @click="actionButton"
  >
    {{ btnName }}
  </b-button>
</template>
<script>
import {makeTaskButtonName} from "@/components/Task/utils/CommonTaskUtils";

export default {
  name: "TaskActionTopBtn",
  props: {
    button: {
      type: Object,
    },
    taskPropCopy: {
      type: Object
    }
  },
  computed: {
    btnName() {
      return  makeTaskButtonName(this.button.name, this.taskPropCopy.next_type_task)
    }
   },
  methods: {
    actionButton() {
      this.$emit('actionButton')
    }
  }
}
</script>
