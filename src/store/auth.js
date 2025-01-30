import axios from "axios";
import router from '../Routes';
import {fillingPermissions, requestHandler, responseErrorHandler} from '@/tools/tools';
import store from "@/store/index";

export default {
  namespaced: true,
  state: {
    isFetching: false,
    errorMessage: '',
    user: {},
    userPermissions: fillingPermissions([]),
    email: '',
    password: '',
    status: '',
    loginStatus: '', //  request | error | success|''
    accessToken: '',
    refreshToken: '',
    textErrorLogin: '',
    unreadNotificationsCount: 0,
    needPin: false,
    hasPin: localStorage.getItem('hasPin') === 'true',
    pinLockStatus: '',
    isLastActivityTimerChecked: false,
    isUserLockedBehindPin: false,
    pinAttemptsLeft: null,
  },
  mutations: {
    SET_TOKENS_ACCESS(state, payload) {
      state.accessToken = payload;
    },
    SET_TOKENS_REFRESH(state, payload) {
      state.refreshToken = payload;
    },
    SAVE_ERROR_MESSAGE(state, message) {
      state.errorMessage = message;
    },
    SAVE_USER(state, user) {
      state.user = user;
    },
    SET_STATUS_AUTH(state, status) {
      state.status = status;
    },
    SAVE_NEED_PIN(state, needPin) {
      state.needPin = needPin;
    },
    SAVE_HAS_PIN(state, hasPin) {
      localStorage.setItem('hasPin', hasPin);
      state.hasPin = hasPin;
    },
    SAVE_USER_PERMISSIONS(state, permissions) {
      state.userPermissions = fillingPermissions(permissions);
    },
    SET_UNREAD_NOTIFICATIONS(state, count) {
      state.unreadNotificationsCount = count;
    },
    INCREMENT_UNREAD_NOTIFICATIONS(state) {
      state.unreadNotificationsCount++;
    },
    DECREMENT_UNREAD_NOTIFICATIONS(state) {
      state.unreadNotificationsCount--;
    },
    SET_LOGIN_STATUS(state, status) {
      state.loginStatus = status;
    },
    SET_LOGIN_AND_PASSWORD(state, payload = {}) {
      state.email = payload.email || '';
      state.password = payload.password || '';
    },
    SET_PIN_LOCK_STATUS(state, status) {
      state.pinLockStatus = status;
    },
    SET_PIN_LOCK_USER_STATUS(state, status) {
      state.isUserLockedBehindPin = status;
    },
    SET_LAST_ACTIVITY_TIMER_CHECK_STATUS_AS_CHECKED(state) {
      state.isLastActivityTimerChecked = true;
    },
    SAVE_PIN_ATTEMPTS_LEFT(state, attempts) {
      state.pinAttemptsLeft = attempts;
    },
  },
  actions: {
    removeTokens({commit}) {
      commit('SET_TOKENS_ACCESS', '');
      commit('SET_TOKENS_REFRESH', '');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      document.cookie = `Authorization=;max-age=-1;domain=.${location.host}`;
      axios.defaults.headers.common['Authorization'] = undefined;
    },
    resetPassAndEmail({commit}) {
      commit('SET_LOGIN_AND_PASSWORD');
    },
    /*resetError({commit}) {
      commit('SAVE_ERROR_MESSAGE', '');
    },*/
    setTokens({commit, state}, tokens) {
      localStorage.setItem('token', tokens.token);
      localStorage.setItem('refreshToken', tokens.refresh_token);
      document.cookie = `Authorization=Bearer ${tokens.token};domain=.${location.host}`;
      axios.defaults.headers.common['Authorization'] = "Bearer " + tokens.token;
      commit('SET_TOKENS_ACCESS', tokens.token);
      commit('SET_TOKENS_REFRESH', tokens.refresh_token);
    },
    setInitialTokens({dispatch, state}) {
      if (state.accessToken || state.refreshToken) return;

      const token = localStorage.getItem('token') || '',
        refresh_token= localStorage.getItem('refreshToken') || '';

      if (refresh_token) dispatch('setTokens', {token, refresh_token});
    },
    async authUser({dispatch, commit}, creds) {
      commit('SET_STATUS_AUTH', 'authorization');
      try {
        const { data } = await requestHandler({
          method: 'post',
          url: `/auth`,
          data: creds
        }, {
          name: 'auth/authUser',
          params: creds
        }, dispatch);

        commit('SAVE_NEED_PIN', data.need_pin);
        commit('SAVE_HAS_PIN', data.has_pin);
        commit('SET_STATUS_AUTH', '');
        commit('SET_LOGIN_AND_PASSWORD', creds);
      } catch (err) {
        commit('SET_STATUS_AUTH', 'error');
        commit('SAVE_ERROR_MESSAGE', err.response);
      }
    },
    async loginUser({dispatch, commit, state}, pin) {
      commit('SET_LOGIN_STATUS', 'request');
      const requestData = {pin, email: state.email, password: state.password};

      try {
        const { data } = await requestHandler({
          method: 'post',
          url: `/login`,
          data: requestData,
        }, {
          name: 'auth/loginUser',
          params: requestData,
        }, dispatch, [403]);

        dispatch('setTokens', data);
        if (pin) commit('SAVE_HAS_PIN', true);
        localStorage.setItem('lastActivityTimestamp', new Date().getTime().toString());
        commit('SET_LOGIN_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          customHandler: () => {
            commit('SET_LOGIN_STATUS', 'error');
            if (error?.response?.data?.attemptsLeft) commit('SAVE_PIN_ATTEMPTS_LEFT', error.response.data.attemptsLeft);
            else dispatch('logoutUser');
          },
        });
        commit('SET_LOGIN_STATUS', 'error');
      }
    },
    logoutUser({dispatch}) {
      dispatch('removeTokens');
      localStorage.removeItem('user');
      localStorage.removeItem('scheduleFilters');
      localStorage.removeItem('schedulePastFilters');
      localStorage.removeItem('workshiftConfigs');
      localStorage.removeItem('workshiftConfigsDate');
      localStorage.removeItem('filterSelectedResponse');
      localStorage.removeItem('centrifugeToken');

      router.push('/login');
      document.location.reload();
    },
    async getUser({state, dispatch}) {
      if (!state.user.id) await dispatch('fetchUser');
    },
    async fetchUser({commit, dispatch}) {
      commit('SET_STATUS_AUTH', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get', url: '/users/me', params: {
            headers: {
              'X-User-Timezone': new Date().getTimezoneOffset() / 60 * (-1),
            }
          }
        }, {name: 'auth/getUser'}, dispatch);
        commit('SAVE_USER', data);
        commit('SAVE_USER_PERMISSIONS', data.compact_permissions);
        commit('SET_UNREAD_NOTIFICATIONS', data.unread_notifications_number);
        commit('SET_LOGIN_STATUS', '');
        commit('SET_STATUS_AUTH', 'fetched');
        if (!Array.isArray(data.workshift_config) && data.workshift_config.date) {
          dispatch('schedule/saveWorkshiftTab', data.workshift_config, {root: true});
        }
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_STATUS_AUTH'});
      }
    },
    checkLastActivityTimer({commit, state}) {
      if (state.isLastActivityTimerChecked) return true;
      commit('SET_LAST_ACTIVITY_TIMER_CHECK_STATUS_AS_CHECKED');
      const lastActivityTimestamp = localStorage.getItem('lastActivityTimestamp');
      return lastActivityTimestamp && (new Date().getTime() - parseInt(lastActivityTimestamp) < 600000);
    },
    setPinLockUserStatus({commit, state}, status) {
      if (state.isUserLockedBehindPin === status) return false;
      commit('SET_PIN_LOCK_USER_STATUS', status);
      return true;
    },
    async lockUserBehindPin({commit, dispatch}) {
      commit('SET_PIN_LOCK_STATUS', 'locking');
      try {
        await requestHandler({method: 'post', url: '/auth/lock'}, {name: 'auth/lockUserBehindPin'}, dispatch);
        commit('SET_PIN_LOCK_STATUS', '');
        commit('SET_PIN_LOCK_USER_STATUS', true);
      } catch (error) {
        responseErrorHandler({commit,
          error,
          statusMutation: 'SET_STATUS_AUTH',
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_HAS_PIN',
          errorMessage: false,
        });
      }
    },
    async unlockUserWithPin({commit, dispatch}, pin) {
      commit('SET_PIN_LOCK_STATUS', 'unlocking');
      try {
        await requestHandler({method: 'post', url: '/auth/unlock', data: {pin}}, {name: 'auth/unlockUserWithPin', params: pin}, dispatch, [403]);
        commit('SET_PIN_LOCK_STATUS', '');
        commit('SET_PIN_LOCK_USER_STATUS', false);
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          customHandler: () => {
            commit('SET_PIN_LOCK_USER_STATUS', true);
            commit('SET_PIN_LOCK_STATUS', 'error');
            if (error?.response?.data?.attemptsLeft) commit('SAVE_PIN_ATTEMPTS_LEFT', error.response.data.attemptsLeft);
            else dispatch('logoutUser');
          },
        });
      }
    },
  },
};
