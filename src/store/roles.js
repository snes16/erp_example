import {updateList, requestHandler, formatPaginationData, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    roleStatus: '',
    roles: [],
    role: {},
    activeUsers: [],
    inactiveUsers: [],
    activeUsersHeaders: {},
    inactiveUsersHeaders: {},
    previousRole: [],
    actions: [],
    rights: [],
    permissions: [],
    deletedName: '',
  },
  getters: {
    getRoleByCode: state => code => state.roles.find(role => role.code === code) || {}
  },
  mutations: {
    SAVE_ROLES(state, roles) {
      state.roles = roles;
    },
    SAVE_ROLE(state, role) {
      state.roles = updateList(state.roles, role);
    },
    FETCH_ACTIONS(state, actions) {
      state.actions = actions
    },
    FETCH_RIGHTS(state, rights) {
      state.rights = rights
    },
    SAVE_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
    },
    EDIT_ROLES(state, role) {

      state.roles = updateList(state.roles, role);
    },
    REMOVE_ROLE(state, role) {
      state.roles = updateList(state.roles, role.id, 'remove');
      state.deletedName = role.title
    },
    SET_STATUS(state, status) {
      state.roleStatus = status;
    },
    SAVE_ACTIVE_USERS(state, users) {
      state.activeUsers = users;
    },
    SAVE_INACTIVE_USERS(state, users) {
      state.inactiveUsers = users;
    },
    SAVE_ACTIVE_USERS_NEXT_PAGE(state, users) {
      state.activeUsers = [...state.activeUsers, ...users];
    },
    SAVE_INACTIVE_USERS_NEXT_PAGE(state, users) {
      state.inactiveUsers = [...state.inactiveUsers, ...users];
    },
    UPDATE_ACTIVE_USERS_LAST_PAGE(state, users) {
      let currentUsers = [...state.activeUsers];
      users.forEach(user => currentUsers = updateList(currentUsers, user));
      state.activeUsers = currentUsers;
    },
    UPDATE_INACTIVE_USERS_LAST_PAGE(state, users) {
      let currentUsers = [...state.inactiveUsers];
      users.forEach(user => currentUsers = updateList(currentUsers, user));
      state.inactiveUsers = currentUsers;
    },
    SAVE_ACTIVE_USERS_HEADERS(state, headers) {
      state.activeUsersHeaders = headers;
    },
    SAVE_INACTIVE_USERS_HEADERS(state, headers) {
      state.inactiveUsersHeaders = headers;
    },
    DELETE_USERS(state, query) {
      let fieldName = query.isActive ? 'activeUsers' : 'inactiveUsers';
      state[fieldName] = updateList(state[fieldName], query.userId, 'remove');
    }
  },
  actions: {
    async getRoles({ commit, dispatch }) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/roles?pagination=false`}, {name: 'roles/getRoles'}, dispatch);
        commit('SAVE_ROLES', data);
        commit('SET_STATUS', 'roles-received');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchRole({ commit, dispatch }, roleId) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/roles/${roleId}`}, {name: 'roles/fetchRole', params: roleId}, dispatch);
        commit('SAVE_ROLE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createRole({ commit, dispatch }) {
      commit('SET_STATUS', 'creating');
      try {
        let { data } = await requestHandler({method: 'post', url: `/roles`, data: {}}, {name: 'roles/createRole'}, dispatch);
        commit('EDIT_ROLES', data);
        commit('SET_STATUS', 'role-received');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async removeRole({ commit, dispatch }, activeRole) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/roles/${ activeRole.id }`}, {name: 'roles/removeRole', params: activeRole}, dispatch);
        commit('REMOVE_ROLE', activeRole);
        commit('SET_STATUS', 'role-removed');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchActions({ commit, dispatch }) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/permissions/actions`}, {name: 'roles/getActions'}, dispatch);
        commit('FETCH_ACTIONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getActions({ state, dispatch }) {
      if (!state.actions.length) return dispatch('fetchActions')
    },
    async fetchRights({ commit, dispatch }) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/permissions/rights`}, {name: 'roles/getRights'}, dispatch);
        commit('FETCH_RIGHTS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getRights({ state, dispatch }) {
      if (!state.rights.length) return dispatch('fetchRights')
    },
    async fetchPermissions({ commit, dispatch }) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/permissions`}, {name: 'roles/fetchPermissions'}, dispatch);
        commit('SAVE_PERMISSIONS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editActions({ commit, dispatch }, query) {
      commit('SET_STATUS', 'editing');
      try {
        let { data } = await requestHandler({method: 'put', url: `/roles/${query.id}`, data: { title: query.title, actions: query.actions }}, {name: 'roles/editActions', params: query}, dispatch);
        commit('EDIT_ROLES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editRights({ commit, dispatch }, query) {
      commit('SET_STATUS', 'editing');
      try {
        let { data } = await requestHandler({method: 'put', url: `/roles/${query.id}`, data: { title: query.title, rights: query.rights }}, {name: 'roles/editRights', params: query}, dispatch);
        commit('EDIT_ROLES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editRole({ commit, dispatch }, role) {
      commit('SET_STATUS', 'editing');
      let id = role.id;
      delete role.id;
      try {
        let { data } = await requestHandler({method: 'put', url: `/roles/${id}`, data: role}, {name: 'roles/editRole', params: role}, dispatch);
        commit('EDIT_ROLES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsers({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/users`, params: { params: query}}, {name: 'roles/fetchUsers', params: query}, dispatch);
        commit(`SAVE_${query.is_active ? '' : 'IN'}ACTIVE_USERS`, data.items);
        commit(`SAVE_${query.is_active ? '' : 'IN'}ACTIVE_USERS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersNextPage({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/users`, params: { params: query}}, {name: 'roles/fetchUsersNextPage', params: query}, dispatch);
        commit(`SAVE_${query.is_active ? '' : 'IN'}ACTIVE_USERS_NEXT_PAGE`, data.items);
        commit(`SAVE_${query.is_active ? '' : 'IN'}ACTIVE_USERS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async updateUsersLastPage({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/users`, params: { params: query}}, {name: 'roles/updateActiveUsersLastPage', params: query}, dispatch);
        commit(`UPDATE_${query.is_active ? '' : 'IN'}ACTIVE_USERS_LAST_PAGE`, data.items);
        commit(`SAVE_${query.is_active ? '' : 'IN'}ACTIVE_USERS_HEADERS`, formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteUsers({ commit, dispatch }, query) {
      commit('SET_STATUS', 'deletingUser');
      try {
        await requestHandler({method: 'put', url: `/users/${ query.userId }`, data: { role: null }}, {name: 'roles/deleteUsers', params: query}, dispatch);
        commit('DELETE_USERS', query);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    }
  }
};
