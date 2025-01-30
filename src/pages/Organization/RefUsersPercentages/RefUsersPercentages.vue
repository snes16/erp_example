<template>
  <div class="ref">
    <h1>Бонусная программа</h1>
    <div class="card">
      <div class="groups-nav-tabs">
        <div class="ref-header-tabs-tab"
             id="groups-type-referal"
             @click="setGroupsType('referal')"
             :class="{'-active': groupsType === 'referal'}"
        >Реферальная система
        </div>
        <div class="ref-header-tabs-tab"
             id="groups-type-trainer"
             @click="setGroupsType('trainer')"
             :class="{'-active': groupsType === 'trainer'}"
        >Тренерская система
        </div>
      </div>
      <div class="ref-header-config-main">
        <div class="ref-header-config-main-search">
          <b-input-group>
            <b-input-group-text slot="append"><search/></b-input-group-text>
            <b-form-input v-model="searchString"
                          placeholder="Поиск"
                          type="text"
                          @input="onInputSearchString"
            ></b-form-input>
          </b-input-group>
        </div>
        <div class="ref-header-config-main-group_picker">
          <group-select v-model="region"
                        :groups="groupsForSelect"
                        @change="changeGroup"
                        class="ref-header-config-main-group_picker-select custom_select text-left -filter"
          />
        </div>
<!--        <div class="ref-header-config-main-date_picker">-->
<!--          <p class="ref-header-config-main-date_picker-arrow" @click="changeWeek(-1)"><i-->
<!--              class="fa fa-angle-left"/></p>-->
<!--          <p>{{ beginningWeek }}</p>-->
<!--          <p>-</p>-->
<!--          <p>{{ endWeek }}</p>-->
<!--          <p class="ref-header-config-main-date_picker-arrow"-->
<!--             @click="changeWeek(1)">-->
<!--            <i class="fa fa-angle-right"/></p>-->
<!--        </div>-->
      </div>
      <div class="ref-body-main">
        <table class="ref-body-main-table">
          <thead>
          <tr class="ref-body-main-table-title">
            <th class="ref-body-main-table-title-name ref-header-text">СОТРУДНИК</th>
            <th class="ref-body-main-table-title-quantity ref-header-text">КОЛ-ВО СОТРУДНИКОВ</th>
            <th class="ref-body-main-table-title-percentage ref-header-text">ПРОЦЕНТ</th>
          </tr>
          </thead>
          <tbody v-if="!isTableLoading">
          <tr v-for="item in currentUsers"
              :key="item.id"
              class="ref-body-main-table-row"
          >
            <td class="ref-body-main-table-row-fullname ref-text">
              <avatar class="mr-2"
                      :class="!item.user.avatar ? 'ref-body-main-table-row-fullname-avatar' : ''"
                      :url="item.user.avatar"
                      :telegram="item.user.telegram_connected"
                      :is-fin-admin="item.user.is_fin_admin"
              />
              {{ item.user.fullname }}
            </td>
            <td class='ref-text cursor-pointer' @click="manageModels(item.user.id)">{{ item.connected_models }}</td>
            <td v-if="item.max_ref_percent !== 0">
              <span v-if="item.min_ref_percent !==0 && item.min_ref_percent!==item.max_ref_percent"
                    class="ref-text">{{item.min_ref_percent }}% - {{ item.max_ref_percent }}%</span>
              <span v-else
                    class="ref-text">{{ item.max_ref_percent }}%</span>
            </td>
            <td v-else class="ref-body-main-table-row-zero_percent ref-text">{{ item.max_ref_percent }}%</td>
          </tr>
          </tbody>
        </table>
        <b-pagination v-if="!isTableLoading"
            :value="currentPage"
            class="ref-pagination"
            align="left"
            :total-rows="pagination.totalItems"
            :per-page="perPage"
            @change="changePage"
        />
      </div>
      <div v-if="isTableLoading" class="ref-loader">
        <throbber class="throbber"/>
        <span class="ref-text-gray">Информация загружается, пожалуйста подождите</span>
      </div>
    </div>
    <helper>
      <ref-system-users-view v-if="droverType === 'refSystemUsersView'"
                              :user-id="userId"
                              :ref-users="profile.ref_system_connected_users_referal"
                              :trainer-users="profile.ref_system_connected_users_trainer"
                              @add="showRefSystemUsersAdd"
                              @close="closeDrover"
      />
      <ref-system-users-add v-else-if="droverType === 'refSystemUsersAdd'"
                             :ref-type="refType"
                             :user-id="userId"
                             @close="closeDrover"
                             @back="showDrover('refSystemUsersView')"
      />
    </helper>
  </div>
</template>

