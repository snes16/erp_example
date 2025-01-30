<template>
  <user-profile :user="chosenOperator"
                class="assign-operators-user"
                :groups-operator="groupsOperator"
                :collapses-status="collapsesStatus"
                @editOperatorGroups="editOperatorGroups"
  />
</template>

<script>
import UserProfile from "@/pages/Workshifts/components/AssignOperators/UserProfile";

export default {
  name: "OperatorInfo",
  components: {UserProfile},
  props: {
    chosenOperator: Object,
    groupsOperator: Array,
    collapsesStatus: Boolean,
  },
  methods: {
    editOperatorGroups() {
      this.$emit('editOperatorGroups');
    },
  }
}
</script>