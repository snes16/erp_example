import {requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    isSuccess: false,
    isFailure: false,
    statusChangePass: '',
    message: '',
    errorCode: null,
  },
  mutations: {
    SUCCESS(state, payload) {
      state.isSuccess = true;
      state.isFailure = false;
      state.message = payload;
      state.statusChangePass = 'password-is-changed'
    },
    FAILURE(state, payload) {
      state.isFailure = true;
      state.isSuccess = false;
      state.message = payload;
      state.statusChangePass = 'password-not-changed';
    },
    SET_STATUS(state, status) {
      state.statusChangePass = status;
    },
    RESET_ERROR(state) {
      state.isFailure = false;
    },
    SAVE_ERROR_CODE(state, errorCode) {
      state.errorCode = errorCode;
    },
  },
  actions: {
    async changePassword({ commit, dispatch }, payload) {
      commit('SET_STATUS', '');
      try {
        await requestHandler({method: 'post', url: `/forgot_password`, data: { email: payload.creds.mail }}, {name: 'changepass/changePassword', params: payload}, dispatch);
        commit('SUCCESS');
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            commit('FAILURE');
            commit('SAVE_ERROR_CODE', error.response.status);
          },
        });
      }
    },
    resetErrorFailure({commit}) {
      commit('RESET_ERROR');
    },
  }
};
