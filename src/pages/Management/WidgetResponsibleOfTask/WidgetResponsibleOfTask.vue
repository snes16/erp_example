<template>
  <div class="management-main-responsible management-main-widget"
       :class="{'-transparent': statusTasks === 'request'}">
    <div class="management-main-responsible-header">
      <div class="management-main-responsible-header-title">
        <h3>Статус задач</h3>
      </div>
      <group-select v-model="calendarGroup"
                    :groups="groupsOptions"
                    class="-filter management-select"
                    :disabled="statusTasks === 'request'"
                    placeholder="Регион"
                    right
                    @change="getTaskWidget(false)"
      />
    </div>
    <div v-if="statusTasks === 'first-request'" class="management-main-responsible-load">
      <throbber class="throbber"/>
      <span>Информация загружается, пожалуйста, подождите</span>
    </div>
    <div v-else>
      <div v-if="!taskWidget.length" class="management-main-responsible-load">
        <h3>Задачи и ответственные по ним не найдены</h3>
        <span>Возможно задачи еще не были созданы</span>
      </div>
      <div v-else class="management-main-responsible-table">
        <div class="management-main-responsible-table-header">
          <div class="management-main-responsible-table-header-user">
            <span class="mr-2">Исполнитель</span>
            <i class="fa fa-chevron-down cell-arrow"
               :class="{'-active': (sortBy === 'surname') && sortAscending}"
               @click="sortTable('surname')"
            />
          </div>
          <div class="management-main-responsible-table-header-group">
            <span>Регион</span>
          </div>
          <div class="management-main-responsible-table-header-tasks">
            <div class="task-status">
              <span>Просроченные</span>
              <i class="fa fa-chevron-down cell-arrow"
                 :class="{'-active': (sortBy === 'overdued') && sortAscending}"
                 @click="sortTable('overdued')"
              />
            </div>
            <div class="task-status">
              <span>Отложенные</span>
              <i class="fa fa-chevron-down cell-arrow"
                 :class="{'-active': (sortBy === 'postponed') && sortAscending}"
                 @click="sortTable('postponed')"
              />

            </div>
            <div class="task-status">
              <span>Активные</span>
              <i class="fa fa-chevron-down cell-arrow"
                 :class="{'-active': (sortBy === 'active') && sortAscending}"
                 @click="sortTable('active')"
              />
            </div>
          </div>
        </div>
        <div class="management-main-responsible-table-body" @scroll="handleScroll">
          <div v-for="(responsible, index) in taskWidget" class="management-main-responsible-table-body-element"
               :ref="`responsible-${index}`">
            <div class="management-main-responsible-table-body-element-user cursor-pointer"
                 @click="openMiniProfile(responsible.user)">
              <avatar class="mr-2"
                      size="-md"
                      :url="responsible.user.avatar"
                      is-large
                      :telegram="responsible.user.telegram_connected"
                      :is-fin-admin="responsible.user.is_fin_admin"
              />
              <div class="management-main-responsible-table-body-element-user-info">
                <span class="management-main-responsible-table-body-element-user-info-fullname">{{
                    responsible.user.fullname
                  }}</span>
              </div>
            </div>
            <div class="management-main-responsible-table-body-element-group">
              <div class="management-main-responsible-table-body-element-group-title">
                          <span class="management-main-responsible-table-body-element-group-title-flag flag-icon"
                                :class="`flag-icon-${responsible.user.main_group.flag || 'default'}`"></span>
              </div>
              <div class="management-main-responsible-table-body-element-group-title-label">
                <span class="text-gray">{{
                    responsible.user.main_group.city
                  }} </span>{{ responsible.user.main_group.office }}
              </div>
            </div>
            <div class="management-main-responsible-table-body-element-task">
              <div class="management-main-responsible-table-body-element-task-expired -alert">
                <span>{{ responsible.tasks.overdued || '' }}</span>
              </div>
              <div class="management-main-responsible-table-body-element-task-postpone">
                <span>{{ responsible.tasks.postponed || '' }}</span>
              </div>
              <div class="management-main-responsible-table-body-element-task-active">
                <span>{{ responsible.tasks.active || '' }}</span>
              </div>
            </div>
          </div>
          <div v-if="statusTasks === 'request_pagination'" class="management-main-responsible-load -smaller">
            <throbber class="throbber -smaller"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DateScroll from "@/pages/Management/components/DateScroll";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import Avatar from "@/components/Common/Avatar/Avatar";
import throbber from "@/assets/vue-svg/throbber.svg";
import {getSmallImage} from "@/tools/tools";

export default {
  name: "WidgetResponsibleOfTask",
  components: {
    DateScroll,
    GroupSelect,
    'throbber': throbber,
    'avatar': Avatar,
  },
  props: {
    groupsOptions: Array,
  },
  data() {
    return {
      calendarGroup: null,
      perPage: 10,
      sortBy: 'surname',
      sortAscending: false,
    }
  },
  computed: {
    statusTasks() {
      return this.$store.state.management.statusTasks
    },
    tasksHeaders() {
      return this.$store.state.management.tasksHeaders
    },
    taskWidget() {
      return this.$store.state.management.tasks
    },
    taskTypes() {
      return this.$store.state.dictionaries.allTaskTypes;
    }
  },
  created() {
    this.getTaskWidget(true)
  },
  methods: {
    getTaskWidget(isFirstRequest) {
      this.$store.dispatch('management/fetchTaskWidget', {
        query: {
          [`order[${this.sortBy}]`]: this.sortAscending ? 'asc' : 'desc',
          ['groups.id']: this.calendarGroup?.id,
          per_page: this.perPage,
        },
        isFirstRequest: isFirstRequest
      })
    },
    sortTable(field) {
      this.sortAscending = this.sortBy === field ? !this.sortAscending : true;
      this.sortBy = field;
      this.getTaskWidget();
    },
    getTaskWidgetNextPage() {
      this.$store.dispatch('management/fetchTaskWidgetNextPage', {
        [`order[${this.sortBy}]`]: this.sortAscending ? 'asc' : 'desc',
        ['groups.id']: this.calendarGroup?.id,
        per_page: this.perPage,
        page: this.tasksHeaders.currentPage + 1
      });
    },
    openMiniProfile(user) {
      this.$emit('openMiniProfile', user)
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    handleScroll(e) {
      if ((this.tasksHeaders.currentPage >= this.tasksHeaders.totalPages) || (this.statusTasks === 'request_pagination')) return;
      let middleElement = this.taskWidget.length - (this.taskWidget.length % this.perPage) - Math.floor(this.perPage / 2);
      let middleElementPosition = this.$refs[`responsible-${middleElement}`][0].getBoundingClientRect().top
      if (middleElementPosition <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height) this.getTaskWidgetNextPage();
    }
  }
}
</script>