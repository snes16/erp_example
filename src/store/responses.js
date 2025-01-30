import {updateList, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    responseStatus: '',
    response: {},
    responses: [],
    fieldsErrors: [],
    comments: [],
    comment: {},
    currentResponse: {},
    errorCode: {},
    responseTypes: {
      new: 'Новая заявка',
      call_center: 'Call-центр',
      interview: 'Собеседование',
      reject: 'Отказ',
      processed: 'Обработана',
      archive: 'Архив'
    },
    duplicateResponse: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.responseStatus = status
    },
    SAVE_RESPONSES(state, responses) {
      state.responses = responses
    },
    SAVE_RESPONSE(state, response) {
      state.responses = updateList(state.responses, response);
    },
    SAVE_NEW_RESPONSE(state, response) {
      state.response = response
    },
    SAVE_FIELDS_ERRORS(state, errors) {
      state.fieldsErrors = [...errors]
    },
    SAVE_CURRENT_RESPONSE(state, response) {
      state.currentResponse = response
    },
    SAVE_ERROR_CODE(state, errorCode) {
      state.errorCode = errorCode
    },
    SAVE_COMMENT(state, data) {
      // WAITING FOR NEW FORMAT
      // if (state.currentResponse.id !== data.id) return;
      // state.currentResponse = {...state.currentResponse, comments: [...state.currentResponse.comments, data.comment]};
    },
    SAVE_DUPLICATE_RESPONSE(state, model) {
      state.duplicateResponse = model
    },
    CLEAR_DUPLICATE_RESPONSE(state) {
      state.duplicateResponse = {};
    },
  },
  actions: {
    async fetchResponses({ commit, dispatch }, id) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/vacancy_responses`, params: {params: {vacancy: id, pagination: false}}}, {name: 'responses/fetchResponses', params: id}, dispatch);
        commit('SAVE_RESPONSES', data)
        commit('SET_STATUS', 'responses-fetched')
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createResponse({ commit, dispatch }, response) {
      commit('SET_STATUS', 'creating');
      try {
        let { data } = await requestHandler({method: 'post', url: `/vacancy_responses`, data: response}, {name: 'responses/createResponse', params: response}, dispatch);
        commit('SAVE_RESPONSE', data)
        commit('SAVE_NEW_RESPONSE', data)
        commit('SET_STATUS', 'response-fetched')
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (error?.response?.data) {
              if (!error.response.data.violations && error.response.data.detail && JSON.parse(error.response.data.detail).responses) {
                commit('SET_STATUS', '');
                commit('SAVE_DUPLICATE_RESPONSE', JSON.parse(error.response.data.detail));
              }
              else {
                commit('SET_STATUS', 'error');
                commit('SAVE_FIELDS_ERRORS', error.response.data.violations);
              }
            }
          },
        });
      }
    },
    async createDuplicateResponse({ commit, dispatch }, query) {
      commit('SET_STATUS', 'creating-duplicate');
      try {
        let { data } = await requestHandler({method: 'post', url: `/vacancy_responses`, data: query.response, params: {params: query.params}}, {name: 'responses/createDuplicateResponse', params: query}, dispatch);
        commit('SAVE_RESPONSE', data)
        commit('SAVE_NEW_RESPONSE', data)
        commit('SET_STATUS', '')
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_FIELDS_ERRORS',
        });
      }
    },
    async editResponse({ commit, dispatch }, response) {
      commit('SET_STATUS', 'editing');
      let id = response.id;
      delete response.id;
      try {
        let { data } = await requestHandler({method: 'put', url: `/vacancy_responses/${id}`, data: response}, {name: 'responses/editResponse', params: response}, dispatch);
        commit('SAVE_RESPONSE', data)
        commit('SAVE_CURRENT_RESPONSE', data)
        commit('SAVE_NEW_RESPONSE', data)
        commit('SET_STATUS', 'response-fetched')
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && error.response.data.violations,
          errorMessageMutation: 'SAVE_FIELDS_ERRORS',
        });
      }
    },
    async editResponseReject({ commit, dispatch }, response) {
      commit('SET_STATUS', 'editing');
      try {
        let { data } = await requestHandler({method: 'put', url: `/vacancy_responses/${response.id}`, data: {status: response.status}}, {name: 'responses/editResponseReject', params: response}, dispatch);
        commit('SAVE_RESPONSE', data)
        commit('SAVE_NEW_RESPONSE', data)
        commit('SET_STATUS', 'response-fetched')
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && e.response.data.violations,
          errorMessageMutation: 'SAVE_FIELDS_ERRORS',
        });
      }
    },
    async editResponseVideoFile({ commit, dispatch }, response) {
      commit('SET_STATUS', 'editing');
      try {
        let { data } = await requestHandler({method: 'put', url: `/vacancy_responses/${response.id}`, data: {video_file: response.video_file}}, {name: 'responses/editResponseVideoFile', params: response}, dispatch);
        commit('SAVE_RESPONSE', data)
        commit('SAVE_NEW_RESPONSE', data)
        commit('SET_STATUS', 'response-fetched')
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && e.response.data.violations,
          errorMessageMutation: 'SAVE_FIELDS_ERRORS',
        });
      }
    },
    async deleteResponse({commit, dispatch}, response) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/vacancy_responses/${response.id}`}, {name: 'responses/deleteResponse', params: response}, dispatch);
        commit('SET_STATUS', 'response-deleted')
        if (response.vacancy) dispatch('hr/getCurrentVacancy', response.vacancy, {root: true});
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessage: error?.response?.data?.violations?.length && e.response.data.violations,
          errorMessageMutation: 'SAVE_FIELDS_ERRORS',
        });
      }
    },
    async fetchCurrentResponse({ commit, dispatch }, requestData) {
      commit('SET_STATUS', 'fetching')
      try {
        let { data } = await requestHandler({method: 'get', url: `/vacancy_responses/${requestData}`}, {name: 'responses/fetchCurrentResponse', params: requestData}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_CURRENT_RESPONSE', data);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createTaskDuplicateResponse({ commit, dispatch }, requestData) {
      commit('SET_STATUS', 'creating-task')
      try {
        let { data } = await requestHandler({method: 'get', url: `/vacancy_responses/${requestData}`}, {name: 'responses/fetchCurrentResponse', params: requestData}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    clearDuplicateResponse({commit}) {
      commit('CLEAR_DUPLICATE_RESPONSE');
    },
  }
};