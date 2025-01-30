<template>
    <div class="model_mini_profile">
        <div class="user_details-header">
            <b-button variant="outline-primary" size="sm" class="mr-2" :to="`/app/profile/${userId}`">Открыть профиль</b-button>
            <template v-if="user.email">
                <b-button variant="outline-primary" size="sm" class="mr-2" @click="resetPassword">Восстановить пароль</b-button>
<!--                <template >
                    <b-button v-if="user.blocked" variant="outline-success" size="sm" @click="toggleBlocked">Разблокировать</b-button>
                    <b-button v-else variant="outline-danger" size="sm" @click="toggleBlocked">Заблокировать</b-button>
                </template>-->
            </template>
        </div>
        <div class="response-link" @click="openShiftInfo">
            &lt; Информация о смене
        </div>
        <div class="user_details-main-user model_mini_profile-model_container">
            <div class="user_details-main-user-avatar">
                <div class="user_details-main-user-avatar-img avatar -lg" :style="changedWorkshift.model.avatar ? `background-image: url(${changedWorkshift.model.avatar}); background-size: cover;` : ''"></div>
            </div>
            <div class="user_details-main-user-info">
                <b>{{ changedWorkshift.model.fullname }}</b>
                <span>{{ changedWorkshift.group.path }}</span>
            </div>
        </div>
        <div class="response-info_data">
            <div class="response-info_data-title" @click="toggleAccordion('infoFieldVisible', 0)">
                <p class="response-info_data-title-text">Информация</p>
                <i :class="`fa fa-angle-down`"/>
            </div>
            <b-collapse :visible="infoFieldVisible === 0">
        <div class="user_details-main">
            <div class="user_details-main-data">
                <div class="row mb-3">
                    <div class="col-6">
                        <b>Группы</b>
                    </div>
                    <div class="col-6">
                        <div class="user_details-main-data-group" v-for="(group, key) in user.groups" :key="key">
                            <p class="user_details-main-data-group-title">{{ group.title }}</p>
                            <p v-if="group.path" class="user_details-main-data-group-path">{{ group.path }}</p>
                        </div>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <b>Дата рождения</b>
                    </div>
                    <div class="col-6">
                        <span>{{ formattedDate }}</span>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <b>Телефон</b>
                    </div>
                    <div class="col-6">
                        <span>{{ user.phone }}</span>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <b>Дополнительный телефон</b>
                    </div>
                    <div class="col-6">
                        <span>{{ user.additional_phone }}</span>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <b>Email</b>
                    </div>
                    <div class="col-6">
                        <span>{{ user.email }}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <b>Пол</b>
                    </div>
                    <div class="col-6">
                        <span>{{ user.gender && genders[user.gender] || 'Не указан' }}</span>
                    </div>
                </div>
            </div>
        </div>
            </b-collapse>
        </div>
        <div class="response-info_data">
            <div class="response-info_data-title" @click="toggleAccordion('scheduleFieldVisible', 0)">
                <p class="response-info_data-title-text">Расписание на неделю</p>
                <i :class="`fa fa-angle-down`"/>
            </div>
            <b-collapse :visible="scheduleFieldVisible === 0">
                <div class="model_mini_profile-schedule">
                    <div class="model_mini_profile-schedule-dates">
                        <div class="mr-1" @click="setWeek('last')">&lt;</div>
                        <p class="m-0">{{ beginningWeek }}</p>
                        <p class="mb-0 ml-1 mr-1">-</p>
                        <p class="m-0">{{ weekEnd }}</p>
                        <div class="ml-1" :style="week === 1 ? 'color: #C1CCD3;' : ''" @click="setWeek('next')">&gt;</div>
                    </div>
                    <b-button-group class="model_mini_profile-schedule-week">
                        <div class="model_mini_profile-schedule-week-day_container" v-for="(day, dayIndex) in daysUpdated" :key="dayIndex" >
                            <div class="model_mini_profile-schedule-week-day_container-day" variant="default" :class="day.active ? '-active' : '-default' ">
                                <p class="model_mini_profile-schedule-week-day_container-day-number">{{ moment().isoWeekday(1).add(week,'week').add(dayIndex,'days').format('D') }}</p>
                                <p class="model_mini_profile-schedule-week-day_container-day-title">{{ moment().isoWeekday(1).add(week,'week').add(dayIndex,'days').format('dd') }}</p>
                            </div>
                            <div class="model_mini_profile-schedule-week-day_container-periods">
                                <p class="model_mini_profile-schedule-week-day_container-periods-period" v-for="(period, periodIndex) in day.periods" :key="periodIndex">{{period}}</p>
                            </div>
                        </div>
                    </b-button-group>
                </div>
            </b-collapse>
        </div>
    </div>
