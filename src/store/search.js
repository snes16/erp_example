import {requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    results: {
      users: [],
      groups: [],
      vacancies: [],
      responses: [],
      tasks: [],
      accounts: [],
    }
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_SEARCH_RESULTS(state, results) {
      state.results = results;
    },
  },
  actions: {
    async fetchSearchResults({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/search/global`, params: { params: query }}, {name: 'search/fetchSearchResults', params: query}, dispatch);
        commit('SAVE_SEARCH_RESULTS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    clearSearchResults({ commit }) {
      commit('SAVE_SEARCH_RESULTS', {
        users: [],
        groups: [],
        vacancies: [],
        responses: [],
        tasks: [],
      });
    },
  }
}
