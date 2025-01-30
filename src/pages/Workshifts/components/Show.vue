<template>
    <div class="workshifts-show">

    </div>
</template>

<script>
    import Vue from 'vue';
    import Helper from '@/components/Helper/Helper.vue';
    import GroupPicker from "./GroupPicker";
    import Details from "./Details";
    import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
    import AddGroups from '@/pages/Profile/components/AddGroups/AddGroups';
    import Draggable from "vuedraggable";
    import moment from 'moment';
    import Select from "@/components/Common/Select/Select";
    moment.locale('ru');

    export default {
        name: 'show',
        components: {
            'helper': Helper,
            'group-picker': GroupPicker,
            'workshift-details': Details,
            'mini-profile': MiniProfile,
            'add-groups': AddGroups,
            'draggable': Draggable,
            'custom-select': Select
        },
        data() {
            return {
                currentWorkshifts: [],
                activeGroup: {},
                dateFormat: 'day',
                activeDate: moment().format('YYYY-MM-DD'),
                activeWorkshift: {},
                droverType: '',
                showType: {
                    reserved: true,
                    canceled: true
                },
                activeCollapses: [],
                submittedWorkshift: {},
                filters: {}
            }
        },
        computed: {
            currentSchedule() {
                return this.$store.state.schedule.currentSchedule;
            },
            workshiftStatuses() {
                return this.$store.state.schedule.workshiftStatuses;
            },
            currentDatesText() {
                if (this.dateFormat === 'day') return moment(this.activeDate).format('dddd, DD.MM.YYYY');
                let date = moment(this.activeDate);
                date.weekday(-1);
                let text = date.format('DD.MM.YYYY');
                date.add(6, 'd');
                return `${text} - ${date.format('DD.MM.YYYY')}`;
            },
            currentDatesArray() {
                if (this.dateFormat === 'day') return [this.activeDate];
                return this.activeWeekArray;
            },
            activeWeekArray() {
                let date = moment(this.activeDate);
                date.weekday(-2);
                return [0,1,2,3,4,5,6].map(() => {
                    date.add(1, 'd');
                    return date.format('YYYY-MM-DD');
                })
            },
            /*filteredSchedule() {
                if (!this.currentSchedule.workshifts) return [];
                if (this.showType.canceled && this.showType.reserved) return this.currentSchedule.workshifts;
                let schedule = {},
                    emptySchedule = true;

                for (let date in this.currentSchedule.workshifts) {
                    schedule[date] = {};
                    let dateIsEmpty = true;
                    for (let period in this.currentSchedule.workshifts[date]) {
                        schedule[date][period] = {};
                        let periodIsEmpty = true;
                        for (let room in this.currentSchedule.workshifts[date][period]) {
                            if ((room === 'reserve') && !this.showType.reserved) continue;
                            let shifts = this.showType.canceled ? this.currentSchedule.workshifts[date][period][room].workshifts :
                                this.currentSchedule.workshifts[date][period][room].workshifts.filter(shift => shift.status !== 'canceled');
                            if (shifts && shifts.length) {
                                schedule[date][period][room] = {
                                    number: this.currentSchedule.workshifts[date][period][room].number,
                                    title: this.currentSchedule.workshifts[date][period][room].title,
                                    workshifts: shifts
                                };
                                dateIsEmpty = false;
                                periodIsEmpty = false;
                                emptySchedule = false;
                            }
                        }
                        if (periodIsEmpty) delete schedule[date][period];
                    }
                    if (dateIsEmpty) delete schedule[date];
                }

                return emptySchedule ? [] : schedule;
            },*/
            layoutStatus() {
                return this.$store.state.layout.layoutStatus;
            },
            userPermissions() {
                return this.$store.state.auth.userPermissions
            },
            disabledReserveButton() {
                return this.userPermissions.schedule.reserve.view || this.userPermissions.schedule.edit || this.userPermissions.schedule.actual.start.date.edit || this.userPermissions.schedule.actual.end.date.edit || this.userPermissions.schedule.break.edit
            },
            profile() {
                return this.$store.getters["profile/shortProfile"](this.submittedWorkshift.model?.id);
            },
            activeUserGroups() {
                if (!this.submittedWorkshift.model?.id) return [];
                return this.profile?.profile?.groups.map(group => group.id) || [];
            },
            userStatus() {
              return this.$store.state.users.status;
            },
        },
        watch: {
            activeGroup: function (newGroup) {
                if (newGroup.type === 'office') this.updateWorkshifts(newGroup);
                this.filters = {};
                this.showType = {
                    reserved: true,
                    canceled: true
                };
                this.activeCollapses = [];
            },
            layoutStatus: function (newStatus) {
                if (newStatus === 'blackout-screen-close') {
                    this.droverType = '';
                    this.updateWorkshifts(this.activeGroup);
                }
            },
            userStatus: function (newStatus, prevStatus) {
              if (newStatus !== '') return;
              if (prevStatus === 'editing' && this.droverType === 'add-groups') {
                this.droverType = 'mini-profile'
              }
            },
            currentSchedule: function (nextScheduleObject) {
                // if (Object.keys(this.currentWorkshifts).length) return;
                this.setCurrentWorkshifts(nextScheduleObject);
            },
        },
        methods: {
            setDateFormat(format) {
                this.dateFormat = format;
            },
            toggleShowType(type) {
                if(type === 'reserved' && !this.disabledReserveButton) return;
                let showType = {
                    ...this.showType,
                    [type]: !this.showType[type]
                }
                // this.setCurrentWorkshifts(undefined, showType);
                this.showType = showType;
            },
            clearFilters() {
                this.filters = {};
                this.showType = {
                    reserved: true,
                    canceled: true
                };
                this.setCurrentWorkshifts();
            },
            addDate() {
                let date = moment(this.activeDate);
                // let lastDate = moment();
                //
                // lastDate.weekday(this.dateFormat === 'day' ? 4 : -1);
                // if (date > lastDate) return;

                date.add(this.dateFormat === 'day' ? 1 : 7, 'd');
                this.activeDate = date.format('YYYY-MM-DD');
                if ((date.weekday() === 6) || (this.dateFormat === 'week')) this.updateWorkshifts();
            },
            subtractDate() {
                let date = moment(this.activeDate);
                date.subtract(this.dateFormat === 'day' ? 1 : 7, 'd');
                this.activeDate = date.format('YYYY-MM-DD');
                if ((date.weekday() === 5) || (this.dateFormat === 'week')) this.updateWorkshifts();
            },
            updateWorkshifts(group = this.activeGroup) {
                if (group.type !== 'office') return this.currentWorkshifts = {};
                this.$store.dispatch('schedule/fetchSchedule', {office: group.id, 'workweek': this.activeDate, pagination: false});
            },
            getTimeFromDate(date) {
                return moment(date).utc().format('HH:mm');
            },
            clickCollapse(id) {
                if (this.activeCollapses.includes(id)) this.activeCollapses = this.activeCollapses.filter(currentId => currentId !== id);
                else this.activeCollapses = [...this.activeCollapses, id];
                this.$root.$emit('bv::toggle::collapse', id);
            },
            formatDate(date) {
                return moment(date).format('dddd, DD.MM');
            },
            formatDateTime(date) {
                return moment(date).format('DD.MM.YYYY, HH:mm');
            },
            clickRow(shift) {
                this.activeWorkshift = shift;
                this.droverType = 'details';
                this.$store.dispatch('layout/toggleHelper', true);
            },
            openMiniProfile(workshift) {
                this.submittedWorkshift = workshift
                this.droverType = 'mini-profile'
            },
            closeDrover() {
                this.$store.dispatch('layout/toggleHelper', false);
            },
            openWorkshiftDetails() {
                this.droverType = 'details';
                this.$store.dispatch('layout/toggleHelper', true);
            },
            userEditGroups(permissions) {
                this.droverType = 'add-groups';
                this.groupEditPermissions = permissions;
            },
            getModelName(model) {
                return this.userPermissions.model.profile.personal.view ? model.surname : model.fullname;
            },
            getOperatorName(operator) {
                return this.userPermissions.employee.view ? operator.surname : operator.fullname;
            },
            backToUserDetails() {
              this.droverType = 'mini-profile';
            },
            editShift(shift) {
                if (!(shift.model && shift.model.id) || !shift.planned_start_at || !shift.planned_end_at) return;
                if (typeof shift.id === 'string') return this.createShift(shift);
                this.$store.dispatch('schedule/editWorkshift', {
                    id: shift.id,
                    planned_start_at: shift.planned_start_at,
                    planned_end_at: shift.planned_end_at,
                    model: shift.model.id,
                    operator: shift.operator && shift.operator.id,
                    work_shift: shift.work_shift,
                    room: shift.room && shift.room.id,
                    status: shift.status
                });
            },
            moveWorkshift(date, periodString, roomId, e) {
                if (!e.added) return;
                let workshift = e.added.element,
                    period = periodString.split(' - '),
                    dateObj = moment(workshift.planned_start_at);

                if ((period[0] !== workshift.work_shift.from) || (period[1] !== workshift.work_shift.to)) {
                    dateObj = moment(date);
                    let from = period[0].split(':'),
                        to = period[1].split(':');

                    dateObj.hours(from[0]).minutes(from[1]);
                    workshift.planned_start_at = dateObj.format('YYYY-MM-DDTkk:mm:ss');
                    dateObj = moment(date);
                    if (parseInt(from[0]) >= parseInt(to[0])) dateObj.add(1, 'd');
                    dateObj.hours(to[0]).minutes(to[1]);
                    workshift.planned_end_at = dateObj.format('YYYY-MM-DDTkk:mm:ss');
                    workshift.work_shift = {
                        from: period[0],
                        to: period[1]
                    }
                } else if (dateObj.format('YYYY-MM-DD') !== date) {
                    let from = [dateObj.hour(), dateObj.minute()],
                        dateObjStart = moment(date);

                    dateObjStart.hours(from[0]).minutes(from[1]);
                    workshift.planned_start_at = dateObjStart.format('YYYY-MM-DDTkk:mm:ss');
                    let dateObjEnd = moment(workshift.planned_end_at);
                    let to = [dateObjEnd.hour(), dateObjEnd.minute()];
                    if (from[0] >= to[0]) dateObj.add(1, 'd');
                    dateObjStart.hours(to[0]).minutes(to[1]);
                    workshift.planned_end_at = dateObjStart.format('YYYY-MM-DDTkk:mm:ss');
                }

                workshift.room = roomId === 'without_room' ? null : {id: roomId};

                if (workshift.status === 'created') workshift.status = 'assigned';

                this.preventEdit = false;
                this.editShift(workshift);
            },
            startDrag(date, periodString, roomId, e) {
                this.movingShiftData = {date, periodString, roomId, key: e.oldIndex};
                this.preventEdit = true;
                this.movingShift = true;
            },
            endDrag() {
                setTimeout(() => {this.preventEdit = false;}, 1000);
                this.movingShift = false;
            },
            setCurrentWorkshifts(nextScheduleObject = this.currentSchedule, newShowType) {
                let showType = newShowType || this.showType;
                this.activeShiftGroups = {};
                let nextSchedule = nextScheduleObject.workshifts;
                let emptySchedule = {};
                this.activeWeekArray.map(date => {
                    emptySchedule[date] = {}
                    nextScheduleObject.periods.map(period => {
                        emptySchedule[date][`${period.from} - ${period.to}`] = {}
                        nextScheduleObject.rooms.map(room => {
                            emptySchedule[date][`${period.from} - ${period.to}`][room.id] = {
                                number: room.number,
                                workshifts: nextSchedule[date] &&
                                nextSchedule[date][`${period.from} - ${period.to}`] &&
                                nextSchedule[date][`${period.from} - ${period.to}`][room.id] &&
                                nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts ?
                                    ((showType.canceled && !this.filters.model) ? JSON.parse(JSON.stringify(nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts))
                                        : JSON.parse(JSON.stringify(nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts)).filter(shift => (showType.canceled || (shift.status !== 'canceled')) && (!this.filters.model || (shift.model.id === this.filters.model))))
                                    : [],
                            }
                        })
                        let shiftsWithoutRoom = nextSchedule[date] &&
                            nextSchedule[date][`${period.from} - ${period.to}`] &&
                            nextSchedule[date][`${period.from} - ${period.to}`].without_room &&
                            nextSchedule[date][`${period.from} - ${period.to}`].without_room.workshifts
                        if (shiftsWithoutRoom && shiftsWithoutRoom.length) emptySchedule[date][`${period.from} - ${period.to}`].without_room = { workshifts: shiftsWithoutRoom }

                        if (showType.reserved) {
                            let reservedWithoutRoom = nextSchedule[date] &&
                                nextSchedule[date][`${period.from} - ${period.to}`] &&
                                nextSchedule[date][`${period.from} - ${period.to}`].reserve &&
                                nextSchedule[date][`${period.from} - ${period.to}`].reserve.workshifts;

                            if (reservedWithoutRoom && this.filters.model) reservedWithoutRoom = reservedWithoutRoom.filter(shift => shift.model.id === this.filters.model);
                            if (reservedWithoutRoom && reservedWithoutRoom.length) emptySchedule[date][`${period.from} - ${period.to}`].reserve = { workshifts: reservedWithoutRoom }
                        }
                    })
                })

                this.currentWorkshifts = emptySchedule
            }
        }
    }
</script>
