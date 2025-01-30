<template>
  <custom-select :value="value"
                 class="assign-operators-body-office-select"
                 valueField="id"
                 titleField="fullname"
                 defaultText="Выберите офис"
                 :options="groupsOptions"
                 :disabled="currentGroup && currentGroup.type === 'office' && !showModelOffice"
                 :id="id"
                 @change="setSelect"
  >
    <template v-slot:chosen-variant="value">
      <span v-if="!value.value">Выберите офис</span>
      <div v-else>
        <span class="groups-nav-list-group-container-title">{{ value.value.title }}</span>
      </div>
    </template>
    <template v-slot:list-variant="variant">
      <div :class="`assign-operators-body-office-select-${variant.variant.type || 'country'}`">
        <div class="d-flex align-items-center position-relative"
             :class="`assign-operators-body-office-select-${variant.variant.type || 'country'}-info`">
          <div class="groups-nav-list-group-container-color"
               :style="`background-color: ${variant.variant.color || 'red'}`" v-if="variant.variant.id"></div>
          <span class="groups-nav-list-group-container-title">{{ variant.variant.title }}</span>
        </div>
      </div>
    </template>
  </custom-select>
</template>

<script>
import CustomSelect from "@/components/Common/Select/Select";
export default {
  name: "SelectOffice",
  components: {CustomSelect},
  props: {
    value: Number,
    groupsOptions: Array,
    currentGroup: Object,
    showModelOffice: {
      type: Boolean,
      default: false
    },
    id: String,
  },
  model: {
    prop: 'value',
    event: 'select'
  },
  methods: {
    setSelect(newOffice) {
      this.$emit('select', newOffice)
    }
  }
}
</script>