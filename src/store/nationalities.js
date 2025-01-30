import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    errorMessage: '',
    nationalities: [],
    pagination: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
    SAVE_NATIONALITIES(state, nationalities) {
      state.nationalities = nationalities;
    },
    SAVE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
  },
  actions: {
    async fetchNationalities({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/nationalities`,
          params: {params: query}
        }, {name: 'nationalities/fetchNationalities', params: query}, dispatch);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SAVE_NATIONALITIES', data.items);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async createNationality({commit, dispatch}, communication) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/nationalities`,
          data: communication
        }, {name: 'nationalities/createNationality', params: communication}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deleteNationality({commit, dispatch}, nationalityId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/nationalities/${nationalityId}`
        }, {name: 'nationalities/deleteNationality', params: nationalityId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async editNationality({commit, dispatch}, nationality) {
      commit('SET_STATUS', 'editing');
      try {
        await requestHandler({
          method: 'put',
          url: `/nationalities/${nationality.id}`,
          data: {title: nationality.title},
        }, {name: 'nationalities/editNationality', params: nationality}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
  }
}