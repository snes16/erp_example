<template>
  <div class="widget_fine" :class="isUserDetails ? '-user_details' : 'card profile_main-card'">
    <div v-if="!isUserDetails" class="profile_main-card-header pb-3">
      <div class="profile_main-card-header-title">
        <h3>Штрафы</h3>
        <div v-if="quantity" class="profile_main-card-header-title-badge ml-2">
          {{ quantity }}
        </div>
      </div>
    </div>
    <div class="profile_main-card-body p-0">
      <div class="widget_fine-subheader">
        <div class="widget_fine-subheader-date">
          <span class="widget_fine-text-subheader">ДАТА</span>
        </div>
        <div class="widget_fine-subheader-reason">
          <span class="widget_fine-text-subheader">ПРИЧИНА</span>
        </div>
        <div class="widget_fine-subheader-size">
          <span class="widget_fine-text-subheader">РАЗМЕР</span>
        </div>
        <div v-if="isSuperAdmin" 
             class="btn-add" 
             :class="{'mr-2': isUserDetails}" 
             @click="openFineAdd"/>
      </div>
      <div v-if="currentFines.length"
           class="widget_fine-body-list -fixed p-0"
           ref="scrollContainer"
           :class="{'-user_details': isUserDetails}"
           @scroll="handleScroll">
        <div v-for="(fine, index) in currentFines"
             class="widget_fine-body-row"
             :ref="`fine-${fine.id}`"
             :key="fine.id"
             :class="{'-last': index === currentFines.length - 1}"
             @click="openFineDetails(fine)"
        >
          <div class="profile_main-card-body-profit-row-info">
            <div class="widget_fine-subheader-date widget_fine-text-rows d-inline-flex">
              <span class="widget_fine-text-numbers">{{ formattedFineDates[index] }}</span>
              <div v-if="fine.canceled_at" class="widget_fine-subheader-date-cancel_icon" :id="`cancel-${fine.id}`">
                <circle-crossed/>
              </div>
            </div>
            <b-tooltip :target="`cancel-${fine.id}`" placement="top">
              <div class="widget_fine-subheader-date-tooltip">Отменён {{fine.canceled_at}}</div>
            </b-tooltip>
          </div>
          <span class="widget_fine-subheader-reason widget_fine-text-rows">
            {{ fine.reason.title }}
          </span>
          <span class="widget_fine-subheader-size widget_fine-text-rows widget_fine-text-numbers">${{ fine.amount }}</span>
          <info size="-lg"
                class="widget_fine-body-info"
                :class="{'-scroll' : hasScrolling}"
                :id="`info-${fine.id}`"
          />
          <b-popover custom-class="widget_fine-body-info-comment"
                     triggers="hover"
                     placement="lefttop"
                     :target="`info-${fine.id}`">
            <div class="widget_fine-body-info-comment-header">Комментарий по штрафу</div>
            <div class="widget_fine-body-info-comment-body">
              <avatar v-if="isSuperAdmin && fine.created_by"
                      class="mr-2"
                      size="-md"
                      :url="fine.created_by.avatar"
              />
              <div>
                <div v-if="isSuperAdmin && fine.created_by && fine.created_by.fullname"
                     class="widget_fine-text-titles mb-1">
                  {{ fine.created_by.fullname }}
                </div>
                <span class="widget_fine-text-rows">
                  {{ fine.details }}
                </span>
              </div>
            </div>
          </b-popover>
        </div>
      </div>
      <div v-else class="widget_fine-body-nothing">
        <span class="widget_fine-text-nothing">
          Штрафов нет
        </span>
      </div>
    </div>
    <div class="widget_fine-footer"
         :class="{'-loading': isFetchingLoading}">
        <throbber v-if="isFetchingLoading" class="throbber"/>
    </div>
  </div>
</template>
<script>
import DatePicker from 'vue2-datepicker';
import moment from 'moment';
import Avatar from "@/components/Common/Avatar/Avatar.vue";
import info from "@/assets/info.svg";
import circleCrossed from "@/assets/vue-svg/circle-crossed.svg";
import throbber from "@/assets/vue-svg/throbber.svg";

export default {
  name: 'widget-fine',
  props: {
    userId: Number,
    isUserDetails: Boolean
  },
  components: {
    throbber,
    info,
    Avatar,
    'date-picker': DatePicker,
    'circle-crossed': circleCrossed,
  },
  data() {
    return {
      moment: moment,
      sortBy: 'ref_profit',
      week: 0,
      sortAscending: false,
      hasScrolling: false,
      quantity: null
    }
  },
  computed: {
    status() {
      return this.$store.state.profile.fineStatus;
    },
    isFetchingLoading() {
      return this.status === 'fetching-fine';
    },
    formattedFineDates() {
      return this.currentFines.map((fine) => moment(fine.date).format('DD.MM.YYYY'));
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
    currentFinesHeaders() {
      return this.$store.state.profile.currentFinesHeaders;
    },
    currentFines() {
      return this.$store.state.profile.currentFines;
    },
  },
  watch: {
    userId: function (newUserId) {
      this.getFines(newUserId, 1);
    },
    currentFines: {
      immediate: true,
      handler(newFines) {
        this.$nextTick(() => {
          if (this.$refs.scrollContainer) {
            this.hasScrolling = this.$refs.scrollContainer.scrollHeight > this.$refs.scrollContainer.clientHeight;
          }
        });
      },
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'creating-fine':
            this.getFines(this.userId,  1);
            this.quantity++;
        }
      }
    },
    currentFinesHeaders: function (newHeaders) {
        this.quantity = newHeaders.totalItems;
    }
  },
  created() {
    this.getFines(this.userId,  1);
    this.quantity = this.currentFinesHeaders.totalItems;
  },
  methods: {
    getFines(userId, page) {
      const params = {
        userId: userId,
        per_page: 5,
        page,
      }
      this.$store.dispatch('profile/fetchCurrentFines', params)
    },
    openFineAdd() {
      this.$emit('openFineDetails')
    },
    openFineDetails(fine) {
      if (!this.isSuperAdmin) return
      this.$emit('openFineDetails', fine);
    },
    handleScroll(e) {
      if ((this.status === 'fetching-fine') || (this.currentFinesHeaders.currentPage >= this.currentFinesHeaders.totalPages) || !this.currentFines.length) return;
      const anchorElementId = this.currentFines[this.currentFines.length - 2].id;
      if (this.$refs[`fine-${anchorElementId}`]?.[0] && (this.$refs[`fine-${anchorElementId}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height))
        this.getFines(this.userId, this.currentFinesHeaders.currentPage + 1);
    },
  },
};
</script>