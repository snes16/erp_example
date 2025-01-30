import {requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    file: {},
    fileStatus: '',
    tag: '',
    errorMessage: '',
  },
  mutations: {
    SET_STATUS(state, status) {
      state.fileStatus = status;
    },
    SET_TAG(state, tag) {
      state.tag = tag;
    },
    SAVE_FILE(state, file) {
      state.file = file;
    },
    SET_ERROR_MESSAGE(state, message) {
      state.errorMessage = message;
    }
  },
  actions: {
    async createFile({ commit, dispatch }, {file, tag, context}) {
      commit('SET_STATUS', 'request');
      let formData = new FormData();
      formData.append('file', file);
      if(context) formData.append('context', context);
      try {
        let { data } = await requestHandler({method: 'post', url: `/files`, data: formData, params: {headers: {'Content-Type': 'multipart/form-data'}}}, {name: 'files/createFile', params: {file, tag, context}}, dispatch);
        if(tag) commit('SET_TAG', tag);
        commit('SAVE_FILE', data);
        commit('SET_STATUS', 'file-added');
      } catch (error) {
        if (tag) commit('SET_TAG', tag);
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async addFileToUser({ commit, dispatch }, {file, userId}) {
      commit('SET_STATUS', 'request');
      try {
        await requestHandler({method: 'post', url: `/files/upload/${userId}`, data: file}, {name: 'files/addFileToUser', params: {file, userId}}, dispatch);
        commit('SET_STATUS', 'file-connected');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async removeFile({ commit, dispatch }, id) {
      commit('SET_STATUS', 'removing');
      try {
        await requestHandler({method: 'delete', url: `/files/${id}`}, {name: 'files/removeFile', params: id}, dispatch);
        commit('SET_STATUS', 'file-removed');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'file-not-removed'});
      }
    },
  },
};