<template>
  <div>
    <div class="workshifts-edit-main-header mb-3">
      <div class="workshifts-edit-main-header-title">
        <h4 class="workshifts-edit-main-header-title-text">Прошедшие смены</h4>
        <div v-if="userPermissions.main_view_incomes"
             class="workshifts-edit-main-header-title-wages_toggle"
             :class="{'-loading': false}"
             @click="toggleWages"
        >
          <i class="workshifts-edit-main-header-title-wages_toggle-eye glyphicon"
             :class="areWagesActive ? 'glyphicon-eye-open' : 'glyphicon-eye-close'"
          />
          <span v-if="areWagesActive" class="workshifts-edit-main-header-title-wages_toggle-text">$ {{ fullPageSum }}</span>
          <span v-else class="workshifts-edit-main-header-title-wages_toggle-text">Показать заработок</span>
        </div>
      </div>
    </div>
    <div class="card free_models-card" ref="free_models-container">
      <div class="tasks-body-main-filters-past_workshifts py-3">
        <div class="tasks-body-main-filters-past_workshifts-search border-0 p-0">
          <b-input-group>
            <b-input-group-text slot="append">
              <search/>
            </b-input-group-text>
            <b-form-input v-model="searchString" id="free-models-search-input" type="text"
                          placeholder="Поиск"></b-form-input>
          </b-input-group>
        </div>
        <div class="tasks-body-main-filters-inputs-checkboxes">
          <div v-for="(label, status) in workshiftStatuses"
               class="abc-checkbox free_models-checkbox"
               :class="['-' + status]"
               :key="status">
            <input
                v-model="activeStatus[status]"
                type="checkbox"
                :id="status"
                :value="status"
                @change="changeFilters"
            />
            <label :for="status">{{ label }}</label>
          </div>
        </div>
        <div class="tasks-body-main-filters-inputs-field m-0">
          <custom-select
              v-model="selectedCancellationReason"
              :options="formattedCancellationReasons"
              class="tasks-body-main-filters-inputs-field-select -quantity text-left -filter"
              defaultText="Причина отмены"
              adjust-width
              value-field="id"
              titleField="title"
              right
              @change="changeCancellationReason"
          >
            <template v-slot:list-variant="variant">
              <span class="groups-nav-list-group-container-title">{{ variant.variant.title }}</span>
              <div class="text-gray-text">{{ variant.variant.count }}</div>
            </template>
          </custom-select>
        </div>
        <span class="tasks-body-main-filters-buttons-button -past_workshifts" @click="clearFilters">Сбросить</span>
      </div>
      <div class="free_models-card-table" @scroll="onScrollTable">
        <div class="free_models-card-table-header">
          <div class="free_models-card-table-header-cell -office"></div>
          <div class="free_models-card-table-header-cell text-size-small -shift">
            <p class="mb-0">Модель</p>
            <p v-if="areWagesActive" class="text-gray-text text-size-small mb-0">$ {{ fullPageSum }}</p>
          </div>
          <div v-for="date in pastDatesArray" class="free_models-card-table-header-cell text-size-small -shift">
            <p class="mb-0">{{ date.title }}</p>
            <p v-if="areWagesActive && formattedShifts.sumsByDay"
               class="text-gray-text mb-0"
            >$ {{ formattedShifts.sumsByDay[date.value] }}</p>
          </div>
        </div>
        <div v-if="loadPastWorkshifts.length || (status === 'request')" class="free_models-info">
          <throbber class="throbber"/>
          <span class="free_models-info-load">Смены загружаются, пожалуйста, подождите</span>
        </div>
        <div v-else-if="formattedShifts.workshifts" class="free_models-card-table-body">
          <template v-for="office in formattedOffices">
            <div v-for="(model, modelId) in formattedShifts.workshifts[office.id]" class="free_models-card-table-body-row">
              <div class="free_models-card-table-body-row-cell text-fw-600 text-size-small -office"
                   :class="{'-dark': office.isDark}"
                   :style="{backgroundColor: office.color}"
                   :id="`office-${office.id}-${modelId}`"
              >{{ office.shortTitle }}</div>
              <b-tooltip :target="`office-${office.id}-${modelId}`" placement="right" boundary="body">
                <div class="model_mini_profile-schedule-tooltip-workshift-group">
                  <span class="model_mini_profile-schedule-tooltip-workshift-group-flag flag-icon" :class="`flag-icon-${office.build_group.flag || 'default'}`"/>
                  <div class="model_mini_profile-schedule-tooltip-workshift-group-info">
                    <span class="text-gray">{{ office.build_group.city }}</span>
                    <span>{{ office.title }}</span>
                  </div>
                </div>
              </b-tooltip>
              <div class="free_models-card-table-body-row-cell -shift">
                <div class="free_models-card-table-body-row-cell-shift text-fw-400 -model"
                     @click="openMiniProfile({id: parseInt(modelId), fullname: model.surname || model.uid, office: office.id, role: 'model'})"
                >
                  <div>
                    <p class="mb-0">{{ model.surname || model.uid }}</p>
                    <p v-if="areWagesActive" class="text-gray-text text-size-small mb-0">$ {{ model.sum }}</p>
                  </div>
                </div>
              </div>
              <div v-for="date in pastDatesArray" class="free_models-card-table-body-row-cell -shift">
                <div v-for="shift in model.workshifts[date.value]" class="free_models-card-table-body-row-cell-shift text-fw-400" :class="{'-with_wages': areWagesActive}">
                  <div>
                    <p v-if="shift.operator"
                       class="mb-0"
                       @click="openMiniProfile({id: shift.operator.id, fullname: shift.operator.surname || shift.operator.uid, office: office.id, role: 'operator'})"
                    >{{ shift.operator.surname || shift.operator.uid }}</p>
                    <p v-if="!shift.model.is_solo && areWagesActive" class="text-gray-text text-size-small mb-0">$ {{ shift.incomes || 0 }}</p>
                  </div>
                  <div v-if="shift.model.is_solo" class="free_models-card-table-body-row-cell-shift-solo">Соло</div>
                  <div class="free_models-card-table-body-row-cell-shift-status"
                       :class="`-${shift.status}`"
                       :id="`shift-status-${shift.id}`"
                  />
                  <b-tooltip :target="`shift-status-${shift.id}`"
                             :boundary="$refs['free_models-container']"
                             custom-class="free_models-card-table-body-row-cell-shift-tooltip"
                             ref="past_shift-tooltip"
                  >
                    <p v-if="shift.operator">
                      <span class="text-gray-text">{{ shift.operator.uid }}</span><br/>
                      <span>{{ shift.operator.surname }}</span>
                    </p>
                    <div v-if="shift.cancel" class="mt-2">
                      <span class="mr-1">Причина отмены:</span>
                      <span class="text-gray-text">{{ shift.cancel.title }}</span>
                    </div>
                    <p class="text-gray-text">{{ shift.shownTime }}</p>
                    <div v-if="shift.incomes_by_resource && shift.incomes_by_resource.length"
                         class="free_models-card-table-body-row-cell-shift-tooltip-resource_incomes"
                    >
                      <div v-for="income in shift.incomes_by_resource">
                        <span class="text-gray">{{income.resource_short_title}}</span>
                        <span class="text-gray ml-2">${{income.sum}}</span>
                      </div>
                    </div>
                    <span class="free_models-card-table-body-row-cell-shift-tooltip-status"
                          :class="`-${shift.status}`"
                    >{{ workshiftStatuses[shift.status] }}</span>
                  </b-tooltip>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div v-else class="free_models-past_workshifts-without_shifts">
            <h3>{{ searchString.length ? 'Такие имена не найдены' : 'Смены в этом периоде не найдены' }}</h3>
            <span v-if="searchString.length"
                  class="text-gray-700">Попробуйте ввести другое имя или изменить период</span>
        </div>
      </div>
    </div>
    <b-modal id="payment-pin-check-modal" hide-footer centered dialog-class="free_models-past_workshifts-pin_modal">
      <pin-input v-model="pin" title="Введите PIN-код" class="-modal" :error="paymentPinError" @change="onChangePin" @input="onInputPin" />
    </b-modal>
  </div>
