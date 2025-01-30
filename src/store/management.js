import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    statusEvents: '',
    statusBirthdays: '',
    statusWorkshiftsStatuses: '',
    statusWorkloads: '',
    statusNewModels: '',
    statusNewUsers: '',
    statusModelsWithoutWorkshifts: '',
    statusOperatorsWithoutWorkshifts: '',
    statusTasks: '',
    calendarEvents: {},
    birthdays: [],
    workshiftsStatuses: {},
    workloads: [],
    newModels: {},
    newUsers: {},
    modelsWithoutWorkshifts: [],
    operatorsWithoutWorkshifts: [],
    tasks: [],
    tasksHeaders: {},
  },
  mutations: {
    SET_STATUS_EVENTS(state, status) {
      state.statusEvents = status;
    },
    SET_STATUS_BIRTHDAYS(state, status) {
      state.statusBirthdays = status;
    },
    SET_STATUS_WORKSHIFTS_STATUSES(state, status) {
      state.statusWorkshiftsStatuses = status;
    },
    SET_STATUS_WORKLOADS(state, status) {
      state.statusWorkloads = status;
    },
    SET_STATUS_NEW_MODELS(state, status) {
      state.statusNewModels = status;
    },
    SET_STATUS_NEW_USERS(state, status) {
      state.statusNewUsers = status;
    },
    SET_STATUS_MODELS_WITHOUT_WORKSHIFTS(state, status) {
      state.statusModelsWithoutWorkshifts = status;
    },
    SET_STATUS_OPERATORS_WITHOUT_WORKSHIFTS(state, status) {
      state.statusOperatorsWithoutWorkshifts = status;
    },
    SET_STATUS_TASKS(state, status) {
      state.statusTasks = status;
    },
    SET_CALENDAR_EVENTS(state, data) {
      state.calendarEvents = {...state.calendarEvents, [data.date]: data.events};
    },
    CLEAN_CALENDAR_EVENTS(state) {
      state.calendarEvents = {}
    },
    SET_BIRTHDAYS(state, birthdays) {
      state.birthdays = birthdays;
    },
    SET_WORKSHIFTS_STATUSES(state, workshiftsStatuses) {
      state.workshiftsStatuses = workshiftsStatuses;
    },
    SET_WORKLOADS(state, workloads) {
      state.workloads = workloads;
    },
    SET_NEW_MODELS(state, newModels) {
      state.newModels = newModels;
    },
    SAVE_NEW_USERS(state, newUsers) {
      state.newUsers = newUsers;
    },
    SET_MODELS_WITHOUT_WORKSHIFTS(state, modelsWithoutWorkshifts) {
      state.modelsWithoutWorkshifts = modelsWithoutWorkshifts;
    },
    SET_OPERATORS_WITHOUT_WORKSHIFTS(state, operatorsWithoutWorkshifts) {
      state.operatorsWithoutWorkshifts = operatorsWithoutWorkshifts;
    },
    SET_TASKS(state, tasks) {
      state.tasks = tasks;
    },
    SET_TASKS_NEXT_PAGE(state, tasks) {
      state.tasks = [...state.tasks, ...tasks];
    },
    SET_TASKS_HEADERS(state, pagination) {
      state.tasksHeaders = pagination
    },
  },
  actions: {
    async fetchBirthdays({commit, dispatch}, query) {
      try {
        commit('SET_STATUS_BIRTHDAYS', 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/birthday',
          params: {params: query}
        }, {name: 'profile/fetchBirthdays', params: query}, dispatch);
        commit('SET_STATUS_BIRTHDAYS', '');
        commit('SET_BIRTHDAYS', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_BIRTHDAYS'});
      }
    },
    async fetchEventCalendar({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_EVENTS', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/events',
          params: {params: requestData.query}
        }, {name: 'profile/fetchEventCalendar', params: requestData}, dispatch);
        commit('SET_STATUS_EVENTS', '');
        commit('SET_CALENDAR_EVENTS', {events: data, date: requestData.query.date});
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_EVENTS'});
      }
    },
    cleanCalendarEvents({commit}) {
      commit('CLEAN_CALENDAR_EVENTS', '');
    },
    async fetchWorkshiftsStatuses({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_WORKSHIFTS_STATUSES', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/workshifts/actual',
          params: {params: requestData.query}
        }, {name: 'profile/fetchWorkshiftsStatuses', params: requestData}, dispatch);
        commit('SET_STATUS_WORKSHIFTS_STATUSES', '');
        commit('SET_WORKSHIFTS_STATUSES', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_WORKSHIFTS_STATUSES'});
      }
    },
    async fetchWorkloads({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_WORKLOADS', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/workloads',
          params: {params: requestData.query}
        }, {name: 'profile/fetchWorkloads', params: requestData}, dispatch);
        commit('SET_STATUS_WORKLOADS', '');
        commit('SET_WORKLOADS', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_WORKLOADS'});
      }
    },
    async fetchNewModels({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_NEW_MODELS', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/users/new_models',
          params: {params: requestData.query}
        }, {name: 'profile/fetchNewModels', params: requestData}, dispatch);
        commit('SET_STATUS_NEW_MODELS', '');
        commit('SET_NEW_MODELS', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_NEW_MODELS'});
      }
    },
    async fetchNewUsers({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_NEW_USERS', requestData.isFirstRequest ? 'first-request' : 'request');
        const { data } = await requestHandler({
          method: 'get',
          url: '/widgets/users/new_users',
          params: { params: requestData.query },
        }, { name: 'profile/fetchNewUsers', params: requestData }, dispatch);
        commit('SET_STATUS_NEW_USERS', '');
        commit('SAVE_NEW_USERS', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_NEW_USERS'});
      }
    },
    async fetchModelsWithoutWorkshifts({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_MODELS_WITHOUT_WORKSHIFTS', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/workshifts/models',
          params: {params: requestData.query}
        }, {name: 'profile/fetchModelsWithoutWorkshifts', params: requestData}, dispatch);
        commit('SET_STATUS_MODELS_WITHOUT_WORKSHIFTS', '');
        commit('SET_MODELS_WITHOUT_WORKSHIFTS', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_MODELS_WITHOUT_WORKSHIFTS'});
      }
    },
    async fetchOperatorsWithoutWorkshifts({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_OPERATORS_WITHOUT_WORKSHIFTS', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/workshifts/operators',
          params: {params: requestData.query}
        }, {name: 'profile/fetchOperatorsWithoutWorkshifts', params: requestData}, dispatch);
        commit('SET_STATUS_OPERATORS_WITHOUT_WORKSHIFTS', '');
        commit('SET_OPERATORS_WITHOUT_WORKSHIFTS', data);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_OPERATORS_WITHOUT_WORKSHIFTS'});
      }
    },
    async fetchTaskWidget({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_TASKS', requestData.isFirstRequest ? 'first-request' : 'request');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/users/task_statuses',
          params: {params: requestData.query}
        }, {name: 'profile/fetchTaskWidget', params: requestData}, dispatch);
        commit('SET_TASKS', data.items);
        commit(`SET_TASKS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS_TASKS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_TASKS'});
      }
    },
    async fetchTaskWidgetNextPage({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS_TASKS', 'request_pagination');
        let {data} = await requestHandler({
          method: 'get',
          url: '/widgets/users/task_statuses',
          params: {params: requestData}
        }, {name: 'profile/fetchTaskWidgetNextPage', params: requestData}, dispatch);
        commit('SET_TASKS_NEXT_PAGE', data.items);
        commit(`SET_TASKS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS_TASKS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_TASKS'});
      }
    },
  }
}
