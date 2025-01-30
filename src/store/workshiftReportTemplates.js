import {requestHandler, responseErrorHandler, updateList} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    workshiftReportTemplates: [],
  },
  getters: {
    getTemplateById: state => id => state.workshiftReportTemplates.find(template => template.id === id) || {}
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_WORKSHIFT_REPORT_TEMPLATES(state, templates) {
      state.workshiftReportTemplates = templates;
    },
    SAVE_WORKSHIFT_REPORT_TEMPLATE(state, template) {
      state.workshiftReportTemplates = updateList(state.workshiftReportTemplates, template);
    },
  },
  actions: {
    async fetchWorkshiftReportTemplates({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/template_group_work_shift_reports?pagination=false`
        }, {name: 'workshiftReportTemplates/fetchWorkshiftReportTemplates'}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT_TEMPLATES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchWorkshiftReportTemplate({commit, dispatch}, id) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/template_group_work_shift_reports/${id}`
        }, {name: 'workshiftReportTemplates/fetchWorkshiftReportTemplate', params: id}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT_TEMPLATE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editWorkshiftReportTemplate({commit, dispatch}, template) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/template_group_work_shift_reports/${template.id}`,
          data: template,
        }, {name: 'workshiftReportTemplates/editWorkshiftReportTemplate', params: template}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT_TEMPLATE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}
