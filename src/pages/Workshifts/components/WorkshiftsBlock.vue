<template>
    <div>
        <div class="workshifts-edit-main-datepicker">
            <div class="workshifts-edit-main-datepicker-prev" @click="subtractDate"><i class="fa fa-angle-left"></i></div>
            <div class="workshifts-edit-main-datepicker-current">
                <span class="workshifts-edit-main-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
                <h4 class="workshifts-edit-main-datepicker-current-text">{{ currentDatesText }}</h4>
            </div>
            <div class="workshifts-edit-main-datepicker-next" @click="addDate"><i class="fa fa-angle-right"></i></div>
        </div>
        <div v-for="date in currentDatesArray" v-if="currentWorkshifts[date]" class="workshifts-edit-main-date">
            <div v-for="(workshiftsOfPeriod, periodString, index) in currentWorkshifts[date]" v-if="workshiftsOfPeriod" class="workshifts-edit-main-date-period">
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
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox"></div>
                            </div>
                        </div>
                    </div>
                    <div v-for="(workshiftsOfRoom, roomId) in workshiftsOfPeriod" class="workshifts-edit-main-date-period-table-row">
                        <div v-if="roomId === 'without_room'" class="workshifts-edit-main-date-period-table-row-id"><span class="glyphicon glyphicon-home"></span></div>
                        <div v-else-if="roomId === 'reserve'" class="workshifts-edit-main-date-period-table-row-id">R</div>
                        <div v-else class="workshifts-edit-main-date-period-table-row-id">
                            <span class="workshifts-edit-main-date-period-table-row-id-name">{{ workshiftsOfRoom.number }}</span>
                            <div class="btn-add workshifts-edit-main-date-period-table-row-id-btn" @click="openShiftCreation(date, periodString, roomId)"></div>
                        </div>
                        <draggable v-model="workshiftsOfRoom.workshifts"
                                   group="workshifts"
                                   filter=".-placeholder"
                                   :preventOnFilter="false"
                                   class="workshifts-edit-main-date-period-table-row-shifts"
                                   :forceFallback="true"
                                   @change="moveWorkshift(date, periodString, roomId, $event)"
                                   @start="startDrag(date, periodString, roomId, $event)"
                                   @end="endDrag"
                        >
                            <template v-if="(workshiftsOfRoom.workshifts.length > 1) && (roomId === 'reserve')" class="workshifts-edit-main-date-period-table-row-shifts">
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift" @click="clickRow(workshiftsOfRoom.workshifts[0], date)">
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model">
                                        <span v-if="workshiftsOfRoom.workshifts[0].model" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name">{{ getModelName(workshiftsOfRoom.workshifts[0].model) }}</span>
                                        <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Модель</span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">
                                        <span v-if="workshiftsOfRoom.workshifts[0].operator" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name">{{ getOperatorName(workshiftsOfRoom.workshifts[0].operator) }}</span>
                                        <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Оператор</span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                        <span v-if="workshiftsOfRoom.workshifts[0].start_at" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text">{{ getTimeFromDate(workshiftsOfRoom.workshifts[0].start_at) }}</span>
                                        <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -empty">{{ getTimeFromDate(workshiftsOfRoom.workshifts[0].planned_start_at) }}</span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                        <span v-if="workshiftsOfRoom.workshifts[0].end_at" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text">{{ getTimeFromDate(workshiftsOfRoom.workshifts[0].end_at) }}</span>
                                        <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -empty">{{ getTimeFromDate(workshiftsOfRoom.workshifts[0].planned_end_at) }}</span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status">
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-status" :class="`-${workshiftsOfRoom.workshifts[0].status}`">{{ workshiftStatuses[workshiftsOfRoom.workshifts[0].status] }}</div>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox">
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-collapse" :class="activeCollapses.includes(`shift_${date}_${periodString}`) ? '-active' : ''" @click.stop="clickCollapse(`shift_${date}_${periodString}`)"></div>
                                    </div>
                                </div>
                                <b-collapse class="-placeholder" :id="`shift_${date}_${periodString}`">
                                    <draggable v-model="workshiftsOfRoom.workshifts"
                                               group="workshifts"
                                               filter=".-placeholder"
                                               :preventOnFilter="false"
                                               :forceFallback="true"
                                               @change="moveWorkshift(date, periodString, roomId, $event)"
                                               @start="startDrag(date, periodString, roomId, $event)"
                                               @end="endDrag"
                                    >
                                        <div v-for="(shift, subkey) in workshiftsOfRoom.workshifts"
                                             v-if="subkey !== 0"
                                             class="workshifts-edit-main-date-period-table-row-shifts-shift"
                                             :key="subkey"
                                             @click="clickRow(shift, date)"
                                        >
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model">
                                                <span v-if="shift.model" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name">{{ getModelName(shift.model) }}</span>
                                                <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Модель</span>
                                            </div>
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">
                                                <span v-if="shift.operator" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name">{{ getOperatorName(shift.operator) }}</span>
                                                <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Оператор</span>
                                            </div>
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                                <span v-if="shift.start_at" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text">{{ getTimeFromDate(shift.start_at) }}</span>
                                                <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -empty">{{ getTimeFromDate(shift.planned_start_at) }}</span>
                                            </div>
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                                <span v-if="shift.end_at" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text">{{ getTimeFromDate(shift.end_at) }}</span>
                                                <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -empty">{{ getTimeFromDate(shift.planned_end_at) }}</span>
                                            </div>
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status">
                                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-status" :class="`-${shift.status}`">{{ workshiftStatuses[shift.status] }}</div>
                                            </div>
                                        </div>
                                    </draggable>
                                </b-collapse>
                            </template>
                            <template v-else-if="workshiftsOfRoom.workshifts.length">
                                <div v-for="(shift, subkey) in workshiftsOfRoom.workshifts"
                                     class="workshifts-edit-main-date-period-table-row-shifts-shift"
                                     :class="shift.status === 'completed' ? '-completed' : ''"
                                     :key="subkey"
                                     @click="clickRow(shift, date)"
                                >
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model -new">
                                                    <span v-if="shift.model" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name">
                                                        {{ getModelName(shift.model) }}
                                                        <template v-if="shift.model.new_model">
                                                            <span class="glyphicon glyphicon-new_model workshifts-edit-main-date-period-table-row-shifts-shift-cell-new" :id="`new-${shift.id}`"></span>
                                                            <b-popover custom-class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-new-popover" :target="`new-${shift.id}`" triggers="hover" placement="top">
                                                                <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                                                            </b-popover>
                                                        </template>
                                                    </span>
                                        <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Модель</span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">
                                        <span v-if="shift.operator" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name">{{ getOperatorName(shift.operator) }}</span>
                                        <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Оператор</span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                        <time-input v-model="shift.start_at"
                                                    :workshift="periodString"
                                                    :date="date"
                                                    :excessTime="currentSchedule.excess_time"
                                                    :placeholder="getTimeFromDate(shift.planned_start_at)"
                                                    :disabled="(shift.status !== 'assigned') && (shift.status !== 'process')"
                                                    @input="changeShiftTime(shift)"
                                        />
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                        <time-input v-model="shift.end_at"
                                                    :workshift="periodString"
                                                    :date="date"
                                                    :excessTime="currentSchedule.excess_time"
                                                    :placeholder="getTimeFromDate(shift.planned_end_at)"
                                                    :showError="!shift.start_at"
                                                    :disabled="(shift.status !== 'assigned') && (shift.status !== 'process')"
                                                    :earliestDate="shift.start_at"
                                                    @input="changeShiftTime(shift)"
                                        />
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status">
                                        <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-status" :class="`-${shift.status}`">{{ workshiftStatuses[shift.status] }}</div>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox" @click.stop.prevent>
                                        <span class="glyphicon glyphicon-info" :id="`comments-${shift.id}`"></span>
                                        <b-popover v-if="shift.comments && shift.comments.length" custom-class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments" :target="`comments-${shift.id}`" triggers="hover">
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-header">Информация о смене</div>
                                            <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body">
                                                <div v-for="comment in shift.comments" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment">
                                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-avatar">
                                                        <div class="avatar -sm" :style="comment.author.avatar ? `background-image: url(${comment.author.avatar}); background-size: cover;` : ''" />
                                                    </div>
                                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main">
                                                        <p class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main-author">{{ comment.author.fullname }}</p>
                                                        <p>{{ comment.text }}</p>
                                                        <p class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main-date">{{ formatDateTime(comment.created_at) }}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </b-popover>
                                    </div>
                                </div>
                            </template>
                            <div v-else class="workshifts-edit-main-date-period-table-row-shifts-shift -placeholder">
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model -new"></div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator"></div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                    <span class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">--:--</span>
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                    <span class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">--:--</span>
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status"></div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox"></div>
                            </div>
                        </draggable>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="(dateFormat === 'day') || Array.isArray(currentWorkshifts)" class="workshifts-edit-main-empty">
            <h3>Расписание не найдено</h3>
            <p>Для отображения расписания выберите страну, город и офис</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'workshifts-block',
    props: {
        currentSchedule: Object,
        showType: Object
    },
    data() {
        return {
            currentWorkshifts: {},

        }
    },
    computed: {
        scheduleStatus() {
            return this.$store.state.schedule.status;
        }
    },
    watch: {
        currentSchedule: function (nextScheduleObject) {
            this.setCurrentWorkshifts(nextScheduleObject);
        },
        scheduleStatus: function (newStatus) {
            if (newStatus === 'edit-error') {
                this.$toasted.error(`Ошибка выполнения запроса`, {
                    className: ['toasted-error'],
                    action: {
                        class: 'btn-close',
                        onClick: this.closeToast
                    },
                });
                this.setCurrentWorkshifts();
            } else if ((newStatus === 'error') && this.requestErrors[0] && this.requestErrors[0].message) {
                this.$toasted.error(this.requestErrors[0].message, {
                    className: ['toasted-error'],
                    action: {
                        class: 'btn-close',
                        onClick: this.closeToast
                    },
                });
            }
        },
    },
    methods: {
        setCurrentWorkshifts(nextScheduleObject = this.currentSchedule, newShowType) {
            let showType = newShowType || this.showType;
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
                    if (shiftsWithoutRoom && shiftsWithoutRoom.length) emptySchedule[date][`${period.from} - ${period.to}`].without_room = {workshifts: shiftsWithoutRoom}

                    if (showType.reserved) {
                        let reservedWithoutRoom = nextSchedule[date] &&
                            nextSchedule[date][`${period.from} - ${period.to}`] &&
                            nextSchedule[date][`${period.from} - ${period.to}`].reserve &&
                            nextSchedule[date][`${period.from} - ${period.to}`].reserve.workshifts;

                        if (reservedWithoutRoom && this.filters.model) reservedWithoutRoom = reservedWithoutRoom.filter(shift => shift.model.id === this.filters.model);
                        if (reservedWithoutRoom && reservedWithoutRoom.length) emptySchedule[date][`${period.from} - ${period.to}`].reserve = {workshifts: reservedWithoutRoom}
                    }
                })
            })

            this.currentWorkshifts = emptySchedule
        },
    }
}
</script>