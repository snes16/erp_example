import {updateList, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    reasonsGroups: [],
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_REASONS_GROUPS(state, groups) {
      state.reasonsGroups = groups;
    },
    SAVE_REASONS_GROUP(state, group) {
      state.reasonsGroups = updateList(state.reasonsGroups, group);
    },
    REMOVE_REASONS_GROUP(state, groupId) {
      state.reasonsGroups = updateList(state.reasonsGroups, groupId, 'remove');
    },
  },
  actions: {
    async fetchReasonsGroups({ commit, dispatch }) {
      try {
        commit('SET_STATUS', 'fetching');
        let { data } = await requestHandler({method: 'get', url: `/task_rejection_reason_groups?pagination=false`}, {name: 'cancellationReasons/fetchReasonsGroups'}, dispatch);
        commit('SAVE_REASONS_GROUPS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createReasonsGroup({ commit, dispatch }, communication) {
      try {
        commit('SET_STATUS', 'creating');
        let { data } = await requestHandler({method: 'post', url: `/task_rejection_reason_groups`, data: communication}, {name: 'cancellationReasons/createReasonsGroup', params: communication}, dispatch);
        commit('SAVE_REASONS_GROUP', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editReasonsGroup({ commit, dispatch }, communication) {
      try {
        commit('SET_STATUS', 'editing');
        let { data } = await requestHandler({method: 'put', url: `/task_rejection_reason_groups/${communication.id}`, data: communication}, {name: 'cancellationReasons/editReasonsGroup', params: communication}, dispatch);
        commit('SAVE_REASONS_GROUP', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteReasonsGroup({ commit, dispatch }, communicationId) {
      try {
        commit('SET_STATUS', 'deleting');
        await requestHandler({method: 'delete', url: `/task_rejection_reason_groups/${communicationId}`}, {name: 'cancellationReasons/deleteReasonsGroup', params: communicationId}, dispatch);
        commit('REMOVE_REASONS_GROUP', communicationId);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}
