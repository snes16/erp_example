import {updateList, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    deleteStatus: '',
    paymentInfoTemplates: [],
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_DELETE_STATUS(state, status) {
      state.deleteStatus = status;
    },
    SAVE_PAYMENT_TEMPLATES(state, templates) {
      state.paymentInfoTemplates = templates;
    },
    SAVE_PAYMENT_TEMPLATE(state, template) {
      state.paymentInfoTemplates = updateList(state.paymentInfoTemplates, template);
    },
    DELETE_PAYMENT_TEMPLATE(state, id) {
      state.paymentInfoTemplates = updateList(state.paymentInfoTemplates, id, 'remove');
    },
  },
  actions: {
    async createPaymentTemplate ({commit, dispatch}, template) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/payment_templates`,
          data: template,
        }, {name: 'paymentInfoTemplates/createPaymentTemplate', params: template}, dispatch);
        commit('SAVE_PAYMENT_TEMPLATE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPaymentTemplates({commit, dispatch}, id) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/payment_templates?pagination=false`
        }, {name: 'paymentInfoTemplates/fetchPaymentTemplates'}, dispatch);
        commit('SAVE_PAYMENT_TEMPLATES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editPaymentTemplate({commit, dispatch}, template) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/payment_templates/${template.id}`,
          data: template,
        }, {name: 'paymentInfoTemplates/editPaymentTemplate', params: template}, dispatch);
        commit('SAVE_PAYMENT_TEMPLATE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteTemplate({ commit, dispatch }, id) {
      commit('SET_DELETE_STATUS', 'deleting');
      try {
        await requestHandler({ method: 'delete', url: `/payment_templates/${id}` }, {
          name: 'paymentInfoTemplates/deleteTemplate',
        }, dispatch);
        commit('DELETE_PAYMENT_TEMPLATE', id);
        commit('SET_DELETE_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            commit('SET_DELETE_STATUS', 'deleting-error');
            if (error?.response?.status === 400) commit('SET_ERROR_MESSAGE', error.response.data?.detail);
          },
        });
      }
    },
  }
}