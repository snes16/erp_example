<template>
  <div class="free_models">
    <div v-if="statusFreeModels === 'request'" class="free_models-info">
      <throbber class="throbber"/>
      <span class="free_models-info-load">Список моделей загружается, пожалуйста, подождите</span>
    </div>
    <div v-else-if="statusFreeModels === 'access-denied'" class="free_models-info">
      <h3 class="free_models-info-access_denied">У вас нет доступа <br/> к отображению моделей</h3>
    </div>
<!--    <div
        v-else-if="(activeGroup.type !== 'city' && activeGroup.type !== 'office') || (freeModels && !freeModels.length)"
        class="free_models-info">
      <h3>Модели без смен не найдены</h3>
      <span class="free_models-info-empty">Для отображения моделей без смены выберите страну и город или офис</span>
    </div>-->
    <div v-else class="card">
      <div class="free_models-search">
        <b-input-group>
          <b-input-group-text slot="append"><search/></b-input-group-text>
          <b-form-input v-model="searchString" id="free-models-search-input" type="text" placeholder="Поиск"></b-form-input>
        </b-input-group>
      </div>
      <div class="free_models-tabs">
        <div class="free_models-tabs-tab"
             :class="{'-active': activeTab === 'without_workshifts'}"
             @click="setActiveTab('without_workshifts')"
        >
          Без назначенных смен ({{ freeModelsCount.without_workshifts }})
        </div>
        <div class="free_models-tabs-tab"
             :class="{'-active': activeTab === 'absent'}"
             @click="setActiveTab('absent')"
        >
          Отсутствующие модели ({{ freeModelsCount.absent }})
        </div>
        <div class="free_models-tabs-tab"
             :class="{'-active': activeTab === 'inactive'}"
             @click="setActiveTab('inactive')"
        >
          Неактивные модели ({{ freeModelsCount.inactive }})
        </div>
      </div>
      <div class="free_models-tabs -mobile navbar-light" @click="toggleCollapse">
        <div class="free_models-tabs-tab -active -mobile">
          <span>{{ activeTabTitle }}</span>
          <button type="button" class="navbar-toggler free_models-tabs-tab-button">
            <span class="navbar-toggler-icon free_models-tabs-tab-button-icon"></span>
          </button>
        </div>
      </div>
      <b-collapse v-model="collapseStatus" id="" class="workshifts-header-config_collapse">
        <div class="workshifts-header-config_collapse-sections-section" @click="setActiveTab('without_workshifts')">
          <span>Без назначенных смен ({{ freeModelsCount.without_workshifts }})</span>
        </div>
        <div class="workshifts-header-config_collapse-sections-section" @click="setActiveTab('absent')">
          <span>Отсутствующие модели ({{ freeModelsCount.absent }})</span>
        </div>
        <div class="workshifts-header-config_collapse-sections-section" @click="setActiveTab('inactive')">
          <span>Неактивные модели ({{ freeModelsCount.inactive }})</span>
        </div>
      </b-collapse>
      <template v-if="filteredFreeModels && filteredFreeModels.length">
        <div class="free_models-list">
          <div class="free_models-list-container">
            <div class="free_models-list-row -head">
              <div class="free_models-list-row-cell -model">Модель</div>
              <div class="free_models-list-row-cell -phone">Телефон</div>
              <div class="free_models-list-row-cell -office">
                <span v-if="activeGroup.type === 'city'">Офис</span>
              </div>
              <div class="free_models-list-row-cell -checkbox" :class="{'-offset': isOverflow}">
              </div>
            </div>
            <div class="free_models-list-body" ref="models-list-body">
              <div class="free_models-list-container" ref="models-list-container">
                <!--                            TODO change div on template-->
                <div v-for="model in filteredFreeModels"
                     v-if="model !== undefined"
                     class="free_models-list-row"
                     :key="model.id"
                >
                  <div class="free_models-list-row-cell -avatar">
                    <avatar class="mr-3"
                            size="-lg"
                            :url="model.avatar"
                            :telegram="model.telegram_connected"
                            :is-fin-admin="model.is_fin_admin"
                    />
                  </div>
                  <div class="free_models-list-row-cell -model" @click="openSchedule(model)">
                    <div class="free_models-list-row-cell-information">
                      <div class="free_models-list-row-cell-information-personal">
                        <div class="d-flex align-items-center">
                          <b class="text-gray mr-1">{{ model.uid }}</b>
                          <b v-if="model.fullname">{{ model.fullname }}</b>
                          <div v-else class="d-flex align-items-center">
                            <at class="mr-1"/>
                            <b>{{ model.model_nickname }}</b>
                          </div>
                        </div>
                        <template v-if="model.new_model">
                          <div class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2" :id="`new-user-free-models-${model.id}`"/>
                          <b-tooltip :target="`new-user-search-${model.id}`" triggers="hover" placement="top">
                            <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                          </b-tooltip>
                        </template>
                        <div v-if="model.is_solo" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло</div>
                      </div>
                      <div class="free_models-list-row-cell-information-shifts">
                        {{ getNumberOfShifts(model.count_workshifts) }}
                        <template v-if="model.absences.length && model.has_credentials">
                          <div v-for="absence in getAbsenceTitle(model.absences)">
                            <b class="text-gray mr-1">
                              <absence/>
                              {{ absence }}</b>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                  <div class="free_models-list-row-cell -phone">{{ model.phone }}</div>
                  <div class="free_models-list-row-cell -office">
                    <div v-if="activeGroup.type === 'city'" class="d-flex align-items-center">
                      <div v-if="model.main_group"
                           class="groups-nav-list-group-container-color mr-2"
                           :style="`background-color: ${model.main_group.color};`"></div>
                      <div class="workshifts-filters-groups-group-title">{{ model.main_group.office }}</div>
                    </div>
                  </div>
                  <div class="free_models-list-row-cell -checkbox">
                    <div class="workshift_details-body-main-services-service-block-copy" :id="`model-link-copy-${model.id}`">
                      <copy class="workshift_details-body-main-services-service-block-copy-icon"
                            :class="{'-disabled': !model.has_credentials}"
                            @click="generateLink(model)"
                      />
                    </div>
                    <b-tooltip :target="`model-link-copy-${model.id}`"
                               triggers="hover"
                               boundary="viewport"
                               :delay="{ 'show': 150, 'hide': 0 }"
                               placement="top"
                               custom-class="free_models-list-row-cell-tooltip"
                    >
                      <span v-if="!model.has_credentials">Нет активных аккаунтов</span>
                      <div v-else-if="model.link" class="free_models-list-row-cell-tooltip-copy">
                        <span>{{ model.link }}</span>
                        <copy class="free_models-list-row-cell-tooltip-copy-icon" @click="copyLink(model.link)"/>
                      </div>
                      <div v-else-if="model.linkStatus === 'loading'" class="free_models-list-row-cell-tooltip-loading">
                        <span>Загрузка</span>
                        <throbber-white class="throbber free_models-list-row-cell-tooltip-loading-throbber"/>
                      </div>
                      <span v-else>Ссылка на расписание</span>
                    </b-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="freeModels && freeModels.length" class="free_models-info">
        <h3>Модели с таким именем не найдены</h3>
        <span class="free_models-info-empty">Попробуйте ввести другое имя</span>
      </div>
      <div v-else class="free_models-info">
        <h3>{{ emptyStateTitle }} не найдены</h3>
        <span class="free_models-info-empty">Для отображения моделей без смены выберите страну и город или офис</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import Avatar from "@/components/Common/Avatar/Avatar";
