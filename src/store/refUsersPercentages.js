import {
  requestHandler,
  formatPaginationData,
  responseErrorHandler
} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    currentUsers: [],
    currentUsersHeaders: {},
    pagination: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
    SAVE_CURRENT_USERS(state, users) {
      state.currentUsers = [...state.currentUsers, ...users];
    },
    SAVE_CURRENT_USERS_HEADERS(state, headers) {
      state.currentUsersHeaders = headers;
    },
    CLEAR_CURRENT_USERS(state) {
      state.currentUsers = [];
    },
  },
  actions: {
    async fetchTableRefUsers({commit, dispatch}, filters){
      commit('SET_STATUS', 'fetching');
      commit('CLEAR_CURRENT_USERS');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users/ref_system_connections`,
          params: {params: filters}
        }, {name: 'profile/fetchTableRefUsers', params: filters}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_PAGINATION');
        commit('SAVE_CURRENT_USERS', data.items);
        commit('SAVE_CURRENT_USERS_HEADERS', formatPaginationData(data));
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}
