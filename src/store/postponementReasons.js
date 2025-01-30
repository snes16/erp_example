import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    errorMessage: '',
    postponementReasons: [],
    pagination: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
    SAVE_POSTPONEMENT_REASONS(state, reasons) {
      state.postponementReasons = reasons;
    },
    SAVE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
  },
  actions: {
    async fetchPostponementReasons({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/postponements`,
          params: {params: query}
        }, {name: 'postponementReasons/fetchPostponementReasons', params: query}, dispatch);
        commit('SAVE_POSTPONEMENT_REASONS', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async createPostponementReason({commit, dispatch}, reason) {
      commit('SET_STATUS', 'creating');
      try {
        await requestHandler({
          method: 'post',
          url: `/postponements`,
          data: reason
        }, {name: 'postponementReasons/createPostponementReason', params: reason}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deletePostponementReason({commit, dispatch}, reasonId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/postponements/${reasonId}`
        }, {name: 'postponementReasons/deletePostponementReason', params: reasonId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async editPostponementReason({commit, dispatch}, reason) {
      commit('SET_STATUS', 'editing');
      try {
        await requestHandler({
          method: 'put',
          url: `/postponements/${reason.id}`,
          data: {title: reason.title},
        }, {name: 'postponementReasons/editPostponementReason', params: reason}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
  }
}