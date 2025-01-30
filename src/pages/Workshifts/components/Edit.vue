<template>
    <div class="workshifts-edit">
        <div class="workshifts-edit-buttons">
            <b-button class="mr-3" variant="outline-primary" :disabled="!activeShifts.length || (status === 'updating')" @click="applyShifts">Утвердить расписание</b-button>
            <b-button variant="outline-danger" :disabled="!activeShifts.length || (status === 'deleting')" @click="deleteShifts">Удалить</b-button>
        </div>
        <div class="workshifts-filters card">
            <group-picker v-model="activeGroup" storageName="savedGroupEdit"/>
            <div class="workshifts-filters-main">
                <div class="workshifts-filters-main-params">
                    <custom-select v-model="filters.room" class="-filter" defaultText="Комната" :options="currentSchedule.rooms" valueField="id" />
                    <custom-select v-model="filters.model" class="-filter" defaultText="Модель" :options="currentSchedule.models" valueField="id" titleField="fullname" />
                    <custom-select v-model="filters.operator" class="-filter" defaultText="Оператор" :options="currentSchedule.operators" valueField="id" titleField="fullname" />
                    <custom-select v-model="filters.status" class="-filter" defaultText="Статус" :options="statuses" />
                </div>
                <div class="workshifts-filters-main-buttons">
                    <span class="workshifts-filters-main-buttons-button" @click="updateWorkshifts()">Применить фильтры</span>
                    <span class="workshifts-filters-main-buttons-button" @click="clearFilters">Сбросить</span>
                </div>
                <div class="workshifts-filters-main-date">
                    <div class="workshifts-filters-main-date-format" :class="dateFormat === 'day' ? '-active' : ''" @click="setDateFormat('day')">День</div>
                    <div class="workshifts-filters-main-date-format" :class="dateFormat === 'week' ? '-active' : ''" @click="setDateFormat('week')">Неделя</div>
                </div>
            </div>
        </div>
        <div v-if="(activeGroup.type === 'office') && activeGroup.settings && activeGroup.settings.work_shift && (showEmptyRows || !Array.isArray(currentWorkshifts))" class="workshifts-edit-main">
            <div class="workshifts-edit-main-buttons">
                <b-button variant="outline-primary" @click="showFreeModels">Модели без смен ({{freeModels.length}})</b-button>
            </div>
            <div class="workshifts-edit-main-datepicker">
                <div class="workshifts-edit-main-datepicker-prev" @click="subtractDate"></div>
                <div class="workshifts-edit-main-datepicker-current">
                    <span class="workshifts-edit-main-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
                    <h4 class="workshifts-edit-main-datepicker-current-text">{{ currentDatesText }}</h4>
                </div>
                <div class="workshifts-edit-main-datepicker-next" @click="addDate"></div>
            </div>
            <div v-for="date in currentDatesArray" v-if="showEmptyRows || currentWorkshifts[date]" class="workshifts-edit-main-date">
                <div v-for="(workshiftsOfPeriod, periodString, index) in currentWorkshifts[date]" v-if="showEmptyRows || workshiftsOfPeriod" class="workshifts-edit-main-date-period">
                    <div v-if="dateFormat === 'day'" class="workshifts-edit-main-date-period-title">{{ periodString }}</div>
                    <div v-else-if="index === 0" class="workshifts-edit-main-date-period-title">
                        <span class="workshifts-edit-main-date-period-title-date">{{ formatDate(date) }}</span>
                        <span>{{ periodString }}</span>
                    </div>
                    <div v-else class="workshifts-edit-main-date-period-title -right">{{ periodString }}</div>
                    <div class="workshifts-edit-main-date-period-table card">
                        <div class="workshifts-edit-main-date-period-table-row -head">
                            <div class="workshifts-edit-main-date-period-table-row-id">#</div>
                            <div class="workshifts-edit-main-date-period-table-row-shifts">
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift">
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model">Модель</div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">Оператор</div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">Начало</div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">Конец</div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status">Статус</div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox">
                                        <div class="abc-checkbox d-flex">
                                            <input type="checkbox"
                                                   :id="`checkbox-all-${date}-${periodString}`"
                                                   :checked="activeShiftGroups[date] && activeShiftGroups[date][`${periodString}`]"
                                                   @change="onToggleAllActiveWorkshift(date, periodString)"
                                            />
                                            <label :for="`checkbox-all-${date}-${periodString}`" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-for="(workshiftsOfRoom, roomId) in workshiftsOfPeriod" class="workshifts-edit-main-date-period-table-row">
                            <div v-if="roomId === 'without_room'" class="workshifts-edit-main-date-period-table-row-id"><span class="glyphicon glyphicon-home"></span></div>
                            <div v-else class="workshifts-edit-main-date-period-table-row-id">{{ workshiftsOfRoom.number }}</div>
                            <draggable v-model="workshiftsOfRoom.workshifts"
                                       group="workshifts"
                                       filter=".-placeholder"
                                       :preventOnFilter="false"
                                       class="workshifts-edit-main-date-period-table-row-shifts"
                                       :forceFallback="true"
                                       @change="moveWorkshift(date, periodString, roomId, $event)"
                                       @start="startDrag(date, periodString, roomId, $event)"
                                       @end="endDrag">
                                <template v-if="workshiftsOfRoom.workshifts.length">
                                    <div v-for="(shift, subkey) in workshiftsOfRoom.workshifts" class="workshifts-edit-main-date-period-table-row-shifts-shift" :key="subkey">
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model">
                                            <v-select
                                                    v-model="shift.model"
                                                    :options="currentSchedule.models"
                                                    :label="userPermissions.model.profile.personal.view ? 'surname' : 'fullname'"
                                                    maxHeight="120px"
                                                    @change="editShift(shift)"
                                            >
                                                <template #no-options="{ search, searching, loading }">
                                                    Нет подходящих вариантов.
                                                </template>
                                            </v-select>
                                        </div>
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">
                                            <v-select
                                                    v-model="shift.operator"
                                                    :options="currentSchedule.operators"
                                                    :label="userPermissions.employee.view ? 'surname' : 'fullname'"
                                                    maxHeight="120px"
                                                    @change="editShift(shift)"
                                            >
                                                <template #no-options="{ search, searching, loading }">
                                                    Нет подходящих вариантов.
                                                </template>
                                            </v-select>
                                        </div>
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                            <custom-select
                                                    v-model="shift.planned_start_at"
                                                    :options="getOptionsFromPeriod(periodString, date)"
                                                    :default-text="'--:--'"
                                                    @change="editShift(shift)"
                                            />
                                        </div>
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                            <custom-select
                                                    v-model="shift.planned_end_at"
                                                    :options="getOptionsFromPeriod(periodString, date)"
                                                    :default-text="'--:--'"
                                                    @change="editShift(shift)"
                                            />
                                        </div>
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status">
                                            <div v-if="shift.status === 'assigned'" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-status -assigned">Назначена</div>
                                        </div>
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox">
                                            <div class="abc-checkbox d-flex">
                                                <input type="checkbox"
                                                       :id="`checkbox-${shift.id}`"
                                                       v-model="activeShifts"
                                                       :value="shift.id"
                                                       :disabled="typeof shift.id === 'string'"
                                                       @change="onToggleActiveWorkshift(date, periodString)"/>
                                                <label :for="`checkbox-${shift.id}`" />
                                            </div>
                                        </div>
                                        <draggable v-model="swapPlaceholder"
                                                   group="workshifts"
                                                   filter=".-placeholder"
                                                   :preventOnFilter="false"
                                                   class="workshifts-edit-main-date-period-table-row-shifts-shift-dropzone"
                                                   :class="movingShift ? '-active' : ''"
                                                   :emptyInsertThreshold="0"
                                                   @change="swapWorkshifts(shift, date, periodString, roomId, subkey, $event)" />
                                    </div>
                                </template>
                                <div v-else-if="showEmptyRows" class="workshifts-edit-main-date-period-table-row-shifts-shift -placeholder">
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model">
                                        <v-select
                                                :options="currentSchedule.models"
                                                :label="userPermissions.model.profile.personal.view ? 'surname' : 'fullname'"
                                                maxHeight="120px"
                                                @change="createLocalShift(date, periodString, roomId, 'model', $event)"
                                        >
                                            <template #no-options="{ search, searching, loading }">
                                                Нет подходящих вариантов.
                                            </template>
                                        </v-select>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">
                                        <v-select
                                                :options="currentSchedule.operators"
                                                :label="userPermissions.employee.view ? 'surname' : 'fullname'"
                                                maxHeight="120px"
                                                @change="createLocalShift(date, periodString, roomId, 'operator', $event)"
                                        >
                                            <template #no-options="{ search, searching, loading }">
                                                Нет подходящих вариантов.
                                            </template>
                                        </v-select>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                        <custom-select
                                                :options="getOptionsFromPeriod(periodString, date)"
                                                :default-text="'--:--'"
                                                @change="createLocalShift(date, periodString, roomId, 'planned_start_at', $event)"
                                        />
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                        <custom-select
                                                :options="getOptionsFromPeriod(periodString, date)"
                                                :default-text="'--:--'"
                                                @change="createLocalShift(date, periodString, roomId, 'planned_end_at', $event)"
                                        />
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status"></div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox">
                                        <div class="abc-checkbox d-flex">
                                            <input type="checkbox" :id="`checkbox-new-${date}-${periodString}-${roomId}`" disabled/>
                                            <label :for="`checkbox-new-${date}-${periodString}-${roomId}`" />
                                        </div>
                                    </div>
                                </div>
                            </draggable>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="dateFormat === 'day'" class="workshifts-edit-main-empty">
                <h3>Расписание не найдено</h3>
                <p>Для отображения расписания выберите страну, город и офис</p>
            </div>
        </div>
        <div v-else class="workshifts-edit-main-empty">
            <h3>Расписание не найдено</h3>
            <p>Для отображения расписания выберите страну, город и офис</p>
        </div>
        <helper>
            <free-models v-if="droverType === 'free-models'" :free-models="freeModels" @open-schedule="openSchedule" />
            <model-schedule v-else-if="droverType === 'model-schedule'" :modelData="activeModel" :office="activeGroup" :rooms="currentSchedule.rooms" :operators="currentSchedule.operators" :workshiftPeriods="currentSchedule.periods" showModel backButton="Информация о смене" @go-back="showFreeModels" />
        </helper>
    </div>
