import {formatPaginationData, requestHandler, responseErrorHandler, updateList} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    errorMessage: '',
    positions: [],
    positionsPagination: {},
    position: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_POSITIONS(state, positions) {
      state.positions = positions;
    },
    SAVE_PAGINATION(state, pagination) {
      state.positionsPagination = pagination;
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
    SAVE_POSITION(state, position) {
      state.position = position;
    },
    UPDATE_POSITION_IN_POSITIONS(state, position) {
      state.positions = updateList(state.positions, position);
    },
  },
  actions: {
    async fetchPositions({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/positions`,
          params: {params: query},
        }, {name: 'positions/fetchPositions', params: query}, dispatch);
        commit('SAVE_POSITIONS', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createPosition({commit, dispatch}, position) {
      commit('SET_STATUS', 'creating');
      try {
        const { data } = await requestHandler({
          method: 'post',
          url: `/positions`,
          data: position,
        }, {name: 'positions/createPosition', params: position}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_POSITION', data);
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async editPosition({commit, dispatch}, position) {
      commit('SET_STATUS', 'editing');
      try {
        const { data } = await requestHandler({
          method: 'put',
          url: `/positions/${position.id}`,
          data: position,
        }, {name: 'positions/createPosition', params: position}, dispatch);
        commit('SET_STATUS', '');
        commit('UPDATE_POSITION_IN_POSITIONS', data);
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deletePosition({commit, dispatch}, positionId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/positions/${positionId}`,
          data: positionId,
        }, {name: 'positions/deletePosition', params: positionId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deleteUserFromPosition({commit, dispatch}, params) {
      commit('SET_STATUS', 'deleting-users');
      try {
        await requestHandler({
          method: 'delete',
          url: `/positions/${params.positionId}/users/${params.userId}`,
        }, {name: 'positions/deleteUserFromPosition', params: params}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async addUsersToPosition({commit, dispatch}, params) {
      commit('SET_STATUS', 'adding-users');
      try {
        await requestHandler({
          method: 'post',
          url: `/positions/${params.positionId}/users`,
          data: params.users,
        }, {name: 'positions/addUsersToPosition', params: params}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deleteAllUsersOfRoleFromPosition({commit, dispatch}, params) {
      commit('SET_STATUS', 'deleting-users');
      try {
        await requestHandler({
          method: 'delete',
          url: `/positions/${params.positionId}/roles/${params.roleId}`,
          params: {
            params: params.query,
          }
        }, {name: 'positions/deleteUserFromPosition', params: params}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
  },
};
