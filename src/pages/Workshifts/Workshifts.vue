<template>
  <div class="workshifts">
    <h3 class="workshifts-header">{{ activeTabObject.titleShort || activeTabObject.title }}</h3>
    <template v-if="userPermissions.schedule.edit">
      <b-button v-if="activeTab === 'show'" class="workshifts-button" variant="outline-primary" @click="openShiftCreation()">Добавить смену</b-button>
      <b-button v-else-if="activeTab === 'free-models'" class="workshifts-button" variant="outline-primary" :disabled="isActiveFreeModelsDateOld">Отправить напоминание</b-button>
    </template>
    <div v-if="activeTab === 'operators-workshifts'" class="workshifts-button workshifts-button-group">
      <b-button v-if="userPermissions.setup.workshift.operator" class="workshifts-button-offset" variant="outline-primary" :disabled="hideActionsOperatorWorkshifts" @click="openAssignPairs()">Назначить пары</b-button>
<!--      <b-button class="workshifts-button-offset" variant="outline-primary" :disabled="hideActionsOperatorWorkshifts" @click="openAssignOperators()">Назначить операторов</b-button>-->
    </div>
    <div class="workshifts-tabs">
      <div v-for="tab in tabs"
           class="workshifts-tabs-tab"
           :class="tab.value === activeTab ? '-active' : ''"
           :key="tab.value"
           @click="setActiveTab(tab.value)"
      >
        {{ tab.title }}
      </div>
    </div>
    <div class="workshifts-show">
      <div class="workshifts-filters card">
        <group-picker v-if="activeTab !== 'operators-workshifts'" v-model="activeGroup" storageName="savedGroupWorkshifts"/>
        <group-picker v-else isOperatorsGroups v-model="activeGroupOperators" storageName="savedGroupOperators">
          <div v-if="activeTab === 'operators-workshifts'" class="workshifts-filters-main-params-switch">
            <span>Таблица расписания</span>
            <div class="custom-control custom-switch">
              <input v-model="showOperatorsSchedule" type="checkbox" class="custom-control-input" id="show-free-operators" :disabled="hideActionsOperatorWorkshifts" @change="changeFreeOperators">
              <label class="custom-control-label custom-control-label-stylization" for="show-free-operators"></label>
            </div>
          </div>
        </group-picker>
        <div v-if="activeTab === 'show'" class="workshifts-filters-main">
          <div class="workshifts-filters-main-params">
            <div class="workshifts-filters-main-types">
              <div class="workshifts-filters-main-date-format" :class="filters.reserved ? '-active' : ''" @click="toggleShowType('reserved')">Резерв</div>
              <div class="workshifts-filters-main-date-format" :class="filters.canceled ? '-active' : ''" @click="toggleShowType('canceled')">Отмененные</div>
              <div class="workshifts-filters-main-date-format" :class="filters.empty ? '-active' : ''" @click="toggleShowType('empty')">Пустые комнаты</div>
            </div>
            <custom-select v-model="filters.model"
                           class="-filter ml-4"
                           defaultText="Модель"
                           :options="modelsForFilter"
                           id="show-model"
                           valueField="id"
                           titleField="fullname"
                           infinityScroll
                           searchableRequest
                           @change="setCurrentWorkshiftsModel"
                           @getNextPage="getModelsNextPage"
                           @searchList="searchModels"
            >
              <template v-slot:chosen-variant="props">
                                <span v-if="props.value && (props.value.uid || props.value.surname)">
                                    <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname }}</template>
                                    <template v-else>
                                        <span class="text-gray mr-1">{{ props.value.uid }}</span>
                                        <span>{{ props.value.surname }}</span>
                                    </template>
                                </span>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <template v-slot:list-variant="props">
                <div class="d-flex align-items-center">
                  <div v-if="props.variant.id" class="avatar mr-2" :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>
                  <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.surname }}</span>
                  </template>
                </div>
              </template>
            </custom-select>
          </div>
          <div class="workshifts-filters-main-date">
            <div class="workshifts-filters-main-date-format" :class="dateFormat === 'day' ? '-active' : ''" @click="setDateFormat('day')">День</div>
            <div class="workshifts-filters-main-date-format" :class="dateFormat === 'week' ? '-active' : ''" @click="setDateFormat('week')">Неделя</div>
          </div>
          <div class="workshifts-filters-main-buttons">
            <span class="workshifts-filters-main-buttons-button" @click="setCurrentWorkshifts()">Применить фильтры</span>
            <span class="workshifts-filters-main-buttons-button" @click="clearFilters">Сбросить</span>
          </div>
        </div>
        <div v-if="activeTab === 'free-models'" class="workshifts-filters-main">
          <div class="workshifts-edit-main-datepicker mb-0">
            <div class="workshifts-edit-main-datepicker-prev" @click="subtractFreeModelsDate"><i class="fa fa-angle-left"></i></div>
            <div class="workshifts-edit-main-datepicker-current">
              <span class="workshifts-edit-main-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
              <h4 class="workshifts-edit-main-datepicker-current-text">{{ currentFreeModelsDatesText }}</h4>
            </div>
            <div class="workshifts-edit-main-datepicker-next" @click="addFreeModelsDate"><i class="fa fa-angle-right"></i></div>
          </div>
        </div>
        <div v-if="activeTab === 'past-workshifts'" class="workshifts-filters-main">
          <div class="workshifts-filters-main-params">
            <div class="workshifts-filters-main-types">
              <div class="workshifts-filters-main-date-format" :class="filtersPast.reserved ? '-active' : ''" @click="togglePastType('reserved')">Резерв</div>
              <div class="workshifts-filters-main-date-format" :class="filtersPast.canceled ? '-active' : ''" @click="togglePastType('canceled')">Отмененные</div>
              <div class="workshifts-filters-main-date-format" :class="filtersPast.completed ? '-active' : ''" @click="togglePastType('completed')">Завершенные</div>
            </div>
            <custom-select v-model="filtersPast.model"
                           class="-filter workshifts-filters-main-model"
                           defaultText="Модель"
                           id="past-model"
                           :options="modelsForFilter"
                           valueField="id"
                           titleField="fullname"
                           :disabled="!!loadPastWorkshifts.length"
                           infinityScroll
                           searchableRequest
                           @change="savePastFilter"
                           @getNextPage="getModelsNextPage"
                           @searchList="searchModels"
            >
              <template v-slot:chosen-variant="props">
                        <span v-if="props.value && (props.value.uid || props.value.surname)">
                            <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname }}</template>
                            <template v-else>
                                <span class="text-gray mr-1">{{ props.value.uid }}</span>
                                <span>{{ props.value.surname }}</span>
                            </template>
                        </span>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <template v-slot:list-variant="props">
                <div class="d-flex align-items-center">
                  <div v-if="props.variant.id" class="avatar mr-2" :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>
                  <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.surname }}</span>
                  </template>
                </div>
              </template>
            </custom-select>
            <custom-select v-model="filtersPast.operator"
                           class="-filter workshifts-filters-main-operator"
                           defaultText="Оператор"
                           :options="operatorsForFilter"
                           valueField="id"
                           searchable
                           titleField="surname"
                           @change="savePastFilter"
                           :disabled="!!loadPastWorkshifts.length"
            >
              <template v-slot:chosen-variant="props">
                        <span v-if="props.value && (props.value.uid || props.value.surname)">
                            <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname }}</template>
                            <template v-else>
                                <span class="text-gray mr-1">{{ props.value.uid }}</span>
                                <span>{{ props.value.surname }}</span>
                            </template>
                        </span>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <template v-slot:list-variant="props">
                <div class="d-flex align-items-center">
                  <div v-if="props.variant.id" class="avatar mr-2" :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>
                  <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.surname }}</span>
                  </template>
                </div>
              </template>
            </custom-select>
          </div>
          <div class="workshifts-filters-main-buttons">
            <span class="workshifts-filters-main-buttons-button">Применить фильтры</span>
            <span class="workshifts-filters-main-buttons-button" @click="clearPastFilters">Сбросить</span>
          </div>
        </div>
        <div v-if="activeTab === 'operators-workshifts' && showOperatorsSchedule" class="workshifts-filters-main">
          <div class="workshifts-filters-main-params">
            <!--                        <custom-select v-model="filtersOperatorsWorkshift.model"-->
            <!--                                       class="-filter workshifts-filters-main-model"-->
            <!--                                       defaultText="Модель"-->
            <!--                                       :options="modelsForFilter"-->
            <!--                                       valueField="id"-->
            <!--                                       titleField="fullname"-->
            <!--                                       infinityScroll-->
            <!--                                       @change="saveOperatorsWorkshiftFilter"-->
            <!--                                       @getNextPage="getModelsNextPage"-->
            <!--                        >-->
            <!--                            <template v-slot:chosen-variant="props">-->
            <!--                        <span v-if="props.value && (props.value.uid || props.value.surname)">-->
            <!--                            <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname }}</template>-->
            <!--                            <template v-else>-->
            <!--                                <span class="text-gray mr-1">{{ props.value.uid }}</span>-->
            <!--                                <span>{{ props.value.surname }}</span>-->
            <!--                            </template>-->
            <!--                        </span>-->
            <!--                                <span v-else>{{ props.shownText }}</span>-->
            <!--                            </template>-->
            <!--                            <template v-slot:list-variant="props">-->
            <!--                                <div class="d-flex align-items-center">-->
            <!--                                    <div v-if="props.variant.id" class="avatar mr-2" :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>-->
            <!--                                    <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>-->
            <!--                                    <template v-else>-->
            <!--                                        <span class="text-gray mr-1">{{ props.variant.uid }}</span>-->
            <!--                                        <span>{{ props.variant.surname }}</span>-->
            <!--                                    </template>-->
            <!--                                </div>-->
            <!--                            </template>-->
            <!--                        </custom-select>-->
            <custom-select v-model="filtersOperatorsWorkshift.operator"
                           class="-filter workshifts-filters-main-operator"
                           defaultText="Оператор"
                           :options="operatorsForOperatorsWorkshiftFilter"
                           valueField="id"
                           titleField="fullname"
                           infinityScroll
                           searchableRequest
                           :loading="operatorsLoading"
                           :disabled="!officesList.length || !showOperatorsSchedule"
                           @change="saveOperatorsWorkshiftFilter"
                           @getNextPage="getOperatorsNextPage"
                           @searchList="searchOperators"
            >
              <template v-slot:chosen-variant="props">
                        <span v-if="props.value && (props.value.uid || props.value.surname)">
                            <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname }}</template>
                            <template v-else>
                                <span class="text-gray mr-1">{{ props.value.uid }}</span>
                                <span>{{ props.value.surname }}</span>
                            </template>
                        </span>
                <span v-else>{{ props.shownText }}</span>
              </template>
              <template v-slot:list-variant="props">
                <div class="d-flex align-items-center">
                  <div v-if="props.variant.id" class="avatar mr-2" :style="props.variant.avatar ? `background-image: url(${props.variant.avatar}); background-size: cover;` : ''"></div>
                  <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>
                  <template v-else>
                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                    <span>{{ props.variant.surname }}</span>
                  </template>
                </div>
              </template>
            </custom-select>
          </div>
          <div class="workshifts-filters-main-buttons">
            <span class="workshifts-filters-main-buttons-button">Применить фильтры</span>
            <span class="workshifts-filters-main-buttons-button" @click="clearOperatorsWorkshiftFilters">Сбросить</span>
          </div>
        </div>
      </div>
      <div v-if="((activeGroup.type === 'office') || (activeGroup.type === 'city')) && activeGroup.settings && activeGroup.settings.work_shift" class="workshifts-edit-main">
        <div v-if="activeTab === 'show'">
          <div class="workshifts-edit-main-datepicker">
            <div class="workshifts-edit-main-datepicker-prev" @click="subtractDate"><i class="fa fa-angle-left"></i></div>
            <div class="workshifts-edit-main-datepicker-current">
              <span class="workshifts-edit-main-datepicker-current-icon glyphicon glyphicon-glyph-calendar"></span>
              <h4 class="workshifts-edit-main-datepicker-current-text">{{ currentDatesText }}</h4>
            </div>
            <div class="workshifts-edit-main-datepicker-next" @click="addDate"><i class="fa fa-angle-right"></i></div>
          </div>
          <div v-for="date in currentDatesArray" v-if="currentWorkshifts">
            <div v-if="(activeGroup.type === 'city') && (dateFormat === 'week')"
                 class="workshifts-collapse"
                 :class="{'-border_none': collapseStateDate[date]}"
                 @click="collapseBlock(`collapse-date-${date}`)">
              <h4 class="workshifts-edit-main-date-period-title-date">
                {{ formatDate(date) }}
                <i class="fa fa-angle-up workshifts-edit-main-date-period-title-date-arrow" :class="{'-active': !collapseStateDate[date]}"/>
              </h4>
            </div>
            <b-collapse v-model="collapseStateDate[date]" :id="`collapse-date-${date}`">
              <template v-for="office in officesList" v-if="currentWorkshifts[office.id] && currentWorkshifts[office.id][date]">
                <div v-if="(activeGroup.type === 'city') && (dateFormat === 'day')"
                     class="d-flex align-items-center position-relative workshifts-collapse"
                     :class="{'-border_none': collapseStateOffice[office.id]}"
                     @click="collapseBlock(`collapse-office-${office.id}`)">
                  <div class="groups-nav-list-group-container-color" :style="`background-color: ${office.color || 'red'}`"></div>
                  <h4 class="groups-nav-list-group-container-title">
                    {{ office.title }}
                    <i class="fa fa-angle-up workshifts-edit-main-date-period-title-date-arrow" :class="{'-active': !collapseStateOffice[office.id]}"/>
                  </h4>
                </div>
                <b-collapse v-model="collapseStateOffice[office.id]" :id="`collapse-office-${office.id}`">
                  <div class="workshifts-edit-main-date">
                    <div v-for="(workshiftsOfPeriod, periodString, index) in currentWorkshifts[office.id][date]" v-if="workshiftsOfPeriod" class="workshifts-edit-main-date-period">
                      <div v-if="dateFormat === 'day'" class="workshifts-edit-main-date-period-title">{{ periodString }}</div>
                      <div v-else-if="index === 0" class="workshifts-edit-main-date-period-title">
                        <div v-if="activeGroup.type === 'city'" class="d-flex align-items-center">
                          <div class="groups-nav-list-group-container-color" :style="`background-color: ${office.color || 'red'}`"></div>
                          <span class="text-nowrap">{{ office.title }}</span>
                        </div>
                        <span v-else class="workshifts-edit-main-date-period-title-date">{{ formatDate(date) }}</span>
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
                          <div v-else class="workshifts-edit-main-date-period-table-row-id" :class="{'-editable': userPermissions.schedule.edit}">
                            <span class="workshifts-edit-main-date-period-table-row-id-name">{{ workshiftsOfRoom.number }}</span>
                            <div class="btn-add workshifts-edit-main-date-period-table-row-id-btn" @click="openShiftCreation(date, periodString, roomId, office.id)"></div>
                          </div>
                          <draggable v-model="workshiftsOfRoom.workshifts"
                                     group="workshifts"
                                     :filter="userPermissions.schedule.edit ? '.-placeholder' : 'div'"
                                     :preventOnFilter="false"
                                     class="workshifts-edit-main-date-period-table-row-shifts"
                                     :forceFallback="true"
                                     @change="moveWorkshift(date, periodString, roomId, office.id, $event)"
                                     @start="startDrag(date, periodString, roomId, $event)"
                                     @end="endDrag"
                          >
                            <template v-if="(workshiftsOfRoom.workshifts.length > 1) && (roomId === 'reserve')" class="workshifts-edit-main-date-period-table-row-shifts">
                              <div class="workshifts-edit-main-date-period-table-row-shifts-shift" @click="clickRow(workshiftsOfRoom.workshifts[0], date)">
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -model" @click.stop="onClickModel(workshiftsOfRoom.workshifts[0], date)">
                                  <template v-if="workshiftsOfRoom.workshifts[0].model">
                                                                        <span class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text-name"
                                                                              v-b-tooltip.hover
                                                                              :title="`${ workshiftsOfRoom.workshifts[0].model.uid || '' } ${ workshiftsOfRoom.workshifts[0].model.fullname || workshiftsOfRoom.workshifts[0].model.surname || '' }`"
                                                                        >{{ workshiftsOfRoom.workshifts[0].model.surname || workshiftsOfRoom.workshifts[0].model.uid }}</span>
                                  </template>
                                  <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Модель</span>
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator" @click.stop="onClickOperator(workshiftsOfRoom.workshifts[0], date)">
                                                                    <span v-if="workshiftsOfRoom.workshifts[0].operator"
                                                                          class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name"
                                                                          v-b-tooltip.hover
                                                                          :title="`${ workshiftsOfRoom.workshifts[0].operator.uid || '' } ${ workshiftsOfRoom.workshifts[0].operator.fullname || workshiftsOfRoom.workshifts[0].operator.surname || '' }`"
                                                                    >{{ workshiftsOfRoom.workshifts[0].operator.surname || workshiftsOfRoom.workshifts[0].operator.uid }}</span>
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
                                           :filter="userPermissions.schedule.edit ? '.-placeholder' : 'div'"
                                           :preventOnFilter="false"
                                           :forceFallback="true"
                                           @change="moveWorkshift(date, periodString, roomId, office.id, $event)"
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
                                                                            <span v-if="shift.model" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name" @click.stop="onClickModel(shift, date)">
                                                                                <template v-if="shift.model">
                                                                                    <span class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text-name"
                                                                                          v-b-tooltip.hover
                                                                                          :title="`${ shift.model.uid || '' } ${ shift.model.fullname || shift.model.surname || '' }`"
                                                                                    >{{ shift.model.surname || shift.model.uid }}</span>
                                                                                </template>
                                                                                <template v-if="shift.model.new_model">
                                                                                    <span class="glyphicon glyphicon-new_model workshifts-edit-main-date-period-table-row-shifts-shift-cell-new" :id="`new-${shift.id}`"></span>
                                                                                    <b-popover custom-class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-new-popover" :target="`new-${shift.id}`" triggers="hover" placement="top">
                                                                                        <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                                                                                    </b-popover>
                                                                                </template>
                                                                            </span>
                                    </div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator">
                                                                            <span v-if="shift.operator"
                                                                                  class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name"
                                                                                  v-b-tooltip.hover
                                                                                  :title="`${ shift.operator.uid || '' } ${ shift.operator.fullname || shift.operator.surname || '' }`"
                                                                            >{{ shift.operator.surname || shift.operator.uid }}</span>
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
                                                                    <span v-if="shift.model" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name" @click.stop="onClickModel(shift, date)">
                                                                        <span class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text-name"
                                                                              v-b-tooltip.hover
                                                                              :title="`${shift.model.uid || ''} ${shift.model.fullname || shift.model.surname || ''}`"
                                                                        >{{ shift.model.surname || shift.model.uid }}</span>
                                                                        <template v-if="shift.model.new_model">
                                                                            <span class="glyphicon glyphicon-new_model workshifts-edit-main-date-period-table-row-shifts-shift-cell-new" :id="`new-${shift.id}`"></span>
                                                                            <b-popover custom-class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-new-popover" :target="`new-${shift.id}`" triggers="hover" placement="top">
                                                                                <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                                                                            </b-popover>
                                                                        </template>
                                                                    </span>
                                  <span v-else class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name -empty">Модель</span>
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -operator" @click.stop="onClickOperator(shift, date)">
                                                                    <span v-if="shift.operator"
                                                                          class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-text -name"
                                                                          v-b-tooltip.hover
                                                                          :title="`${shift.operator.uid || ''} ${shift.operator.fullname || shift.operator.surname || ''}`"
                                                                    >{{ shift.operator.surname || shift.operator.uid }}</span>
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -from">
                                  <time-input v-model="shift.start_at"
                                              :endPeriodThreshold="endPeriodThreshold"
                                              :date="date"
                                              :placeholder="getTimeFromDate(shift.planned_start_at)"
                                              :disabled="((shift.status !== 'assigned') && (shift.status !== 'process')) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.start.date.edit)"
                                              @input="changeShiftTime(shift)"
                                  />
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -to">
                                  <time-input v-model="shift.end_at"
                                              :endPeriodThreshold="endPeriodThreshold"
                                              :date="date"
                                              :placeholder="getTimeFromDate(shift.planned_end_at)"
                                              :showError="!shift.start_at"
                                              :disabled="((shift.status !== 'assigned') && (shift.status !== 'process')) || !(userPermissions.schedule.edit || userPermissions.schedule.actual.end.date.edit)"
                                              :startAt="shift.start_at"
                                              @input="changeShiftTime(shift)"
                                  />
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -status">
                                  <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-status" :class="`-${shift.status}`">{{ workshiftStatuses[shift.status] }}</div>
                                </div>
                                <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell -checkbox" @click.stop.prevent>
                                  <span class="glyphicon glyphicon-info" :id="`comments-${shift.id}`"></span>
                                  <b-popover v-if="shift.comments && shift.comments.length && shift.comments.filter(comment => comment.type !== 'system').length" custom-class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments" :target="`comments-${shift.id}`" triggers="hover">
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-header">Информация о смене</div>
                                    <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body">
                                      <template v-for="comment in shift.comments">
                                        <div v-if="comment.type !== 'system'" class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment">
                                          <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-avatar">
                                            <div class="avatar -sm" :style="comment.user.avatar ? `background-image: url(${comment.user.avatar}); background-size: cover;` : ''" />
                                          </div>
                                          <div class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main">
                                            <p class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main-author">{{ comment.user.fullname }}</p>
                                            <p>{{ comment.text }}</p>
                                            <p class="workshifts-edit-main-date-period-table-row-shifts-shift-cell-comments-body-comment-main-date">{{ formatDateTime(comment.created_at) }}</p>
                                          </div>
                                        </div>
                                      </template>
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
                </b-collapse>
              </template>
            </b-collapse>
          </div>
          <div v-else-if="(dateFormat === 'day') || Array.isArray(currentWorkshifts)" class="workshifts-edit-main-empty">
            <h3>Расписание не найдено</h3>
            <p>Для отображения расписания выберите страну, город и офис</p>
          </div>
        </div>
        <free-models v-else-if="activeTab === 'free-models'"
                     :free-models="freeModels.models"
                     :is-old="isActiveFreeModelsDateOld"
                     :activeGroup="activeGroup"
                     @open-schedule="onClickFreeModel"
        />
        <past-workshifts v-else-if="activeTab === 'past-workshifts'"
                         :past-schedule="pastSchedule"
                         :filters-past="filtersPast"
                         :offices-list="officesList"
                         :active-group="activeGroup"
                         :user-permissions="userPermissions"
                         @updatePastWorkshifts="updatePastDate"
                         @open-mini-profile="openPastMiniProfile"
        />
      </div>
      <div v-else-if="activeTab !== 'operators-workshifts'" class="workshifts-edit-main-empty">
        <h3>Расписание не найдено</h3>
        <p>Для отображения расписания выберите страну, город и офис</p>
      </div>
      <div class="workshifts-edit-main" v-if="activeTab === 'operators-workshifts'">
        <operators-workshifts v-if="officesList.length"
                              :operators-schedule="operatorsSchedule"
                              :filters-operators="filtersOperatorsWorkshift"
                              :offices-list="officesList"
                              :active-group="activeGroupOperators"
                              :user-permissions="userPermissions"
                              :showFreeOperators="!showOperatorsSchedule"
                              @updateOperatorsWorkshifts="updateOperatorsDate"
                              @fetchFreeOperators="fetchFreeOperators"
                              @fetchModelsWithoutOperators="fetchModelsWithoutOperators"
                              @open-mini-profile="openPastMiniProfile"
                              @open-assign-operator="openAssignOperators"
        />
        <div v-else-if="Object.keys(activeGroupOperators).length" class="workshifts-edit-main-empty">
          <h3>В выбранной группе офисы не найдены</h3>
          <p>Попробуйте выбрать другую группу</p>
        </div>
        <div v-else class="workshifts-edit-main-empty">
          <h3>Расписание не найдено</h3>
          <p>Для отображения расписания выберите страну, город или офис</p>
        </div>
      </div>
    </div>
    <helper contentClass="-paddingless" :hide-header-close="droverType === 'assign-operators'">
      <assign-operators  v-if="droverType === 'assign-operators'"
                         :group="activeGroupOperators"
                         :models="models"
                         :active-date="activeOperatorsDate"
                         :active-operator="activeUser"
                         :active-model="modelToAssign"
                         :offices-list="officesList"
                         @closeDrover="closeDrover"
      />
      <assign-pairs v-if="droverType === 'assign-pairs'"
                    :offices-list="officesList"
                    :group="activeGroupOperators"
                    :active-date="activeOperatorsDate"
                    @closeDrover="closeDrover"
      />
      <workshift-details v-if="droverType === 'details'"
                         :workshift="activeWorkshift"
                         :group="chosenGroup"
                         :models="models"
                         :shiftDate="activeShiftDate"
                         :endPeriodThreshold="endPeriodThreshold"
                         :excessTime="excessTime"
                         @closeDrover="closeDrover"
                         @miniProfile="openMiniProfile"
                         @openSchedule="openScheduleFromShift"
                         @getModelsNextPage="getModelsNextPage"
                         @searchList="searchModels"
      />
      <mini-profile v-else-if="droverType === 'mini-profile'"
                    :user-id="activeUser.id"
                    :office-id="chosenGroup.id"
                    :breadcrumbs-title="droverBreadcrumbs"
                    @close="returnModelSchedule"
                    @openWorkshiftDetails="openWorkshiftDetails"
      />
      <model-schedule v-else-if="droverType === 'model-schedule'"
                      :modelData="activeUser"
                      :office="chosenGroup"
                      :rooms="chosenGroupSchedule.rooms"
                      :operators="chosenGroupSchedule.operators"
                      :absences="activeUser.absences || absencesModel"
                      showModel
                      showAddAbsences
                      :backButton="showBackButtonInSchedule && 'Информация о смене' || undefined"
                      :selectOffice="selectOffice"
                      :officesList="activeUserOffices"
                      :user-permissions="userPermissions"
                      :default-date="currentScheduleDate"
                      :workshiftPeriods="workshiftPeriods"
                      @open-mini-profile="openModelProfile"
                      @open-absence-details="openAbsenceDetails"
                      @setChosenGroupId="setChosenGroupId"
                      @go-back="openWorkshiftDetails"
                      @fetchFreeModels="fetchFreeModels"
      />
      <absence-details v-else-if="droverType === 'absence-details'"
                       :backButton="droverBreadcrumbs"
                       @createAbsence="createUserAbsence"
                       @close="returnModelSchedule"
      />
    </helper>
  </div>
