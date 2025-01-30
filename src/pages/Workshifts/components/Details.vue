<template>
  <div class="workshift_details">
    <shift-report-details v-if="droverType === 'report'"
                          v-model="reportParameterGroups"
                          :shift-id="changedWorkshift.id"
                          :report-id="changedWorkshift.report && changedWorkshift.report.id"
                          :active-accounts="changedWorkshift.active_accounts"
                          @click-back="closeNestedDrover"
    />
    <template v-else>
      <div class="workshift_details-header theme-helper-content-main-header">
        <template v-if="!operatorSchedule">
          <template v-if="(changedWorkshift.status === 'completed') || editingShift">
            <b-button v-if="!changedWorkshift.report && userPermissions.workshift.report.create"
                      class="mr-2"
                      size="sm"
                      variant="outline-primary"
                      id="create-report-shift-button"
                      @click="showReportDrover"
            >Добавить отчет</b-button>
          </template>
          <template v-else-if="(changedWorkshift.status === 'created') && userPermissions.schedule.edit">
            <b-button size="sm"
                      variant="outline-primary"
                      id="assign-shift-button"
                      :disabled="(scheduleStatus === 'editing') || (scheduleStatus === 'canceling') || !changedWorkshift.room || errorModelWithAbsence || errorOperatorWithAbsence"
                      @click="assignWorkshift"
            >Назначить смену</b-button>
            <b-button class="ml-2"
                      size="sm"
                      :variant="cancelBlockStatus ? 'danger' : 'outline-danger'"
                      id="shift-button-cancel"
                      @click="showCancelBlock" :disabled="errorModelWithAbsence || errorOperatorWithAbsence"
            >Отменить смену</b-button>
          </template>
          <b-button v-else-if="!changedWorkshift.id"
                    size="sm"
                    variant="outline-primary"
                    id="shift-button-save"
                    :disabled="errorOperatorWithAbsence"
                    @click="createShift"
          >Назначить</b-button>
          <template v-else-if="(changedWorkshift.status !== 'canceled') && (userPermissions.schedule.edit || userPermissions.schedule.actual.start.date.edit || userPermissions.schedule.actual.end.date.edit || userPermissions.schedule.break.edit)">
            <b-button size="sm"
                      variant="outline-primary"
                      id="shift-button-save"
                      :disabled="errorModelWithAbsence || errorOperatorWithAbsence"
                      @click="closeDrover"
            >Сохранить</b-button>
            <b-button class="ml-2"
                      size="sm"
                      :variant="cancelBlockStatus ? 'danger' : 'outline-danger'"
                      id="shift-button-cancel"
                      @click="showCancelBlock" :disabled="errorModelWithAbsence || errorOperatorWithAbsence"
            >Отменить смену</b-button>
          </template>
          <b-button v-if="editingShift"
                    size="sm"
                    variant="outline-primary"
                    id="shift-button-save"
                    :disabled="errorModelWithAbsence || errorOperatorWithAbsence"
                    @click="checkNewStatus"
          >Сохранить</b-button>
          <b-button v-else-if="((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'canceled')) && userPermissions.schedule.edit && userPermissions.edit.workshift.management"
                    size="sm"
                    variant="outline-primary"
                    id="shift-button-save"
                    :disabled="errorModelWithAbsence || errorOperatorWithAbsence"
                    @click="startShiftEdit"
          >Изменить</b-button>
          <b-button v-if="showDeleteButton" size="sm"
                    variant="outline-danger"
                    class="ml-2"
                    id="shift-button-delete"
                    v-b-modal.delete_shift_modal
          >Удалить смену</b-button>
        </template>
      </div>
      <div class="workshift_details-body">
        <div class="workshift_details-body-container" :style="`padding-bottom: ${commentsBlockHeight}px;`">
          <div v-if="(changedWorkshift.status === 'canceled') && userPermissions.workshift.report.view"
               class="workshift_details-body-cancel">
            <div class="workshift_details-body-cancel-card card">
              <div class="workshift_details-body-cancel-card-content">
                <h4>Причина отмены</h4>
                <div class="workshift_details-body-cancel-card-content-title">
                  {{ changedWorkshift.cancel && changedWorkshift.cancel.title }}
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="changedWorkshift.report && userPermissions.workshift.report.view" class="workshift_details-body-report" @click="showReportDrover">
            <h3 class="mb-0">Отчет о смене: заполнен</h3>
            <i class="fa fa-angle-right"/>
          </div>
          <div v-if="cancelBlockStatus" class="workshift_details-body-cancel">
            <div class="workshift_details-body-cancel-card card">
              <b-form class="workshift_details-body-cancel-card-content" @submit.prevent="cancelWorkshift">
                <div class="helper-close workshift_details-body-cancel-card-content-close" @click="hideCancelBlock"></div>
                <h4>Причина отмены</h4>
                <custom-select v-model="cancellationReason"
                               :options="cancellationReasons"
                               class="-white -alt"
                               id="shift-cancelation-reason-select"
                               value-field="id"
                               defaultText="Выберите причину отмены смены"
                />
                <b-button class="float-right mt-2" variant="danger" type="submit" :disabled="cancellationReason === null">
                  Отменить
                </b-button>
              </b-form>
            </div>
          </div>
          <div class="workshift_details-body-top">
            <div class="workshift_details-body-top-status workshifts-edit-main-date-period-table-row-shifts-shift-cell-status"
                 :class="`-${changedWorkshift.status}`"
            >{{ statusTitles[changedWorkshift.status] }}</div>
            <!--                    <h3 v-if="changedWorkshift.id" class="workshift_details-body-top-title">Информация о смене</h3>-->
            <div v-if="changedWorkshift.model" class="user_details-main-user" @click="openMiniProfile(changedWorkshift.model)">
              <div class="user_details-main-user-avatar">
                <avatar class="mr-2"
                        size="-lg"
                        :url="changedWorkshift.model.avatar"
                        :telegram="changedWorkshift.model.telegram_connected"
                        :is-fin-admin="changedWorkshift.model.is_fin_admin"
                />
              </div>
              <div class="user_details-main-user-info">
                <div v-if="changedWorkshift.id" class="d-flex align-items-center">
                  <div class="model_mini_profile-model_container-personal">
                    <span class="text-gray mr-1">{{ changedWorkshift.model.uid }}</span>
                    <b v-if="changedWorkshift.model.fullname">{{ changedWorkshift.model.fullname }}</b>
                    <div v-else-if="changedWorkshift.model.model_nickname" class="d-flex align-items-center">
                      <at class="mr-1"/>
                      <b>{{ changedWorkshift.model.model_nickname }}</b>
                    </div>
                  </div>
                  <user-resign-icon v-if="changedWorkshift.model.resign_date" :offset="40" :user="changedWorkshift.model" id="resign_info-model" />
                  <div v-else-if="changedWorkshift.model.blocked" class="glyphicon-blocked" v-b-tooltip.hover title="Сотрудник заблокирован"></div>
                  <template v-if="changedWorkshift.model.new_model">
                    <div class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2" id="new-user-shift-details"/>
                    <b-tooltip target="new-user-shift-details" triggers="hover" placement="top">
                      <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                    </b-tooltip>
                  </template>
                  <div v-if="changedWorkshift.model.is_solo" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло</div>
                </div>
                <custom-select v-else
                               v-model="changedWorkshift.model"
                               :options="filteredModels"
                               class="-items_padding_sm -no_arrow user_details-main-user-info-model"
                               value-field="id"
                               title-field="fullname"
                               defaultText="Выберите модель"
                               id="shift-model-select"
                               returnWholeObject
                               infinityScroll
                               searchableRequest
                               @change="changeModel"
                               @getNextPage="getModelsNextPage"
                               @searchList="searchModelList"
                >
                  <template v-slot:chosen-variant="{value, shownText}">
                    <div v-if="value && (value.uid || value.fullname || value.model_nickname)" class="d-flex align-items-center">
                      <span class="text-gray mr-1">{{ value.uid }}</span>
                      <span v-if="value.fullname">{{ value.fullname }}</span>
                      <div v-else-if="value.model_nickname" class="d-flex align-items-center">
                        <at class="mr-1"/>
                        <b>{{ value.model_nickname }}</b>
                      </div>
                      <user-resign-icon v-if="value.resign_date" :offset="40" :user="value" id="resign_info-model" />
                      <div v-else-if="value.blocked" class="glyphicon-blocked" v-b-tooltip.hover title="Сотрудник заблокирован"></div>
                      <template v-if="value.new_model">
                        <div class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2" id="new-user-shift-details"/>
                        <b-tooltip target="new-user-shift-details" triggers="hover" placement="top">
                          <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                        </b-tooltip>
                      </template>
                      <div v-if="value.is_solo" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло</div>
                    </div>
                    <span v-else>{{ shownText }}</span>
                  </template>
                  <template v-slot:list-variant="{variant}">
                    <div class="d-flex align-items-center">
                      <avatar class="mr-2"
                              :url="variant.avatar"
                              :telegram="variant.telegram_connected"
                              :is-fin-admin="variant.is_fin_admin"
                      />
                      <div class="d-flex flex-column">
                        <div class="d-flex align-items-center">
                          <template v-if="!variant.uid || !variant.fullname">
                            {{ variant.uid || variant.fullname }}
                          </template>
                          <template v-else>
                            <span class="text-gray mr-1">{{ variant.uid }}</span>
                            <span v-if="variant.fullname">{{ variant.fullname }}</span>
                            <div v-else-if="variant.model_nickname" class="d-flex align-items-center">
                              <at class="mr-1"/>
                              <b>{{ variant.model_nickname }}</b>
                            </div>
                          </template>
                        </div>
                        <template v-for="absence in variant.checkedAbsences" class="response-task-parameters-title-executor-settings-setting-item-absence">
                          <b class="text-gray mr-1"><absence/> {{ absence }}</b>
                        </template>
                      </div>
                    </div>
                  </template>
                </custom-select>
                <div v-if="changedWorkshift.model && changedWorkshift.model.model_nickname && changedWorkshift.model.fullname" class="d-flex align-items-center">
                  <at class="mr-1"/>
                  <b>{{ changedWorkshift.model.model_nickname }}</b>
                </div>
                <span v-if="operatorSchedule">Модель</span>
                <span v-else-if="!group.type && group.id && changedWorkshift.group">
                <span class="flag-icon mr-1" :class="`flag-icon-${changedWorkshift.group.flag || changedWorkshift.group.build_group.flag || 'default'}`"
                      :title="changedWorkshift.group.country || changedWorkshift.group.build_group.country"></span>
                <span class="text-gray mr-1">{{ changedWorkshift.group.city || changedWorkshift.group.build_group.city }}</span>
                <span >{{ changedWorkshift.group.office || changedWorkshift.group.build_group.office }}</span>
              </span>
                <span v-else-if="group.type === 'office'">
                <span class="flag-icon mr-1" :class="`flag-icon-${group.build_group.flag || 'default'}`"
                      :title="group.build_group.country"></span>
                <span v-if="group.build_group.city" class="text-gray mr-1">{{ group.build_group.city }}</span>
                <span v-if="group.build_group.office">{{ group.build_group.office }}</span>
              </span>
                <custom-select v-else
                               v-model="chosenGroupId"
                               :options="filteredOffices"
                               class="workshift_details-body-top-office -groups"
                               id="shift-office-select"
                               value-field="id"
                               title-field="title"
                               defaultText="Офис"
                               :disabled="!(changedWorkshift.model && changedWorkshift.model.id)"
                               removeOldValue
                               @change="getPeriods"
                >
                  <template v-slot:chosen-variant="value">
                    <span v-if="!value.value">Офис</span>
                    <template v-else-if="group.build_group">
                     <span class="flag-icon mr-1" :class="`flag-icon-${group.build_group.flag || 'default'}`"
                           :title="group.build_group.country"></span>
                      <span v-if="group.build_group.city" class="text-gray mr-1">{{ group.build_group.city }}</span>
                      <span>{{ value.shownText }}</span>
                    </template>
                    <template v-else>
                     <span class="flag-icon mr-1" :class="`flag-icon-${value.value.flag || 'default'}`"
                           :title="value.value.country"></span>
                      <span v-if="value.value.city" class="text-gray mr-1">{{ value.value.city }}</span>
                      <span>{{ value.value.office }}</span>
                    </template>
                  </template>
                  <template v-slot:list-variant="variant">
                    <div class="d-flex align-items-center position-relative">
                      <div class="groups-nav-list-group-container-color"
                           :style="`background-color: ${variant.variant.color || 'red'}`"></div>
                      <span class="groups-nav-list-group-container-title">{{ variant.variant.title || variant.variant.office }}</span>
                      <div
                          v-if="variant.variant.id === (changedWorkshift.model && changedWorkshift.model.main_group && changedWorkshift.model.main_group.id)"
                          class="groups-nav-list-group-container-main">Основная
                      </div>
                    </div>
                  </template>
                </custom-select>
              </div>
            </div>
            <!--                    <b-button variant="outline-primary" size="sm" :disabled="!(changedWorkshift.model && changedWorkshift.model.id)" @click="openSchedule">Расписание на неделю</b-button>-->
            <template v-if="changedWorkshift.id && !operatorSchedule">
              <h4 class="workshift_details-body-toggle" v-b-toggle.model-schedule>
                Расписание на неделю
                <i class="fa fa-angle-down workshift_details-body-toggle-arrow"
                   :class="{'-active': scheduleCollapseStatus}"/>
              </h4>
              <b-collapse v-model="scheduleCollapseStatus" class="model_mini_profile-schedule" id="model-schedule">
                <div v-if="changedWorkshift.model.is_resign" class="model_schedule-body-error m-0">
                  Невозможно сформировать расписание, модель уволена
                </div>
                <div v-else-if="isScheduleEditable" class="model_mini_profile-schedule-edit" @click="openSchedule">
                  <span>Изменить</span>
                  <pen/>
                </div>
                <div class="model_mini_profile-schedule-dates">
                  <b><i class="fa fa-angle-left model_mini_profile-schedule-dates-button" @click="subtractDate"/>
                    {{ currentDatesText }} <i class="fa fa-angle-right model_mini_profile-schedule-dates-button" @click="addDate"/></b>
                </div>
                <div class="model_mini_profile-schedule-week">
                  <div v-for="day in activeWeekArray" class="model_mini_profile-schedule-week-day_container">
                    <div class="model_mini_profile-schedule-week-day_container-day"
                         :class="{'-active': (formattedWorkshifts[day.dateString] && formattedWorkshifts[day.dateString].length)}"
                         :id="formattedWorkshifts[day.dateString] ? `day-workshifts-${day.dateString}` : ''"
                    >
                      <p class="model_mini_profile-schedule-week-day_container-day-number">{{ day.date }}</p>
                      <p class="model_mini_profile-schedule-week-day_container-day-title">{{ day.day }}</p>
                    </div>
                    <div v-if="formattedWorkshifts[day.dateString]"
                         class="model_mini_profile-schedule-week-day_container-periods">
                      <div v-for="workshift in formattedWorkshifts[day.dateString]"
                           class="model_mini_profile-schedule-week-day_container-periods-period"
                      >
                        <i class="color_icon -sm -shift model_mini_profile-schedule-week-day_container-periods-period-icon"
                           :class="`-${workshift.status}`"
                        />
                        <span>{{ workshift.period }}</span>
                      </div>
                    </div>
                    <template v-if="formattedWorkshifts[day.dateString]">
                      <tooltip-info-workshifts :target="`day-workshifts-${day.dateString}`"
                                               :workshifts="formattedWorkshifts[day.dateString]"
                                               @openMiniProfile="openMiniProfile"
                      />
                    </template>
                  </div>
                </div>
              </b-collapse>
            </template>
          </div>
          <div class="workshift_details-body-main">
            <h4 v-if="changedWorkshift.id" class="workshift_details-body-toggle" v-b-toggle.model-details>
              О смене
              <i class="fa fa-angle-down workshift_details-body-toggle-arrow"
                 :class="{'-active': detailsCollapseStatus}"/>
            </h4>
            <b-collapse v-model="detailsCollapseStatus" id="model-details">
              <div v-if="editingShift" class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Статус</b>
                </div>
                <div class="col-7">
                  <custom-select v-model="changedWorkshift.status"
                                 :options="shiftStatusesForEdit"
                                 id="shift-status-select"
                  />
                </div>
              </div>
              <div class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Дата смены</b>
                </div>
                <div class="col-7 workshift_details-body-main-row-date">
                  <span class="glyphicon glyphicon-glyph-calendar"></span>
                  <!--                            <span>{{ shownDate }}</span>-->
                  <date-picker v-model="date"
                               :clearable="false"
                               input-class="input-plain workshift_details-body-main-row-date-input"
                               placeholder="Выберите дату"
                               lang="ru"
                               id="shift-date-input"
                               :format="dateInputFormat"
                               :disabled="(changedWorkshift.id && (changedWorkshift.status !== 'assigned') && !editingShift) || !userPermissions.schedule.edit"
                               @change="changeDate"
                  >
                    <i slot="calendar-icon"/>
                  </date-picker>
                </div>
              </div>
              <div class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Период смены</b>
                </div>
                <div class="col-7 workshift_details-body-main-row-date">
                  <custom-select v-model="changedWorkshift.work_shift"
                                 :options="currentPeriods"
                                 id="shift-period-select"
                                 defaultText="Выберите период"
                                 return-whole-object
                                 :disabled="changedWorkshift.id && ((changedWorkshift.status !== 'created') && (changedWorkshift.status !== 'assigned'))"
                                 @change="changePeriod"
                  >
                    <template v-slot:chosen-variant="props">
                      <span v-if="props.value">c {{ props.value.from }} по {{ props.value.to }}</span>
                      <span v-else>Выберите период</span>
                    </template>
                    <template v-slot:list-variant="props">
                      <span v-if="props.variant">c {{ props.variant.from }} по {{ props.variant.to }}</span>
                      <span v-else>Выберите период</span>
                    </template>
                  </custom-select>
                </div>
              </div>
              <div class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Время смены</b>
                </div>
                <div class="col-7 workshift_details-body-main-row-time">
                  <div class="workshift_details-body-main-row-time-block">
                  <span>С
                    <time-input v-model="planned_start_at"
                                class="-editable"
                                :class="inputsStatuses.planned_start_at ? '' : '-error'"
                                id="shift-planned_start_at-input"
                                :disabled="(changedWorkshift.id && (changedWorkshift.status !== 'assigned') && !editingShift) || !userPermissions.schedule.edit"
                                @input="changeTime('planned_start_at', $event)"
                    />
                  </span>
                    <span class="glyphicon glyphicon-time"></span>
                  </div>
                  <div class="workshift_details-body-main-row-time-block">
                  <span>По
                    <time-input v-model="planned_end_at"
                                class="-editable"
                                :class="inputsStatuses.planned_end_at ? '' : '-error'"
                                id="shift-planned_end_at-input"
                                :disabled="(changedWorkshift.id && (changedWorkshift.status !== 'assigned') && !editingShift) || !userPermissions.schedule.edit"
                                @input="changeTime('planned_end_at', $event)"
                    />
                  </span>
                    <span class="glyphicon glyphicon-time"></span>
                  </div>
                </div>
              </div>
              <div v-if="(changedWorkshift.status !== 'created') && (changedWorkshift.status !== 'assigned') && changedWorkshift.id && !operatorSchedule"
                   class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Фактическое время смены</b>
                </div>
                <div class="col-7 workshift_details-body-main-row-time">
                  <div class="workshift_details-body-main-row-time-block">
                  <span>С
                    <time-input v-model="start_at"
                                class="-editable"
                                :class="inputsStatuses.start_at ? '' : '-error'"
                                id="shift-start_at-input"
                                :disabled="(((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'canceled')) && !editingShift) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.start.date.edit)"
                                @input="changeTime('start_at', $event)"
                    />
                  </span>
                    <span class="glyphicon glyphicon-time"></span>
                  </div>
                  <div class="workshift_details-body-main-row-time-block">
                  <span>По
                    <time-input v-model="end_at"
                                class="-editable"
                                :class="inputsStatuses.end_at ? '' : '-error'"
                                id="shift-end_at-input"
                                :disabled="(((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'canceled')) && !editingShift) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.end.date.edit)"
                                @input="changeTime('end_at', $event)"
                    />
                  </span>
                    <span class="glyphicon glyphicon-time"></span>
                  </div>
                </div>
              </div>
              <div v-if="(changedWorkshift.status !== 'created') && (changedWorkshift.status !== 'assigned') && changedWorkshift.id"
                   class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Перерыв</b>
                </div>
                <div class="col-7 workshift_details-body-main-row-break">
                  <div v-for="(breakObject, key) in changedWorkshift.break"
                       class="workshift_details-body-main-row-time"
                       :key="key"
                  >
                    <div class="workshift_details-body-main-row-time-block">
                    <span>С
                      <time-input v-model="breakObject.from"
                                  class="-editable"
                                  :id="`shift-break-period-${key}-from-input`"
                                  :disabled="((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'canceled') && !editingShift) || !(userPermissions.schedule.edit || userPermissions.schedule.break.edit)"
                                  @input="editBreak(breakObject)"
                      />
                    </span>
                      <span class="glyphicon glyphicon-time"></span>
                    </div>
                    <div class="workshift_details-body-main-row-time-block">
                    <span>По
                      <time-input v-model="breakObject.to"
                                  class="-editable"
                                  :id="`shift-break-period-${key}-to-input`"
                                  :disabled="((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'canceled') && !editingShift) || !(userPermissions.schedule.edit || userPermissions.schedule.break.edit)"
                                  @input="editBreak(breakObject)"
                      />
                    </span>
                      <span class="glyphicon glyphicon-time"></span>
                    </div>
                    <div v-if="((changedWorkshift.status !== 'completed') && (changedWorkshift.status !== 'canceled') || editingShift) && (userPermissions.schedule.edit || userPermissions.schedule.break.edit)"
                         :id="`shift-break-period-${key}-remove-button`"
                         class="btn-remove" @click="removeBreak(key)"
                    ></div>
                  </div>
                  <div v-if="((changedWorkshift.status !== 'completed') && (changedWorkshift.status !== 'canceled') || editingShift) && (userPermissions.schedule.edit || userPermissions.schedule.break.edit)"
                       id="shift-break-add-period-button"
                       class="workshift_details-body-main-row-break-add"
                       @click="addBreak"
                  >
                    <span>Добавить перерыв</span>
                    <div class="btn-add"></div>
                  </div>
                </div>
              </div>
              <div class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Оператор</b>
                </div>
                <div class="col-7">
                  <custom-select v-model="changedWorkshift.operator"
                                 :options="filteredOperators"
                                 class="-no_arrow response-task-parameters-title-executor-settings"
                                 id="shift-operator-select"
                                 value-field="id"
                                 title-field="surname"
                                 default-text="Выберите оператора"
                                 :default-value="null"
                                 return-whole-object
                                 clearable
                                 searchableRequest
                                 infinityScroll
                                 :disabled="((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'created') || (changedWorkshift.status === 'canceled') && !editingShift) || !operatorEditPermission || (group.type !== 'office' && !chosenGroupId) || !changedWorkshift.model.id"
                                 :variantSubheaderRule="operatorsSubheaderRule"
                                 keepSearchString
                                 @change="changeOperator"
                                 @getNextPage="getOperatorsNextPage"
                                 @searchList="searchOperatorList"
                  >
                    <template v-slot:chosen-variant="props">
                      <div class="response-task-parameters-title-executor-settings-selected">
                        <template v-if="changedWorkshift.operator && (changedWorkshift.operator.uid || changedWorkshift.operator.fullname)">
                          <div class="d-flex align-items-center">
                            <template v-if="changedWorkshift.operator.fullname || changedWorkshift.operator.uid">
                              <b>{{ changedWorkshift.operator.fullname || changedWorkshift.operator.uid }}</b>
                            </template>
                            <user-resign-icon v-if="changedWorkshift.operator.resign_date" :offset="40" :user="changedWorkshift.operator" id="resign_info-operator" />
                            <div v-else-if="changedWorkshift.operator.blocked" class="glyphicon-blocked flex-shrink-0" v-b-tooltip.hover
                                 title="Сотрудник заблокирован"></div>
                          </div>
                          <div v-if="!operatorSchedule" class="response-task-parameters-title-executor-settings-selected-group">
                            <template v-if="changedWorkshift.operator.group">
                              <span v-if="changedWorkshift.operator.group.office">{{ changedWorkshift.operator.group.office }}</span>
                              <span v-else-if="changedWorkshift.operator.group.city">{{ changedWorkshift.operator.group.city }}</span>
                            </template>
                            <template v-else>Не состоит в группе</template>
                          </div>
                        </template>
                        <template v-else class="d-flex align-items-start">{{ props.shownText }}</template>
                      </div>
                    </template>
                    <template v-slot:list-variant="props">
                      <div>
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
                          <template v-if="props.variant.group">
                          <span class="flag-icon mr-1" :class="`flag-icon-${props.variant.group.flag || 'default'}`"
                                :title="props.variant.group.country"></span>
                            <span v-if="props.variant.group.city" class="text-gray mr-1">{{
                                props.variant.group.city
                              }}</span>
                            <span v-if="props.variant.group.office">{{ props.variant.group.office }}</span>
                          </template>
                          <template v-else>Не состоит в группе</template>
                        </div>
                        <div>
                          <div v-for="absence in props.variant.checkedAbsences" class="response-task-parameters-title-executor-settings-setting-item-absence d-flex">
                            <b class="text-gray mr-1"><absence/> {{ absence }}</b>
                          </div>
                        </div>
                      </div>
                    </template>
                  </custom-select>
                </div>
              </div>
              <div class="workshift_details-body-main-row row">
                <div class="col-5">
                  <b>Комнаты</b>
                </div>
                <div class="col-7">
                  <custom-select v-if="chosenGroup && chosenGroup.rooms"
                                 v-model="changedWorkshift.room"
                                 :options="chosenGroup.rooms"
                                 defaultText="Выберите комнату"
                                 valueField="id"
                                 id="shift-room-select"
                                 :disabled="((changedWorkshift.status === 'completed') || (changedWorkshift.status === 'canceled') && !editingShift) || !userPermissions.schedule.edit || (group.type !== 'office' && !chosenGroupId)"
                                 removeOldValue
                                 @change="editWorkshift"
                  />
                  <span v-else>{{ workshift.room && workshift.room.title }}</span>
                </div>
              </div>
            </b-collapse>
          </div>
          <template v-if="changedWorkshift.id">
            <div v-if="credentials" class="workshift_details-body-main">
              <h4 class="workshift_details-body-toggle" v-b-toggle.model-services>
                <span>Сервисы</span>
                <copy class="workshift_details-body-toggle-copy" v-b-tooltip.hover title="Скопировать данные всех аккаунтов" @click.stop="copyAllCredentials" />
                <i class="fa fa-angle-down workshift_details-body-toggle-arrow"
                   :class="{'-active': servicesCollapseStatus}"/>
              </h4>
              <b-collapse v-model="servicesCollapseStatus" id="model-services" class="workshift_details-body-main-services">
                <div v-for="account in credentials" class="workshift_details-body-main-services-service">
                  <div class="workshift_details-body-main-services-service-block -login">
                    <div class="avatar -sm -alt mr-2"
                         :style="account.resource.logotype ? `background-image: url(${account.resource.logotype}); background-size: cover;` : ''"
                         v-b-tooltip.hover
                         :title="account.resource.title"
                    />
                    <span>{{ account.login }}</span>
                  </div>
                  <div class="workshift_details-body-main-services-service-block -password">
                    <password-field :value="account.password" disabled/>
                  </div>
                  <div class="workshift_details-body-main-services-service-block -copy">
                    <copy class="workshift_details-body-main-services-service-block-copy" v-b-tooltip.hover title="Скопировать данные" @click="copySingleAccount(account)" />
                  </div>
                </div>
              </b-collapse>
            </div>
            <div v-if="changedWorkshift.comments && changedWorkshift.comments.length">
              <h4 class="workshift_details-body-toggle" v-b-toggle.model-comments>
                История событий
                <i class="fa fa-angle-down workshift_details-body-toggle-arrow"
                   :class="{'-active': commentsCollapseStatus}"/>
              </h4>
              <b-collapse v-model="commentsCollapseStatus" id="model-comments" class="workshift_details-body-main-comments">
                <div v-for="comment in changedWorkshift.comments" class="workshift_details-body-main-comments-comment">
                  <avatar class="mr-2"
                          size="-md"
                          :url="comment.user.avatar"
                          :telegram="comment.user.telegram_connected"
                          :is-fin-admin="comment.user.is_fin_admin"
                  />
                  <div class="response-comment-main">
                    <p class="m-0">
                      <b>{{ comment.user.fullname }}</b>
                      <span v-if="comment.system_message" class="text-gray">{{ comment.system_message.message }}</span>
                    </p>
                    <p class="response-comment-main-description">{{ comment.message }}</p>
                    <p class="response-comment-main-time">{{ formatDateTime(comment.created_at) }}</p>
                  </div>
                </div>
              </b-collapse>
            </div>
          </template>
        </div>
      </div>
      <div v-if="changedWorkshift.id && (userPermissions.comment.create || userPermissions.schedule.edit)" class="workshift_details-body-bottom" ref="commentsBlock">
        <b-form class="workshift_details-body-bottom-add" @submit="addComment">
          <b-input-group>
            <b-form-input v-model="comment" placeholder="Комментарий" required/>
            <b-input-group-append>
              <b-button variant="primary" type="submit">Отправить</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form>
      </div>
      <b-modal id="edit_shift_modal"
               centered
               title="Изменить данные смены?"
               body-bg-variant="white"
               ok-title="Изменить"
               ok-variant="primary"
               cancel-title="Отменить"
               cancel-variant="outline-primary"
               @ok="editWorkshift(true)"
      >Все прошлые данные будут заменены на новые</b-modal>
      <b-modal id="delete_shift_modal"
               centered
               title="Удалить смену?"
               body-bg-variant="white"
               ok-title="Удалить"
               ok-variant="danger"
               cancel-title="Отменить"
               cancel-variant="outline-primary"
               @ok="deleteShift"
      >Смена будет удалена навсегда и восстановить её будет невозможно</b-modal>
    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import vSelect from 'vue-select';
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";
import pen from "@/assets/vue-svg/pen.svg";
import PasswordField from "@/components/Common/PasswordField/PasswordField";
import Avatar from "@/components/Common/Avatar/Avatar";
import TooltipInfoWorkshifts from "@/pages/Workshifts/components/TooltipInfoWorkshifts";
import TimeInput from "@/pages/Workshifts/components/TimeInput";
import UserResignIcon from "@/components/Common/UserResignIcon";
import ShiftReportDetails from "@/pages/Workshifts/components/ShiftReportDetails";
import absence from "@/assets/vue-svg/absence.svg";
import copy from "@/assets/vue-svg/copy-transparent.svg";
import at from "@/assets/vue-svg/at.svg";
import moment from 'moment';
import {clipboard, getPeriodsData} from "@/tools/tools";

