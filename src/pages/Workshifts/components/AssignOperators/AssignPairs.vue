<template>
  <div class="assign-pairs">
    <template v-if="status === 'add-group-operator'">
      <add-group :currentGroups="chosenOperatorGroups"
                 :userId="chosenOperator.id"
                 title="Офисы, в которых сотрудник может работать"
                 backButton="Выбор модели"
                 showGroupsForOperator
                 @clickBack="backStatus"
      />
    </template>
    <template v-else>
      <div class="assign-pairs-header">
        <b-button v-if="!isEmptyPairs && status === 'show'" size="sm" variant="outline-primary" type="submit"
                  class="group_settings-button throbber-button" @click="assignOperators" :disabled="isAssigning">
          <div v-if="isAssigning" class="throbber-button-block">
            <throbber class="throbber -button -button-primary"/>
          </div>
          <span :class="{ 'text-inherit': isAssigning }">Назначить операторов</span>
        </b-button>
        <div class="theme-helper-content-close helper-close" @click="closeAssign()"></div>
      </div>
      <div v-if="breadcrumbsTitle.length" class="assign-pairs-subheader">
        <div class="assign-pairs-subheader-link" @click="backStatus">
          <i class="fa fa-angle-left"></i>
          <span>{{ breadcrumbsTitle }}</span>
        </div>
      </div>
      <div class="assign-pairs-body">
        <b-collapse v-model="collapsesStatus" id="collapse-pairs-title">
          <div class="assign-pairs-body-title">
            <h3>{{ assignPairsTitle }}</h3>
            <div v-if="!isEmptyPairs && status === 'show'" class="assign-pairs-body-title-edit" @click="addPair" >
              <span>Добавить пару</span>
              <plus />
            </div>
          </div>
        </b-collapse>
        <user-profile
            v-if="status === 'choose-model'"
            class="assign-operators-user"
            :user="chosenOperator"
            :collapses-status="collapsesStatus"
            @editOperatorGroups="editOperatorGroups"
        />
        <b-collapse v-model="collapsesStatus" id="collapse-pairs-filters">
          <div v-if="status === 'choose-model'" class="assign-operators-body-groups">
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
          <div v-if="status !== 'show'" class="assign-operators-body-filters">
            <div class="assign-operators-body-filters-main">
              <span class="assign-operators-body-filters-filter"
                    :class="{'-active': filterWithoutPairs}"
                    @click="setFilterWithoutOperators(true)"
              >Без {{status === 'choose-operator' ? 'пары' : 'операторов'}}</span>
              <span class="assign-operators-body-filters-filter"
                    :class="{'-active': !filterWithoutPairs}"
                    @click="setFilterWithoutOperators(false)"
              >Все {{status === 'choose-operator' ? 'операторы' : 'модели'}}</span>
            </div>
            <select-office v-if="!isEmptyPairs"
                           v-model="chosenOffice"
                           id="assign_pairs_office_select"
                           :currentGroup="group"
                           :groupsOptions="status === 'choose-model' ? groupsOptionsForModels : groupsOptions"
                           :showModelOffice="status === 'choose-model'"
                           @select="getData"
            />
          </div>
        </b-collapse>
        <search-input v-if="!isEmptyPairs" v-model="searchUser" id="assign_pairs_search" @change="onChangeSearch"/>
        <div v-else class="assign-pairs-body-empty">
          <h4>Все пары назначены</h4>
          <span>Создайте новую пару, чтобы она появилась в списке.</span>
          <b-button variant="outline-primary"
                    type="submit"
                    class="group_settings-button"
                    @click="addPair"
          >Создать пару</b-button>
        </div>
        <div v-if="status === 'show' && !isEmptyPairs" class="assign-pairs-body-list -lg">
          <div v-if="statusRequest === 'request-pairs'" class="assign-operators-body-throbber">
            <div class="assign-operators-body-throbber-element">
              <throbber class="throbber"/>
            </div>
            <div class="assign-operators-body-throbber-title">
              <p>Список пар загружается, пожалуйста, подождите</p>
            </div>
          </div>
          <div v-else-if="Object.keys(showPairs).length">
            <div class="assign-pairs-body-header">
              <div class="assign-pairs-body-header-user">Оператор</div>
              <div class="assign-pairs-body-header-user">Модель</div>
            </div>
            <div v-if="pairList && pairList.length" v-for="(pairList, officeId) in showPairs"  class="assign-pairs-body-list-block" >
              <div class="d-flex align-items-center assign-pairs-body-list-block-office">
                <div class="groups-nav-list-group-container-color" :style="`background-color: ${ groupsInfo[officeId] && groupsInfo[officeId].color || 'red'}`"></div>
                <span class="groups-nav-list-group-container-title" v-if="groupsInfo[officeId]">
                  <span v-if="group.type === 'country'">{{ groupsInfo[officeId].city }}, </span>
                  {{ groupsInfo[officeId].title }}
                </span>
              </div>
              <div v-for="pair in pairList" class="assign-pairs-body-list-block-pair">
                <user-profile :user="pair.operator" class="assign-pairs-body-list-block-pair-user"/>
                <user-profile :user="pair.model" :showAdditionalCount="false" class="assign-pairs-body-list-block-pair-user"/>
                <div class="assign-pairs-body-list-block-pair-action">
                  <pen class="assign-pairs-body-list-block-pair-action-pen" @click="editPair(pair, officeId)"/>
                  <trash class="assign-pairs-body-list-block-pair-action-trash" @click="deletePair(pair, officeId)"/>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="assign-operators-body-empty">
            <h4>Пары не найдены</h4>
          </div>
        </div>
        <div v-if="status === 'choose-operator'"
             class="assign-pairs-body-list"
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
          <div v-else v-for="operatorList in operators" class="assign-pairs-body-list-block">
            <div v-if="groupsInfo[chosenOffice].type !== 'office'"  class="d-flex justify-content-between">
              <div class="d-flex align-items-center assign-pairs-body-list-block-office">
                <div class="groups-nav-list-group-container-color" :style="`background-color: ${groupsInfo[operatorList.group] && groupsInfo[operatorList.group].color || 'red'}`"></div>
                <span class="groups-nav-list-group-container-title" v-if="groupsInfo[operatorList.group]">
                  <span v-if="group.type === 'country'">{{ groupsInfo[operatorList.group].city }}, </span>
                  {{ groupsInfo[operatorList.group].title }}
                </span>
              </div>
            </div>
            <div v-for="operator in operatorList.operators"
                 class="assign-operators-body-list-models"
                 :ref="`assign_pairs-operator-${operator.id}`"
                 @click="chooseOperator(operator)"
            >
              <user-profile :user="operator"/>
            </div>
          </div>
          <div v-if="statusRequest === 'request-pairs-operators-next'" class="free_operators-block-content-loader -smaller">
            <throbber class="throbber -smaller"/>
          </div>
        </div>
        <div v-if="status === 'choose-model'"
             class="assign-pairs-body-list -sm"
             :class="{'-opened': !collapsesStatus}"
             ref="pairs-list"
             @scroll="handleScroll"
        >
          <div v-if="statusRequest === 'request-pairs-models'" class="assign-operators-body-throbber">
            <div class="assign-operators-body-throbber-element">
              <throbber class="throbber"/>
            </div>
            <div class="assign-operators-body-throbber-title">
              <p>Список моделей загружается, пожалуйста, подождите</p>
            </div>
          </div>
          <div v-else-if="!models.length && !modelsWorkedBefore.length" class="assign-operators-body-empty">
            <h4>Модели не найдены</h4>
          </div>