</template>

<script>
import moment from "moment";
import VueScrollingTable from "vue-scrolling-table";
import throbber from "@/assets/vue-svg/throbber.svg";
import {isColorDark, showToast} from "@/tools/tools";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import Select from "@/components/Common/Select/Select.vue";
import search from "@/assets/vue-svg/search.svg";
import PinInput from "@/components/Common/PinInput.vue";

export default {
    name: "PastWorkshifts",
    components: {
      PinInput,
      search,
      'custom-select': Select,
      Avatar,
      'scrolling-table': VueScrollingTable,
      'throbber': throbber
    },
    props: {
      officesList: {
        type: Array
      },
      activeGroup: {
        type: Object
      },
      activePastDate: String,
    },
    data() {
      return {
        activeStatus: {},
        searchString: '',
        selectedCancellationReason: '',
        areWagesActive: false,
        workshiftStatuses: {
          process: 'В процессе',
          completed: 'Завершена',
          assigned: 'Назначена',
          created: 'В резерве',
          canceled: 'Отменена',
        },
        paymentPinError: '',
        pin: '',
        waitingResponseForPin: false,
      }
    },
    computed: {
      pastSchedule() {
        return this.$store.state.schedule.pastSchedule;
      },
      activeInfo() {
        return this.$store.state.schedule.activeInfo;
      },
      status() {
        return this.$store.state.schedule.status;
      },
      loadPastWorkshifts() {
        return this.$store.state.schedule.loadPastWorkshifts;
      },
      userPermissions() {
        return this.$store.state.auth.userPermissions;
      },
      pastDatesArray() {
        let date = moment(this.activePastDate);
        if (date.weekday() !== 6) date.weekday(-1);
        return [0, 1, 2, 3, 4, 5, 6].map(i => {
          if (i) date.add(1, 'day');
          return {
            title: date.format('dd DD.MM'),
            value: date.format('YYYY-MM-DD'),
          }
        });
      },
      formattedShifts() {
        const formattedShifts = {},
            sumsByDay = {};

        let hasShifts = false;

        for (let office in this.pastSchedule) {
          formattedShifts[office] = {};

          for (let model in this.pastSchedule[office]) {
            const modelData = this.pastSchedule[office][model];
            hasShifts = true;
            formattedShifts[office][model] = {
              avatar: modelData.avatar,
              surname: modelData.surname,
              uid: modelData.uid,
              workshifts: {},
              sum: 0,
            };

            for (let date in modelData.workshifts) {
              const dateShifts = modelData.workshifts[date];
              const shiftsToAdd = [];

              dateShifts.forEach(shift => {
                const isCancellationReasonMatched = !this.selectedCancellationReason || (shift.cancel && shift.cancel.id === this.selectedCancellationReason);
                const isSearchMatched = this.searchString === '' || this.isShiftMatchingSearch(shift);

                if (isCancellationReasonMatched && isSearchMatched) {
                  shiftsToAdd.push({
                    ...shift,
                    shownTime: this.formatShiftTime(shift),
                  });
                  formattedShifts[office][model].sum = Math.round(formattedShifts[office][model].sum * 100 + (shift.incomes || 0) * 100) / 100;
                  sumsByDay[date] = Math.round((sumsByDay[date] || 0) * 100 + (shift.incomes || 0) * 100) / 100;
                }
              });

              if (shiftsToAdd.length > 0) {
                formattedShifts[office][model].workshifts[date] = shiftsToAdd;
              }
            }
            
            if (Object.keys(formattedShifts[office][model].workshifts).length === 0) {
              delete formattedShifts[office][model];
            }
          }
        }

        return hasShifts ? {workshifts: formattedShifts, sumsByDay} : {};
      },
      formattedCancellationReasons() {
        const filteredReasons = [];
        for (const office in this.pastSchedule) {
          for (const model in this.pastSchedule[office]) {
            for (const date in this.pastSchedule[office][model].workshifts) {
              const shifts = this.pastSchedule[office][model].workshifts[date];
              shifts.forEach(shift => {
                if (shift.cancel) {
                  const reasonId = shift.cancel.id;

                  const existingReason = filteredReasons.find(reason => reason.id === reasonId);

                  if (existingReason) {
                    existingReason.count += 1;
                  } else {
                    filteredReasons.push({
                      id: reasonId,
                      title: shift.cancel.title,
                      count: 1,
                    });
                  }
                }
              });
            }
          }
        }
        return filteredReasons;
      },
      formattedOffices() {
        return this.officesList.map(office => ({
          ...office,
          shortTitle: office.title.slice(0, 2),
          isDark: isColorDark(office.color),
        }));
      },
      fullPageSum() {
        if (!this.formattedShifts.sumsByDay) return 0;
        return Object.values(this.formattedShifts.sumsByDay).reduce((sum, day) => Math.round(sum * 100 + day * 100) / 100, 0);
      },
    },
    watch: {
      activeGroup: function (newGroup) {
        this.updatePastWorkshifts(newGroup);
      },
      activePastDate() {
        this.updatePastWorkshifts();
      },
      activeInfo: {
        handler(newInfo) {
          if (!newInfo.status || !newInfo.fullname) return;
          this.activeStatus = { [newInfo.status]: true };
          this.searchString = newInfo.fullname;
        },
        immediate: true,
      },
      areWagesActive: function (newStatus) {
        if (newStatus) this.updatePastWorkshifts();
      },
      status: function (newStatus) {
        switch (newStatus) {
          case 'error': {
            if (this.waitingResponseForPin) {
              this.waitingResponseForPin = false;
              this.areWagesActive = false;
              this.updatePastWorkshifts();
              this.paymentPinError = 'Неверный PIN';
              return;
            }
            return showToast(this.$toasted, 'Что-то пошло не так. Пожалуйста попробуйте ещё раз.', 'error');
          }
          case '': {
            if (this.waitingResponseForPin) {
              this.waitingResponseForPin = false;
              this.$bvModal.hide('payment-pin-check-modal');
            }
          }
        }
      },
    },
    mounted() {
      this.updatePastWorkshifts();
    },
    methods: {
      isShiftMatchingSearch(shift) {
        const modelFullName = shift.model?.fullname?.toLowerCase();
        const modelNickname = shift.model?.model_nickname?.toLowerCase();
        const operatorFullName = shift.operator?.fullname?.toLowerCase();
        return modelFullName?.includes(this.searchString?.toLowerCase()) ||
            operatorFullName?.includes(this.searchString?.toLowerCase()) ||
            modelNickname?.includes(this.searchString?.toLowerCase());
      },
      changeFilters() {
        this.updatePastWorkshifts();
      },
      changeCancellationReason(value) {
        this.selectedCancellationReason = value;
        this.activeStatus = { canceled: true };
      },
      clearFilters() {
        this.activeStatus = {};
        this.selectedCancellationReason = '';
        this.searchString = '';
        this.updatePastWorkshifts();
      },
      updatePastWorkshifts(group = this.activeGroup) {
        const statuses = Object.keys(this.activeStatus).filter(status => this.activeStatus[status]);
        if (!this.userPermissions.schedule.past.view) return;
        if (this.activeGroup.type === 'office')
          this.$store.dispatch('schedule/fetchPastSchedule', {
            statuses: statuses,
            office: group.id,
            'workweek': this.activePastDate,
            pagination: false,
            pin_for_incomes: this.areWagesActive ? this.pin : null,
          });
        else if (this.activeGroup.type === 'city')
          this.$store.dispatch('schedule/fetchPastScheduleForCity', {
            statuses: statuses,
            offices: group.children,
            'workweek': this.activePastDate,
            pagination: false,
            pin_for_incomes: this.areWagesActive ? this.pin : null,
          });
        this.$emit('updatePastDate', this.activePastDate);
      },
      openMiniProfile(profile) {
        if ((profile.role === 'model' && this.userPermissions.model.profile.view) || (profile.role === 'operator' && this.userPermissions.operator.profile.view)) this.$emit('open-mini-profile', profile);
      },
      formatShiftTime(shift) {
        return `${shift.start_at || shift.planned_start_at} – ${shift.end_at || shift.planned_end_at}`;
      },
      toggleWages() {
        if (this.areWagesActive) {
          this.areWagesActive = false;
          this.pin = '';
          return;
        }
        this.$bvModal.show('payment-pin-check-modal');
      },
      onChangePin() {
        this.waitingResponseForPin = true;
        this.areWagesActive = true;
      },
      onInputPin() {
        this.paymentPinError = '';
      },
      onScrollTable() {
        this.$refs['past_shift-tooltip'].forEach(tooltip => tooltip.$emit('close'));
      },
    }
  }
</script>