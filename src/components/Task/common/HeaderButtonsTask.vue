<template>
  <div class="theme-helper-content-main-header response-header">
      <task-action-top-btn
        v-if="isShowActionBtn(button)"
        v-for="(button, key) in taskButtons"
        :key="key"
        :button="button"
        :taskPropCopy="taskPropCopy"
        @actionButton="actionButton(button)"
      />
      <b-button v-if="taskPropCopy.status === 'archive'"
                class="theme-helper-content-main-header-button"
                size="sm"
                variant="outline-primary"
                type="button"
                @click="unarchiveTask"
      >Сделать активной
      </b-button>
  </div>
</template>
<script>
import {makeTaskButtonName, taskButtons} from "@/components/Task/utils/CommonTaskUtils";
import {mapActions, mapState} from "vuex";
import TaskActionTopBtn from "@/components/Task/common/TaskActionTopBtn.vue";

export default {
  name: "HeaderButtonsTask",
  components: {
    'task-action-top-btn': TaskActionTopBtn
  },
  methods: {
    ...mapActions('tasks', ['createTaskCallCenter', 'createTaskInterview', 'changeTaskCallCenterToInterview', 'changeTaskArchive', 'editTask']),
    makeTaskButtonName,
    unarchiveTask() {
      if (this.taskStatus === 'editing') return;
      this.editTask({id: this.taskPropCopy.id, status: 'active'});
    },
    actionButton(button) {
      this.$emit("runTaskMethod", button);
    },
    isShowActionBtn(button) {
      
      const { type, status } = this.taskPropCopy;
      
      const isTypeExcluded = button.task_types_excluded?.includes(type);
      const isTypeIncluded = !button.task_types.length || button.task_types.includes(type);
      const isTypeValid = !isTypeExcluded && isTypeIncluded;
      
      const isStatusExcluded = button.task_status_excluded === status;
      const isStatusValid = !button.task_status || button.task_status === status;
      
      const isTaskCompleteOrArchived = ['completed', 'archive', 'check'].includes(status);
      const isDossierComplete = this.taskTypesComplete?.includes('dossier');

      return (
        isTypeValid &&
        !isStatusExcluded &&
        isStatusValid &&
        !isTaskCompleteOrArchived &&
        !isDossierComplete
      );
    }
  },
  computed: {
    ...mapState('tasks', ['taskStatus', 'task', 'currentTask']),
    taskButtons() {
      return taskButtons
    }
  },
  props: {
    taskTypesComplete: {
      type: Array
    },
    taskPropCopy: {
      type: Object
    }
  }
}
</script>


