<template>
  <b-form class="group_creation" @submit.prevent="submitForm">
    <div class="group_creation-header">
      <b-button size="sm" variant="outline-primary" id="group-create-submit" type="submit">Создать группу</b-button>
    </div>
    <div class="group_creation-main">
      <div class="group_creation-main-title">
        <modal-title
            v-model="group.title"
            :max-width="'100%'"
            :min-width="'20px'"
            :placeholder="'Название группы'"
            :required="true"
            :field="'title'"
            id="group-create-title"
            @setTitle="setTitle"
        />
      </div>
      <div class="group_creation-main-details">
        <custom-select v-model="group.type" :options="groupTypes" id="group-create-type"/>
        <color-picker v-model="group.color" class="group_creation-main-details-color_picker" id="group-create-color"
                      title="Цвет группы"/>
      </div>
      <div v-if="group.type === 'office'" class="group_creation-main_block">
        <div class="group_creation-main_block-text">
          <h4>Основные параметры</h4>
        </div>
        <div class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Код группы</b>
          </div>
          <div class="col-6">
            <input v-model="group.settings.code" class="input-plain" id="settings-code" placeholder="Введите код"/>
          </div>
        </div>
        <div v-if="type !== 'operator'" class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Количество комнат</b>
          </div>
          <div class="col-6">
            <input v-model="group.settings.count_rooms" class="input-plain" id="settings-count_rooms"
                   placeholder="Введите количество" required/>
          </div>
        </div>
      </div>
      <div v-else-if="group.type === 'city'" class="group_creation-main_block">
        <div class="group_creation-main_block-text">
          <h4>Основные параметры</h4>
        </div>
        <div class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Код группы</b>
          </div>
          <div class="col-6">
            <input v-model="group.settings.code" class="input-plain" id="settings-code" placeholder="Введите код"/>
          </div>
        </div>
        <div v-if="group.type === 'city'" class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Часовой пояс</b>
          </div>
          <div class="col-6">
            <custom-select v-model="group.settings.timezone" id="group-create-timezone" :options="timezones"
                           defaultText="Часовой пояс" required/>
          </div>
        </div>
      </div>
      <div v-else-if="group.type === 'country'" class="group_creation-main_block">
        <div class="group_creation-main_block-text">
          <h4>Основные параметры</h4>
        </div>
        <div v-if="group.type === 'city'" class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Часовой пояс</b>
          </div>
          <div class="col-6">
            <custom-select v-model="group.settings.timezone" id="group-create-timezone" :options="timezones"
                           defaultText="Часовой пояс" required/>
          </div>
        </div>
        <div class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Код телефона</b>
          </div>
          <div class="col-6">
            <input v-model="group.settings.phone_code" class="input-plain" id="group-create-phone_code"
                   placeholder="Введите код" :required="group.type === 'country'"/>
          </div>
        </div>
        <div class="group_creation-main_block-text row">
          <div class="col-6">
            <b>Количество символов в номере</b>
          </div>
          <div class="col-6">
            <input v-model="group.settings.length_phone" class="input-plain" id="group-create-length_phone"
                   placeholder="Введите количество"/>
          </div>
        </div>
      </div>
      <template v-if="group.type === 'city'">
        <!--                <div class="group_creation-main_block">
                            <div class="group_creation-main_block-text">
                                <h4>Настройки обработки заявки</h4>
                                <p>Выберите виды тестирования, которые необходимо проводить при обработки Заявки</p>
                            </div>
                            <div class="group_creation-main_block-fields">
                                <div class="group_creation-main_block-fields-field">
                                    <span>Психологическое тестирование</span>
                                    <b-form-group class="abc-checkbox m-0">
                                        <input id="psych_enabled" type="checkbox" v-model="group.settings.psych_enabled"/>
                                        <label for="psych_enabled"></label>
                                    </b-form-group>
                                </div>
                                <div class="group_creation-main_block-fields-field">
                                    <span>Видео тестирование</span>
                                    <b-form-group class="abc-checkbox m-0">
                                        <input id="video_enabled" type="checkbox" v-model="group.settings.video_enabled"/>
                                        <label for="video_enabled"></label>
                                    </b-form-group>
                                </div>
                            </div>
                        </div>-->
        <div class="group_creation-main-time_periods">
          <h4>Настройки смен</h4>
          <p class="group_creation-main-time_periods-title">Настройте обязательное количество смен и время периодов</p>
          <div class="group_creation-main-time_periods-quantity">
            <div class="group_creation-main-time_periods-quantity-title">Минимальное количество смен</div>
            <input v-model="group.settings.min_shifts" class="group_creation-main-time_periods-quantity-value"
                   id="group-create-min_shifts" type="number" placeholder="0"
                   v-autowidth="{maxWidth: '20px', minWidth: '8px', comfortZone: 8}">
          </div>
          <div v-for="(period, key) in group.settings.work_shift" :key="key"
               class="group_creation-main-time_periods-period">
            <div class="group_creation-main-time_periods-period-title">Период {{ key + 1 }}</div>
            <div class="group_creation-main-time_periods-period-time_period">
              <div class="group_creation-main-time_periods-period-time_period-first">
                <p>C</p>
                <date-picker v-model="period.from" class="hide_styles_datepicker" :id="`group-create-shift-${key}-from`"
                             lang="ru" type="time" placeholder="00:00" :time-picker-options="time_periods"
                             format="HH:mm">
                  <i style="display: none;" slot="calendar-icon"/>
                </date-picker>
                <span class="glyphicon glyphicon-time"/>
              </div>
              <div class="group_creation-main-time_periods-period-time_period-second">
                <p>До</p>
                <date-picker v-model="period.to" class="hide_styles_datepicker" :id="`group-create-shift-${key}-to`"
                             lang="ru" type="time" placeholder="00:00" :time-picker-options="time_periods"
                             format="HH:mm">
                  <i style="display: none;" slot="calendar-icon"/>
                </date-picker>
                <span class="glyphicon glyphicon-time"/>
              </div>
              <div v-if="group.settings.work_shift.length > 1"
                   class="group_creation-main-time_periods-period-delete btn-remove"
                   :id="`group-create-shift-${key}-delete`" @click="deletePeriod(period)"/>
            </div>
          </div>
          <div class="group_creation-main-time_periods-add_period" id="group-create-shift-add" @click="addPeriod">
            <p class="group_creation-main-time_periods-add_period-text">Добавить период</p>
            <div class="group_creation-main-time_periods-add_period-image btn-add"/>
          </div>
        </div>
      </template>
      <div class="group_creation-main-users">
        <div class="group_creation-main-users-img icon-group"></div>
        <h3>Нет добавленных сотрудников</h3>
        <p>Создайте группу, чтобы добавить в неё сотрудника</p>
      </div>
    </div>
  </b-form>
