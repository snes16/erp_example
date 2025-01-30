<template>
    <b-form class="response" @submit.prevent="openActionForm(action)">
        <div class="response-title">
            <div class="response-title-submit">
                <b-button v-if="taskPropCopy.status !== 'completed' && taskPropCopy.status !== 'archive'"
                    class="response-title-submit-button"
                    size="sm"
                    @click="setActiveTask('password')"
                    variant="outline-info"
                >
                    Выполнить
                </b-button>
                <b-button v-if="taskPropCopy.status !== 'completed' && taskPropCopy.status !== 'archive'"
                    class="response-title-submit-button"
                    size="sm"
                    @click="setActiveTask('archive')"
                    variant="outline-info"
                >
                    В архив
                </b-button>
                <b-button v-if="taskPropCopy.status !== 'completed' && taskPropCopy.status !== 'archive'"
                    class="response-title-submit-button"
                    size="sm"
                    @click="setActiveTask('put-off')"
                    variant="outline-info"
                >
                    Отложить
                </b-button>
            </div>
        </div>
        <div class="response-task-parameters">
            <div class="response-task-parameters-title">
                <div class="response-task-parameters-title-executor">
                    <div class="response-task-parameters-title-executor-avatar" :style="currentExecutor && currentExecutor.avatar ? `background-image: url(${currentExecutor.avatar}); background-size: cover;` : ''"></div>
                    <!-- <p class="response-task-parameters-title-executor-full_name" :class="taskPropCopy.title ? '' : '-not_appointed'">{{ taskPropCopy.title ? taskPropCopy.title: 'Исполнитель не назначен' }}</p> -->
                    <p class="response-task-parameters-title-executor-full_name" v-if="!currentUsersUpdated.length">Исполнитель не назначен</p>
                    <custom-select
                        v-else
                        class="response-task-parameters-title-executor-full_name"
                        valueField="id"
                        titleField="fullname"
                        v-model="currentExecutor"
                        defaultText="Исполнитель не назначен"
                        :options="currentUsersUpdated"
                        :returnWholeObject="true"
                        @change="setNewExecutor"
                        :disabled="taskPropCopy.status === 'completed'"
                    />
                </div>
                <div class="response-task-parameters-title-date">
                    <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
                    <!-- <p class="response-task-parameters-title-date-current_date" :class="taskPropCopy.complete_at ? '' : '-not_appointed'">{{ taskPropCopy.complete_at ? moment(taskPropCopy.complete_at).format('DD.MM.YYYY') : 'Дата не назначена'}}</p> -->
                    <date-picker
                        lang="ru"
                        type="datetime"
                        placeholder="Дата не назначена"
                        input-class="form-control response-action_form-action_field-block-date"
                        v-model="taskPropCopy.complete_at"
                        :time-picker-options="{
                            start: '00:00',
                            step: '00:30',
                            end: '23:30',
                        }"
                        format="DD.MM.YYYY, HH:mm"
                        @change="setNewTime"
                        :disabled="taskPropCopy && taskPropCopy.status === 'completed'"
                    >
                        <i slot="calendar-icon" />
                    </date-picker>
                </div>
            </div>
            <div class="response-task-parameters-current_task" :style="{ background: taskPropCopy.color }">{{taskPropCopy.status_trans}}</div>
            <div class="response-task-parameters-full_name">
                Восстановление пароля "{{ (taskPropCopy && taskPropCopy.recipient && taskPropCopy.recipient.email) ? taskPropCopy.recipient.email : '' }}"
            </div>
            <div v-if="activeTask === 'password'" class="response-action_form">
                <div class="response-action_form-title" :style="'border-bottom: none;'">
                    <p class="response-action_form-title-text">Комментарий</p>
                    <div class="helper-close" @click="closeForm"></div>
                </div>
                <b-input placeholder="Добавьте комментарий" v-model="taskComment" :disabled="taskPropCopy.status === 'completed'" required/>
                <div v-if="taskPropCopy.status !== 'completed'" class="response-action_form-send_field" :style="'border-top: none'">
                    <b-button size="md" variant="info" @click="restoreAction">Восстановить пароль</b-button>
                </div>
            </div>
            <div v-if="activeTask === 'archive'" class="response-action_form">
                <div class="response-action_form-title" :style="'border-bottom: none;'">
                    <p v-if="taskPropCopy.rejected" class="response-action_form-title-text">Получен отказ</p>
                    <p v-else-if="taskPropCopy.status === 'archive'" class="response-action_form-title-text">Задача заархивирована</p>
                    <p v-else class="response-action_form-title-text">Переместить в архив</p>
                    <div v-if="taskPropCopy.status !== 'archive'" class="helper-close" @click="closeForm"></div>
                </div>
                <b-input placeholder="Укажите причину архивирования" v-model="taskComment" :disabled="taskPropCopy.status === 'archive'"/>
                <div v-if="taskPropCopy.status !== 'archive'" class="response-action_form-send_field justify-content-end">
                    <b-button size="md" variant="info" @click="archiveAction">В архив</b-button>
                </div>
            </div>
        <div v-if="activeTask === 'put-off'" class="response-action_form">
            <div class="response-action_form-title" :style="'border-bottom: none;'">
                <p class="response-action_form-title-text">Отложить заявку</p>
                <div class="helper-close" @click="closeForm"></div>
            </div>
            <b-input placeholder="Укажите причину переноса" v-model="taskComment"/>
            <div class="response-action_form-send_field justify-content-between">
                <div class="response-task-parameters-title-date d-flex align-items-center">
                    <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
                    <date-picker
                        class="datepicker-plain  response-info_data-field-date p-0"
                        lang="ru"
                        type="datetime"
                        placeholder="Выберите дату"
                        :input-class="'input-plain'"
                        :time-picker-options="{
                            start: '00:00',
                            step: '00:30',
                            end: '23:30',
                        }"
                        format="DD.MM.YYYY, HH:mm"
                        v-model="taskPropCopy.complete_at"
                    >
                    <i style="display: none;" slot="calendar-icon" />
                    </date-picker>
                </div>
                <b-button size="md" variant="info" @click="doLaterAction">Отложить</b-button>
            </div>
        </div>
        <div v-if="activeTask !== 'put-off' && taskPropCopy.status === 'postponed'" class="response-action_form">
            <div class="response-action_form-title" :style="'border-bottom: none;'">
                <p class="response-action_form-title-text">Заявка отложена</p>
            </div>
            <p class="response-action_form-postponed_result">{{taskPropCopy && taskPropCopy.postponed_last_comment && taskPropCopy.postponed_last_comment.text ? taskPropCopy.postponed_last_comment.text : 'Причина переноса не указана'}}</p>
        </div>
        </div>
        <div v-if="false" class="response-full_name">
             <input
                id="surname"
                type="text"
                placeholder="Фамилия"
                v-model="modelProfile.surname"
                class="response-full_name-personal"
                v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 8}"
                :class="shownErrors.includes('surname') ? ' -error_text' : ''" @focus="focusField('surname')"
                @change="responseAction"
                required
            />
             <input
                id="name"
                type="text"
                placeholder="Имя"
                v-model="modelProfile.name"
                class="response-full_name-personal"
                v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 8}"
                :class="shownErrors.includes('name') ? ' -error_text' : ''" @focus="focusField('name')"
                @change="responseAction"
                required
            />
             <input
                id="patronymic"
                type="text"
                placeholder="Отчество"
                v-model="modelProfile.patronymic"
                class="response-full_name-personal"
                v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 8}"
                @change="responseAction"
            />
        </div>
        <div class="response-info_data">
            <div class="response-info_data-title" @click="toggleAccordion('modelFieldVisible', 0)">
                <p class="response-info_data-title-text">Данные сотрудника</p>
                <i :class="`fa fa-angle-down`"/>
            </div>
            <b-collapse :visible="modelFieldVisible === 0">
                <div class="response-contact_field">
                    <div class="response-contact_field-phone_mail">
                        <div class="response-contact_field-phone_mail-icon glyphicon-handset" />
                        <div class="response-contact_field-phone_mail-data">
                            <p class="response-contact_field-phone_mail-data-title">Телефон</p>
                            <p class="response-contact_field-phone_mail-data-number">
                                {{ (taskPropCopy && taskPropCopy.recipient && taskPropCopy.recipient.phone) ? taskPropCopy.recipient.phone : '' }}
                            </p>
                        </div>
                    </div>
                    <div class="response-contact_field-phone_mail">
                        <div class="response-contact_field-phone_mail-icon glyphicon-email" />
                        <div class="response-contact_field-phone_mail-data">
                            <p class="response-contact_field-phone_mail-data-title">Email</p>
                            <p class="response-contact_field-phone_mail-data-number">
                                {{ (taskPropCopy && taskPropCopy.recipient && taskPropCopy.recipient.email) ? taskPropCopy.recipient.email : '' }}
                            </p>
                        </div>
                    </div>
                </div>
                <b-table class="response-info_data-field" stacked :items="modelItems" :fields="modelFields">
                    <template v-slot:cell(birthday)>
                        <p v-if="taskPropCopy.recipient && taskPropCopy.recipient.birthday" class="datepicker-plain response-info_data-field-date">
                            {{ moment(taskPropCopy.recipient.birthday).format('DD.MM.YYYY') }}
                        </p>
                    </template>
                    <template v-slot:cell(gender)>
                        <p class="response-info_data-field-submit">
                            {{ taskPropCopy.recipient.gender === 'male' ? 'Мужской' : 'Женский' }}
                        </p>
                    </template>
                </b-table>
            </b-collapse>
        </div>
        <!-- <div class="response-comment_field">
            <b-input placeholder="Комментарий" v-model="commentText" @change="commentAction" :disabled="!modelProfile.id"/>
        </div> -->
    </b-form>
