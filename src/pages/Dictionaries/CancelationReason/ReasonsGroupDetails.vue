<template>
  <div class="cancellation_reason">
    <div class="theme-helper-content-main-header">
      <template v-if="userPermissions.admin.cancellationReason.edit">
        <template v-if="reasonsGroup.id">
          <b-button variant="outline-primary" size="sm" @click="editGroup">Сохранить</b-button>
          <b-button variant="outline-danger ml-2" size="sm" @click="deleteGroup">Удалить группу</b-button>
        </template>
        <b-button v-else variant="outline-primary" size="sm" @click="createGroup">Добавить группу</b-button>
      </template>
    </div>
    <div class="theme-helper-content-main-body">
      <h3 class="mb-4">
        <input v-model="changedGroup.title"
               v-autowidth="{maxWidth: '100%', minWidth: '20px', comfortZone: 8}"
               placeholder="Введите название"
               class="input-plain cancellation_reason-title"
               :class="titleStatus ? '' : '-error'"
               @input="inputTitle"
               @change="changeGroup"
        />
      </h3>
      <div class="row mb-3">
        <div class="col-5 pr-1">
          <b>Включить группу причин в задачи</b>
        </div>
        <div class="col-7">
          <b-form-group v-for="(title, type) in taskTypes" class="abc-checkbox m-0 mb-2"
                        :class="typeStatus ? '' : '-error'" :key="type">
            <input type="checkbox" :id="type" :value="type" v-model="changedGroup.type" @change="changeType"
                   :disabled="!userPermissions.admin.cancellationReason.edit"/>
            <label :for="type">{{ title }}</label>
          </b-form-group>
        </div>
      </div>
      <div class="border-top pt-3">
        <div v-for="(reason, key) in reasons" class="row justify-content-between mb-3" :key="key">
          <div class="col-10">
            <textarea-autosize-custom v-model="reason.title"
                                      placeholder="Введите название"
                                      class="input-plain w-100"
                                      :class="{'-error' : reason.isError}"
                                      @input="inputReason(key)"
                                      @change="changeGroup"
            />
          </div>
          <div v-if="userPermissions.admin.cancellationReason.edit" class="col-2">
            <div v-if="reasons.length > 1" class="btn-remove" @click="removeReason(key)"/>
          </div>
        </div>
        <div class="display-flex">
          <div v-if="userPermissions.admin.cancellationReason.edit"
               class="text-info display-flex align-items-center cursor-pointer"
               @click="addReason"
          >
            <span class="mr-2">Добавить причину</span>
            <div class="btn-add"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TextareaAutosizeCustom from '@/components/Common/TextareaAutosize';
import {closeToast} from "@/tools/tools";

export default {
  name: 'reasons-group-details',
  props: {
    reasonsGroup: Object,
  },
  components: {
    TextareaAutosizeCustom,
  },
  data() {
    return {
      changedGroup: {},
      reasons: [{}],
      taskTypes: {
        call_center: "Call Center",
        interview: "Собеседование",
      },
      titleStatus: true,
      typeStatus: true,
    }
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    status() {
      return this.$store.state.cancellationReasons.status;
    },
  },
  created() {
    this.changedGroup = {...this.reasonsGroup, type: this.reasonsGroup.type ? [...this.reasonsGroup.type] : []};
    if (this.changedGroup.rejections?.length) this.reasons = this.changedGroup.rejections ? this.changedGroup.rejections.map(reason => {return {...reason}}) : [];
  },
  methods: {
    createGroup() {
      if (this.status === 'creating') return;
      if (!this.changedGroup.title) return this.titleStatus = false;
      if (!this.changedGroup.type.length) return this.showTypeError();
      if(this.validateForm()) return this.showErrorMessage('Название причины должно содержать как минимум два символа');
      this.$store.dispatch('cancellationReasons/createReasonsGroup', {
        ...this.changedGroup,
        rejections: this.reasons
      });
    },
    validateForm() {
      let reasonWithError = false;
      this.reasons = this.reasons.map(reason => {
        let errorCheckResult = !reason.title || reason.title.length < 2;
        if (errorCheckResult) reasonWithError = true;
        return {
          ...reason,
          isError: errorCheckResult,
        }
      })
      return reasonWithError;
    },
    editGroup() {
      this.$emit('close');
    },
    addReason() {
      this.reasons = [...this.reasons, {}];
    },
    removeReason(key) {
      this.reasons = this.reasons.filter((_, index) => index !== key);
      this.changeGroup();
    },
    deleteGroup() {
      this.$emit('delete');
    },
    inputTitle() {
      this.titleStatus = true;
    },
    inputReason(index) {
      if (!this.reasons[index].isError) return;
      this.reasons = this.reasons.map((reason, key) => {
        if (index !== key) return reason;
        return {
          ...reason,
          isError: false,
        }
      })
    },
    changeType() {
      this.typeStatus = true;
      this.changeGroup();
    },
    changeGroup() {
      if (!this.changedGroup.id) return;
      if (!this.changedGroup.title) return this.titleStatus = false;
      if (!this.changedGroup.type.length) return this.showTypeError();
      if(this.validateForm()) return this.showErrorMessage('Название причины должно содержать как минимум два символа');
      this.$store.dispatch('cancellationReasons/editReasonsGroup', {
        ...this.changedGroup,
        rejections: this.reasons
      });
    },
    showErrorMessage(errorMessage){
      this.$toasted.error(errorMessage, {
        className: ['toasted-error'],
        action: {
          class: 'btn-close',
          onClick: closeToast
        },
      });
    },
    showTypeError() {
      this.showErrorMessage('Необходимо выбрать как минимум один вариант задачи')
      this.typeStatus = false;
    },
  }
}
</script>