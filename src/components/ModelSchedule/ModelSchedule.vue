<template>
  <b-form class="theme-helper-content-main" @submit.prevent="submitForm">
    <div class="theme-helper-content-main-header">
      <template v-if="!isModelResign">
        <button-throbber v-if="!isModel"
                         class="theme-helper-content-main-header-button"
                         size="sm"
                         variant="outline-primary"
                         id="schedule-submit-button"
                         type="submit"
                         colorThrobber="primary"
                         :loading="isCreatingLoading"
        >Сохранить
        </button-throbber>
        <b-button v-if="showAddAbsences && userPermissions.model.profile.absence.edit"
                  class="theme-helper-content-main-header-button"
                  size="sm"
                  variant="outline-primary"
                  @click="openAbsenceDetails"
        >Добавить отсутствие</b-button>
      </template>
    </div>
    <div v-if="backButton" class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="goBack">
        <i class="fa fa-angle-left"></i>
        <span>{{ backButton }}</span>
      </div>
    </div>
    <div class="model_schedule-body">
      <h1 class="model_schedule-body-title">Расписание на неделю</h1>
      <div class="model_schedule-body-office">
        <template v-if="showModel">
          <div class="user_details-main-user-avatar"
               :class="{'cursor-pointer' : userPermissions.model.profile.view}"
               @click="openModelMiniProfile(model)"
          >
            <avatar class="mr-2"
                    size="-lg"
                    :url="model.avatar"
                    :telegram="model.telegram_connected"
                    :is-fin-admin="model.is_fin_admin"
            />
          </div>
          <div class="user_details-main-user-info">
            <div class="model_mini_profile-model_container-personal"
                 :class="{'cursor-pointer' : userPermissions.model.profile.view}"
                 @click="openModelMiniProfile(model)"
            >
              <template v-if="!model.uid || !model.fullname">
                <b class="model_mini_profile-model_container-personal-main">{{ model.uid || model.fullname }}</b>
              </template>
              <template v-else>
                <b class="model_mini_profile-model_container-personal-uid mr-1">{{ model.uid }}</b>
                <b class="model_mini_profile-model_container-personal-main">{{ model.fullname }}</b>
              </template>
              <div v-if="model.model_nickname && !model.fullname" class="mr-2 d-flex align-items-center">
                <at class="mr-1"/>
                <b>{{ model.model_nickname }}</b>
              </div>
              <user-resign-icon v-if="model.resign_date" :offset="40" :user="model" id="resign_info-details" />
              <template v-if="model.new_model">
                <div class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2" id="new-user-schedule-creation"/>
                <b-tooltip target="new-user-schedule-creation" triggers="hover" placement="top">
                  <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                </b-tooltip>
              </template>
              <div v-if="model.is_solo" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло</div>
            </div>
            <div v-if="model.model_nickname && model.fullname" class="d-flex align-items-center">
              <at class="mr-1"/>
              <span class="text-fw-400">{{ model.model_nickname }}</span>
            </div>
            <custom-select v-if="selectOffice"
                           v-model="chosenOffice"
                           :options="officesList"
                           class="workshift_details-body-top-office -groups"
                           id="schedule-office-select"
                           value-field="id"
                           @change="chooseOffice"
            >
              <template v-slot:chosen-variant="value">
                <span v-if="!value.value">Офис</span>
                <template v-else>
                  <span class="flag-icon" :class="`flag-icon-${model.group.flag || 'default'}`"
                        :title="model.group.country"></span>
                  <span class="text-gray mr-1">{{ model.group.city }}</span>
                  <span>{{ value.shownText }}</span>
                </template>
              </template>
              <template v-slot:list-variant="variant">
                <div class="d-flex align-items-center position-relative">
                  <div class="groups-nav-list-group-container-color"
                       :style="`background-color: ${variant.variant.color || 'red'}`"></div>
                  <span class="groups-nav-list-group-container-title">{{ variant.variant.title }}</span>
                  <div v-if="variant.variant.id === (model && model.main_group && model.main_group.id)"
                       class="groups-nav-list-group-container-main"
                  >Основная</div>
                </div>
              </template>
            </custom-select>
            <div v-else class="d-flex align-center">
              <span class="flag-icon" :class="`flag-icon-${office.build_group.flag || 'default'}`"
                    :title="office.build_group.country"></span>
              <span v-if="office.build_group.city" class="text-gray text-fw-400 mr-1">{{ office.build_group.city }}</span>
              <span v-if="office.build_group.office" class="text-fw-400">{{ office.build_group.office }}</span>
              <span v-else-if="model.office" class="text-fw-400">{{ model.office.title }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="model_schedule-body-office-color" :style="{ background: office.color }"></div>
          <div class="model_schedule-body-office-name">{{ office.office || office.title }}</div>
        </template>
      </div>
      <div v-if="isLoading" class="model_schedule-body-load">
        <throbber class="throbber"/>
        <p>Расписание загружается, пожалуйста, подождите</p>
      </div>
      <template v-else>
        <div v-if="isFormDisabledWithError" class="model_schedule-body-error">
          <span v-if="isModelResign">Невозможно сформировать расписание, модель уволена</span>
          <span v-else>Невозможно сформировать расписание, у модели нет активных аккаунтов!</span>
        </div>
        <div v-if="!isModel" class="model_schedule-body-amount_days">
          <div class="workshifts-edit-main-datepicker">
            <div class="workshifts-edit-main-datepicker-prev" id="schedule_edit_date_prev" @click="subtractDate">
              <i class="fa fa-angle-left"></i>
            </div>
            <div class="workshifts-edit-main-datepicker-current">
              <h4 class="workshifts-edit-main-datepicker-current-text">{{ currentDatesText }}</h4>
            </div>
            <div class="workshifts-edit-main-datepicker-next" id="schedule_edit_date_next" @click="addDate">
              <i class="fa fa-angle-right"></i>
            </div>
          </div>
        </div>
        <template v-if="!isModel">
          <div v-for="(schedule, scheduleIndex) in schedules"
               class="model_schedule-body-schedule"
               :class="scheduleIndex === 0 ? '-add_padding' : ''"
               :key="scheduleIndex"
          >
            <h4 v-if="scheduleIndex === 0" class="mb-3 ml-1">Выберите дни для изменения расписания</h4>
            <div v-else class="model_schedule-body-schedule-close">
              <div class="model_schedule-body-schedule-close-image helper-close"
                   alt="close"
                   :id="`schedule_edit_block_close-${scheduleIndex}`"
                   @click="deleteSchedule(schedule)"
              ></div>
            </div>
            <b-button-group class="model_schedule-body-schedule-week">
              <div v-for="(day, dayIndex) in schedule.days" class="model_mini_profile-schedule-week-day_container">
                <div :id="`schedule-day-${dayIndex}`" class="model_schedule-body-schedule-week-day-container">
                  <b-button class="model_schedule-body-schedule-week-day"
                            :class="[day.active ? '-active' : '-default']"
                            variant="default"
                            :disabled="isFormDisabledWithError || !!isDayAbsence(day)"
                            :key="dayIndex"
                            :id="`day-workshifts-${day.stamp}`"
                            @click="changeCheckbox(schedule, dayIndex, day, scheduleIndex)"
                  >
                    <p class="model_schedule-body-schedule-week-day-number">{{ day.number }}</p>
                    <p class="model_schedule-body-schedule-week-day-title">{{ day.title }}</p>
                  </b-button>
                </div>
                <b-tooltip v-if="isDayAbsence(day)" :target="`schedule-day-${dayIndex}`" placement="left">
                  <p v-for="absence in isDayAbsence(day)" class="mb-0 pt-1 pb-1 pl-3 pr-3">{{ absence }}</p>
                </b-tooltip>
                <div v-if="changedWorkshifts[day.stamp] && changedWorkshifts[day.stamp].length"
                     class="model_mini_profile-schedule-week-day_container-periods">
                  <div v-for="shift in changedWorkshifts[day.stamp]"
                       class="model_mini_profile-schedule-week-day_container-periods-period"
                       :key="shift.id"
                  >
                    <i class="color_icon -sm -shift model_mini_profile-schedule-week-day_container-periods-period-icon" :class="`-${shift.status}`"/>
                    <span class="model_mini_profile-schedule-week-day_container-periods-period-time">{{ shift.time }}</span>
                  </div>
                </div>
                <template v-if="formattedWorkshifts[day.stamp]">
                  <tooltip-info-workshifts :target="`day-workshifts-${day.stamp}`"
                                           :workshifts="formattedWorkshifts[day.stamp]"
                                           @openMiniProfile="openMiniProfile"
                  />
                </template>
              </div>
            </b-button-group>
            <template v-if="activeDays.length">
              <template v-if="isConfigure">
                <div class="mb-2_5 mt-2_5"><b>Применить к выбранным сменам</b></div>
                <div class="model_schedule-body-content-table-body-line -common">
                  <div v-if="!hasSelectedShifts" class="model_schedule-body-content-table-body-info">
                    <span>Выберите смены</span>
                  </div>
                  <div v-else class="model_schedule-body-content-table-body-line-config">
                    <reset v-if="isCommonEditStatus" class="flex-shrink-0" @click="resetCommonParameters"/>
                    <div class="model_schedule-body-content-table-body-period -common"
                         :class="[{'-without_reset': !isCommonEditStatus}, {'-active': commonShiftParameters.work_shift}]">
                      <custom-select v-model="commonShiftParameters.work_shift"
                                     :options="workshiftPeriods"
                                     defaultText="Период"
                                     return-whole-object
                                     @change="changeCommonEditStatus(true)"
                      >
                        <template v-slot:chosen-variant="props">
                          <span v-if="props.value">c {{ props.value.from }}</span>
                          <span v-else-if="commonShiftParameters.work_shift">c {{ commonShiftParameters.work_shift.substring(0, 5) }}</span>
                          <span v-else>Период</span>
                        </template>
                        <template v-slot:list-variant="props">
                          <span v-if="props.variant">c {{ props.variant.from }} по {{ props.variant.to }}</span>
                          <span v-else>Период</span>
                        </template>
                      </custom-select>
                    </div>
                    <div class="model_schedule-body-content-table-body-time"
                         :class="{'-active': commonShiftParameters.planned_start_at}"
                    >
                      <date-picker v-model="commonShiftParameters.planned_start_at"
                                   class="hide_styles_datepicker"
                                   lang="ru"
                                   type="time"
                                   :placeholder="commonShiftParameters.planned_start_at || 'Время'"
                                   :time-picker-options="time_periods"
                                   format="HH:mm"
                                   @change="changeCommonEditStatus(true)"
                      >
                        <i style="display: none;" slot="icon-calendar"></i>
                      </date-picker>
                    </div>
                    <div class="model_schedule-body-content-table-body-time -end"
                         :class="{'-active': commonShiftParameters.planned_end_at}"
                    >
                      <date-picker v-model="commonShiftParameters.planned_end_at"
                                   class="hide_styles_datepicker"
                                   lang="ru"
                                   type="time"
                                   :placeholder="commonShiftParameters.planned_end_at || 'Время'"
                                   :time-picker-options="time_periods"
                                   format='HH:mm'
                                   @change="changeCommonEditStatus(true)"

                      >
                        <i style="display: none;" slot="calendar-icon" :input-attr="{ required: true }"/>
                        <template v-slot:chosen-variant="props">
                          <span v-if="props.value">c {{ props.value.from }}</span>
                          <span v-else>Период</span>
                        </template>
                      </date-picker>
                    </div>
                    <div class="model_schedule-body-content-table-body-room">
                      <custom-select v-model="commonShiftParameters.room"
                                     :options="roomsOptions"
                                     class="model_schedule-body-schedule-settings-room-settings"
                                     valueField="id"
                                     adjust-width
                                     defaultText="№"
                                     @change="changeCommonEditStatus(true)"
                      >
                        <template v-slot:chosen-variant="props">
                          <span v-if="props.value" class="text-gray-700 text-fw-400">{{ props.value.title }}</span>
                          <span v-else class="text-gray text-fw-400">№</span>
                        </template>
                      </custom-select>
                    </div>
                    <div class="model_schedule-body-content-table-body-operator">
                      <custom-select v-model="commonShiftParameters.operator"
                                     class="model_schedule-body-schedule-settings-operator-settings"
                                     valueField="id"
                                     titleField="fullname"
                                     defaultText="Оператор"
                                     :options="absencesByOperatorId"
                                     searchableRequest
                                     infinityScroll
                                     :default-value="null"
                                     return-whole-object
                                     :variantSubheaderRule="operatorsSubheaderRule"
                                     @getNextPage="getOperatorsNextPage"
                                     @searchList="searchOperatorList"
                                     @change="changeCommonEditStatus(true)"
                      >
                        <template v-slot:chosen-variant="props">
                          <div class="response-task-parameters-title-executor-settings-selected">
                            <template v-if="props.value && (props.value.uid || props.value.fullname)">
                              <div class="d-flex align-items-center">
                                <template v-if="props.value.fullname || props.value.uid">
                                  <span>{{ props.value.fullname || props.value.uid }}</span>
                                </template>
                                <user-resign-icon v-if="props.value.resign_date" :user="props.value"/>
                                <div v-else-if="props.value.blocked" class="glyphicon-blocked flex-shrink-0"
                                     v-b-tooltip.hover
                                     title="Сотрудник заблокирован"
                                ></div>
                              </div>
                            </template>
                            <template v-else class="d-flex align-items-start">{{ props.shownText }}</template>
                          </div>
                        </template>
                        <template v-slot:list-variant="props">
                          <div class="model_schedule-body-content-option"
                               :class="{'-disabled': absencesByOperatorId[props.variant.id].disabled}">
                            <div class="d-flex align-items-center">
                              <template v-if="!props.variant.uid || !props.variant.fullname">
                                {{ props.variant.uid || props.variant.fullname }}
                              </template>
                              <template v-else>
                                <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                                <span>{{ props.variant.fullname }}</span>
                              </template>
                            </div>
                            <div>
                              <div v-if="props.variant.group" class="model_schedule-body-content-option-city">
                                <span class="flag-icon mr-1"
                                      :class="`flag-icon-${props.variant.group.flag || 'default'}`"
                                      :title="props.variant.group.country"
                                />
                                <span v-if="props.variant.group.city" class="text-gray mr-1">
                                  {{ props.variant.group.city }}
                                </span>
                                <span v-if="props.variant.group.office">{{ props.variant.group.office }}</span>
                              </div>
                              <template v-else>Не состоит в группе</template>
                            </div>
                            <div v-if="absencesByOperatorId[props.variant.id].absences.length" class="flex-column">
                              <div v-for="absence in absencesByOperatorId[props.variant.id].absences">
                                <absence class="mb-1"/>
                                <span> {{ absenceTypes[absence.type] }} </span>
                                <span>{{ absence.start_at }} - {{ absence.end_at }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </custom-select>
                    </div>
                    <button-check v-if="isCommonEditStatus" class="model_schedule-body-button_check ml-4"
                                  @click="applyCommonParameters"/>
                  </div>
                </div>
              </template>
              <div class="mt-2_5 mb-2_5"><b>Выбранные смены</b></div>
              <div class="model_schedule-body-content-table">
                <div class="model_schedule-body-content-table-header">
                  <div class="model_schedule-body-content-table-header-period">ПЕРИОД</div>
                  <div class="model_schedule-body-content-table-header-start_at">НАЧАЛО</div>
                  <div class="model_schedule-body-content-table-header-end_at">КОНЕЦ</div>
                  <div class="model_schedule-body-content-table-header-room">КОМ.</div>
                  <div class="model_schedule-body-content-table-header-operator">ОПЕРАТОР</div>
                  <div v-if="hasMultipleActiveShifts" class="abc-checkbox -fixed model_schedule-body-content-table-header-checkbox">
                    <input ref="commonCheckbox" id="common" type="checkbox" v-model="commonCheckbox"/>
                    <label for="common"/>
                  </div>
                </div>
                <div v-for="filteredSchedule in filteredSchedules">
                  <div v-for="day in filteredSchedule.days"
                       class="model_schedule-body-content-table-body"
                       :hidden="!day.active">
                    <div class="model_schedule-body-content-table-body-day"
                         :class="{'-editable': userPermissions.schedule.edit}">
                      <div :id="`btn-add-${day.title}`">
                        <div class="model_schedule-body-content-table-body-day-title">
                          <b>{{ day.title }}</b>
                        </div>
                        <div class="btn-add model_schedule-body-content-table-body-day-btn"
                             @click="addEmptyWorkshift(day.stamp)"/>
                      </div>
                      <b-tooltip :target="`btn-add-${day.title}`"
                                 triggers="hover"
                                 placement="top"
                      >
                        <div class="text-center text-fw-400 mt-1 mb-1 ml-2 mr-2">Добавить смену</div>
                      </b-tooltip>
                    </div>
                    <div class="model_schedule-body-content-table-body-column flex-column">
                      <div v-if="!changedWorkshifts[day.stamp].length" class="model_schedule-body-content-table-body-line">
                        <span class="text-fw-400 text-gray">Добавьте смены...</span>
                      </div>
                      <div v-else v-for="(shift, key) in changedWorkshifts[day.stamp]" :key="key"
                           class="model_schedule-body-content-table-body-line">
                        <div class="model_schedule-body-content-table-body-period"
                             :class="{'-active': shift.work_shift}">
                          <custom-select v-model="shift.work_shift"
                                         :options="workshiftPeriods"
                                         defaultText="Период"
                                         :id="`schedule-block-${key}-period-select`"
                                         :disabled="shift.isDisabled"
                                         return-whole-object
                                         @change="changeWorkShift('work_shift')"
                          >
                            <template v-slot:chosen-variant="props">
                              <span v-if="props.value">c {{ props.value.from }}</span>
                              <span v-else-if="shift.work_shift">c {{ shift.work_shift.substring(0, 5) }}</span>
                              <span v-else>Период</span>
                            </template>
                            <template v-slot:list-variant="props">
                              <span v-if="props.variant">c {{ props.variant.from }} по {{ props.variant.to }}</span>
                              <span v-else>Период</span>
                            </template>
                          </custom-select>
                        </div>
                        <div class="model_schedule-body-content-table-body-time"
                             :class="{'-active': shift.planned_start_at, '-invalid': activeValidation && !shift.planned_start_at}">
                          <date-picker v-model="shift.planned_start_at"
                                       class="hide_styles_datepicker"
                                       type="time"
                                       lang="ru"
                                       :value="shift.planned_start_at"
                                       :placeholder="shift.planned_start_at || 'Время'"
                                       :time-picker-options="time_periods"
                                       :disabled="shift.isDisabled"
                                       format="HH:mm"
                                       @input.native="validateTimeInput"
                                       @change="changeWorkShift('planned_start_at')"
                          >
                            <i style="display: none;" slot="icon-calendar" :input-attr="{ required: true }"></i>
                          </date-picker>
                        </div>
                        <div class="model_schedule-body-content-table-body-time -end"
                             :class="{'-active': shift.planned_end_at, '-invalid': activeValidation && !shift.planned_end_at}">
                          <date-picker v-model="shift.planned_end_at"
                                       class="hide_styles_datepicker"
                                       :id="`schedule-block-${key}-time-to-input`"
                                       lang="ru"
                                       type="time"
                                       :value="shift.planned_end_at"
                                       :placeholder="shift.planned_end_at || 'Время'"
                                       :time-picker-options="time_periods"
                                       :disabled="shift.isDisabled"
                                       format='HH:mm'
                                       @input.native="validateTimeInput"
                                       @change="changeWorkShift('planned_end_at')"
                          ><i style="display: none;" slot="calendar-icon" :input-attr="{ required: true }"/>
                            <template v-slot:chosen-variant="props">
                              <span v-if="props.value">c {{ props.value.from }}</span>
                              <span v-else>Период</span>
                            </template>
                          </date-picker>
                        </div>
                        <div class="model_schedule-body-content-table-body-room">
                          <custom-select v-model="shift.room"
                                         :options="roomsOptions"
                                         class="model_schedule-body-schedule-settings-room-settings"
                                         :id="`schedule-block-${key}-room-select`"
                                         valueField="id"
                                         adjust-width
                                         defaultText="№"
                                         :disabled="shift.isDisabled"
                                         @change="changeWorkShift('room')"
                          >
                            <template v-slot:chosen-variant="props">
                              <span v-if="props.value" class="text-gray-700 text-fw-400">{{props.value.title }}</span>
                              <span v-else class="text-gray text-fw-400">№</span>
                            </template>
                          </custom-select>
                        </div>
                        <div class="model_schedule-body-content-table-body-operator">
                          <custom-select v-model="shift.operator"
                                         class="model_schedule-body-schedule-settings-operator-settings"
                                         :id="`schedule-block-${key}-operator-select`"
                                         valueField="id"
                                         titleField="fullname"
                                         defaultText="Оператор"
                                         :options="operatorsChangedPerDay[day.stamp]"
                                         searchableRequest
                                         :disabled="shift.isDisabled"
                                         infinityScroll
                                         :default-value="null"
                                         return-whole-object
                                         :variantSubheaderRule="operatorsSubheaderRule"
                                         @getNextPage="getOperatorsNextPage"
                                         @searchList="searchOperatorList"
                                         @change="changeWorkShift('operator')"
                          >
                            <template v-slot:chosen-variant="props">
                              <div class="response-task-parameters-title-executor-settings-selected">
                                <template v-if="props.value && (props.value.uid || props.value.fullname)">
                                  <div class="d-flex align-items-center">
                                    <template v-if="props.value.fullname || props.value.uid">
                                      <span>{{ props.value.fullname || props.value.uid }}</span>
                                    </template>
                                    <user-resign-icon v-if="props.value.resign_date" :user="props.value"/>
                                    <div v-else-if="props.value.blocked" class="glyphicon-blocked flex-shrink-0"
                                         v-b-tooltip.hover
                                         title="Сотрудник заблокирован"></div>
                                  </div>
                                </template>
                                <template v-else class="d-flex align-items-start">{{ props.shownText }}</template>
                              </div>
                            </template>
                            <template v-slot:list-variant="props">
                              <div class="model_schedule-body-content-option" :class="{'-disabled': formattedAbsences[props.variant.id] && formattedAbsences[props.variant.id][day.stamp]}">
                                <div class="d-flex align-items-center">
                                  <template v-if="!props.variant.uid || !props.variant.fullname">
                                    <span class="model_schedule-body-content-option-text-name">{{ props.variant.uid || props.variant.fullname }}</span>
                                  </template>
                                  <template v-else>
                                    <span class="model_schedule-body-content-option-text-name text-gray mr-1">{{ props.variant.uid }}</span>
                                    <span class="model_schedule-body-content-option-text-name">{{ props.variant.fullname }}</span>
                                  </template>
                                </div>
                                <div>
                                  <div v-if="props.variant.group" class="model_schedule-body-content-option-city">
                                        <span class="flag-icon mr-1"
                                              :class="`flag-icon-${props.variant.group.flag || 'default'}`"
                                              :title="props.variant.group.country"/>
                                    <span v-if="props.variant.group.city" class="text-gray mr-1">{{
                                        props.variant.group.city
                                      }}</span>
                                    <span v-if="props.variant.group.office">{{ props.variant.group.office }}</span>
                                  </div>
                                  <template v-else>Не состоит в группе</template>
                                </div>
                                <div v-if="formattedAbsences[props.variant.id] && formattedAbsences[props.variant.id][day.stamp]">
                                  <absence class="mb-1"/>
                                  <span> {{ absenceTypes[formattedAbsences[props.variant.id][day.stamp].type] }} </span>
                                  <span>{{ formattedAbsences[props.variant.id][day.stamp].start_at }} - {{ formattedAbsences[props.variant.id][day.stamp].end_at }}</span>
                                </div>
                              </div>
                            </template>
                          </custom-select>
                        </div>
                        <trash v-if="shift.isRemovable"
                               class="model_schedule-body-content-table-body-line-trash_icon"
                               @click="removeChangedWorkshift(day.stamp, key)"/>
                        <div v-if="!shift.isDisabled && hasMultipleActiveShifts" class="abc-checkbox -fixed model_schedule-body-content-table-body-line-checkbox mr-2 ml-2"
                             :class="{'without_status': !shift.id}">
                          <input v-model="shift.isChecked"
                                 :id="'add-' + day.stamp + key" type="checkbox"
                                 :value="day.stamp + key"
                          />
                          <label :for="'add-' + day.stamp + key"/>
                        </div>
                        <div v-if="shift.id"
                             class="model_schedule-body-content-table-body-line -status"
                             :class="`-${shift.status}`"
                             :id="`status-${shift.id}`"
                        />
                        <div v-else class="model_schedule-body-content-table-body-line -status"/>
                        <b-tooltip v-if="shift.id" placement="left" :target="`status-${shift.id}`">
                              <span class="workshifts-card-main-body-office-room-shifts-period-shift-cell-tooltip"
                                    :class="`-${shift.status}`">
                                {{ statuses[shift.status] }}
                              </span>
                        </b-tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
        <template v-else>
          <div class="model_schedule-body-content">
            <div class="model_schedule-body-content-header">
              <div class="model_schedule-body-content-header-title">Выбрать время</div>
              <div class="model_schedule-body-content-header-periods">
                <div class="model_schedule-body-schedule-settings-time-settings">
                  <div class="model_schedule-body-schedule-settings-time-settings-period">
                    <p class="m-0">C</p>
                    <div class="model_schedule-body-schedule-settings-time-settings-period-time">
                      <date-picker v-model="modelPeriodFrom"
                                   class="hide_styles_datepicker"
                                   id="schedule-date-from-input"
                                   lang="ru"
                                   type="time"
                                   placeholder="Время"
                                   :time-picker-options="time_periods"
                                   format='HH:mm'
                                   :input-attr="{ required: true }"
                      ><i style="display: none;" slot="calendar-icon"/></date-picker>
                    </div>
                    <span class="glyphicon glyphicon-time model_schedule-body-schedule-settings-time-settings-period-clock"/>
                  </div>
                  <div class="model_schedule-body-schedule-settings-time-settings-period mr-4">
                    <p class="m-0">До</p>
                    <div class="model_schedule-body-schedule-settings-time-settings-period-time">
                      <date-picker v-model="modelPeriodTo"
                                   class="hide_styles_datepicker"
                                   id="schedule-date-to-input"
                                   lang="ru"
                                   type="time"
                                   placeholder="Время"
                                   :time-picker-options="time_periods"
                                   format='HH:mm'
                                   :input-attr="{ required: true }"
                      ><i style="display: none;" slot="calendar-icon" :input-attr="{ required: true }"/></date-picker>
                    </div>
                    <span class="glyphicon glyphicon-time model_schedule-body-schedule-settings-time-settings-period-clock"/>
                  </div>
                </div>
              </div>
            </div>
            <div class="model_schedule-body-content-subheader">
              <div class="model_schedule-body-content-subheader-title">
                <div class="abc-checkbox">
                  <input type="checkbox"
                         id="week-select"
                         v-model="allWeekChoosen"
                         @change="changeAllWeek(allWeekChoosen)"
                  ><label for="week-select"></label>
                </div>
              </div>
              <div class="model_schedule-body-content-subheader-period">НАЧАЛО</div>
              <div class="model_schedule-body-content-subheader-period">КОНЕЦ</div>
            </div>
            <div class="model_schedule-body-content-week" v-for="(day, key) in modelScheduleDays" :key="key">
              <div class="model_schedule-body-content-week-day">
                <div class="model_schedule-body-content-week-day-title">
                  <div v-if="modelAbsencesForDays[key]" class="abc-checkbox">
                    <input type="checkbox" :id="`day-select_${key}`" disabled>
                    <label :for="`day-select_${key}`"></label>
                  </div>
                  <div v-else class="abc-checkbox">
                    <input v-model="day.state"
                           type="checkbox"
                           :id="`day-select_${key}`"
                           @change="setCurrentDay(day, key)" :disabled="day.disabled"
                    ><label :for="`day-select_${key}`"></label>
                  </div>
                  <p>{{ day.title }}</p>
                </div>
                <div class="model_schedule-body-content-week-day-periods">
                  <p class="model_schedule-body-content-week-day-periods-from">{{ day.from }}</p>
                  <p class="model_schedule-body-content-week-day-periods-to">{{ day.to }}</p>
                  <div v-if="day.disabled"
                       class="model_schedule-body-content-week-day-periods-delete glyphicon-trash_alt"
                       @click="cancelShift(key)"
                  />
                </div>
              </div>
            </div>
            <div class="model_schedule-body-content-accept_field">
              <b-button class="model_schedule-body-content-accept_field-button" size="sm"
                        variant="outline-primary" :disabled="!canAddShifts" @click="setShifts">Добавить
              </b-button>
            </div>
          </div>
        </template>
      </template>
    </div>
  </b-form>
</template>

<script>
import {mapActions, mapState} from "vuex";
import Select from "@/components/Common/Select/Select";
import DatePicker from 'vue2-datepicker';
import TooltipInfoWorkshifts from "@/pages/Workshifts/components/TooltipInfoWorkshifts";
import UserResignIcon from "@/components/Common/UserResignIcon";
import Avatar from "@/components/Common/Avatar/Avatar";
import absence from "@/assets/vue-svg/absence.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import at from "@/assets/vue-svg/at.svg";
import {getAbsenceForDate, showToast} from '@/tools/tools';
import trash from "@/assets/vue-svg/trash.svg";
import buttonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import reset from '@/assets/vue-svg/reset.svg';
import buttonCheck from '@/assets/vue-svg/tick-circle.svg';
import Vue from "vue";
import moment from 'moment';

moment.locale('ru');

export default {
  name: 'model-schedule',
  props: {
    modelData: Object,
    office: Object,
    rooms: Array,
    isModel: {
      type: Boolean,
      default: false
    },
    showModel: {
      type: Boolean,
      default: false
    },
    userPermissions: {
      type: Object
    },
    backButton: String,
    hasCredentials: Boolean,
    defaultDate: String,
    selectOffice: Boolean,
    officesList: Array,
    showAddAbsences: {
      type: Boolean,
      default: false
    },
    workshiftPeriods: {
      type: Array,
      default: []
    },
  },
  components: {
    UserResignIcon,
    buttonThrobber,
    'reset': reset,
    'button-check': buttonCheck,
    'tooltip-info-workshifts': TooltipInfoWorkshifts,
    'custom-select': Select,
    'date-picker': DatePicker,
    'avatar': Avatar,
    'absence': absence,
    'throbber': throbber,
    'trash': trash,
    'at': at,
  },
  data() {
    return {
      currentDate: moment(new Date()),
      room: null,
      time_periods: {start: '00:00', step: '00:30', end: '23:30'},
      schedules: [],
      daysBooleanArrays: [],
      daysBooleanArraysDays: [],
      workDays: 0,
      modelScheduleDays: [
        {state: false, title: 'ПН', from: null, to: null, disabled: false},
        {state: false, title: 'ВТ', from: null, to: null, disabled: false},
        {state: false, title: 'СР', from: null, to: null, disabled: false},
        {state: false, title: 'ЧТ', from: null, to: null, disabled: false},
        {state: false, title: 'ПТ', from: null, to: null, disabled: false},
        {state: false, title: 'СБ', from: null, to: null, disabled: false},
        {state: false, title: 'ВС', from: null, to: null, disabled: false}
      ],
      allWeekChoosen: false,
      modelPeriodFrom: '1970-01-01T00:00:00',
      modelPeriodTo: '1970-01-01T00:00:00',
      shiftsArray: [],
      activeDate: this.defaultDate || moment().format('YYYY-MM-DD'),
      chosenOffice: null,
      searchSurnameOperators: '',
      pairModelOperator: '',
      isCommonEditStatus: false,
      newCurrentShifts: {},
      changedWorkshifts: {},
      activeValidation: false,
      statuses: {
        created: 'Резерв',
        assigned: 'Назначена',
        completed: 'Завершена',
        process: 'В процессе',
        canceled: 'Отменена',
      },
      commonShiftParameters: {
        period: null,
        planned_start_at: null,
        planned_end_at: null,
        operator: null,
        room: null,
      },
    }
  },
  computed: {
    ...mapState('schedule', ['schedule', 'status']),
    ...mapState('dictionaries', ['absenceTypes']),
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    commonCheckbox: {
      get() {
        return this.activeDays.every(day => {
          return this.changedWorkshifts[day]?.every(shift => shift.isChecked || shift.isDisabled);
        });
      },
      set(value) {
        this.activeDays.forEach(day => {
          if (this.changedWorkshifts[day]) {
            this.changedWorkshifts[day].forEach(shift => {
              if (!shift.isDisabled) {
                this.$set(shift, 'isChecked', value);
              }
            });
          }
        });
      }
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    isLoading() {
      return this.scheduleStatus === 'request-week-workshift-model';
    },
    isCreatingLoading() {
      return this.scheduleStatus === 'creating';
    },
    activeDays() {
      return this.schedules.reduce((days, schedule) => {
        schedule.days?.forEach(day => {
          if (day.active) {
            days.push(day.stamp);
          }
        });
        return days;
      }, []);
    },
    operators() {
      return this.$store.state.schedule.operators;
    },
    operatorsHeaders() {
      return this.$store.state.schedule.operatorsHeaders;
    },
    currentWorkshift() {
      return this.$store.state.schedule.currentWeekWorkshifts;
    },
    canAddShifts() {
      return this.modelScheduleDays.some(day => day.state === true && day.disabled === false)
    },
    workDaysModelSchedule() {
      return this.modelScheduleDays.filter(day => day.state).length
    },
    allShiftsChoosen() {
      return !(this.workDaysModelSchedule < 7)
    },
    allFromEqual() {
      return this.modelScheduleDays.every(day => day.from === moment(this.modelPeriodFrom).format('HH:mm'))
    },
    allToEqual() {
      return this.modelScheduleDays.every(day => day.to === moment(this.modelPeriodTo).format('HH:mm'))
    },
    formattedAbsences() {
      return this.operatorsChanged.reduce((result, operator) => {
        const { id, absences } = operator;

        if (!result[id]) {
          result[id] = {};
        }

        absences.forEach(absence => {
          const { start_at, end_at } = absence;

          let currentDate = moment.utc(start_at).startOf('day');
          const endDate = moment.utc(end_at).startOf('day');

          while (currentDate.isSameOrBefore(endDate, 'day')) {
            const formattedDate = currentDate.format('YYYY-MM-DD');

            if (!result[id][formattedDate]) {
              result[id][formattedDate] = {
                type: absence.type,
                start_at: moment(start_at).format('DD.MM'),
                end_at: moment(end_at).subtract(1, 'day').format('DD.MM'),
              };
            }

            currentDate = currentDate.add(1, 'days');
          }
        });

        return result;
      }, {});
    },
    operatorsChanged() {
      let operatorCheckedAbsences = this.operators.map(operator => {
        operator.checkedAbsences = this.checkAbsence(operator.absences)
        operator.disabled = !(operator.checkedAbsences[0] === null)
        return operator
      })
      return operatorCheckedAbsences || [];
      return this.rooms ? [{
        id: null,
        fullname: 'Выберите оператора'
      }, ...operatorCheckedAbsences] : [{id: null, fullname: 'Выберите оператора'}];
    },
    operatorsChangedPerDay() {
      const operatorsByDate = {};
      for (const date in this.changedWorkshifts) {
        operatorsByDate[date] = this.operatorsChanged.map(operator => {
          const operatorCopy = {...operator};
          operatorCopy.disabled = this.isOperatorDisabled(operator, date);
          return operatorCopy;
        });
      }
      return operatorsByDate;
    },
    roomsOptions() {
      return this.rooms
          ? [{ id: null, title: '№' }, ...this.rooms.filter(room => !room.is_deleted)]
          : [{ id: null, title: '№' }];
    },
    currentDatesText() {
      if (this.dateFormat === 'day') return moment(this.activeDate).format('dddd, DD.MM.YYYY');
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-1);
      let text = date.format('DD.MM.YYYY');
      date.add(6, 'd');
      return `${text} - ${date.format('DD.MM.YYYY')}`;
    },
    formattedWorkshifts() {
      if (!this.currentWorkshift.workshifts || this.currentWorkshift.model?.id !== this.modelData.id) return {};
      let formattedWorkshifts = {};
      for (let date in this.currentWorkshift.workshifts) {
        formattedWorkshifts[date] = [];
        for (let period in this.currentWorkshift.workshifts[date]) {
          for (let room in this.currentWorkshift.workshifts[date][period]) {
            this.currentWorkshift.workshifts[date][period][room].workshifts.map(shift => {
              formattedWorkshifts[date].push({
                ...shift,
                work_shift: period,
                room: parseInt(room),
                period: `${shift.start_at || shift.planned_start_at}-${shift.end_at || shift.planned_end_at}`,
                time: shift.start_at && shift.end_at ? `${shift.start_at} - ${shift.end_at}` : `${shift.planned_start_at} - ${shift.planned_end_at}`,
                isRemovable: ['created', 'assigned', 'canceled'].includes(shift.status) && this.currentDate.isSameOrBefore(shift.planned_start_at_date),
                isDisabled: !['assigned', 'created', 'canceled'].includes(shift.status) || !this.currentDate.isSameOrBefore(shift.planned_start_at_date),
                isChecked: false,
                partner: {
                  ...shift.operator ? {...shift.operator, userType: 'operator'} : {},
                  office: {id: this.model.office ? this.model.office.id : this.office.id}
                }
              });
            })
          }
        }
      }
      return formattedWorkshifts;
    },
    filteredSchedules() {
      const filteredSchedules = [];
      for (const schedule of this.schedules) {
        const activeDaysInSchedule = schedule.days.filter(day => {
          return this.activeDays.includes(day.stamp);
        });
        filteredSchedules.push({...schedule, days: activeDaysInSchedule});
      }
      return filteredSchedules;
    },
    hasInvalidShifts() {
      let invalid = false
      this.activeDays.forEach(day => {
        this.changedWorkshifts[day].forEach(shift => {
          if (!shift.planned_end_at || !shift.planned_start_at)
            invalid = true;
        });
      });
      return invalid;
    },
    model() {
      return this.currentWorkshift?.model?.id ? this.currentWorkshift.model : this.modelData;
    },
    modelDates() {
      return [-1, 0, 1, 2, 3, 4, 5].map(day => moment.parseZone(this.defaultDate).isoWeekday(day));
    },
    modelAbsencesForDays() {
      return this.modelDates.map(date => getAbsenceForDate(date, this.userAbsences));
    },
    absenceTypes() {
      return this.$store.state.dictionaries.absenceTypes;
    },
    isModelResign() {
      return this.model?.is_resign;
    },
    userAbsences() {
      return this.$store.state.profile.absences;
    },
    isFormDisabledWithError() {
      return (!this.model?.has_credentials && !this.hasCredentials) || this.model?.is_resign;
    },
    isConfigure() {
      return this.activeDays.length > 1 || this.changedWorkshifts[this.activeDays[0]]?.length > 1;
    },
    absencesByOperatorId() {
      const absencesByOperator = {};
      const checkedDates = new Set();

      for (const date in this.changedWorkshifts) {
        if (this.changedWorkshifts[date].some(shift => shift.isChecked)) {
          checkedDates.add(date);
        }
      }

      this.operatorsChanged.forEach(operator => {
        const {id, absences} = operator;

        absencesByOperator[id] = {...operator, absences: [], disabled: false};

        absences.forEach(absence => {
          const absenceStartDate = moment(absence.start_at, 'YYYY-MM-DD').startOf('day');
          const absenceEndDate = moment(absence.end_at, 'YYYY-MM-DD').startOf('day');

          Array.from(checkedDates).forEach(date => {
            const currentDate = moment(date);
            if (currentDate.isSameOrAfter(absenceStartDate) && currentDate.isSameOrBefore(absenceEndDate)) {
              absencesByOperator[id].disabled = true;
              const start_at = absenceStartDate.format('DD.MM');
              if (absencesByOperator[id].absences.some(currentAbsence => currentAbsence.start_at === start_at)) return;
              absencesByOperator[id].absences.push({
                type: absence.type,
                start_at,
                end_at: absenceEndDate.format('DD.MM')
              });
            }
          });
        });
      });

      return absencesByOperator;
    },
    hasSelectedShifts() {
      for (const day of this.activeDays) {
        if (this.changedWorkshifts[day]) {
          for (const workshift of this.changedWorkshifts[day]) {
            if (workshift.isChecked) {
              return true;
            }
          }
        }
      }
      return false;
    },
    hasMultipleActiveShifts() {
      let activeShiftCount = 0;
      for (const day of this.activeDays) {
        if (this.changedWorkshifts[day]) {
          for (const shift of this.changedWorkshifts[day]) {
            if (!shift.isDisabled) {
              activeShiftCount++;
            }
          }
        }
      }
      return activeShiftCount >= 2;
    }
  },
  watch: {
    scheduleStatus: function (newStatus, prevStatus) {
      if (newStatus === '' && prevStatus === 'request-week-workshift-model')
        this.transformWorkshifts();
      if (prevStatus === 'creating')
        switch (newStatus) {
          case 'schedule-created':
            this.transformWorkshifts();
            this.schedules.forEach(schedule => {
              schedule.days.forEach(day => {
                day.active = false;
              });
            });
            break;
          case 'error':
            showToast(this.$toasted, this.requestErrors[0]?.message || 'При добавление смены возникла ошибка', 'error');
            break;
        }
    },
    status: function (newStatus) {
      if (newStatus === 'schedule-created') {
        this.$emit('fetchFreeModels', this.office);
        showToast(this.$toasted, 'Смены добавлены в расписание', 'success');
        this.$emit('fetchSchedule');
      }
    },
  },
  created() {
    this.addSchedule();
    this.updateCurrentSchedule();
    this.updateAbsenceUser();
    this.$store.dispatch('dictionaries/getAbsenceTypes');
    this.transformWorkshifts();
  },
  beforeDestroy() {
    this.$store.dispatch('schedule/clearModelWorkShiftsWeek');
  },
  methods: {
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('schedule', ['createSchedule']),
    createEmptyWorkshift() {
      return {
        operator: { id: null },
        planned_end_at: null,
        planned_start_at: null,
        room: null,
        work_shift: null,
        isRemovable: true,
        isDisabled: false
      };
    },
    applyCommonParameters() {
      console.log('applyCommonParameters');
      this.activeDays.forEach(day => {
        console.log(this.changedWorkshifts[day]);
        if (!this.changedWorkshifts[day]) return;

        this.changedWorkshifts[day].forEach(workshift => {
          console.log(workshift.isRemovable, workshift.isChecked);
          if (!workshift.isRemovable || !workshift.isChecked) return;

          for (const field in this.commonShiftParameters) {
            console.log(field, this.commonShiftParameters[field]);
            if (!this.commonShiftParameters[field]) continue;
            this.$set(workshift, field, this.commonShiftParameters[field]);
          }
        });
      });
    },
    removeChangedWorkshift(dayStamp, id) {
      if (this.changedWorkshifts[dayStamp] && this.changedWorkshifts[dayStamp].length > id) {
        const removedWorkshift = this.changedWorkshifts[dayStamp][id];
        if (removedWorkshift) {
          this.changedWorkshifts[dayStamp].splice(id, 1);
        }
      }
    },
    addEmptyWorkshift(stamp) {
      this.activeValidation = false;
      this.resetCommonParameters();

      if (!this.changedWorkshifts[stamp]) {
        this.$set(this.changedWorkshifts, stamp, [this.createEmptyWorkshift()]);
      } else {
        const updatedShifts = [...this.changedWorkshifts[stamp], this.createEmptyWorkshift()];
        this.$set(this.changedWorkshifts, stamp, updatedShifts);
      }
    },
    addEmptyWorkshiftIfMissing(stamp) {
      if (!this.changedWorkshifts[stamp]) {
        this.$set(this.changedWorkshifts, stamp, [this.createEmptyWorkshift()]);
      } else if (this.changedWorkshifts[stamp].length === 0) {
        this.$set(this.changedWorkshifts, stamp, [this.createEmptyWorkshift()]);
      }
    },
    transformWorkshifts() {
      let changedWorkshifts = {};
      changedWorkshifts = this.schedules.reduce((acc, schedule) => {
        schedule.days?.forEach(day => {
          const stamp = day.stamp;
          const workshiftsForDay = this.formattedWorkshifts[stamp] || [];

          acc[stamp] = JSON.parse(JSON.stringify(workshiftsForDay));
        });
        return acc;
      }, changedWorkshifts);

      this.changedWorkshifts = changedWorkshifts;
    },
    getOperators(pairModel) {
      this.pairModelOperator = pairModel
      this.$store.dispatch('schedule/fetchOperators', {
        model: pairModel,
        params: {
          ['groups[]']: this.office.id,
          'workweek': this.activeDate,
          surname: this.searchSurnameOpertor,
          is_active: true,
          per_page: 20
        }
      });
    },
    getOperatorsNextPage() {
      if ((this.operatorsHeaders.currentPage >= this.operatorsHeaders.totalPages) || (this.scheduleStatus === 'operator-request')) return;
      this.$store.dispatch('schedule/fetchOperatorsNextPage', {
        model: this.pairModelOperator,
        params: {
          ['groups[]']: this.office.id,
          'workweek': this.activeDate,
          surname: this.searchSurnameOpertor,
          is_active: true,
          per_page: 20,
          page: this.operatorsHeaders.currentPage + 1
        }
      });
    },
    searchOperatorList(search) {
      this.searchSurnameOpertor = search
      this.getOperators(this.pairModelOperator)
    },
    changeCheckbox(schedule, index, scheduleDay, scheduleIndex) {
      if (!schedule.days.some(day => day.active)) {
        if (this.formattedWorkshifts[schedule.days[index].stamp]?.length === 1) {
          let shift = this.formattedWorkshifts[schedule.days[index].stamp][0],
              periodArray = shift.work_shift.split(' - ');
          schedule.work_shifts = [{
            from: shift.planned_start_at,
            to: shift.planned_end_at,
            room: shift.room,
            operator: shift.operator,
            work_shift: {
              from: periodArray[0],
              to: periodArray[1],
            },
            fromCurrentShift: true,
          }];
        } else
          schedule.work_shifts = [{}];
      } else if (schedule.work_shifts[0].fromCurrentShift)
        schedule.work_shifts = [{}];
      else
        schedule.work_shifts = schedule.work_shifts.map(shift => ({...shift, operator: null, fromCurrentShift: false}));


      schedule.days[index].active = !schedule.days[index].active;
      if (!schedule.days[index].active && this.formattedWorkshifts[schedule.days[index].stamp]) {
        this.changedWorkshifts[schedule.days[index].stamp] = JSON.parse(JSON.stringify(this.formattedWorkshifts[schedule.days[index].stamp]));
      }

      if (schedule.days[index]?.active === false && this.changedWorkshifts[schedule.days[index]?.stamp]) {
        const filteredShifts = this.changedWorkshifts[schedule.days[index]?.stamp].filter(shift => shift.id);
        if (filteredShifts.length === 0) {
          Vue.delete(this.changedWorkshifts, schedule.days[index]?.stamp);
        } else {
          Vue.set(this.changedWorkshifts, schedule.days[index]?.stamp, filteredShifts);
        }
      }

      this.addEmptyWorkshiftIfMissing(schedule.days[index].stamp);
      this.selectedDays(index, scheduleIndex, schedule);
    },
    selectedDays(dayIndex, scheduleIndex, schedule) {
      let schedulesCopy = this.schedules,
          array = [],
          workDaysArray = [];
      schedulesCopy.map(function (schedule) {
        array.push(schedule.days.map(day => day.active));
      });
      this.daysBooleanArrays = array;
      if (array.length > 1) {
        let bool = this.schedules[scheduleIndex].days[dayIndex].active;
        schedulesCopy = schedulesCopy.map(function (schedule, scheduleIndexTwo) {
          schedule.days.map(function (day, dayIndexTwo) {
            if ((scheduleIndex !== scheduleIndexTwo) && (dayIndex === dayIndexTwo) && (day.active === bool)) {
              if (day.active) day.active = !day.active;
            }
          });
        });
      }
      JSON.parse(JSON.stringify(this.schedules)).map(function (schedule) {
        workDaysArray.push(schedule.days.map(day => day.active));
      });
      this.daysBooleanArraysDays = workDaysArray;
      this.workDays = workDaysArray.map(function (week) {
        return week.filter(function (item) {
          return item ? '1' : '0';
        }).reduce(function (previousValue, item) {
          return previousValue + item;
        });
      }).reduce(function (previousValue, item) {
        return previousValue + item;
      });
    },
    openSchedule() {
      this.toggleHelper(true)
    },
    isValidTimeFormat(time) {
      return /^\d{2}:\d{2}$/.test(time);
    },
    submitForm() {
      this.activeValidation = true;
      let editedShifts = [];

      if (this.hasInvalidShifts) {
        showToast(this.$toasted, 'Данные по смене не заполнены', 'error');
        return;
      }

      this.activeDays.forEach(day => {
        this.changedWorkshifts[day]?.forEach(shift => {
          if (shift.isRemovable === true) {
            let editedShift = {
              from: this.isValidTimeFormat(shift.planned_start_at) ? shift.planned_start_at : moment(shift.planned_start_at).format('HH:mm'),
              to: this.isValidTimeFormat(shift.planned_end_at) ? shift.planned_end_at : moment(shift.planned_end_at).format('HH:mm'),
              period_date: day
            };

            if (shift.room)
              editedShift.room = shift.room;

            if (shift.operator && shift.operator.id)
              editedShift.operator = shift.operator.id;

            if (shift.work_shift) {
              if (!shift.work_shift.from)
                editedShift.work_shift = this.parseWorkShiftString(shift.work_shift);
              else
                editedShift.work_shift = shift.work_shift;
            }

            editedShifts.push(editedShift);
          }
        });
      });

      const allWorkshiftIds = [];

      this.activeDays.forEach(day => {
        this.formattedWorkshifts[day]?.forEach(shift => {
          if (['created', 'assigned', 'canceled'].includes(shift.status) && this.currentDate.isSameOrBefore(shift.planned_start_at_date))
            allWorkshiftIds.push(shift.id);
        });
      });

      this.$store.dispatch('schedule/createNewSchedule', {
        ids_delete: allWorkshiftIds,
        group: this.office.id,
        model: this.model.id,
        workshifts: editedShifts
      });
    },
    parseWorkShiftString(workShiftString) {
      const [from, to] = workShiftString?.split(' - ');
      return {from, to};
    },
    addSchedule() {
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-2);
      else date.subtract(1, 'day');
      let newSchedule = {
        days: [null, null, null, null, null, null, null].map(() => {
          date.add(1, 'day');
          return {
            active: false,
            number: date.format('D'),
            title: date.format('dd'),
            stamp: date.format('YYYY-MM-DD')
          }
        }),
        model: null,
        group: null,
        work_shifts: [{from: null, to: null, operator: null, room: null}],
      }
      this.schedules.push(newSchedule);
    },
    deleteSchedule(schedule) {
      let schedulesCopy = [...this.schedules],
          deletedSchedulesIndex = schedulesCopy.findIndex((oldSchedule) => {
            return oldSchedule === schedule
          })
      if (deletedSchedulesIndex === -1) return
      schedulesCopy.splice(deletedSchedulesIndex, 1)
      this.schedules = schedulesCopy
    },
    changeWorkShift(field) {
      this.commonShiftParameters[field] = field === 'operator' ? {id: null} : null;
    },
    setCurrentDay(currentDay, number) {
      let from = this.modelPeriodFrom,
          to = this.modelPeriodTo;
      this.modelScheduleDays = this.modelScheduleDays.map(function (day, index) {
        if (index === number) {
          day.state = currentDay.state;
          if (currentDay.state) {
            day.from = moment(from).format('HH:mm');
            day.to = moment(to).format('HH:mm');
          } else {
            day.from = null;
            day.to = null;
          }
        }
        return day;
      })

      if (this.allWeekChoosen && !currentDay.state) this.allWeekChoosen = !this.allWeekChoosen;
      if (this.allShiftsChoosen && this.allFromEqual && this.allToEqual) this.allWeekChoosen = true;
    },
    setShifts() {
      let shiftsArray = this.shiftsArray;
      this.modelScheduleDays = this.modelScheduleDays.map(function (day, index) {
        if (day.state && !day.disabled) {
          let indexCopy = index;
          if (moment(`${moment().isoWeekday(index + 1).add(1, 'week').format('YYYY-MM-DD')}T${day.from}:00`) >= moment(`${moment().isoWeekday(index + 1).add(1, 'week').format('YYYY-MM-DD')}T${day.to}:00`)) indexCopy++;
          day.disabled = !day.disabled;
          shiftsArray.push({
            from: `${moment().isoWeekday(index + 1).add(1, 'week').format('YYYY-MM-DD')}T${day.from}:00`,
            to: `${moment().isoWeekday(indexCopy + 1).add(1, 'week').format('YYYY-MM-DD')}T${day.to}:00`
          })
        }
        return day;
      })
      this.shiftsArray = shiftsArray;
      this.$emit('saveSchedule', this.shiftsArray);
    },
    cancelShift(key) {
      let currentDay = moment().isoWeekday(key + 1).add(1, 'week').format('YYYY-MM-DD')
      this.modelScheduleDays = this.modelScheduleDays.map(function (day, index) {
        if (index === key) {
          day.state = false
          day.from = null
          day.to = null
          day.disabled = false
        }
        return day
      })
      this.deletePeriod(currentDay)
    },
    deletePeriod(day) {
      let shiftsArrayCopy = [...this.shiftsArray],
          deletedshiftsArrayIndex = shiftsArrayCopy.findIndex((oldShift) => {
            return moment(oldShift.from).format('YYYY-MM-DD') === day
          })
      if (deletedshiftsArrayIndex === -1) return
      shiftsArrayCopy.splice(deletedshiftsArrayIndex, 1)
      this.shiftsArray = shiftsArrayCopy
      this.$emit('saveSchedule', this.shiftsArray)
    },
    changeAllWeek(state) {
      let from = this.modelPeriodFrom,
          to = this.modelPeriodTo
      this.modelScheduleDays = this.modelScheduleDays.map(function (day) {
        if (!day.disabled) {
          day.state = state;
          if (state) {
            day.from = moment(from).format('HH:mm')
            day.to = moment(to).format('HH:mm')
          } else {
            day.from = null
            day.to = null
          }
        }
        return day
      })
    },
    goBack() {
      this.$emit('go-back');
    },
    addDate() {
      let date = moment(this.activeDate);
      date.add(7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      this.activeFreeModelsDate = this.activeDate;
      this.schedules = [];
      this.workDays = 0;
      this.addSchedule();
      this.updateCurrentSchedule();
      this.updateAbsenceUser();
      this.resetCommonParameters();
    },
    subtractDate() {
      let date = moment(this.activeDate);
      date.subtract(7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      this.activeFreeModelsDate = this.activeDate;
      this.schedules = [];
      this.workDays = 0;
      this.addSchedule();
      this.updateCurrentSchedule();
      this.updateAbsenceUser();
      this.resetCommonParameters();
    },
    updateCurrentSchedule() {
      this.$store.dispatch('schedule/fetchModelWorkShiftsWeek', {
        model: this.modelData.id,
        params: {
          group: (this.modelData.id === this.model.id) && this.model.office ? this.model.office.id : this.office.id,
          workweek: this.activeDate,
          pagination: false
        }
      });
    },
    updateAbsenceUser() {
      this.$store.dispatch('profile/fetchAbsences', {
        user: this.model.id,
        'date[workweek]': moment(this.activeDate).format('YYYY-MM-DD')
      });
      this.getOperators(this.modelData.id);
    },
    closeToast(e, toastObject) {
      toastObject.goAway(0);
    },
    chooseOffice() {
      this.$emit('setChosenGroupId', this.chosenOffice);
      this.$nextTick(() => {
        this.updateCurrentSchedule();
      })
    },
    openMiniProfile(user) {
      if (user.userType && user.userType === 'operator') if (!this.userPermissions.operator.profile.view) return;
      else if (!this.userPermissions.model.profile.view) return;
      this.$emit('open-mini-profile', {
        user: user,
        title: 'Расписание на неделю',
        model: user.id !== this.model.id ? this.model : null
      })
    },
    openModelMiniProfile(user) {
      if (!this.userPermissions.model.profile.view) return;
      this.$emit('open-mini-profile', {
        user: user,
        title: 'Расписание на неделю',
        model: user.id !== this.model.id ? this.model : null
      })
    },
    openAbsenceDetails() {
      this.$emit('open-absence-details', this.activeDate);
    },
    isDayAbsence(day, absences = this.userAbsences) {
      let absencesCurrentDay = absences.filter(absence => moment(day.stamp).isBetween(moment(absence.start_at).format('YYYY-MM-DD'), moment(this.subtractDay(absence.end_at)).format('YYYY-MM-DD'), undefined, '[]'))
      return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {
        return `${this.absenceTypes[absence.type]} ${moment(absence.start_at).format('DD.MM')} - ${moment(this.subtractDay(absence.end_at)).format('DD.MM')}`
      }) : null;
    },
    checkAbsence(operatorAbsences) {
      let daysAbsences = this.schedules.map(schedule => {
        return schedule.days.filter(day => day.active).map(day => {
          return operatorAbsences ? this.isDayAbsence(day, operatorAbsences) : null
        })
      })
      let result = [].concat.apply([], daysAbsences[0]);
      return result.filter(function (item, pos) {
        return result.indexOf(item) == pos;
      })
    },
    validateTimeInput(event) {
      if (!/^[0-9:]*$/.test(event.target.value)) {
        event.target.value = event.target.value.replace(/[^0-9:]/g, '');
        event.preventDefault();
      } else {
        const colonIndex = event.target.value.indexOf(':');
        if (colonIndex === -1) return;
        if (event.target.value.substring(colonIndex + 1).length > 2) {
          event.target.value = event.target.value.substring(0, colonIndex + 3);
        }
      }
    },
    subtractDay(subtractDate) {
      let date = moment(subtractDate);
      date.subtract(1, 'days');
      return date;
    },
    isOperatorDisabled(operator, day) {
      if (this.formattedAbsences[operator.id]) {
        const formattedDate = moment(day).format('YYYY-MM-DD');
        if (!!this.formattedAbsences[operator.id][formattedDate]) return true;
      }
      return false;
    },
    getAbsenceInfo(absence) {
      return `${this.absenceTypes[absence.type]} ${moment.parseZone(absence.start_at).format('DD.MM')} - ${moment.parseZone(absence.end_at).format('DD.MM')}`;
    },
    operatorsSubheaderRule(operatorKey) {
      if (operatorKey === 0) return this.operatorsChanged[operatorKey]?.is_pair ? 'работали с моделью' : 'операторы';
      if (this.operatorsChanged[operatorKey]?.is_pair === false && this.operatorsChanged[operatorKey - 1]?.is_pair) return 'операторы';
      return null;
    },
    resetCommonParameters() {
      this.commonShiftParameters = {
        period: null,
        planned_start_at: null,
        planned_end_at: null,
        operator: null,
        room: null,
      };
      this.changeCommonEditStatus(false);
    },
    changeCommonEditStatus(value) {
      this.isCommonEditStatus = value;
    }
  }
}
</script>