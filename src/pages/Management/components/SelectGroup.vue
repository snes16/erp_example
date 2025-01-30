<template>
  <custom-select :value="value"
                 valueField="id"
                 defaultText="Выберите офис"
                 :options="groupsOptions"
                 :disabled="disabled"
                 return-whole-object
                 :right="right"
                 :error="error"
                 :required="required"
                 @change="changeGroup"
  >
    <template v-slot:chosen-variant="value">
      <span v-if="!value.value">Регион</span>
      <div v-else>
        <span v-if="value.value.build_group && showFlag" class="flag-icon mr-1" :class="`flag-icon-${value.value.build_group.flag || 'default'}`"></span>
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
  name: "select-group",
  components: {CustomSelect},
  props: {
    value: [Number, Object],
    groupsOptions: Array,
    disabled: {
      type: Boolean,
      default: false
    },
    returnWholeObject: {
      type: Boolean,
      default: false
    },
    right: Boolean,
    error: Boolean,
    required: Boolean,
    showFlag: Boolean,
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  methods: {
    changeGroup(newOffice) {
      this.$emit('change', this.returnWholeObject ? newOffice : newOffice.id)
    }
  }
}
</script>