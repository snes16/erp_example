import {formatPaginationData, requestHandler, responseErrorHandler, updateList} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    authHistoryRoles: [],
    authHistoryObjects: [],
    authHistoryUsers: [],
    authHistoryHeaders: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_AUTH_HISTORY_ROLES(state, roles) {
      state.authHistoryRoles = roles;
    },
    SAVE_AUTH_HISTORY(state, objects) {
      state.authHistoryObjects = objects;
    },
    SAVE_AUTH_HISTORY_USERS(state, objects) {
      state.authHistoryUsers = objects;
    },
    SAVE_AUTH_HISTORY_HEADERS(state, headers) {
      state.authHistoryHeaders = headers;
    },
  },
  actions: {
    async fetchAuthHistoryRoles({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/authorizations/roles?pagination=false`,
        }, {name: 'authHistory/fetchAuthHistoryRoles'}, dispatch);
        commit('SAVE_AUTH_HISTORY_ROLES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchAuthHistory({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/authorizations`,
          params: {params: query},
        }, {name: 'authHistory/fetchAuthHistory', params: query}, dispatch);
        commit('SAVE_AUTH_HISTORY', data.items);
        commit('SAVE_AUTH_HISTORY_HEADERS', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchAuthHistoryUsers({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/authorizations/users`,
          params: {params: query},
        }, {name: 'authHistory/fetchAuthHistoryUsers', params: query}, dispatch);
        commit('SAVE_AUTH_HISTORY_USERS', data.items);
        commit('SAVE_AUTH_HISTORY_HEADERS', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async resetPasswords({ commit, dispatch }, users) {
      commit('SET_STATUS', 'resetting');
      try {
        await requestHandler({method: 'post', url: `/authorizations/password/reset`, data: {users}}, {name: 'authHistory/resetPasswords', params: users}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        commit('SET_STATUS', 'errorRequest');
        responseErrorHandler({commit, error});
      }
    },
  }
}
