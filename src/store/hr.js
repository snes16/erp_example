import {updateList, requestHandler, formatPaginationData, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    hrStatus: '',
    responsesStatus: '',
    editStatus: '',
    vacancies: [],
    vacanciesList: [],
    vacanciesListHeaders: {},
    responses: [],
    vacancy: {},
    groups: [],
    headers: [],
    countries: [],
    cities: [],
    offices: [],
    vacancyStatus: '',
    currentVacancy: {},
    vacancyPagination: {},
    vacancyResponses: [],
    filterResponses: [],
    responsesPagination: {},
    allResponsesPagination: {},
    responsesStats: [],
    responsesStatsPeriods: [],
  },
  getters: {
    getCountryByCityId: state => id => {
      if (id === '') return ''
      else return state.countries.find(function (country) {
        if (country) {
          return country.children.find(function (children) {
            if (children.id === id) return children
          })
        }
      })
    },
    getCountryById: state => id => {
      return state.countries.find(country => country.id === id);
    },
    getCitiesbyCountryId: state => id => {
      if (id === '') return state.cities.map(function (city) {
        return {id: city.id, title: city.title}
      })
      else return state.cities.filter(function (city) {
        if (city.parent) {
          if (city.parent.id === id) {
            return city
          }
        }
      })
    },
    getCityById: state => id => {
      return state.cities.find(city => city.id === id);
    },
    getOfficesByCityId: state => id => {
      if (id === '') return officiesCopy
      else return state.offices.filter(function (office) {
        if (office.parent.id === id) {
          return office
        }
      })
    },
  },
  mutations: {
    SET_STATUS(state, status) {
      state.hrStatus = status;
    },
    SET_RESPONSES_STATUS(state, status) {
      state.responsesStatus = status;
    },
    SET_EDIT_STATUS(state, status) {
      state.editStatus = status;
    },
    SAVE_VACANCIES(state, vacancies) {
      state.vacancies = vacancies;
    },
    SAVE_VACANCIES_LIST(state, vacancies) {
      state.vacanciesList = vacancies;
    },
    SAVE_VACANCIES_LIST_PAGE(state, vacancies) {
      state.vacanciesList = [...state.vacanciesList, ...vacancies];
    },
    SAVE_VACANCIES_LIST_HEADERS(state, vacancies) {
      state.vacanciesListHeaders = vacancies;
    },
    SAVE_RESPONSES(state, responses) {
      state.responses = responses;
    },
    FETCH_GROUPS(state, groups) {
      state.groups = groups;
    },
    FETCH_COUNTRIES(state, countries) {
      state.countries = countries;
    },
    SAVE_CITIES(state, cities) {
      state.cities = cities;
    },
    FETCH_OFFICES(state, offices) {
      state.offices = offices;
    },
    FETCH_HEADERS(state, resources) {
      state.headers = resources;
    },
    SAVE_VACANCY(state, vacancy) {
      state.vacancy = vacancy;
    },
    EDIT_VACANCIES(state, vacancy) {
      state.vacancies = updateList(state.vacancies, vacancy);
    },
    DELETE_VACANCY(state, vacancyId) {
      state.vacancies = updateList(state.vacancies, vacancyId, 'remove');
    },
    SAVE_VACANCY_STATUS(state, vacancyStatus) {
      state.vacancyStatus = vacancyStatus;
    },
    SAVE_CURRENT_VACANCY(state, vacancy) {
      state.currentVacancy = vacancy;
    },
    SAVE_PAGINATION(state, pagination) {
      state.vacancyPagination = pagination;
    },
    SAVE_VACANCY_RESPONSES(state, responses) {
      state.vacancyResponses = [...state.vacancyResponses, ...responses];
    },
    CLEAN_VACANCY_RESPONSES(state) {
      state.vacancyResponses = [];
    },
    SAVE_RESPONSES_PAGINATION(state, pagination) {
      state.responsesPagination = pagination;
    },
    SAVE_ALL_RESPONSES_PAGINATION(state, pagination) {
      state.allResponsesPagination = pagination;
    },
    SAVE_FILTER_RESPONSES(state, filter) {
      state.filterResponses = filter;
    },
    SAVE_RESPONSES_STATS(state, stats) {
      state.responsesStats = stats;
    },
    SAVE_RESPONSES_STATS_PERIODS(state, stats) {
      state.responsesStatsPeriods = stats;
    },
  },
  actions: {
    async getVacancies({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/vacancies`,
          params: {params: query}
        }, {name: 'hr/getVacancies', params: query}, dispatch);
        commit('SAVE_VACANCIES', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        switch (query.status) {
          case 'active':
            commit('SET_STATUS', 'active_vacancies-is-fetched');
            break;
          case 'archive':
            commit('SET_STATUS', 'archive_vacancies-is-fetched');
            break;
        }
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getCurrentVacancy({commit, dispatch}, id) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/vacancies/${id}`
        }, {name: 'hr/getCurrentVacancy', params: id}, dispatch);
        commit('SAVE_CURRENT_VACANCY', data);
        commit('EDIT_VACANCIES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (e.response.status === 403) commit('SET_STATUS', 'error 403')
            else commit('SET_STATUS', 'error');
          },
        });
      }
    },
    async fetchVacanciesList({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      if (query.page === 1) commit('SAVE_VACANCIES_LIST', []);
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: '/dictionary/vacancies?status=active',
          params: {params: query}
        }, {name: 'hr/fetchVacanciesList', params: query}, dispatch);
        if (query.page === 1) commit('SAVE_VACANCIES_LIST', data.items);
        else commit('SAVE_VACANCIES_LIST_PAGE', data.items);
        commit('SAVE_VACANCIES_LIST_HEADERS', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getVacancyResponses({commit, dispatch, state}, query) {
      if (query.page === 1) {
        commit('CLEAN_VACANCY_RESPONSES')
        commit('SET_RESPONSES_STATUS', 'request');
      } else commit('SET_RESPONSES_STATUS', 'request_responses');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/vacancy_responses`,
          params: {
            params: {
              pagination: true,
              vacancy: query.vacancy,
              types: query.types,
              per_page: 20,
              page: query.page
            }
          }
        }, {name: 'hr/getVacancyResponses', params: query}, dispatch);
        if (state.filterResponses === query.types) {
          commit('SAVE_VACANCY_RESPONSES', data.items)
          commit('SAVE_RESPONSES_PAGINATION', formatPaginationData(data));
          commit('SET_RESPONSES_STATUS', '');
        }
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_RESPONSES_STATUS'});
      }
    },
    async createVacancy({commit, dispatch}, vacancy) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/vacancies`,
          data: {
            title: vacancy.title,
            group: vacancy.group,
            resource: vacancy.resource,
            description: vacancy.description
          }
        }, {name: 'hr/createVacancy', params: vacancy}, dispatch);
        commit('SAVE_VACANCY', data)
        commit('EDIT_VACANCIES', data)
        commit('SET_STATUS', 'vacancy-created')
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async changeVacancies({commit, dispatch}, vacancy) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/vacancies/${vacancy.id}`,
          data: {
            status: vacancy.status,
            title: vacancy.title,
            group: vacancy.group,
            resource: vacancy.resource,
            description: vacancy.description
          }
        }, {name: 'hr/changeVacancies', params: vacancy}, dispatch);
        commit('SAVE_VACANCY', data);
        if (data.status === 'active') {
          commit('SET_STATUS', 'vacancy-unzip');
          commit('DELETE_VACANCY', vacancy.id);
        } else if (data.status === 'archive') {
          commit('SET_STATUS', 'vacancy-archived');
          commit('DELETE_VACANCY', data.id);
        }
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async changeCurrentVacancy({commit, dispatch}, query) {
      commit('SET_EDIT_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/vacancies/${query.id}`,
          data: {
            title: query.title,
            group: query.group,
            resource: query.resource,
            description: query.description,
            users_access: query.users_access
          }
        }, {name: 'hr/changeCurrentVacancy', params: query}, dispatch);
        commit('SAVE_VACANCY', data);
        commit('EDIT_VACANCIES', data);
        commit('SAVE_CURRENT_VACANCY', data);
        commit('SET_EDIT_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_EDIT_STATUS'});
      }
    },
    async deleteVacancy({commit, dispatch}, vacancy) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/vacancies/${vacancy.id}`}, {
          name: 'hr/deleteVacancy',
          params: vacancy
        }, dispatch);
        commit('DELETE_VACANCY', vacancy.id);
        commit('SET_STATUS', 'vacancy-deleted');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    saveVacancyStatus({commit}, vacancyStatus) {
      commit('SAVE_VACANCY_STATUS', vacancyStatus);
    },
    saveFilterResponses({commit}, filter) {
      commit('SAVE_FILTER_RESPONSES', filter);
    },
    async getResponses({commit, dispatch}, query) {
      commit('SET_STATUS', 'responses-request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/responses`,
          params: {params: query}
        }, {name: 'hr/getResponses', params: query}, dispatch);
        commit('SAVE_RESPONSES', data.items);
        commit('SAVE_ALL_RESPONSES_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchResponsesStats({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/widgets/hr/responses`,
          params: {params: query}
        }, {name: 'hr/fetchResponsesStats', params: query}, dispatch);
        commit('SAVE_RESPONSES_STATS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchResponsesStatsPeriods({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/widgets/hr/responses/periods`,
          params: {params: query}
        }, {name: 'hr/fetchResponsesStatsPeriods', params: query}, dispatch);
        commit('SAVE_RESPONSES_STATS_PERIODS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
};