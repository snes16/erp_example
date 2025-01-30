import moment from "moment";
import axios from "axios";
import * as clipboardJS from "clipboard-polyfill/text";

export const isMobile = /Mobi/i.test(window.navigator.userAgent);
export const emailDomain = '@exlexx.com';
import router from '../Routes';

export const telegramIcon = '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">\n' +
  '<path d="M8 0C3.58169 0 0 3.58169 0 8C0 12.4183 3.58169 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58169 12.4183 0 8 0Z"/>\n' +
  '<path d="M11.8934 4.60071L10.4645 11.805C10.4645 11.805 10.2646 12.3046 9.71508 12.0648L6.4177 9.53683L5.2187 8.95733L3.20033 8.27783C3.20033 8.27783 2.89058 8.16796 2.86058 7.92815C2.83058 7.68833 3.21033 7.55846 3.21033 7.55846L11.2338 4.41096C11.2338 4.41096 11.8933 4.12121 11.8933 4.60084" fill="white"/>\n' +
  '<path d="M6.1634 11.7245C6.1634 11.7245 6.06715 11.7155 5.94715 11.3357C5.82734 10.9561 5.21777 8.95769 5.21777 8.95769L10.0639 5.88019C10.0639 5.88019 10.3437 5.71031 10.3337 5.88019C10.3337 5.88019 10.3836 5.91019 10.2337 6.05006C10.0839 6.19 6.42684 9.47731 6.42684 9.47731" fill="#D2E5F1"/>\n' +
  '<path d="M7.68175 10.5064L6.37756 11.6955C6.37756 11.6955 6.27556 11.7729 6.16406 11.7244L6.41381 9.51562" fill="#B5CFE4"/>\n' +
  '</svg>';

export const finAdminIcon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
  '<g clip-path="url(#clip0_6069_62395)">\n' +
  '<rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill="#E9F7F4"/>\n' +
  '<path d="M7.35992 13.44V2.16003H8.34392V13.44H7.35992ZM7.73192 12.12C7.07592 12.12 6.44792 12.028 5.84792 11.844C5.24792 11.652 4.77192 11.408 4.41992 11.112L4.95992 9.90003C5.29592 10.164 5.71192 10.384 6.20792 10.56C6.70392 10.736 7.21192 10.824 7.73192 10.824C8.17192 10.824 8.52792 10.776 8.79992 10.68C9.07192 10.584 9.27192 10.456 9.39992 10.296C9.52792 10.128 9.59192 9.94003 9.59192 9.73203C9.59192 9.47603 9.49992 9.27203 9.31592 9.12003C9.13192 8.96003 8.89192 8.83603 8.59592 8.74803C8.30792 8.65203 7.98392 8.56403 7.62392 8.48403C7.27192 8.40403 6.91592 8.31203 6.55592 8.20803C6.20392 8.09603 5.87992 7.95603 5.58392 7.78803C5.29592 7.61203 5.05992 7.38003 4.87592 7.09203C4.69192 6.80403 4.59992 6.43603 4.59992 5.98803C4.59992 5.53203 4.71992 5.11603 4.95992 4.74003C5.20792 4.35603 5.57992 4.05203 6.07592 3.82803C6.57992 3.59603 7.21592 3.48003 7.98392 3.48003C8.48792 3.48003 8.98792 3.54403 9.48392 3.67203C9.97992 3.80003 10.4119 3.98403 10.7799 4.22403L10.2879 5.43603C9.91192 5.21203 9.52392 5.04803 9.12392 4.94403C8.72392 4.83203 8.33992 4.77603 7.97192 4.77603C7.53992 4.77603 7.18792 4.82803 6.91592 4.93203C6.65192 5.03603 6.45592 5.17203 6.32792 5.34003C6.20792 5.50803 6.14792 5.70003 6.14792 5.91603C6.14792 6.17203 6.23592 6.38003 6.41192 6.54003C6.59592 6.69203 6.83192 6.81203 7.11992 6.90003C7.41592 6.98803 7.74392 7.07603 8.10392 7.16403C8.46392 7.24403 8.81992 7.33603 9.17192 7.44003C9.53192 7.54403 9.85592 7.68003 10.1439 7.84803C10.4399 8.01604 10.6759 8.24403 10.8519 8.53203C11.0359 8.82003 11.1279 9.18403 11.1279 9.62403C11.1279 10.072 11.0039 10.488 10.7559 10.872C10.5159 11.248 10.1439 11.552 9.63992 11.784C9.13592 12.008 8.49992 12.12 7.73192 12.12Z" fill="#21AE8C"/>\n' +
  '<rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#21AE8C"/>\n' +
  '</g>\n' +
  '<defs>\n' +
  '<clipPath id="clip0_6069_62395">\n' +
  '<rect width="16" height="16" fill="white"/>\n' +
  '</clipPath>\n' +
  '</defs>\n' +
  '</svg>\n';

export function prepareShortProfileData(data) {
  return {
    ...data,
    profile: {...data.profile, user: {...data.profile.user, groups: data.profile.groups}}
  }
}

