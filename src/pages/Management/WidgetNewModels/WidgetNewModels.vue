<template>
  <div class="management-main-new_models management-main-widget" :class="{'-transparent': status === 'request'}">
    <div class="management-filter_date">
      <div class="management-filter_date-format -up_l" :class="dateType === 'day' ? '-active' : ''" @click="toggleType('day')">День</div>
      <div class="management-filter_date-format" :class="dateType === 'week' ? '-active' : ''" @click="toggleType('week')">Неделя</div>
      <div class="management-filter_date-format" :class="dateType === 'month' ? '-active' : ''" @click="toggleType('month')">Месяц</div>
      <div class="management-filter_date-format" :class="dateType === 'year' ? '-active' : ''" @click="toggleType('year')">Год</div>
      <div class="management-filter_date-format -up_r" :class="dateType === 'all' ? '-active' : ''" @click="toggleType('all')">Всего</div>
    </div>
    <div class="management-main-new_models-header">
      <div class="management-main-new_models-header-title">
        <h3>Новые сотрудники</h3>
        <span v-if="status !== 'first-request'">{{ pageSubtitle }}</span>
      </div>
      <group-select v-model="calendarGroup"
                    :groups="groupsOptions"
                    class="-filter management-select"
                    :disabled="status === 'request'"
                    placeholder="Регион"
                    right
                    @change="getNewModels(false)"
      />
    </div>
    <div class="management-main-new_models-block">
      <div class="management-main-new_models-block-row">
        <div class="management-main-new_models-block-row-col -title">
          <span class="mr-1">Модели</span> <b :class="{'text-success': totalModels > 0, 'text-danger': totalModels < 0}">{{ totalModels > 0 ? '+' : '' }}{{ totalModels }}</b>
        </div>
        <template v-if="newUsers.models">
          <div class="management-main-new_models-block-row-col -registered">
            <span>{{ newUsers.models.registered }} Зарегистрировано</span>
          </div>
          <div class="management-main-new_models-block-row-col -resigned">
            <span>{{ newUsers.models.resigned }} Уволено</span>
          </div>
        </template>
      </div>
    </div>
    <div class="management-main-new_models-block">
      <div class="management-main-new_models-block-row">
        <div class="management-main-new_models-block-row-col -title">
          <span class="mr-1">Операторы</span> <b :class="{'text-success': totalOperators > 0, 'text-danger': totalOperators < 0}">{{ totalOperators > 0 ? '+' : '' }}{{ totalOperators }}</b>
        </div>
        <template v-if="newUsers.operators">
          <div class="management-main-new_models-block-row-col -registered">
            <span>{{ newUsers.operators.registered }} Зарегистрировано</span>
          </div>
          <div class="management-main-new_models-block-row-col -resigned">
            <span>{{ newUsers.operators.resigned }} Уволено</span>
          </div>
        </template>
      </div>
    </div>
<!--    <div v-if="status === 'first-request'" class="management-main-new_models-load">
      <throbber class="throbber"/>
      <span>Информация загружается, пожалуйста, подождите</span>
    </div>
    <div v-else>
      <div class="management-main-new_models-body">
        <div class="management-main-new_models-body-registered" :class="{'-empty': newModels.registered === 0}">
          <h4>{{newModels.registered === 0 ? '0' : `+${newModels.registered}`}}</h4>
          <span>Зарегистрированы</span>
        </div>
        <div class="management-main-new_models-body-resigned" :class="{'-empty': newModels.resigned === 0}">
          <h4>{{newModels.resigned === 0 ? '0' : `-${newModels.resigned}`}}</h4>
          <span>Уволены</span>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
import throbber from "@/assets/vue-svg/throbber.svg";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import { pluralize } from "@/tools/tools";

export default {
  name: "WidgetNewModels",
  components: {
    GroupSelect,
    'throbber': throbber,
  },
  props: {
    groupsOptions: Array,
  },
  data() {
    return {
      calendarGroup: null,
      dateType: 'all',
    }
  },
  computed: {
    status() {
      return this.$store.state.management.statusNewUsers;
    },
    newModels() {
      return this.$store.state.management.newModels;
    },
    newUsers() {
      return this.$store.state.management.newUsers;
    },
    totalModels() {
      if (!this.newUsers.models) return 0;
      return this.newUsers.models.registered - this.newUsers.models.resigned;
    },
    totalOperators() {
      if (!this.newUsers.operators) return 0;
      return this.newUsers.operators.registered - this.newUsers.operators.resigned;
    },
    pageSubtitle() {
      if (!this.newUsers.models) return '';
      const totalUsers = this.totalModels + this.totalOperators;
      return (totalUsers === 0 ? '' : totalUsers > 0 ? '+' : '-') + pluralize(Math.abs(totalUsers), ['сотрудник', 'сотрудника', 'сотрудников']);
    },
  },
  created() {
    this.getNewModels(true);
  },
  methods: {
    getNewModels(isFirstRequest) {
      this.$store.dispatch('management/fetchNewUsers', {
        query: {
          type: this.dateType,
          group: this.calendarGroup?.id,
        },
        isFirstRequest: isFirstRequest,
      });
    },
    toggleType(type) {
      this.dateType = type;
      this.getNewModels();
    },
    getModelTitle(count) {
      return pluralize(Math.abs(count), ['модель', 'модели', 'моделей']);
    },
  }
}
</script>