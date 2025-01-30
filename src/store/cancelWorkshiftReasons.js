import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    errorMessage: '',
    reasons: [],
    reasonsPagination: {}
  },

  mutations: {
    SET_STATUS(state, status) {
      state.status = status
    },
    SAVE_REASONS(state, reasons) {
      state.reasons = reasons
    },
    SAVE_PAGINATION(state, pagination) {
      state.reasonsPagination = pagination
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {
    async fetchReasons({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/directory_cancel_workshifts`,
          params: {params: query}
        }, {name: 'cancelWorkshiftReason/fetchReasons', params: query}, dispatch);
        commit('SAVE_REASONS', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async createReason({commit, dispatch}, reason) {
      commit('SET_STATUS', 'creating');
      try {
        await requestHandler({
          method: 'post',
          url: `/directory_cancel_workshifts`,
          data: reason
        }, {name: 'cancelWorkshiftReason/createReason', params: reason}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async removeReason({commit, dispatch}, reasonId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/directory_cancel_workshifts/${reasonId}`
        }, {name: 'cancelWorkshiftReason/removeReason', params: reasonId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async editReason({commit, dispatch}, reason) {
      commit('SET_STATUS', 'editing');
      try {
        await requestHandler({
          method: 'put',
          url: `/directory_cancel_workshifts/${reason.id}`,
          data: {title: reason.title},
        }, {name: 'cancelWorkshiftReason/editReason', params: reason}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
  },
};