<!--          <div v-else v-for="modelList in models" class="assign-pairs-body-list-block">
            <div class="d-flex justify-content-between">
              <div class="d-flex align-items-center assign-pairs-body-list-block-office">
                <div class="groups-nav-list-group-container-color" :style="`background-color: ${modelList.models[0].group.color  || 'red'}`"></div>
                <span class="groups-nav-list-group-container-title">
                  <span v-if="!chosenOffice">{{ modelList.models[0].group.city }}, </span>
                  {{ modelList.models[0].group.office }}
                </span>
              </div>
              <span class="text-gray">{{modelList.isAccess ? '': 'Нет доступа'}}</span>
            </div>
            <div v-for="model in modelList.models"
                 class="assign-operators-body-list-models"
                 :ref="`assign_pairs-model-${model.id}`"
                 @click="chooseModel(model, modelList.isAccess, modelList.group)"
            >
              <user-profile :user="model"/>
            </div>
          </div>-->
          <template v-else>
            <div class="collapse_block" v-if="modelsWorkedBefore.length">
              <div class="collapse_block-toggle" @click="toggleCollapseWorkedBefore">
                <b>Работал ранее</b>
                <i class="fa fa-angle-down collapse_block-toggle-icon" :class="{'-active': collapseStatusWorkedBefore}"/>
              </div>
              <b-collapse :visible="collapseStatusWorkedBefore" id="assign_operators-worked_before" class="collapse_block-main">
                <div v-for="modelList in modelsWorkedBefore" class="assign-operators-body-list-block">
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
            <div v-if="models.length" class="collapse_block">
              <div class="collapse_block-toggle" @click="toggleCollapseOther">
                <b>Все модели</b>
                <i class="fa fa-angle-down collapse_block-toggle-icon" :class="{'-active': collapseStatusOther}"/>
              </div>
              <b-collapse :visible="collapseStatusOther" id="assign_operators-worked_before" class="collapse_block-main">
                <div v-for="modelList in models" class="assign-operators-body-list-block">
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
          <div v-if="statusRequest === 'request-pairs-models-next'" class="free_operators-block-content-loader -smaller">
            <throbber class="throbber -smaller"/>
          </div>
        </div>
      </div>
    </template>
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
      У оператора нет доступа к офису {{groupsInfo[chosenModelInfo.officeId] && groupsInfo[chosenModelInfo.officeId].title}}
    </b-modal>
    <b-modal id="delete_pair"
             centered
             title="Вы уверены, что хотите удалить пару?"
             body-bg-variant="white"
    >
      <template #modal-footer>
        <b-button variant="outline-primary" @click="closeModalDeletePair">Отменить</b-button>
        <b-button variant="danger" @click="confirmDeletePair">Удалить</b-button>
      </template>
      Пара удалится из списка, но назначенные смены останутся в расписании
    </b-modal>
  </div>