export function updateList(list, element, type = 'update', func) {
  let newList = list ? [...list] : [],
    id = typeof element === 'object' ? element.id : element,
    oldElementKey = newList.findIndex(currentElement => currentElement.id === id);

  switch (type) {
    case 'update':
      if (oldElementKey === -1) newList.push(element);
      else newList[oldElementKey] = element;
      break;
    case 'update-element':
      if (oldElementKey === -1) newList.push(element);
      else newList[oldElementKey] = {
        ...newList[oldElementKey],
        ...element,
      };
      break;
    case 'update-element-function':
      if (oldElementKey !== -1)
        newList[oldElementKey] = func(newList[oldElementKey], element);
      break;
    case 'remove':
      if (oldElementKey !== -1) newList.splice(oldElementKey, 1);
  }

  return newList;
}

export function mergeLists({fistList = [], secondList = [], prioritisedList = 'secondList', idField = 'id'}) {
  const result = [...fistList];
  secondList.forEach(item => {
    const sameItemIndex = fistList.findIndex(currentItem => currentItem[idField] === item[idField]);
    if (sameItemIndex === -1) result.push(item);
    else if (prioritisedList === 'secondList') result[sameItemIndex] = item;
  });
  return result;
}

export function updateListRecursively(list, element, type = 'update') {
  if (!element.parent) return updateList(list, element, type);
  return updateListRecursivelyStep(list, element, type);
}

function updateListRecursivelyStep(list, element, type) {
  return list.map((currentElement) => {
    if (currentElement.id === element.parent.id) return {
      ...currentElement,
      children: updateList(currentElement.children, element, type)
    };
    else if (currentElement.children && currentElement.children.length) return {
      ...currentElement,
      children: updateListRecursivelyStep(currentElement.children, element, type)
    };
    return currentElement;
  });
}

export function editRoomRecursively(groups, room, type = 'update') {
  return groups.map((currentGroup) => {
    if (currentGroup.id === room.group) return {...currentGroup, rooms: updateList(currentGroup.rooms, room, type)};
    else if (currentGroup.children && currentGroup.children.length) return {
      ...currentGroup,
      children: editRoomRecursively(currentGroup.children, room, type)
    };
    return currentGroup;
  });
}

export function editUserRecursively(groups, user, type = 'update') {
  // console.log('editUserRecursively', groups, user);
  return groups.map((currentGroup) => {
    let updatedGroup = {...currentGroup};
    if (user.groups.find(group => group.id === updatedGroup.id)) updatedGroup.users = updateList(currentGroup.users, user, type);
    if (updatedGroup.children && updatedGroup.children.length) updatedGroup.children = editUserRecursively(updatedGroup.children, user, type);
    return updatedGroup;
  });
}

export function removeFromListRecursively(list, elementId) {
  let key = -1,
    newList = list.map((currentElement, currentKey) => {
      if (currentElement.id === elementId) {
        key = currentKey;
        return currentElement;
      } else if (currentElement.children && currentElement.children.length) return {
        ...currentElement,
        children: removeFromListRecursively(currentElement.children, elementId)
      };
      return currentElement;
    });

  if (key !== -1) newList.splice(key, 1);

  return newList;
}

export function filterListRecursively(list, rule, showAllChildren = false, childrenField = 'children') {
  let newList = list.map(element => {
    if (element[childrenField] && element[childrenField].length) {
      if (showAllChildren && rule(element)) return element;
      let newElement = {
        ...element,
        [childrenField]: filterListRecursively(element[childrenField], rule, showAllChildren, childrenField)
      };
      if (rule(newElement) || newElement[childrenField].length) return newElement
    } else if (rule(element)) return element;
  })

  return newList.filter(element => element !== undefined);
}

export function findInListRecursively(list, rule, returnLevel = false, level = 0) {
  if (!list?.length) return null;
  let result;
  list.some(element => {
    if (rule(element)) {
      result = returnLevel ? {...element, level} : element;
      return true;
    }
    if (element.children) {
      result = findInListRecursively(element.children, rule, returnLevel, level + 1);
      if (result) return true;
    }
    return false;
  });
  return result;
}

export function findInListRecursivelyWithParent(list, rule, returnLevel = false, level = 0, parent = null) {
  if (!list?.length) return null;
  let result;
  list.some(element => {
    if (rule(element)) {
      result = returnLevel ? {...element, level, parent} : {...element, parent};
      return true;
    }
    if (element.children) {
      result = findInListRecursivelyWithParent(element.children, rule, returnLevel, level + 1, element);
      if (result) return true;
    }
    return false;
  });
  return result;
}

export function updateObject(object, element, type = 'update') {
  let newObject = {...object},
    key = type === 'update' ? element.id : element;

  if (type === 'update') newObject[key] = element;
  else delete newObject[key];

  return newObject;
}

export function pluralizeWords(amount, words) {
  let cases = [2, 0, 1, 1, 1, 2];
  return words[(amount % 100 > 4 && amount % 100 < 20) ? 2 : cases[Math.min(amount % 10, 5)]];
}

export function pluralize(amount, words) {
  return `${amount} ${pluralizeWords(amount, words)}`;
}

