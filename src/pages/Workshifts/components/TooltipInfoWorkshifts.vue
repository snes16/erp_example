<template>
  <b-tooltip :target="target" triggers="hover" boundary="viewport" :delay="{ 'show': 150, 'hide': 0 }"
             custom-class="model_mini_profile-schedule-tooltip" placement="bottom">
    <h5 class="model_mini_profile-schedule-tooltip-title">Информация о смене</h5>
    <div v-for="workshift in workshifts" class="model_mini_profile-schedule-tooltip-workshift">
      <div class="model_mini_profile-schedule-tooltip-workshift-partner">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <div v-if="workshift.partner && workshift.partner.id"
                 class="avatar -sm mr-2 cursor-pointer"
                 :style="workshift.partner.avatar ? `background-image: url(${getSmallImage(workshift.partner.avatar)}); background-size: cover;` : ''"
                 @click="openMiniProfile(workshift.partner)"
            ></div>
            <div class="d-flex flex-column align-items-start">
              <div v-if="workshift.partner"
                   class="model_mini_profile-schedule-tooltip-workshift-partner-fullname cursor-pointer"
                   @click="openMiniProfile(workshift.partner)"
              >
                <span>{{ workshift.partner.uid }} {{ workshift.partner.surname }}</span>
                <div v-if="workshift.partner.is_resign" class="glyphicon-fired ml-1"></div>
                <div v-else-if="workshift.partner.blocked" class="glyphicon-blocked ml-1"></div>
              </div>
              <span :class="{'text-gray': workshift.partner}">{{ workshift.time }}</span>
            </div>
          </div>
          <div class="model_mini_profile-schedule-tooltip-workshift-status" :class="`-${workshift.status}`">
            {{ workshiftStatuses[workshift.status] }}
          </div>
        </div>
        <p v-if="workshift.cancel" class="text-gray mt-1 mb-0 text-left"><b>Причина отмены:</b> {{ workshift.cancel.title }}</p>
      </div>
      <div v-if="workshift.group" class="model_mini_profile-schedule-tooltip-workshift-group">
        <span class="model_mini_profile-schedule-tooltip-workshift-group-flag flag-icon"
              :class="`flag-icon-${workshift.group.flag || 'default'}`"
        />
        <div class="model_mini_profile-schedule-tooltip-workshift-group-info">
          <span class="text-gray">{{ workshift.group.city }}</span>
          <span>{{ workshift.group.office }}</span>
        </div>
      </div>
    </div>
  </b-tooltip>
</template>

<script>
import {getSmallImage} from "@/tools/tools";

export default {
  name: "TooltipInfoWorkshifts",
  props: {
    target: String,
    workshifts: Array
  },
  computed: {
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    }
  },
  methods: {
    openMiniProfile(user) {
      this.$emit('openMiniProfile', user)
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
  }
}
</script>