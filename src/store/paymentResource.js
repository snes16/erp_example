import {updateList, formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    paymentResources: [],
    paymentResourcesPagination: {},
    errorMessage: null,
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_PAYMENT_RESOURCES(state, paymentResources) {
      state.paymentResources = paymentResources;
    },
    SAVE_PAGINATION(state, pagination) {
      state.paymentResourcesPagination = pagination;
    },
    SAVE_PAYMENT_RESOURCE(state, communication) {
      //TBD in PWA
    },
    UPDATE_PAYMENT_RESOURCE(state, paymentResource){
      state.paymentResources = updateList(state.paymentResources, paymentResource);
    },
    SAVE_ERROR(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {
    async fetchPaymentResources({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/payment_resources?deleted=false`,
          params: {params: query}
        }, {name: 'paymentResource/fetchPaymentResources', params: query}, dispatch);
        commit('SAVE_PAYMENT_RESOURCES', data.items)
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async createPaymentResource({commit, dispatch}, paymentResource) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/payment_resources`,
          data: paymentResource
        }, {name: 'paymentResources/createPaymentResource', params: paymentResource}, dispatch);
        commit('SAVE_PAYMENT_RESOURCE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async editPaymentResource({commit, dispatch}, paymentResource) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/payment_resources/${paymentResource.id}`,
          data: paymentResource
        }, {name: 'paymentResources/editPaymentResource', params: paymentResource}, dispatch);
        commit('UPDATE_PAYMENT_RESOURCE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async deletePaymentResource({commit, dispatch}, paymentResourceId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/payment_resources/${paymentResourceId}`
        }, {name: 'paymentResources/deletePaymentResource', params: paymentResourceId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
  },
};