<script>
import DateScrollType from "@/pages/Workshifts/components/DateScrollType/DateScrollType.vue";
import HeaderWorkshifts from "@/pages/Workshifts/components/HeaderWorkshifts/HeaderWorkshifts.vue";
import at from "@/assets/vue-svg/at.svg";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect.vue";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import success from "@/assets/vue-svg/success.svg";
import GroupInfo from "@/components/Common/GroupInfo.vue";
import moment from "moment";
import { showToast, getIdsFromGroup } from "@/tools/tools";
import throbber from "@/assets/vue-svg/throbber.svg";
import RefSystemUsersView from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersView.vue";
import RefSystemUsersAdd from "@/pages/Profile/components/RefSystemUsers/RefSystemUsersAdd.vue";
import Helper from '@/components/Helper/Helper.vue';
import search from '@/assets/vue-svg/search.svg';

export default {
  name: 'ref-users-percentages',
  components: {
    RefSystemUsersAdd,
    RefSystemUsersView,
    throbber,
    GroupInfo,
    success,
    Avatar,
    GroupSelect,
    at,
    HeaderWorkshifts,
    DateScrollType,
    'helper': Helper,
    'search': search,
  },
  props: {
    value: String
  },
  data(){
    return {
      week: 0,
      groupsType: 'referal',
      region: {},
      searchString: '',
      perPage: 7,
      droverType: '',
      refType: String,
      userId: null,
    }
  },
  created(){
    this.getUsers();
    this.$store.dispatch('dictionaries/getGroupsNonSystem');
  },
  computed: {
    refStatus() {
      return this.$store.state.profile.refStatus;
    },
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    currentPage() {
      return this.$route.query.page || 1;
    },
    pagination() {
      return this.$store.state.refUsersPercentages.currentUsersHeaders;
    },
    groupsNonSystem() {
      return this.$store.state.dictionaries.groupsNonSystem;
    },
    groupsForSelect() {
      return [{title: 'Выберите регион', id: null}, ...this.groupsNonSystem];
    },
    groups() {
      return this.$store.state.groups.groups;
    },
    profile() {
      return this.$store.getters["profile/profile"](this.userId);
    },
    beginningWeek() {
      return moment().isoWeekday(0).add(this.week, 'week').format('DD.MM.YYYY');
    },
    endWeek() {
      return moment().isoWeekday(6).add(this.week, 'week').format('DD.MM.YYYY');
    },
    status() {
      return this.$store.state.refUsersPercentages.status;
    },
    groupStatus() {
      return this.$store.state.dictionaries.status;
    },
    isTableLoading() {
      return (this.status === 'fetching') || (this.groupStatus === 'request');
    },
    groupsForRegionFilter() {
      const groupIds = [];
      if (this.region.id) {
        groupIds.push(...getIdsFromGroup(this.region));
      }
      return groupIds;
    },
    currentUsers() {
      return this.$store.state.refUsersPercentages.currentUsers;
    },
  },
  watch: {
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.activeUser = {};
        this.droverType = '';
      }
    },
    refStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'deleting-refs':
          case 'editing-refs':
            this.getUsers();
            this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
            break;
          case 'adding-refs':
            this.getUsers();
            this.$store.dispatch('profile/fetchProfile', {userId: this.userId});
            this.showDrover('refSystemUsersView');
            break;
        }
      } else if ((newStatus === 'error') && this.errorMessage) showToast(this.$toasted, this.errorMessage, 'error');
    },
    currentPage: function (newPage) {
        this.getUsers(newPage);
    },
  },
  methods: {
    setGroupsType(type) {
      if (!this.isTableLoading && this.groupsType !== type) {
        this.$router.replace({name: this.$route.name, query: {...this.$route.query, page: 1}});
        this.groupsType = type;
        this.getUsers();
      }
    },
    onInputSearchString() {
      const searchString = this.searchString;
      setTimeout(() => {
        if (searchString === this.searchString) this.getUsers();
      }, 1000);
    },
    changeWeek(offset) {
      if (offset > 0 && moment().isoWeek() + this.week + offset > moment().isoWeek()) return;
      this.week += offset;
      this.getUsers();
    },
    getUsers() {
      let filters = {
        per_page: this.perPage,
        page: this.currentPage,
        search: this.searchString,
        main_group: this.groupsForRegionFilter,
        type: this.groupsType,
        // workweek: this.beginningWeek,
        isActive: true
      };
      this.$store.dispatch('refUsersPercentages/fetchTableRefUsers', filters);
    },
    closeDrover() {
      this.droverType = '';
      this.$store.dispatch('layout/toggleHelper', false);
    },
    manageModels(userId) {
      this.userId = userId;
      this.$store.dispatch('profile/fetchProfile', {userId: userId});
      this.showDrover('refSystemUsersView');
    },
    changePage(page) {
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          page: page,
        },
      });
    },
    showDrover(type) {
      this.droverType = type;
      this.$store.dispatch('layout/toggleHelper', true);
    },
    showRefSystemUsersAdd(refType){
      this.refType = refType;
      this.droverType = 'refSystemUsersAdd';
      this.$store.dispatch('layout/toggleHelper', true);
    },
    changeGroup() {
      this.getUsers();
    }
  },
};
</script>
