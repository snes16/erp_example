import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    errorMessage: '',
    resignReasons: [],
    pagination: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_RESIGN_REASONS(state, reasons) {
      state.resignReasons = reasons;
    },
    SAVE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {
    async fetchResignReasons({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/resigns`,
          params: {params: query}
        }, {name: 'resignReasons/fetchResignReasons', params: query}, dispatch);
        commit('SAVE_RESIGN_REASONS', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createResignReason({commit, dispatch}, reason) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/resigns`,
          data: reason
        }, {name: 'resignReasons/createResignReason', params: reason}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteResignReason({commit, dispatch}, reasonId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/resigns/${reasonId}`}, {
          name: 'resignReasons/removeResignReason',
          params: reasonId
        }, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editResignReason({commit, dispatch}, reason) {
      commit('SET_STATUS', 'editing');
      try {
        await requestHandler({
          method: 'put',
          url: `/resigns/${reason.id}`,
          data: {title: reason.title},
        }, {name: 'resignReasons/editResignReason', params: reason}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}