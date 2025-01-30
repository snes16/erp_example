import {updateList, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    dossierTemplate: [],
    dossier: [],
    link: '',
    dossierLink: '',
    privateLink: '',
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_DOSSIER_TEMPLATE(state, dossierTemplate) {
      state.dossierTemplate = dossierTemplate;
    },
    SAVE_DOSSIER(state, dossier) {
      state.dossier = dossier;
    },
    EDIT_DOSSIER(state, dossier) {
      state.dossierTemplate = updateList(state.dossierTemplate, dossier);
    },
    DELETE_DOSSIER(state, dossierId) {
      state.dossierTemplate = updateList(state.dossierTemplate, dossierId, 'remove');
    },
    SAVE_DOSSIER_LINK(state, link) {
      state.dossierLink = `${window.location.hostname}/dossier.html?link=${link}`;
      state.privateLink = `dossier.html?link=${link}`;
      state.link = link;
    },
    DELETE_DOSSIER_LINK(state) {
      state.dossierLink = '';
    },
  },
  actions: {
    async fetchDossierTemplate({ commit, dispatch }) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/dossier_templates`, params: {params: {pagination: false}}}, {name: 'dossier/fetchDossierTemplate'}, dispatch);
        commit('SET_STATUS', 'dossier_template-added');
        commit('SAVE_DOSSIER_TEMPLATE', data);
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'dossier_template-not-loaded'});
      }
    },
    async fetchDossierLink({ commit, dispatch }, query) {
      commit('DELETE_DOSSIER_LINK');
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/generate_link/response/${query.id}`}, {name: 'dossier/fetchDossierLink', params: query}, dispatch);
        commit('SET_STATUS', 'dossier-link-added');
        commit('SAVE_DOSSIER_LINK', data.link);
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'dossier-link-not-loaded'});
      }
    },
    async fetchDossier({ commit, dispatch }, link) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/vacancy_responses/worksheet/${link}`}, {name: 'dossier/fetchDossier', params: link}, dispatch);
        commit('SET_STATUS', 'dossier-saved');
        commit('SAVE_DOSSIER', data);
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'dossier-not-saved'});
      }
    },
    async addModelDossier({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        await requestHandler({method: 'post', url: `/vacancy_responses/worksheet/${query.link}`, data: query.dossier}, {name: 'dossier/addModelDossier', params: query}, dispatch);
        commit('SET_STATUS', 'dossier-added');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'dossier-not-saved'});
      }
    },
    async editDossier({ commit, dispatch }, requestData) {
      commit('SET_STATUS', 'editing');
      try {
        await requestHandler({method: 'put', url: `/dossiers/${requestData.id}`, data: {parameters: requestData.parameters}}, {name: 'dossier/editDossier', params: requestData}, dispatch);
        commit('SET_STATUS', 'dossier-saved');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'dossier-not-loaded'});
      }
    },
    async changeDossierTitle({ commit, dispatch }, dossier) {
      commit('SET_STATUS', 'editing');
      try {
        let { data } = await requestHandler({method: 'put', url: `/dossier_templates/${dossier.id}`, data: {title: dossier.title}}, {name: 'dossier/changeDossierTitle', params: dossier}, dispatch);
        commit('EDIT_DOSSIER', data);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteDossier({ commit, dispatch }, dossier) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/dossier_templates/${dossier.id}`}, {name: 'dossier/deleteDossier', params: dossier}, dispatch);
        commit('DELETE_DOSSIER', dossier.id);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async addDossier({ commit, dispatch }) {
      commit('SET_STATUS', 'creating');
      try {
        let { data } = await requestHandler({method: 'post', url: `/dossier_templates`, data: {title: ''}}, {name: 'dossier/addDossier'}, dispatch);
        commit('EDIT_DOSSIER', data);
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'dossier-not-loaded'});
      }
    },
  },
};
