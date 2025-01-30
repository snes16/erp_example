import {
  updateList,
  requestHandler,
  formatPaginationData,
  responseErrorHandler,
  getRoundAmount, mergeLists,
} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    status: '',
    userStatus: '',
    profitStatus: '',
    refStatus: '',
    paymentStatus: '',
    profileTasksStatus: '',
    profileAuthHistoryStatus: '',
    absenceStatus: '',
    fineStatus: '',
    supportMessagesStatus: '',
    profiles: {},
    currentProfile: {},
    shortProfiles: [],
    errorMessage: '',
    errorData: {},
    resourcesProcess: [],
    currentUsers: [],
    currentProfitUsers: [],
    currentUsersHeaders: {},
    currentFines: [],
    currentFinesHeaders: {},
    absences: [],
    whiteListHeaders: {},
    usersForWhiteList: {},
    usersForWhiteListHeaders: {},
    usersForWhiteListLastPage: {},
    workshiftReports: [],
    weekProfit: '',
    workweek: '',
    personalSchedule: {},
    incomeDetailsData: {},
    isNeedScheduleFilled: true,
    payments: [],
    paymentsHeaders: {},
    payment: {},
    supportMessages: [],
    supportMessagesHeaders: {},
    albums: {},
  },
  getters: {
    profile: state => id => state.profiles[id] || {profile: {user: {}}},
    shortProfile: state => id => state.shortProfiles.find(profile => profile.id === id) || {},
    workshiftReport: state => id => state.workshiftReports.find(report => report.id === id) || {},
  },
  mutations: {
    SET_STATUS(state, status) {
      state.status = status;
    },
    SET_USER_STATUS(state, status) {
      state.userStatus = status;
    },
    SET_PROFIT_STATUS(state, status) {
      state.profitStatus = status;
    },
    SET_PAYMENT_STATUS(state, status) {
      state.paymentStatus = status;
    },
    SET_PROFILE_TASKS_STATUS(state, status) {
      state.profileTasksStatus = status;
    },
    SET_PROFILE_AUTH_HISTORY_STATUS(state, status) {
      state.profileAuthHistoryStatus = status;
    },
    SET_FINE_STATUS(state, status) {
      state.fineStatus = status;
    },
    SET_REF_STATUS(state, status) {
      state.refStatus = status;
    },
    SET_SUPPORT_MESSAGES_STATUS(state, status) {
      state.supportMessagesStatus = status;
    },
    SAVE_STEP(state, field, id) {
      state.profiles = {
        ...state.profiles,
        [id]: {
          ...state.profiles[data.id],
          [field]: true,
        },
      };
    },
    SAVE_ERROR(state, error) {
      state.errorMessage = error;
    },
    SAVE_ERROR_DATA(state, data) {
      state.errorData = data;
    },
    SAVE_PROFILE(state, data) {
      state.profiles = {
        ...state.profiles, [data.id]: {
          ...data.profile,
          credentials: state.profiles[data.id]?.credentials,
          ref_system_connected_users_referal: state.profiles[data.id]?.ref_system_connected_users_referal,
          ref_system_connected_users_trainer: state.profiles[data.id]?.ref_system_connected_users_trainer,
        },
      };
      state.currentProfile = data.profile;
    },
    SAVE_PROFILE_SERVICES(state, data) {
      state.profiles = {
        ...state.profiles,
        [data.id]: {
          ...state.profiles[data.id],
          credentials: data.services,
        },
      };
    },
    SAVE_ABSENCES(state, data) {
      state.absences = data
    },
    UPDATE_USER(state, user) {
      if (!state.profiles[user.id]) return;
      state.profiles = {
        ...state.profiles,
        [user.id]: {
          ...state.profiles[user.id],
          role: user.role,
          profile: {
            ...state.profiles[user.id].profile,
            user: user,
            groups: user.groups,
            operator_groups: user.operator_groups,
          },
        },
      };
    },
    SAVE_COMMENT(state, commentData) {
      if (!state.profiles[commentData.id]) return;
      state.profiles = {
        ...state.profiles,
        [commentData.id]: {
          ...state.profiles[commentData.id],
          profile: {
            ...state.profiles[commentData.id].profile,
            history: [...state.profiles[commentData.id].profile.history, commentData.comment]
          }
        }
      };
    },
    SAVE_SERVICE(state, service) {
      if (!state.profiles[service.user]) return;
      state.profiles = {
        ...state.profiles,
        [service.user]: {
          ...state.profiles[service.user],
          credentials: updateList(state.profiles[service.user].credentials, service)
        }
      };
    },
    SAVE_SERVICE_NEW_USER(state, service) {
      state.profiles = {...state.profiles, [service.userId]: {credentials: service.data}};
    },
    REMOVE_SERVICE(state, service) {
      if (!state.profiles[service.user]) return;
      state.profiles = {
        ...state.profiles,
        [service.user]: {
          ...state.profiles[service.user],
          credentials: updateList(state.profiles[service.user].credentials, service, 'remove')
        }
      };
    },
    SAVE_DOSSIER(state, dossier) {
      if (!state.profiles[dossier.model]) return;
      state.profiles = {...state.profiles, [dossier.model]: {...state.profiles[dossier.model], dossier: dossier}};
    },
    SAVE_SHORT_PROFILE(state, profile) {
      state.shortProfiles = updateList(state.shortProfiles, profile, 'update-element');
    },
    SAVE_SHORT_PROFILE_TASKS_PAGE(state, profile) {
      state.shortProfiles = updateList(state.shortProfiles, profile, 'update-element-function', (oldProfile, newProfile) => ({
        ...oldProfile,
        tasks: {
          headers: newProfile.tasks.headers,
          list: [
            ...oldProfile.tasks.list,
            ...newProfile.tasks.list,
          ],
        },
      }));
    },
    SAVE_SHORT_PROFILE_AUTH_HISTORY_PAGE(state, profile) {
      state.shortProfiles = updateList(state.shortProfiles, profile, 'update-element-function', (oldProfile, newProfile) => ({
        ...oldProfile,
        authHistory: {
          headers: newProfile.authHistory.headers,
          list: [
            ...oldProfile.authHistory.list,
            ...newProfile.authHistory.list,
          ],
        },
      }));
    },
    UPDATE_USER_IN_SHORT_PROFILE(state, user) {
      state.shortProfiles = updateList(state.shortProfiles, {
        id: user.id,
        user: {
          ...user,
          groups: user.groups?.map(group => group.build_group) || [],
          main_group: user.main_group?.build_group || {},
        }
      }, 'update-element');
    },
    SAVE_RESOURCES_PROCESS(state, resourcesProcess) {
      state.resourcesProcess = resourcesProcess;
    },
    SET_ABSENCE_STATUS(state, status) {
      state.absenceStatus = status;
    },
    SAVE_WHITE_LIST(state, data) {
      state.profiles = {...state.profiles, [data.id]: {... state.profiles[data.id], whiteList: data.data}};
    },
    SAVE_WHITE_LIST_PAGE(state, data) {
      state.profiles = {...state.profiles, [data.id]: {...state.profiles[data.id], whiteList: [...state.profiles[data.id].whiteList, ...data.data]}};
    },
    SAVE_WHITE_LIST_HEADERS(state, headers) {
      state.whiteListHeaders = headers;
    },
    SAVE_USERS_FOR_WHITE_LIST(state, users) {
      state.usersForWhiteList = users;
    },
    SAVE_INCOMES_PROFITS(state, data) {
      state.incomeDetailsData = {
        ...state.incomeDetailsData,
        profits: data,
      };
    },
    SAVE_INCOMES(state, data) {
      state.incomeDetailsData = data;
    },
    CLEAR_INCOMES(state) {
      state.incomeDetailsData = {};
    },
    SAVE_USERS_FOR_WHITE_LIST_PAGE(state, users) {
      let usersForWhiteList = {...state.usersForWhiteList};
      for (let role in users) {
        usersForWhiteList[role] = usersForWhiteList[role] ? [...usersForWhiteList[role], ...users[role]] : users[role];
      }
      state.usersForWhiteList = usersForWhiteList;
    },
    SAVE_USERS_FOR_WHITE_LIST_HEADERS(state, headers) {
      state.usersForWhiteListHeaders = headers;
    },
    SAVE_USERS_FOR_WHITE_LIST_LAST_PAGE(state, users) {
      state.usersForWhiteListLastPage = users;
    },
    SAVE_WORKSHIFT_REPORTS(state, {data, query}) {
      state.workshiftReports = data;
    },
    SET_WORKWEEK(state, workweek) {
      state.workweek = workweek;
    },
    SAVE_WORKSHIFT_REPORT(state, report) {
      state.workshiftReports = updateList(state.workshiftReports, report);
    },
    SAVE_PAYMENT_INFO(state, { userId, data }) {
      if (!state.profiles[userId]) return;
      const { payment_info: existingPaymentInfo } = state.profiles[userId];
      const updatedPaymentInfo = [];
      let isNewElement = true;
      for (const paymentMethod of existingPaymentInfo) {
        if (paymentMethod.id === data.id) {
          updatedPaymentInfo.push({ ...paymentMethod, ...data });
          isNewElement = false;
        } else {
          updatedPaymentInfo.push({
            ...paymentMethod,
            is_main: data.is_main === true ? false : paymentMethod.is_main,
          });
        }
      }
      if (isNewElement) {
        updatedPaymentInfo.push(data);
      }
      state.profiles = {
        ...state.profiles,
        [userId]: {
          ...state.profiles[userId],
          payment_info: updatedPaymentInfo,
        },
      };
    },
    SAVE_PERSONAL_PERCENTAGES(state, info) {
      state.profiles = {
        ...state.profiles,
        [info.userId]: {
          ...state.profiles[info.userId],
          payment_percentages_data: info.data,
        },
      };
    },
    REMOVE_PAYMENT_INFO(state, { userId, paymentInfoId }) {
      if (state.profiles[userId] && state.profiles[userId].payment_info) {
        state.profiles[userId].payment_info = state.profiles[userId].payment_info.filter(info => info.id !== paymentInfoId);
      }
    },
    SAVE_SHORT_PROFILE_PAYMENT_INFO(state, info) {
      state.shortProfiles = updateList(state.shortProfiles, info, 'update-element-function', (oldProfile) => ({
        ...oldProfile,
        payment_info: oldProfile.payment_info ? updateList(oldProfile.payment_info, info.data) : [info.data],
      }));
    },
    REMOVE_SHORT_PROFILE_PAYMENT_INFO(state, data) {
        state.shortProfiles = updateList(state.shortProfiles, {id: data.userId}, 'update-element-function', (oldProfile) => {
            return {
              ...oldProfile,
              payment_info: oldProfile?.payment_info.filter(paymentInfo => paymentInfo.id !== data.paymentInfoId),
            };
        });
    },
    UPDATE_CURRENT_USERS(state, {users, clear}) {
      clear ? state.currentUsers = users : state.currentUsers = [...state.currentUsers, ...users];
    },
    CLEAR_CURRENT_USERS(state) {
      state.currentUsers = [];
    },
    CLEAR_WORKSHIFT_REPORTS(state) {
      state.errorMessage = "Что-то пошло не так";
      state.workshiftReports = [];
    },
    SAVE_PROFIT_USERS(state, users) {
      state.currentProfitUsers = users;
    },
    SAVE_WEEK_PROFIT(state, week_profit){
      state.weekProfit = week_profit;
    },
    SAVE_CURRENT_USERS_HEADERS(state, headers) {
      state.currentUsersHeaders = headers;
    },
    SAVE_REF_SYSTEM_CONNECTED_USERS(state, info) {
      state.profiles = {
        ...state.profiles,
        [info.params.userId]: {
          ...state.profiles[info.params.userId],
          [`ref_system_connected_users_${info.params.type}`]: info.users,
        },
      };
    },
    SAVE_FINES(state, fines) {
      state.currentFines = [...state.currentFines, ...fines];
    },
    SAVE_FINE(state, fine) {
      state.currentFines = updateList(state.currentFines, fine);
    },
    SAVE_PERSONAL_SCHEDULE(state, schedule) {
      state.personalSchedule = schedule;
    },
    SAVE_ALBUMS(state, data) {
      state.albums = data.albums;
    },
    SAVE_LAST_SATURDAY_PERSONAL_SCHEDULE(state, schedule) {
      if (Array.isArray(schedule))
        state.isNeedScheduleFilled = false;
      else
        state.isNeedScheduleFilled = schedule[Object.keys(schedule)[0]].length;
    },
    SAVE_FINES_HEADERS(state, headers) {
      state.currentFinesHeaders = headers;
    },
    ClEAR_FINES(state) {
      state.currentFines = [];
    },
    REMOVE_REF_SYSTEM_CONNECTED_USER(state, info) {
      const users = state.profiles[info.userId][`ref_system_connected_users_${info.type}`][info.groupId].filter(user => user.id !== info.refUserId);
      const profiles = {
        ...state.profiles,
        [info.userId]: {
          ...state.profiles[info.userId],
          [`ref_system_connected_users_${info.type}`]: {
            ...state.profiles[info.userId][`ref_system_connected_users_${info.type}`],
          },
        },
      };
      if (users.length) profiles[info.userId][`ref_system_connected_users_${info.type}`][info.groupId] = users;
      else delete profiles[info.userId][`ref_system_connected_users_${info.type}`][info.groupId];
      state.profiles = profiles;
    },
    SAVE_PAYMENTS(state, payments) {
      state.payments = [...state.payments, ...payments];
    },
    SAVE_PAYMENTS_HEADERS(state, headers) {
      state.paymentsHeaders = headers;
    },
    UPDATE_PAYMENT_IN_PAYMENTS(state, payment) {
      const monthIndex = state.payments.findIndex(month => month.month === payment.month);
      //TODO: add new month for possible payment creation
      if (monthIndex === -1) return;
      const payments = updateList(state.payments[monthIndex].payments, payment);
      state.payments = state.payments.map((paymentsMonth, index) => index === monthIndex ? {
        ...paymentsMonth,
        payments,
        sum: getRoundAmount(payments.reduce((sum, payment) => sum + payment.sum, 0)),
      } : paymentsMonth);
    },
    SAVE_PAYMENT(state, payment) {
      state.payment = payment;
    },
    SAVE_SUPPORT_MESSAGES(state, messages) {
      state.supportMessages = [...state.supportMessages, ...messages];
    },
    UPDATE_FIST_SUPPORT_MESSAGES(state, messages) {
      state.supportMessages = mergeLists({fistList: messages, secondList: state.supportMessages, prioritisedList: 'firsList'});
    },
    SAVE_SUPPORT_MESSAGES_HEADERS(state, headers) {
      state.supportMessagesHeaders = headers;
    },
    SAVE_SUPPORT_MESSAGE(state, message) {
      state.supportMessages = [message, ...state.supportMessages];
    },
  },
  actions: {
    async fetchProfile({commit, dispatch}, query) {
      if (!query.userId) return;
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/models/${query.userId}/profile`,
          params: {params: query.data}
        }, {name: 'profile/fetchProfile', params: query}, dispatch);
        commit('SAVE_PROFILE', {profile: data, id: query.userId});
        commit('SET_STATUS', 'profile-fetched');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchProfileServices({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/resource_credentials`,
          params: {params: query}
        }, {name: 'profile/fetchProfileServices', params: query}, dispatch);
        commit('SAVE_PROFILE_SERVICES', {services: data, id: query.user});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async commentProfile({commit, dispatch}, commentData) {
      try {
        commit('SET_STATUS', 'commenting');
        let {data} = await requestHandler({
          method: 'post',
          url: `/models/${commentData.id}/comments`,
          data: commentData.comment
        }, {name: 'profile/commentProfile', params: commentData}, dispatch);
        commit('SAVE_COMMENT', {id: commentData.id, comment: data});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUserService({commit, dispatch}, userId) {
      try {
        commit('SET_STATUS', 'fetching-service');
        let {data} = await requestHandler({
          method: 'get',
          url: `/resource_credentials?user=${userId}&status=active&pagination=false`
        }, {name: 'profile/fetchUserService', params: userId}, dispatch);
        commit('SAVE_SERVICE_NEW_USER', {userId, data});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createUserService({commit, dispatch}, service) {
      try {
        commit('SET_STATUS', 'creating-service');
        let {data} = await requestHandler({
          method: 'post',
          url: `/resource_credentials`,
          data: service
        }, {name: 'profile/createUserService', params: service}, dispatch);
        commit('SAVE_SERVICE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editUserService({commit, dispatch}, service) {
      commit('SET_STATUS', 'editing-service');
      return dispatch("editUserServiceBase", service);
    },
    async blockUserService({commit, dispatch}, service) {
      commit('SET_STATUS', 'blocking-service');
      return dispatch("editUserServiceBase", service);
    },
    async editUserServiceBase({commit, dispatch}, service) {
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/resource_credentials/${service.id}`,
          data: service
        }, {name: 'profile/editUserService', params: service}, dispatch);
        if (service.status === 'need_improved') commit('REMOVE_SERVICE', data);
        else commit('SAVE_SERVICE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async deleteUserService({commit, dispatch}, service) {
      commit('SET_STATUS', 'deleting-service');
      try {
        await requestHandler({
          method: 'delete',
          url: `/resource_credentials/${service.id}`
        }, {name: 'profile/deleteUserService', params: service}, dispatch);
        commit('REMOVE_SERVICE', service);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async editDossier({commit, dispatch}, dossier) {
      try {
        commit('SET_STATUS', 'editing-dossier');
        let {data} = await requestHandler({
          method: 'put',
          url: `/dossiers/${dossier.id}`,
          data: dossier
        }, {name: 'profile/editDossier', params: dossier}, dispatch);
        commit('SAVE_DOSSIER', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchShortProfile({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS', 'fetching');
        let {data} = await requestHandler({
          method: 'get',
          url: `/short_profile/${requestData.userId}`,
          params: {params: requestData.query}
        }, {name: 'profile/fetchShortProfile', params: requestData}, dispatch);
        commit('SAVE_SHORT_PROFILE', {...data, id: requestData.userId});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchShortProfileSchedule({commit, dispatch}, requestData) {
      try {
        commit('SET_STATUS', 'fetching');
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts`,
          params: {params: requestData.query}
        }, {name: 'profile/fetchShortProfileSchedule', params: requestData}, dispatch);
        commit('SAVE_SHORT_PROFILE', {schedule: data, id: requestData.userId});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async sendPersonalSchedule({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'sending-personal-schedule')
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/models/${requestData.id}/profile/workshifts`,
          data: requestData.data
        }, {name: 'profile/sendPersonalSchedule', params: requestData.data}, dispatch);
        commit('SAVE_PERSONAL_SCHEDULE', data);
        if (requestData.isNeedFilling)
          commit('SAVE_LAST_SATURDAY_PERSONAL_SCHEDULE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async fetchPersonalSchedule({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'fetching-personal-schedule');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/models/${requestData.id}/profile/workshifts`,
          params: {params: requestData}
        }, {name: 'profile/fetchPersonalSchedule', params: requestData}, dispatch);
        commit('SAVE_PERSONAL_SCHEDULE', data);
        if (requestData.isLastSaturday)
          commit('SAVE_LAST_SATURDAY_PERSONAL_SCHEDULE', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchShortProfileTasks({commit, dispatch}, requestData) {
      try {
        commit('SET_PROFILE_TASKS_STATUS', 'request');
        let { data } = await requestHandler({
          method: 'get',
          url: `/tasks/profile/${requestData.userId}`,
          params: {params: requestData.query}
        }, {name: 'profile/fetchShortProfileTasks', params: requestData}, dispatch);
        commit('SAVE_SHORT_PROFILE', {
          tasks: {
            headers: formatPaginationData(data),
            list: data.items,
          },
          id: requestData.userId
        });
        commit('SET_PROFILE_TASKS_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_PROFILE_TASKS_STATUS'});
      }
    },
    async fetchShortProfileTasksPage({commit, dispatch}, requestData) {
      try {
        commit('SET_PROFILE_TASKS_STATUS', 'request-page');
        let { data } = await requestHandler({
          method: 'get',
          url: `/tasks/profile/${requestData.userId}`,
          params: {params: requestData.query}
        }, {name: 'profile/fetchShortProfileTasks', params: requestData}, dispatch);
        commit('SAVE_SHORT_PROFILE_TASKS_PAGE', {
          tasks: {
            headers: formatPaginationData(data),
            list: data.items,
          },
          id: requestData.userId
        });
        commit('SET_PROFILE_TASKS_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_PROFILE_TASKS_STATUS'});
      }
    },
    async fetchShortProfileAuthHistory({commit, dispatch}, query) {
      commit('SET_PROFILE_AUTH_HISTORY_STATUS', 'request');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/authorizations`,
          params: {params: query},
        }, {name: 'profile/fetchShortProfileAuthHistory', params: query}, dispatch);
        commit('SAVE_SHORT_PROFILE', {
          authHistory: {
            headers: formatPaginationData(data),
            list: data.items,
          },
          id: query['user.id'],
        });
        commit('SET_PROFILE_AUTH_HISTORY_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_PROFILE_AUTH_HISTORY_STATUS'});
      }
    },
    async fetchShortProfileAuthHistoryPage({commit, dispatch}, query) {
      try {
        commit('SET_PROFILE_AUTH_HISTORY_STATUS', 'request-page');
        let { data } = await requestHandler({
          method: 'get',
          url: `/authorizations`,
          params: {params: query}
        }, {name: 'profile/fetchShortProfileAuthHistoryPage', params: query}, dispatch);
        commit('SAVE_SHORT_PROFILE_AUTH_HISTORY_PAGE', {
          authHistory: {
            headers: formatPaginationData(data),
            list: data.items,
          },
          id: query['user.id'],
        });
        commit('SET_PROFILE_AUTH_HISTORY_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_PROFILE_AUTH_HISTORY_STATUS'});
      }
    },
    async addResources({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'adding-resources');
      try {
        await requestHandler({
          method: 'post',
          url: `/resources/registration/${requestData.userId}`,
          data: requestData.data
        }, {name: 'profile/addResources', params: requestData}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async fetchResourcesProcess({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/resources/process/${query.id}`
        }, {name: 'profile/fetchResourcesProcess', params: query}, dispatch);
        commit('SAVE_RESOURCES_PROCESS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchAbsences({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/absences`,
          params: {params: query}
        }, {name: 'profile/fetchAbsences', params: query}, dispatch);
        commit('SAVE_ABSENCES', data);
        commit('SET_STATUS', '');
        return data;
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createAbsence({commit, dispatch}, absence) {
      commit('SET_ABSENCE_STATUS', '');
      try {
        await requestHandler({method: 'post', url: `/absences`, data: absence}, {
          name: 'profile/createAbsence',
          params: absence
        }, dispatch);
        commit('SET_ABSENCE_STATUS', 'created');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR',
          errorMessage: error?.response?.data?.detail,
          statusMutation: 'SET_ABSENCE_STATUS',
        });
      }
    },
    async deleteAbsence({commit, dispatch}, absenceId) {
      commit('SET_ABSENCE_STATUS', '');
      try {
        await requestHandler({method: 'delete', url: `/absences/${absenceId}`}, {
          name: 'profile/deleteAbsence',
          params: absenceId
        }, dispatch);
        commit('SET_ABSENCE_STATUS', 'deleted');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR',
          errorMessage: error?.response?.data?.detail,
          statusMutation: 'SET_ABSENCE_STATUS',
        });
      }
    },
    async editAbsence({commit, dispatch}, query) {
      commit('SET_ABSENCE_STATUS', '');
      try {
        await requestHandler({
          method: 'put',
          url: `/absences/${query.id}`,
          data: query.absence
        }, {name: 'profile/editAbsence', params: query}, dispatch);
        commit('SET_ABSENCE_STATUS', 'edited');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR',
          errorMessage: error?.response?.data?.detail,
          statusMutation: 'SET_ABSENCE_STATUS',
        });
      }
    },
    async fetchIncomeDetails({commit, dispatch}, params) {
      commit('SET_STATUS', 'fetching');
      commit('CLEAR_INCOMES');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/models/${params.id}/profile/workshifts/${params.shift_id}`,
        }, {name: 'profile/fetchIncomeDetails', params}, dispatch);
        commit('SAVE_INCOMES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editIncomes({commit, dispatch}, params) {
      commit('SET_STATUS', 'editing-incomes');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/models/${params.id}/profile/workshifts/${params.shift_id}`,
          data: params.profits,
        }, {name: 'profile/editIncomes', params}, dispatch);
        commit('SAVE_INCOMES_PROFITS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async fetchWhiteList({commit, dispatch}, params) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/white_list/${params.id}`,
          params: {params: params.query},
        }, {name: 'profile/fetchWhiteList', params}, dispatch);
        commit((params.query?.page && (params.query.page !== 1)) ? 'SAVE_WHITE_LIST_PAGE' : 'SAVE_WHITE_LIST', {data: data.items, id: params.id});
        commit('SAVE_WHITE_LIST_HEADERS', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchUsersForWhiteList({commit, dispatch}, params) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/white_list/${params.id}/users`,
          params: {params: params.query},
        }, {name: 'profile/fetchUsersForWhiteList', params}, dispatch);
        commit((params.query?.page && (params.query.page !== 1)) ? 'SAVE_USERS_FOR_WHITE_LIST_PAGE' : 'SAVE_USERS_FOR_WHITE_LIST', data);
        commit('SAVE_USERS_FOR_WHITE_LIST_LAST_PAGE', data.items);
        commit('SAVE_USERS_FOR_WHITE_LIST_HEADERS', formatPaginationData(data));
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async editWhiteList({commit, dispatch}, params) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/white_list/${params.id}`,
          data: params.data,
        }, {name: 'profile/editWhiteList', params}, dispatch);
        // commit('SAVE_WHITE_LIST', {data, id: params.id});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async removeUser({commit, dispatch}, id) {
      commit('SET_STATUS', 'removing');
      try {
        await requestHandler({
          method: 'delete',
          url: `/users/${id}`,
        }, {name: 'profile/removeUser', id}, dispatch);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR', errorMessage: error?.response?.data?.detail});
      }
    },
    async fetchWorkshiftReports({commit, state, dispatch}, query) {
      commit('SET_STATUS', 'fetching-reports');
      commit('SET_WORKWEEK', query.workweek);
      try {
          let {data} = await requestHandler({
            method: 'get',
            url: `/workshifts_reports/reports?pagination=false`,
            params: {params: query}
          }, {name: 'profile/fetchWorkshiftReports', params: query}, dispatch);
        if (state.workweek === query.workweek) {
          commit('SAVE_WORKSHIFT_REPORTS', {data, query});
          commit('SET_STATUS', '');
        }
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            if (state.workweek === query.workweek) {
              commit('CLEAR_WORKSHIFT_REPORTS', query);
              commit('SET_STATUS', 'error');
            }
          },
        });
      }
    },
    async fetchWorkshiftReport({commit, dispatch}, reportId) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/workshifts_reports/reports/${reportId}`,
        }, {name: 'profile/fetchWorkshiftReport', params: reportId}, dispatch);
        commit('SAVE_WORKSHIFT_REPORT', data);
        commit('SET_STATUS', '');
        return data;
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },

    async createPaymentInfo({commit, dispatch}, params) {
      commit('SET_PAYMENT_STATUS', 'creating-payment-info');
      commit('SAVE_ERROR', '');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/user/${params.userId}/payment_information`,
          data: params.data,
        }, {name: 'profile/createPaymentInfo', params}, dispatch);
        commit('SAVE_PAYMENT_INFO', { data, userId: params.userId });
        commit('SAVE_SHORT_PROFILE_PAYMENT_INFO', {data, id: params.userId});
        commit('SET_PAYMENT_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR_DATA',
          errorMessage: error?.response?.data,
          statusMutation: 'SET_PAYMENT_STATUS',
        });
      }
    },
    async editPaymentInfo({commit, dispatch}, params) {
      commit('SET_PAYMENT_STATUS', 'editing-payment-info');
      commit('SAVE_ERROR', '');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/user/${params.userId}/payment_information/${params.data.id}`,
          data: params.data,
        }, {name: 'profile/editPaymentInfo', params}, dispatch);
        commit('SAVE_PAYMENT_INFO', { data, userId: params.userId });
        commit('SAVE_SHORT_PROFILE_PAYMENT_INFO', {data, id: params.userId});
        commit('SET_PAYMENT_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR_DATA',
          errorMessage: error?.response?.data,
          statusMutation: 'SET_PAYMENT_STATUS',
        });
      }
    },
    async deletePaymentInfo({commit, dispatch}, params) {
      commit('SET_PAYMENT_STATUS', 'deleting-payment-info');
      commit('SAVE_ERROR', '');
      try {
        await requestHandler({
          method: 'delete',
          url: `user/${params.userId}/payment_information/${params.id}`,
        }, {name: 'profile/deletePaymentInfo', params}, dispatch);
        commit('REMOVE_PAYMENT_INFO', { userId: params.userId, paymentInfoId: params.id });
        commit('REMOVE_SHORT_PROFILE_PAYMENT_INFO', { userId: params.userId, paymentInfoId: params.id });
        commit('SET_PAYMENT_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR',
          errorMessage: error?.response?.data?.detail,
          statusMutation: 'SET_PAYMENT_STATUS',
        });
      }
    },
    async editPersonalPercentages({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'editing-personal-percentages');
      commit('SAVE_ERROR', '');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/user/${requestData.id}/payment_percentages`,
          data: requestData.data,
        }, {name: 'profile/editPersonalPercentages', requestData}, dispatch);
        commit('SAVE_PERSONAL_PERCENTAGES', {data, userId: requestData.id});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_ERROR_DATA', errorMessage: error?.response?.data});
      }
    },
    async fetchRefSystemConnectedUsers({commit, dispatch}, params) {
      commit('SET_STATUS', 'fetching');
      try {
        const {data} = await requestHandler({
          method: 'get',
          url: `/users/${params.userId}/ref_system_connections?type=${params.type}`,
        }, {name: 'profile/fetchRefSystemConnectedUsers', params}, dispatch);
        commit('SAVE_REF_SYSTEM_CONNECTED_USERS', {users: data, params});
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchCurrentUsers({ commit, dispatch }, filters) {
      if (!filters.page || (filters.page === 1)) commit('CLEAR_CURRENT_USERS');
      commit('SET_USER_STATUS', 'fetching');
      try {
        let { data } = await requestHandler({
          method: 'get',
          url: `/users`,
          params: { params: filters },
        }, { name: 'profile/fetchCurrentUsers', params: filters }, dispatch);
        commit('SET_USER_STATUS', '');
        const clear = !filters.page || filters.page === 1;
        commit('UPDATE_CURRENT_USERS', { users: data.items, clear });
        commit('SAVE_CURRENT_USERS_HEADERS', formatPaginationData(data));
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_USER_STATUS'});
      }
    },
    async fetchCurrentUsersProfit({commit, dispatch}, filters){
      commit('SET_PROFIT_STATUS', 'fetching');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users/${filters.userId}/ref_profits`,
          params: {params: filters}
        }, {name: 'profile/fetchCurrentUsersProfit', params: filters}, dispatch);
        commit('SET_PROFIT_STATUS', '');
        commit('SAVE_PROFIT_USERS', data?.items);
        commit('SAVE_WEEK_PROFIT', data?.week_profit);
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_PROFIT_STATUS'});
      }
    },
    async addRefSystemConnectedUsers({ commit, dispatch }, params) {
      commit('SET_REF_STATUS', 'adding-refs');
      try {
        await requestHandler({
          method: 'post',
          url: `/users/${params.userId}/ref_system_connections`,
          data: { users: params.users, type: params.type }
        }, { name: 'profile/addRefSystemConnectedUsers', params: params }, dispatch);
        commit('SET_REF_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_REF_STATUS'});
      }
    },
    async editRefSystemConnectedUsersPercentages({commit, dispatch}, requestData) {
      commit('SET_REF_STATUS', 'editing-refs');
      try {
        const {data} = await requestHandler({
          method: 'put',
          url: `/users/${requestData.userId}/ref_system_connections/persentages`,
          data: requestData.data,
        }, {name: 'profile/editRefSystemConnectedUsersPercentages', requestData}, dispatch);
        commit('SAVE_REF_SYSTEM_CONNECTED_USERS', {users: data, params: {userId: requestData.userId, type: requestData.data.type}});
        commit('SET_REF_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_REF_STATUS'});
      }
    },
    async deleteRefSystemConnectedUsers({commit, dispatch}, params) {
      commit('SET_REF_STATUS', 'deleting-refs');
      try {
        await requestHandler({
          method: 'delete',
          url: `/users/${params.userId}/ref_system_connections/${params.refUserId}?type=${params.type}`,
        }, {name: 'profile/deleteRefSystemConnectedUsers', params}, dispatch);
        commit('REMOVE_REF_SYSTEM_CONNECTED_USER', params);
        commit('SET_REF_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_REF_STATUS'});
      }
    },
    async fetchCurrentFines({commit, dispatch}, params){
      commit('SET_FINE_STATUS', 'fetching-fine');
      if (!params.page || (params.page === 1)) commit('ClEAR_FINES');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users/${params.userId}/fines`,
          params: {params: params}
        }, {name: 'profile/fetchCurrentFines', params: params}, dispatch);
        commit('SET_FINE_STATUS', '');
        commit('SAVE_FINES', data.items);
        commit('SAVE_FINES_HEADERS', formatPaginationData(data));
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_FINE_STATUS'});
      }
    },
    async createFine({commit, dispatch}, params) {
      commit('SET_FINE_STATUS', 'creating-fine');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/users/${params.userId}/fines`,
          data: params.data,
        }, {name: 'profile/createFine', params}, dispatch);
        commit('SET_FINE_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR_DATA',
          errorMessage: error?.response?.data,
          statusMutation: 'SET_FINE_STATUS',
        });
      }
    },
    async editFine({commit, dispatch}, params) {
      commit('SET_FINE_STATUS', 'editing-fine');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/users/${params.userId}/fines/${params.id}`,
          data: params.data,
        }, {name: 'profile/editFine', params}, dispatch);
        commit('SAVE_FINE', data);
        commit('SET_FINE_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR_DATA',
          errorMessage: error?.response?.data,
          statusMutation: 'SET_FINE_STATUS',
        });
      }
    },
    async cancelFine({commit, dispatch}, params) {
      commit('SET_FINE_STATUS', 'canceling-fine');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/users/${params.userId}/fines/${params.id}/cancel`,
          data: params.data,
        }, {name: 'profile/cancelFine', params}, dispatch);
        commit('SAVE_FINE', data);
        commit('SET_FINE_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR',
          errorMessage: error?.response?.data?.detail,
          statusMutation: 'SET_FINE_STATUS',
        });
      }
    },
    async fetchPayments({commit, dispatch, state}, params){
      //TODO: rework for payments in other profiles
      if (state.payments.length && !params.cursor) return;
      commit('SET_STATUS', 'fetching-payments');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/users/${params.userId}/payments`,
          params: {params: params}
        }, {name: 'profile/fetchPayments', params: params}, dispatch);
        commit('SET_STATUS', '');
        commit('SAVE_PAYMENTS', data.items);
        commit('SAVE_PAYMENTS_HEADERS', data.pagination);
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchPayment({commit, dispatch}, paymentId){
      commit('SET_STATUS', 'fetching-payment');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/payments/${paymentId}`
        }, {name: 'profile/fetchPayments', params: paymentId}, dispatch);
        commit('SAVE_PAYMENT', data);
        //TODO: check if same user
        commit('UPDATE_PAYMENT_IN_PAYMENTS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchSupportMessages({commit, dispatch, state}, params){
      const isUpdatingStart = state.supportMessages.length && !params?.cursor;
      commit('SET_SUPPORT_MESSAGES_STATUS', 'fetching-support-messages');
      try {
        const {data} = await requestHandler({
          method: 'get',
          url: '/support_messages',
          params: {params: params}
        }, {name: 'profile/fetchSupportMessages', params: params}, dispatch);
        commit(isUpdatingStart ? 'UPDATE_FIST_SUPPORT_MESSAGES' : 'SAVE_SUPPORT_MESSAGES', data.items);
        commit('SAVE_SUPPORT_MESSAGES_HEADERS', data.pagination);
        commit('SET_SUPPORT_MESSAGES_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error, statusMutation: 'SET_SUPPORT_MESSAGES_STATUS'});
      }
    },
    async sendSupportMessage({commit, dispatch}, payload) {
      commit('SET_SUPPORT_MESSAGES_STATUS', 'creating-message');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: '/support_messages',
          data: payload,
        }, {name: 'profile/sendSupportMessage', params: payload}, dispatch);
        commit('SAVE_SUPPORT_MESSAGE', data);
        commit('SET_SUPPORT_MESSAGES_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
          isErrorMessageSavable: true,
          errorMessageMutation: 'SAVE_ERROR_DATA',
          errorMessage: error?.response?.data,
          statusMutation: 'SET_SUPPORT_MESSAGES_STATUS',
        });
      }
    },
    async setUserPin({commit, dispatch}) {
      commit('SET_STATUS', 'setting-pin');
      try {
        await requestHandler({
          method: 'post',
          url: '/me/pin',
        }, {name: 'profile/setUserPin'}, dispatch);
        dispatch('auth/logoutUser', {}, {root: true});
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
        });
      }
    },
    async deleteUserPin({commit, dispatch}) {
      commit('SET_STATUS', 'deleting-pin');
      try {
        await requestHandler({
          method: 'delete',
          url: '/me/pin',
        }, {name: 'profile/deleteUserPin'}, dispatch);
        commit('SET_STATUS', '');
        commit('auth/SAVE_HAS_PIN', false, {root: true});
      } catch (error) {
        responseErrorHandler({
          commit,
          error,
        });
      }
    },
    async fetchAlbums({commit, dispatch}) {
      commit('SET_STATUS', 'fetching-albums');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/materials/albums`,
        }, {name: 'profile/fetchAlbums'}, dispatch);
        commit('SAVE_ALBUMS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async sendModelSurvey({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        await requestHandler({method: 'post', url: `/worksheet`, data: query},
            {name: 'profile/sendModelSurvey', params: query}, dispatch);
        commit('SAVE_STEP', has_worksheet);
        commit('SET_STATUS', 'survey-sent');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'survey-not-saved'});
      }
    },
    async sendModelMaterials({ commit, dispatch }, query) {
      commit('SET_STATUS', 'request');
      try {
        await requestHandler({method: 'post', url: `/materials`, data: query},
            {name: 'profile/sendModelSurvey', params: query}, dispatch);
        commit('SAVE_STEP', has_materials);
        commit('SET_STATUS', 'survey-sent');
      } catch (error) {
        responseErrorHandler({commit, error, errorStatus: 'materials-not-saved'});
      }
    },
  }
}
