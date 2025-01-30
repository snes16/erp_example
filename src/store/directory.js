import {updateList, requestHandler, formatPaginationData, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    resources: [],
    hrResources: [],
    newResource: [],
    directoryStatus: '',
    error: {},
    webcamResources: [],
    credential: {},
    resourcesPagination: {},
    taskTypes: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.directoryStatus = status;
    },
    SET_ERROR_DATA(state, error) {
      state.error = error;
    },
    SAVE_RESOURCES(state, resources) {
      state.resources = resources;
    },
    SAVE_HR_RESOURCES(state, hrResources) {
      state.hrResources = hrResources;
    },
    ADD_RESOURCES(state, resource) {
      state.resources = updateList(state.resources, resource);
    },
    EDIT_RESOURCES(state, resource) {
      state.resources = updateList(state.resources, resource);
    },
    NEW_RESOURCE(state, resource) {
      state.newResource = resource;
    },
    REMOVE_RESOURCE(state, resourceId) {
      state.resources = updateList(state.resources, resourceId, 'remove');
    },
    SAVE_WEBCAM_RESOURCES(state, resources) {
      state.webcamResources = resources;
    },
    SAVE_CREDENTIAL(state, credential) {
      state.credential = credential;
    },
    SAVE_PAGINATION(state, pagination) {
      state.resourcesPagination = pagination;
    },
    SAVE_TASK_TYPES(state, types) {
      state.taskTypes = types;
    },
  },
  actions: {
    async getResources({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/resources`,
          params: {params: query}
        }, {name: 'directory/getResources', params: query}, dispatch);
        commit('SAVE_RESOURCES', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getHrResources({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/resources`,
          params: {params: {type: 'hr', pagination: false}}
        }, {name: 'directory/getHrResources'}, dispatch);
        commit('SAVE_HR_RESOURCES', data)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getWebcamResources({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/resources`,
          params: {params: {type: 'webcam', pagination: false}}
        }, {name: 'directory/getWebcamResources'}, dispatch);
        commit('SAVE_WEBCAM_RESOURCES', data)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async saveCredential({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/resource_credentials`,
          data: {
            resource: requestData.resourceId,
            login: requestData.login,
            user: requestData.modelId,
            password: requestData.password
          }
        }, {name: 'directory/saveCredential', params: requestData}, dispatch);
        commit('SAVE_CREDENTIAL', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async changeCredential({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/resource_credentials/${data.credentialId}`,
          data: {login: requestData.login, password: requestData.password}
        }, {name: 'directory/changeCredential', params: requestData}, dispatch);
        commit('SAVE_CREDENTIAL', data)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async addResource({commit, dispatch}, resource) {
      commit('SET_STATUS', 'creating');
      commit('SET_ERROR_DATA', '');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/resources`,
          data: resource.creds,
        }, {name: 'directory/addResource', params: resource}, dispatch);
        commit('ADD_RESOURCES', data);
        commit('NEW_RESOURCE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessage: error?.response?.data, errorMessageMutation: 'SET_ERROR_DATA'});
      }
    },
    async changeResource({commit, dispatch}, resource) {
      commit('SET_STATUS', 'edit');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/resources/${resource.creds.id}`,
          data: resource.creds,
        }, {name: 'directory/changeResource', params: resource}, dispatch);
        commit('EDIT_RESOURCES', data)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessage: error?.response?.data, errorMessageMutation: 'SET_ERROR_DATA'});
      }
    },
    async deleteResource({commit, dispatch}, resource) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({
          method: 'delete',
          url: `/resources/${resource.creds.resource.id}`
        }, {name: 'directory/deleteResource', params: resource}, dispatch);
        commit('REMOVE_RESOURCE', resource.creds.resource.id)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessage: error?.response?.data, errorMessageMutation: 'SET_ERROR_DATA'});
      }
    },
    async fetchTaskTypes({commit, dispatch}) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/task_types?pagination=false`
        }, {name: 'directory/fetchTaskTypes'}, dispatch);
        commit('SAVE_TASK_TYPES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  },
};