</template>
<script>
import Vue from 'vue';
import moment from 'moment';
import DatePicker from 'vue2-datepicker';
import { mapState, mapActions, mapGetters } from 'vuex';
import Select from "@/components/Common/Select/Select";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Helper from '@/components/Helper/Helper.vue';
export default {
    name: 'response',
    components: {
        'date-picker': DatePicker,
        'custom-select': Select,
        'helper': Helper
    },
    props: {
        taskProp: Object
    },
    data() {
        return {
            moment: moment,
            modelFieldVisible: 0,
            modelProfile: {
                id: null,
                status: "",
                email: "",
                phone: "",
                name: "",
                surname: "",
                patronymic: "",
                gender: null,
                birthday: null,
                resource: null,
                video_file: "",
                workflow: {
                    id: null,
                    type: '',
                    status: ''
                }
                },
            activeTask: '',
            modelItems: [{ birthday: '', gender: '' }],
            profileItems: [{}],
            fileItems: [],
            action: '',
            users: [],
            executor: null,
            parameters: [],
            fullname: '',
            gender: [
                { type: 'male', title: 'Мужской' },
                { type: 'female', title: 'Женский' }
            ],
            shownErrors: [],
            resouresList: [],
            commentText: '',
            taskComment: '',
            responseReject: false,
            laterStatus: false,
            dossierTemplate: null,
            taskPropCopy: {},
            currentUsersUpdated: [],
            nextCurrentUsersUpdated: [],
            currentExecutor: null
        }
    },
    watch: {
        taskStatus: function(newStatus) {
            if(newStatus === 'task-later') this.laterStatus = true
        },
        taskProp: function(newTask) {
            this.taskPropCopy = JSON.parse(JSON.stringify(newTask))
            this.setTaskStatus(this.taskPropCopy)
            this.activeTask = ''
            this.taskComment = ''
            this.setExecutor()

        },
        currentTask: function(newTask) {
            this.taskPropCopy = JSON.parse(JSON.stringify(newTask))
            this.setTaskStatus(this.taskPropCopy)
            this.setExecutor()
        }
    },
    created() {
        this.taskPropCopy = JSON.parse(JSON.stringify(this.taskProp))
        this.setTaskStatus(this.taskPropCopy)
        this.setExecutor()
    },
    computed: {
        ...mapGetters('hr', ['getCitiesbyCountryId', 'getOfficesByCityId']),
        ...mapGetters('users', ['getUserById']),
        ...mapState('hr', ['countries']),
        ...mapState('groupparameters', ['groupParameters']),
        ...mapState('responses', ['response']),
        ...mapState('directory', ['resources', 'webcamResources', 'credential']),
        ...mapState('tasks', ['taskStatus', 'task']),
        ...mapState('dossier', ['dossier']),
        ...mapState('comments', ['comments']),

        cities() {
            return this.getCitiesbyCountryId(this.modelProfile.country)
        },
        offices() {
            return this.getOfficesByCityId(this.modelProfile.city)
        },
        currentTask() {
            return this.$store.state.tasks.currentTask
        },
        modelFields() {
            let responseFields = [{ key: 'gender', label: 'Пол', class: 'response-info_data-field-title' }]
            if(this.taskPropCopy.recipient?.birthday) responseFields.unshift({ key: 'birthday', label: 'Дата рождения', class: 'response-info_data-field-title' })
            return responseFields
        }
    },
    methods: {
        ...mapActions('tasks', ['editCurrentTask']),
        ...mapActions('responses', ['createResponse', 'editResponse', 'fetchComments', 'createComment']),
        ...mapActions('tasks', ['changeTaskArchive', 'editTask', 'deleteTask']),
        ...mapActions('comments', ['createTaskComment']),

        responseAction() {
            let responseObject = { vacancy: this.vacancyProp.id, ...modelProfile }
            if(this.modelProfile.id) this.editResponse(responseObject)
            else this.createResponse(responseObject)
        },
        setTaskStatus(task) {
            switch (task.status) {
                case 'active': task.status_trans = 'Активная задача', task.color = '#1A86D0'; break;
                case 'postponed': task.status_trans = 'Активная задача', task.color = '#1A86D0'; break;
                case 'completed': task.status_trans = 'Выполненная задача', task.color = '#21AE8C'; break;
                case 'archive': task.status_trans = 'Архивирована', task.color = '#C1CCD3'; break;
            }
        },
        dateChange() {
            this.responseAction()
            this.focusField('birthday')
        },
        resourceChange() {
            this.responseAction()
            this.focusField('resource')
        },
        setExecutor() {
            if(this.taskPropCopy.responsible_user_list) {
                this.currentUsersUpdated = this.taskPropCopy.responsible_user_list
                this.currentUsersUpdated.unshift({id: null, fullname: 'Исполнитель не назначен'})
            }
            if(this.taskPropCopy.next_responsible_user_list) {
                this.nextCurrentUsersUpdated = this.taskPropCopy.next_responsible_user_list
                this.nextCurrentUsersUpdated.unshift({id: null, fullname: 'Исполнитель не назначен'})
            }
            if(this.taskPropCopy && this.taskPropCopy.user) this.currentExecutor = this.taskPropCopy.user
        },
        genderChange() {
            this.responseAction()
            this.focusField('gender')
        },
        toggleAccordion(field, index) {
            if (this[field] !== index) Vue.set(this, field, index);
            else Vue.set(this, field, -1);
        },
        setActiveTask(taskName) {
            this.activeTask = taskName
        },
        archiveAction() {
            // if(this.taskComment) this.createTaskComment({ id: this.taskPropCopy.id, comment: this.taskComment, type: 'archived' })
            if(this.responseReject) this.changeTaskArchive({ id: this.taskPropCopy.id, rejected: true })
            else this.changeTaskArchive({ id: this.taskPropCopy.id, rejected: false })
        },
        doLaterAction() {
            // if(this.taskComment) this.createTaskComment({ id: this.taskPropCopy.id, comment: this.taskComment, type: 'postponed' })
            this.editTask({ id: this.taskPropCopy.id, status: 'postponed', result: this.taskComment, complete_at: this.taskPropCopy.complete_at })
        },
        openActionForm(action) {
            this.activeTask = action
        },
        closeForm() {
            this.activeTask = 'close'
        },
        focusField(fieldName) {
            this.shownErrors = this.shownErrors.filter(error => error !== fieldName);
        },
        restoreAction() {
            if(this.taskComment) this.createTaskComment({ id: this.taskPropCopy.id, comment: this.taskComment })
            this.editTask({ id: this.taskPropCopy.id, status: 'completed' })
        },
        addErrorNotification() {
            this.$toasted.info('Не заполнены обязательные поля', {
                className: ['toasted-error'],
                action: {
                text: 'X',
                onClick: (e, toastObject) => {
                    toastObject.goAway(0);
                }
                },
            })
        },
        setNewExecutor(executor) {
            this.editCurrentTask({ id: this.taskProp.id, user: executor.id })
        },
        setNewTime(time) {
            this.editCurrentTask({ id: this.taskPropCopy.id, complete_at: time })
        }
    },
};
</script>
