<template>
    <div class="event-details">
        <div class="event-details-header">
            <b-button v-if="isEdit" variant="outline-primary" size="sm" @click="editEvent">Изменить</b-button>
            <b-button v-else variant="outline-primary" size="sm" @click="saveEvent">Добавить</b-button>
            <trash v-if="isEdit" class="event-details-header-trash" @click="deleteEvent"/>
        </div>
        <div v-if="backButton" class="theme-helper-content-main-subheader">
            <div class="theme-helper-content-main-subheader-link" @click="goBack">
                <i class="fa fa-angle-left"></i>
                <span>{{ backButton }}</span>
            </div>
        </div>
        <div class="event-details-body">
            <h4 class="event-details-body-title">{{ isEdit ? 'Параметры отсутствия' : 'Добавить отсутствие' }}</h4>
            <div class="event-details-body-block">
                <b class="event-details-body-block-label">Тип отсутствия</b>
                <custom-select v-model="typeAbsence"
                               :options="optionsAbsence"
                               valueField="value"
                               titleField="title"
                               defaultText="Выберите тип"
                               :error="showError.includes('typeAbsence')"
                />
            </div>
            <div class="event-details-body-block">
                <b class="event-details-body-block-label">Дата начала</b>
                <div class="event-details-body-block-date input">
                    <div class="event-details-body-block-date-icon glyphicon glyphicon-glyph-calendar"/>
                    <date-picker
                        v-model="startDate"
                        lang="ru"
                        type="date"
                        placeholder="Выберите дату"
                        :input-class="'input-plain' + (showError.includes('startDate') ? ' -error' : '')"
                        format="DD.MM.YYYY"
                    >
                        <i slot="calendar-icon"/>
                    </date-picker>
                </div>
            </div>
            <div class="event-details-body-block">
                <b class="event-details-body-block-label">Дата окончания</b>
                <div class="event-details-body-block-date input">
                    <div class="event-details-body-block-date-icon glyphicon glyphicon-glyph-calendar"/>
                    <date-picker
                        v-model="endDate"
                        lang="ru"
                        type="date"
                        placeholder="Выберите дату"
                        :input-class="'input-plain' + (showError.includes('endDate') ? ' -error' : '')"
                        format="DD.MM.YYYY"
                    >
                        <i slot="calendar-icon"/>
                    </date-picker>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Select from "@/components/Common/Select/Select";
import DatePicker from "vue2-datepicker";
import Trash from "@/assets/vue-svg/trash.svg";
import moment from "moment";

export default {
    name: "AbsenceDetails",
    components: {
        'custom-select': Select,
        'date-picker': DatePicker,
        trash: Trash
    },
    props: {
        absenceDate: Object,
        absenceInfo: Object,
        backButton: ''
    },
    data() {
        return {
            showEditEvent: false,
            showError: [],
            startDate: this.absenceDate?.startDate || null,
            endDate: this.absenceDate?.endDate || null,
            typeAbsence: this.absenceInfo?.type || '',
            absenceId: this.absenceInfo?.id || ''
        }
    },
    computed: {
        optionsAbsence() {
            return this.$store.state.dictionaries.absenceTypes
        },
        isEdit() {
            return !!this.absenceInfo?.id
        },
        activeDate() {
            return this.absenceDate?.activeDate
        },
    },
    methods: {
        saveEvent() {
            if (!this.validate()) return;
            this.$emit('createAbsence', {
                start_at: this.dateFormat(this.startDate),
                end_at: this.dateFormat(this.endDate),
                type: this.typeAbsence
            }, this.activeDate);
        },
        editEvent() {
            if (!this.validate()) return;
            this.$emit('editAbsence', {
                id: this.absenceId,
                absence: {
                    start_at: this.dateFormat(this.startDate),
                    end_at: this.dateFormat(this.endDate),
                    type: this.typeAbsence
                }
            }, this.activeDate);
        },
        deleteEvent() {
            this.$emit('deleteAbsence', this.absenceId, this.activeDate);
        },
        validate() {
            let errors = [];
            if (!this.startDate) errors.push('startDate')
            if (!this.endDate) errors.push('endDate')
            if (!this.typeAbsence.length) errors.push('typeAbsence')
            this.showError = errors;
            return !errors.length;
        },
        dateFormat(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        goBack() {
            this.$emit('close');
        },
    }
}
</script>