<template>
  <div class="workshifts-edit-main">
    <div class="workshifts-edit-main-header mb-3">
      <div class="workshifts-edit-main-header-title">
        <h4 class="workshifts-edit-main-header-title-text">Расписание операторов</h4>
        <div v-if="showOperatorsSchedule && userPermissions.operator_view_incomes"
             class="workshifts-edit-main-header-title-wages_toggle"
             :class="{'-loading': loadOperatorsWorkshifts.length || status === 'request-operators'}"
             @click="toggleWages"
        >
          <i class="workshifts-edit-main-header-title-wages_toggle-eye glyphicon"
             :class="areWagesActive && !loadOperatorsWorkshifts.length && (status !== 'request-operators') ? 'glyphicon-eye-open' : 'glyphicon-eye-close'"
          />
          <span v-if="areWagesActive && !loadOperatorsWorkshifts.length && (status !== 'request-operators')"
                class="workshifts-edit-main-header-title-wages_toggle-text"
          >$ {{ fullPageSum }}</span>
          <span v-else class="workshifts-edit-main-header-title-wages_toggle-text">Показать заработок</span>
        </div>
      </div>
      <div class="workshifts-edit-main-header-actions">
        <div class="workshifts-filters-main-params-switch d-flex align-items-center mr-3">
          <span>Таблица расписания</span>
          <div class="custom-control custom-switch mb-1">
            <input v-model="showOperatorsSchedule"
                   type="checkbox"
                   class="custom-control-input"
                   id="show-free-operators"
                   :disabled="hideActionsOperatorWorkshifts"
                   @change="toggleShowOperatorsSchedule"
            />
            <label class="custom-control-label custom-control-label-stylization" for="show-free-operators"></label>
          </div>
        </div>
        <b-button v-if="pairCreatePermission"
                  class="workshifts-header-button"
                  variant="outline-primary"
                  size="sm"
                  :disabled="hideActionsOperatorWorkshifts"
                  @click="clickAssignPairs"
        >Назначить пары</b-button>
      </div>
    </div>
    <div v-if="loadOperatorsWorkshifts.length || status === 'request-operators'" class="free_models-info">
      <throbber class="throbber"/>
      <span class="free_models-info-load text-fw-400">Расписание загружается, пожалуйста, подождите</span>
    </div>
    <template v-else>
      <free-operators v-if="!showOperatorsSchedule"
                      :activeDate="activeOperatorsDate"
                      :activeGroup="activeGroup"
                      :officesList="officesList"
                      ref="free-operators"
                      @openAssignOperator="openAssignOperator"
      />
      <div v-else :class="{'pb-4': pairsAssigning}" @mouseleave="onHoverOperator(null)">
        <div v-for="office in officesList">
          <div v-if="tableDataOperatorsWorkshifts[office.id] && (tableDataOperatorsWorkshifts[office.id].assignedOperators || tableDataOperatorsWorkshifts[office.id].operatorsWithoutWorkshifts || tableDataOperatorsWorkshifts[office.id].missingOperators)"
               class="workshifts-table-body"
               :class="{'-checkbox_row' : !Array.isArray(potentialOperatorsSchedule[office.id]) && pairsAssigning}">
            <div v-if="(activeGroup.type !== 'office')"
                 class="d-flex align-items-center position-relative workshifts-collapse pl-0"
                 :class="{'-border_none': collapseStateOffice[office.id]}"
                 @click="collapseBlock(`collapse-operators-office-${office.id}`)">
              <i class="groups-nav-list-group-container-color"
                 :style="`background-color: ${office.color || 'red'}`"
              />
              <h4 class="groups-nav-list-group-container-title d-flex align-items-center">
                <span v-if="activeGroup.type === 'country'">{{ office.city }}, </span>
                <span>{{ office.title }}</span>
                <span
                    v-if="tableDataOperatorsWorkshifts[office.id] && areWagesActive && !collapseStateOffice[office.id]"
                    class="text-size-normal text-fw-400 ml-2"
                >$ {{ tableDataOperatorsWorkshifts[office.id].sum || 0 }}</span>
                <i class="fa fa-angle-up workshifts-edit-main-date-period-title-date-arrow-operators_workshifts"
                   :class="{'-active': !collapseStateOffice[office.id]}"
                />
              </h4>
            </div>
            <b-collapse v-model="collapseStateOffice[office.id]"
                        :id="`collapse-operators-office-${office.id}`"
                        class="workshifts-table-container"
            >
              <scrolling-table
                  v-if="tableDataOperatorsWorkshifts[office.id].assignedOperators.length || tableDataOperatorsWorkshifts[office.id].operatorsWithoutWorkshifts.length || tableDataOperatorsWorkshifts[office.id].missingOperators"
                  scroll-horizontal
                  scroll-vertical
                  sync-header-scroll
                  sync-footer-scroll
                  deadAreaColor='#f9fbfd'
                  class="workshifts-table -freezeFirstColumn -with_wages"
                  :class="pairsAssigning ? '-active': '-inactive'"
              >
                <template slot="thead">
                  <tr @mouseenter.stop="onHoverOperator(null)">
                    <th v-for="col in columnsOperatorsWorkshifts"
                        class="workshifts-table-head"
                        :key="col.id"
                    >
                      <div class="workshifts-table-head-column">
                        <div v-if="!Array.isArray(potentialOperatorsSchedule[office.id]) && col.id === 'operator'"
                             class="abc-checkbox workshifts-table-profile-main-operator_checkbox -common mr-3"
                             :class="pairsAssigning ? '-active': '-inactive'">
                          <input v-model="allPotentialShiftsSelected"
                                 type="checkbox"
                                 id="checkbox_common"
                                 :readonly="!pairsAssigning"
                                 @change="toggleAllOperatorsShifts">
                          <label for="checkbox_common"></label>
                        </div>
                        <p class="text-size-small mb-0 w-50">{{ col.title }}</p>
                        <p v-if="areWagesActive && tableDataOperatorsWorkshifts[office.id]" class="text-gray-text mb-0">
                          $ {{
                            (col.id === 'operator' ?
                                tableDataOperatorsWorkshifts[office.id].sum :
                                tableDataOperatorsWorkshifts[office.id].sumsByDate[col.id]) || 0
                          }}
                        </p>
                      </div>
                    </th>
                  </tr>
                </template>
                <template slot="tbody">
                  <template v-for="(collapseStatus, group) in operatorsCollapseStatus[office.id]">
                    <tr v-if="tableDataOperatorsWorkshifts[office.id][group].length"
                        class="workshifts-operators_table-week-collapse">
                      <td class="border-0">
                        <div class="workshifts-operators_table-week-collapse-row">
                          <i class="fa fa-angle-down angle mr-2"
                             :class="{ '-active': !collapseStatus }"
                             @click="toggleCollapse(office.id, group)"
                          />
                          <span v-if="tableDataOperatorsWorkshifts[office.id]"
                                class="workshifts-operators_table-week-collapse-row-text">
                          <template v-if="group === 'assignedOperators'">Назначенные</template>
                          <template v-else-if="group === 'operatorsWithoutWorkshifts'">Без смен</template>
                          <template v-else>Отсутствующие</template>

                      ({{ tableDataOperatorsWorkshifts[office.id][group].length }})
                    </span>
                        </div>
                      </td>
                      <template v-for="cellCount in 7">
                        <td class="border-0" :key="cellCount"/>
                      </template>
                    </tr>
                    <template v-if="operatorsCollapseStatus[office.id][group]">
                      <template v-for="(item, key) in tableDataOperatorsWorkshifts[office.id][group]">
                        <template v-if="item.models.length">
                          <tr v-for="(model, index) in item.models"
                              class="workshifts-table-row"
                              :class="{'-potential': item.hasPotentialShifts, [`-${model.status}`]: !!model.status, '-first': index === 0, '-hover': hoveredOperatorId === item.id}"
                              :key="`${item.id}-${model.id}`"
                              @mouseenter.stop="onHoverOperator(item.id)"
                              @mouseleave.stop="onStopHoveringOperator"
                          >
                            <td v-for="(col, indexCol) in columnsOperatorsWorkshifts"
                                class="workshifts-table-row-col"
                                :key="col.id"
                                @click="openAssignOperator({operator: item})"
                            >
                              <template v-if="col.id === 'operator'">
                                <div v-if="index === 0"
                                     class="workshifts-table-profile -operator_rowspan"
                                     :class="{'-operator' : userPermissions.model.profile.view}"
                                     :style="{height: dataForButtons[office.id][group][key].height}"
                                     @click.stop="openAssignOperator({operator: item})"
                                >
                                  <div v-if="!Array.isArray(potentialOperatorsSchedule[office.id])"
                                       class="abc-checkbox workshifts-table-profile-main-operator_checkbox"
                                       :class="pairsAssigning ? '-active' : '-inactive'"
                                       @click.stop
                                  >
                                    <template v-if="item.hasPotentialShifts">
                                      <input type="checkbox"
                                             v-model="operatorRowsStatuses[item.id]"
                                             :id="`checkbox_${item.id}`"
                                             :readonly="!pairsAssigning"
                                             @change="toggleOperatorsShifts(item.id, office.id)">
                                      <label :for="`checkbox_${item.id}`"></label>
                                    </template>
                                    <div v-else class="pt-2 pb-2"/>
                                  </div>
                                  <div class="workshifts-table-profile-main mr-auto"
                                       :class="{'ml-3': pairsAssigning}">
                                    <avatar class="workshifts-table-profile-main-avatar"
                                            :url="item.avatar"
                                            :telegram="item.telegram_connected"
                                            :is-fin-admin="item.is_fin_admin"
                                    />
                                    <div class="workshifts-table-profile-main-name">
                                      <p v-if="item.surname" class="mb-0">{{ item.surname }}</p>
                                      <p v-else class="text-gray mb-0">{{ item.uid }}</p>
                                      <p v-if="areWagesActive" class="text-gray-text text-size-small text-fw-400 mb-0">$
                                        {{ item.sum || 0 }}</p>
                                    </div>
                                  </div>
                                  <div v-if="pairsAssigning && (index === 0)" class="workshifts-table-profile-buttons">
                                    <div v-for="currentModel in item.models"
                                         class="workshifts-table-profile-buttons-button"
                                         :style="{height: dataForButtons[office.id][group][key].modelsHeights[currentModel.id]}"
                                         :key="currentModel.id"
                                    >
                                      <template v-if="currentModel.hasPotentialShifts">
                                        <success class="workshifts-table-profile-check ml-1"
                                                 :id="`success_button-${item.id}-${currentModel.id}`"
                                                 @click.stop="openConfirmModal({officeId: office.id, group: group, operator: item, model: currentModel})"
                                        />
                                        <b-tooltip :target="`success_button-${item.id}-${currentModel.id}`"
                                                   placement="top"
                                                   custom-class="tltp-8">
                                          <span>Назначить оператору все выбранные смены</span>
                                        </b-tooltip>
                                      </template>
                                    </div>
                                  </div>
                                </div>
                              </template>
                              <template v-else-if="model.shifts && model.shifts[col.id] && model.shifts[col.id].length">
                                <div v-for="(workshift, index) in model.shifts[col.id]"
                                     class="workshifts-table-workshift"
                                     :class="`-${workshift.status}`"
                                >
                                  <template v-if="workshift.model">
                                    <div class="workshifts-table-profile"
                                         :class="{'cursor-pointer' : userPermissions.operator.profile.view}"
                                         :id="`shift-${item.id}-${workshift.id}`"
                                         @click.stop="openAssignOperator({operator: item, model: workshift.model})"
                                    >
                                      <div class="workshifts-table-profile-main">
                                        <avatar class="workshifts-table-profile-main-avatar"
                                                :url="workshift.model.avatar"
                                                :telegram="workshift.model.telegram_connected"
                                                :is-fin-admin="workshift.model.is_fin_admin"
                                        />
                                        <div class="workshifts-table-profile-main-name">
                                          <span v-if="workshift.model.surname">{{ workshift.model.surname }}</span>
                                          <div v-else-if="workshift.model.model_nickname"
                                               class="d-flex align-items-center">
                                            <at class="flex-shrink-0 mr-1"/>
                                            <div class="workshifts-table-profile-main-name">
                                              <b>{{ workshift.model.model_nickname }}</b>
                                            </div>
                                          </div>
                                          <span v-else class="text-gray text-fw-400">{{ workshift.model.uid }}</span>
                                          <p v-if="areWagesActive"
                                             class="text-gray-text text-size-small text-fw-400 mb-0">$
                                            {{ workshift.incomes || 0 }}</p>
                                        </div>
                                      </div>
                                      <template v-if="workshift.isPotential">
                                        <div class="abc-checkbox workshifts-table-checkbox -fixed -transparent"
                                             :class="{'-error': workshift.operator, '-square': !workshift.access}"
                                             :id="`shift-checkbox-${workshift.id}-${index}-${indexCol}`"
                                             @click.stop
                                        >
                                          <input v-model="chosenShifts"
                                                 :id="`potential_shift-${workshift.id}`"
                                                 type="checkbox"
                                                 :value="workshift.checkboxValue"
                                                 :disabled="!workshift.access"
                                          />
                                          <label :for="`potential_shift-${workshift.id}`"></label>
                                        </div>
                                        <b-tooltip v-if="workshift.operator"
                                                   :target="`shift-checkbox-${workshift.id}-${index}-${indexCol}`"
                                                   triggers="hover"
                                                   placement="top"
                                                   custom-class="workshifts-table-tooltip"
                                                   boundary="window"
                                        >
                                          <p class="mb-0">У модели в этой смене уже есть оператор:</p>
                                          <p class="mb-0 text-center">
                                            <b v-if="workshift.operator.fullname"
                                               class="text-gray mr-1">{{ workshift.operator.uid }}</b>
                                            <b>{{ workshift.operator.fullname || workshift.operator.uid }}</b>
                                          </p>
                                        </b-tooltip>
                                      </template>
                                      <i v-else class="flaticon flaticon-close-sm workshifts-table-profile-remove"
                                         @click.stop="removeOperator(workshift, item.models, col.id, model)"/>
                                    </div>
                                    <b-tooltip v-if="!workshift.isPotential"
                                               :target="`shift-${item.id}-${workshift.id}`"
                                               triggers="hover"
                                               placement="top"
                                               custom-class="workshifts-table-tooltip hidden-below_lg"
                                               boundary="window"
                                    >
                                      <group-info :group="workshift.group"/>
                                      <div v-if="workshift.cancel" class="mt-2">
                                        <span class="mr-1">Причина отмены:</span>
                                        <span class="text-gray-text">{{ workshift.cancel.title }}</span>
                                      </div>
                                      <p class="text-gray mb-0 pt-2">{{ workshift.start_at || workshift.planned_start_at }} - {{ workshift.end_at || workshift.planned_end_at }}</p>
                                      <div v-if="workshift.incomes_by_resource && workshift.incomes_by_resource.length"
                                           class="free_models-card-table-body-row-cell-shift-tooltip-resource_incomes">
                                        <div v-for="income in workshift.incomes_by_resource">
                                          <span class="text-gray">{{income.resource_short_title}}</span>
                                          <span class="text-gray ml-2">${{income.sum}}</span>
                                        </div>
                                      </div>
                                      <p class="mb-0 pt-2">
                                        <span class="free_models-card-table-body-row-cell-shift-tooltip-status"
                                              :class="`-${workshift.status}`"
                                        >{{ workshiftStatuses[workshift.status] }}</span></p>
                                    </b-tooltip>
                                  </template>
                                </div>
                              </template>
                              <template v-else>
                                <div v-if="item.shiftAbsences[col.id]" class="workshifts-operators_table-day-shifts-shift-absence">
                                  <first-aid-kit v-if="item.shiftAbsences[col.id].type === 'sick_leave'"/>
                                  <palm v-else-if="item.shiftAbsences[col.id].type === 'vacation'"/>
                                  <pocker-face v-else/>
                                  <span class="ml-1">{{ absenceTypes[item.shiftAbsences[col.id].type] }}</span>
                                </div>
                              </template>
                            </td>
                          </tr>
                        </template>
                        <tr v-else
                            class="workshifts-table-row"
                            :key="item.id"
                            @mouseenter.stop="onHoverOperator(item.id)"
                        >
                          <td v-for="(col, indexCol) in columnsOperatorsWorkshifts"
                              :key="col.id"
                              @click="openAssignOperator({operator: item})"
                          >
                            <template v-if="col.id === 'operator'">
                              <div class="workshifts-table-profile"
                                   :class="{'-operator' : userPermissions.model.profile.view}"
                                   @click.stop="openAssignOperator({operator: item})"
                              >
                                <div v-if="!Array.isArray(potentialOperatorsSchedule[office.id])"
                                     class="abc-checkbox workshifts-table-profile-main-operator_checkbox"
                                     :class="pairsAssigning ? '-active' : '-inactive'"
                                     @click.stop>
                                  <template v-if="item.hasPotentialShifts">
                                    <input type="checkbox"
                                           v-model="operatorRowsStatuses[item.id]"
                                           :id="`checkbox_${item.id}`"
                                           :readonly="!pairsAssigning"
                                           @change="toggleOperatorsShifts(item.id, office.id)">
                                    <label :for="`checkbox_${item.id}`"></label>
                                  </template>
                                  <div v-else class="pt-2 pb-2"/>
                                </div>
                                <div class="workshifts-table-profile-main mr-auto"
                                     :class="{'ml-3': pairsAssigning}">
                                  <avatar class="workshifts-table-profile-main-avatar"
                                          :url="item.avatar"
                                          :telegram="item.telegram_connected"
                                          :is-fin-admin="item.is_fin_admin"
                                  />
                                  <div class="workshifts-table-profile-main-name">
                                    <p v-if="item.surname" class="mb-0">{{ item.surname }}</p>
                                    <p v-else class="text-gray mb-0">{{ item.uid }}</p>
                                    <p v-if="areWagesActive" class="text-gray-text text-size-small text-fw-400 mb-0">$
                                      {{ item.sum || 0 }}</p>
                                  </div>
                                </div>
                              </div>
                            </template>
                            <template v-else>
                              <div v-if="item.shiftAbsences[col.id]" class="workshifts-operators_table-day-shifts-shift-absence">
                                <first-aid-kit v-if="item.shiftAbsences[col.id].type === 'sick_leave'"/>
                                <palm v-else-if="item.shiftAbsences[col.id].type === 'vacation'"/>
                                <pocker-face v-else/>
                                <span class="ml-1">{{ absenceTypes[item.shiftAbsences[col.id].type] }}</span>
                              </div>
                            </template>
                          </td>
                        </tr>
                      </template>
                    </template>
                  </template>
                </template>
              </scrolling-table>
              <div v-else class="workshifts-edit-main-empty -sm">
                <h3>Расписание не найдено</h3>
                <span>Добавьте сотрудников в офис, чтобы добавить им расписание</span>
              </div>
            </b-collapse>
          </div>
        </div>
        <div v-if="pairsAssigning" class="free_operators-actions">
          <b-button variant="outline-primary" class="pl-4 pr-4" @click="closePairAssigning">Отменить</b-button>
          <b-button variant="primary" class="pl-4 pr-4" @click="updateShifts()">Применить все выбранные смены</b-button>
        </div>
      </div>
    </template>
    <b-modal id="confirm_modal"
             centered
             body-bg-variant="white"
             header-class="workshifts-table-confirm_modal-header"
             body-class="workshifts-table-confirm_modal-body"
             footer-class="workshifts-table-confirm_modal-footer"
    >
      <template #modal-title>
        <h5>{{modalText.header}}</h5>
      </template>
      <span class="fw-400">{{modalText.body}}</span>
      <template #modal-footer>
        <div class="m-0">
          <b-button variant="outline-primary" class="pl-4 pr-4" @click="$bvModal.hide('confirm_modal')">Отменить</b-button>
          <b-button variant="primary" class="confirm-button pl-4 pr-4" @click="applyShiftsForOperator()">Назначить</b-button>
        </div>
      </template>
    </b-modal>
    <b-modal id="payment-pin-check-modal" hide-footer centered dialog-class="free_models-past_workshifts-pin_modal">
      <pin-input v-model="pin" title="Введите PIN-код" class="-modal" :error="paymentPinError" @change="onChangePin" @input="onInputPin" />
    </b-modal>
  </div>
