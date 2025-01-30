<template>
  <form class="communication_create" @submit.prevent="createDictionaryElement">
    <div class="communication_create-header theme-helper-content-main-header">
      <template v-if="editPermissions">
        <b-button v-if="dictionaryElement.id"
                  variant="outline-danger"
                  size="sm"
                  type="button"
                  @click="deleteDictionaryElement"
        >Удалить {{ isReasonDictionary ? 'причину' : '' }}</b-button>
        <b-button v-else variant="outline-primary"
                  size="sm"
                  type="submit"
        >Добавить {{ isReasonDictionary ? 'причину' : '' }}</b-button>
      </template>
    </div>
    <div class="communication_create-body theme-helper-content-main-body">
      <div v-if="roleTypeSelect" class="border-bottom mb-3">
        <div class="row mb-3">
          <div class="col-5">
            <b>Оргструктура</b>
          </div>
          <div class="col-7">
            <custom-select v-model="roleType"
                           :options="roleTypes"
                           required
                           :disabled="!editPermissions || dictionaryElement.id"
                           @change="editDictionaryElement"
            />
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-5">
          <b>{{ isReasonDictionary ? 'Название причины' : inputTitle }}</b>
        </div>
        <div class="col-7">
          <input v-model="title"
                 class="input-plain w-100"
                 placeholder="Введите название"
                 required
                 :disabled="!editPermissions"
                 @change="editDictionaryElement"
          />
        </div>
      </div>
      <div v-if="dictionaryElement.id" class="row">
        <div class="col-5">
          <b>Количество {{ titleCount }}</b>
        </div>
        <div class="col-7">
          <span>{{ dictionaryElement.count || dictionaryElement.counter || dictionaryElement.count_workshifts || 0 }}</span>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import CustomSelect from "@/components/Common/Select/Select";

export default {
  name: 'DictionaryDetails',
  props: {
    inputTitle: String,
    dictionaryElement: Object,
    editPermissions: Boolean,
    isReasonDictionary: {
      type: Boolean,
      default: false,
    },
    titleCount: String,
    roleTypeSelect: Boolean,
  },
  components: {
    'custom-select': CustomSelect,
  },
  data() {
    return {
      title: '',
      roleType: null,
      roleTypes: [
        {
          value: 'main',
          title: 'Основная',
        },
        {
          value: 'operator',
          title: 'Операторская',
        },
      ],
    }
  },
  created() {
    if (this.dictionaryElement) {
      this.title = this.dictionaryElement.title;
      this.roleType = this.dictionaryElement.role_type;
    }
  },
  methods: {
    deleteDictionaryElement() {
      this.$emit('delete');
    },
    createDictionaryElement() {
      this.$emit('create', {
        title: this.title,
        role_type: this.roleType,
      });
    },
    editDictionaryElement() {
      if (!this.dictionaryElement.id) return;
      this.$emit('edit', {
        title: this.title,
        role_type: this.roleType,
      });
    },
  }
}
</script>