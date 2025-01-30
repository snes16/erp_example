<template>
  <div class="free_operators" ref="operators-container">
    <div class="free_operators-block">
      <div class="card">
        <div class="free_operators-block-content">
          <div class="free_operators-block-content-row -header">
            <div class="free_operators-block-content-row-col">
              <span>Оператор</span>
            </div>
            <div class="free_operators-block-content-row-col -groups_header">
              <span>Доступные офисы</span>
            </div>
          </div>
          <div class="px-4 mb-2 mt-3">
            <b-input-group>
              <b-input-group-text slot="append"><search/></b-input-group-text>
              <b-form-input v-model="searchStringOperators"
                            placeholder="Поиск"
                            type="text"
                            @input="onInputSearchString('operators')"
              />
            </b-input-group>
          </div>
          <div v-if="isAnyOperators" class="free_operators-block-content-scrollable_block" @scroll="handleScrollOperators">
            <template v-for="group in formattedOperators" v-if="groupsInfo[group.group]">
              <div v-if="activeGroup.type !== 'office'" class="free_operators-block-content-row -subheader">
                <div class="groups-nav-list-group-container-color" :style="`background-color: ${groupsInfo[group.group].color || 'red'}`"></div>
                <span class="groups-nav-list-group-container-title"><template v-if="activeGroup.type === 'country'">{{ groupsInfo[group.group].city }}, </template>{{ groupsInfo[group.group].title }}</span>
              </div>
              <div v-for="operator in group.operators"
                   class="free_operators-block-content-row"
                   :class="{'-active': operator.id === activeOperatorId}"
                   :key="operator.id"
                   :ref="lastMiddleOperator.id === operator.id ? `middle-operator-${lastMiddleOperator.id}` : 'operator'"
                   @click="setActiveOperator(operator.id)"
              >
                <div class="free_operators-block-content-row-col -user">
                  <avatar size="-lg"
                          :url="operator.avatar"
                          :telegram="operator.telegram_connected"
                          :is-fin-admin="operator.is_fin_admin"
                          :absences="operator.absences"
                  />
                  <div class="free_operators-block-content-row-col-data" v-b-tooltip.hover :title="`${operator.uid} ${operator.surname}`">
                    <p class="text-gray"><b>{{ operator.uid }}</b></p>
                    <p><b>{{ operator.surname }}</b></p>
                  </div>
                </div>
                <div class="free_operators-block-content-row-col -groups">
                  <div v-for="group in operator.shownOffices" v-if="group.office" class="free_operators-block-content-row-col-group">
                    <div class="groups-nav-list-group-container-color" :style="`background-color: ${group.color || 'red'}`"></div>
                    <span class="groups-nav-list-group-container-title">{{ group.office }}</span>
                  </div>
                  <template v-if="operator.moreOfficesText">
                    <div class="cursor-pointer" :id="`operator-offices-${operator.id}`">{{ operator.moreOfficesText }}</div>
                    <b-tooltip :target="`operator-offices-${operator.id}`" custom-class="free_operators-block-content-row-col-tooltip" triggers="hover">
                      <div v-for="country in operator.formattedOffices" class="free_operators-block-content-row-col-tooltip-block mb-2">
                        <i class="flag-icon mr-2" :class="`flag-icon-${country.flag || 'default'}`"/>
                        <div>
                          <span v-for="(city, cityKey) in country.cities">
                            <span v-if="cityKey !== 0">, </span>
                            <span>{{ city.title }}</span>
                            <span class="text-gray-400 pl-1">(<template v-for="(office, officeKey) in city.offices"><template v-if="officeKey !== 0">, </template>{{ office.title }}</template>)</span>
                          </span>
                        </div>
                      </div>
                    </b-tooltip>
                  </template>
                </div>
              </div>
            </template>
          </div>
          <div v-else-if="!isOperatorsListLoading" class="free_operators-block-content-row -empty">
            <h4>Операторы не найдены</h4>
            <p>Нет свободных операторов</p>
          </div>
          <div v-if="isOperatorsListLoading" class="free_operators-block-content-loader -smaller">
            <throbber class="throbber -smaller"/>
          </div>
        </div>
      </div>
    </div>
    <div class="free_operators-block">
      <div class="card">
        <div class="free_operators-block-content">
          <div class="free_operators-block-content-row -header">
            <div class="free_operators-block-content-row-col">
              <span>Модель</span>
            </div>
            <div class="free_operators-block-content-row-col -groups_header">
              <span>Офис</span>
            </div>
          </div>
          <div class="px-4 mb-2 mt-3">
            <b-input-group>
              <b-input-group-text slot="append"><search/></b-input-group-text>
              <b-form-input v-model="searchStringModels"
                            placeholder="Поиск"
                            type="text"
                            @input="onInputSearchString('models')"
              />
            </b-input-group>
          </div>
          <div v-if="formattedModels.length" class="free_operators-block-content-scrollable_block" @scroll="handleScrollModels">
            <div v-for="model in formattedModels"
                 class="free_operators-block-content-row"
                 :class="{'-active': model.id === activeModelId}"
                 :key="model.id"
                 :ref="lastMiddleModel.id === model.id ? `middle-model-${lastMiddleModel.id}` : 'model'"
                 @click="setActiveModel(model.id)"
            >
              <div class="free_operators-block-content-row-col -user">
                <avatar size="-lg"
                        :url="model.avatar"
                        :telegram="model.telegram_connected"
                        :is-fin-admin="model.is_fin_admin"
                />
                <div class="free_operators-block-content-row-col-data">
                  <p v-b-tooltip.hover :title="`${model.uid} ${model.surname}`"><b class="text-gray">{{ model.uid }} </b><b>{{ model.surname }}</b></p>
                  <div v-if="model.model_nickname && !model.surname" class="d-flex align-items-center">
                    <at class="mr-1"/>
                    <b>{{ model.model_nickname }}</b>
                  </div>
                  <p>{{ getModelShiftsInfo(model) }}</p>
                </div>
              </div>
              <div class="free_operators-block-content-row-col -groups">
                <div class="free_operators-block-content-row-col-group">
                  <i class="groups-nav-list-group-container-color" :style="`background-color: ${model.group.color || 'red'}`"/>
                  <span class="groups-nav-list-group-container-title"
                        :class="{'text-danger': model.groupAccessError}"
                  >{{ model.group.office }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!isModelsListLoading" class="free_operators-block-content-row -empty">
            <h4>Модели не найдены</h4>
            <p>Нет моделей со сменами без оператора</p>
          </div>
          <div v-if="isModelsListLoading" class="free_operators-block-content-loader -smaller">
            <throbber class="throbber -smaller"/>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeOperator && activeOperator.id && activeModel && activeModel.id" class="free_operators-actions">
      <b-button variant="outline-primary" @click="tryAddingToSomeShifts">Выбрать смены</b-button>
      <b-button variant="primary" class="throbber-button" :disabled="scheduleStatus === 'all-assigning'" @click="tryAddingToAllShifts">
        <div v-if="scheduleStatus === 'all-assigning'" class="throbber-button-block">
          <throbber class="throbber -button -button-white -button-larger"/>
        </div>
        <span :class="{ 'text-inherit': scheduleStatus === 'all-assigning' }">Назначить на все смены</span>
      </b-button>
    </div>
    <b-modal id="add_free_operator_to_model"
             centered
             title="У оператора нет доступа к офису модели. Предоставить доступ?"
             body-bg-variant="white"
             ok-title="Предоставить"
             ok-variant="primary"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="addOperatorToModelsGroup">
      У оператора нет доступа к офису {{ activeModel && activeModel.group && activeModel.group.office }}
    </b-modal>
  </div>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";
import throbber from "@/assets/vue-svg/throbber.svg";
import at from "@/assets/vue-svg/at.svg";
import search from "@/assets/vue-svg/search.svg"
import { pluralize } from "@/tools/tools";

export default {
  props: {
    activeDate: String,
    activeGroup: Object,
    officesList: Array,
  },
  components: {
    'avatar': Avatar,
    'throbber': throbber,
    'at': at,
    'search': search,
  },
  data() {
    return {
      activeOperatorId: null,
      activeModelId: null,
      commandAfterUserEdit: null,
      searchStringOperators: '',
      searchStringModels: '',
    }
  },
  computed: {
    freeOperators() {
      return this.$store.state.schedule.freeOperators;
    },
    paginationFreeOperators() {
      return this.$store.state.schedule.freeOperatorsPagination;
    },
    formattedOperators() {
      return this.freeOperators.map(group => ({
        ...group,
        operators: group.operators.map(operator => {
          const formattedOffices = [];
          if (operator.groups?.length > 2) operator.groups.forEach(office => {
            const currentCountry = formattedOffices.find(country => country.id === office.country_id);
            if (!currentCountry) return formattedOffices.push({
              id: office.country_id,
              title: office.country,
              flag: office.flag,
              cities: [{
                id: office.city_id,
                title: office.city,
                offices: [office],
              }],
            });
            const currentCity = currentCountry.cities.find(city => city.id === office.city_id);
            if (!currentCity) return currentCountry.cities.push({
              id: office.city_id,
              title: office.city,
              offices: [office],
            });
            currentCity.offices.push(office);
          });
          return {
            ...operator,
            shownOffices: operator.groups?.slice(0, 2),
            formattedOffices,
            moreOfficesText: operator.groups?.length > 2 ? `Еще ${pluralize(operator.groups.length - 2, ['офис', 'офиса', 'офисов'])}` : '',
          }
        }),
      }));
    },
    modelsWithoutOperators() {
      return this.$store.state.schedule.modelsWithoutOperators;
    },
    formattedModels() {
      if (!this.activeOperator) return this.modelsWithoutOperators;
      return this.modelsWithoutOperators.map(model => ({
        ...model,
        groupAccessError: !this.activeOperator.groups?.some(group => group.id === model.group.id),
      }));
    },
    paginationModelsWithoutOperators() {
      return this.$store.state.schedule.modelsWithoutOperatorsPagination;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    isAnyOperators() {
      if (!this.freeOperators) return false;
      return this.officesList.some(office => this.findOperatorsByOffice(office.id));
    },
    lastMiddleOperator() {
      let userResult = {}
      let counter = 0
      for (const userArray of [...this.freeOperators].reverse()) {
        if (counter + userArray.operators.length >= 10) {
          [...userArray.operators].reverse().forEach((user, index) => {
            if ((counter + index + 1) === 10) userResult = user
          })
          break;
        }
        else counter += userArray.operators.length
      }
      return userResult
    },
    lastMiddleModel() {
      for (var i = this.modelsWithoutOperators.length - 1; i >= 0; i--) {
        if (i === this.modelsWithoutOperators.length - 10) {
          return this.modelsWithoutOperators[i]
        }
      }
      return {};
    },
    groupsInfo() {
      let groups = {}
      this.officesList.forEach(group => groups[group.id] = group )
      return groups
    },
    activeOperator() {
      if (!this.activeOperatorId) return null;
      let activeOperator = null;
      this.freeOperators.some(group => {
        activeOperator = group.operators.find(operator => operator.id === this.activeOperatorId);
        return activeOperator;
      });
      return activeOperator;
    },
    activeModel() {
      if (!this.activeModelId) return null;
      return this.modelsWithoutOperators.find(model => model.id === this.activeModelId);
    },
    isModelsListLoading() {
      return (this.scheduleStatus === 'request-models-without-operators') || (this.scheduleStatus === 'request-models-without-operators-next');
    },
    isOperatorsListLoading() {
      return (this.scheduleStatus === 'request-free-operators') || (this.scheduleStatus === 'request-free-operators-next');
    },
  },
  watch: {
    userStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'editing') && (newStatus === '')) {
        switch (this.commandAfterUserEdit) {
          case 'addToAllShifts': return this.addToAllShifts();
          case 'addToSomeShifts': return this.addToSomeShifts();
        }
        this.commandAfterUserEdit = null;
      }
    },
    /*freeOperators: function (newSchedule) {
      if (!this.activeOperator.id) return;
      if (!newSchedule || (newSchedule.length === 0) || !this.officesList.some(office => this.findOperatorsByOffice(office.id)?.operators?.some(operator => operator.id === this.activeOperator.id)))
        return this.activeOperator = {};
    },*/
    /*modelsWithoutOperators: function (newModels) {
      if (!this.activeModel.id) return;
      if (!newModels?.length || !newModels.some(model => model.id === this.activeModel.id)) return this.activeModel = {};
    },*/
  },
  methods: {
    getModelShiftsInfo(model) {
      if (model.count_workshift_without_operator === model.count_workshift) return 'Без оператора';
      return `${pluralize(model.count_workshift_without_operator, ['смена', 'смены', 'смен'])} без оператора`;
    },
    setActiveOperator(operatorId) {
      this.activeOperatorId = operatorId;
      this.$refs['operators-container'].scrollLeft = this.$refs['operators-container'].scrollWidth;
    },
    setActiveModel(modelId) {
      this.activeModelId = modelId;
    },
    tryAddingToAllShifts() {
      if (this.operatorHasAccess()) return this.addToAllShifts();
      this.commandAfterUserEdit = 'addToAllShifts';
      this.$bvModal.show('add_free_operator_to_model');
    },
    addToAllShifts() {
      this.$store.dispatch('schedule/assignOperators', [{
        model_id: this.activeModelId,
        operator_id: this.activeOperatorId,
        workweek: this.activeDate,
      }]);
    },
    tryAddingToSomeShifts() {
      if (this.operatorHasAccess()) return this.addToSomeShifts();
      this.commandAfterUserEdit = 'addToSomeShifts';
      this.$bvModal.show('add_free_operator_to_model');
    },
    addToSomeShifts() {
      this.$emit('openAssignOperator', {operator: this.activeOperator, model: this.activeModel});
    },
    addOperatorToModelsGroup() {
      this.$store.dispatch('users/editOperator', {
        id: this.activeOperatorId,
        groups: [...this.activeOperator.groups?.map(group => group.id), this.activeModel?.group.id],
      });
    },
    operatorHasAccess() {
      return this.activeOperator?.groups?.findIndex(group => group.id === this.activeModel?.group?.id) !== -1;
    },
    findOperatorsByOffice(officeId) {
      return this.freeOperators.find(group => group.group === officeId && group.operators.length)
    },
    handleScrollOperators() {
      if (this.paginationFreeOperators.currentPage >= this.paginationFreeOperators.totalPages || this.scheduleStatus === 'request-free-operators-next') return

      if (this.$refs[`middle-operator-${this.lastMiddleOperator.id}`] && this.$refs[`middle-operator-${this.lastMiddleOperator.id}`][0]) {
        let middleElementPosition = this.$refs[`middle-operator-${this.lastMiddleOperator.id}`][0].getBoundingClientRect().top
        if (middleElementPosition < window.innerHeight) {
          this.fetchFreeOperators(Number(this.paginationFreeOperators.currentPage) + 1);
        }
      }
    },
    handleScrollModels() {
      if (this.paginationModelsWithoutOperators.currentPage >= this.paginationModelsWithoutOperators.totalPages || this.scheduleStatus === 'request-models-without-operators-next') return
      if (this.$refs[`middle-model-${this.lastMiddleModel.id}`] && this.$refs[`middle-model-${this.lastMiddleModel.id}`][0]) {
        let middleElementPosition = this.$refs[`middle-model-${this.lastMiddleModel.id}`][0].getBoundingClientRect().top
        if (middleElementPosition < window.innerHeight) {
          this.fetchModelsWithoutOperators(Number(this.paginationModelsWithoutOperators.currentPage) + 1);
        }
      }
    },
    onInputSearchString(type = 'operators') {
      const fieldName = type === 'operators' ? 'searchStringOperators' : 'searchStringModels',
          requestFunction = type === 'operators' ? this.fetchFreeOperators : this.fetchModelsWithoutOperators,
          searchString = this[fieldName];

      setTimeout(() => searchString === this[fieldName] && requestFunction(), 500);
    },
    fetchFreeOperators(page = 1) {
      this.$store.dispatch('schedule/fetchFreeOperators', {
        group: this.activeGroup.id,
        'workweek': this.activeDate,
        pagination: true,
        without_workshifts: true,
        search: this.searchStringOperators,
        per_page: 20,
        page: page,
      });
    },
    fetchModelsWithoutOperators(page = 1) {
      this.$store.dispatch('schedule/fetchModelsWithoutOperators', {
        'workweek': this.activeDate,
        pagination: true,
        search: this.searchStringModels,
        per_page: 20,
        page: page,
      });
    },
    updateLists() {
      this.searchStringOperators = '';
      this.searchStringModels = '';
      this.fetchFreeOperators();
      this.fetchModelsWithoutOperators();
    },
  }
}
</script>