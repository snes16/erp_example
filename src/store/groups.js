import {
  updateListRecursively,
  removeFromListRecursively,
  editRoomRecursively,
  updateList,
  requestHandler, formatPaginationData, responseErrorHandler
} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    responsibleStatus: '',
    statusUsers: '',
    groups: [],
    groupsNonSystem: [],
    group: {},
    newGroup: {},
    updatedGroup: {},
    groupTypes: {
      [undefined]: 'Без типа',
      country: 'Страна',
      city: 'Город',
      office: 'Офис'
    },
    errorMessage: '',
    deactivationInfo: {},
    newRoom: {},
    updatedRoom: {},
    deletedRoomId: 0,
    currentGroupEmployees: [],
    currentGroupModels: [],
    currentGroupOperators: [],
    currentGroupsForEmployees: null,
    currentGroupsForModels: null,
    currentGroupForUsers: null,
    currentRoleForUsers: null,
    headersGroupEmployees: {},
    headersGroupModels: {},
    headersGroupOperators: {},
    responsibleUsers: {},
    potentialResponsibleUsers: {},
    potentialResponsibleUsersHeaders: {},
    // currentGroupNestedOperators: []
    groupUsersMain: [],
    groupUsersMainHeaders: {},
    groupUsersMainHeadersAlt: {},
    usersWithAccessCounter: [],
    usersByRoleCounter: {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_RESPONSIBLE_STATUS(state, status) {
      state.responsibleStatus = status;
    },
    SET_STATUS_USERS(state, status) {
      state.statusUsers = status;
    },
    SET_ERROR_MESSAGE(state, message) {
      state.errorMessage = message;
    },
    SAVE_DEACTIVATION_INFO(state, data) {
       state.deactivationInfo = data;
    },
    SAVE_GROUPS(state, groups) {
      state.groups = groups;
    },
    SAVE_GROUPS_NON_SYSTEM(state, groups) {
      state.groupsNonSystem = groups;
    },
    SAVE_NEW_GROUP(state, group) {
      state.newGroup = group;
    },
    SAVE_UPDATED_GROUP(state, group) {
      state.updatedGroup = group;
    },
    SAVE_GROUP(state, group) {
      state.groups = updateListRecursively(state.groups, group);
      state.group = group;
    },
    UPDATE_GROUP(state, group) {
      state.groups = updateListRecursively(state.groups, group, 'update-element');
    },
    REMOVE_GROUP(state, groupId) {
      state.groups = removeFromListRecursively(state.groups, groupId);
    },
    SAVE_ROOM(state, room) {
      state.groups = editRoomRecursively(state.groups, room);
    },
    REMOVE_ROOM(state, room) {
      state.groups = editRoomRecursively(state.groups, room, 'remove');
    },
    SAVE_NEW_ROOM(state, room) {
      state.newRoom = room;
    },
    SAVE_UPDATED_ROOM(state, room) {
      state.updatedRoom = room;
    },
    SAVE_DELETED_ROOM_ID(state, id) {
      state.deletedRoomId = id;
    },
    UPDATE_USER(state, user) {
      // state.groups = editUserRecursively(state.groups, user, 'update');
      if (!state.currentGroupsForEmployees?.length) return;
      if (user.groups.some(group => state.currentGroupsForEmployees.includes(group.id))) {
        switch (user.role.code) {
          case 'ROLE_MODEL':
            return state.currentGroupModels = updateList(state.currentGroupModels, user);
          case 'ROLE_OPERATOR':
            return state.currentGroupOperators = updateList(state.currentGroupOperators, user);
        }
        return state.currentGroupEmployees = updateList(state.currentGroupEmployees, user);
      } else {
        switch (user.role.code) {
          case 'ROLE_MODEL':
            return state.currentGroupModels = updateList(state.currentGroupModels, user.id, 'remove');
          case 'ROLE_OPERATOR':
            return state.currentGroupOperators = updateList(state.currentGroupOperators, user.id, 'remove');
        }
        return state.currentGroupEmployees = updateList(state.currentGroupEmployees, user.id, 'remove');
      }
    },
    REMOVE_USERS(state, userIds) {
      state.groupUsersMain = state.groupUsersMain.filter(user => !userIds.includes(user.id));
    },
    SAVE_CURRENT_GROUP_EMPLOYEES(state, users) {
      state.currentGroupEmployees = users;
    },
    SAVE_CURRENT_GROUP_MODELS(state, users) {
      state.currentGroupModels = users;
    },
    SAVE_CURRENT_GROUP_OPERATORS(state, users) {
      state.currentGroupOperators = users;
    },
    SAVE_CURRENT_GROUP_EMPLOYEES_NEXT_PAGE(state, users) {
      state.currentGroupEmployees = [...state.currentGroupEmployees, ...users];
    },
    SAVE_CURRENT_GROUP_MODELS_NEXT_PAGE(state, users) {
      state.currentGroupModels = [...state.currentGroupModels, ...users];
    },
    SAVE_CURRENT_GROUP_OPERATORS_NEXT_PAGE(state, users) {
      state.currentGroupOperators = [...state.currentGroupOperators, ...users];
    },
    SAVE_CURRENT_GROUP_EMPLOYEES_LAST_PAGE(state, users) {
      let currentGroupEmployees = [...state.currentGroupEmployees];
      users.forEach(user => currentGroupEmployees = updateList(currentGroupEmployees, user));
      state.currentGroupEmployees = currentGroupEmployees;
    },
    SAVE_CURRENT_GROUP_MODELS_LAST_PAGE(state, users) {
      let currentGroupModels = [...state.currentGroupModels];
      users.forEach(user => currentGroupModels = updateList(currentGroupModels, user));
      state.currentGroupModels = currentGroupModels;
    },
    SAVE_CURRENT_GROUP_OPERATORS_LAST_PAGE(state, users) {
      let currentGroupOperators = [...state.currentGroupOperators];
      users.forEach(user => currentGroupOperators = updateList(currentGroupOperators, user));
      state.currentGroupOperators = currentGroupOperators;
    },
    SAVE_HEADERS_GROUP_EMPLOYEES(state, headers) {
      state.headersGroupEmployees = headers;
    },
    SAVE_HEADERS_GROUP_MODELS(state, headers) {
      state.headersGroupModels = headers;
    },
    SAVE_HEADERS_GROUP_OPERATORS(state, headers) {
      state.headersGroupOperators = headers;
    },
    SET_CURRENT_GROUPS_FOR_EMPLOYEES(state, groups) {
      state.currentGroupsForEmployees = groups;
    },
    SET_CURRENT_GROUPS_FOR_MODELS(state, groups) {
      state.currentGroupsForModels = groups;
    },
    SET_CURRENT_GROUP_FOR_USERS(state, group) {
      state.currentGroupForUsers = group;
    },
    SET_CURRENT_ROLE_FOR_USERS(state, role) {
      state.currentRoleForUsers = role;
    },
    SAVE_GROUP_USERS_MAIN(state, users) {
      state.groupUsersMain = [...state.groupUsersMain, ...users];
    },
    UPDATE_GROUP_USERS_MAIN(state, users) {
      let groupUsersMain = [...state.groupUsersMain];
      users.forEach(user => groupUsersMain = updateList(groupUsersMain, user));
      state.groupUsersMain = groupUsersMain;
    },
    SAVE_GROUP_USERS_MAIN_HEADERS(state, headers) {
      state.groupUsersMainHeaders = headers;
    },
    SAVE_GROUP_USERS_MAIN_HEADERS_ALT(state, headers) {
      state.groupUsersMainHeadersAlt = headers;
    },
    CLEAR_GROUP_USERS_MAIN(state) {
      state.groupUsersMain = [];
    },
    ClEAR_DEACTIVATION_INFO(state) {
      state.deactivationInfo = {};
    },
    /*SAVE_CURRENT_GROUP_NESTED_OPERATORS(state, users) {
        state.currentGroupNestedOperators = users;
    },*/
    SAVE_RESPONSIBLE_USERS(state, users) {
      state.responsibleUsers = users;
    },
    SAVE_POTENTIAL_RESPONSIBLE_USERS(state, data) {
      state.potentialResponsibleUsers = {
        ...state.potentialResponsibleUsers,
        [data.type]: data.users,
      };
    },
    SAVE_POTENTIAL_RESPONSIBLE_USERS_NEXT_PAGE(state, data) {
      state.potentialResponsibleUsers = {
        ...state.potentialResponsibleUsers,
        [data.type]: [...state.potentialResponsibleUsers[data.type], ...data.users],
      };
    },
    DELETE_POTENTIAL_RESPONSIBLE_USERS(state) {
      state.potentialResponsibleUsers = {};
    },
    SAVE_POTENTIAL_RESPONSIBLE_USERS_HEADERS(state, data) {
      state.potentialResponsibleUsersHeaders = {
        ...state.potentialResponsibleUsersHeaders,
        [data.type]: data.headers,
      };
    },
    SAVE_USERS_WITH_ACCESS_COUNTER(state, counter) {
      state.usersWithAccessCounter = counter;
    },
    SAVE_USERS_BY_ROLE_COUNTER(state, counter) {
      state.usersByRoleCounter = counter;
    },
  },
  actions: {
    async getGroups({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({method: 'get', url: `/groups?lvl=0`}, {name: 'groups/getGroups'}, dispatch);
        commit('SAVE_GROUPS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getGroupsNonSystem({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/groups?lvl=0&skip_system=1&skip_inactive=1`
        }, {name: 'groups/getGroupsNonSystem'}, dispatch);
        commit('SAVE_GROUPS_NON_SYSTEM', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editGroup({commit, dispatch}, group) {
      commit('SET_STATUS', 'editing');
      await dispatch('fetchEditGroup', group);
    },
    async deleteGroupUsers({commit, dispatch}, group) {
      commit('SET_STATUS', 'deleting-users');
      await dispatch('fetchEditGroup', group);
    },
    async deleteGroupUser({commit, dispatch}, group) {
      commit('SET_STATUS', 'deleting-user');
      await dispatch('fetchEditGroup', group);
    },
    async fetchEditGroup({commit, dispatch}, group) {
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/groups/${group.id}`,
          data: group
        }, {name: 'groups/fetchEditGroup', params: group}, dispatch);
        commit('SAVE_GROUP', data);
        commit('SAVE_UPDATED_GROUP', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async createGroup({commit, dispatch}, group) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({method: 'post', url: `/groups`, data: group}, {
          name: 'groups/createGroup',
          params: group
        }, dispatch);
        commit('SAVE_GROUP', data);
        commit('SAVE_NEW_GROUP', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deleteGroup({commit, dispatch}, groupId) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/groups/${groupId}`}, {
          name: 'groups/deleteGroup',
          params: groupId
        }, dispatch);
        commit('REMOVE_GROUP', groupId);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessage: error?.response?.data?.detail});
      }
    },
    async restoreGroup({commit, dispatch}, groupId) {
      commit('SET_STATUS', 'restoring');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/groups/${groupId}/restore`
        }, {name: 'groups/restoreGroup', params: groupId}, dispatch);
        commit('SAVE_GROUP', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async fetchGroup({commit, dispatch}, groupId) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({method: 'get', url: `/groups/${groupId}`}, {
          name: 'groups/fetchGroup',
          params: groupId
        }, dispatch);
        commit('SAVE_GROUP', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deactivateGroupCheck({commit, dispatch}, groupId) {
      commit('SET_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/groups/${groupId}/deactivation`
        }, {name: 'groups/deactivation', params: groupId}, dispatch);
        commit('SAVE_GROUP', data);
        commit('SAVE_DEACTIVATION_INFO', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async createRoom({commit, dispatch}, room) {
      commit('SET_STATUS', 'creating-room');
      try {
        let {data} = await requestHandler({method: 'post', url: `/rooms`, data: room}, {
          name: 'groups/createRoom',
          params: room
        }, dispatch);
        commit('SAVE_ROOM', data);
        commit('SAVE_NEW_ROOM', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async editRoom({commit, dispatch}, room) {
      commit('SET_STATUS', 'creating-room');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/rooms/${room.id}`,
          data: room
        }, {name: 'groups/editRoom', params: room}, dispatch);
        commit('SAVE_ROOM', data);
        commit('SAVE_UPDATED_ROOM', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async deleteRoom({commit, dispatch}, room) {
      commit('SET_STATUS', 'deleting-room');
      try {
        await requestHandler({method: 'delete', url: `/rooms/${room.id}`}, {
          name: 'groups/deleteRoom',
          params: room
        }, dispatch);
        commit('REMOVE_ROOM', room);
        commit('SAVE_DELETED_ROOM_ID', room.id);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async fetchCurrentGroupOperators({commit, dispatch}, params) {
      commit('SET_STATUS_USERS', 'first-request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/operators`,
          params: {params: params.query}
        }, {name: 'groups/fetchCurrentGroupOperators', params: params}, dispatch);
        commit(`SAVE_CURRENT_GROUP_OPERATORS`, data.items);
        commit(`SAVE_HEADERS_GROUP_OPERATORS`, formatPaginationData(data));
        commit('SET_STATUS_USERS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    clearCurrentGroupOperators({commit}) {
      commit(`SAVE_CURRENT_GROUP_OPERATORS`, []);
      commit(`SAVE_HEADERS_GROUP_OPERATORS`, {});
    },
    clearDeactivationData({commit}) {
      commit('ClEAR_DEACTIVATION_INFO');
    },
    async fetchCurrentGroupOperatorsNextPage({commit, dispatch, state}, params) {
      commit('SET_STATUS_USERS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/operators`,
          params: {params: params.query}
        }, {name: 'groups/fetchCurrentGroupOperatorsNextPage', params: params}, dispatch);
        commit(`SAVE_CURRENT_GROUP_OPERATORS_NEXT_PAGE`, data.items);
        commit(`SAVE_HEADERS_GROUP_OPERATORS`, formatPaginationData(data));
        commit('SET_STATUS_USERS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchCurrentGroupOperatorsLastPage({commit, dispatch, state}, params) {
      commit('SET_STATUS_USERS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/operators`,
          params: {params: params.query}
        }, {name: 'groups/fetchCurrentGroupOperatorsLastPage', params: params}, dispatch);
        commit(`SAVE_CURRENT_GROUP_OPERATORS_LAST_PAGE`, data.items);
        commit(`SAVE_HEADERS_GROUP_OPERATORS`, formatPaginationData(data));
        commit('SET_STATUS_USERS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async addUsersToGroup({commit, dispatch}, params) {
      commit('SET_STATUS', 'adding-users');
      try {
        await requestHandler({
          method: 'put',
          url: `/relation/groups/${params.groupId}`,
          data: {operation: 'set', type: params.type, user_ids: params.users}
        }, {name: 'groups/addUsersToGroup', params: params}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessage: error?.response?.data?.detail});
      }
    },
    async fetchCurrentResponsibleUsers({commit, dispatch}, groupId) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/groups/${groupId}/responsible_for_tasks`,
        }, {name: 'groups/fetchCurrentResponsibleUsers', params: groupId}, dispatch);
        commit(`SAVE_RESPONSIBLE_USERS`, data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editCurrentResponsibleUsers({commit, dispatch}, params) {
      commit('SET_RESPONSIBLE_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'put',
          url: `/groups/${params.groupId}/responsible_for_tasks`,
          data: params.data,
        }, {name: 'groups/fetchCurrentResponsibleUsers', params}, dispatch);
        commit(`SAVE_RESPONSIBLE_USERS`, data);
        commit('SET_RESPONSIBLE_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
    async fetchPotentialResponsibleUsers({commit, dispatch}, params) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: params.query},
        }, {name: 'groups/fetchPotentialResponsibleUsers', params}, dispatch);
        commit(`SAVE_POTENTIAL_RESPONSIBLE_USERS_HEADERS`, {headers: formatPaginationData(data), type: params.type});
        if (params.query.page && (params.query.page !== 1)) commit(`SAVE_POTENTIAL_RESPONSIBLE_USERS_NEXT_PAGE`, {
          users: data.items,
          type: params.type
        });
        else commit(`SAVE_POTENTIAL_RESPONSIBLE_USERS`, {users: data.items, type: params.type});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    clearPotentialResponsibleUsers({commit}) {
      commit(`DELETE_POTENTIAL_RESPONSIBLE_USERS`);
    },
    async fetchGroupUsersMain({commit, dispatch, state}, query) {
      commit('SET_STATUS_USERS', 'request');
      if (!query.page || (query.page === 1)) commit('CLEAR_GROUP_USERS_MAIN');
      commit(`SET_CURRENT_GROUP_FOR_USERS`, query.main_group?.[0]);
      commit(`SET_CURRENT_ROLE_FOR_USERS`, query.role);
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: query},
        }, {name: 'groups/fetchGroupUsersMain', params: query}, dispatch);
        if ((state.currentGroupForUsers !== query.main_group?.[0]) || (state.currentRoleForUsers !== query.role)) return;
        commit('SAVE_GROUP_USERS_MAIN', data.items);
        commit(`SAVE_GROUP_USERS_MAIN_HEADERS`, {
          ...formatPaginationData(data),
          isActive: query.is_active,
          isForCounter: !query.searchString,
        });
        commit('SET_STATUS_USERS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async updateGroupUsersMain({commit, dispatch, state}, query) {
      commit('SET_STATUS_USERS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: query},
        }, {name: 'groups/updateGroupUsersMain', params: query}, dispatch);
        commit('UPDATE_GROUP_USERS_MAIN', data.items);
        commit(`SAVE_GROUP_USERS_MAIN_HEADERS`, {
          ...formatPaginationData(data),
          isActive: query.is_active,
          isForCounter: !query.searchString,
        });
        commit('SET_STATUS_USERS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchGroupUsersMainHeaders({commit, dispatch, state}, query) {
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/users`,
          params: {params: query},
        }, {name: 'groups/fetchGroupUsersMainHeaders', params: query}, dispatch);
        commit(`SAVE_GROUP_USERS_MAIN_HEADERS_ALT`, {
          ...formatPaginationData(data),
          isActive: query.is_active,
          isForCounter: !query.searchString,
        });
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async removeUsersFromGroup({commit, dispatch}, params) {
      commit('SET_STATUS_USERS', 'removing');
      try {
        await requestHandler({
          method: 'put',
          url: `/relation/groups/${params.groupId}`,
          data: params.data,
        }, {name: 'groups/removeUsersFromGroup', params: params}, dispatch);
        commit('REMOVE_USERS', params.data.user_ids);
        commit('SET_STATUS_USERS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessage: error?.response?.data?.detail});
      }
    },
    async fetchUsersWithAccessCounter({commit, dispatch, state}, params) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/groups/${params.groupId}/counter/group`,
          params: {params: params.query},
        }, {name: 'groups/fetchUsersWithAccessCounter', params}, dispatch);
        commit('SAVE_USERS_WITH_ACCESS_COUNTER', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersByRoleCounter({commit, dispatch, state}, groupId) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/groups/${groupId}/counter/role`,
        }, {name: 'groups/fetchUsersByRoleCounter', params: groupId}, dispatch);
        commit('SAVE_USERS_BY_ROLE_COUNTER', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editGroupsOrder({commit, dispatch}, params) {
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/groups/order`,
          params: { params: params.query },
          data: params.data,
        }, {name: 'groups/editGroupsOrder', params: params}, dispatch);
        if (params.query?.parent) commit('UPDATE_GROUP', {
          id: params.query.parent,
          children: data,
          parent: params.parentId ? {id: params.parentId} : null,
        });
        else commit('SAVE_GROUPS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true});
      }
    },
  }
}