</template>

<script>
    import vSelect from 'vue-select';
    import { mapActions, mapState } from 'vuex';
    import Helper from '@/components/Helper/Helper.vue';
    import Draggable from "vuedraggable";
    import GroupPicker from "./GroupPicker";
    import Select from "@/components/Common/Select/Select";
    import FreeModels from "./FreeModels/FreeModels";
    import ModelSchedule from '@/components/ModelSchedule/ModelSchedule';
    import moment from 'moment';
    moment.locale('ru');

    export default {
        name: 'edit',
        components: {
            'v-select': vSelect,
            'draggable': Draggable,
            'group-picker': GroupPicker,
            'custom-select': Select,
            'helper': Helper,
            'free-models': FreeModels,
            'model-schedule': ModelSchedule
        },
        data() {
            return {
                activeShifts: [],
                activeShiftGroups: {},
                activeGroup: {
                    rooms: []
                },
                activeDate: '',
                activeModel: {},
                currentWorkshifts: {},
                dateFormat: 'day',
                filters: {},
                showEmptyRows: true,
                statuses: [
                    {
                        title: 'Создана',
                        value: 'created'
                    },
                    {
                        title: 'Назначена',
                        value: 'assigned'
                    }
                ],
                activeRoom: null,
                preventEdit: false,
                movingShift: false,
                movingShiftData: {},
                swapPlaceholder: [],
                droverType: ''
            }
        },
        computed: {
            ...mapState('schedule', ['freeModels']),
            groups() {
                return this.$store.state.groups.groups;
            },
            currentSchedule() {
                return this.$store.state.schedule.currentSchedule;
            },
            status() {
                return this.$store.state.schedule.status;
            },
            currentDatesText() {
                if (this.dateFormat === 'day') return moment(this.activeDate).format('dddd, DD.MM.YYYY');
                let date = moment(this.activeDate);
                if (date.weekday() !== 6) date.weekday(-1);
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
                if (date.weekday() !== 6) date.weekday(-2);
                else date.weekday(5);
                return [0,1,2,3,4,5,6].map(() => {
                    date.add(1, 'd');
                    return date.format('YYYY-MM-DD');
                })
            },
            layoutStatus() {
                return this.$store.state.layout.layoutStatus;
            },
            userPermissions() {
                return this.$store.state.auth.userPermissions;
            }
        },
        watch: {
            activeGroup: function (nextGroup) {
                if(nextGroup.type === 'office') this.$store.dispatch('schedule/fetchFreeModels', nextGroup.id);
                this.filters = {};
                this.updateWorkshifts(nextGroup);
            },
            currentSchedule: function (nextScheduleObject) {
                if (!Object.keys(this.currentWorkshifts).length) {
                  this.activeShiftGroups = {}
                  let nextSchedule = nextScheduleObject.workshifts
                  if (!this.showEmptyRows) return this.currentWorkshifts = JSON.parse(JSON.stringify(nextSchedule))
                  let emptySchedule = {}
                  this.activeWeekArray.map(date => {
                    emptySchedule[date] = {}
                    this.activeGroup.settings.work_shift.map(period => {
                      emptySchedule[date][`${period.from} - ${period.to}`] = {}
                      nextScheduleObject.rooms.map(room => {
                        emptySchedule[date][`${period.from} - ${period.to}`][room.id] = {
                          number: room.number,
                          workshifts: nextSchedule[date] &&
                          nextSchedule[date][`${period.from} - ${period.to}`] &&
                          nextSchedule[date][`${period.from} - ${period.to}`][room.id] &&
                          nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts ?
                              JSON.parse(JSON.stringify(nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts)) : [],
                        }
                      })
                      let shiftsWithoutRoom = nextSchedule[date] &&
                          nextSchedule[date][`${period.from} - ${period.to}`] &&
                          nextSchedule[date][`${period.from} - ${period.to}`].without_room &&
                          nextSchedule[date][`${period.from} - ${period.to}`].without_room.workshifts
                      if (shiftsWithoutRoom && shiftsWithoutRoom.length) emptySchedule[date][`${period.from} - ${period.to}`].without_room = { workshifts: shiftsWithoutRoom }
                    })
                  })

                  this.currentWorkshifts = emptySchedule
                }
            },
            status: function (nextStatus, prevStatus) {
                if (nextStatus === 'request') this.preventEdit = true;
                else if (nextStatus === '') {
                    switch (prevStatus) {
                        case 'request':
                            setTimeout(() => {this.preventEdit = false;}, 1000);
                            break;
                        case 'updating':
                            this.$toasted.success(`Смены утверждены`, {
                                position: 'bottom-left',
                                keepOnHover: true,
                                duration: 5000,
                                action: [
                                    {
                                        text: '',
                                        class: 'btn-close',
                                        onClick: this.closeToast
                                    }
                                ]
                            });
                            this.updateWorkshifts();
                            break;
                        case 'deleting':
                            this.$toasted.success(`Смены удалены`, {
                                position: 'bottom-left',
                                keepOnHover: true,
                                duration: 5000,
                                action: [
                                    {
                                        text: '',
                                        class: 'btn-close',
                                        onClick: this.closeToast
                                    }
                                ]
                            });
                            this.updateWorkshifts();
                            break;
                    }
                }
            },
            layoutStatus: function (newStatus) {
                if (newStatus === 'blackout-screen-close') {
                    this.droverType = '';
                    this.updateWorkshifts();
                }
            }
        },
        created() {
            this.activeDate = moment().weekday(7).format('YYYY-MM-DD');
        },
        methods: {
            ...mapActions('layout', ['toggleHelper']),
            applyShifts() {
                this.$store.dispatch('schedule/approveWorkshifts', this.activeShifts);
            },
            deleteShifts() {
                this.$store.dispatch('schedule/deleteWorkshifts', this.activeShifts);
            },
            showFreeModels() {
                this.$store.dispatch('schedule/fetchFreeModels', this.activeGroup.id);
                this.droverType = 'free-models';
                this.toggleHelper(true);
            },
            setDateFormat(format) {
                this.dateFormat = format;
            },
            addDate() {
                this.preventEdit = true;
                setTimeout(() => {this.preventEdit = false;}, 1000);
                let date = moment(this.activeDate);
                if (date.weekday() === 6) return;
                date.add(1, 'd');
                this.activeDate = date.format('YYYY-MM-DD');
            },
            subtractDate() {
                this.preventEdit = true;
                setTimeout(() => {this.preventEdit = false;}, 1000);
                let date = moment(this.activeDate);
                if (date.weekday() === 0) return;
                date.subtract(1, 'd');
                this.activeDate = date.format('YYYY-MM-DD');
            },
            getOptionsFromPeriod(periodString, dateString) {
                let period = periodString.split(' - '),
                    options = [],
                    from = period[0].split(':'),
                    to = period[1].split(':'),
                    currentTime = [...from],
                    date = moment(dateString);

                date.hours(currentTime[0]).minutes(currentTime[1]);
                options.push({title: currentTime.join(':'), value: date.format('YYYY-MM-DDTkk:mm:ss')});

                while (!((currentTime[0] === to[0]) && (currentTime[1] === to[1]))) {
                    if (currentTime[1] === '30') {
                        if (currentTime[0] === '23') {
                            currentTime = ['00', '00'];
                            date.add(1, 'd');
                        }
                        else {
                            let newHours = (parseInt(currentTime[0]) + 1).toString();
                            if (newHours.length === 1) newHours = `0${newHours}`;
                            currentTime = [newHours, '00'];
                        }
                    } else currentTime[1] = '30';
                    date.hours(currentTime[0]).minutes(currentTime[1]);
                    options.push({title: currentTime.join(':'), value: date.format('YYYY-MM-DDTkk:mm:ss')});
                }

                return options;
            },
            getTimeFromDate(date) {
                return moment(date).utc().format('HH:mm');
            },
            createLocalShift(date, periodString, roomId, type, value) {
                let period = periodString.split(' - '),
                    newWorkshifts = {...this.currentWorkshifts},
                    newWorkshift = {
                        room: {id: roomId},
                        work_shift: {
                            from: period[0],
                            to: period[1]
                        },
                        id: `fake-${new Date().getTime()}`
                    },
                    from = period[0].split(':'),
                    to = period[1].split(':'),
                    dateObj = moment(date);

                dateObj.hours(from[0]).minutes(from[1]);
                newWorkshift.planned_start_at = dateObj.format('YYYY-MM-DDTkk:mm:ss');
                dateObj = moment(date);
                if (parseInt(from[0]) >= parseInt(to[0])) dateObj.add(1, 'd');
                dateObj.hours(to[0]).minutes(to[1]);
                newWorkshift.planned_end_at = dateObj.format('YYYY-MM-DDTkk:mm:ss');
                newWorkshift[type] = value;
                newWorkshifts[date][periodString][roomId].workshifts = newWorkshifts[date][periodString][roomId].workshifts ? [...newWorkshifts[date][periodString][roomId].workshifts, newWorkshift] : [newWorkshift];

                this.currentWorkshifts = newWorkshifts;
            },
            editShift(shift) {
                if (this.preventEdit || !(shift.model && shift.model.id) || !shift.planned_start_at || !shift.planned_end_at) return;
                if (typeof shift.id === 'string') return this.createShift(shift);
                this.$store.dispatch('schedule/editWorkshift', {
                    id: shift.id,
                    planned_start_at: shift.planned_start_at,
                    planned_end_at: shift.planned_end_at,
                    model: shift.model.id,
                    operator: shift.operator && shift.operator.id,
                    work_shift: shift.work_shift,
                    room: shift.room && shift.room.id
                });

                //work_shift_interval: ['placeholder'],
            },
            async createShift(shift) {
                if (!(shift.model && shift.model.id) || !shift.planned_start_at || !shift.planned_end_at) return;
                shift.id = await this.$store.dispatch('schedule/createWorkshift', {
                    work_shift_interval: [
                        {
                            from: shift.planned_start_at,
                            to: shift.planned_end_at,
                            operator: shift.operator && shift.operator.id,
                            room: shift.room.id
                        }
                    ],
                    model: shift.model.id,
                    group: this.activeGroup.id
                });
            },
            onToggleActiveWorkshift(date, periodString) {
                let period = periodString.split(' - '),
                    activeShiftGroups = {...this.activeShiftGroups};
                if (!activeShiftGroups[date]) activeShiftGroups[date] = {};
                activeShiftGroups[date][`${period[0]} - ${period[1]}`] = Object.values(this.currentWorkshifts[date][`${period[0]} - ${period[1]}`]).every(room => room.workshifts.every(shift => !shift.id || this.activeShifts.includes(shift.id)));
                this.activeShiftGroups = activeShiftGroups;
            },
            onToggleAllActiveWorkshift(date, periodString) {
                let period = periodString.split(' - ');
                if (!(this.currentWorkshifts[date] && this.currentWorkshifts[date][`${period[0]} - ${period[1]}`])) return;
                let activeShifts = [...this.activeShifts],
                    prevStatus = this.activeShiftGroups[date] && this.activeShiftGroups[date][`${period[0]} - ${period[1]}`];
                if (prevStatus)
                    Object.values(this.currentWorkshifts[date][`${period[0]} - ${period[1]}`]).map(room => room.workshifts.map(shift => {
                        if (!shift.id || typeof shift.id === 'string') return;
                        activeShifts = activeShifts.filter(shiftId => shiftId !== shift.id);
                    }));
                else Object.values(this.currentWorkshifts[date][`${period[0]} - ${period[1]}`]).map(room => room.workshifts.map(shift => {
                    if (!shift.id || typeof shift.id === 'string') return;
                    if (!activeShifts.includes(shift.id)) activeShifts.push(shift.id)
                }));
                this.activeShifts = activeShifts;
                let activeShiftGroups = {...this.activeShiftGroups};
                if (!activeShiftGroups[date]) activeShiftGroups[date] = {};
                activeShiftGroups[date][`${period[0]} - ${period[1]}`] = !prevStatus;
                this.activeShiftGroups = activeShiftGroups;
            },
            updateWorkshifts(group = this.activeGroup) {
                if (group.type !== 'office') return this.currentWorkshifts = {};

                this.showEmptyRows = !(this.filters.operator || this.filters.model || this.filters.status || this.filters.room);
                this.activeRoom = this.filters.room;
                this.$store.dispatch('schedule/fetchSchedule', {...this.filters, office: group.id, 'workweek': this.activeDate, pagination: false});
            },
            clearFilters() {
                this.filters = {};
                this.updateWorkshifts();
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
            closeToast(e, toast) {
                toast.goAway(0);
            },
            formatDate(date) {
                return moment(date).format('dddd, DD.MM');
            },
            swapWorkshifts(targetShift, date, periodString, roomId, targetKey, e) {
                if (!e.added) return;
                this.preventEdit = true;
                let newWorkshifts = JSON.parse(JSON.stringify(this.currentWorkshifts));

                newWorkshifts[date][periodString][roomId].workshifts[targetKey] = e.added.element;
                newWorkshifts[this.movingShiftData.date][this.movingShiftData.periodString][this.movingShiftData.roomId].workshifts[this.movingShiftData.key] = targetShift;

                this.currentWorkshifts = newWorkshifts;

                setTimeout(() => {
                    this.moveWorkshift(date, periodString, roomId, e);
                    this.moveWorkshift(this.movingShiftData.date, this.movingShiftData.periodString, this.movingShiftData.roomId, {added: {element: targetShift}});
                }, 1000);
            },
            openSchedule(model) {
                this.activeModel = model;
                this.droverType = 'model-schedule';
                this.toggleHelper(true);
            }
        }
    }
</script>