export function updateWorkshifts(shifts, newShifts, type = 'update') {
  if (!shifts) return null;

  const emptySchedule = {};
  const newShiftIds = typeof newShifts[0] === 'number' ? newShifts : newShifts.map(shift => shift.id);

  Object.keys(shifts).forEach(date => {
    emptySchedule[date] = {};
    Object.keys(shifts[date]).forEach(period => {
      emptySchedule[date][period] = {};
      Object.keys(shifts[date][period]).forEach(room => {
        emptySchedule[date][period][room] = {
          number: room,
          workshifts: shifts[date][period][room].workshifts.filter(shift => !newShiftIds.includes(shift.id)),
        };
      });
    });
  });

  if (type === 'delete') return emptySchedule;

  newShifts.forEach(shift => {
    const dateObject = moment(shift.period_date),
      firstActiveDate = moment();

    if (firstActiveDate.weekday() === 6) firstActiveDate.add(1, 'week');
    else firstActiveDate.weekday(6);

    const keys = {
      date: shift.period_date,
      period: `${shift.work_shift.from} - ${shift.work_shift.to}`,
      room: (shift.status === 'created') && (dateObject < firstActiveDate) ? 'reserve' : shift.room && shift.room.id || 'without_room'
    }

    emptySchedule[keys.date] = emptySchedule[keys.date] || {};
    emptySchedule[keys.date][keys.period] = emptySchedule[keys.date][keys.period] || {};
    emptySchedule[keys.date][keys.period][keys.room] = emptySchedule[keys.date][keys.period][keys.room] || {
      number: keys.room,
      workshifts: [],
    };
    emptySchedule[keys.date][keys.period][keys.room].workshifts.push(shift);
  });

  return emptySchedule;
}

export async function requestHandler(requestData, actionData, dispatch, overwrittenCodes = []) {
  try {
    return ((requestData.method === 'get') || (requestData.method === 'delete')) ?
      await axios[requestData.method](requestData.url, requestData.params) :
      await axios[requestData.method](requestData.url, requestData.data, requestData.params);
  } catch (error) {
    if (overwrittenCodes.includes(error.response.status)) throw error;
    switch (error.response.status) {
      case 503: return dispatch('layout/handleServerError', undefined, {root: true});
      case 403: return window.dispatchEvent(new CustomEvent('permissionsError'));
      case 401: return dispatch('refresh/refreshToken', actionData, {root: true});
      case 423: {
        const pinLockUserStatusResult = await dispatch('auth/setPinLockUserStatus', true, {root: true});
        if (pinLockUserStatusResult && (router.currentRoute.name !== 'EnterPin')) return router.push(`/enter-pin?backPage=${router.currentRoute.fullPath}`);
        throw (error);
      }
    }
    throw (error);
  }
}

export function responseErrorHandler(params) {
  const {
    error,
    commit,
    customHandler,
    statusMutation = 'SET_STATUS',
    errorStatus = 'error',
    errorMessageMutation = 'SET_ERROR_MESSAGE',
    errorMessage = error?.response?.data?.violations?.[0]?.message,
    isErrorMessageSavable = false,
  } = params;

  if (!error?.response?.status) throw error;
  if (error.response.status === 401) return;
  if (typeof customHandler === 'function') return customHandler(error);
  commit(statusMutation, errorStatus);
  if (errorMessage && isErrorMessageSavable) commit(errorMessageMutation, errorMessage);
}

export function getSmallImage(rawLink) {
  if (!rawLink || typeof rawLink !== 'string') return null;
  return rawLink.replace('unsafe/', 'unsafe/150x150/');
}

export function getAbsenceForDate(dateString, absences) {
  let date = typeof dateString === 'string' ? moment.parseZone(dateString) : dateString;
  return absences.find(absence => date.isBetween(moment.parseZone(absence.start_at), moment.parseZone(absence.end_at), undefined, '[]'));
}

export function clipboard(text, success, error) {
  clipboardJS.writeText(text).then(() => {
    success && success();
  }, err => {
    error && error(err);
  });
}

export function getTypeEditUser(type) {
  switch (type) {
    case 'operator':
      return 'Operator';
    case 'model':
      return 'Model';
    default:
      return 'User';
  }
}

export function phoneMask(value) {
  let result = ['+'];
  for (let i = 0; i <= value.length; i++) {
    result.push(/\d/);
  }
  return result;
}

export function searchListRecursively(list, rule, childrenField = 'children', parent = null) {
  for (let i = 0; i < list.length; i++) {
    if (rule(list[i])) return {list, element: list[i], parent};
    if (!list[i]?.[childrenField]?.length) continue;
    let result = searchListRecursively(list[i][childrenField], rule, childrenField, list[i]);
    if (result) return result;
  }
  return null;
}

export function isColorDark(color) {
  if (!color) return false;
  let red = parseInt(color.slice(1, 3), 16),
    green = parseInt(color.slice(3, 5), 16),
    blue = parseInt(color.slice(5, 7), 16);

  return ((red * 299) + (green * 587) + (blue * 114)) < 120000;
}

export function isEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i]);
    }
    return arrCopy;
  }

  const objCopy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepClone(obj[key]);
    }
  }

  return objCopy;
}

