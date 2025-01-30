import axios from "axios";

export default {
  namespaced: true,
  state: {
    status: '',
    actions: [],
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    ADD_ACTION(state, action) {
      state.actions = [...state.actions, action];
    },
    CLEAR_ACTIONS(state) {
      state.actions = [];
    },
  },
  actions: {
    async refreshToken({commit, dispatch, rootState, state}, action) {
      if (!action.preventRequestAfterRefresh) commit('ADD_ACTION', action);
      const refresh = rootState.auth.refreshToken;
      if (!refresh) return dispatch('auth/logoutUser', {}, {root: true});
      if (state.status === 'refreshing') return;
      commit('SET_STATUS', 'refreshing');
      try {
        let {data} = await axios.post('/token/refresh', {refresh_token: refresh});
        dispatch('auth/setTokens', {token: data.token, refresh_token: data.refresh_token}, {root: true});
        dispatch('updateFailedRequests');
        commit('SET_STATUS', '');
      } catch (error) {
        dispatch('auth/logoutUser', {}, {root: true});
        commit('SET_STATUS', 'error');
      }
    },
    updateFailedRequests({state, dispatch, commit}) {
      state.actions.map(action => dispatch(action.name, action.params, {root: true}));
      commit('CLEAR_ACTIONS');
    },
  }
}