</template>

<script>
import VueScrollingTable from "vue-scrolling-table";
import FreeOperators from "../FreeOperators";
import Avatar from "@/components/Common/Avatar/Avatar";
import GroupInfo from "@/components/Common/GroupInfo";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import PinInput from "@/components/Common/PinInput.vue";
import throbber from "@/assets/vue-svg/throbber.svg";
import success from "@/assets/vue-svg/success.svg";
import at from "@/assets/vue-svg/at.svg";
import pockerFace from "@/assets/vue-svg/pocker-face.svg";
import palm from "@/assets/vue-svg/palm.svg";
import firstAidKit from "@/assets/vue-svg/first-aid-kit.svg";
import { showToast } from "@/tools/tools";
import moment from "moment";

export default {
  name: "OperatorsWorkshifts",
  components: {
    'scrolling-table': VueScrollingTable,
    'free-operators': FreeOperators,
    Avatar,
    GroupInfo,
    ButtonThrobber,
    PinInput,
    'throbber': throbber,
    'success': success,
    'at': at,
    'pocker-face': pockerFace,
    'palm': palm,
    'first-aid-kit': firstAidKit,
  },
  props: {
    officesList: {
      type: Array
    },
    activeGroup: {
      type: Object
    },
    activeOperatorsDate: String,
  },
  data() {
    return {
      collapseStateOffice: {},
      showOperatorsSchedule: true,
      operatorsCollapseStatus: {},
      chosenShifts: [],
      pairsAssigning: false,
      preventPairsAssigningClose: false,
      hoveredOperatorId: null,
      areWagesActive: false,
      height: null,
      activeData: {},
      workshiftStatuses: {
        process: 'В процессе',
        completed: 'Завершена',
        assigned: 'Назначена',
        created: 'Резерв',
        canceled: 'Отменена',
      },
      paymentPinError: '',
      pin: '',
      waitingResponseForPin: false,
    }
  },
  computed: {
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    modalText() {
      return { body: `Оператору: ${this.activeData?.operator?.uid} ${this.activeData?.operator?.surname} будут назначены смены с моделью ${this.activeData?.model?.surname}.`,
        header: `Назначить оператору: ${this.activeData?.operator?.uid} ${this.activeData?.operator?.surname} выбранные смены?`}
    },
    absenceTypes() {
      return this.$store.state.dictionaries.absenceTypes;
    },
    operatorsSchedule() {
      return this.$store.state.schedule.operatorsSchedule;
    },
    potentialOperatorsSchedule() {
      return this.$store.state.schedule.potentialOperatorsSchedule;
    },
    status() {
      return this.$store.state.schedule.status;
    },
    hideActionsOperatorWorkshifts() {
      return !this.officesList.length || this.status === 'request-operators'
    },
    loadOperatorsWorkshifts() {
      return this.$store.state.schedule.loadOperatorsWorkshifts;
    },
    columnsOperatorsWorkshifts() {
      let columns = [{id: 'operator', title: 'Оператор'}]
      let date = moment(this.activeOperatorsDate);
      if (date.weekday() !== 6) date.weekday(-1);
      for (let i = 0; i < 7; i++) {
        columns.push({
          id: date.format('YYYY-MM-DD').toString(),
          title: date.format('ddd').toString() + ' ' + date.format('DD.MM').toString(),
        })
        date.add(1, 'd');
      }
      return columns
    },
    tableDataOperatorsWorkshifts() {
      let officesOperatorsWorkshifts = {};
      for (let officeId in this.operatorsSchedule) {
        if (!this.operatorsSchedule[officeId]) {
          officesOperatorsWorkshifts[officeId] = {
            assignedOperators: [],
            operatorsWithoutWorkshifts: [],
            missingOperators: [],
            sum: 0,
            sumsByDate: {},
          };
          continue;
        }

        const assignedOperators = [];
        const operatorsWithoutWorkshifts = [];
        const missingOperators = [];
        let sum = 0;
        const sumsByDate = {};

        for (let operatorId in this.operatorsSchedule[officeId]) {
          const operator = this.operatorsSchedule[officeId][operatorId];
          const operatorData = {
            ...operator,
            id: operatorId,
            hasPotentialShifts: false,
            sum: 0,
            models: [],
            shiftAbsences: {},
          };

          operator.absences.forEach(absence => {
            const start = moment.utc(absence.start_at).format('YYYY-MM-DD');
            const end = moment.utc(absence.end_at).format('YYYY-MM-DD');
            const current = moment(start);
            while (current.isSameOrBefore(end)) {
              const date = current.format('YYYY-MM-DD');
              operatorData.shiftAbsences[date] = {
                start_at: absence.start_at,
                end_at: absence.end_at,
                type: absence.type,
              };
              current.add(1, 'day');
            }
          });

          let isWithoutWorkshifts = false;

          for (let column of this.columnsOperatorsWorkshifts) {
            const dateShifts = operator.workshifts[column.id];
            if (dateShifts?.length) {
              dateShifts.forEach(shift => {
                let modelEntry = operatorData.models.find(model => model.id === shift.model.id);
                if (!modelEntry) {
                  modelEntry = {
                    ...shift.model,
                    date: column.id,
                    absence: null,
                    workshifts: [],
                    shifts: {},
                  };
                  operatorData.models.push(modelEntry);
                }
                Array.isArray(modelEntry.shifts[column.id]) ? modelEntry.shifts[column.id].push(shift) : modelEntry.shifts[column.id] = [shift];
                modelEntry.workshifts.push(shift);
              });

              const operatorSumForDay = dateShifts.reduce((currentSum, shift) => (shift.incomes || 0) + currentSum, 0);
              operatorData.sum = Math.round((operatorData.sum + operatorSumForDay) * 100) / 100;
              sumsByDate[column.id] = Math.round(((sumsByDate[column.id] || 0) + operatorSumForDay) * 100) / 100;
              sum = Math.round((sum + operatorSumForDay) * 100) / 100;
            }

            if (Object.keys(operatorData.shiftAbsences).length < 7) {
              isWithoutWorkshifts = true;
            }

            if (!this.pairsAssigning) continue;

            const potentialShifts = this.potentialOperatorsSchedule[officeId]?.[operatorId]?.workshifts[column.id];
            const filteredPotentialShifts = potentialShifts?.filter(shift => shift.access === true || shift.operator);
            if (filteredPotentialShifts?.length) {
              filteredPotentialShifts.forEach(shift => {
                let modelEntry = operatorData.models.find(model => model.id === shift.model.id);
                if (!modelEntry) {
                  modelEntry = {
                    ...shift.model,
                    date: column.id,
                    absence: null,
                    workshifts: [],
                    shifts: {},
                  };
                  operatorData.models.push(modelEntry);
                }

                const formattedShift = {
                  ...shift,
                  isPotential: true,
                  checkboxValue: JSON.stringify({
                    id: shift.id,
                    operator_id: operatorId,
                  }),
                };

                Array.isArray(modelEntry.shifts[column.id]) ? modelEntry.shifts[column.id].push(formattedShift) : modelEntry.shifts[column.id] = [formattedShift];
                modelEntry.workshifts.push(formattedShift);
                modelEntry.hasPotentialShifts = true;
              });

              operatorData.hasPotentialShifts = true;
            }
          }

          if (operator.count_workshift) {
            assignedOperators.push(operatorData);
          } else {
            if (isWithoutWorkshifts) {
              operatorsWithoutWorkshifts.push(operatorData);
            } else {
              missingOperators.push(operatorData);
            }
          }
        }
        officesOperatorsWorkshifts[officeId] = {
          assignedOperators,
          operatorsWithoutWorkshifts,
          missingOperators,
          sumsByDate,
          sum,
        };
      }

      return officesOperatorsWorkshifts;
    },
    pairCreatePermission() {
      return this.userPermissions.setup.workshift.operator ||
          this.userPermissions.schedule.operator.workshifts.yours ||
          this.userPermissions.schedule.operator.workshifts.all;
    },
    dataForButtons() {
      const data = {};
      const cellHeight = this.areWagesActive ? 41 : 33;
      const groups = ['assignedOperators', 'operatorsWithoutWorkshifts', 'missingOperators'];

      for (const officeId in this.tableDataOperatorsWorkshifts) {
        data[officeId] = {};

        for (const group of groups) {
          const operators = this.tableDataOperatorsWorkshifts[officeId][group] || [];

          for (const operatorData of operators) {
            const buttonData = {
              models: {},
              modelsHeights: {},
              operatorId: operatorData.id,
              height: `${cellHeight}px`,
            };
            const maxShiftsInDayByModel = {};

            for (const model of operatorData.models) {
              if (!buttonData.models[model.id]) {
                buttonData.models[model.id] = [];
              }

              for (const date in model.shifts) {
                model.shifts[date].forEach(shift => {
                  if (shift.access && shift.isPotential) {
                    buttonData.models[model.id].push(JSON.stringify({id: shift.id, operator_id: operatorData.id,}));
                  }
                });
                maxShiftsInDayByModel[model.id] = Math.max((maxShiftsInDayByModel[model.id] || 0), model.shifts[date].length);
              }
            }

            let operatorHeight = 0;
            for (const model in maxShiftsInDayByModel) {
              operatorHeight += maxShiftsInDayByModel[model] * cellHeight + 1;
              buttonData.modelsHeights[model] = `${maxShiftsInDayByModel[model] * cellHeight}px`;
            }

            if (operatorHeight) buttonData.height = `${operatorHeight - 1}px`;

            if (!this.operatorsCollapseStatus[officeId][group]) {
              data[officeId][group] = {};
            } else {
              if (!data[officeId][group]) {
                data[officeId][group] = [];
              }
              data[officeId][group].push(buttonData);
            }
          }
        }
      }
      return data;
    },
    fullPageSum() {
      if (!this.areWagesActive || !this.tableDataOperatorsWorkshifts) return 0;
      return Math.round(Object.values(this.tableDataOperatorsWorkshifts).reduce((sum, group) => sum + group.sum, 0) * 100) / 100;
    },
    allPotentialShiftsSelected: {
      get() {
        for (const operatorId in this.operatorRowsStatuses) {
          if (!this.operatorRowsStatuses.hasOwnProperty(operatorId)) continue;
          if (!this.operatorRowsStatuses[operatorId]) {
            return false;
          }
        }
        return true;
      },
      set(value) {
        const newChosenShifts = [];
        if (value) {
          for (let officeId in this.potentialOperatorsSchedule) {
            for (let operatorId in this.potentialOperatorsSchedule[officeId]) {
              for (let period in this.potentialOperatorsSchedule[officeId][operatorId].workshifts) {
                for (let shift of this.potentialOperatorsSchedule[officeId][operatorId].workshifts[period]) {
                  if (shift.access) {
                    newChosenShifts.push(JSON.stringify({
                      id: shift.id,
                      operator_id: operatorId,
                    }));
                  }
                }
              }
            }
          }
        }
        this.chosenShifts = newChosenShifts;
      }
    },
    operatorRowsStatuses() {
      const statuses = {};

      for (const officeId in this.potentialOperatorsSchedule) {
        if (!this.potentialOperatorsSchedule.hasOwnProperty(officeId)) continue;

        for (const operatorId in this.potentialOperatorsSchedule[officeId]) {
          if (!this.potentialOperatorsSchedule[officeId].hasOwnProperty(operatorId)) continue;

          const operator = this.potentialOperatorsSchedule[officeId][operatorId];
          const shifts = operator.workshifts;

          let allShiftsSelected = true;

          for (const period in shifts) {
            if (!shifts.hasOwnProperty(period)) continue;

            for (const shift of shifts[period]) {
              const shiftData = {
                id: shift.id,
                operator_id: operatorId
              };

              if (!this.chosenShifts.includes(JSON.stringify(shiftData))) {
                allShiftsSelected = false;
                break;
              }
            }
          }
          statuses[operatorId] = allShiftsSelected;
        }
      }
      return statuses;
    },
  },
  watch: {
    activeGroup: function (newGroup, prevGroup) {
      if (newGroup.id === prevGroup?.id) return;
      this.updateCollapsesStates();
      this.updateOperatorsWorkshifts(newGroup);
      this.chosenShifts = [];
    },
    scheduleStatus: function (newStatus, prevStatus) {
      switch (newStatus) {
        case 'all-assigned':
        case 'assigned':
          showToast(this.$toasted, 'Операторы добавлены в смены');
          if (this.preventPairsAssigningClose) this.preventPairsAssigningClose = false;
          else this.closePairAssigning();
          this.$nextTick(this.updateOperatorsWorkshifts);
          return;
        case 'error':
          if (this.waitingResponseForPin) {
            this.waitingResponseForPin = false;
            this.areWagesActive = false;
            this.updateOperatorsWorkshifts(this.activeGroup, true);
            this.paymentPinError = 'Неверный PIN';
            return;
          }
          showToast(this.$toasted, 'Что-то пошло не так. Пожалуйста попробуйте ещё раз.', 'error');
          return;
        case '':
          if ((prevStatus === 'removing') || (prevStatus === 'removing-operator')) this.$nextTick(this.updateOperatorsWorkshifts);
          if (this.waitingResponseForPin) {
            this.waitingResponseForPin = false;
            this.$bvModal.hide('payment-pin-check-modal');
          }
          return;
      }
    },
    tableDataOperatorsWorkshifts: function (newValue) {
      this.fillOperatorsCollapseStatus();
    },
    activeOperatorsDate() {
      this.updateOperatorsWorkshifts();
      this.chosenShifts = [];
    },
    potentialOperatorsSchedule: function (newSchedule) {
      this.chooseAllPotentialShifts(newSchedule);
    },
    areWagesActive: function (newStatus) {
      if (newStatus) this.updateOperatorsWorkshifts(this.activeGroup, true);
    },
  },
  mounted() {
    this.updateCollapsesStates();
    this.updateOperatorsWorkshifts();
  },
  methods: {
    fillOperatorsCollapseStatus() {
      for (let officeId in this.tableDataOperatorsWorkshifts) {
        this.$set(this.operatorsCollapseStatus, officeId, {
          assignedOperators: true,
          operatorsWithoutWorkshifts: true,
          missingOperators: true,
        });
      }
    },
    openConfirmModal(data) {
      this.activeData = data;
      this.$bvModal.show('confirm_modal');
    },
    toggleOperatorsShifts(operatorId, officeId, value) {
      const isChecked = value || this.operatorRowsStatuses[operatorId];
      for (const date in this.potentialOperatorsSchedule[officeId][operatorId].workshifts) {
        for (const shift of this.potentialOperatorsSchedule[officeId][operatorId].workshifts[date]) {
          const shiftData = {
            id: shift.id,
            operator_id: operatorId
          };
          const shiftString = JSON.stringify(shiftData);
          if (isChecked && !this.chosenShifts.includes(shiftString)) {
            this.chosenShifts.push(shiftString);
          } else if (!isChecked && this.chosenShifts.includes(shiftString)) {
            this.chosenShifts = this.chosenShifts.filter(item => item !== shiftString);
          }
        }
      }
    },
    toggleAllOperatorsShifts() {
      const officeIds = Object.keys(this.potentialOperatorsSchedule);
      for (const officeId of officeIds) {
        if (!this.potentialOperatorsSchedule.hasOwnProperty(officeId)) continue;
        const operatorIds = Object.keys(this.potentialOperatorsSchedule[officeId]);
        for (const operatorId of operatorIds) {
          if (!this.potentialOperatorsSchedule[officeId].hasOwnProperty(operatorId)) continue;
          const isChecked = this.allPotentialShiftsSelected;
          this.toggleOperatorsShifts(operatorId, officeId, isChecked);
        }
      }
    },
    toggleCollapse(officeId, group) {
      this.$set(this.operatorsCollapseStatus[officeId], group, !this.operatorsCollapseStatus[officeId][group]);
    },
    updateOperatorsWorkshifts(group = this.activeGroup, withoutPotential = false) {
      if (!this.showOperatorsSchedule) return this.$nextTick(() => this.$refs['free-operators'].updateLists());
      switch (this.activeGroup.type) {
        case 'office':
          this.$store.dispatch('schedule/fetchOperatorsScheduleForCity', {
            groups: [group],
            query: {
              'workweek': this.activeOperatorsDate,
              without_workshifts: !this.showOperatorsSchedule,
              pin_for_incomes: this.areWagesActive ? this.pin : null,
            },
          });
          if (!withoutPotential) this.$store.dispatch('schedule/fetchPotentialOperatorsScheduleForCity', {
            groups: [group],
            query: {
              'workweek': this.activeOperatorsDate,
              without_workshifts: !this.showOperatorsSchedule,
            },
          });
          break;
        case 'city':
        case 'country':
          this.$store.dispatch('schedule/fetchOperatorsScheduleForCity', {
            groups: this.officesList,
            query: {
              'workweek': this.activeOperatorsDate,
              without_workshifts: !this.showOperatorsSchedule,
              pin_for_incomes: this.areWagesActive ? this.pin : null,
            },
          });
          if (!withoutPotential) this.$store.dispatch('schedule/fetchPotentialOperatorsScheduleForCity', {
            groups: this.officesList,
            query: {
              'workweek': this.activeOperatorsDate,
              without_workshifts: !this.showOperatorsSchedule,
            },
          });
      }
      this.$emit('updateOperatorsDate', this.activeOperatorsDate);
    },
    getOperators() {
      this.$store.dispatch('groups/fetchCurrentGroupOperators', {
        operator_groups: this.officesList.map(office => office.id),
        is_active: 1,
        per_page: 20
      });
    },
    collapseBlock(id) {
      this.$root.$emit('bv::toggle::collapse', id);
    },
    updateCollapsesStates(offices = this.officesList) {
      let collapseStateOffice = {};
      offices.map(office => collapseStateOffice[office.id] = true);
      this.collapseStateOffice = collapseStateOffice;
    },
    openMiniProfile(profile) {
      if ((profile.role === 'model' && this.userPermissions.model.profile.view) || (profile.role === 'operator' && this.userPermissions.operator.profile.view)) this.$emit('open-mini-profile', profile);
    },
    openAssignOperator(data) {
      this.$emit('open-assign-operator', data);
    },
    clickAssignPairs() {
      if (!this.showOperatorsSchedule) return this.$emit('openAssignPairs');
      this.chooseAllPotentialShifts();
      this.pairsAssigning = true;
    },
    chooseAllPotentialShifts(schedule = this.potentialOperatorsSchedule) {
      const chosenShifts = [];
      for (const groupId in schedule) {
        for (const operatorId in schedule[groupId]) {
          for (const period in schedule[groupId][operatorId].workshifts) {
            schedule[groupId][operatorId].workshifts[period].forEach(shift => shift.access && chosenShifts.push(JSON.stringify({
              id: shift.id,
              operator_id: operatorId,
            })));
          }
        }
      }
      this.chosenShifts = chosenShifts;
    },
    closePairAssigning() {
      this.pairsAssigning = false;
    },
    updateShifts(shifts = this.chosenShifts) {
      if (!shifts.length || (this.scheduleStatus === 'assigning')) return;
      this.$store.dispatch('schedule/assignOperator', shifts.map(shiftString => {
        const shift = JSON.parse(shiftString);
        return {
          ...shift,
          operator_id: parseInt(shift.operator_id),
        }
      }));
    },
    toggleShowOperatorsSchedule() {
      this.pairsAssigning = false;
      this.updateOperatorsWorkshifts();
    },
    removeOperator(shift, allShifts, shiftPeriod, model) {
      let isSeveralShifts = false;

      for (const key in model.shifts) {
        if (key !== shiftPeriod && Array.isArray(model.shifts[key]) && model.shifts[key].length > 0) {
          isSeveralShifts = true;
          break;
        }
      }

      if (!isSeveralShifts) return this.$emit('remove-operator-from-shift', shift);
      this.$emit('click-remove-operator', { ...shift, period: shiftPeriod });
    },
    applyShiftsForOperator() {
      this.preventPairsAssigningClose = true;
      let operator = this.dataForButtons[this.activeData.officeId][this.activeData.group].find(operator => operator.operatorId === this.activeData.operator.id);
      this.$bvModal.hide('confirm_modal');
      return this.updateShifts(operator.models[this.activeData.model.id].filter(shift => this.chosenShifts.includes(shift)));
    },
    onHoverOperator(operatorId) {
      this.$nextTick(() => this.hoveredOperatorId = operatorId);
    },
    onStopHoveringOperator() {
      this.hoveredOperatorId = null;
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
  }
}
</script>