export function getPeriodsData(periods) {
  if (!periods?.length) return {
    middle: {
      hours: 0,
      minutes: 0,
    },
    end: {
      hours: 0,
      minutes: 0,
    },
  };
  let from = periods[periods.length - 1].from.split(':'),
    to = periods[periods.length - 1].to.split(':'),
    firstPeriodStart = periods[0].from.split(':'),
    fromHours = parseInt(from[0]),
    fromMinutes = parseInt(from[1]),
    toHours = parseInt(to[0]),
    toMinutes = parseInt(to[1]),
    middleRaw = (((toHours > fromHours ? toHours : (toHours + 24)) * 60 + toMinutes) - (fromHours * 60 + fromMinutes)) / 2 + (fromHours * 60 + fromMinutes),
    middleMinutes = middleRaw % 60,
    middleHours = (middleRaw - middleMinutes) / 60;

  if (middleHours > 24) middleHours = middleHours - 24;

  return {
    firstPeriodStart: {
      hours: parseInt(firstPeriodStart[0]),
      minutes: parseInt(firstPeriodStart[1]),
    },
    middle: {
      hours: middleHours,
      minutes: middleMinutes,
    },
    end: {
      hours: toHours,
      minutes: toMinutes,
    },
  };
}

export function isNextDateInShift(shiftTimeData, endPeriodData) {
  if ((endPeriodData.firstPeriodStart.hours < endPeriodData.end.hours) || ((endPeriodData.end.hours === 0) && (endPeriodData.end.minutes === 0))) return false;
  if ((shiftTimeData.start.hours > endPeriodData.end.hours) || ((shiftTimeData.start.hours === endPeriodData.end.hours) && (shiftTimeData.start.minutes > endPeriodData.end.minutes))) return false;
  if ((shiftTimeData.end.hours < endPeriodData.end.hours) || ((shiftTimeData.end.hours === endPeriodData.end.hours) && (shiftTimeData.end.minutes <= endPeriodData.end.minutes))) return true;
  return (shiftTimeData.start.hours < endPeriodData.middle.hours) || ((shiftTimeData.start.hours === endPeriodData.middle.hours) && (shiftTimeData.start.minutes <= endPeriodData.middle.minutes));
}

function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0");
}

