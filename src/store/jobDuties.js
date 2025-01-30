import {formatPaginationData, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    errorMessage: '',
    jobDuties: [],
    pagination: {},
    newJobDuty: {}
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
    SAVE_JOB_DUTIES(state, jobDuties) {
      state.jobDuties = jobDuties;
    },
    SAVE_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
    SAVE_NEW_JOB_DUTY(state, jobDuty) {
      state.newJobDuty = jobDuty;
    },
  },
  actions: {
    async fetchJobDuties({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/job_duties`,
          params: {params: query}
        }, {name: 'jobDuties/fetchJobDuties', params: query}, dispatch);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SAVE_JOB_DUTIES', data.items);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async createJobDuties({commit, dispatch}, jobDuty) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/job_duties`,
          data: jobDuty
        }, {name: 'jobDuties/createJobDuties', params: jobDuty}, dispatch);
        commit('SAVE_NEW_JOB_DUTY', data)
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async editJobDuties({commit, dispatch}, query) {
      commit('SET_STATUS', 'editing');
      try {
        await requestHandler({
          method: 'put',
          url: `/job_duties/${query.id}`,
          data: query.jobDuty
        }, {name: 'jobDuties/editJobDuties', params: query}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deleteJobDuties({commit, dispatch}, jobDutiesId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/job_duties/${jobDutiesId}`}, {
          name: 'jobDuties/deleteJobDuties',
          params: jobDutiesId
        }, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async setConfirmJobDuties({commit, dispatch}) {
      commit('SET_STATUS', 'editing-confirm');
      try {
        await requestHandler({
          method: 'post',
          url: `/job_duties/accept`
        }, {name: 'jobDuties/setConfirmJobDuties'}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    }
  }
}