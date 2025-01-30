import {updateList, requestHandler, formatPaginationData, responseErrorHandler} from "@/tools/tools";

export default {
  namespaced: true,
  state: {
    taskStatus: '',
    taskStatusCurrentTasks: '',
    mainStatus: '',
    requestTimestamp: 0,
    currentTasks: [],
    task: {},
    currentTask: {},
    tasksPagination: {},
    comment: {},
    fieldsErrors: [],
    // allTasksQuantity: 0,
    tasksQuantity: {},
    postponedTasksQuantity: {},
    badgeTasksQuantity: 0,
    busyDates: [],
    requiredAttachmentsForInterviewTasks: [],
  },
  mutations: {
    SET_STATUS(state, status) {
      state.taskStatus = status;
    },
    SET_STATUS_CURRENT_TASK(state, status) {
      state.taskStatusCurrentTasks = status;
    },
    SET_MAIN_STATUS(state, status) {
      state.mainStatus = status;
    },
    SET_TIMESTAMP(state, timestamp) {
      state.requestTimestamp = timestamp;
    },
    SAVE_CURRENT_TASKS(state, tasks) {
      state.currentTasks = tasks;
    },
    /*SAVE_ALL_TASKS_QUANTITY(state, quantity) {
        state.allTasksQuantity = quantity && parseInt(quantity) || 0;
    },*/
    SAVE_TASKS_QUANTITY(state, data) {
      let tasksQuantity = {};

      data.forEach(item => {
        tasksQuantity[item.type] = {
          count: +item.count,
          count_author: +item.count_author,
          count_user: +item.count_user
        }
      });

      state.tasksQuantity = tasksQuantity;
    },
    SAVE_BADGE_TASKS_QUANTITY(state, data) {
      state.badgeTasksQuantity = data[0]?.count;
    },
    SAVE_POSTPONED_TASKS_QUANTITY(state, data) {
      let tasksQuantity = {};

      data.forEach(item => {
        tasksQuantity[item.type] = +item.count;
      });

      state.postponedTasksQuantity = tasksQuantity;
    },
    SAVE_TASK(state, task) {
      state.task = task
    },
    SAVE_PAGINATION(state, pagination) {
      state.tasksPagination = pagination;
    },
    EDIT_TASKS(state, task) {
      let tasksList = [...state.currentTasks],
          oldTaskIndex = tasksList.findIndex((oldTask) => {
            return oldTask.id === task.id
          })
      if (oldTaskIndex !== -1) tasksList[oldTaskIndex] = task
      else if (tasksList.length < 10) tasksList.push(task)
      state.currentTasks = tasksList
    },
    DELETE_TASK(state, task) {
      let taskCopyList = [...state.currentTasks],
          deletedtaskIndex = taskCopyList.findIndex((deletedTask) => {
            return deletedTask.id === task.id
          });
      if (deletedtaskIndex === -1) return;
      taskCopyList.splice(deletedtaskIndex, 1);
      state.currentTasks = taskCopyList;
    },
    SAVE_CURRENT_TASK(state, currentTask) {
      state.currentTask = currentTask
    },
    SAVE_FIELDS_ERRORS(state, errors) {
      state.fieldsErrors = errors;
    },
    SAVE_BUSY_DATES(state, dates) {
      state.busyDates = dates.map(date => new Date(date?.slice(0, -6)));
    },
    SAVE_REQUIRED_ATTACHMENTS_FOR_INTERVIEW_TASKS(state, types) {
      state.requiredAttachmentsForInterviewTasks = types;
    },
  },
  actions: {
    async fetchTasks({commit, dispatch, state}, query) {
      commit('SET_STATUS', 'request-list');
      commit('SET_MAIN_STATUS', 'request');
      try {
        let timestamp = new Date().getTime();
        commit('SET_TIMESTAMP', timestamp);
        let { data } = await requestHandler({
          method: 'get',
          url: query.task === 'my_tasks' ? '/tasks/my' : `/${query.task}_tasks`,
          params: {params: query.filters}
        }, {name: 'tasks/fetchTasks', params: query}, dispatch);
        if (timestamp !== state.requestTimestamp) return;
        commit('SAVE_CURRENT_TASKS', data.items);
        commit('SAVE_PAGINATION', formatPaginationData(data));
        commit('SET_STATUS', '');
        commit('SET_MAIN_STATUS', '');
      } catch (error) {
        responseErrorHandler({
          error,
          customHandler: () => {
            commit('SET_STATUS', 'error');
            commit('SET_MAIN_STATUS', 'error');
          },
        });
      }
    },
    async getTasksQuantity({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/dictionary/counter_tasks`,
          params: {params: query}
        }, {name: 'tasks/getTasksQuantity', params: query}, dispatch);
        commit('SAVE_TASKS_QUANTITY', data);
        if (query.status === 'active') commit('SAVE_BADGE_TASKS_QUANTITY', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchCurrentTask({commit, dispatch}, id) {
      commit('SET_STATUS', 'request');
      commit('SET_STATUS_CURRENT_TASK', 'request');
      try {
        let {data} = await requestHandler({method: 'get', url: `/tasks/${id}`}, {
          name: 'tasks/fetchCurrentTask',
          params: id
        }, dispatch);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', 'task-created');
        commit('SET_STATUS_CURRENT_TASK', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async createTaskCustom({commit, dispatch}, query) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/custom_tasks`,
          data: query
        }, {name: 'tasks/createTaskCustom', params: query}, dispatch);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', 'task-created');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async createTaskCallCenter({commit, dispatch}, query) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/call_center_tasks`,
          data: query
        }, {name: 'tasks/createTaskCallCenter', params: query}, dispatch);
        commit('SAVE_TASK', data);
        commit('SET_STATUS', 'task-created');
        dispatch('hr/getCurrentVacancy', query.vacancy, {root: true});
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async createTaskInterview({commit, dispatch}, query) {
      commit('SET_STATUS', 'creating');
      try {
        let {data} = await requestHandler({
          method: 'post',
          url: `/interview_tasks`,
          data: query
        }, {name: 'tasks/createTaskInterview', params: query}, dispatch);
        commit('SAVE_TASK', data);
        // commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', 'task-created');
        dispatch('hr/getCurrentVacancy', query.vacancy, {root: true});
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async changeTaskCallCenterToInterview({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/tasks/${requestData.id}`,
          data: {
            status: 'completed',
            next: {user: requestData.user, planned_start_at: requestData.planned_start_at},
            communication_id: requestData.communication_id
          }
        }, {name: 'tasks/changeTaskCallCenterToInterview', params: requestData}, dispatch);
        commit('SAVE_TASK', data);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', 'task-created');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async changeTaskArchive({commit, dispatch}, requestData) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/tasks/${requestData.id}`,
          data: {status: 'archive', ...requestData}
        }, {name: 'tasks/changeTaskArchive', params: requestData}, dispatch);
        // commit('SAVE_TASK', data);
        commit('DELETE_TASK', requestData);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', 'task-created');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async editTask({commit, dispatch}, task) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/tasks/${task.id}`,
          data: task
        }, {name: 'tasks/editTask', params: task}, dispatch);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', task.complete_at ? 'task-later' : '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async editTaskSupport({commit, dispatch}, task) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/support_task/${task.id}`,
          data: task
        }, {name: 'tasks/editTaskSupport', params: task}, dispatch);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', task.complete_at ? 'task-later' : '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async editRevisionNewTask({commit, dispatch}, task) {
      commit('SET_STATUS', 'editing');
      try {
        let {data} = await requestHandler({
          method: 'put',
          url: `/tasks/revision_new/${task.id}`,
          data: task
        }, {name: 'tasks/editRevisionNewTask', params: task}, dispatch);
        commit('SAVE_CURRENT_TASK', data);
        commit('SET_STATUS', task.complete_at ? 'task-later' : '');
      } catch (error) {
        responseErrorHandler({commit, error, isErrorMessageSavable: true, errorMessageMutation: 'SAVE_FIELDS_ERRORS', errorMessage: error?.response?.data?.violations});
      }
    },
    async deleteTask({commit, dispatch}, task) {
      commit('SET_STATUS', 'deleting');
      try {
        await requestHandler({method: 'delete', url: `/tasks/${task.id}`}, {
          name: 'tasks/deleteTask',
          params: task
        }, dispatch);
        commit('EDIT_TASKS', task);
        commit('SET_STATUS', 'deleted');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async fetchBusyDates({commit, dispatch}, query) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/tasks/busy_date/${query.type}`,
          params: {params: query.params}
        }, {name: 'tasks/getBusyDates', params: query}, dispatch);
        commit('SAVE_BUSY_DATES', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
    async getRequiredAttachmentsForInterviewTasks({state, dispatch}) {
      if (state.requiredAttachmentsForInterviewTasks.length) return;
      return dispatch('fetchRequiredAttachmentsForInterviewTasks');
    },
    async fetchRequiredAttachmentsForInterviewTasks({commit, dispatch}) {
      commit('SET_STATUS', 'request');
      try {
        let {data} = await requestHandler({
          method: 'get',
          url: `/interview_tasks/attachments_required`,
        }, {name: 'tasks/fetchRequiredAttachmentsForInterviewTasks'}, dispatch);
        commit('SAVE_REQUIRED_ATTACHMENTS_FOR_INTERVIEW_TASKS', data);
        commit('SET_STATUS', '');
      } catch (error) {
        responseErrorHandler({commit, error});
      }
    },
  }
}