export function generateRandomString(len = 8) {
  let arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

export function closeToast(e, toast) {
  toast.goAway(0);
}

export function formatPaginationData(data) {
  return {
    currentPage: data.pagination.currentPage,
    perPage: data.pagination.itemsPerPage,
    totalItems: data.pagination.totalItems,
    totalPages: data.pagination.pagesCount,
  };
}

export function getUsersUrlForRole(roleCode) {
  switch (roleCode) {
    case 'ROLE_MODEL':
      return '/models';
    case 'ROLE_OPERATOR':
      return '/operators';
  }
  return '/users';
}

export function removeQuery(fullLink) {
  return fullLink && fullLink.replace(/\?.*$/, '');
}

export function showToast(toasted, message = 'Успех', type = 'success', duration = 2500) {
  return toasted[type](message, {
    position: 'bottom-left',
    keepOnHover: true,
    duration,
    action: {
      text: '',
      class: 'btn-close',
      onClick: closeToast,
    },
  });
}

export function showToastNew({message = 'Успех', type = 'success', duration = 2500}) {
  return this.$toasted[type](message, {
    position: 'bottom-left',
    keepOnHover: true,
    duration,
    action: {
      text: '',
      class: 'btn-close',
      onClick: closeToast,
    },
  });
}

export function getIdsFromGroup(group, subType) {
  const ids = (subType && group.sub_type && (subType !== group.sub_type)) ? [] : [group.id];
  if (group.children) group.children.forEach(currentGroup => ids.splice(ids.length, 0, ...getIdsFromGroup(currentGroup, subType)));
  return ids;
}

export function isScheduleSectionPermitted(section, userPermissions) {
  switch (section) {
    case 'show':
      return userPermissions.schedule.view ||
        userPermissions.setup.workshift.operator ||
        userPermissions.schedule.operator.workshifts.yours ||
        userPermissions.schedule.operator.workshifts.all;
    case 'free-models':
      return userPermissions.schedule.edit || userPermissions.schedule.reserve.view;
    case 'past-workshift':
      return userPermissions.schedule.edit || userPermissions.schedule.past.view;
    case 'operator':
      return userPermissions.setup.workshift.operator ||
        userPermissions.schedule.operator.workshifts.yours ||
        userPermissions.schedule.operator.workshifts.all;
  }

  return false;
}

export function fillingPermissions(permissions) {
  return {
    model: {
      profile: {
        view: permissions.includes('model.profile.view') || permissions.includes('model.profile.select_edit'),
        personal: {
          view: permissions.includes('model.profile.personal.view') || permissions.includes('model.profile.personal.edit'),
          edit: permissions.includes('model.profile.personal.edit')
        },
        response: {
          view: permissions.includes('model.profile.response.view') || permissions.includes('model.profile.response.edit'),
          edit: permissions.includes('model.profile.response.edit')
        },
        group: {
          view: permissions.includes('model.profile.group.view') || permissions.includes('model.profile.group.edit'),
          edit: permissions.includes('model.profile.group.edit')
        },
        history: {
          view: permissions.includes('model.profile.history.view') || permissions.includes('model.profile.history.edit'),
          edit: permissions.includes('model.profile.history.edit')
        },
        dossier: {
          view: permissions.includes('model.profile.dossier.view') || permissions.includes('model.profile.dossier.edit'),
          edit: permissions.includes('model.profile.dossier.edit')
        },
        materials: {
          registration: {
            view: permissions.includes('model.profile.materials.registration.view') || permissions.includes('model.profile.materials.registration.edit'),
            edit: permissions.includes('model.profile.materials.registration.edit')
          },
          video: {
            view: permissions.includes('model.profile.materials.video.view') || permissions.includes('model.profile.materials.video.edit'),
            edit: permissions.includes('model.profile.materials.video.edit')
          }
        },
        schedule: {
          view: permissions.includes('model.profile.schedule.view') || permissions.includes('model.profile.schedule.edit'),
          edit: permissions.includes('model.profile.schedule.edit')
        },
        comments: {
          view: permissions.includes('model.profile.comments.view') || permissions.includes('model.profile.comments.edit'),
          edit: permissions.includes('model.profile.comments.edit')
        },
        service: {
          view: permissions.includes('model.profile.service.view') || permissions.includes('model.profile.service.edit'),
          edit: permissions.includes('model.profile.service.edit')
        },
        absence: {
          view: permissions.includes('model.profile.absence.view') || permissions.includes('model.profile.absence.edit'),
          edit: permissions.includes('model.profile.absence.edit')
        },
        report: {
          view: permissions.includes('model.profile.report.view'),
        },
        payment: {
          information: {
            view: permissions.includes('model.profile.payment.information.view') || permissions.includes('model.profile.payment.information.edit'),
            edit: permissions.includes('model.profile.payment.information.edit')
          },
        },
      },
      personal: {
        view: permissions.includes('model.personal.view') || permissions.includes('model.personal.edit'),
        personal: {
          view: permissions.includes('model.personal.personal.view') || permissions.includes('model.personal.personal.edit'),
          edit: permissions.includes('model.personal.personal.edit')
        },
        response: {
          view: permissions.includes('model.personal.response.view') || permissions.includes('model.personal.response.edit'),
          edit: permissions.includes('model.personal.response.edit')
        },
        group: {
          view: permissions.includes('model.personal.group.view') || permissions.includes('model.personal.group.edit'),
          edit: permissions.includes('model.personal.group.edit')
        },
        history: {
          view: permissions.includes('model.personal.history.view') || permissions.includes('model.personal.history.edit'),
          edit: permissions.includes('model.personal.history.edit')
        },
        dossier: {
          view: permissions.includes('model.personal.dossier.view') || permissions.includes('model.personal.dossier.edit'),
          edit: permissions.includes('model.personal.dossier.edit')
        },
        materials: {
          registration: {
            view: permissions.includes('model.personal.materials.registration.view') || permissions.includes('model.personal.materials.registration.edit'),
            edit: permissions.includes('model.personal.materials.registration.edit')
          },
          video: {
            view: permissions.includes('model.personal.materials.video.view') || permissions.includes('model.personal.materials.video.edit'),
            edit: permissions.includes('model.personal.materials.video.edit')
          }
        },
        schedule: {
          view: permissions.includes('model.personal.schedule.view') || permissions.includes('model.personal.schedule.edit'),
          edit: permissions.includes('model.personal.schedule.edit')
        },
        comments: {
          view: permissions.includes('model.personal.comments.view') || permissions.includes('model.personal.comments.edit'),
          edit: permissions.includes('model.personal.comments.edit')
        },
        service: {
          view: permissions.includes('model.personal.service.view') || permissions.includes('model.personal.service.edit'),
          edit: permissions.includes('model.personal.service.edit')
        },
        absence: {
          view: permissions.includes('model.personal.absence.view') || permissions.includes('employee.profile.absence.edit'),
          edit: permissions.includes('model.personal.absence.edit')
        },
        payment_information: {
          view: permissions.includes('model.personal.payment_information.view') || permissions.includes('model.personal.payment_information.edit'),
          edit: permissions.includes('model.personal.payment_information.edit')
        }
      }
    },
    employee: {
      profile: {
        view: permissions.includes('employee.profile.view') || permissions.includes('employee.profile.select_edit'),
        personal: {
          view: permissions.includes('employee.profile.personal.view') || permissions.includes('employee.profile.personal.edit'),
          edit: permissions.includes('employee.profile.personal.edit')
        },
        group: {
          view: permissions.includes('employee.profile.group.view') || permissions.includes('employee.profile.group.edit'),
          edit: permissions.includes('employee.profile.group.edit')
        },
        materials: {
          documents: {
            view: permissions.includes('employee.profile.materials.documents.view') || permissions.includes('employee.profile.materials.documents.edit'),
            edit: permissions.includes('employee.profile.materials.documents.edit')

          },
          contracts: {
            view: permissions.includes('employee.profile.materials.contracts.view') || permissions.includes('employee.profile.materials.contracts.edit'),
            edit: permissions.includes('employee.profile.materials.contracts.edit')
          }
        },
        absence: {
          view: permissions.includes('employee.profile.absence.view') || permissions.includes('employee.profile.absence.edit'),
          edit: permissions.includes('employee.profile.absence.edit')
        },
        payment: {
          information: {
            view: permissions.includes('employee.profile.payment.information.view') || permissions.includes('employee.profile.payment.information.edit'),
            edit: permissions.includes('employee.profile.payment.information.edit')
          },
        },
      },
      personal: {
        view: permissions.includes('employee.personal.view') || permissions.includes('employee.personal.select_edit'),
        personal: {
          view: permissions.includes('employee.personal.personal.view') || permissions.includes('employee.personal.personal.edit'),
          edit: permissions.includes('employee.personal.personal.edit')
        },
        group: {
          view: permissions.includes('employee.personal.group.view') || permissions.includes('employee.personal.group.edit'),
          edit: permissions.includes('employee.personal.group.edit')
        },
        materials: {
          documents: {
            view: permissions.includes('employee.personal.materials.documents.view') || permissions.includes('employee.personal.materials.documents.edit'),
            edit: permissions.includes('employee.personal.materials.documents.edit')

          },
          contracts: {
            view: permissions.includes('employee.personal.materials.contracts.view') || permissions.includes('employee.personal.materials.contracts.edit'),
            edit: permissions.includes('employee.personal.materials.contracts.edit')
          }
        },
        absence: {
          view: permissions.includes('employee.personal.absence.view') || permissions.includes('employee.personal.absence.edit'),
          edit: permissions.includes('employee.personal.absence.edit')
        },
        payment_information: {
          view: permissions.includes('employee.personal.payment_information.view') || permissions.includes('employee.personal.payment_information.edit'),
          edit: permissions.includes('employee.personal.payment_information.edit')
        }
      }
    },
    operator: {
      profile: {
        view: permissions.includes('operator.profile.view') || permissions.includes('operator.profile.select_edit'),
        personal: {
          view: permissions.includes('operator.profile.personal.view') || permissions.includes('operator.profile.personal.edit'),
          edit: permissions.includes('operator.profile.personal.edit')
        },
        group: {
          view: permissions.includes('operator.profile.group.view') || permissions.includes('operator.profile.group.edit'),
          edit: permissions.includes('operator.profile.group.edit')
        },
        materials: {
          documents: {
            view: permissions.includes('operator.profile.materials.documents.view') || permissions.includes('operator.profile.materials.documents.edit'),
            edit: permissions.includes('operator.profile.materials.documents.edit')

          },
          contracts: {
            view: permissions.includes('operator.profile.materials.contracts.view') || permissions.includes('operator.profile.materials.contracts.edit'),
            edit: permissions.includes('operator.profile.materials.contracts.edit')
          }
        },
        absence: {
          view: permissions.includes('operator.profile.absence.view') || permissions.includes('operator.profile.absence.edit'),
          edit: permissions.includes('operator.profile.absence.edit')
        },
        schedule: {
          view: permissions.includes('operator.profile.schedule.view') || permissions.includes('operator.profile.schedule.edit'),
          edit: permissions.includes('operator.profile.schedule.edit')
        },
        report: {
          view: permissions.includes('operator.profile.report.view'),
        },
        payment: {
          information: {
            view: permissions.includes('operator.profile.payment.information.view') || permissions.includes('operator.profile.payment.information.edit'),
            edit: permissions.includes('operator.profile.payment.information.edit')
          },
        },
      },
      personal: {
        view: permissions.includes('operator.personal.view') || permissions.includes('operator.personal.edit'),
        personal: {
          view: permissions.includes('operator.personal.personal.view') || permissions.includes('operator.personal.personal.edit'),
          edit: permissions.includes('operator.personal.personal.edit')
        },
        group: {
          view: permissions.includes('operator.personal.group.view') || permissions.includes('operator.personal.group.edit'),
          edit: permissions.includes('operator.personal.group.edit')
        },
        materials: {
          documents: {
            view: permissions.includes('operator.personal.materials.documents.view') || permissions.includes('operator.personal.materials.documents.edit'),
            edit: permissions.includes('operator.personal.materials.documents.edit')

          },
          contracts: {
            view: permissions.includes('operator.personal.materials.contracts.view') || permissions.includes('operator.personal.materials.contracts.edit'),
            edit: permissions.includes('operator.personal.materials.contracts.edit')
          }
        },
        absence: {
          view: permissions.includes('operator.personal.absence.view') || permissions.includes('operator.personal.absence.edit'),
          edit: permissions.includes('operator.personal.absence.edit')
        },
        payment_information: {
          view: permissions.includes('operator.personal.payment_information.view') || permissions.includes('operator.personal.payment_information.edit'),
          edit: permissions.includes('operator.personal.payment_information.edit')
        }
      }
    },
    model_credential: {
      request: permissions.includes('model_credential.request.access')
    },
    profile: {
      personal: {
        view: permissions.includes('profile.personal.view') || permissions.includes('profile.personal.edit'),
        edit: permissions.includes('profile.personal.edit'),
        materials: {
          view: permissions.includes('profile.personal.materials.view') || permissions.includes('profile.personal.materials.edit'),
          edit: permissions.includes('profile.personal.materials.edit')
        }
      }
    },
    group: {
      main: {
        view: permissions.includes('group.main.view') || permissions.includes('group.main.edit'),
        edit: permissions.includes('group.main.edit')
      },
      operator: {
        view: permissions.includes('group.operator.view') || permissions.includes('group.operator.edit'),
        edit: permissions.includes('group.operator.edit')
      },
      deactivate: {
        view: permissions.includes('group.deactivate.view') || permissions.includes('group.deactivate.edit'),
        edit: permissions.includes('group.deactivate.edit')
      },
    },
    hr: {
      view: permissions.includes('hr.view') || permissions.includes('hr.edit'),
      edit: permissions.includes('hr.edit')
    },
    schedule: {
      view: permissions.includes('schedule.view')
        || permissions.includes('schedule.edit')
        || permissions.includes('schedule.actual.end.date.edit')
        || permissions.includes('schedule.actual.start.date.edit')
        || permissions.includes('schedule.break.edit'),
      edit: permissions.includes('schedule.edit'),
      reserve: {
        view: permissions.includes('schedule.reserve.view')
          || permissions.includes('schedule.reserve.edit')
          || permissions.includes('schedule.actual.end.date.edit')
          || permissions.includes('schedule.actual.start.date.edit')
          || permissions.includes('schedule.break.edit'),
        edit: permissions.includes('schedule.reserve.edit')
      },
      actual: {
        start: {
          date: {
            view: permissions.includes('schedule.actual.start.date.view') || permissions.includes('schedule.actual.start.date.edit'),
            edit: permissions.includes('schedule.actual.start.date.edit')
          }
        },
        end: {
          date: {
            view: permissions.includes('schedule.actual.end.date.view') || permissions.includes('schedule.actual.end.date.edit'),
            edit: permissions.includes('schedule.actual.end.date.edit')
          }
        }
      },
      break: {
        view: permissions.includes('schedule.break.view') || permissions.includes('schedule.break.edit'),
        edit: permissions.includes('schedule.break.edit')
      },
      past: {
        view: permissions.includes('schedule.past.view')
          || permissions.includes('schedule.edit')
          || permissions.includes('schedule.actual.end.date.edit')
          || permissions.includes('schedule.actual.start.date.edit')
          || permissions.includes('schedule.break.edit'),
      },
      operator: {
        workshifts: {
          yours: permissions.includes('schedule.operator.workshifts.yours'),
          all: permissions.includes('schedule.operator.workshifts.all'),
        }
      },
    },
    workshift: {
      report: {
        view: permissions.includes('workshift.report.view.access'),
        create: permissions.includes('workshift.report.create.access')
      }
    },
    task: {
      my: {
        view: permissions.includes('task.my.view') || permissions.includes('task.my.edit'),
        edit: permissions.includes('task.my.edit')
      },
      custom: {
        view: permissions.includes('task.custom.view') || permissions.includes('task.custom.edit'),
        edit: permissions.includes('task.custom.edit')
      },
      call_center: {
        view: permissions.includes('task.call_center.view') || permissions.includes('task.call_center.edit'),
        edit: permissions.includes('task.call_center.edit')
      },
      interview: {
        view: permissions.includes('task.interview.view') || permissions.includes('task.interview.edit'),
        edit: permissions.includes('task.interview.edit')
      },
      psych: {
        view: permissions.includes('task.psych.view') || permissions.includes('task.psych.edit'),
        edit: permissions.includes('task.psych.edit')
      },
      video: {
        view: permissions.includes('task.video.view') || permissions.includes('task.video.edit'),
        edit: permissions.includes('task.video.edit')
      },
      registration: {
        view: permissions.includes('task.registration.view') || permissions.includes('task.registration.edit'),
        edit: permissions.includes('task.registration.edit')
      },
      dossier: {
        view: permissions.includes('task.dossier.view') || permissions.includes('task.dossier.edit'),
        edit: permissions.includes('task.dossier.edit')
      },
      restore_password: {
        view: permissions.includes('task.restore_password.view') || permissions.includes('task.restore_password.edit'),
        edit: permissions.includes('task.restore_password.edit')
      },
      checking: {
        view: permissions.includes('task.checking.view') || permissions.includes('task.checking.edit'),
        edit: permissions.includes('task.checking.edit')
      },
      checking_new: {
        view: permissions.includes('task.checking_new.view') || permissions.includes('task.checking_new.edit'),
        edit: permissions.includes('task.checking_new.edit')
      },
      support: {
        view: permissions.includes('task.support.view') || permissions.includes('task.support.edit'),
        edit: permissions.includes('task.support.edit')
      },
      revision_new: {
        view: permissions.includes('task.revision_new.view') || permissions.includes('task.revision_new.edit'),
        edit: permissions.includes('task.revision_new.edit')
      },
      reregistration: {
        view: permissions.includes('task.reregistration.view') || permissions.includes('task.reregistration.edit'),
        edit: permissions.includes('task.reregistration.edit')
      },
      password_change: {
        view: permissions.includes('task.password_change.view') || permissions.includes('task.password_change.edit'),
        edit: permissions.includes('task.password_change.edit')
      },
      create: permissions.includes('task.create.access'),
      remove: permissions.includes('task.remove.access'),
      planned_at_task: permissions.includes('planned_at_task.edit.access')
    },
    setup: {
      workshift: {
        operator: permissions.includes('setup.workshift.operator.access')
      }
    },
    admin: {
      roles: {
        view: permissions.includes('admin.roles.view') || permissions.includes('admin.roles.edit'),
        edit: permissions.includes('admin.roles.edit')
      },
      finance: {
        view: permissions.includes('admin.finance.view') || permissions.includes('admin.finance.edit'),
        edit: permissions.includes('admin.finance.edit')
      },
      resource: {
        view: permissions.includes('admin.resource.view') || permissions.includes('admin.resource.edit'),
        edit: permissions.includes('admin.resource.edit')
      },
      dossier: {
        view: permissions.includes('admin.dossier.view') || permissions.includes('admin.dossier.edit'),
        edit: permissions.includes('admin.dossier.edit'),
      },
      response: {
        view: permissions.includes('admin.response.view') || permissions.includes('admin.response.edit'),
        edit: permissions.includes('admin.response.edit'),
      },
      setting: {
        view: permissions.includes('admin.setting.view') || permissions.includes('admin.setting.edit'),
        edit: permissions.includes('admin.setting.edit'),
      },
      cancel: {
        workshifts: {
          view: permissions.includes('admin.cancel.workshifts.view') || permissions.includes('admin.cancel.workshifts.edit'),
          edit: permissions.includes('admin.cancel.workshifts.edit'),
        }
      },
      communication: {
        view: permissions.includes('admin.communication.view') || permissions.includes('admin.communication.edit'),
        edit: permissions.includes('admin.communication.edit')
      },
      cancellationReason: {
        view: permissions.includes('admin.task_rejection_reason.view') || permissions.includes('admin.task_rejection_reason.edit'),
        edit: permissions.includes('admin.task_rejection_reason.edit')
      },
      credentialBlockingReason: {
        view: permissions.includes('admin.credential_blocking_reason.view') || permissions.includes('admin.credential_blocking_reason.edit'),
        edit: permissions.includes('admin.credential_blocking_reason.edit')
      },
      resignReason: {
        view: permissions.includes('admin.user_resign_reason.view') || permissions.includes('admin.user_resign_reason.edit'),
        edit: permissions.includes('admin.user_resign_reason.edit')
      },
      nationality: {
        view: permissions.includes('admin.nationality.view') || permissions.includes('admin.nationality.edit'),
        edit: permissions.includes('admin.nationality.edit')
      },
      postponementReason: {
        view: permissions.includes('admin.postponement_reason.view') || permissions.includes('admin.postponement_reason.edit'),
        edit: permissions.includes('admin.postponement_reason.edit')
      },
      jobDuty: {
        view: permissions.includes('admin.job_duty.view') || permissions.includes('admin.job_duty.edit'),
        edit: permissions.includes('admin.job_duty.edit')
      },
      templateWorkshiftReport: {
        view: permissions.includes('admin.template_workshift_report.view') || permissions.includes('admin.template_workshift_report.edit'),
        edit: permissions.includes('admin.template_workshift_report.edit')
      },
      authorizationHistory: {
        view: permissions.includes('admin.authorization_history.view') || permissions.includes('admin.authorization_history.edit'),
        edit: permissions.includes('admin.authorization_history.edit')
      },
      paymentResource: {
        view: permissions.includes('admin.payment_resource.view') || permissions.includes('admin.payment_resource.edit'),
        edit: permissions.includes('admin.payment_resource.edit')
      },
      position: {
        view: permissions.includes('admin.position.view') || permissions.includes('admin.position.edit'),
        edit: permissions.includes('admin.position.edit')
      },
    },
    notification: {
      view: permissions.includes('notification.view') || permissions.includes('notification.edit'),
      edit: permissions.includes('notification.edit'),
    },
    user: {
      create: permissions.includes('user.create.access'),
      remove: permissions.includes('user.remove.access'),
      restore_password: permissions.includes('user.restore_password.access'),
    },
    comment: {
      create: permissions.includes('comment.create.access'),
      edit: permissions.includes('comment.edit.access'),
      destroy: permissions.includes('comment.destroy.access')
    },
    credential_status: {
      change: permissions.includes('credential_status.change.access')
    },
    ignore_group: permissions.includes('ignore_group.access'),
    vacancy_response: {
      management: permissions.includes('vacancy_response.management.access')
    },
    hr_response: {
      view: permissions.includes('hr_response.view') || permissions.includes('hr_response.edit'),
      edit: permissions.includes('hr_response.edit')
    },
    personal_avatar: {
      view: permissions.includes('personal_avatar.view.access')
    },
    manager_avatar: {
      management: permissions.includes('manager_avatar.management.access')
    },
    resign_users: {
      management: permissions.includes('resign_users.management.access')
    },
    permissions_users: {
      management: permissions.includes('permissions_users.management.access')
    },
    fullname_model: {
      view: permissions.includes('fullname_model.view.access')
    },
    fullname_operator: {
      view: permissions.includes('fullname_operator.view.access')
    },
    edit: {
      workshift: {
        management: permissions.includes('edit.workshift.management.access')
      }
    },
    widget: {
      view: permissions.includes('widget.view'),
      events: {
        view: permissions.includes('widget.events.view')
      },
      workshifts_actual: {
        view: permissions.includes('widget.workshifts_actual.view')
      },
      workload: {
        view: permissions.includes('widget.workload.view')
      },
      without_workshift_model: {
        view: permissions.includes('widget.without_workshift_model.view')
      },
      without_workshift_operator: {
        view: permissions.includes('widget.without_workshift_operator.view')
      },
      new_models: {
        view: permissions.includes('widget.new_models.view')
      },
      responsible: {
        view: permissions.includes('widget.responsible.view')
      },
      hr: {
        view: permissions.includes('widget.hr.view'),
      },
    },
    calendar: {
      view: permissions.includes('calendar.view'),
      birthday: {
        view: permissions.includes('calendar.birthday.view')
      },
    },
    finance_system: permissions.includes('finance_system.access'),
    main_view_incomes: permissions.includes('main_view_incomes.access'),
    operator_view_incomes: permissions.includes('operator_view_incomes.access'),
    auth_without_pin: permissions.includes('auth_without_pin.access'),
  }
}

export function getRoundAmount(amount) {
  return parseFloat(Math.round(amount * 100) / 100);
}
