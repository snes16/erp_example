<template>
  <div>
    <div :id="id" class="glyphicon-fired"></div>
    <b-tooltip :target="id" :offset="offset" triggers="hover" >
      <div class="profile-main-info-data-resign-tooltip">
        <div>Сотрудник уволен {{ formattedTime }}</div>
        <div><b>Причина увольнения:</b> {{ user.resign }}</div>
        <div v-if="user.resign_comment"><b>Комментарий:</b> {{ user.resign_comment }}</div>
      </div>
    </b-tooltip>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'user-resign-icon',
  props: {
    user: Object,
    id: {
      type: String,
      default: 'resign_info',
    },
    offset: Number,
  },
  computed: {
    formattedTime() {
      return this.user.resign_date ? moment.parseZone(this.user.resign_date).format('DD.MM.YYYY') : '';
    },
  },
}
</script>