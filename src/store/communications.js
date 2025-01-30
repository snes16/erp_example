import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    communications: [],
    pagination: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_COMMUNICATIONS(state, communications) {
      state.communications = communications;
    },
    SAVE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
    SAVE_COMMUNICATION(state, communication) {
      //TBD in PWA
    },
    REMOVE_COMMUNICATION(state, communicationId) {
      //TBD in PWA
    },
  },
  actions: {
    async fetchCommunications({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/communications`,
          params: {params: query}
        }, {name: 'communications/fetchCommunications', params: query}, dispatch);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SAVE_COMMUNICATIONS', data.items);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createCommunication({commit, dispatch}, communication) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/communications`,
          data: communication
        }, {name: 'communications/createCommunication', params: communication}, dispatch);
        commit('SAVE_COMMUNICATION', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editCommunication({commit, dispatch}, communication) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/communications/${communication.id}`,
          data: communication
        }, {name: 'communications/editCommunication', params: communication}, dispatch);
        commit('SAVE_COMMUNICATION', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteCommunications({commit, dispatch}, communicationId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/communications/${communicationId}`
        }, {name: 'communications/deleteCommunications', params: communicationId}, dispatch);
        commit('REMOVE_COMMUNICATION', communicationId);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}