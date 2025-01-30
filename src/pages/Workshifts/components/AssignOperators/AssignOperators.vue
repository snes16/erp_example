<template>
  <div class="assign-operators">
    <add-group v-if="status === 'add-group-operator'"
               :currentGroups="chosenOperatorGroups"
               :userId="chosenOperator.id"
               title="Офисы, в которых сотрудник может работать"
               backButton="Выбор модели"
               showGroupsForOperator
               @clickBack="backStatus"
    />
    <template v-else>
      <div class="assign-operators-header">
        <b-button v-if="status === 'workshift'" size="sm" variant="outline-primary" type="submit" class="group_settings-button throbber-button" @click="assignOperator" :disabled="!hasSaveShift || isAssigning">
          <div v-if="isAssigning" class="throbber-button-block">
            <throbber class="throbber -button -button-primary"/>
          </div>
          <span :class="{ 'text-inherit': isAssigning }">Сохранить</span>
        </b-button>
        <div class="theme-helper-content-close helper-close" @click="closeAssign()"></div>
      </div>
      <div class="assign-operators-body">
        <b-collapse v-model="collapsesStatus" id="collapse-pairs-title">
          <h3 class="assign-operators-title">{{ assignOperatorTitle }}</h3>
        </b-collapse>
        <template v-if="status === 'choose-operator'">
          <select-office v-model="chosenOffice" :currentGroup="group" :groupsOptions="groupsOptions"/>
          <search-input v-model="searchUser"/>
          <div class="assign-operators-body-list -lg"
               :class="{'-opened': !collapsesStatus}"
               ref="pairs-list"
               @scroll="handleScroll"
          >
            <div v-if="statusRequest === 'request-pairs-operators'" class="assign-operators-body-throbber">
              <div class="assign-operators-body-throbber-element">
                <throbber class="throbber"/>
              </div>
              <div class="assign-operators-body-throbber-title">
                <p>Список операторов загружается, пожалуйста, подождите</p>
              </div>
            </div>
            <div v-else-if="!operators.length" class="assign-operators-body-empty">
              <h4>Операторы не найдены</h4>
            </div>
            <div v-else v-for="operatorList in operators" class="assign-operators-body-list-block">
              <div v-if="groupsInfo[chosenOffice].type !== 'office'" class="d-flex justify-content-between">
                <div class="d-flex align-items-center assign-operators-body-list-block-office">
                  <div class="groups-nav-list-group-container-color"
                       :style="`background-color: ${groupsInfo[operatorList.group] && groupsInfo[operatorList.group].color || 'red'}`"></div>
                  <span class="groups-nav-list-group-container-title" v-if="groupsInfo[operatorList.group]">
                  <span v-if="group.type === 'country'">{{ groupsInfo[operatorList.group].city }}, </span>
                  {{ groupsInfo[operatorList.group].title }}
                </span>
                </div>
              </div>
              <div v-for="operator in operatorList.operators"
                   class="assign-operators-body-list-models"
                   :ref="`assign_operators-operator-${operator.id}`"
                   @click="chooseOperator(operator)"
              >
                <user-profile :user="operator"/>
              </div>
            </div>
            <div v-if="statusRequest === 'request-pairs-operators-next'" class="free_operators-block-content-loader -smaller">
              <throbber class="throbber -smaller"/>
            </div>
          </div>
        </template>
        <template v-if="status === 'choose-model'">
          <user-profile
              :user="chosenOperator"
              class="assign-operators-user"
              :collapses-status="collapsesStatus"
          />
          <b-collapse v-model="collapsesStatus" id="collapse-pairs-filters">
            <div class="assign-operators-body-groups">
              <div class="user_details-main-groups">
                <h4>Доступ к группам</h4>
                <b-badge v-if="chosenOperatorGroups && chosenOperatorGroups.length" pill variant="primary"
                         class="user_details-main-groups-badge">{{ chosenOperatorGroups.length }}
                </b-badge>
                <div class="user_details-main-groups-edit" id="operator-details-groups" @click="editOperatorGroups">
                  <span>Изменить</span>
                  <pen/>
                </div>
              </div>
            </div>
            <div class="assign-operators-body-filters">
              <div class="assign-operators-body-filters-main">
                <span class="assign-operators-body-filters-filter"
                      :class="{'-active': filterWithoutOperators}"
                      @click="setFilterWithoutOperators(true)"
                >Без операторов</span>
                <span class="assign-operators-body-filters-filter"
                      :class="{'-active': !filterWithoutOperators}"
                      @click="setFilterWithoutOperators(false)"
                >Все модели</span>
              </div>
              <select-office v-model="chosenOffice"
                             :currentGroup="group"
                             :groupsOptions="groupsOptionsForModels"
                             showModelOffice
              />
            </div>
          </b-collapse>
          <search-input v-model="searchUser"/>
          <div class="assign-operators-body-list -md"
               :class="{'-opened': !collapsesStatus}"
               ref="pairs-list"
               @scroll="handleScroll"
          >
            <div v-if="statusRequest === 'request-models-assign'" class="assign-operators-body-throbber">
              <div class="assign-operators-body-throbber-element">
                <throbber class="throbber"/>
              </div>
              <div class="assign-operators-body-throbber-title">
                <p>Список моделей загружается, пожалуйста, подождите</p>
              </div>
            </div>
            <div v-else-if="!modelsAssign.length && !modelsAssignWorkedBefore.length" class="assign-operators-body-empty">
              <h4>Модели не найдены</h4>
              <span>Нет доступных моделей со свободными сменами</span>
            </div>
            <template v-else>
              <div v-if="modelsAssignWorkedBefore.length" class="collapse_block" >
                <div class="collapse_block-toggle" @click="toggleCollapseWorkedBefore">
                  <b>Работал ранее</b>
                  <i class="fa fa-angle-down collapse_block-toggle-icon" :class="{'-active': collapseStatusWorkedBefore}"/>
                </div>
                <b-collapse :visible="collapseStatusWorkedBefore" id="assign_operators-worked_before" class="collapse_block-main">
                  <div v-for="modelList in modelsAssignWorkedBefore" class="assign-operators-body-list-block">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex align-items-center assign-operators-body-list-block-office">
                        <div class="groups-nav-list-group-container-color"
                             :style="`background-color: ${modelList.models[0].group.color || 'red'}`"></div>
                        <span class="groups-nav-list-group-container-title">
                          <span v-if="!chosenOffice">{{ modelList.models[0].group.city }}, </span>
                          {{ modelList.models[0].group.office }}
                        </span>
                      </div>
                      <span class="text-gray">{{ modelList.isAccess ? '' : 'Нет доступа' }}</span>
                    </div>
                    <div v-for="model in modelList.models"
                         class="assign-operators-body-list-models"
                         :ref="`assign_operators-model-worked-before-${model.id}`"
                         @click="chooseModel(model, modelList.isAccess, modelList.group)"
                    >
                      <user-profile :user="model"/>
                    </div>
                  </div>
                </b-collapse>
              </div>
              <div v-if="modelsAssign.length" class="collapse_block">
                <div class="collapse_block-toggle" @click="toggleCollapseOther">
                  <b>Все модели</b>
                  <i class="fa fa-angle-down collapse_block-toggle-icon" :class="{'-active': collapseStatusOther}"/>
                </div>
                <b-collapse :visible="collapseStatusOther" id="assign_operators-worked_before" class="collapse_block-main">
                  <div v-for="modelList in modelsAssign" class="assign-operators-body-list-block">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex align-items-center assign-operators-body-list-block-office">
                        <div class="groups-nav-list-group-container-color"
                             :style="`background-color: ${modelList.models[0].group.color || 'red'}`"></div>
                        <span class="groups-nav-list-group-container-title">
                  <span v-if="!chosenOffice">{{ modelList.models[0].group.city }}, </span>
                  {{ modelList.models[0].group.office }}
                </span>
                      </div>
                      <span class="text-gray">{{ modelList.isAccess ? '' : 'Нет доступа' }}</span>
                    </div>
                    <div v-for="model in modelList.models"
                         class="assign-operators-body-list-models"
                         :ref="`assign_operators-model-other-${model.id}`"
                         @click="chooseModel(model, modelList.isAccess, modelList.group)"
                    >
                      <user-profile :user="model"/>
                    </div>
                  </div>
                </b-collapse>
              </div>
            </template>
            <div v-if="statusRequest === 'request-models-assign-next'" class="free_operators-block-content-loader -smaller">
              <throbber class="throbber -smaller"/>
            </div>
          </div>
        </template>
        <template v-else-if="status === 'workshift'">
          <user-profile :user="chosenOperator" class="assign-operators-user-border"/>
          <user-profile :user="chosenModel" class="assign-operators-user" show-change-button @change-user="changeModel"/>
          <div v-if="loadingSchedule" class="assign-operators-body-throbber">
            <div class="assign-operators-body-throbber-element">
              <throbber class="throbber"/>
            </div>
            <div class="assign-operators-body-throbber-title">
              <p>Расписание модели загружается,<br/>пожалуйста, подождите</p>
            </div>
          </div>
          <div v-else-if="currentSchedule.workshifts && Object.keys(currentSchedule.workshifts).length"
               class="assign-operators-body-schedule">
            <!-- Приходит либо пустой массив, либо объект -->
            <div class="assign-operators-body-schedule-header">
              <div class="assign-operators-body-schedule-header-number"></div>
              <div class="assign-operators-body-schedule-header-from">НАЧАЛО</div>
              <div class="assign-operators-body-schedule-header-to">КОНЕЦ</div>
              <div class="assign-operators-body-schedule-header-operator">ОПЕРАТОР</div>
              <div class="assign-operators-body-schedule-header-status">СТАТУС</div>
              <div class="assign-operators-body-schedule-header-checkbox">
                <div class="abc-checkbox">
                  <input type="checkbox" id="allSelectedShift" v-model="allSelectedShift"
                         @change="toggleAllShifts">
                  <label for="allSelectedShift"></label>
                </div>
              </div>
            </div>
            <div class="assign-operators-body-schedule-days" v-for="(day, key) in currentShifts" :key="key">
              <div class="assign-operators-body-schedule-days-day">
                <div class="assign-operators-body-schedule-days-day-title"><b>{{ getWeekDay(key) }}</b></div>
                <div class="assign-operators-body-schedule-days-day-period_field">
                  <div class="assign-operators-body-schedule-days-day-period_field-period"
                       v-for="(period, index) in day" :key="index">
                    <div class="assign-operators-body-schedule-days-day-period_field-period-work_shifts"
                         v-for="(shifts, element) in period" :key="element">
                      <div
                          class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift"
                          v-for="(shift, block) in shifts.workshifts" :key="block">
                        <div
                            class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-from">
                          <span v-if="shift.start_at">{{ shift.start_at }}</span>
                          <span v-else class="text-secondary">{{ shift.planned_start_at }}</span>
                        </div>
                        <div
                            class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-to">
                          <span v-if="shift.end_at">{{ shift.end_at }}</span>
                          <span v-else class="text-secondary">{{ shift.planned_end_at }}</span>
                        </div>
                        <div
                            class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-operator">
                              <span v-if="saveToAssignShift[shift.id]"
                                    v-b-tooltip.hover
                                    :title="`${ saveToAssignShift[shift.id].uid || '' } ${ saveToAssignShift[shift.id].fullname || saveToAssignShift[shift.id].surname || '' }`"
                              >{{ saveToAssignShift[shift.id].surname || saveToAssignShift[shift.id].uid }}</span>
                          <span v-else-if="shift.operator"
                                v-b-tooltip.hover
                                :title="`${ shift.operator.uid || '' } ${ shift.operator.fullname || shift.operator.surname || '' }`"
                          >{{ shift.operator.surname || shift.operator.uid }}</span>
                          <span v-else class="text-grey">Нет</span>
                        </div>
                        <div
                            class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status">
                          <div
                              class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-status-title"
                              :class="`-${shift.status}`">
                            {{ scheduleStatuses[shift.status] }}
                          </div>
                        </div>
                        <div
                            class="assign-operators-body-schedule-days-day-period_field-period-work_shifts-work_shift-shift-checkbox">
                          <div class="abc-checkbox">
                            <input type="checkbox" :id="`checkbox_${shift.id}`"
                                   :value='shift.id' v-model="selectedShift">
                            <label :for="`checkbox_${shift.id}`"></label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="assign-operators-body-schedule-button">
              <b-button variant="outline-primary" :disabled="!selectedShift.length" @click="saveToAssign">
                Назначить оператора
              </b-button>
            </div>
          </div>
          <div v-else class="assign-operators-body-without-shift">
            <span>У модели нет смен, в которые можно назначить оператора<br/>в этом периоде, выберите другую модель</span>
          </div>
        </template>
        <b-modal id="assign_modal"
                 centered
                 :no-close-on-backdrop="isAssigning"
                 title="Сохранить внесенные изменения?"
                 body-bg-variant="white"
        >
          <template #modal-footer>
            <b-button variant="outline-primary" @click="closeModal">Отменить</b-button>
            <b-button variant="primary" class="throbber-button" @click="assignOperator" :disabled="isAssigning">
              <div v-if="isAssigning" class="throbber-button-block">
                <throbber class="throbber -button -button-white -button-larger"/>
              </div>
              <span :class="{ 'text-inherit': isAssigning }">Сохранить</span>
            </b-button>
          </template>
          Введенные данные могут не сохраниться, подтвердите сохранение
        </b-modal>
        <b-modal id="available_office"
                 centered
                 :no-close-on-backdrop="isEditing"
                 title="Предоставить оператору доступ к офису и выбрать модель?"
                 body-bg-variant="white"
        >
          <template #modal-footer>
            <b-button variant="outline-primary" @click="closeModalAvailable">Отменить</b-button>
            <b-button variant="primary" class="throbber-button" @click="addGroup" :disabled="isEditing">
              <div v-if="isEditing" class="throbber-button-block">
                <throbber class="throbber -button -button-white -button-larger"/>
              </div>
              <span :class="{ 'text-inherit': isEditing }">Предоставить</span>
            </b-button>
          </template>
          У оператора нет доступа к офису
          {{ groupsInfo[chosenModelInfo.officeId] && groupsInfo[chosenModelInfo.officeId].title }}
        </b-modal>
      </div>
    </template>
  </div>