</template>

<script>
import Vue from 'vue';
import Helper from '@/components/Helper/Helper.vue';
import GroupPicker from "./components/GroupPicker";
import Details from "./components/Details";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import Draggable from "vuedraggable";
import moment from 'moment';
import Select from "@/components/Common/Select/Select";
import FreeModels from "./components/FreeModels/FreeModels";
import ModelSchedule from '@/components/ModelSchedule/ModelSchedule';
import TimeInput from './components/TimeInput';
import VueScrollingTable from "vue-scrolling-table"
import AssignOperators from "@/pages/Workshifts/components/AssignOperators/AssignOperators";
import PastWorkshifts from "@/pages/Workshifts/components/PastWorkshifts/PastWorkshifts";
import AbsenceDetails from "@/pages/Profile/components/WorkCalendar/AbsenceDetails";
import OperatorsWorkshifts from "@/pages/Workshifts/components/OperatorsWorkshifts/OperatorsWorkshifts";
import AssignPairs from "@/pages/Workshifts/components/AssignOperators/AssignPairs";
moment.locale('ru');

export default {
  name: 'workshifts',
  components: {
    AssignPairs,
    OperatorsWorkshifts,
    PastWorkshifts,
    'helper': Helper,
    'group-picker': GroupPicker,
    'workshift-details': Details,
    'mini-profile': MiniProfile,
    'draggable': Draggable,
    'custom-select': Select,
    'free-models': FreeModels,
    'model-schedule': ModelSchedule,
    'time-input': TimeInput,
    'scrolling-table': VueScrollingTable,
    'assign-operators': AssignOperators,
    'absence-details': AbsenceDetails,
  },
  data() {
    return {
      activeTab: '',
      currentWorkshifts: [],
      // currentPastWorkshifts: [],
      activeGroup: {},
      activeGroupOperators: {},
      dateFormat: 'day',
      activeDate: moment().format('YYYY-MM-DD'),
      activePastDate: moment().format('YYYY-MM-DD'),
      activeFreeModelsDate: moment().format('YYYY-MM-DD'),
      activeOperatorsDate: moment().format('YYYY-MM-DD'),
      activeWorkshift: {},
      droverType: '',
      droverBreadcrumbs: '',
      activeCollapses: [],
      filters: {
        reserved: true,
        canceled: true,
        empty: true
      },
      filtersPast: {
        reserved: true,
        canceled: true,
        completed: true
      },
      filtersOperatorsWorkshift: {},
      activeUser: {},
      activeModel: null,
      activeOperator: {},
      pastProfile: {},
      showBackButtonInSchedule: false,
      activeShiftDate: '',
      collapseStateOffice: {},
      collapseStateDate: {},
      cellWidths: {},
      chosenGroupId: null,
      selectOffice: false,
      showGroupsForOperator: false,
      modelsGroupId: null,
      modelToAssign: {},
      currentScheduleDate: null,
      showFreeOperators: false,
      searchSurnameModels: '',
      searchSurnameOperators: '',
      showOperatorsSchedule: false,
    }
  },
  computed: {
    currentSchedule() {
      return this.$store.state.schedule.currentSchedule;
    },
    pastSchedule() {
      return this.$store.state.schedule.pastSchedule;
    },
    operatorsSchedule() {
      return this.$store.state.schedule.operatorsSchedule;
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
    freeModels() {
      return this.$store.getters['schedule/getFreeModels'](this.activeGroup);
    },
    scheduleStatus() {
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
    /*isActiveDateOld() {
        let borderlineDate = moment();
        if (borderlineDate.weekday() !== 6) borderlineDate.weekday(-1);
        return moment(this.activeDate) < borderlineDate;
    },*/
    currentFreeModelsDatesText() {
      let date = moment(this.activeFreeModelsDate);
      if (date.weekday() !== 6) date.weekday(-1);
      let text = date.format('DD.MM.YYYY');
      date.add(6, 'd');
      return `${text} - ${date.format('DD.MM.YYYY')}`;
    },
    isActiveFreeModelsDateOld() {
      let borderlineDate = moment();
      if (borderlineDate.weekday() !== 6) borderlineDate.weekday(-1);
      return moment(this.activeFreeModelsDate) < borderlineDate;
    },
    currentDatesArray() {
      if (this.dateFormat === 'day') return [this.activeDate];
      return this.activeWeekArray;
    },
    activeWeekArray() {
      let date = moment(this.activeDate);
      if (date.weekday() !== 6) date.weekday(-2);
      else date.weekday(5);
      return [0, 1, 2, 3, 4, 5, 6].map(() => {
        date.add(1, 'd');
        return date.format('YYYY-MM-DD');
      })
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    /*disabledReserveButton() {
        return this.userPermissions.schedule.reserve.view || this.userPermissions.schedule.edit || this.userPermissions.schedule.actual.start.date.edit || this.userPermissions.schedule.actual.end.date.edit || this.userPermissions.schedule.break.edit
    },*/
    profile() {
      return this.$store.getters["profile/shortProfile"](Number(this.activeUser?.id));
    },
    absencesModel() {
      return this.$store.state.profile.absences;
    },
    absenceRequestStatus() {
      return this.$store.state.profile.absenceStatus;
    },
    userStatus() {
      return this.$store.state.users.status;
    },
    loadFreeModels() {
      return this.$store.state.schedule.loadFreeModels;
    },
    loadPastWorkshifts() {
      return this.$store.state.schedule.loadPastWorkshifts;
    },
    permissionShowWhorkshifts() {
      return this.userPermissions.schedule.view || this.userPermissions.schedule.actual.start.date.edit || this.userPermissions.schedule.actual.end.date.edit || this.userPermissions.schedule.break.edit;
    },
    permissionFreeModel() {
      return this.userPermissions.schedule.edit || this.userPermissions.schedule.reserve.view;
    },
    permissionPastWorkshifts() {
      return this.userPermissions.schedule.past.view;
    },
    permissionOperatorWorkshifts() {
      return this.userPermissions.setup.workshift.operator;
    },
    tabs() {
      let tabs = [];
      if (this.permissionShowWhorkshifts) tabs.push({
          value: 'show',
          title: 'Просмотр расписания',
          titleShort: 'Расписание',
        });
      if (this.permissionFreeModel) tabs.push({
          value: 'free-models',
          title: this.activeGroup.type !== 'country' && this.freeModels && !this.loadFreeModels.length && this.freeModels.quantity ? `Модели без смен (${this.freeModels.quantity})` : `Модели без смен`,
        });
      if (this.permissionPastWorkshifts) tabs.push({
        value: 'past-workshifts',
        title: 'Прошедшие смены',
      });
      if (this.permissionOperatorWorkshifts) tabs.push({
        value: 'operators-workshifts',
        title: 'Назначение операторов',
      });
      return tabs;
    },
    activeTabObject() {
      return this.tabs.find(tab => tab.value === this.activeTab) || {};
    },
    hideActionsOperatorWorkshifts() {
      return !this.officesList.length || this.scheduleStatus === 'request-operators'
    },
    models() {
      return this.$store.state.schedule.models;
    },
    modelsHeaders() {
      return this.$store.state.schedule.modelsHeaders;
    },
    modelsForFilter() {
      return this.models.length ? [{id: null, surname: 'Все модели'}, ...this.models] : [];
    },
    operatorsForFilter() {
      let defaultOperator = {id: null, surname: 'Все операторы'}
      if (!this.loadPastWorkshifts.length) {
        if (this.activeGroup.type === 'office') return this.pastSchedule[this.activeGroup.id]?.operators?.length ? [defaultOperator, ...this.pastSchedule[this.activeGroup.id].operators] : []
        if (this.activeGroup.type === 'city') {
          let operatorsData = [defaultOperator]
          this.activeGroup.children.forEach(office => {
            this.pastSchedule[office.id].operators.forEach(operator => {
              operatorsData.push({id: operator.id, uid: operator.uid, surname: operator.surname})
            })
          })
          return operatorsData.length > 1 ? operatorsData : []
        }
      } else return []
    },
    operatorsWorkshift() {
      return this.$store.state.groups.currentGroupOperators;
    },
    operatorsForOperatorsWorkshiftFilter() {
      return this.operatorsWorkshift.length ? [{id: null, surname: 'Все операторы'}, ...this.operatorsWorkshift] : [];
    },
    operatorHeaders() {
      return this.$store.state.groups.headersGroupOperators
    },
    operatorsLoading() {
      return this.$store.state.groups.statusUsers === 'request'
    },
    items() {
      return this.allItems.slice(0, this.maxRows)
    },
    excessTime() {
      let groupId = Object.keys(this.currentSchedule)[0];
      if (!groupId || !this.currentSchedule[groupId] || !this.currentSchedule[groupId].excess_time) return 0;
      return this.currentSchedule[groupId].excess_time;
    },
    endPeriodThreshold() {
      let groupId = Object.keys(this.currentSchedule)[0];
      if (!groupId || !this.currentSchedule[groupId] || !(this.currentSchedule[groupId].periods && this.currentSchedule[groupId].periods[this.currentSchedule[groupId].periods.length - 1] && this.currentSchedule[groupId].periods[this.currentSchedule[groupId].periods.length - 1].from)) return {
        hours: 0,
        minutes: 0
      };
      let time = this.currentSchedule[groupId].periods[this.currentSchedule[groupId].periods.length - 1].to.split(':');
      return {
        minutes: parseInt(time[1]),
        hours: parseInt(time[0])
      }
    },
    workshiftPeriods() {
      let groupId = Object.keys(this.currentSchedule)[0];
      return (groupId && this.currentSchedule[groupId]?.periods) ? this.currentSchedule[groupId].periods : null
    },
    newWorkshift() {
      return this.$store.state.schedule.newWorkshift;
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    officesList() {
      let activeGroup = this.activeTab === 'operators-workshifts' ? this.activeGroupOperators : this.activeGroup
      if (activeGroup.type === 'office') return [activeGroup];
      if (activeGroup.type === 'city') return activeGroup.children && activeGroup.children.filter(child => child.type === 'office') || [];
      if (activeGroup.type === 'country') {
        let resultOffices = []
        activeGroup.children.forEach(city => {
          resultOffices = resultOffices.concat(city.children.map(office => {
            office.city = city.title
            return office
          }))
        })
        return resultOffices
      }
      return [];
    },
    chosenGroup() {
      if (this.activeGroup.type === 'office') return this.activeGroup;
      if (this.activeGroup.type === 'city') {
        if (!this.activeWorkshift.group && !this.chosenGroupId) return this.activeGroup;
        let group = this.activeGroup.children.find(child => child.id === (this.chosenGroupId || this.activeWorkshift.group.id));
        if (!group) return {};
        group.path = {...this.activeGroup.path, office: group.title};
        return group;
      }
      return {};
    },
    chosenGroupSchedule() {
      let currentGroup = this.activeUser.office ? this.activeUser.office : this.chosenGroup
      if (!currentGroup || !currentGroup.id) return {};
      return this.currentSchedule[currentGroup.id] || {};
    },
    activeUserOffices() {
      if (!this.activeUser || !this.models) return [];
      return this.models.find(model => model.id === this.activeUser.id)?.offices || [];
    },
    updatedWorkshift() {
      return this.$store.state.schedule.updatedWorkshift;
    }
  },
  watch: {
    activeGroup: function (newGroup) {
      if ((newGroup.type === 'office') || (newGroup.type === 'city')) {
        this.fetchFreeModels(newGroup)
        this.updateWorkshifts(newGroup);
        this.updatePastWorkshifts(newGroup);
      }
      this.activeCollapses = [];
    },
    activeGroupOperators: function (newGroup) {
      this.updateOperatorsWorkshifts(newGroup);
    },
    models: function (newModels) {
      if (!newModels.find(model => model.id === this.filters.model)) Vue.set(this.filters, 'model', null);
    },
    officesList: function (newList) {
      this.updateCollapsesStates(this.currentDatesArray, newList);
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        this.selectOffice = false;
        this.chosenGroupId = null;
        this.showBackButtonInSchedule = false;
        if (this.modelsGroupId) this.getModels();
        this.modelsGroupId = null;
        this.updateWorkshifts(this.activeGroup);
      }
    },
    userStatus: function (newStatus, prevStatus) {
      if (newStatus !== '') return;
      if (prevStatus === 'editing' && this.droverType === 'add-groups') {
        this.droverBreadcrumbs = ''
        this.droverType = 'mini-profile'
      }
    },
    currentSchedule: function (nextScheduleObject) {
      // if (Object.keys(this.currentWorkshifts).length) return;
      this.setCurrentWorkshifts(nextScheduleObject);
    },
    scheduleStatus: function (newStatus, pervStatus) {
      switch (newStatus) {
        case 'edit-error':
          this.$toasted.error(this.requestErrors[0] && this.requestErrors[0].message || `Ошибка выполнения запроса`, {
            className: ['toasted-error'],
            action: {
              class: 'btn-close',
              onClick: this.closeToast
            },
          });
          this.setCurrentWorkshifts();
          return;
        case '':
          if ((pervStatus === 'editing') || (pervStatus === 'canceling')) this.activeWorkshift = this.updatedWorkshift;
          return;
        case 'all-assigned':
        case 'assigned':
          this.$toasted.success('Операторы добавлены в смены', {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: {
              text: '',
              class: 'btn-close',
              onClick: this.closeToast
            }
          });
          this.$nextTick(this.updateOperatorsWorkshifts);
          return;
        case 'assigning-error':
        case 'all-assigning-error':
          this.$toasted.error(this.requestErrors.length ? this.requestErrors : 'Ошибка', {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: {
              text: '',
              class: 'btn-close',
              onClick: this.closeToast
            }
          });
          return;
      }
    },
    newWorkshift: function (newWorkshift) {
      this.activeWorkshift = newWorkshift;
    },
    absenceRequestStatus: function (newStatus) {
      if (newStatus === 'created') {
        this.$toasted.success('Отсутствие добавлено', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
        this.$store.dispatch('profile/fetchAbsences', {user: this.activeUser.id});
        this.returnModelSchedule()
      }
      else if (newStatus === 'error')
        this.$toasted.error(`${this.$store.state.profile.errorMessage || 'Ошибка'}`, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
    },
    absencesModel(newAbsences) {
      if (newAbsences.length) this.activeUser.absences = newAbsences;
    },
    tabs() {
      this.setDefaultActiveTab();
    }
    // userPermissions: function () {
    //   if (!this.activeTabObject.value) this.activeTab = this.tabs[0]?.value;
    // },
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsNonOperators');
    this.$store.dispatch('dictionaries/fetchGroupsOperators');
    this.$store.dispatch('dictionaries/fetchCancellationReasons');
    this.$store.dispatch('dictionaries/fetchOperators');
    this.$store.dispatch('dictionaries/fetchRoles');
    this.$store.dispatch('dictionaries/fetchAbsenceTypes');
    let savedFilters = localStorage.getItem('scheduleFilters');
    if (savedFilters) Vue.set(this.filters, 'model', JSON.parse(savedFilters).model);
    let savedPastFilters = localStorage.getItem('schedulePastFilters');
    if (savedPastFilters) {
      let parsedFilters = JSON.parse(savedPastFilters);
      this.filtersPast = {
        ...this.filtersPast,
        model: parsedFilters.model,
        operator: parsedFilters.operator
      }
    }
    let savedOperatorWorkshiftFilters = localStorage.getItem('scheduleOperatorsWorkshiftFilters');
    if (savedOperatorWorkshiftFilters) {
      let parsedFilters = JSON.parse(savedOperatorWorkshiftFilters);
      this.filtersOperatorsWorkshift = {
        model: parsedFilters.model,
        operator: parsedFilters.operator
      }
    }
    this.setDefaultActiveTab();
  },
  methods: {
    setActiveTab(tab) {
      if (tab === 'show' || tab === 'past-workshifts') this.searchModels('')
      this.activeTab = tab;
      localStorage.setItem('workshiftTab', tab);
    },
    setDefaultActiveTab() {
      let storageWorkshiftTab = localStorage.getItem('workshiftTab')
      this.activeTab = this.tabs.some(tab => tab.value === storageWorkshiftTab) ? storageWorkshiftTab : this.tabs[0]?.value;
    },
    setDateFormat(format) {
      this.dateFormat = format;
      this.updateCollapsesStates();
    },
    toggleShowType(type) {
      // if(type === 'reserved' && !this.disabledReserveButton) return;
      /*let filters = {
          ...this.filters,
          [type]: !this.filters[type]
      }
      this.filters = filters;*/
      Vue.set(this.filters, type, !this.filters[type]);
      localStorage.setItem('scheduleFilters', JSON.stringify(this.filters));
      this.setCurrentWorkshifts();
    },
    togglePastType(type) {
      Vue.set(this.filtersPast, type, !this.filtersPast[type]);
      this.savePastFilter()
    },
    clearFilters() {
      this.filters = {
        reserved: true,
        canceled: true,
        empty: true
      };
      this.setCurrentWorkshifts();
    },
    clearPastFilters() {
      this.filtersPast = {
        reserved: true,
        canceled: true,
        completed: true
      };
      this.savePastFilter()
    },
    clearOperatorsWorkshiftFilters() {
      this.filtersOperatorsWorkshift = {};
      this.saveOperatorsWorkshiftFilter()
    },
    addDate() {
      let date = moment(this.activeDate);
      // let lastDate = moment();
      //
      // lastDate.weekday(this.dateFormat === 'day' ? 4 : -1);
      // if (date > lastDate) return;
      date.add(this.dateFormat === 'day' ? 1 : 7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      this.activeFreeModelsDate = this.activeDate;
      this.updateCollapsesStates();
      if ((date.weekday() === 6) || (this.dateFormat === 'week')) {
        this.updateWorkshifts();
        this.fetchFreeModels(this.activeGroup)
      }
    },
    fetchFreeModels(group) {
      if (!this.permissionFreeModel) return;
      if (group.type === 'office') this.$store.dispatch('schedule/fetchFreeModels', {
        office: group.id,
        workweek: this.activeFreeModelsDate
      });
      else if (group.type === 'city') this.$store.dispatch('schedule/fetchFreeModelsForCity', {
        offices: group.children,
        workweek: this.activeFreeModelsDate
      });
    },
    subtractDate() {
      let date = moment(this.activeDate);
      date.subtract(this.dateFormat === 'day' ? 1 : 7, 'd');
      this.activeDate = date.format('YYYY-MM-DD');
      this.activeFreeModelsDate = this.activeDate;
      this.updateCollapsesStates();
      if ((date.weekday() === 5) || (this.dateFormat === 'week')) {
        this.updateWorkshifts();
        this.fetchFreeModels(this.activeGroup)
      }
    },
    addFreeModelsDate() {
      let date = moment(this.activeFreeModelsDate);
      date.add(7, 'd');
      this.activeFreeModelsDate = date.format('YYYY-MM-DD');
      this.fetchFreeModels(this.activeGroup)
    },
    subtractFreeModelsDate() {
      let date = moment(this.activeFreeModelsDate);
      date.subtract(7, 'd');
      this.activeFreeModelsDate = date.format('YYYY-MM-DD');
      this.fetchFreeModels(this.activeGroup)
    },
    updateWorkshifts(group = this.activeGroup) {
      if (!this.permissionShowWhorkshifts) return;
      if ((group.type !== 'office') && (group.type !== 'city')) return this.currentWorkshifts = {};
      if (group.type === 'office') this.$store.dispatch('schedule/fetchSchedule', {office: group.id, 'workweek': this.activeDate, pagination: false});
      else this.$store.dispatch('schedule/fetchScheduleForCity', {offices: this.officesList, query: {'workweek': this.activeDate, pagination: false}});
      this.getModels(group);
    },
    getModels(group = this.activeGroup) {
      this.$store.dispatch('schedule/fetchModels', {group: group.id, 'workweek': this.activeDate, surname: this.searchSurnameModels, per_page: 20});
    },
    getModelsNextPage() {
      let group = this.activeGroup
      if ((this.modelsHeaders.currentPage >= this.modelsHeaders.totalPages) || (this.scheduleStatus === 'request')) return;
      this.$store.dispatch('schedule/fetchModelsNextPage', {group: this.modelsGroupId || group.id, 'workweek': this.activeDate, surname: this.searchSurnameModels, per_page: 20, page: this.modelsHeaders.currentPage + 1});
    },
    searchModels(search) {
      this.searchSurnameModels = search
      this.getModels()
    },
    getOperators() {
      this.$store.dispatch('groups/fetchCurrentGroupOperators',{operator_groups: this.officesList.map(office => office.id), surname: this.searchSurnameOperators, is_active: 1, per_page: 20});
    },
    getOperatorsNextPage() {
      if ((this.operatorHeaders.currentPage >= this.operatorHeaders.totalPages) || (this.scheduleStatus === 'request')) return;
      this.$store.dispatch('groups/fetchCurrentGroupOperatorsNextPage',{operator_groups: this.officesList.map(office => office.id), surname: this.searchSurnameOperators, is_active: 1, per_page: 20, page: this.operatorHeaders.currentPage + 1});
    },
    searchOperators(search) {
      this.searchSurnameOperators = search
      this.getOperators()
    },
    updatePastWorkshifts(group = this.activeGroup) {
      if (!this.permissionPastWorkshifts) return;
      if (this.activeGroup.type === 'office') this.$store.dispatch('schedule/fetchPastSchedule', {
        office: group.id,
        'workweek': this.activePastDate,
        pagination: false
      });
      else if (this.activeGroup.type === 'city') this.$store.dispatch('schedule/fetchPastScheduleForCity', {
        offices: group.children,
        'workweek': this.activePastDate,
        pagination: false
      });
    },
    updatePastDate(date) {
      this.activePastDate = date
      this.updatePastWorkshifts()
    },
    changeFreeOperators() {
      this.clearOperatorsWorkshiftFilters();
      this.updateOperatorsWorkshifts();
    },
    updateOperatorsWorkshifts(group = this.activeGroupOperators) {
      if (!this.showOperatorsSchedule) {
        this.fetchModelsWithoutOperators()
        this.fetchFreeOperators()
        return;
      }
      if (this.activeGroupOperators.type === 'office') this.$store.dispatch('schedule/fetchOperatorsSchedule', {
        group: group.id,
        'workweek': this.activeOperatorsDate,
        without_workshifts: !this.showOperatorsSchedule,
      });
      else if (this.activeGroupOperators.type === 'city') this.$store.dispatch('schedule/fetchOperatorsScheduleForCity', {
        groups: group.children,
        query: {
          'workweek': this.activeOperatorsDate,
          without_workshifts: !this.showOperatorsSchedule,
        },
      });
      else if (this.activeGroupOperators.type === 'country') this.$store.dispatch('schedule/fetchOperatorsScheduleForCity', {
        groups: this.officesList,
        query: {
          'workweek': this.activeOperatorsDate,
          without_workshifts: !this.showOperatorsSchedule,
        },
      });
      this.getOperators(group);
    },
    fetchFreeOperators(page = 1) {
      this.$store.dispatch('schedule/fetchFreeOperators', {
        group: this.activeGroupOperators.id,
        'workweek': this.activeOperatorsDate,
        pagination: true,
        without_workshifts: true,
        per_page: 20,
        page: page
      });
    },
    fetchModelsWithoutOperators(page = 1) {
      this.$store.dispatch('schedule/fetchModelsWithoutOperators', {
        'workweek': this.activeOperatorsDate,
        pagination: true,
        per_page: 20,
        page: page
      });
    },
    updateOperatorsDate(date) {
      this.activeOperatorsDate = date
      this.updateOperatorsWorkshifts()
    },
    getTimeFromDate(date) {
      return moment.parseZone(date).format('HH:mm');
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
    clickRow(shift, date) {
      this.activeWorkshift = shift;
      this.activeShiftDate = date;
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openMiniProfile(user, title = '') {
      this.droverBreadcrumbs = title;
      this.activeUser = user;
      this.droverType = 'mini-profile'
    },
    openModelProfile({user, title, model}) {
      this.openMiniProfile(user, title)
      if (model) this.activeModel = model
    },
    openPastMiniProfile(profile) {
      this.droverBreadcrumbs = '';
      this.activeUser = {id: profile.id, fullname: profile.fullname, office: {id: profile.office}};
      this.droverType = 'mini-profile';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    closeDrover() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
    openAbsenceDetails(currentScheduleDate) {
      this.currentScheduleDate = currentScheduleDate;
      this.droverBreadcrumbs = 'Расписание на неделю'
      this.droverType = 'absence-details'
    },
    openWorkshiftDetails() {
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openPartnerProfile(user) {
      this.activeUser = user
    },
    userEditGroups() {
      this.showGroupsForOperator = false;
      this.droverType = 'add-groups';
    },
    userEditOperatorGroups() {
      this.showGroupsForOperator = true;
      this.droverType = 'add-groups';
    },
    returnModelSchedule() {
      if (this.activeModel) {
          this.activeUser = this.activeModel;
          this.activeModel = null;
      }
      this.droverBreadcrumbs = '';
      this.droverType = 'model-schedule';
    },
    /*getModelName(model) {
        return this.userPermissions.model.profile.personal.view ? model.surname : model.fullname;
    },*/
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
    moveWorkshift(date, periodString, roomId, officeId, e) {
      if (!e.added) return;
      // return this.setCurrentWorkshifts();
      let workshift = e.added.element;
      if (workshift.group.id !== officeId) {
        this.setCurrentWorkshifts();
        this.$toasted.error(`Нельзя переносить смену из одного офиса в другой`, {
          className: ['toasted-error'],
          action: {
            class: 'btn-close',
            onClick: this.closeToast
          },
        });
        return;
      }
      if ((roomId === 'reserve') && (workshift.status !== 'created') && (workshift.status !== 'assigned')) {
        this.setCurrentWorkshifts();
        this.$toasted.error(`В резерв можно вернуть смену только в статусе "назначена"`, {
          className: ['toasted-error'],
          action: {
            class: 'btn-close',
            onClick: this.closeToast
          },
        });
        return;
      }
      let period = periodString.split(' - '),
          dateObj = moment.parseZone(workshift.planned_start_at);
      // return console.log(moment.parseZone(workshift.planned_start_at).format('YYYY-MM-DDTkk:mm:ss'));

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
      } else if ((this.movingShiftData.date || dateObj.format('YYYY-MM-DD')) !== date) {
        let from = [dateObj.hour(), dateObj.minute()],
            dateObjStart = moment(date);

        dateObjStart.hours(from[0]).minutes(from[1]);
        workshift.planned_start_at = dateObjStart.format('YYYY-MM-DDTkk:mm:ss');
        let dateObjEnd = moment.parseZone(workshift.planned_end_at);
        let to = [dateObjEnd.hour(), dateObjEnd.minute()];
        if (from[0] >= to[0]) dateObj.add(1, 'd');
        dateObjStart.hours(to[0]).minutes(to[1]);
        workshift.planned_end_at = dateObjStart.format('YYYY-MM-DDTkk:mm:ss');
      }

      workshift.room = roomId === 'without_room' ? null : roomId === 'reserve' ? workshift.room : {id: roomId};
      workshift.status = roomId === 'reserve' ? 'created' : workshift.status === 'created' ? 'assigned' : workshift.status;

      this.preventEdit = false;
      this.editShift(workshift);
    },
    startDrag(date, periodString, roomId, e) {
      this.movingShiftData = {date, periodString, roomId, key: e.oldIndex};
      this.preventEdit = true;
      this.movingShift = true;
    },
    endDrag() {
      setTimeout(() => {
        this.preventEdit = false;
      }, 1000);
      this.movingShift = false;
    },
    setCurrentWorkshifts(nextScheduleObject = this.currentSchedule) {
      // this.activeShiftGroups = {};
      let emptySchedule = {};

      this.officesList.map(office => {
        if (!nextScheduleObject[office.id]) return;
        let officesSchedule = {};
        let nextSchedule = nextScheduleObject[office.id].workshifts;
        this.activeWeekArray.map(date => {
          officesSchedule[date] = {}
          nextScheduleObject[office.id].periods.map(period => {
            officesSchedule[date][`${period.from} - ${period.to}`] = {}
            nextScheduleObject[office.id].rooms.map(room => {
              officesSchedule[date][`${period.from} - ${period.to}`][room.id] = {
                number: room.number,
                workshifts: nextSchedule[date] &&
                nextSchedule[date][`${period.from} - ${period.to}`] &&
                nextSchedule[date][`${period.from} - ${period.to}`][room.id] &&
                nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts ?
                    ((this.filters.canceled && !this.filters.model) ? JSON.parse(JSON.stringify(nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts))
                        : JSON.parse(JSON.stringify(nextSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts.filter(shift => (this.filters.canceled || (shift.status !== 'canceled')) && (!this.filters.model || (shift.model.id === this.filters.model))))))
                    : [],
              }

              if (!this.filters.empty && !officesSchedule[date][`${period.from} - ${period.to}`][room.id].workshifts.length) delete officesSchedule[date][`${period.from} - ${period.to}`][room.id];
            })
            let shiftsWithoutRoom = nextSchedule[date] &&
                nextSchedule[date][`${period.from} - ${period.to}`] &&
                nextSchedule[date][`${period.from} - ${period.to}`].without_room &&
                nextSchedule[date][`${period.from} - ${period.to}`].without_room.workshifts
            if (shiftsWithoutRoom && shiftsWithoutRoom.length) officesSchedule[date][`${period.from} - ${period.to}`].without_room = {workshifts: shiftsWithoutRoom}

            if (this.filters.reserved) {
              let reservedWithoutRoom = nextSchedule[date] &&
                  nextSchedule[date][`${period.from} - ${period.to}`] &&
                  nextSchedule[date][`${period.from} - ${period.to}`].reserve &&
                  nextSchedule[date][`${period.from} - ${period.to}`].reserve.workshifts;

              if (reservedWithoutRoom && this.filters.model) reservedWithoutRoom = reservedWithoutRoom.filter(shift => shift.model.id === this.filters.model);
              if (reservedWithoutRoom && reservedWithoutRoom.length) officesSchedule[date][`${period.from} - ${period.to}`].reserve = {workshifts: reservedWithoutRoom}
            }
          })
        })

        emptySchedule[office.id] = officesSchedule;
      })

      this.currentWorkshifts = emptySchedule;
      this.$nextTick(this.setCellWidths);
    },
    onClickFreeModel(model) {
      this.activeUser = model;
      this.currentScheduleDate = null;
      this.droverType = this.userPermissions.schedule.edit ? 'model-schedule' : 'mini-profile';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openSchedule(model) {
      this.activeUser = model;
      this.currentScheduleDate = null;
      this.droverType = 'model-schedule';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openScheduleFromShift(model) {
      this.showBackButtonInSchedule = true;
      this.$store.dispatch('profile/fetchAbsences', {
        user: model.id,
        workweek: this.activeShiftDate,
      });
      this.openSchedule(model);
    },
    closeToast(e, toastObject) {
      toastObject.goAway(0);
    },
    openShiftCreation(dateString, periodString, roomId, groupId) {
      if (groupId && (groupId !== this.activeGroup.id)) {
        this.modelsGroupId = groupId;
        this.$store.dispatch('schedule/fetchModels', {
          group: groupId,
          'workweek': this.activeDate,
          per_page: 20
        });
      }
      let shift = {model: {}};
      if (roomId) shift.room = {id: parseInt(roomId)};
      if (dateString && periodString) {
        let period = periodString.split(' - '),
            from = period[0].split(':'),
            to = period[1].split(':'),
            date = moment(dateString);

        date.hours(from[0]).minutes(from[1]);
        shift.planned_start_at = date.format('YYYY-MM-DDTkk:mm:ss') + '+00:00';

        if (from[0] >= to[0]) date.add(1, 'd');

        date.hours(to[0]).minutes(to[1]);
        shift.planned_end_at = date.format('YYYY-MM-DDTkk:mm:ss') + '+00:00';
      }
      if (groupId) shift.group = {id: groupId};

      this.activeWorkshift = shift;
      this.activeShiftDate = dateString || '';
      this.droverType = 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openAssignOperators(data = null) {
      if (data) {
        this.activeUser = data.operator
        this.modelToAssign = data.model
        this.updateOperatorProfile()
      } else {
        this.activeUser = null
        this.modelToAssign = null
      }
      this.droverType = 'assign-operators';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    openAssignPairs() {
      this.droverType = 'assign-pairs';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    updateOperatorProfile() {
      let requestData = {
        userId: this.activeUser.id
      };
      requestData.query = {absence_at: moment(this.activeOperatorsDate).format('YYYY-MM-DD')}
      requestData.query.workweek = moment(this.activeOperatorsDate).format('YYYY-MM-DD')
      this.$store.dispatch('profile/fetchShortProfile', requestData);
    },
    editOperatorGroups() {
      this.showGroupsForOperator = true
      this.droverType = 'add-groups';
    },
    changeShiftTime(shift) {
      this.$store.dispatch('schedule/editWorkshift', {
        id: shift.id,
        start_at: shift.start_at,
        end_at: shift.end_at
      });
    },
    collapseBlock(id) {
      this.$root.$emit('bv::toggle::collapse', id);
    },
    updateCollapsesStates(dates = this.currentDatesArray, offices = this.officesList) {
      let collapseStateOffice = {};
      offices.map(office => collapseStateOffice[office.id] = true);
      this.collapseStateOffice = collapseStateOffice;
      let collapseStateDate = {};
      dates.map(dates => collapseStateDate[dates] = true);
      this.collapseStateDate = collapseStateDate;
    },
    setCellWidths() {
      let cellWidths = {};
      for (let office in this.currentSchedule) {
        for (let date in this.currentSchedule[office].workshifts) {
          for (let period in this.currentSchedule[office].workshifts[date]) {
            for (let room in this.currentSchedule[office].workshifts[date][period]) {
              this.currentSchedule[office].workshifts[date][period][room].workshifts?.map(shift => {
                cellWidths[shift.id] = {
                  model: this.$refs[`shift-model-${shift.id}`] && this.$refs[`shift-model-${shift.id}`][0]?.clientWidth,
                  operator: this.$refs[`shift-operator-${shift.id}`] && this.$refs[`shift-operator-${shift.id}`][0]?.clientWidth
                }
              })
            }
          }
        }
      }
      this.cellWidths = cellWidths;
    },
    setCurrentWorkshiftsModel() {
      localStorage.setItem('scheduleFilters', JSON.stringify(this.filters));
      this.setCurrentWorkshifts();
    },
    savePastFilter() {
      localStorage.setItem('schedulePastFilters', JSON.stringify(this.filtersPast));
    },
    saveOperatorsWorkshiftFilter() {
      localStorage.setItem('scheduleOperatorsWorkshiftFilters', JSON.stringify(this.filtersOperatorsWorkshift));
    },
    onClickModel(shift, date) {
      this.currentScheduleDate = null;
      this.droverBreadcrumbs = ''
      this.activeUser = shift.model;
      this.activeWorkshift = shift;
      this.activeShiftDate = date;
      this.droverType = this.userPermissions.schedule.edit ? 'model-schedule' : (this.userPermissions.model.profile.view ? 'mini-profile' : 'details');
      // this.selectOffice = true;
      this.$store.dispatch('profile/fetchAbsences', {
        user: shift.model.id,
        workweek: date
      });
      this.$store.dispatch('layout/toggleHelper', true);
    },
    onClickOperator(shift, date) {
      this.droverBreadcrumbs = ''
      this.activeUser = shift.operator;
      this.activeWorkshift = shift;
      this.activeShiftDate = date;
      this.droverType = (shift.operator && this.userPermissions.operator.profile.view) ? 'mini-profile' : 'details';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    setChosenGroupId(id) {
      this.chosenGroupId = id;
    },
    createUserAbsence(absence) {
      absence.user = this.activeUser.id
      this.$store.dispatch('profile/createAbsence', absence)
    }
  }
}
</script>