moment.locale('ru');

export default {
  name: 'workshift-details',
  props: {
    workshift: {
      type: Object,
      default() {
        return {};
      }
    },
    group: {
      type: Object,
      default() {
        return {};
      },
    },
    shiftDate: String,
    endPeriodThreshold: Object,
    excessTime: {
      type: Number,
      default: 0
    },
    operatorSchedule: {
      type: Boolean,
      default: false
    },
    periods: {
      type: Array,
      default: () => [],
    },
    allGroups: Boolean,
  },
  components: {
    TimeInput,
    'tooltip-info-workshifts': TooltipInfoWorkshifts,
    'v-select': vSelect,
    'date-picker': DatePicker,
    'custom-select': Select,
    'absence': absence,
    'avatar': Avatar,
    PasswordField,
    UserResignIcon,
    ShiftReportDetails,
    'pen': pen,
    'copy': copy,
    'at': at,
  },
  data() {
    return {
      changedWorkshift: {},
      statusTitles: {
        created: 'Резерв',
        assigned: 'Смена назначена',
        canceled: 'Смена отменена',
        process: 'Смена в процессе',
        completed: 'Завершена'
      },
      start_at: '',
      end_at: '',
      planned_start_at: '',
      planned_end_at: '',
      date: null,
      // resources: [],
      comment: '',
      reportComment: '',
      commentsBlockHeight: 0,
      cancelBlockStatus: false,
      cancellationReason: null,
      preventEdit: true,
      inputsStatuses: {
        start_at: true,
        end_at: true,
        planned_start_at: true,
        planned_end_at: true
      },
      dateInputFormat: {
        stringify: (date) => {
          return date ? moment(date).format('dddd, DD.MM.YYYY') : '';
        },
        parse: (value) => {
          return value ? moment(value, 'dddd, DD.MM.YYYY').toDate() : null;
        },
      },
      oldStatus: '',
      needsDateOffset: false,
      activeDate: this.shiftDate,
      chosenGroupId: null,
      firstActiveDate: null,
      scheduleCollapseStatus: false,
      detailsCollapseStatus: true,
      servicesCollapseStatus: false,
      commentsCollapseStatus: false,
      editingShift: false,
      shiftStatusesForEdit: [
        {
          value: 'assigned',
          title: 'Назначена',
        },
        {
          value: 'completed',
          title: 'Завершена',
        },
        {
          value: 'canceled',
          title: 'Отменена',
        },
      ],
      errorModelWithAbsence: false,
      errorOperatorWithAbsence: false,
      searchSurnameModels: '',
      pairModelOperator: '',
      droverType: '',
      reportParameterGroups: [],
    }
  },
  computed: {
    models() {
      return this.$store.state.schedule.models;
    },
    modelsHeaders() {
      return this.$store.state.schedule.modelsHeaders;
    },
    operators() {
      return this.$store.state.schedule.operators;
    },
    operatorsHeaders() {
      return this.$store.state.schedule.operatorsHeaders;
    },
    newComment() {
      return this.$store.state.comments.comment;
    },
    commentsStatus() {
      return this.$store.state.comments.commentStatus;
    },
    deletingStatus() {
      return this.$store.state.schedule.deleteStatus;
    },
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    operatorsStatus() {
      return this.$store.state.schedule.operatorsStatus;
    },
    updatedWorkshift() {
      return this.$store.state.schedule.updatedWorkshift;
    },
    cancellationReasons() {
      return this.$store.state.dictionaries.cancellationReasons;
    },
    officesModels() {
      return this.$store.state.dictionaries.officesModels;
    },
    shownDate() {
      if (!(this.changedWorkshift && this.changedWorkshift.planned_start_at)) return '';
      return moment(this.changedWorkshift.planned_start_at).format('dddd, DD.MM.YYYY');
    },
    report() {
      return this.$store.state.schedule.report;
    },
    credentials() {
      if (this.workshift?.model?.id) return this.$store.getters["profile/profile"](this.workshift.model.id)?.credentials;
    },
    filteredModels() {
      return this.models.map(user => {
        if (!user?.id || !user?.absences) return user
        user.checkedAbsences = this.isDayAbsence(moment(this.date).format('YYYY-MM-DD'), user.absences)
        user.disabled = !!user.checkedAbsences
        return user
      });
    },
    currentWorkshift() {
      return this.$store.state.schedule.currentWorkshift;
    },
    currentWeekWorkshifts() {
      return this.$store.state.schedule.currentWeekWorkshifts.workshifts;
    },
    absenceTypes() {
      return this.$store.state.dictionaries.absenceTypes;
    },
    newWorkshift() {
      return this.$store.state.schedule.newWorkshift;
    },
    credentialsRights() {
      return this.userPermissions.model_credential.request.access;
    },
    formattedWorkshifts() {
      if (!this.currentWeekWorkshifts) return {};
      let formattedWorkshifts = {};
      for (let date in this.currentWeekWorkshifts) {
        formattedWorkshifts[date] = [];
        for (let period in this.currentWeekWorkshifts[date]) {
          for (let room in this.currentWeekWorkshifts[date][period]) {
            this.currentWeekWorkshifts[date][period][room].workshifts.map(shift => {
              let workshiftInfo = {...shift}
              workshiftInfo.period = `${shift.start_at || shift.planned_start_at}-${shift.end_at || shift.planned_end_at}`;
              if (shift.start_at && shift.end_at) workshiftInfo.time = `${shift.start_at} - ${shift.end_at}`;
              else if (shift.planned_start_at && shift.planned_end_at) workshiftInfo.time = `${shift.planned_start_at} - ${shift.planned_end_at}`;
              workshiftInfo.partner = shift.operator ? {...shift.operator, userType: 'operator'} : {};
              workshiftInfo.partner.office = {id: this.group.id};
              formattedWorkshifts[date].push(workshiftInfo)
            })
          }
        }
      }
      return formattedWorkshifts;
    },
    currentDatesText() {
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-1);
      let text = date.format('DD.MM.YYYY');
      date.add(6, 'd');
      return `${text} - ${date.format('DD.MM.YYYY')}`;
    },
    activeWeekArray() {
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-2);
      else date.weekday(5);
      return [0, 1, 2, 3, 4, 5, 6].map(() => {
        date.add(1, 'd');
        return {
          day: date.format('dd'),
          date: date.format('DD'),
          dateString: date.format('YYYY-MM-DD')
        }
      })
    },
    chosenGroup() {
      if (!this.chosenGroupId || (!this.group.children && !this.allGroups)) return this.group;
      if (this.allGroups) return this.officesModels.find(office => office.id === this.chosenGroupId) || {};
      return this.group.children.find(child => child.id === this.chosenGroupId) || {};
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    isScheduleEditable() {
      return this.userPermissions.schedule.edit && (moment(this.activeDate) > this.firstActiveDate);
    },
    filteredOperators() {
      const currentOperator = this.currentWorkshift?.operator;
      const modifiedOperators = [...this.operators];
      if (currentOperator && !modifiedOperators.some(operator => operator.id === currentOperator.id)) {
        modifiedOperators.unshift(currentOperator);
      }
      return modifiedOperators.map(user => {
        if (!user.id || !user.absences) return user
        const checkedAbsences = this.isDayAbsence(moment(this.date).format('YYYY-MM-DD'), user.absences)
        return {
          ...user,
          checkedAbsences,
          disabled: !!checkedAbsences,
        }
      })
    },
    currentWorkweek() {
      return this.date ? moment(this.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    },
    showDeleteButton() {
      return ((this.workshift.status === 'created') || (this.workshift.status === 'canceled') || (this.workshift.status === 'assigned'))
          && this.userPermissions.schedule.edit
          && (moment(this.workshift.planned_end_at_date) > moment());
    },
    storePeriods() {
      return this.$store.state.schedule.periods;
    },
    currentPeriods() {
      return this.allGroups ? this.storePeriods : this.periods;
    },
    endPeriodData() {
      return getPeriodsData(this.currentPeriods);
    },
    filteredOffices() {
      return this.changedWorkshift?.model?.offices?.filter(office => !office.is_deactived) || [];
    },
    operatorEditPermission() {
      return this.userPermissions.schedule.edit ||
          this.userPermissions.schedule.operator.workshifts.yours ||
          this.userPermissions.schedule.operator.workshifts.all;
    },
  },
  watch: {
    commentsStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'commenting') && (newStatus === '')) {
        let comments = [...this.changedWorkshift.comments];
        comments.push(this.newComment);
        Vue.set(this.changedWorkshift, 'comments', comments);
        this.comment = '';
        this.$nextTick(this.measureCommentsBlock);
      }
    },
    deletingStatus: function (newStatus, prevStatus) {
      if ((prevStatus === 'deleting') && (newStatus === '')) {
        this.$toasted.success(`Смена удалена`, {
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
        this.closeDrover();
      } else if ((prevStatus === 'deleting') && (newStatus === 'deleting-error')) {
        this.$toasted.error(this.$store.state.schedule.errorMessage, {
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
      }
    },
    newWorkshift: function (shift) {
      this.closeDrover();
    },
    scheduleStatus: function (newStatus, prevStatus) {
      if (((prevStatus === 'editing') || (prevStatus === 'canceling')) && (newStatus === '')) {
        if (prevStatus === 'canceling') {
          this.cancelBlockStatus = false;
          this.$toasted.success(`Статус смены изменен на "Отменена"`, {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: [
              {
                text: 'Отменить',
                class: '-success',
                onClick: this.cancelCancellation
              },
              {
                text: '',
                class: 'btn-close',
                onClick: this.closeToast
              }
            ]
          });
        }
        this.preventEdit = true;
        this.updateChangedWorkshift(this.updatedWorkshift);
        setTimeout(() => {
          this.preventEdit = false;
        }, 1000);
      } else if ((prevStatus === 'creating-report') && (newStatus === '')) {
        this.closeNestedDrover();
        this.updateWorkshift();
        this.$toasted.success(`Отчет создан`, {
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
      }
    },
    report: function (newReport) {
      Vue.set(this.changedWorkshift, 'report', newReport);
    },
    workshift: function (newShift, oldShift) {
      this.chosenGroupId = null;
      this.editingShift = false;
      if (!oldShift.id) {
        this.activeDate = newShift.period_date;
        this.updateChangedWorkshift(newShift);
        this.updateSchedule(newShift);
        this.updateWorkshift(newShift);
        this.fetchCredentialModel(newShift.model.id);
      } else if (newShift.status !== oldShift.status) {
        Vue.set(this.changedWorkshift, 'status', newShift.status);
      }
    },
    currentWorkshift: function (newShift) {
      this.updateChangedWorkshift(newShift);
    },
    chosenGroupId: function () {
      this.changedWorkshift.room = null;
    },
    filteredModels: function (newModels) {
      if (!newModels?.length) this.getModelsNextPage();
    },
  },
  created() {
    if (this.allGroups) this.$store.dispatch('dictionaries/fetchOfficesModels');
    let firstActiveDate = moment();
    if (firstActiveDate.weekday() !== 6) firstActiveDate.weekday(-2);
    else firstActiveDate.subtract(1, 'day');
    this.firstActiveDate = firstActiveDate;
    this.updateChangedWorkshift(this.workshift);
    if (this.workshift.id) {
      this.updateWorkshift();
      this.updateSchedule();
      if (this.credentialsRights)
        this.fetchCredentialModel();
      this.getOperators(this.workshift.model.id);
    } else this.getModels();
  },
  mounted() {
    this.measureCommentsBlock();
    setTimeout(() => {
      this.preventEdit = false;
    }, 1000);
  },
  methods: {
    getModels() {
      this.$store.dispatch('schedule/fetchModels', {
        group: this.group.id,
        'workweek': this.currentWorkweek,
        surname: this.searchSurnameModels,
        per_page: 20,
        is_active: true,
      });
    },
    getModelsNextPage() {
      if ((this.modelsHeaders.currentPage >= this.modelsHeaders.totalPages) || (this.scheduleStatus === 'model-request')) return;
      this.$store.dispatch('schedule/fetchModelsNextPage', {
        group: this.group.id,
        'workweek': this.currentWorkweek,
        surname: this.searchSurnameModels,
        per_page: 20,
        page: this.modelsHeaders.currentPage + 1,
        is_active: true,
      });
    },
    searchModelList(search) {
      this.searchSurnameModels = search;
      this.getModels();
    },
    getOperators(pairModel) {
      this.pairModelOperator = pairModel;
      this.$store.dispatch('schedule/fetchOperators', {model: pairModel, params: {['groups[]']: this.chosenGroupId || this.group.id, 'workweek': this.currentWorkweek, surname: this.searchSurnameOpertor, is_active: true, per_page: 20}});
    },
    getOperatorsNextPage() {
      if ((this.operatorsHeaders.currentPage >= this.operatorsHeaders.totalPages) || (this.operatorsStatus === 'operator-request')) return;
      this.$store.dispatch('schedule/fetchOperatorsNextPage', {model: this.pairModelOperator, params: {['groups[]']: this.chosenGroupId || this.group.id, 'workweek': this.currentWorkweek, surname: this.searchSurnameOpertor, is_active: true, per_page: 20, page: this.operatorsHeaders.currentPage + 1}});
    },
    searchOperatorList(search) {
      this.searchSurnameOpertor = search;
      this.getOperators(this.pairModelOperator);
    },
    openMiniProfile(user) {
      if (!this.changedWorkshift.id ||
          (user.userType && user.userType === 'operator' && !this.userPermissions.operator.profile.view) ||
          (!user.userType && !this.userPermissions.model.profile.view)) return;
      this.$emit('miniProfile', user);
    },
    updateChangedWorkshift(workshift) {
      if (this.workshift?.id  && (this.workshift.id !== workshift.id)) return;
      this.changedWorkshift = {...workshift, room: workshift.room ? workshift.room.id : null};
      this.start_at = workshift.start_at || '';
      this.end_at = workshift.end_at || '';
      this.planned_start_at = workshift.planned_start_at || '';
      this.planned_end_at = workshift.planned_end_at || '';
      // this.resources = workshift.resources ? workshift.resources.map(resource => resource.resource && resource.resource.id) : [];
      this.date = workshift.period_date ? new Date(workshift.period_date) : this.shiftDate ? new Date(this.shiftDate) : null;
    },
    operatorsAddress(operator) {
      return operator && ((operator.groups && operator.groups[0] && operator.groups[0].title) || operator.group) || 'Не состоит в группе';
    },
    inputTime(field) {
      this.inputsStatuses[field] = true;
    },
    changeTime(field, e) {
      this.inputTime(field);
      let timeString = e?.target?.value || this[field];
      if (timeString === '') {
        Vue.set(this.changedWorkshift, field, null);
        return this.editWorkshift();
      }
      this.setShiftTime(field);
    },
    setShiftTime(field) {
      Vue.set(this.changedWorkshift, field, this[field]);
      this.editWorkshift();
    },
    addBreak() {
      let breaks = [...this.changedWorkshift.break];
      breaks.push({from: '', to: ''});
      Vue.set(this.changedWorkshift, 'break', breaks);
    },
    removeBreak(key) {
      let breaks = [...this.changedWorkshift.break];
      breaks.splice(key, 1);
      Vue.set(this.changedWorkshift, 'break', breaks);
      this.editWorkshift();
    },
    formatDateTime(date) {
      return moment(date).format('DD.MM.YYYY, HH:mm');
    },
    addComment(e) {
      e.preventDefault();
      if (this.commentsStatus === 'commenting') return;
      this.$store.dispatch('comments/createWorkshiftkshiftComment', {id: this.changedWorkshift.id, text: this.comment});
    },
    measureCommentsBlock() {
      this.commentsBlockHeight = this.$refs.commentsBlock && this.$refs.commentsBlock.offsetHeight;
    },
    showCancelBlock() {
      this.cancelBlockStatus = true;
    },
    hideCancelBlock() {
      this.cancelBlockStatus = false;
    },
    cancelWorkshift() {
      if (this.scheduleStatus === 'canceling') return;
      this.oldStatus = this.changedWorkshift.status;
      this.$store.dispatch('schedule/cancelWorkshift', {
        ...this.getWorkshiftForApi(this.changedWorkshift),
        status: 'canceled',
        cancel: this.cancellationReason
      });
    },
    assignWorkshift() {
      if (this.scheduleStatus === 'editing') return;
      this.$store.dispatch('schedule/editWorkshift', {
        ...this.getWorkshiftForApi(this.changedWorkshift),
        status: 'assigned'
      });
    },
    changeOperator() {
      if (this.workshift.operator?.id === this.changedWorkshift.operator?.id) return;
      this.editWorkshift(false, 'Оператор');
    },
    editWorkshift(force = false) {
      this.errorOperatorWithAbsence = false;
      if (this.preventEdit || !this.inputsStatuses.start_at || !this.inputsStatuses.end_at || !this.inputsStatuses.planned_start_at || !this.inputsStatuses.planned_end_at || !this.changedWorkshift.id || (this.editingShift && !force)) return;
      this.$store.dispatch('schedule/editWorkshift', this.getWorkshiftForApi(this.changedWorkshift));
    },
    getWorkshiftForApi(workshift) {
      return {
        id: workshift.id,
        room: workshift.room,
        model: workshift.model.id,
        operator: workshift.operator && workshift.operator.id,
        group: this.chosenGroupId || workshift.group.id,
        planned_start_at: workshift.planned_start_at,
        planned_end_at: workshift.planned_end_at,
        start_at: (workshift.status === 'assigned') && (this.workshift.status !== 'assigned') ? null : workshift.start_at,
        end_at: (workshift.status === 'assigned') && (this.workshift.status !== 'assigned') ? null : workshift.end_at,
        break: workshift.break?.filter(breakObj => breakObj.from && breakObj.to),
        status: workshift.status,
        period_date: moment(this.date).format('YYYY-MM-DD'),
        work_shift: workshift.work_shift,
      }
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
    changeDate(time) {
      this.errorModelWithAbsence = false
      this.errorOperatorWithAbsence = false
      if (this.changedWorkshift.model?.id) {
        if (!this.changedWorkshift.model.absences) {
          this.$store.dispatch('profile/fetchAbsences', {
            user: this.changedWorkshift.model.id,
            'date[between]': moment(this.date).format('YYYY-MM-DD')
          }).then((data) => {
            if (data?.length) {
              this.errorModelWithAbsence = true
              this.showUserEditErrorMessage('Модель будет отсутствовать в выбранную дату, выберите другую модель или измените дату')
              return;
            }
          })
        }
        if (this.isDayAbsence(moment(time).format('YYYY-MM-DD'), this.changedWorkshift.model.absences)){
          this.errorModelWithAbsence = true
          this.showUserEditErrorMessage('Модель будет отсутствовать в выбранную дату, выберите другую модель или измените дату')
          return;
        }
      }
      if (this.changedWorkshift.operator?.id) {
        if (!this.changedWorkshift.operator.absences) this.changedWorkshift.operator.absences = this.operators.find(operator => this.changedWorkshift.operator.id === operator.id).absences
        if (this.isDayAbsence(moment(time).format('YYYY-MM-DD'), this.changedWorkshift.operator.absences)) {
          this.errorOperatorWithAbsence = true
          this.showUserEditErrorMessage('Оператор будет отсутствовать в выбранную дату, выберите другого оператора или измените дату')
          return;
        }
      }
      this.editWorkshift();
      this.$nextTick(() => {
        this.getModels();
        if (this.changedWorkshift.model?.id) this.getOperators(this.changedWorkshift.model.id);
      });
    },
    changePeriod() {
      this.editWorkshift();
    },
    createReport(e) {
      e.preventDefault();
      this.$store.dispatch('schedule/createReport', {comment: this.reportComment, workshift: this.changedWorkshift.id});
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    cancelCancellation() {
      this.$store.dispatch('schedule/editWorkshift', {
        ...this.getWorkshiftForApi(this.changedWorkshift),
        status: this.oldStatus,
        cancel: this.cancellationReason
      });
    },
    openSchedule() {
      this.$emit('openSchedule', this.changedWorkshift.model);
    },
    createShift() {
      if (this.errorModelWithAbsence) return this.showUserEditErrorMessage('Модель будет отсутствовать в выбранную дату, выберите другую модель или измените дату');
      if (!this.planned_start_at) this.inputsStatuses.planned_start_at = false;
      if (!this.planned_end_at) this.inputsStatuses.planned_end_at = false;
      if (!this.date || !this.changedWorkshift.model?.id || !this.planned_start_at || !this.planned_end_at || this.scheduleStatus === 'creating') return;
      const data = {
        planned_start_at: this.changedWorkshift.planned_start_at,
        planned_end_at: this.changedWorkshift.planned_end_at,
        model: this.changedWorkshift.model.id,
        group: this.chosenGroupId || this.group.id,
        period_date: moment(this.date).format('YYYY-MM-DD'),
      };
      if (this.changedWorkshift.operator?.id) data.operator = this.changedWorkshift.operator.id;
      if (this.changedWorkshift.room) data.room = this.changedWorkshift.room;
      if (this.changedWorkshift.work_shift) data.work_shift = this.changedWorkshift.work_shift;
      this.$store.dispatch('schedule/createWorkshift', data);
    },
    changeModel() {
      this.errorModelWithAbsence = false;
      if (!this.changedWorkshift.model) return;
      if (this.group.type === 'office') this.chosenGroupId = null;
      else {
        let mainOffice = this.changedWorkshift.model.offices.find(office => this.changedWorkshift.model?.main_group?.id === office.id);
        if (mainOffice) {
          this.chosenGroupId = mainOffice.id;
          this.getPeriods();
        }
      }
      this.getOperators(this.changedWorkshift.model.id);
    },
    updateSchedule(workshift = this.workshift) {
      this.$store.dispatch('schedule/fetchModelWorkShiftsWeek', {
        model: workshift.model.id,
        params: {
          group: workshift.group.id,
          workweek: this.activeDate,
          pagination: false
        }
      });
    },
    updateWorkshift(workshift = this.workshift) {
      this.$store.dispatch('schedule/fetchModelWorkShift', workshift.id);
    },
    fetchCredentialModel(modelId = this.workshift.model.id) {
      this.$store.dispatch('profile/fetchUserService', modelId);
    },
    addDate() {
      let date = moment(this.activeDate);
      date.add(7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      this.updateSchedule();
    },
    subtractDate() {
      let date = moment(this.activeDate);
      date.subtract(7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      this.updateSchedule();
    },
    editBreak(breakObj) {
      if (breakObj.from && breakObj.to) this.editWorkshift();
    },
    startShiftEdit() {
      this.editingShift = true;
    },
    checkNewStatus() {
      let today = new Date();
      today.setDate(today.getDate() - 1);
      if ((this.changedWorkshift.status === 'assigned') && (this.date < today)) return this.$toasted.error(`Чтобы установить статус “Назначена”, выберите дату в будущем`, {
        className: ['toasted-error'],
        action: {
          class: 'btn-close',
          onClick: this.closeToast
        }
      });
      today.setDate(today.getDate() + 2);
      if ((this.changedWorkshift.status === 'completed') && (this.date > today)) return this.$toasted.error(`Чтобы установить статус “Завершена”, выберите дату в прошлом`, {
        className: ['toasted-error'],
        action: {
          class: 'btn-close',
          onClick: this.closeToast
        }
      });
      this.$bvModal.show('edit_shift_modal');
    },
    isDayAbsence(day, absences) {
      if (!absences?.length) return false
      let absencesCurrentDay = absences.filter(absence => moment(day).isBetween(moment.parseZone(absence.start_at).format('YYYY-MM-DD'), moment.parseZone(absence.end_at).format('YYYY-MM-DD'), undefined, '[]'))
      return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {return ` ${this.absenceTypes[absence.type]} ${moment.parseZone(absence.start_at).format('DD.MM')} - ${moment.parseZone(absence.end_at).format('DD.MM')} `}) : null
    },
    showUserEditErrorMessage(error) {
      this.$toasted.error(error, {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 2500,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast
        }
      });
    },
    operatorsSubheaderRule(operatorKey) {
      if (operatorKey === 0) return this.filteredOperators[operatorKey].is_pair ? 'работали с моделью' : 'операторы';
      if (!this.filteredOperators[operatorKey].is_pair && this.filteredOperators[operatorKey - 1].is_pair) return 'операторы';
      return null;
    },
    deleteShift() {
      this.$store.dispatch('schedule/deleteWorkshift', this.workshift);
    },
    copyAllCredentials() {
      clipboard(this.credentials.reduce((result, account, key) => `${result}${key === 0 ? '' : '\n\n'}${account.resource.link}\n${account.login}\n${account.password}`, ''), this.copyCredentialsSuccess);
    },
    copySingleAccount(account) {
      clipboard(`${account.resource.link}\n${account.login}\n${account.password}`, this.copyCredentialsSuccess);
    },
    copyCredentialsSuccess() {
      this.$toasted.success('Данные скопированы', {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 2500,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast,
        }
      });
    },
    getPeriods() {
      if (!this.allGroups) return;
      this.$store.dispatch('schedule/fetchPeriodsForGroup', {group: this.chosenGroupId, workweek: moment(this.date || undefined).format('YYYY-MM-DD')});
      if (this.changedWorkshift.model?.id) this.getOperators(this.changedWorkshift.model.id);
    },
    showReportDrover() {
      this.droverType = 'report';
    },
    closeNestedDrover() {
      this.droverType = '';
    },
  }
}
</script>