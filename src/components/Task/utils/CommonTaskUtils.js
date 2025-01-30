import moment from "moment";

export const makeIsEditTaskPermissions = (store, taskPropCopy) => {
    const userPermissions = store.state.auth.userPermissions;
    if (!taskPropCopy.type) return false
    if (taskPropCopy.type === 'restore_password') return userPermissions.user.restore_password
    return userPermissions.task[taskPropCopy.type].edit
}

export const makeTaskButtonName = (name, type) => {
    const taskDictionary = {
        psych: 'на психолог. тестирование',
        video: 'на видео-тестирование',
        registration: 'На регистрацию'
    }
    if (name) return name
    return taskDictionary[type]
}


export const taskButtons = {
    call_center: {
        name: 'В call-центр',
        task_types: [undefined],
        task_action: 'callCenterAction',
        set_task: null,
        type: 'submit'
    },
    custom_new: {
        name: 'Создать задачу',
        task_types: ['custom'],
        task_status: 'new',
        task_action: 'customNewAction',
        set_task: null,
        type: 'submit'
    },
    interview: {
        name: 'На собеседование',
        task_types: [undefined, 'call_center'],
        task_action: 'interviewAction',
        set_task: null,
        type: 'submit'
    },
    recruit: {
        name: null,
        task_types: ['interview'],
        task_action: 'recruitAction',
        set_task: null,
        type: 'submit'
    },
    psych: {
        name: null,
        task_types: ['psych'],
        task_action: 'setActiveTask',
        set_task: 'psycho',
        type: 'button'
    },
    video: {
        name: 'На регистрацию',
        task_types: ['video'],
        task_action: 'setActiveTask',
        set_task: 'video',
        type: 'button'
    },
    dossier: {
        name: 'Выполнить задачу',
        task_types: ['dossier'],
        task_action: 'setActiveTask',
        set_task: 'dossier',
        type: 'button'
    },
    support: {
        name: 'Закрыть обращение',
        task_types: ['support'],
        task_action: 'showModalForCloseSupport',
        set_task: 'support',
        type: 'button'
    },
    checking: {
        name: 'Выполнить задачу',
        task_types: ['checking'],
        task_action: 'setActiveTask',
        set_task: 'checking',
        type: 'button'
    },
    registration: {
        name: 'На проверку',
        task_types: ['registration'],
        task_action: 'setActiveTask',
        set_task: 'registration',
        type: 'button'
    },
    checking_new: {
        name: 'Выполнить задачу',
        task_types: ['checking_new'],
        task_action: 'validateCheckingNew',
        set_task: 'checking_new',
        type: 'button'
    },
    revision_new: {
        name: 'Выполнить задачу',
        task_types: ['revision_new'],
        task_action: 'validateRevisionNew',
        set_task: 'revision_new',
        type: 'button'
    },
    reregistration: {
        name: 'Выполнить задачу',
        task_types: ['reregistration'],
        task_action: 'setActiveTask',
        set_task: 'reregistration',
        type: 'button'
    },
    restore_password: {
        name: 'Выполнить задачу',
        task_types: ['restore_password'],
        task_action: 'setActiveTask',
        set_task: 'restore_password',
        type: 'button'
    },
    custom: {
        name: 'Выполнить задачу',
        task_types: ['custom'],
        task_status_excluded: 'new',
        task_action: 'setActiveTask',
        set_task: 'custom',
        type: 'button'
    },
    password_change: {
        name: 'Выполнить задачу',
        task_types: ['password_change'],
        task_action: 'passwordChangeAction',
        set_task: null,
        type: 'submit'
    },
    cancel: {
        name: 'Отказ',
        task_types: ['interview', 'call_center'],
        task_action: 'cancelTask',
        type: 'button'
    },
    put_off: {
        name: 'Отложить',
        task_types: [],
        task_types_excluded: ['checking_new', 'password_change', 'support'],
        task_status_excluded: 'new',
        task_action: 'setActiveTask',
        set_task: 'put-off',
        type: 'button'
    }
}

export const genderTask = [
    {type: 'male', title: 'Мужской'},
    {type: 'female', title: 'Женский'}
]
export const taskStatuses = {
    new: 'Новая задача',
    active: 'Активная задача',
    check: 'Проверка',
    postponed: 'Активная задача',
    completed: 'Выполненная задача',
    archive: 'Архивирована'
}
const isDayAbsence = (store, day, absences) => {
    const absenceTypes = store.state.dictionaries.absenceTypes;
    if (!absences?.length) return false
    let absencesCurrentDay = absences.filter(absence => moment.parseZone(day).isBetween(moment.parseZone(absence.start_at), moment.parseZone(absence.end_at), undefined, '[]'))
    return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {
        return ` ${absenceTypes[absence.type]} ${moment.parseZone(absence.start_at).format('DD.MM')} - ${moment.parseZone(absence.end_at).format('DD.MM')} `
    }) : null
}
export const getOptionsCurrentUsersUpdated = ({store, currentUsersUpdated, taskPropCopy}) => {
    if (!currentUsersUpdated.length) return []
    return currentUsersUpdated.map(user => {
        if (!user.id || !user.absences) return user
        user.checkedAbsences = isDayAbsence(store, moment(taskPropCopy.planned_start_at).format('YYYY-MM-DD'), user.absences)
        user.disabled = !!user.checkedAbsences
        return user
    })
}

export const timePickerOptionsTask = {
    start: '09:00',
    step: '00:30',
    end: '19:00',
}
export const cancellableTypesTask = [
    'call_center',
    'interview',
    'psych',
    'video'
]

export const responseTypesTask = {
    new: 'Новая заявка',
    call_center: 'Call-центр',
    interview: 'Собеседование',
    reject: 'Отказ',
    processed: 'Обработана',
    archive: 'Архив'
}

export const credentialStatusesCheckingTask = {
    active: "Активен",
    inactive: "Не активен"
}
export const makeSupportMessage = (comments, request_id) => {
    if (!comments.length) return []
    return comments.flatMap(item => {
        return item.comments.map(comment => {
            return {
                ...comment,
                request_id,
                type: comment.type,
                author: {
                    ...item.user,
                    avatar: item.user.avatar,
                    shown_name: item.user.fullname,
                }
            }
        })
    }).reverse()
}
