import {formatPaginationData, requestHandler, responseErrorHandler, updateObject} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    users: {},
    currentUsers: [],
    currentUsersHeaders: [],
    fieldsErrors: [],
    errorMessage: '',
    newUser: {},
    updatedUser: {},
    usersList: [],
    usersListWithPagination: [],
    operators: [],
    duplicateModel: {},
    headers: {},
    telegramLink: null,
  },
  getters: {
    getUserById: state => id => {
      return state.users[id] || {};
    }
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_USERS(state, users) {
      state.usersList = users
    },
    SAVE_USERS_WITH_PAGINATION(state, users) {
      state.usersListWithPagination = users
    },
    SAVE_USERS_NEXT_PAGE(state, users) {
      state.usersListWithPagination = [...state.usersListWithPagination, ...users];
    },
    SAVE_USERS_HEADERS(state, headers) {
      state.headers = headers
    },
    SAVE_USER(state, user) {
      state.users = updateObject(state.users, user);
    },
    SAVE_NEW_USER(state, user) {
      state.newUser = user;
    },
    SAVE_UPDATED_USER(state, user) {
      state.updatedUser = user;
    },
    CLEAR_CURRENT_USERS(state) {
      state.currentUsers = [];
    },
    SAVE_CURRENT_USERS(state, users) {
      state.currentUsers = [...state.currentUsers, ...users];
    },
    SAVE_CURRENT_USERS_HEADERS(state, headers) {
      state.currentUsersHeaders = headers;
    },
    SAVE_FIELDS_ERRORS(state, errors) {
      state.fieldsErrors = errors;
    },
    SAVE_ERROR_MESSAGE(state, message) {
      state.errorMessage = message;
    },
    SAVE_OPERATORS(state, operators) {
      state.operators = operators
    },
    SAVE_DUPLICATE_MODEL(state, model) {
      state.duplicateModel = model
    },
    CLEAR_DUPLICATE_MODEL(state) {
      state.duplicateModel = {};
    },
    SAVE_TELEGRAM_LINK(state, link) {
      state.telegramLink = link;
    },
  },
  actions: {
    async fetchUsers({commit, dispatch}, query = {}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: {pagination: false, ...query}}
        }, {name: 'users/fetchUsers', query}, dispatch);
        commit('SAVE_USERS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersWithPagination({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: query}
        }, {name: 'users/fetchUsersWithPagination'}, dispatch);
        commit('SAVE_USERS_WITH_PAGINATION', data.items);
        commit(`SAVE_USERS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersNextPage({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: query}
        }, {name: 'users/fetchUsersNextPage'}, dispatch);
        commit('SAVE_USERS_NEXT_PAGE', data.items);
        commit(`SAVE_USERS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUser({commit, dispatch}, userId) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({method: 'get', url: `/users/${userId}`}, {
          name: 'users/fetchUser',
          params: userId
        }, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_USER', data);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editOperatorGroups({dispatch}, user) {
      return dispatch('editOperatorBase', {user, postfix: '-groups'});
    },
    async editOperator({dispatch}, user) {
      return dispatch('editOperatorBase', {user, postfix: ''});
    },
    async editOperatorBase({commit, dispatch}, requestData) {
      commit('SET_STATUS', `editing${requestData.postfix}`);
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/operators/${requestData.user.id}`,
          data: requestData.user
        }, {name: 'users/editOperatorBase', params: requestData}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_USER', data);
        commit('SAVE_UPDATED_USER', data);
        commit('groups/UPDATE_USER', data, {root: true});
        commit('profile/UPDATE_USER', data, {root: true});
        commit('profile/UPDATE_USER_IN_SHORT_PROFILE', data, {root: true});
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (error?.response?.status === 406) return commit('SET_STATUS', 'error-unfinished-shift');
            commit('SET_STATUS', `error${requestData.postfix}`);
            if (error?.response?.data?.violations) commit('SAVE_FIELDS_ERRORS', error.response.data.violations);
            if (error?.response?.data?.detail) commit('SAVE_ERROR_MESSAGE', error.response.data.detail);
          },
        });
      }
    },
    async editUserGroups({dispatch}, user) {
      return dispatch('editUserBase', {user, postfix: '-groups'});
    },
    async editUser({dispatch}, user) {
      return dispatch('editUserBase', {user, postfix: ''});
    },
    async editUserBase({commit, dispatch}, requestData) {
      commit('SET_STATUS', `editing${requestData.postfix}`);
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/users/${requestData.user.id}`,
          data: requestData.user
        }, {name: 'users/editUserBase', params: requestData}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_USER', data);
        commit('SAVE_UPDATED_USER', data);
        commit('groups/UPDATE_USER', data, {root: true});
        commit('profile/UPDATE_USER', data, {root: true});
        commit('profile/UPDATE_USER_IN_SHORT_PROFILE', data, {root: true});
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (error?.response?.status === 406) return commit('SET_STATUS', 'error-unfinished-shift');
            commit('SET_STATUS', `error${requestData.postfix}`);
            if (error?.response?.data?.violations) commit('SAVE_FIELDS_ERRORS', error.response.data.violations);
            if (error?.response?.data?.detail) commit('SAVE_ERROR_MESSAGE', error.response.data.detail);
          },
        });
      }
    },
    async editModelGroups({dispatch}, user) {
      return dispatch('editModelBase', {user, postfix: '-groups'});
    },
    async editModel({dispatch}, user) {
      return dispatch('editModelBase', {user, postfix: ''});
    },
    async editModelBase({commit, dispatch}, requestData) {
      commit('SET_STATUS', `editing${requestData.postfix}`);
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/models/${requestData.user.id}`,
          data: requestData.user
        }, {name: 'users/editModelBase', params: requestData}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_USER', data);
        commit('SAVE_UPDATED_USER', data);
        commit('groups/UPDATE_USER', data, {root: true});
        commit('profile/UPDATE_USER', data, {root: true});
        commit('profile/UPDATE_USER_IN_SHORT_PROFILE', data, {root: true});
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (error?.response?.status === 406) return commit('SET_STATUS', 'error-unfinished-shift');
            commit('SET_STATUS', `error${requestData.postfix}`);
            if (error?.response?.data?.violations) commit('SAVE_FIELDS_ERRORS', error.response.data.violations);
            if (error?.response?.data?.detail) commit('SAVE_ERROR_MESSAGE', error.response.data.detail);
          },
        });
      }
    },
    async fetchCurrentUsers({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      if (!query.page || (query.page === 1)) commit('CLEAR_CURRENT_USERS');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: query}
        }, {name: 'users/fetchUsersForAdding', params: query}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_CURRENT_USERS', data.items);
        commit('SAVE_CURRENT_USERS_HEADERS', formatPaginationData(data));
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    //TO BE DELETED
    async fetchOperatorsForAdding({commit, dispatch}, query) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/operators`,
          params: {params: query}
        }, {name: 'users/fetchOperatorsForAdding', params: query}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_CURRENT_USERS', data);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createUser({commit, dispatch}, params) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: params.isOperator ? '/operators' : params.isModel ? '/models' : `/users`,
          data: params.user,
          params: {params: params.query}
        }, {name: 'users/createUser', params: params.user}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_USER', data);
        commit('SAVE_NEW_USER', data);
        commit('groups/UPDATE_USER', data, {root: true});
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (error?.response?.data) {
              if (!error.response.data.violations && error.response.data.detail && JSON.parse(error.response.data.detail).id) commit('SAVE_DUPLICATE_MODEL', JSON.parse(error.response.data.detail));
              else commit('SAVE_FIELDS_ERRORS', error.response.data);
            }
            commit('SET_STATUS', 'error');
          },
        });

      }
    },
    async resetUserPassword({commit, dispatch}, userId) {
      commit('SET_STATUS', 'resetting');
      try {
        await requestHandler({
          method: 'post',
          url: `/users/${userId}/generate_password`
        }, {name: 'users/resetUserPassword', params: userId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    clearDuplicateModel({commit}) {
      commit('CLEAR_DUPLICATE_MODEL');
    },
    async fetchTelegramLink({commit, dispatch}, userId) {
      commit('SET_STATUS', 'fetching-link');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/user/telegram/link`,
          params: {
            params: {
              userId
            }
          }
        }, {name: 'users/fetchTelegramLink', params: userId}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_TELEGRAM_LINK', data.link);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}