</template>

<script>
import moment from 'moment';
import {mapState, mapActions} from "vuex";
import ColorPicker from "@/components/Common/ColorPicker/ColorPicker";
import ModalTitle from "@/components/Common/ModalTitle/ModalTitle";
import DatePicker from 'vue2-datepicker';
import Select from "@/components/Common/Select/Select";
import {pluralizeWords} from "@/tools/tools";

export default {
  name: 'group-creation',
  props: {
    parentGroup: Object,
    type: String,
  },
  components: {
    'color-picker': ColorPicker,
    'custom-select': Select,
    'date-picker': DatePicker,
    'modal-title': ModalTitle
  },
  data() {
    return {
      moment: moment,
      time_periods: {start: '00:00', step: '00:30', end: '23:30'},
      defaultGroup: {
        color: '#1A86D0',
        settings: {
          work_shift: [
            {from: '1970-01-01T11:00:00', to: '1970-01-01T17:00:00'},
            {from: '1970-01-01T17:00:00', to: '1970-01-01T23:00:00'},
            {from: '1970-01-01T23:00:00', to: '1970-01-01T05:00:00'},
          ],
          psych_enabled: false,
          video_enabled: false,
          min_shifts: 4
        },
      },
      group: {},
    }
  },
  computed: {
    ...mapState('groups', ['status']),
    ...mapState('dictionaries', ['timezones']),
    groupTypes() {
      let result = {...this.$store.state.groups.groupTypes}
      if (!this.parentGroup) {
        delete result.city
        delete result.office
      } else if (this.parentGroup.type === 'country') {
        delete result.country
        delete result.office
      } else if (this.parentGroup.type === 'city') {
        delete result.country
        delete result.city
      } else if (this.parentGroup.type === 'office') {
        delete result.country
        delete result.city
        delete result.office
      }
      return result
    }
  },
  watch: {
    status: function (nextStatus, prevStatus) {
      if ((prevStatus === 'creating') && (nextStatus === '')) this.group = {...this.defaultGroup};
    }
  },
  created() {
    let group = {...this.defaultGroup};
    if (this.parentGroup) group.color = this.parentGroup.color;
    this.group = group;
  },
  methods: {
    ...mapActions('groups', ['createGroup']),
    setTitle(event) {
      this.group.title = event
    },
    submitForm(e) {
      e.preventDefault();
      if (this.status === 'creating') return;
      let group = JSON.parse(JSON.stringify(this.group))
      group.settings.work_shift = group.settings.work_shift.map(function (shift) {
        shift.from = moment(shift.from).format('HH:mm')
        shift.to = moment(shift.to).format('HH:mm')
        return shift
      })
      group.parent = this.parentGroup ? this.parentGroup.id : undefined;
      group.settings.min_shifts = Number(group.settings.min_shifts)
      if (!group.type || (group.type === 'undefined')) delete group.type;
      if (group.settings.length_phone) group.settings.length_phone = parseInt(group.settings.length_phone);
      if (group.settings.count_rooms) group.settings.count_rooms = parseInt(group.settings.count_rooms);
      if (group.type === 'office') group.sub_type = (this.type === 'operator') ? 'operator' : 'model';
      this.createGroup(group);
    },
    addPeriod(period) {
      this.group.settings.work_shift.push({from: '1970-01-01T00:00:00', to: '1970-01-01T00:00:00'})
    },
    deletePeriod(period) {
      let periodsCopy = [...this.group.settings.work_shift],
          deletedPeriodsIndex = periodsCopy.findIndex((oldPeriod) => {
            return oldPeriod === period
          })
      if (deletedPeriodsIndex === -1) return
      periodsCopy.splice(deletedPeriodsIndex, 1)
      this.group.settings.work_shift = periodsCopy
    },
    pluralizeHours(hour) {
      return pluralizeWords(hour, ['час', 'часа', 'часов']);
    },
  }
}
</script>