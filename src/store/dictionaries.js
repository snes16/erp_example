import {requestHandler, responseErrorHandler, updateList} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    timezones: {},
    resourcesHr: {},
    resourcesWebcam: {},
    resourcesRoom: {},
    genders: {
      male: 'Мужской',
      female: 'Женский'
    },
    taskTypes: {},
    allTaskTypes: {},
    taskStatuses: {},
    taskStatusesArray: [],
    taskStatusesMultiple: {},
    usersWithTasks: [],
    responseStatuses: [],
    credentialStatuses: {},
    credentialStatusesRevisionNew: {},
    allCredentialStatuses: {},
    profileCredentialStatuses: {},
    communications: [],
    roles: [],
    rolesDetailed: [],
    cancellationReasons: {},
    operators: [],
    attachments: {},
    groups: [],
    groupsNonOperators: [],
    groupsOperators: [],
    groupsModels: [],
    officesModels: [],
    groupsNonSystem: [],
    countries: [],
    cities: [],
    offices: [],
    credentialBlockingReasons: {},
    resignReasons: [],
    mainPages: [],
    absenceTypes: [],
    nationalities: [],
    usersReferralResponses: [],
    postponementReasons: [],
    jobDuties: [],
    workshiftReportTemplates: [],
    paymentResources: [],
    paymentTemplates: [],
    currencies: [],
    finesReasons: [],
    positions: [],
  },
  getters: {
    getRoleByCode: state => code => state.rolesDetailed.find(role => role.code === code) || {}
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_TIMEZONES(state, timezones) {
      state.timezones = timezones;
    },
    SAVE_RESOURCES_HR(state, resources) {
      state.resourcesHr = resources;
    },
    SAVE_RESOURCES_WEBCAM(state, resources) {
      state.resourcesWebcam = resources;
    },
    SAVE_RESOURCES_ROOM(state, resources) {
      state.resourcesRoom = resources;
    },
    SAVE_RESPONSE_STATUSES(state, responseStatuses) {
      state.responseStatuses = responseStatuses;
    },
    SAVE_TASK_TYPES(state, types) {
      state.taskTypes = types;
    },
    SAVE_ALL_TASK_TYPES(state, types) {
      state.allTaskTypes = types;
    },
    SAVE_TASK_STATUSES(state, statuses) {
      state.taskStatuses = statuses;
    },
    SAVE_TASK_STATUSES_ARRAY(state, statuses) {
      state.taskStatusesArray = statuses;
    },
    SAVE_TASK_STATUSES_MULTIPLE(state, statuses) {
      state.taskStatusesMultiple = statuses;
    },
    SAVE_USERS_WITH_TASKS(state, users) {
      state.usersWithTasks = users;
    },
    SAVE_CREDENTIAL_STATUSES(state, statuses) {
      state.credentialStatuses = statuses;
    },
    SAVE_CREDENTIAL_STATUSES_REVISION_NEW(state, statuses) {
      state.credentialStatusesRevisionNew = statuses;
    },
    SAVE_ALL_CREDENTIAL_STATUSES(state, statuses) {
      state.allCredentialStatuses = statuses;
    },
    SAVE_PROFILE_CREDENTIAL_STATUSES(state, statuses) {
      state.profileCredentialStatuses = statuses;
    },
    SAVE_COMMUNICATIONS(state, communications) {
      state.communications = communications;
    },
    SAVE_ROLES(state, roles) {
      state.roles = roles;
    },
    SAVE_ROLE(state, role) {
      state.rolesDetailed = updateList(state.rolesDetailed, role);
    },
    SAVE_CANCELLATION_REASONS(state, reasons) {
      state.cancellationReasons = reasons;
    },
    SAVE_OPERATORS(state, operators) {
      state.operators = operators;
    },
    SAVE_ATTACHMENTS(state, attachments) {
      state.attachments = attachments;
    },
    SAVE_GROUPS(state, groups) {
      state.groups = groups;
    },
    SAVE_GROUPS_NON_OPERATORS(state, groups) {
      state.groupsNonOperators = groups;
    },
    SAVE_GROUPS_OPERATORS(state, groups) {
      state.groupsOperators = groups;
    },
    SAVE_GROUPS_MODELS(state, groups) {
      state.groupsModels = groups;
    },
    SAVE_OFFICES_MODELS(state, groups) {
      state.officesModels = groups;
    },
    SAVE_GROUPS_NON_SYSTEM(state, groups) {
      state.groupsNonSystem = groups;
    },
    SAVE_GROUPS_COUNTRY(state, groups) {
      state.countries = groups;
    },
    SAVE_GROUPS_CITY(state, groups) {
      state.cities = groups;
    },
    SAVE_GROUPS_OFFICE(state, groups) {
      state.offices = groups;
    },
    SAVE_CREDENTIAL_BLOCKING_REASONS(state, reasons) {
      state.credentialBlockingReasons = reasons;
    },
    SAVE_RESIGN_REASONS(state, reasons) {
      state.resignReasons = reasons;
    },
    SAVE_MAIN_PAGES(state, pages) {
      state.mainPages = pages;
    },
    SAVE_ABSENCE_TYPES(state, types) {
      state.absenceTypes = types;
    },
    SAVE_NATIONALITIES(state, nationalities) {
      state.nationalities = nationalities;
    },
    SAVE_USERS_RESPONSES(state, usersReferralResponses) {
      state.usersReferralResponses = usersReferralResponses;
    },
    SAVE_POSTPONEMENT_REASONS(state, reasons) {
      state.postponementReasons = reasons;
    },
    SAVE_JOB_DUTIES(state, jobDuties) {
      state.jobDuties = jobDuties;
    },
    SAVE_WORKSHIFT_REPORT_TEMPLATES(state, templates) {
      state.workshiftReportTemplates = templates;
    },
    SAVE_PAYMENT_RESOURCES(state, paymentResources) {
      state.paymentResources = paymentResources;
    },
    SAVE_PAYMENT_TEMPLATES(state, paymentTemplates) {
      state.paymentTemplates = paymentTemplates;
    },
    SAVE_CURRENCIES(state, currencies) {
      state.currencies = currencies;
    },
    SAVE_POSITIONS(state, positions) {
      state.positions = positions;
    },
    SAVE_FINE_REASONS(state, fineReasons) {
      state.finesReasons = fineReasons;
    },
  },
  actions: {
    async getTimezones({state, dispatch}) {
      if (!Object.keys(state.timezones).length) return dispatch('fetchTimezones');
    },
    async fetchTimezones({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/timezones`
        }, {name: 'dictionaries/fetchTimezones'}, dispatch);
        commit('SAVE_TIMEZONES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    /*async getResources({ state, dispatch }, query) {
        if (!state.resources.length) return dispatch('fetchResources', query);
    },*/
    async fetchResources({commit, dispatch}, query) {
      if (!query.type) return;
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/resources?pagination=false`,
          params: {params: {type: query && query.type}}
        }, {name: 'dictionaries/fetchResources', params: query}, dispatch);
        commit(`SAVE_RESOURCES_${query.type.toUpperCase()}`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchResponseStatuses({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/response_statuses`
        }, {name: 'dictionaries/fetchResponseStatuses'}, dispatch);
        commit('SAVE_RESPONSE_STATUSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchTaskTypes({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/task_types`
        }, {name: 'dictionaries/fetchTaskTypes'}, dispatch);
        commit('SAVE_TASK_TYPES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchAllTaskTypes({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/task_types?all=true`
        }, {name: 'dictionaries/fetchAllTaskTypes'}, dispatch);
        commit('SAVE_ALL_TASK_TYPES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchTaskStatuses({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/task_statuses`
        }, {name: 'dictionaries/fetchTaskStatuses'}, dispatch);
        commit('SAVE_TASK_STATUSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchTaskStatusesArray({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/task_statuses?output_type=array`
        }, {name: 'dictionaries/fetchTaskStatusesArray'}, dispatch);
        commit('SAVE_TASK_STATUSES_ARRAY', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchTaskStatusesMultiple({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/task_multiple_statuses`
        }, {name: 'dictionaries/fetchTaskStatusesMultiple'}, dispatch);
        commit('SAVE_TASK_STATUSES_MULTIPLE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersWithTasks({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users?exists[tasks]=true&pagination=false&is_active=true`
        }, {name: 'dictionaries/fetchUsersWithTasks'}, dispatch);
        commit('SAVE_USERS_WITH_TASKS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersReferralResponses({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users?exists[referral_responses]=true&pagination=false`
        }, {name: 'dictionaries/fetchUsersReferralResponses'}, dispatch);
        commit('SAVE_USERS_RESPONSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchCredentialStatuses({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/credential_statuses/checking_new`
        }, {name: 'dictionaries/fetchCredentialStatuses'}, dispatch);
        commit('SAVE_CREDENTIAL_STATUSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getCredentialStatusesForRevisionNew({state, dispatch}) {
      if (Object.keys(state.credentialStatusesRevisionNew).length) return;
      return dispatch('fetchCredentialStatusesForRevisionNew');
    },
    async fetchCredentialStatusesForRevisionNew({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/credential_statuses/revision_new`
        }, {name: 'dictionaries/fetchCredentialStatusesForRevisionNew'}, dispatch);
        commit('SAVE_CREDENTIAL_STATUSES_REVISION_NEW', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchAllCredentialStatuses({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/credential_statuses/all`
        }, {name: 'dictionaries/fetchAllCredentialStatuses'}, dispatch);
        commit('SAVE_ALL_CREDENTIAL_STATUSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchProfileCredentialStatuses({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/credential_statuses/profile`
        }, {name: 'dictionaries/fetchProfileCredentialStatuses'}, dispatch);
        commit('SAVE_PROFILE_CREDENTIAL_STATUSES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchCommunications({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/communications`
        }, {name: 'dictionaries/fetchCommunications'}, dispatch);
        commit('SAVE_COMMUNICATIONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchRoles({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/roles`,
          params: {params: query}
        }, {name: 'dictionaries/fetchRoles', params: query}, dispatch);
        commit('SAVE_ROLES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getRoles({state, dispatch}) {
      if (!state.roles.length) return dispatch('fetchRoles');
    },
    async fetchCancellationReasons({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/directory_cancel_workshifts`
        }, {name: 'dictionaries/fetchCancellationReasons'}, dispatch);
        commit('SAVE_CANCELLATION_REASONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchOperators({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/operators`
        }, {name: 'dictionaries/fetchOperators'}, dispatch);
        commit('SAVE_OPERATORS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchAttachments({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/attachments`
        }, {name: 'dictionaries/fetchAttachments'}, dispatch);
        commit('SAVE_ATTACHMENTS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchGroups({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/groups?lvl=0`
        }, {name: 'dictionaries/fetchGroups'}, dispatch);
        commit(`SAVE_GROUPS`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchGroupsNonOperators({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/groups?lvl=0&sub_type=model`
        }, {name: 'dictionaries/fetchGroupsNonOperators'}, dispatch);
        commit(`SAVE_GROUPS_NON_OPERATORS`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchGroupsOperators({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/groups?lvl=0&sub_type=operator`
        }, {name: 'dictionaries/fetchGroupsOperators'}, dispatch);
        commit(`SAVE_GROUPS_OPERATORS`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchGroupsModels({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/groups?lvl=0&sub_type=model`
        }, {name: 'dictionaries/getGroupsModels'}, dispatch);
        commit('SAVE_GROUPS_MODELS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchOfficesModels({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get', url: `/dictionary/groups`, params: {
            params: {
              type: 'office',
              sub_type: 'model',
            }
          }
        }, {name: 'dictionaries/getGroupsModels'}, dispatch);
        commit('SAVE_OFFICES_MODELS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchGroupsNonSystem({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/groups?lvl=0&skip_system=1`
        }, {name: 'dictionaries/fetchGroupsNonSystem'}, dispatch);
        commit(`SAVE_GROUPS_NON_SYSTEM`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getGroupsNonSystem({state, dispatch}) {
      if (!state.groupsNonSystem.length) return dispatch('fetchGroupsNonSystem')
    },
    async fetchGroupsByType({commit, dispatch}, type) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/groups?pagination=false`,
          params: {params: {type: type}}
        }, {name: 'dictionaries/fetchGroupsByType', params: type}, dispatch);
        commit(`SAVE_GROUPS_${type.toUpperCase()}`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchCredentialBlockingReasons({commit, dispatch}) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/credential_blocking_reasons?pagination=false`
        }, {name: 'dictionaries/fetchCredentialBlockingReasons'}, dispatch);
        commit('SAVE_CREDENTIAL_BLOCKING_REASONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchResignReasons({commit, dispatch}) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/resigns?pagination=false`
        }, {name: 'dictionaries/fetchResignReasons'}, dispatch);
        commit('SAVE_RESIGN_REASONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchMainPages({commit, dispatch}) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/role_main_page?pagination=false`
        }, {name: 'directory/fetchMainPages'}, dispatch);
        commit('SAVE_MAIN_PAGES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchRole({commit, dispatch}, roleId) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/roles/${roleId}`
        }, {name: 'directory/fetchRole', params: roleId}, dispatch);
        commit('SAVE_ROLE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getAbsenceTypes({state, dispatch}) {
      if (!state.absenceTypes.length) return dispatch('fetchAbsenceTypes')
    },
    async fetchAbsenceTypes({commit, dispatch}) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/absence_types?pagination=false`
        }, {name: 'dictionaries/fetchAbsenceTypes'}, dispatch);
        commit('SAVE_ABSENCE_TYPES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getNationalities({state, dispatch}) {
      if (!state.nationalities.length) return dispatch('fetchNationalities')
    },
    async fetchNationalities({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/nationalities`
        }, {name: 'dictionaries/fetchNationalities'}, dispatch);
        commit('SAVE_NATIONALITIES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getPostponementReasons({state, dispatch}) {
      if (!state.postponementReasons.length) return dispatch('fetchPostponementReasons')
    },
    async fetchPostponementReasons({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/postponements`
        }, {name: 'dictionaries/fetchPostponementReasons'}, dispatch);
        commit('SAVE_POSTPONEMENT_REASONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getJobDuties({state, dispatch}) {
      if (!state.jobDuties.length) return dispatch('fetchJobDuties')
    },
    async fetchJobDuties({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/job_duties?lvl=0`
        }, {name: 'dictionaries/fetchJobDuties'}, dispatch);
        commit('SAVE_JOB_DUTIES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchWorkshiftReportTemplates({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/template_group_workshift_reports`
        }, {name: 'dictionaries/fetchWorkshiftReportTemplates'}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT_TEMPLATES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPaymentResources({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/payment_resources?pagination=false`
        }, {name: 'dictionaries/fetchPaymentResources'}, dispatch);
        commit('SAVE_PAYMENT_RESOURCES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPaymentTemplates({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/payment_templates?pagination=false`
        }, {name: 'dictionaries/fetchPaymentTemplates'}, dispatch);
        commit('SAVE_PAYMENT_TEMPLATES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getCurrencies({state, dispatch}) {
      if (state.currencies.length) return;
      return dispatch('fetchCurrencies');
    },
    async fetchCurrencies({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/currencies?pagination=false`
        }, {name: 'dictionaries/fetchCurrencies'}, dispatch);
        commit('SAVE_CURRENCIES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPositions({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/positions`,
          params: {params: query}
        }, {name: 'dictionaries/fetchPositions', params: query}, dispatch);
        commit('SAVE_POSITIONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getPositions({state, dispatch}) {
      if (!state.positions.length) return dispatch('fetchPositions');
    },
    async fetchFineReasons({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/dictionaries/fine_reasons`,
          params: {params: query}
        }, {name: 'dictionaries/fetchFineReasons', params: query}, dispatch);
        commit('SAVE_FINE_REASONS', data)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}