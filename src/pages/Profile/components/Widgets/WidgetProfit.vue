<template>
    <div class="card profile_main-card">
      <div class="profile_main-card-header pb-3">
        <h3>Бонусная программа</h3>
        <div v-if="refLink" class="profile_main-card-header-ref_button">
          <div id="clip_button">
            <span>Пригласить</span>
            <clip class="ml-1 text-cyan" @click="copyRefLink"/>
          </div>
        </div>
        <b-tooltip custom-class="tooltip-8-16" target="clip_button" triggers="hover" placement="bottom">
          <span>Чтобы пригласить пользователя отправьте ссылку:</span>
          <div class="d-flex justify-content-between">
            <span class="mt-2">{{refLink}}</span>
            <copy class="profile_main-icon-gray cursor-pointer" @click="copyLink"/>
          </div>
        </b-tooltip>
      </div>
      <div class="profile_main-card-body p-0">
        <div class="profile_main-card-body-profit-title">
          <div class="d-inline-flex mr-4">
            <span class="profile_main-card-body-profit-title-columns">СОТРУДНИК</span>
            <i class="fa fa-chevron-down profile_main-card-body-profit-title-arrow"
               :class="{'-active': (sortBy === 'fullname') && sortAscending}"
               @click="sortTable('fullname')"
            />
          </div>
          <div class="profile_main-card-body-profit-title-procent_icon"> %</div>
        </div>
        <div v-if="refProfitUsers.length" class="profile_main-card-body-profit -fixed p-0">
          <div v-for="model in filteredRefProfitUsers"
               :ref="`user-with-access-${model.id}`"
               :key="model.id"
               class="profile_main-card-body-profit-row"
          >
            <avatar class="profile_main-card-body-profit-row-avatar -xs"
                    :url="model.user.avatar"
                    :telegram="model.user.telegram_connected"
            />
            <div class="profile_main-card-body-profit-row-fullname">
              <span v-if="model.user.uid" class="text-gray mr-1">{{ model.user.uid }}</span>
              <span v-if="model.user.fullname">{{ model.user.fullname }}</span>
              <span v-if="model.user.model_nickname">{{ model.user.model_nickname }}</span>
            </div>
            <user-resign-icon v-if="model.user.resign_date"
                              :user="model.user"
                              :id="`resign_info-${model.type_ref}-${model.user.id}`"
                              class="profile_main-card-body-profit-row-resign_icon"
            />
            <span class="profile_main-card-body-profit-row-procent">{{ model.ref_system_percentages }}%</span>
            <!--<span class="profile_main-card-body-profit-row-model_profit">$ {{ model.ref_profit }}</span>-->
            <referal v-if="model.type_ref === 'referal'"
                     :id="`referal_icon-${model.user.id}`"
            />
            <b-tooltip :target="`referal_icon-${model.user.id}`" triggers="hover" placement="topright">
              <div class="profile_main-tooltip_profit">
                <span>Реферальная система</span>
              </div>
            </b-tooltip>
            <trainer v-if="model.type_ref === 'trainer'"
                     class="flex-shrink-0"
                     :id="`trainer_icon-${model.user.id}`"
            />
            <b-tooltip :target="`trainer_icon-${model.user.id}`" triggers="hover" placement="topright">
              <div class="profile_main-tooltip_profit">
                <span>Тренерская система</span>
              </div>
            </b-tooltip>
          </div>
        </div>
        <div v-else class="pt-3 pl-4 pr-4 pb-4">
          <span class="text-fw-400 text-lh-20">
            Увеличьте свой доход, приглашая новых <br/>
            пользователей! Поделитесь своей партнерской ссылкой и <br/>
            получайте вознаграждение с каждого пользователя.
          </span>
        </div>
      </div>
    </div>
</template>
<script>
import DatePicker from 'vue2-datepicker';
import moment from 'moment';
import trainer from "@/assets/vue-svg/trainer-circled.svg";
import referal from "@/assets/vue-svg/model-circled.svg";
import clip from "@/assets/vue-svg/clip.svg";
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import UserResignIcon from "@/components/Common/UserResignIcon.vue";
import {clipboard, showToast} from "@/tools/tools.js";
import copy from "@/assets/vue-svg/copy-transparent.svg";

export default {
  name: 'widget-profit',
  props: {
    userId: Number,
    refLink: String,
    showMobile: Boolean,
  },
  components: {
    copy,
    Avatar,
    UserResignIcon,
    'date-picker': DatePicker,
    trainer: trainer,
    referal: referal,
    clip: clip,
  },
  data() {
    return {
      moment: moment,
      sortBy: 'ref_profit',
      week: 0,
      sortAscending: false,
    }
  },
  computed: {
    refStatus() {
      return this.$store.state.profile.refStatus;
    },
    status() {
      return this.$store.state.profile.status;
    },
    refProfitUsers() {
      return this.$store.state.profile.currentProfitUsers;
    },
    filteredRefProfitUsers() {
      return this.refProfitUsers.slice().sort((userA, userB) => {
        if (!userA.user.resign_date && userB.user.resign_date) {
          return -1;
        } else if (userA.user.resign_date && !userB.user.resign_date) {
          return 1;
        } else return 0;
      });
    },
    beginningWeek() {
      return moment().isoWeekday(0).add(this.week, 'week').format('DD.MM.YYYY')
    },
    weekProfit() {
      return this.$store.state.profile.weekProfit;
    },
    endWeek() {
      return moment().isoWeekday(6).add(this.week, 'week').format('DD.MM.YYYY')
    },
  },
  watch: {
    userId: function (newUserId) {
      this.getProfitUsers(newUserId);
    },
    refStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'deleting-refs':
          case 'adding-refs':
          case 'editing-refs':
            this.getProfitUsers(this.userId);
            break;
        }
      }
    },
  },
  created() {
    this.getProfitUsers(this.userId);
  },
  methods: {
    getProfitUsers(userId) {
      let filters = {
        userId: userId,
        [`order[${this.sortBy}]`]: this.sortAscending ? 'asc' : 'desc',
        // workweek: this.beginningWeek,
      };
      this.$store.dispatch('profile/fetchCurrentUsersProfit', filters);
    },
    copyRefLink() {
      clipboard(this.link, this.copyLinkSuccess);
    },
    copyLinkSuccess() {
      showToast(this.$toasted, 'Ссылка на заполнение расписания скопирована в буфер');
    },
    sortTable(field) {
      this.sortAscending = this.sortBy === field ? !this.sortAscending : true;
      this.sortBy = field;
      this.getProfitUsers(this.userId);
    },
    changeWeek(offset) {
      if (offset > 0 && moment().isoWeek() + this.week + offset > moment().isoWeek()) return;
      this.week += offset;
      this.getProfitUsers(this.userId);
    },
  },
};
</script>