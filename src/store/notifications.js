import {requestHandler, formatPaginationData, getUsersUrlForRole, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    notifications: [],
    notificationsHeaders: {},
    usersForNotifications: {},
    userNotifications: [],
    userNotificationsHeaders: [],
    pagesCount: null,
    newNotification: null,
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SAVE_USER_NOTIFICATIONS(state, notifications) {
      state.userNotifications = [...state.userNotifications, ...notifications];
    },
    SAVE_USER_NOTIFICATIONS_HEADERS(state, headers) {
      state.userNotificationsHeaders = headers;
      if (headers.pagesCount)
        state.pagesCount = headers.pagesCount;
    },
    SET_LAST_NOTIFICATION(state, notification) {
      notification.is_read = false;
      state.newNotification = notification;
      state.userNotifications = [notification, ...state.userNotifications];
    },
    SET_READ_NOTIFICATIONS_ALL(state) {
      state.userNotifications = state.userNotifications.map(notification => ({
        ...notification,
        is_read: true
      }));
    },
    SET_READ_NOTIFICATION(state, id) {
      const index = state.notifications.findIndex(notification => notification.id === id);
      state.userNotifications[index] = { ...state.userNotifications[index], is_read: true };
    },
    SET_UNREAD_NOTIFICATION(state, id) {
      const index = state.notifications.findIndex(notification => notification.id === id);
      state.userNotifications[index] = { ...state.userNotifications[index], is_read: false };
    },
    SAVE_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    SAVE_NOTIFICATIONS_HEADERS(state, headers) {
      state.notificationsHeaders = headers;
    },
    SAVE_USERS_FOR_NOTIFICATIONS(state, data) {
      state.usersForNotifications = {
        ...state.usersForNotifications,
        [data.role]: data.users,
      };
    },
    CLEAR_USERS_FOR_NOTIFICATIONS(state) {
      state.usersForNotifications = {};
    },
    SAVE_NOTIFICATION_USERS(state, data) {
      state.notifications = state.notifications.map(notification => {
        if (notification.id !== data.params.id) return notification;
        return {
          ...notification,
          users: notification.users ? {
            ...notification.users,
            [data.params.query.role]: data.users,
          } : {[data.params.query.role]: data.users}
        };
      });
    },
  },
  actions: {
    async fetchNotifications({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        let { data } = await requestHandler({method: 'get', url: `/notifications`, params: { params: query }}, {name: 'notifications/fetchNotifications', params: query}, dispatch);
        commit('SAVE_NOTIFICATIONS', data.items);
        commit('SAVE_NOTIFICATIONS_HEADERS', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createNotification({ commit, dispatch }, notification) {
      commit('SET_STATUS', 'creating');
      try {
        await requestHandler({method: 'post', url: `/notifications`, data: notification}, {name: 'notifications/createNotification', params: notification}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersForNotifications({ commit, dispatch }, query) {
      commit('SET_STATUS', 'fetching-users');
      try {
        let { data } = await requestHandler({method: 'get', url: getUsersUrlForRole(query.role), params: { params: query }}, {name: 'notifications/fetchUsersForNotifications', params: query}, dispatch);
        commit('SAVE_USERS_FOR_NOTIFICATIONS', {users: data, role: query.role});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    clearUsersForNotifications({ commit }) {
      commit('CLEAR_USERS_FOR_NOTIFICATIONS');
    },
    async fetchNotificationUsers({ commit, dispatch }, params) {
      commit('SET_STATUS', 'fetching-users');
      try {
        let { data } = await requestHandler({method: 'get', url: `notifications/${params.id}/users`, params: { params: params.query }}, {name: 'notifications/fetchNotificationUsers', params: params}, dispatch);
        commit('SAVE_NOTIFICATION_USERS', {users: data, params: params});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async repeatNotification({ commit, dispatch }, notificationId) {
      commit('SET_STATUS', 'repeating');
      try {
        await requestHandler({method: 'post', url: `/notifications/${notificationId}/repeat`, data: {}}, {name: 'notifications/repeatNotification', params: notificationId}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUserNotifications({commit, dispatch}, params) {
      commit('SET_STATUS', 'fetch-notifications');
      try {
        let response = await requestHandler(
            {
              method: 'get',
              url: '/my/notifications',
              params: {params: params}
            },
            { name: 'notifications/fetchUserNotifications', params: params }, dispatch);
        commit('SAVE_USER_NOTIFICATIONS', response?.data?.items);
        commit('SAVE_USER_NOTIFICATIONS_HEADERS', response?.data?.pagination);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async sendAllReadMessages({ commit, dispatch}, data) {
      commit('SET_STATUS', 'sending-read-all');
      try {
        await requestHandler({method: 'put', url: `/my/notifications/mark_as_read/all`, data: data},
            {name: 'notifications/sendAllReadMessages'}, dispatch);
        commit('SET_STATUS', '');
        commit('auth/SET_UNREAD_NOTIFICATIONS', 0, {root: true});
        commit('SET_READ_NOTIFICATIONS_ALL');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async sendReadMessages({ commit, dispatch, state }, data) {
      commit('SET_STATUS', 'sending-read');
      try {
        await requestHandler({method: 'put', url: `/my/notifications/mark_as_read`, data: data},
            {name: 'notifications/sendReadMessages'}, dispatch);
        commit('auth/DECREMENT_UNREAD_NOTIFICATIONS', null, {root: true});
        commit('SET_READ_NOTIFICATION', data[0]);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async sendUnreadMessages({ commit, dispatch, state }, data) {
      commit('SET_STATUS', 'sending-unread');
      try {
        await requestHandler({method: 'put', url: `/my/notifications/mark_as_unread`, data: data},
            {name: 'notifications/sendAllUnreadMessages'}, dispatch);
        commit('auth/INCREMENT_UNREAD_NOTIFICATIONS', null, {root: true});
        commit('SET_UNREAD_NOTIFICATION', data[0]);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
};
