import {updateList, requestHandler, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    groupParametersStatus: '',
    groupParameters: [],
    groupParameter: {},
    parameter: {}
  },
  getters: {
    groupParameterFiltred: state => {
      let groupParametersCopy = [...state.groupParameters],
          groupParametersCopyfiltred = groupParametersCopy.map(function (groupParameter) {
            let groupParameterFiltred = groupParameter.parameters.map(function (parameter) {
              if (parameter.type === 'choice' && parameter.answers.length) {
                let parameterAnswers = parameter.answers,
                    parameterAnswersFiltred = parameterAnswers.map(function (answer) {
                      let answerType = typeof answer
                      if (answerType === 'string') {
                        return {answer: answer}
                      } else if (answerType === 'object') {
                        return answer
                      }
                    })
                parameter.answers = parameterAnswersFiltred
              }
              return parameter
            })
            groupParameter.parameters = groupParameterFiltred
            return groupParameter
          })
      return groupParametersCopyfiltred
    }
  },
  mutations: {
    SET_STATUS(state, status) {
      state.groupParametersStatus = status
    },
    SAVE_GROUP_PARAMETERS(state, groupParameters) {
      state.groupParameters = groupParameters
    },
    EDIT_GROUP_PARAMETERS(state, groupParameter) {
      state.groupParameters = updateList(state.groupParameters, groupParameter);
    },
    SAVE_NEW_GROUP_PARAMETERS(state, newGroupParameter) {
      state.groupParameter = newGroupParameter
    },
    DELETE_GROUP_PARAMETER(state, groupParameterId) {
      state.groupParameters = updateList(state.groupParameters, groupParameterId, 'remove');
      /*let groupParametersCopyList = [...state.groupParameters],
                deletedGroupParameterIndex = groupParametersCopyList.findIndex((deletedGroupParameter) => {
                  return deletedGroupParameter.id === groupParameter.id
                });
            if (deletedGroupParameterIndex === -1) return;
            groupParametersCopyList.splice(deletedGroupParameterIndex, 1);
            state.groupParameters = groupParametersCopyList;*/
    },
    SAVE_NEW_PARAMETERS(state, parameter) {
      state.parameter = parameter
    },
    EDIT_PARAMETERS(state, parameter) {
      let groupParametersCopyList = [...state.groupParameters]
      let groupParameterIndex = groupParametersCopyList.findIndex((oldGroupParameter) => {
        return oldGroupParameter.id === parameter.group
      })
      let newGroupParameter = {...state.groupParameters[groupParameterIndex]},
          parameterIndex = newGroupParameter.parameters.findIndex((oldParameter) => {
            return oldParameter.id === parameter.id
          });
      if (parameterIndex !== -1) newGroupParameter.parameters[parameterIndex] = parameter;
      else newGroupParameter.parameters.push(parameter);
      state.groupParameter = newGroupParameter;
      let oldGroupParametersIndex = groupParametersCopyList.findIndex((oldGroupParameter) => {
        return oldGroupParameter.id === newGroupParameter.id
      });
      if (oldGroupParametersIndex !== -1) groupParametersCopyList[oldGroupParametersIndex] = newGroupParameter;
      else groupParametersCopyList.push(newGroupParameter);
      state.groupParameters = groupParametersCopyList;
    },
    DELETE_PARAMETERS(state, parameter) {
      let groupParametersCopyList = [...state.groupParameters],
          groupParameterIndex = groupParametersCopyList.findIndex((oldGroupParameter) => oldGroupParameter.id === parameter.group),
          newGroupParameter = {...state.groupParameters[groupParameterIndex]},
          deletedParameterIndex = newGroupParameter.parameters.findIndex((deletedParameter) => {
            return deletedParameter.id === parameter.id
          });
      if (deletedParameterIndex === -1) return;
      newGroupParameter.parameters.splice(deletedParameterIndex, 1);
      state.groupParameter = newGroupParameter;
      let oldGroupParametersIndex = groupParametersCopyList.findIndex((oldGroupParameter) => {
        return oldGroupParameter.id === newGroupParameter.id
      });
      if (oldGroupParametersIndex !== -1) groupParametersCopyList[oldGroupParametersIndex] = newGroupParameter;
      else groupParametersCopyList.push(newGroupParameter);
      state.groupParameters = groupParametersCopyList;
    },
    //Не используется
    ADD_ACTIVE_GROUP_PARAMETER(state, groupParameter) {
      state.groupParameter = groupParameter
    }
  },
  actions: {
    changeGroupParameter({commit}, parameter) {
      commit('SAVE_NEW_GROUP_PARAMETERS', parameter)
    },
    changeGroupParameterStatus({commit}) {
      commit('SET_STATUS', 'group-parameters-passed')
    },
    async fetchGroupParameters({ commit, dispatch }) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/group_template_parameters?pagination=false`}, {name: 'groupparameters/fetchGroupParameters'}, dispatch);
        commit('SAVE_GROUP_PARAMETERS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createGroupParameters({ commit, dispatch }, groupParameter) {
      commit('SET_STATUS', 'creating');
      try {
        let { data } = await requestHandler({method: 'post', url: `/group_template_parameters`, data: groupParameter}, {name: 'groupparameters/createGroupParameters', params: groupParameter}, dispatch);
        commit('SAVE_NEW_GROUP_PARAMETERS', data);
        commit('EDIT_GROUP_PARAMETERS', data);
        commit('SET_STATUS', 'group-parameters-created');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async changeGroupParameters({ commit, dispatch }, groupParameter) {
      commit('SET_STATUS', 'editing');
      try {
        let { data } = await requestHandler({method: 'put', url: `/group_template_parameters/${groupParameter.id}`, data: {title: groupParameter.title, parameters: groupParameter.parameters, roles: groupParameter.roles}}, {name: 'groupparameters/changeGroupParameters', params: groupParameter}, dispatch);
        commit('SAVE_NEW_GROUP_PARAMETERS', data);
        commit('EDIT_GROUP_PARAMETERS', data);
        commit('SET_STATUS', 'group-parameters-changed');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteGroupParameter({ commit, dispatch }, groupParameter) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/group_template_parameters/${groupParameter.id}`}, {name: 'groupparameters/deleteGroupParameter', params: groupParameter}, dispatch);
        commit('DELETE_GROUP_PARAMETER', groupParameter.id);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
};