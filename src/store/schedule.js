import {
  updateWorkshifts,
  requestHandler,
  updateList,
  formatPaginationData,
  isScheduleSectionPermitted, responseErrorHandler,
} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    mainStatus: '',
    deleteStatus: '',
    errorMessage: '',
    operatorsStatus: '',
    workweek: '',
    loadWorkshifts: [],
    loadPastWorkshifts: [],
    loadOperatorsWorkshifts: [],
    statusFreeModels: '',
    statusFreeModelsCount: '',
    requestErrors: [],
    schedule: {},
    currentSchedule: {},
    pastSchedule: {},
    operatorsSchedule: {},
    potentialOperatorsSchedule: {},
    currentScheduleMiniProfile: {},
    currentWorkshift: {},
    currentWorkshifts: {},
    currentWeekWorkshifts: {},
    workshiftStatuses: {
      created: 'В резерве',
      assigned: 'Назначена',
      canceled: 'Отменена',
      process: 'В процессе',
      completed: 'Завершена'
    },
    cancellationReasons: [],
    updatedWorkshift: {},
    newWorkshift: {},
    scheduleAbility: false,
    operators: [],
    freeModelsCount: {},
    freeModels: [],
    freeModelsRequestParams: '',
    modelsAssign: [],
    modelsAssignPagination: {},
    models: [],
    report: {},
    pairs: {},
    pairsOperators: [],
    pairsOperatorsPagination: {},
    pairsModels: [],
    pairsModelsPagination: {},
    pairsModelsWorkedBefore: [],
    pairsModelsWorkedBeforePagination: {},
    modelsAssignWorkedBefore: [],
    modelsAssignWorkedBeforePagination: {},
    modelsWithoutOperators: [],
    modelsWithoutOperatorsPagination: {},
    freeOperators: [],
    freeOperatorsPagination: {},
    pairsModelsQuery: {},
    pairsModelsWorkedBeforeQuery: {},
    modelsHeaders: {},
    operatorsHeaders: {},
    //config
    periods: [],
    workshiftTabs: [],
    activeTab: {
      group: null,
      tab: null,
      date_type: null,
    },
    activeTabId: 0,
    workshiftReports: {},
    activeInfo: {},
  },
  getters: {
    getFreeModels: state => activeGroup => {
      if (activeGroup.type === 'office') return state.freeModels[activeGroup.id] || {};
      if (activeGroup.type === 'city') {
        let resultFreeModels = [],
            sortedOffices = [...activeGroup.children];

        sortedOffices.sort((prev, next) => {
          if (prev.title < next.title) return -1;
          if (prev.title > next.title) return 1;
        });

        sortedOffices.forEach(office => {
          let freeModelsOffice = state.freeModels[office.id],
              filteredFreeModelsOffice = [];

          if (freeModelsOffice) {
            filteredFreeModelsOffice = freeModelsOffice.filter(model => model !== undefined);
            filteredFreeModelsOffice.map(model => model.office = office);
          }

          resultFreeModels = resultFreeModels.concat(filteredFreeModelsOffice);
        });

        return resultFreeModels;
      }

      return {};
    }
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_MAIN_STATUS(state, status) {
      state.mainStatus = status;
    },
    SET_DELETE_STATUS(state, status) {
      state.deleteStatus = status;
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
    SET_OPERATORS_STATUS(state, status) {
      state.operatorsStatus = status;
    },
    SET_STATUS_FREE_MODELS(state, status) {
      state.statusFreeModels = status;
    },
    SET_STATUS_FREE_MODELS_COUNT(state, status) {
      state.statusFreeModelsCount = status;
    },
    SET_LOAD_WORKSHIFTS(state, value) {
      state.loadWorkshifts.push(value);
    },
    SET_ACTIVE_INFO(state, data) {
      console.log(data)
      state.activeTab.tab = data.activeTab;
      state.activeTab.group = data.group.id;
      state.activeInfo = data;
    },
    SET_WORKWEEK(state, workweek) {
      state.workweek = workweek;
    },
    CLEAR_ACTIVE_INFO(state) {
      state.activeInfo = {};
    },
    DELETE_LOAD_WORKSHIFTS(state, value) {
      state.loadWorkshifts = state.loadWorkshifts.filter(load => load !== value);
    },
    CLEAR_LOAD_WORKSHIFTS(state) {
      state.loadWorkshifts = [];
    },
    SET_LOAD_PAST_WORKSHIFTS(state, value) {
      state.loadPastWorkshifts.push(value);
    },
    DELETE_LOAD_PAST_WORKSHIFTS(state, value) {
      state.loadPastWorkshifts = state.loadPastWorkshifts.filter(load => load !== value);
    },
    CLEAR_LOAD_PAST_WORKSHIFTS(state) {
      state.loadPastWorkshifts = [];
    },
    SET_LOAD_OPERATORS_WORKSHIFTS(state, value) {
      state.loadOperatorsWorkshifts.push(value);
    },
    DELETE_LOAD_OPERATORS_WORKSHIFTS(state, value) {
      state.loadOperatorsWorkshifts = state.loadOperatorsWorkshifts.filter(load => load !== value);
    },
    CLEAR_LOAD_OPERATORS_WORKSHIFTS(state) {
      state.loadOperatorsWorkshifts = [];
    },
    SAVE_ERRORS(state, errors) {
      state.requestErrors = errors;
    },
    CLEAR_SCHEDULE(state) {
      state.schedule = {};
    },
    SAVE_PERIODS(state, periods) {
      state.periods = periods;
    },
    SAVE_SCHEDULE(state, schedule) {
      state.schedule = schedule;
    },
    SAVE_CURRENT_SCHEDULE(state, data) {
      state.currentSchedule = {...state.currentSchedule, [data.office]: data.schedule};
    },
    CLEAR_CURRENT_SCHEDULE(state) {
      state.currentSchedule = {};
    },
    SAVE_PAST_SCHEDULE(state, data) {
      state.pastSchedule = {...state.pastSchedule, [data.office]: data.schedule};
    },
    CLEAR_PAST_SCHEDULE(state) {
      state.pastSchedule = {};
    },
    SAVE_OPERATORS_SCHEDULE(state, data) {
      state.operatorsSchedule = {...state.operatorsSchedule, [data.office]: data.schedule};
    },
    CLEAR_OPERATORS_SCHEDULE(state) {
      state.operatorsSchedule = {};
    },
    SAVE_POTENTIAL_OPERATORS_SCHEDULE(state, data) {
      state.potentialOperatorsSchedule = {...state.potentialOperatorsSchedule, [data.office]: data.schedule};
    },
    CLEAR_POTENTIAL_OPERATORS_SCHEDULE(state) {
      state.potentialOperatorsSchedule = {};
    },
    SAVE_FREE_OPERATORS(state, operators) {
      let data = [...operators];
      if (state.freeOperators.length && operators[0].group === state.freeOperators[state.freeOperators.length - 1].group) {
        state.freeOperators[state.freeOperators.length - 1].operators = [...state.freeOperators[state.freeOperators.length - 1].operators, ...operators[0].operators];
        data.shift();
      }
      state.freeOperators = [...state.freeOperators, ...data];
    },
    CLEAN_FREE_OPERATORS(state) {
      state.freeOperators = [];
    },
    SAVE_FREE_OPERATORS_PAGINATION(state, pagination) {
      state.freeOperatorsPagination = pagination;
    },
    SAVE_CURRENT_SCHEDULE_MINI_PROFILE(state, schedule) {
      state.currentScheduleMiniProfile = schedule;
    },
    SAVE_FREE_MODELS_COUNT(state, count) {
      state.freeModelsCount = count;
    },
    SAVE_FREE_MODELS(state, data) {
      state.freeModels = data;
    },
    SAVE_FREE_MODELS_REQUEST_PARAMS(state, params) {
      state.freeModelsRequestParams = params;
    },
    CLEAR_FREE_MODELS(state) {
      state.freeModels = [];
    },
    SAVE_OPERATORS(state, operators) {
      state.operators = operators;
    },
    SAVE_OPERATORS_HEADERS(state, pagination) {
      state.operatorsHeaders = pagination;
    },
    SAVE_OPERATORS_NEXT_PAGE(state, operators) {
      state.operators = [...state.operators, ...operators];
    },
    SAVE_MODELS(state, models) {
      state.models = models;
    },
    SAVE_MODELS_HEADERS(state, pagination) {
      state.modelsHeaders = pagination;
    },
    SAVE_MODELS_NEXT_PAGE(state, models) {
      state.models = [...state.models, ...models];
    },
    SAVE_PAIRS(state, pairs) {
      if (Array.isArray(pairs)) state.pairs = {};
      else state.pairs = pairs
    },
    SAVE_PAIR(state, pair) {
      let offices = Object.keys(state.pairs);
      if (offices.length) offices.forEach(office => state.pairs[office] = state.pairs[office].filter(item => (item.model.id !== pair.model.id && item.operator.id !== pair.operator.id)));
      if (offices.find(key => Number(key) === pair.office)) state.pairs[pair.office].push(pair);
      else state.pairs[pair.office] = [pair];
    },
    DELETE_PAIR(state, pair) {
      state.pairs[pair.office] = state.pairs[pair.office].filter(item => (item.model.id !== pair.model.id && item.operator.id !== pair.operator.id));
      if (!state.pairs[pair.office].length) delete state.pairs[pair.office];
    },
    SAVE_PAIRS_OPERATORS(state, pairsOperators) {
      let data = [...pairsOperators]
      if (state.pairsOperators.length && pairsOperators[0].group === state.pairsOperators[state.pairsOperators.length - 1].group) {
        state.pairsOperators[state.pairsOperators.length - 1].operators = [...state.pairsOperators[state.pairsOperators.length - 1].operators, ...pairsOperators[0].operators];
        data.shift();
      }
      state.pairsOperators = [...state.pairsOperators, ...data];
    },
    CLEAN_PAIRS_OPERATORS(state) {
      state.pairsOperators = [];
    },
    SAVE_PAIRS_OPERATORS_PAGINATION(state, pagination) {
      state.pairsOperatorsPagination = pagination;
    },
    SAVE_PAIRS_MODELS(state, pairsModels) {
      let data = [...pairsModels];
      if (state.pairsModels.length && pairsModels[0].group === state.pairsModels[state.pairsModels.length - 1].group) {
        state.pairsModels[state.pairsModels.length - 1].models = [...state.pairsModels[state.pairsModels.length - 1].models, ...pairsModels[0].models];
        data.shift();
      }
      state.pairsModels = [...state.pairsModels, ...data];
    },
    CLEAN_PAIRS_MODELS(state) {
      state.pairsModels = [];
    },
    SAVE_PAIRS_MODELS_PAGINATION(state, pagination) {
      state.pairsModelsPagination = pagination;
    },
    SET_PAIRS_MODELS_QUERY(state, query) {
      state.pairsModelsQuery = query;
    },
    SAVE_PAIRS_MODELS_WORKED_BEFORE(state, pairsModels) {
      let data = [...pairsModels];
      if (state.pairsModelsWorkedBefore.length && pairsModels[0].group === state.pairsModelsWorkedBefore[state.pairsModelsWorkedBefore.length - 1].group) {
        state.pairsModelsWorkedBefore[state.pairsModelsWorkedBefore.length - 1].models = [...state.pairsModelsWorkedBefore[state.pairsModelsWorkedBefore.length - 1].models, ...pairsModels[0].models];
        data.shift();
      }
      state.pairsModelsWorkedBefore = [...state.pairsModelsWorkedBefore, ...data];
    },
    CLEAN_PAIRS_MODELS_WORKED_BEFORE(state) {
      state.pairsModelsWorkedBefore = [];
    },
    SAVE_PAIRS_MODELS_WORKED_BEFORE_PAGINATION(state, pagination) {
      state.pairsModelsWorkedBeforePagination = pagination;
    },
    SET_PAIRS_MODELS_WORKED_BEFORE_QUERY(state, query) {
      state.pairsModelsWorkedBeforeQuery = query;
    },
    SAVE_MODELS_ASSIGN_WORKED_BEFORE(state, pairsModels) {
      if (state.modelsAssignWorkedBefore.length && pairsModels[0].group === state.modelsAssignWorkedBefore[state.modelsAssignWorkedBefore.length - 1].group) {
        state.modelsAssignWorkedBefore[state.modelsAssignWorkedBefore.length - 1].models = [...state.modelsAssignWorkedBefore[state.modelsAssignWorkedBefore.length - 1].models, ...pairsModels[0].models];
        pairsModels.shift();
      }
      state.modelsAssignWorkedBefore = [...state.modelsAssignWorkedBefore, ...pairsModels];
    },
    CLEAN_MODELS_ASSIGN_WORKED_BEFORE(state) {
      state.modelsAssignWorkedBefore = [];
    },
    SAVE_MODELS_ASSIGN_WORKED_BEFORE_PAGINATION(state, pagination) {
      state.modelsAssignWorkedBeforePagination = pagination;
    },
    SAVE_MODELS_ASSIGN(state, models) {
      let data = [...models]
      if (state.modelsAssign.length && models[0].group === state.modelsAssign[state.modelsAssign.length - 1].group) {
        state.modelsAssign[state.modelsAssign.length - 1].models = [...state.modelsAssign[state.modelsAssign.length - 1].models, ...models[0].models];
        data.shift();
      }
      state.modelsAssign = [...state.modelsAssign, ...data];
    },
    CLEAN_MODELS_ASSIGN(state) {
      state.modelsAssign = [];
    },
    SAVE_MODELS_ASSIGN_PAGINATION(state, pagination) {
      state.modelsAssignPagination = pagination;
    },
    SAVE_WORKSHIFT(state, workshifts) {
      state.currentSchedule = {
        ...state.currentSchedule,
        [workshifts[0].group.id]: updateWorkshifts(state.currentSchedule[workshifts[0].group.id], workshifts)
      };
    },
    UPDATE_CURRENT_WEEK_WORKSHIFTS(state, workshifts) {
      state.currentWeekWorkshifts = {
        ...state.currentWeekWorkshifts,
        workshifts: updateWorkshifts(state.currentWeekWorkshifts.workshifts, workshifts)
      }
    },
    SAVE_UPDATED_WORKSHIFT(state, workshift) {
      state.updatedWorkshift = workshift;
    },
    SAVE_NEW_WORKSHIFT(state, workshift) {
      state.newWorkshift = workshift;
    },
    SAVE_CURRENT_WORKSHIFT(state, workshift) {
      state.currentWorkshift = workshift;
    },
    SAVE_CURRENT_WORKSHIFTS(state, workshifts) {
      state.currentWorkshifts = workshifts;
    },
    SAVE_CURRENT_WEEK_WORKSHIFT(state, workshifts) {
      state.currentWeekWorkshifts = workshifts;
    },
    CLEAR_CURRENT_WORKSHIFTS_WEEK(state) {
      state.currentWeekWorkshifts = {};
    },
    UPDATE_WORKSHIFTS_STATUSES(state, workshifts) {
      //TBD in PWE
    },
    REMOVE_WORKSHIFTS(state, workshifts) {
      //TBD in PWE
    },
    REMOVE_WORKSHIFT(state, workshift) {
      if ( !workshift.group || !workshift.group.id) return;
      state.currentSchedule = {
        ...state.currentSchedule,
        [workshift.group.id]: updateWorkshifts(state.currentSchedule[workshift.group.id], [workshift], 'delete')
      };
    },
    REMOVE_CURRENT_WEEK_WORKSHIFTS(state, workshifts) {
      state.currentWeekWorkshifts = {
        ...state.currentWeekWorkshifts,
        workshifts: updateWorkshifts(state.currentWeekWorkshifts.workshifts, workshifts, 'delete')
      }
    },
    SAVE_CANCELLATION_REASONS(state, reasons) {
      state.cancellationReasons = reasons;
    },
    SAVE_REPORT(state, report) {
      state.report = report;
    },
    SAVE_MODELS_WITHOUT_OPERATORS(state, models) {
      state.modelsWithoutOperators = [...state.modelsWithoutOperators, ...models];
    },
    CLEAN_MODELS_WITHOUT_OPERATORS(state) {
      state.modelsWithoutOperators = [];
    },
    SAVE_MODELS_WITHOUT_OPERATORS_PAGINATION(state, pagination) {
      state.modelsWithoutOperatorsPagination = pagination;
    },
    // config
    SAVE_WORKSHIFT_TABS(state, tabsInfo) {
      let storageWorkshiftTabs = JSON.parse(localStorage.getItem('workshiftConfigs'));
      let storageWorkshiftTabsDate = JSON.parse(localStorage.getItem('workshiftConfigsDate'));
      if (new Date(storageWorkshiftTabsDate).getTime() > new Date(tabsInfo.date).getTime() && storageWorkshiftTabs.length) state.workshiftTabs = storageWorkshiftTabs;
      else state.workshiftTabs = tabsInfo.tabs;
    },
    SAVE_ACTIVE_TAB(state, activeTabInfo) {
      state.activeTabId = activeTabInfo.id;
      state.activeTab = {...state.activeTab, ...activeTabInfo.tab};
    },
    ADD_WORKSHIFT_TABS(state, tab) {
      let newWorkshiftTabs = [...state.workshiftTabs];
      newWorkshiftTabs.push(tab);
      state.workshiftTabs = newWorkshiftTabs;
    },
    EDIT_WORKSHIFT_TABS(state, tabsInfo) {
      let newWorkshiftTabs = [...state.workshiftTabs];
      newWorkshiftTabs[tabsInfo.id] = {...newWorkshiftTabs[tabsInfo.id], ...tabsInfo.tab};
      state.workshiftTabs = newWorkshiftTabs;
    },
    DELETE_WORKSHIFT_TABS(state, tabId) {
      let newWorkshiftTabs = [...state.workshiftTabs];
      newWorkshiftTabs.splice(tabId, 1);
      state.workshiftTabs = newWorkshiftTabs;
    },
    SET_ACTIVE_WORKSHIFT_TABS(state, tabId) {
      state.activeTabId = Math.min(state.workshiftTabs.length, tabId);
    },
    SET_FREE_MODEL_LINK_STATUS(state, model) {
      state.freeModels = updateList(state.freeModels, model, 'update-element');
    },
    SAVE_WORKSHIFT_REPORT(state, report) {
      state.workshiftReports = {...state.workshiftReports, [report.id]: report};
    },
  },
  actions: {
    async createSchedule({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts`,
          data: requestData
        }, {name: 'schedule/createSchedule', params: requestData}, dispatch);
        commit('SAVE_SCHEDULE', data);
        commit('SET_STATUS', 'schedule-created');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createNewSchedule({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts/delete_create`,
          data: requestData
        }, {name: 'schedule/createNewSchedule', params: requestData}, dispatch);
        commit('UPDATE_CURRENT_WEEK_WORKSHIFTS', data);
        commit('SAVE_SCHEDULE', data);
        commit('REMOVE_CURRENT_WEEK_WORKSHIFTS', requestData.ids_delete);
        commit('SET_STATUS', 'schedule-created');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_ERRORS',
        });
      }
    },
    async fetchModelScheduleMiniProfile({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts`,
          params: {params: query}
        }, {name: 'schedule/fetchModelScheduleMiniProfile', params: query}, dispatch);
        commit('SAVE_CURRENT_SCHEDULE_MINI_PROFILE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPeriodsForGroup({commit, dispatch}, query) {
      commit('SET_STATUS', 'request-periods');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/periods`,
          params: {params: query}
        }, {name: 'schedule/fetchPeriodsForGroup', params: query}, dispatch);
        commit('SAVE_PERIODS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelWorkShifts({commit, dispatch}, query) {
      commit('SET_MAIN_STATUS', 'request-week-workshift');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts`,
          params: {params: query}
        }, {name: 'schedule/fetchModelWorkShifts', params: query}, dispatch);
        commit('SAVE_CURRENT_WORKSHIFTS', data);
        commit('SET_MAIN_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_MAIN_STATUS'});
      }
    },
    async fetchModelWorkShiftsWeek({commit, dispatch}, query) {
      commit('SET_STATUS', 'request-week-workshift-model');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/models/${query.model}`,
          params: {params: query.params}
        }, {name: 'schedule/fetchModelWorkShifts', params: query}, dispatch);
        commit('SAVE_CURRENT_WEEK_WORKSHIFT', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelWorkShift({commit, dispatch}, workshiftId) {
      commit('SET_STATUS', 'request-workshift-model');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/${workshiftId}`
        }, {name: 'schedule/fetchModelWorkShift', params: workshiftId}, dispatch);
        commit('SAVE_CURRENT_WORKSHIFT', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchFreeModelsCount({commit, dispatch}, query) {
      commit('SET_STATUS_FREE_MODELS_COUNT', 'request-count');
      commit('SAVE_FREE_MODELS_COUNT', {});
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/models/${query.office}/without/workshifts/count?workweek=${query.workweek}`
        }, {name: 'schedule/fetchFreeModels', params: query}, dispatch);
        commit('SAVE_FREE_MODELS_COUNT', data);
        commit('SET_STATUS_FREE_MODELS_COUNT', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_FREE_MODELS_COUNT'});
      }
    },
    async fetchFreeModels({commit, dispatch, state}, query) {
      commit('SET_STATUS_FREE_MODELS', 'request');
      commit('SAVE_FREE_MODELS_REQUEST_PARAMS', `${query.group}-${query.workweek}`);
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/models/${query.group}/without/workshifts?workweek=${query.workweek}&pagination=false`,
          params: {params: query},
        }, {name: 'schedule/fetchFreeModels', params: query}, dispatch);
        if (state.freeModelsRequestParams !== `${query.group}-${query.workweek}`) return;
        commit('SAVE_FREE_MODELS', data);
        commit('SET_STATUS_FREE_MODELS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_FREE_MODELS_COUNT'});
      }
    },
    async fetchOperators({commit, dispatch}, query) {
      commit('SET_OPERATORS_STATUS', 'operator-request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/operators/pair_model/${query.model}`,
          params: {params: query.params}
        }, {name: 'schedule/fetchOperators', params: query}, dispatch);
        commit('SAVE_OPERATORS', data.items);
        commit(`SAVE_OPERATORS_HEADERS`, formatPaginationData(data));
        commit('SET_OPERATORS_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_OPERATORS_STATUS'});
      }
    },
    async fetchOperatorsNextPage({commit, dispatch}, query) {
      commit('SET_OPERATORS_STATUS', 'operator-request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/operators/pair_model/${query.model}`,
          params: {params: query.params}
        }, {name: 'schedule/fetchModelsNextPage', params: query}, dispatch);
        commit('SAVE_OPERATORS_NEXT_PAGE', data.items);
        commit(`SAVE_OPERATORS_HEADERS`, formatPaginationData(data));
        commit('SET_OPERATORS_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_OPERATORS_STATUS'});
      }
    },
    async fetchModels({commit, dispatch}, query) {
      commit('SET_STATUS', 'model-request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: query.group ? `/workshifts/models` : '/models/with_absence',
          params: {params: query}
        }, {name: 'schedule/fetchModels', params: query}, dispatch);
        commit('SAVE_MODELS', data.items);
        commit(`SAVE_MODELS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelsNextPage({commit, dispatch}, query) {
      commit('SET_STATUS', 'model-request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: query.group ? `/workshifts/models` : '/models/with_absence',
          params: {params: query}
        }, {name: 'schedule/fetchModelsNextPage', params: query}, dispatch);
        commit('SAVE_MODELS_NEXT_PAGE', data.items);
        commit(`SAVE_MODELS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelsAssign({commit, dispatch}, query) {
      if (query.page === 1) {
        commit('CLEAN_MODELS_ASSIGN')
        commit('SET_STATUS', 'request-models-assign');
      } else commit('SET_STATUS', 'request-models-assign-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/operators/models`,
          params: {params: query}
        }, {name: 'schedule/fetchModelsAssign', params: query}, dispatch);
        commit('SAVE_MODELS_ASSIGN', data.items)
        commit('SAVE_MODELS_ASSIGN_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelsAssignWorkedBefore({commit, dispatch}, query) {
      if (query.page === 1) commit('SET_STATUS', 'request-models-assign');
      else commit('SET_STATUS', 'request-models-assign-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/operators/models?worked_before=true`,
          params: {params: query}
        }, {name: 'schedule/fetchModelsAssignWorkedBefore', params: query}, dispatch);
        if (query.page === 1) commit('CLEAN_MODELS_ASSIGN_WORKED_BEFORE');
        commit('SAVE_MODELS_ASSIGN_WORKED_BEFORE', data.items);
        commit('SAVE_MODELS_ASSIGN_WORKED_BEFORE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPairs({commit, dispatch}, query) {
      commit('SET_STATUS', 'request-pairs');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/pairs`,
          params: {params: query}
        }, {name: 'schedule/fetchPairs', params: query}, dispatch);
        commit('SAVE_PAIRS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    savePair({commit, dispatch}, data) {
      commit('SAVE_PAIR', data);
    },
    async deletePair({commit, dispatch}, data) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'post', url: `/workshifts/pair/stock`, data: {
            stock_at: data.stock_at,
            model_id: data.model.id,
            operator_id: data.operator.id,
          }
        }, {name: 'schedule/deletePair', params: data}, dispatch);
        commit('DELETE_PAIR', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_ERRORS',
          errorStatus: 'delete-error',
        });
      }
    },
    editPair({commit}, data) {
      commit('EDIT_PAIR', data);
    },
    async fetchPairsOperators({commit, dispatch}, query) {
      if (query.page === 1) commit('SET_STATUS', 'request-pairs-operators');
      else commit('SET_STATUS', 'request-pairs-operators-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/pairs/operators`,
          params: {params: query}
        }, {name: 'schedule/fetchPairsOperators', params: query}, dispatch);
        if (query.page === 1) commit('CLEAN_PAIRS_OPERATORS');
        commit('SAVE_PAIRS_OPERATORS', data.items);
        commit('SAVE_PAIRS_OPERATORS_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPairsModels({commit, dispatch, state}, query) {
      if (query.page === 1) {
        commit('SET_STATUS', 'request-pairs-models');
        commit('SET_PAIRS_MODELS_QUERY', query);
      } else commit('SET_STATUS', 'request-pairs-models-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/pairs/models`,
          params: {params: query}
        }, {name: 'schedule/fetchPairsModels', params: query}, dispatch);
        if (query !== state.pairsModelsQuery) return;
        if (query.page === 1) commit('CLEAN_PAIRS_MODELS');
        commit('SAVE_PAIRS_MODELS', data.items);
        commit('SAVE_PAIRS_MODELS_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPairsModelsWorkedBefore({commit, dispatch, state}, query) {
      if (query.page === 1) {
        commit('SET_STATUS', 'request-pairs-models');
        commit('SET_PAIRS_MODELS_WORKED_BEFORE_QUERY', query);
      } else commit('SET_STATUS', 'request-pairs-models-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/pairs/models?worked_before=true`,
          params: {params: query}
        }, {name: 'schedule/fetchPairsModelsWorkedBefore', params: query}, dispatch);
        if (query !== state.pairsModelsWorkedBeforeQuery) return;
        if (query.page === 1) commit('CLEAN_PAIRS_MODELS_WORKED_BEFORE');
        commit('SAVE_PAIRS_MODELS_WORKED_BEFORE', data.items);
        commit('SAVE_PAIRS_MODELS_WORKED_BEFORE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelsForCity({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'request');
      requestData.offices.map(office => dispatch('fetchModels', {...requestData.query, office: office.id}));
    },
    async fetchSchedule({commit, dispatch}, query) {
      commit('SET_MAIN_STATUS', 'request-week-workshift');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts`,
          params: {params: query}
        }, {name: 'schedule/fetchSchedule', params: query}, dispatch);
        commit('SAVE_CURRENT_SCHEDULE', {schedule: data, office: query.office});
        commit('DELETE_LOAD_WORKSHIFTS', query.office);
        commit('SET_MAIN_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            commit('SET_MAIN_STATUS', 'error');
            commit('DELETE_LOAD_WORKSHIFTS', query.office);
          },
        });
      }
    },
    async fetchScheduleForCity({commit, dispatch}, requestData) {
      commit('CLEAR_CURRENT_SCHEDULE');
      commit('CLEAR_LOAD_WORKSHIFTS');
      requestData.offices.map(office => {
        commit('SET_LOAD_WORKSHIFTS', office.id);
        dispatch('fetchSchedule', {...requestData.query, office: office.id})
      });
    },
    async fetchPastSchedule({commit, dispatch, state}, query) {
      commit('SET_STATUS', 'request');
      commit('SET_WORKWEEK', query.workweek);
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts`,
          params: {params: {...query, format: 'grid'}}
        }, {name: 'schedule/fetchPastSchedule', params: query}, dispatch);
        if (state.workweek === query.workweek) {
          commit('SAVE_PAST_SCHEDULE', {schedule: data, office: query.office});
          commit('DELETE_LOAD_PAST_WORKSHIFTS', query.office)
          commit('SET_STATUS', '');
        }
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (state.workweek === query.workweek) {
              commit('SET_STATUS', 'error');
              commit('DELETE_LOAD_PAST_WORKSHIFTS', query.office)
            }
          },
        });
      }
    },
    async fetchPastScheduleForCity({commit, dispatch}, {offices, ...requestData}) {
      commit('CLEAR_PAST_SCHEDULE');
      commit('CLEAR_LOAD_PAST_WORKSHIFTS');
      offices.map(office => {
        commit('SET_LOAD_PAST_WORKSHIFTS', office.id);
        dispatch('fetchPastSchedule', {...requestData, office: office.id})
      });
    },
    async fetchOperatorsSchedule({commit, dispatch}, query) {
      commit('SET_STATUS', 'request-operators');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/operators?pagination=false`,
          params: {params: query}
        }, {name: 'schedule/fetchOperatorsSchedule', params: query}, dispatch);
        commit('SAVE_OPERATORS_SCHEDULE', {schedule: data, office: query.group});
        commit('SET_STATUS', '');
        commit('DELETE_LOAD_OPERATORS_WORKSHIFTS', query.group)
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            commit('SET_STATUS', 'error');
            commit('DELETE_LOAD_OPERATORS_WORKSHIFTS', query.group)
          },
        });
      }
    },
    async fetchOperatorsScheduleForCity({commit, dispatch}, requestData) {
      commit('CLEAR_OPERATORS_SCHEDULE');
      commit('CLEAR_LOAD_OPERATORS_WORKSHIFTS');
      requestData.groups.forEach(group => {
        commit('SET_LOAD_OPERATORS_WORKSHIFTS', group.id);
        dispatch('fetchOperatorsSchedule', {group: group.id, ...requestData.query})
      });
    },
    async fetchPotentialOperatorsSchedule({commit, dispatch}, query) {
      commit('SET_STATUS', 'request-operators-potential');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/operators/potential?pagination=false`,
          params: {params: query}
        }, {name: 'schedule/fetchPotentialOperatorsSchedule', params: query}, dispatch);
        commit('SAVE_POTENTIAL_OPERATORS_SCHEDULE', {schedule: data, office: query.group});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    fetchPotentialOperatorsScheduleForCity({commit, dispatch}, requestData) {
      commit('CLEAR_POTENTIAL_OPERATORS_SCHEDULE');
      requestData.groups.forEach(group => dispatch('fetchPotentialOperatorsSchedule', {group: group.id, ...requestData.query}));
    },
    async fetchFreeOperators({commit, dispatch}, query) {
      if (query.page === 1) commit('SET_STATUS', 'request-free-operators');
      else commit('SET_STATUS', 'request-free-operators-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/operators`,
          params: {params: query}
        }, {name: 'schedule/fetchFreeOperators', params: query}, dispatch);
        if (query.page === 1) commit('CLEAN_FREE_OPERATORS');
        commit('SAVE_FREE_OPERATORS', data.items);
        commit('SAVE_FREE_OPERATORS_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    // async fetchPastScheduleForCity({ commit, dispatch }, requestData) {
    //     commit('SET_STATUS', 'request');
    //     commit('CLEAR_SCHEDULE');
    //     requestData.offices.map(office => dispatch('fetchPastSchedule', {...requestData.query, office: office.id}));
    // },
    async createWorkshift({commit, dispatch}, workshift) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts`,
          data: workshift
        }, {name: 'schedule/createWorkshift', params: workshift}, dispatch);
        commit('SAVE_WORKSHIFT', data);
        commit('SAVE_NEW_WORKSHIFT', data[0]);
        commit('SET_STATUS', '');
        return data.id;
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_ERRORS',
          errorStatus: 'create-error',
        });
      }
    },
    async removeOperatorFromShift({commit, dispatch}, workshift) {
      commit('SET_STATUS', 'removing-operator');
      return await dispatch('updateWorkshift', workshift);
    },
    async editWorkshift({commit, dispatch}, workshift) {
      commit('SET_STATUS', 'editing');
      return await dispatch('updateWorkshift', workshift);
    },
    async cancelWorkshift({commit, dispatch}, workshift) {
      commit('SET_STATUS', 'canceling');
      return await dispatch('updateWorkshift', workshift);
    },
    async updateWorkshift({commit, dispatch}, workshift) {
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/workshifts/${workshift.id}`,
          data: workshift
        }, {name: 'schedule/updateWorkshift', params: workshift}, dispatch);
        commit('SAVE_WORKSHIFT', data);
        commit('SAVE_UPDATED_WORKSHIFT', data[0]);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_ERRORS',
          errorStatus: 'edit-error',
        });
      }
    },
    //TO BE DELETED
    async approveWorkshifts({commit, dispatch}, workshiftIds) {
      commit('SET_STATUS', 'updating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts/change_statuses`,
          data: {ids: workshiftIds}
        }, {name: 'schedule/approveWorkshifts', params: workshiftIds}, dispatch);
        commit('UPDATE_WORKSHIFTS_STATUSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'updating-error'});
      }
    },
    async deleteWorkshift({ commit, dispatch }, workshift) {
      commit('SET_DELETE_STATUS', 'deleting');
      try {
        await requestHandler({ method: 'delete', url: `/workshifts/${workshift.id}` }, {
          name: 'schedule/deleteWorkshift',
          params: workshift
        }, dispatch);
        commit('REMOVE_WORKSHIFT', workshift);
        commit('SET_DELETE_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.detail,
          errorMessageMutation: 'SET_ERROR_MESSAGE',
          errorStatus: 'deleting-error',
          statusMutation: 'SET_DELETE_STATUS',
        });
      }
    },
    //TO BE DELETED
    async deleteWorkshifts({commit, dispatch}, workshiftIds) {
      commit('SET_STATUS', 'deleting');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts/destroy`,
          data: {ids: workshiftIds}
        }, {name: 'schedule/deleteWorkshifts', params: workshiftIds}, dispatch);
        commit('REMOVE_WORKSHIFTS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'deleting-error'});
      }
    },
    async assignOperator({commit, dispatch}, query) {
      commit('SET_STATUS', 'assigning');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts/batch`,
          data: query
        }, {name: 'schedule/assignOperator', params: query}, dispatch);
        commit('SET_STATUS', 'assigned');
        return data.status
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_ERRORS',
          errorStatus: 'assigning-error',
        });
      }
    },
    async assignOperators({commit, dispatch}, query) {
      commit('SET_STATUS', 'all-assigning');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts/batch/all`,
          data: query
        }, {name: 'schedule/assignOperators', params: query}, dispatch);
        commit('SET_STATUS', 'all-assigned');
        return data.status
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_ERRORS',
          errorStatus: 'all-assigning-error',
        });
      }
    },
    async getCancellationReasons({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/directory_cancel_workshifts`,
          params: {params: {pagination: false}}
        }, {name: 'schedule/getCancellationReasons'}, dispatch);
        commit('SAVE_CANCELLATION_REASONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createReport({commit, dispatch}, report) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts_reports`,
          data: report
        }, {name: 'schedule/createReport', params: report}, dispatch);
        commit('SAVE_REPORT', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchModelsWithoutOperators({commit, dispatch}, query) {
      if (query.page === 1) commit('SET_STATUS', 'request-models-without-operators');
      else commit('SET_STATUS', 'request-models-without-operators-next');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts/list/operators/models?format=without_group&without_operator=true`,
          params: {params: query}
        }, {name: 'schedule/fetchModelsWithoutOperators', params: query}, dispatch);
        if (query.page === 1) commit('CLEAN_MODELS_WITHOUT_OPERATORS');
        commit('SAVE_MODELS_WITHOUT_OPERATORS', data.items)
        commit('SAVE_MODELS_WITHOUT_OPERATORS_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteUnfinishedShifts({commit, dispatch}, query) {
      commit('SET_STATUS', 'deleting-shifts');
      try {
        await requestHandler({
          method: 'post',
          url: `/workshifts/archives`,
          data: query
        }, {name: 'schedule/deleteUnfinishedShifts', params: query}, dispatch);
        commit('SET_STATUS', 'deleted-shifts');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async setActiveInfo({commit}, data) {
      commit('SET_ACTIVE_INFO', data);
    },
    async clearActiveInfo({commit}) {
      commit('CLEAR_ACTIVE_INFO')
    },
    //config
    async saveWorkshiftConfig({commit, state, dispatch}) {
      commit('SET_STATUS', 'request_config');
      let workshiftTabs = state.workshiftTabs.map(workshiftTab => {
        return {
          ...workshiftTab,
          group: {
            id: workshiftTab.group.id,
            title: workshiftTab.group.title,
            build_group: workshiftTab.group.build_group,
            type: workshiftTab.group.type,
            sub_type: workshiftTab.group.sub_type,
            city: workshiftTab.group.type === 'office' ? {title: workshiftTab.group.city.title} : null
          }
        }
      })
      try {
        await requestHandler({
          method: 'post',
          url: '/users/settings/workshifts',
          data: {workshift_config: {date: new Date(), tabs: workshiftTabs}}
        }, {name: 'auth/saveWorksiftConfig'}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    saveActiveTab({commit}, activeTabInfo) {
      commit('SAVE_ACTIVE_TAB', activeTabInfo);
    },
    clearModelWorkShiftsWeek({commit}) {
      commit('CLEAR_CURRENT_WORKSHIFTS_WEEK');
    },
    saveWorkshiftTab({commit, rootState}, tabsData) {
      commit('SAVE_WORKSHIFT_TABS', {
        date: tabsData.date,
        tabs: tabsData.tabs.filter(tab => isScheduleSectionPermitted(tab.tab, rootState.auth.userPermissions)),
      });
    },
    addWorkshiftTab({commit}, tab) {
      commit('ADD_WORKSHIFT_TABS', tab);
    },
    editWorkshiftTab({commit}, tabInfo) {
      commit('EDIT_WORKSHIFT_TABS', tabInfo);
    },
    deleteWorkshiftTab({commit}, tabId) {
      commit('DELETE_WORKSHIFT_TABS', tabId);
    },
    setActiveTab({commit}, tabId) {
      commit('SET_ACTIVE_WORKSHIFT_TABS', tabId);
    },
    async fetchGenerateLink({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      commit('SET_FREE_MODEL_LINK_STATUS', {id: query.model, linkStatus: 'loading'});
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/generate_link/model`,
          data: query,
        }, {name: 'schedule/fetchGenerateLink', params: query}, dispatch);
        commit('SET_STATUS', '');
        commit('SET_FREE_MODEL_LINK_STATUS', {id: query.model, linkStatus: 'success', link: `${window.location.origin}/schedule.html?link=${data.link}`});
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (error?.response?.data?.violations) commit('SAVE_ERRORS', error.response.data.violations);
            else commit('SAVE_ERRORS', []);
            commit('SET_STATUS', 'link-error');
            commit('SET_FREE_MODEL_LINK_STATUS', {id: query.model, linkStatus: 'error'});
          },
        });
      }
    },
    async fetchWorkshiftReport({commit, dispatch}, reportId) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts_reports/${reportId}`
        }, {name: 'schedule/fetchWorkshiftReport', params: reportId}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createWorkshiftReport({commit, dispatch}, report) {
      commit('SET_STATUS', 'creating-report');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/workshifts_reports`,
          data: report,
        }, {name: 'schedule/createWorkshiftReport', params: report}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async removeOperatorFromModelShifts({commit, dispatch}, params) {
      commit('SET_STATUS', 'removing');
      try {
        await requestHandler({
          method: 'delete',
          url: `/workshifts/operators/${params.operatorId}`,
          params: {params: params.query},
        }, {name: 'schedule/removeOperatorFromModelShifts', params: params}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}