import Bell from '@/assets/vue-svg/bell.svg';
import throbber from "@/assets/vue-svg/throbber.svg";
import throbberWhite from "@/assets/vue-svg/throbber-white.svg";
import absence from "@/assets/vue-svg/absence.svg";
import copy from "@/assets/vue-svg/copy-transparent.svg";
import at from "@/assets/vue-svg/at.svg";
import {clipboard, pluralize, showToast} from '@/tools/tools';
import search from "@/assets/vue-svg/search.svg";

export default {
  name: 'freeModels',
  components: {
    'avatar': Avatar,
    'bell': Bell,
    'throbber': throbber,
    'throbber-white': throbberWhite,
    'absence': absence,
    'copy': copy,
    'at': at,
    'search': search,
  },
  props: {
    value: String,
    activeGroup: Object,
    activeFreeModelsDate: String,
  },
  data() {
    return {
      searchString: '',
      collapseStateOffice: {},
      isOverflow: false,
      collapseStatus: false,
    }
  },
  computed: {
    activeTab: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    freeModels() {
      return this.$store.state.schedule.freeModels;
    },
    absenceTypes() {
      return this.$store.state.dictionaries.absenceTypes;
    },
    filteredFreeModels() {
      if (this.searchString === '') return this.freeModels;
      let searchString = this.searchString.toLowerCase();
      return this.freeModels.filter((freeModel) => freeModel.fullname?.toLowerCase().includes(searchString) || freeModel.model_nickname?.toLowerCase().includes(searchString));
    },
    filteredActiveFreeModels() {
      return this.filteredFreeModels.length ? this.filteredFreeModels.filter(model => model.has_credentials && !model.absences.length) : [];
    },
    // modelsByAbsence() {
    //     let withAbsence = [],
    //         withoutAbsence = [];
    //
    //     this.filteredFreeModels.forEach(model => model.absences?.length ? withAbsence.push(model) : withoutAbsence.push(model));
    //     return {withAbsence, withoutAbsence};
    // },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    statusFreeModels() {
      return this.$store.state.schedule.statusFreeModels;
    },
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
    freeModelsCount() {
      return this.$store.state.schedule.freeModelsCount;
    },
    emptyStateTitle() {
      switch (this.activeTab) {
        case 'without_workshifts': return 'Модели без назначенных смен';
        case 'absent': return 'Отсутствующие модели';
        case 'inactive': return 'Неактивные модели';
      }
    },
    activeTabTitle() {
      switch (this.activeTab) {
        case 'without_workshifts': return `Без назначенных смен (${this.freeModelsCount.without_workshifts})`;
        case 'absent': return `Отсутствующие модели (${this.freeModelsCount.absent})`;
        case 'inactive': return `Неактивные модели (${this.freeModelsCount.inactive})`;
      }
    },
  },
  watch: {
    filteredFreeModels: function () {
      this.$nextTick(() => {
        if (this.$refs['models-list-container'] && this.$refs['models-list-body']) this.isOverflow = this.$refs['models-list-container'].getBoundingClientRect().height > this.$refs['models-list-body'].getBoundingClientRect().height
      })
    },
    activeFreeModelsDate() {
      this.updateFreeModelDate();
    },
  },
  mounted() {
    if (this.$refs['models-list-container'] && this.$refs['models-list-body']) this.isOverflow = this.$refs['models-list-container'].getBoundingClientRect().height > this.$refs['models-list-body'].getBoundingClientRect().height
  },
  methods: {
    openSchedule(model) {
      if (this.userPermissions.schedule.edit)
        this.$emit('open-schedule', model);
    },
    getNumberOfShifts(shifts) {
      if (!Number(shifts)) return 'Нет смен';
      return `${pluralize(shifts, ['смена', 'смены', 'смен'])} в расписании`;
    },
    getAbsenceTitle(absences) {
      return absences.map(absence => ` ${this.absenceTypes[absence.type]} ${moment(absence.start_at).format('DD.MM')} - ${moment(this.subtractDay(absence.end_at)).format('DD.MM')} `)
    },
    subtractDay(subtractDate) {
      let date = moment(subtractDate);
      date.subtract(1, 'days');
      return date;
    },
    updateFreeModelDate() {
      this.$emit('updateFreeModelDate', this.activeFreeModelsDate);
    },
    generateLink(model) {
      clipboard('');
      if ((model.linkStatus === 'loading') || !model.has_credentials) return;
      if (model.linkStatus === 'success') return this.copyLink(model.link);
      this.$store.dispatch('schedule/fetchGenerateLink', {
        model: model.id,
        group: model.main_group.id,
        workweek: this.activeFreeModelsDate,
      });
    },
    copyLink(link) {
      clipboard(link, this.copyLinkSuccess);
    },
    copyLinkSuccess() {
      showToast(this.$toasted, 'Ссылка на заполнение расписания скопирована в буфер');
    },
    setActiveTab(tab) {
      this.activeTab = tab;
      this.collapseStatus = false;
    },
    toggleCollapse() {
      this.collapseStatus = !this.collapseStatus;
    },
  }
}
</script>