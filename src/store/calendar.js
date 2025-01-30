import {requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    birthdays: [],
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_BIRTHDAYS(state, birthdays) {
      state.birthdays = birthdays;
    },
  },
  actions: {
    async fetchBirthdays({ commit, dispatch }, query) {
      try {
        commit('SET_STATUS', 'request');
        let { data } = await requestHandler({method: 'get', url: '/calendar/birthdays', params: { params: query }}, {name: 'profile/fetchBirthdays', params: query}, dispatch);
        commit('SET_STATUS', '');
        commit('SET_BIRTHDAYS', data);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}