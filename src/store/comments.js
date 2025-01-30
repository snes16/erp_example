import {updateList, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    commentStatus: '',
    comments: '',
    comment: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.commentStatus = status;
    },
    SAVE_COMMENTS(state, comments) {
      state.comments = comments;
    },
    SAVE_COMMENT(state, comment) {
      state.comment = comment;
    },
    EDIT_COMMENTS(state, comment) {
      state.comments = updateList(state.comments, comment);
    },
  },
  actions: {
    async fetchComments({ commit, dispatch }, response) {
      try {
        let { data } = await requestHandler({method: 'get', url: `/vacancy_responses/${response.id}/comments`}, {name: 'comments/fetchComments', params: response}, dispatch);
        commit('SAVE_COMMENTS', data);
        commit('SET_STATUS', 'comments-fetched');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createComment({ commit, dispatch }, requestData) {
      commit('SET_STATUS', 'creating');
      try {
        let { data } = await requestHandler({method: 'post', url: `/vacancy_responses/${requestData.id}/comments`, data: {text: requestData.text}}, {name: 'comments/createComment', params: requestData}, dispatch);
        commit('SAVE_COMMENT', data);
        commit('responses/SAVE_COMMENT', {comment: data, id: requestData.id}, { root: true });
        commit('EDIT_COMMENTS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createTaskComment({ commit, dispatch }, requestData) {
      commit('SET_STATUS', 'creating');
      try {
        let { data } = await requestHandler({method: 'post', url: `/tasks/${requestData.id}/comments`, data: {text: requestData.comment, type: requestData.type, attachments: requestData.attachments}}, {name: 'comments/createTaskComment', params: requestData}, dispatch);
        commit('SAVE_COMMENT', data);
        commit('EDIT_COMMENTS', data);
        commit('SET_STATUS', 'comment-created');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createWorkshiftkshiftComment({ commit, dispatch }, commentInfo) {
      commit('SET_STATUS', 'commenting');
      try {
        let { data } = await requestHandler({method: 'post', url: `/workshifts/${commentInfo.id}/comments`, data: {text: commentInfo.text}}, {name: 'comments/createWorkshiftkshiftComment', params: commentInfo}, dispatch);
        commit('SAVE_COMMENT', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
};