</template>

<script>
import UserProfile from "@/pages/Workshifts/components/AssignOperators/UserProfile";
import throbber from "@/assets/vue-svg/throbber.svg";
import pen from "@/assets/vue-svg/pen.svg";
import moment from 'moment';
import CustomSelect from "@/components/Common/Select/Select";
import SelectOffice from "@/pages/Workshifts/components/AssignOperators/SelectOffice";
import SearchInput from "@/pages/Workshifts/components/AssignOperators/SearchInput";
import AddGroup from "@/pages/Profile/components/AddGroups/AddGroups";

moment.locale('ru');

export default {
  name: "AssignOperators",
  components: {AddGroup, SearchInput, SelectOffice, CustomSelect, UserProfile, throbber, pen},
  props: {
    group: Object,
    activeDate: {
      type: String,
      default: moment().format('YYYY-MM-DD'),
    },
    activeOperator: Object,
    activeModel: Object,
    officesList: Array
  },
  data() {
    return {
      searchString: '',
      searchUser: '',
      status: '',
      prevStatus: '',
      chosenOperator: {},
      chosenModel: {},
      scheduleStatuses: {
        created: 'Резерв',
        assigned: 'Назначена'
      },
      availableStatus: ['created', 'assigned'],
      selectedShift: [],
      allSelectedShift: true,
      saveToAssignShift: {},
      hasSaveShift: false,
      chosenOffice: null,
      chosenModelInfo: {},
      modalType: '',
      filterWithoutOperators: true,
      loadingSchedule: false,
      perPage: 10,
      collapsesStatus: true,
      collapseStatusWorkedBefore: true,
      collapseStatusOther: true,
    }
  },
  computed: {
    currentSchedule() {
      return this.$store.state.schedule.currentWeekWorkshifts;
    },
    statusRequest() {
      return this.$store.state.schedule.status;
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    statusUser() {
      return this.$store.state.users.status;
    },
    isAssigning() {
      return this.$store.state.schedule.status === 'assigning'
    },
    isEditing() {
      return this.$store.state.users.status === 'editing'
    },
    statusClose() {
      return this.$store.state.layout.statusBeforeClose
    },
    groupsOperators() {
      return this.$store.state.dictionaries.groupsOperators
    },
    groupsNonOperators() {
      return this.$store.state.dictionaries.groupsNonOperators
    },
    allShiftsIds() {
      const shiftsIds = [];
      for (const day in this.currentSchedule.workshifts) {
        for (const period in this.currentSchedule.workshifts[day]) {
          for (const room in this.currentSchedule.workshifts[day][period]) {
            const workshifts = this.currentSchedule.workshifts[day][period][room].workshifts;
            for (const workshift of workshifts) {
              if (this.availableStatus.includes(workshift.status)) {
                shiftsIds.push(workshift.id);
              }
            }
          }
        }
      }
      return shiftsIds;
    },
    currentShifts() {
      const currentShifts = {};
      const workshifts = this.currentSchedule.workshifts;
      for (const day in workshifts) {
        const dayWorkshift = {};
        const dayData = workshifts[day];
        for (const period in dayData) {
          const periodWorkshift = {};
          const periodData = dayData[period];
          for (const room in periodData) {
            const filteredWorkshifts = periodData[room].workshifts.filter(
                (workshift) => this.availableStatus.includes(workshift.status)
            );
            if(Object.keys(filteredWorkshifts).length > 0)
              periodWorkshift[room] = {...periodData[room], workshifts: filteredWorkshifts};
          }
          if(Object.keys(periodWorkshift).length > 0)
            dayWorkshift[period] = periodWorkshift;
        }
        if(Object.keys(dayWorkshift).length > 0)
          currentShifts[day] = dayWorkshift;
      }
      return currentShifts;
    },
    groupsOptions() {
      let result = [];
      result.push({id: null, title: 'Все офисы'});
      this.groupsOperators.forEach(groupCountry => {
        if (groupCountry.id === this.group.id || groupCountry.children.find(city => city.id === this.group.id)) result.push({...groupCountry, disabled: true});
        groupCountry.children.forEach(groupCity => {
          if (groupCountry.id === this.group.id || groupCity.id === this.group.id ) result.push({...groupCity, disabled: true});
          groupCity.children.forEach(groupOffice => {
            if (groupCountry.id === this.group.id || groupCity.id === this.group.id || groupOffice.id === this.group.id) result.push({...groupOffice, city: groupCity.title})
          })
        })
      })
      return result
    },
    groupsOptionsForModels() {
      let result = [];
      result.push({id: null, title: 'Все офисы'});
      this.groupsNonOperators.forEach(groupCountry => {
        result.push({...groupCountry, disabled: true});
        groupCountry.children.forEach(groupCity => {
          result.push({...groupCity, disabled: true});
          groupCity.children.forEach(groupOffice => {
            result.push({...groupOffice, city: groupCity.title})
          })
        })
      })
      return result
    },
    groupsInfo() {
      let groups = {}
      let groupsOptions = this.status === 'choose-model' ? this.groupsOptionsForModels : this.groupsOptions;
      groupsOptions.forEach(group => groups[group.id] = group )
      return groups
    },
    chosenOperatorProfile() {
      return this.$store.getters["profile/shortProfile"](Number(this.chosenOperator?.id));
    },
    chosenOperatorGroups() {
      if (!this.chosenOperator?.id) return [];
      return this.chosenOperatorProfile?.user?.groups?.map(group => group.id) || [];
    },
    assignOperatorTitle() {
      switch (this.status) {
        case 'choose-operator':
          return 'Выберите оператора';
        case 'choose-model':
          return 'Выберите офис и модель';
        case 'workshift':
          return 'Назначьте оператора';
      }
    },
    modelsAssign() {
      return this.$store.state.schedule.modelsAssign;
    },
    modelsAssignPagination() {
      return this.$store.state.schedule.modelsAssignPagination;
    },
    modelsAssignWorkedBefore() {
      return this.$store.state.schedule.modelsAssignWorkedBefore;
    },
    modelsAssignWorkedBeforePagination() {
      return this.$store.state.schedule.modelsAssignWorkedBeforePagination;
    },
    operators() {
      return this.$store.state.schedule.pairsOperators;
    },
    paginationOperators() {
      return this.$store.state.schedule.pairsOperatorsPagination;
    },
    anchorUserId() {
      const consts = {},
          type = this.status === 'choose-operator' ? 'operators' :
              this.collapseStatusWorkedBefore && this.modelsAssignWorkedBeforePagination.currentPage && (this.modelsAssignWorkedBeforePagination.currentPage < this.modelsAssignWorkedBeforePagination.totalPages) ? 'models-worked-before' : 'models-other';

      switch (type) {
        case 'operators':
          consts.pagination = this.paginationOperators;
          consts.dataField = 'operators';
          consts.listUsers = this.operators;
          break;
        case 'models-worked-before':
          consts.pagination = this.modelsAssignWorkedBeforePagination;
          consts.dataField = 'models';
          consts.listUsers = this.modelsAssignWorkedBefore;
          break;
        case 'models-other':
          consts.pagination = this.modelsAssignPagination;
          consts.dataField = 'models';
          consts.listUsers = this.modelsAssign;
      }
      let counter = 0;
      for (const group of consts.listUsers) {
        if (counter + group[consts.dataField].length >= consts.pagination.currentPage * consts.pagination.perPage - 1) {
          return group[consts.dataField][consts.pagination.currentPage * consts.pagination.perPage - 2 - counter].id;
        }
        counter += group[consts.dataField].length;
      }
    },
  },
  watch: {
    status(newStatus, prevStatus) {
      if (newStatus === 'workshift') this.selectedShift = []
      else if (newStatus === 'choose-operator') {
        if (this.group.type === 'office') this.chosenOffice = this.group.id
        this.getData()
      }
      else if (newStatus === 'choose-model') {
        this.getOperatorProfile()
        this.getData()
      }
      this.prevStatus = prevStatus;
    },
    selectedShift(newSelected) {
      if (!newSelected.length) this.allSelectedShift = false;
      else this.allSelectedShift = newSelected.length === this.allShiftsIds.length;
    },
    statusClose(newStatus) {
      if (newStatus === 'show_close') this.closeAssign();
    },
    chosenOffice() {
      this.getData();
    },
    searchUser(newSearchUser) {
      setTimeout(() => this.checkSearchUser(newSearchUser), 500);
    },
    filterWithoutOperators() {
      this.getData();
    },
    statusUser(newStatus) {
      if (newStatus === 'error') {
        this.$toasted.error('Ошибка', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
        this.$bvModal.hide('available_office')
      } else if (newStatus !== 'editing') {
        this.$bvModal.hide('available_office')
        if ((this.status === 'add-group-operator' || this.prevStatus === 'add-group-operator')) this.backStatus()
        else {
          this.chosenModel = this.chosenModelInfo.model
          this.showWorkshift()
        }
      }
    },
    statusRequest(newStatus) {
      this.$bvModal.hide('assign_modal');
      if (newStatus === 'assigned') this.closeDrover();
    },
    modelsAssign: function (newModels) {
      if (!this.chosenModel.count_workshift && this.activeModel?.id) this.chosenModel = this.findModelToAssign(newModels);
    },
    currentSchedule: function () {
      this.currentShifts;
      this.allSelectedShift = true;
      this.selectedShift = this.allShiftsIds;
      this.loadingSchedule = false;
    },
  },
  created() {
    this.$store.dispatch('layout/setStatusBeforeClose', 'ask_close');
    if (this.activeOperator) {
      this.chosenOperator = this.activeOperator;
      if (this.activeModel) {
        this.chooseModel(this.findModelToAssign());
        this.status = 'workshift'
      } else this.status = 'choose-model'
    } else this.status = 'choose-operator'
  },
  beforeDestroy() {
    this.$store.dispatch('layout/setStatusBeforeClose', '')
  },
  methods: {
    checkSearchUser(searchUser) {
      if (searchUser !== this.searchUser) return;
      this.getData();
    },
    findModelToAssign(modelsAssign = this.modelsAssign) {
      for (let officeId in modelsAssign) {
        let model = modelsAssign[officeId].models.find(currentModel => currentModel.id === this.activeModel.id);
        if (model) return model;
      }
      return this.activeModel;
    },
    chooseOperator(operator) {
      this.chosenOperator = operator
      this.status = 'choose-model'
      this.chosenOffice = null
    },
    chooseModel(model, isAccess = true, office = null) {
      if (isAccess) {
        this.chosenModel = model
        this.showWorkshift()
      } else {
        this.chosenModelInfo = {officeId: Number(office), model: model}
        this.$bvModal.show('available_office')
      }
    },
    showWorkshift() {
      this.status = 'workshift';
      this.loadingSchedule = true;
      this.$store.dispatch('schedule/fetchModelWorkShiftsWeek', {
        model: this.chosenModel.id,
        params: {
          workweek: this.activeDate,
          pagination: false
        }
      });
    },
    changeModel() {
      if (this.hasSaveShift) {
        this.modalType = 'return-models';
        this.$bvModal.show('assign_modal');
      } else {
        this.status = 'choose-model';
        this.chosenOffice = this.chosenModel.group?.id;
        this.chosenModel = {};
        this.saveToAssignShift = {};
      }
    },
    assignOperator() {
      let assignOperatorBody = []
      Object.keys(this.saveToAssignShift).map(key => {
        assignOperatorBody.push({id: Number(key), operator_id: Number(this.saveToAssignShift[key].id)})
      })
      this.$store.dispatch('schedule/assignOperator', assignOperatorBody)
    },
    closeAssign() {
      if (this.hasSaveShift) {
        this.modalType = 'close'
        this.$bvModal.show('assign_modal')
      }
      else this.closeDrover()
    },
    closeDrover() {
      this.$emit('closeDrover');
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    closeModal() {
      this.$bvModal.hide('assign_modal')
      if (this.modalType === 'return-models') {
        this.hasSaveShift = null
        this.changeModel()
      }
      else if (this.modalType === 'close') this.closeDrover()
    },
    closeModalAvailable() {
      this.$bvModal.hide('available_office')
    },
    addGroup() {
      this.$store.dispatch('users/editOperator', {
        id: this.chosenOperator.id,
        groups: this.chosenOperatorGroups.concat([this.chosenModelInfo.officeId])
      });
    },
    saveToAssign() {
      this.selectedShift.forEach(shift => this.saveToAssignShift[shift] = this.chosenOperator)
      this.hasSaveShift = !!Object.keys(this.saveToAssignShift).length
      this.selectedShift = []
    },
    toggleAllShifts() {
      this.selectedShift = []
      if (this.allSelectedShift) this.allShiftsIds.forEach(shift => this.selectedShift.push(shift))
    },
    getOperatorProfile() {
      let requestData = {
        userId: Number(this.chosenOperator.id),
        workweek: moment(this.activeDate).format('YYYY-MM-DD')
      };
      this.$store.dispatch('profile/fetchShortProfile', requestData);
    },
    getOperators(page = 1) {
      this.$store.dispatch('schedule/fetchPairsOperators', {
        workweek: this.activeDate,
        group: this.chosenOffice || this.group.id,
        search: this.searchUser || null,
        page: page,
        per_page: this.perPage})
    },
    getModelsWorkedBefore(page = 1) {
      this.$store.dispatch('schedule/fetchModelsAssignWorkedBefore', {
        user_for_pair: this.chosenOperator.id,
        workweek: this.activeDate,
        group: this.chosenOffice,
        without_operator: this.filterWithoutOperators,
        search: this.searchUser || null,
        page: page,
        per_page: this.perPage,
      });
    },
    getModels(page = 1) {
      this.$store.dispatch('schedule/fetchModelsAssign', {
        user_for_pair: this.chosenOperator.id,
        workweek: this.activeDate,
        group: this.chosenOffice,
        without_operator: this.filterWithoutOperators,
        search: this.searchUser || null,
        page: page,
        per_page: this.perPage,
      });
    },
    getWeekDay(day) {
      return moment(day).format('dd')
    },
    editOperatorGroups() {
      this.status = 'add-group-operator'
    },
    setFilterWithoutOperators(value) {
      this.filterWithoutOperators = value
    },
    getData() {
      if (this.status === 'choose-model') {
        this.getModelsWorkedBefore();
        this.getModels();
      }
      else if (this.status === 'choose-operator') this.getOperators();
    },
    backStatus() {
      if (this.status === 'add-group-operator') this.status = 'choose-model'
    },
    handleScroll() {
      this.initScrollAnimation();
      this.getUsersNextPage();
    },
    initScrollAnimation() {
      if (this.$refs[`pairs-list`].scrollHeight < document.body.clientHeight - 210) return;
      this.collapsesStatus = this.$refs[`pairs-list`].scrollTop === 0;
    },
    getUsersNextPage() {
      if (this.status === 'choose-operator') return this.onScrollUsersUpdate('operators');
      if (this.collapseStatusWorkedBefore && this.modelsAssignWorkedBeforePagination.currentPage && (this.modelsAssignWorkedBeforePagination.currentPage < this.modelsAssignWorkedBeforePagination.totalPages)) return this.onScrollUsersUpdate('models-worked-before');
      this.onScrollUsersUpdate('models-other');
    },
    onScrollUsersUpdate(type = 'operators') {
      const consts = {};
      switch (type) {
        case 'operators':
          consts.requestStatusBase = 'request-pairs-operators';
          consts.pagination = this.paginationOperators;
          consts.anchorUserRef = `assign_operators-operator-${this.anchorUserId}`;
          consts.requestMethod = this.getOperators;
          break;
        case 'models-worked-before':
          consts.requestStatusBase = 'request-models-assign';
          consts.pagination = this.modelsAssignWorkedBeforePagination;
          consts.anchorUserRef = `assign_operators-model-worked-before-${this.anchorUserId}`;
          consts.requestMethod = this.getModelsWorkedBefore;
          break;
        case 'models-other':
          consts.requestStatusBase = 'request-models-assign';
          consts.pagination = this.modelsAssignPagination;
          consts.anchorUserRef = `assign_operators-model-other-${this.anchorUserId}`;
          consts.requestMethod = this.getModels;
      }
      if ((this.statusRequest === consts.requestStatusBase) || (this.statusRequest === (consts.requestStatusBase + '-next'))) return;
      if (consts.pagination.currentPage >= consts.pagination.totalPages) return;
      if (this.$refs[consts.anchorUserRef] && this.$refs[consts.anchorUserRef][0]) {
        let middleElementPosition = this.$refs[consts.anchorUserRef][0].getBoundingClientRect().top;
        if (middleElementPosition < window.innerHeight) consts.requestMethod(consts.pagination.currentPage + 1);
      }
    },
    toggleCollapseWorkedBefore() {
      this.collapseStatusWorkedBefore = !this.collapseStatusWorkedBefore;
    },
    toggleCollapseOther() {
      this.collapseStatusOther = !this.collapseStatusOther;
    },
  }
}
</script>