</template>

<script>
import SelectOffice from "@/pages/Workshifts/components/AssignOperators/SelectOffice";
import SearchInput from "@/pages/Workshifts/components/AssignOperators/SearchInput";
import UserProfile from "@/pages/Workshifts/components/AssignOperators/UserProfile";
import AddGroup from "@/pages/Profile/components/AddGroups/AddGroups";
import plus from "@/assets/Plus.svg";
import trash from "@/assets/vue-svg/trash.svg";
import pen from "@/assets/vue-svg/pen.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import { showToast } from "@/tools/tools";
import moment from "moment";

export default {
  name: "AssignPairs",
  components: {
    AddGroup,
    UserProfile,
    SearchInput,
    SelectOffice,
    plus,
    trash,
    pen,
    throbber
  },
  props: {
    group: Object,
    activeDate: {
      type: String,
      default: moment().format('YYYY-MM-DD'),
    },
    officesList: Array,
  },
  data () {
    return {
      status: 'show',
      prevStatus: '',
      chosenOffice: null,
      chosenOperator: {},
      chosenModel: {},
      searchUser: '',
      filterWithoutPairs: true,
      chosenModelInfo: {},
      isEditingPair: false,
      deletePairInfo: {},
      perPage: 10,
      collapsesStatus: true,
      collapseStatusWorkedBefore: true,
      collapseStatusOther: true,
    }
  },
  computed: {
    pairs() {
      return this.$store.state.schedule.pairs;
    },
    operators() {
      return this.$store.state.schedule.pairsOperators;
    },
    modelsWorkedBefore() {
      return this.$store.state.schedule.pairsModelsWorkedBefore;
    },
    models() {
      return this.$store.state.schedule.pairsModels;
    },
    statusRequest() {
      return this.$store.state.schedule.status;
    },
    isAssigning() {
      return this.$store.state.schedule.status === 'all-assigning';
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    showPairs() {
      let resultPairs = {}
      if (this.chosenOffice) {
        if (this.pairs[this.chosenOffice] !== undefined) resultPairs[this.chosenOffice] = this.pairs[this.chosenOffice];
      }
      else resultPairs = this.pairs;
      if (this.searchUser.length && Object.keys(resultPairs).length) {
        let searchPairs = {};
        let searchString = this.searchUser.toLowerCase();
        Object.entries(resultPairs).forEach(([office, pairList]) => {
          searchPairs[office] = pairList.filter(pair => pair.model.fullname.toLowerCase().includes(searchString) || pair.operator.fullname.toLowerCase().includes(searchString))
        });
        return searchPairs;
      } else return resultPairs;
    },
    assignPairsTitle() {
      switch (this.status) {
        case 'show':
          return 'Пары оператор-модель';
        case 'choose-operator':
          return 'Выберите оператора в пару';
        case 'choose-model':
          return 'Выберите модель в пару';
      }
    },
    breadcrumbsTitle() {
      switch (this.status) {
        case 'show':
          return '';
        case 'choose-operator':
          return 'Пары оператор-модель';
        case 'choose-model':
          return this.isEditingPair ? 'Пары оператор-модель' : 'Выбор оператора';
      }
    },
    groupsOperators() {
      return this.$store.state.dictionaries.groupsOperators;
    },
    groupsNonOperators() {
      return this.$store.state.dictionaries.groupsNonOperators;
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
          });
        });
      });
      return result;
    },
    groupsOptionsForModels() {
      let result = [];
      result.push({id: null, title: 'Все офисы'});
      this.groupsNonOperators.forEach(groupCountry => {
        result.push({...groupCountry, disabled: true});
        groupCountry.children.forEach(groupCity => {
          result.push({...groupCity, disabled: true});
          groupCity.children.forEach(groupOffice => {
            result.push({...groupOffice, city: groupCity.title});
          });
        });
      });
      return result;
    },
    groupsInfo() {
      let groups = {};
      let groupsOptions = this.status === 'choose-model' ? this.groupsOptionsForModels : this.groupsOptions;
      groupsOptions.forEach(group => groups[group.id] = group );
      return groups;
    },
    chosenOperatorProfile() {
      return this.$store.getters["profile/shortProfile"](Number(this.chosenOperator?.id));
    },
    chosenOperatorGroups() {
      if (!this.chosenOperator?.id) return [];
      return this.chosenOperatorProfile?.user?.groups.map(group => group.id) || [];
    },
    statusUser() {
      return this.$store.state.users.status;
    },
    isEditing() {
      return this.$store.state.users.status === 'editing';
    },
    isEmptyPairs() {
      return !Object.keys(this.pairs).length && this.status === 'show';
    },
    paginationOperators() {
      return this.$store.state.schedule.pairsOperatorsPagination;
    },
    paginationModelsWorkedBefore() {
      return this.$store.state.schedule.pairsModelsWorkedBeforePagination;
    },
    paginationModels() {
      return this.$store.state.schedule.pairsModelsPagination;
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
    filterWithoutPairs() {
      this.getData();
    },
    status(newStatus, prevStatus) {
      this.searchUser = '';
      this.filterWithoutPairs = true;
      if (newStatus === 'choose-model') this.chosenOffice = null;
      else this.chosenOffice = this.group.type === "office" ? Number(this.group.id) : null;
      this.getData();
      this.prevStatus = prevStatus;
    },
    statusUser(newStatus) {
      if (newStatus === 'error') {
        showToast(this.$toasted, 'Ошибка', 'error');
        this.$bvModal.hide('available_office');
      } else if (newStatus !== 'editing') {
        this.$bvModal.hide('available_office')
        if ((this.status === 'add-group-operator' || this.prevStatus === 'add-group-operator')) {
          this.collapsesStatus = true;
          this.status = 'choose-model';
        }
        else {
          this.chosenModel = this.chosenModelInfo.model;
          this.savePair();
        }
      }
    },
    statusRequest(newStatus, prevStatus) {
      if ((prevStatus === 'deleting') && (newStatus === '')) {
        this.$bvModal.hide('delete_pair');
        showToast(this.$toasted, `Пара ${this.deletePairInfo.pair.operator.fullname} - ${this.deletePairInfo.pair.model.fullname} удалена`, 'error');
        this.deletePairInfo = {};
        return;
      }
      if (newStatus === 'all-assigning-error') this.getPairs();
      else if (newStatus === 'all-assigned') this.closeDrover();
    },
  },
  created() {
    this.chosenOffice = this.group.type === "office" ? Number(this.group.id) : null;
    this.getPairs();
  },
  methods: {
    closeAssign() {
      this.closeDrover();
    },
    closeDrover() {
      this.$emit('closeDrover');
    },
    setFilterWithoutOperators(value) {
      this.filterWithoutPairs = value;
    },
    getPairs() {
      this.$store.dispatch('schedule/fetchPairs', {
        workweek: this.activeDate,
        group: this.chosenOffice || this.group.id,
        search: this.searchUser || null,
      });
    },
    getOperators(page = 1) {
      this.$store.dispatch('schedule/fetchPairsOperators', {
        workweek: this.activeDate,
        group: this.chosenOffice || this.group.id,
        without_pair: this.filterWithoutPairs,
        search: this.searchUser || null,
        page: page,
        per_page: this.perPage,
      });
    },
    getModelsWorkedBefore(page = 1) {
      this.$store.dispatch('schedule/fetchPairsModelsWorkedBefore', {
        workweek: this.activeDate,
        group_model: this.chosenOffice || null,
        user_for_pair: this.chosenOperator.id,
        without_pair: this.filterWithoutPairs,
        search: this.searchUser || null,
        page: page,
        per_page: this.perPage,
      });
    },
    getModels(page = 1) {
      this.$store.dispatch('schedule/fetchPairsModels', {
        workweek: this.activeDate,
        group_model: this.chosenOffice || null,
        user_for_pair: this.chosenOperator.id,
        without_pair: this.filterWithoutPairs,
        search: this.searchUser || null,
        page: page,
        per_page: this.perPage,
      });
    },
    addPair() {
      this.collapsesStatus = true;
      this.status = 'choose-operator';
    },
    getData() {
      if (this.status === 'choose-model') {
        this.getModelsWorkedBefore();
        this.getModels();
      }
      else if (this.status === 'choose-operator') this.getOperators();
    },
    chooseOperator(operator) {
      this.chosenOperator = operator;
      this.getOperatorProfile();
      this.collapsesStatus = true;
      this.status = 'choose-model';
    },
    chooseModel(model, isAccess = true, office = null) {
      if (isAccess) {
        this.chosenModel = model;
        this.savePair();
      } else {
        this.chosenModelInfo = {officeId: Number(office), model: model};
        this.$bvModal.show('available_office');
      }
    },
    closeModalAvailable() {
      this.$bvModal.hide('available_office');
    },
    closeModalDeletePair() {
      this.$bvModal.hide('delete_pair');
    },
    addGroup() {
      this.$store.dispatch('users/editOperator', {
        id: this.chosenOperator.id,
        groups: this.chosenOperatorGroups.concat([this.chosenModelInfo.officeId]),
      });
    },
    backStatus() {
      this.collapsesStatus = true;
      if (this.status === 'choose-operator') this.status = 'show';
      else if (this.status === 'choose-model') this.status = this.isEditingPair ? 'show' : 'choose-operator';
      else if (this.status === 'add-group-operator') this.status = 'choose-model';
    },
    editOperatorGroups() {
      this.collapsesStatus = true;
      this.status = 'add-group-operator';
    },
    getOperatorProfile() {
      let requestData = {
        userId: this.chosenOperator.id,
        workweek: moment(this.activeDate).format('YYYY-MM-DD'),
      };
      this.$store.dispatch('profile/fetchShortProfile', requestData);
    },
    savePair() {
      let pairData = {
        office: this.chosenOperatorProfile.user.main_group.id,
        operator: this.chosenOperator,
        model: this.chosenModel,
      };
      this.$store.dispatch('schedule/savePair', pairData);
      this.collapsesStatus = true;
      this.status = 'show';
    },
    deletePair(pair, office) {
      this.deletePairInfo = { pair: pair, office: office };
      this.$bvModal.show('delete_pair');
    },
    confirmDeletePair() {
      let pairData = {
        office: this.deletePairInfo.office,
        operator: this.deletePairInfo.pair.operator,
        model: this.deletePairInfo.pair.model,
        stock_at: moment(this.activeDate).format('YYYY-MM-DD'),
      };
      this.$store.dispatch('schedule/deletePair', pairData);
    },
    editPair(pair) {
      this.chosenOperator = pair.operator;
      this.getOperatorProfile();
      this.isEditingPair = true;
      this.collapsesStatus = true;
      this.status = 'choose-model';
    },
    assignOperators() {
      let data = []
      Object.values(this.pairs).forEach(pairList =>
          pairList.forEach(pair =>
              data.push({model_id: pair.model.id, operator_id: pair.operator.id, workweek: this.activeDate})
          )
      );
      this.$store.dispatch('schedule/assignOperators', data);
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
      if (this.collapseStatusWorkedBefore && this.paginationModelsWorkedBefore.currentPage && (this.paginationModelsWorkedBefore.currentPage < this.paginationModelsWorkedBefore.totalPages)) return this.onScrollUsersUpdate('models-worked-before');
      this.onScrollUsersUpdate('models-other');
    },
    onScrollUsersUpdate(type = 'operators') {
      const consts = {};
      switch (type) {
        case 'operators':
          consts.requestStatusBase = 'request-pairs-operators';
          consts.pagination = this.paginationOperators;
          consts.anchorUserRef = `assign_pairs-operator-${this.anchorUserId}`;
          consts.requestMethod = this.getOperators;
          break;
        case 'models-worked-before':
          consts.requestStatusBase = 'request-pairs-models';
          consts.pagination = this.paginationModelsWorkedBefore;
          consts.anchorUserRef = `assign_pairs-model-worked-before-${this.anchorUserId}`;
          consts.requestMethod = this.getModelsWorkedBefore;
          break;
        case 'models-other':
          consts.requestStatusBase = 'request-pairs-models';
          consts.pagination = this.paginationModels;
          consts.anchorUserRef = `assign_pairs-model-other-${this.anchorUserId}`;
          consts.requestMethod = this.getModels;
      }
      if ((this.statusRequest === consts.requestStatusBase) || (this.statusRequest === (consts.requestStatusBase + '-next'))) return;
      if (consts.pagination.currentPage >= consts.pagination.totalPages) return;
      if (this.$refs[consts.anchorUserRef] && this.$refs[consts.anchorUserRef][0]) {
        let middleElementPosition = this.$refs[consts.anchorUserRef][0].getBoundingClientRect().top;
        if (middleElementPosition < window.innerHeight) consts.requestMethod(consts.pagination.currentPage + 1);
      }
    },
    onChangeSearch() {
      const newSearchUser = this.searchUser;
      if (this.status !== 'show') setTimeout(() => this.checkSearchUser(newSearchUser), 500);
    },
    checkSearchUser(searchUser) {
      if (searchUser !== this.searchUser) return;
      this.getData();
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