</template>

<script>
    import {mapActions, mapGetters, mapState} from 'vuex';
    import Vue from 'vue';
    import moment from 'moment';
    moment.locale('ru');
    export default {
        name: 'model-mini-profile',
        props: {
            changedWorkshift: Object
        },
        data() {
            return {
                infoFieldVisible: -1,
                scheduleFieldVisible: -1,
                moment: moment,
                week: 0,
                days: [{active: true}, {active: true}, {active: true}, {active: true}, {active: true}, {active: true}, {active: true}], 
                userId: null,
                modelShedule: {}
            }
        },
        computed: {
            ...mapGetters('users', ['getUserById']),
            ...mapState('dictionaries', ['genders']),
            beginningWeek() {
                return moment().isoWeekday(1).add(this.week,'week').format('DD.MM.YYYY')
            },
            weekEnd() {
                return moment().isoWeekday(7).add(this.week,'week').format('DD.MM.YYYY')
            },
            user() {
                return this.getUserById(this.userId)
            },
            formattedDate() {
                if (!this.user.birthday) return '';
                return new Date(this.user.birthday).format('dd.mm.yyyy');
            },
            currentSchedule() {
                return this.$store.state.schedule.currentScheduleMiniProfile
            },
            daysUpdated() {
                let modelShedule = this.modelShedule,
                    week = this.week,
                    days = JSON.parse(JSON.stringify(this.days))
                return days.map(function(day, index) {
                    day.periods = []
                    for(const [key, value] of Object.entries(modelShedule)) {
                        if(key === moment().isoWeekday(index + 1).add(week,'week').format('YYYY-MM-DD')) {
                            for(const [field, result] of Object.entries(value)) day.periods.push(field)
                            day.active = false
                        }
                    }
                    return day
                })
            }
        },
        watch: {
            changedWorkshift: function(newWorkshift) {
                if(newWorkshift && newWorkshift.model) this.userId = newWorkshift.model.id
            },
            userId: function(newId) {
                this.fetchUser(newId)
            },
            currentSchedule: function(newSchedule) {
                if(newSchedule && newSchedule.workshifts) this.modelShedule = newSchedule.workshifts;
            }
        },
        created() {
            if(this.changedWorkshift && this.changedWorkshift.model) this.userId = this.changedWorkshift.model.id;
            if(this.userId) this.fetchUser(this.userId);
            this.setWeek();
        },
        methods: {
            ...mapActions('users', ['editUser', 'resetUserPassword', 'fetchUser']),
            toggleAccordion(field, index) {
                if (this[field] !== index) Vue.set(this, field, index);
                else Vue.set(this, field, -1);
            },
            setWeek(week) {
                if(week === 'next' && this.week < 1) this.week++;
                else if(week === 'last') this.week--;
                let query = {
                    office: this.changedWorkshift.group.id,
                    model: this.user.id,
                    pagination: false
                }
                if (this.week === 1) query['workweek[actual]'] = true;
                else query['workweek[archive]'] = this.moment().isoWeekday(1).add(this.week,'week').format('YYYY-MM-DD');
                this.$store.dispatch('schedule/fetchModelScheduleMiniProfile', query)
            },
            toggleBlocked() {
                this.editUser({id: this.userId, blocked: !this.user.blocked});
            },
            resetPassword() {
                this.resetUserPassword(this.userId)
            },
            openShiftInfo() {
                this.$emit('openWorkshiftDetails')
            }
        }
    }

</script>