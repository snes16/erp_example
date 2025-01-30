<template>
  <technical-difficulties v-if="isServerError"/>
  <loading v-else-if="userStatus !== 'fetched'"/>
  <show-job-duties v-else-if="isShowJobDuties"/>
  <div v-else-if="!link"
       :class="[{root: true, sidebarClose, sidebarStatic}, 'sing-dashboard', 'sidebar-' + sidebarColorName, 'sidebar-' + sidebarType]"
       @click="clickEl"
  >
    <Sidebar v-if="!isOperatorOrModel"/>
    <div class="wrap" :class="{'-without_sidebar': isOperatorOrModel}">
      <Header/>
      <div v-if="layoutStatus === 'blackout-screen-on'" class="blackout-screen" @click="switchToggle()" @mouseup="handleMouseUp"/>
      <div class="content" :class="{'-iframe': routeName === 'FinSystem'}">
        <transition name="router-animation">
          <router-view/>
        </transition>
      </div>
    </div>
    
    <div style="position: fixed;right: 100%;" class="avatar-telegram-form">
      <!--    48px x 48px-->
      <svg xmlns="http://www.w3.org/2000/svg">
        <clipPath id="avatar-telegram-form-lg" clipPathUnits="objectBoundingBox">
          <path
            d="M 0 0.503906 C 0.00390625 0.78125 0.230469 1.003906 0.503906 1 C 0.585938 1 0.664062 0.976562 0.734375 0.941406 C 0.734375 0.941406 0.703125 0.84375 0.769531 0.769531 C 0.828125 0.707031 0.941406 0.734375 0.941406 0.734375 C 0.980469 0.664062 1 0.582031 1 0.496094 C 0.996094 0.21875 0.769531 -0.00390625 0.496094 0 C 0.21875 0.00390625 -0.00390625 0.230469 0 0.503906 Z M 0 0.503906 "/>
        </clipPath>
      </svg>
      <!--40px x 40px-->
      <svg xmlns="http://www.w3.org/2000/svg">
        <clipPath id="avatar-telegram-form-md" clipPathUnits="objectBoundingBox">
          <path
            d="M 0.0234375 0.492188 C 0.0273438 0.761719 0.246094 0.980469 0.515625 0.976562 C 0.597656 0.976562 0.652344 0.988281 0.71875 0.953125 C 0.71875 0.953125 0.613281 0.808594 0.726562 0.703125 C 0.839844 0.597656 0.964844 0.695312 0.964844 0.695312 C 1 0.625 1 0.570312 1 0.484375 C 0.996094 0.214844 0.777344 0 0.507812 0 C 0.238281 0.00390625 0.0195312 0.222656 0.0234375 0.492188 Z M 0.0234375 0.492188 "/>
        </clipPath>
      </svg>
      
      <!--32px x 32px-->
      <svg xmlns="http://www.w3.org/2000/svg">
        <clipPath id="avatar-telegram-form-xs" clipPathUnits="objectBoundingBox">
          <path
            d="M 0.0273438 0.492188 C 0.03125 0.757812 0.25 0.976562 0.515625 0.972656 C 0.597656 0.972656 0.636719 0.972656 0.703125 0.953125 C 0.703125 0.953125 0.605469 0.792969 0.726562 0.683594 C 0.839844 0.574219 0.96875 0.667969 0.96875 0.667969 C 0.996094 0.589844 1 0.566406 0.996094 0.484375 C 0.996094 0.214844 0.777344 0 0.507812 0.00390625 C 0.242188 0.00390625 0.0234375 0.222656 0.0273438 0.492188 Z M 0.0273438 0.492188 "/>
        </clipPath>
      </svg>
      
      <!--  24px x 24px-->
      <svg xmlns="http://www.w3.org/2000/svg">
        <clipPath id="avatar-telegram-form" clipPathUnits="objectBoundingBox">
          <path
            d="M 1 0.542969 C 1 0.527344 1 0.515625 1 0.5 C 1 0.222656 0.777344 0 0.5 0 C 0.222656 0 0 0.222656 0 0.5 C 0 0.777344 0.222656 1 0.5 1 C 0.574219 1 0.644531 0.984375 0.707031 0.953125 C 0.710938 0.953125 0.71875 0.949219 0.722656 0.949219 C 0.6875 0.90625 0.667969 0.851562 0.667969 0.792969 C 0.667969 0.652344 0.777344 0.542969 0.917969 0.542969 C 0.945312 0.542969 0.972656 0.546875 0.996094 0.554688 C 0.996094 0.550781 0.996094 0.546875 1 0.542969 Z M 1 0.542969 "/>
        </clipPath>
      </svg>

      <!-- Throbber-->
      <svg width="0" height="0" viewBox="0 0 0 0" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute">
        <defs>
          <mask id="throbber_svg__path-1-inside-1" fill="white">
            <path d="M64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32ZM4.0873 32C4.0873 47.4158 16.5842 59.9127 32 59.9127C47.4158 59.9127 59.9127 47.4158 59.9127 32C59.9127 16.5842 47.4158 4.0873 32 4.0873C16.5842 4.0873 4.0873 16.5842 4.0873 32Z"/>
          </mask>
          <linearGradient id="throbber_svg__paint0_linear" x1="32" y1="0" x2="32" y2="68" gradientUnits="userSpaceOnUse">
            <stop stop-color="#1A86D0"/>
            <stop offset="1" stop-color="#1A86D0" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
  <router-view v-else/>
</template>

<script>
import {mapActions, mapState} from 'vuex';

import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import BreadcrumbHistory from '@/components/BreadcrumbHistory/BreadcrumbHistory';
import ShowJobDuties from "@/components/ShowJobDuties/ShowJobDuties";
import Loading from "@/pages/Loading/Loading";
import TechnicalDifficulties from "@/components/ErrorPage/TechnicalDifficulties";
import {showToast} from "@/tools/tools";
import moment from "moment";
import store from "@/store";

export default {
  name: 'Layout',
  components: {Loading, ShowJobDuties, Sidebar, Header, BreadcrumbHistory, TechnicalDifficulties,},
  data() {
    return {
      tourStartTimeout: 500,
      userActivityTimeout: null
    }
  },
  computed: {
    ...mapState('layout', ["sidebarClose", "sidebarStatic", "sidebarColorName", "sidebarType", "helperOpened", "tourInstance", 'layoutStatus', 'statusBeforeClose']),
    layoutStatus() {
      return this.$store.state.layout.layoutStatus;
    },
    isOperator() {
      return this.$store.state.auth.user.role?.code === 'ROLE_OPERATOR';
    },
    isModel() {
      return this.$store.state.auth.user.role?.code === 'ROLE_MODEL';
    },
    userId() {
      return this.$store.state.auth.user.id;
    },
    isOperatorOrModel() {
      return this.isOperator || this.isModel;
    },
    link() {
      return this.$route.params.link;
    },
    user() {
      return this.$store.state.auth.user;
    },
    userStatus() {
      return this.$store.state.auth.status;
    },
    newWorkshift() {
      return this.$store.state.schedule.newWorkshift;
    },
    scheduleStatus() {
      return this.$store.state.schedule.status;
    },
    requestErrors() {
      return this.$store.state.schedule.requestErrors;
    },
    isShowJobDuties() {
      return !this.user.job_duty_settings.confirmed_at && this.user.job_duties.length;
    },
    isServerError() {
      return this.$store.state.layout.isServerError;
    },
    routeName() {
      return this.$route.name;
    },
    isUserLockedBehindPin() {
      return this.$store.state.auth.isUserLockedBehindPin;
    },
    hasPin() {
      return this.$store.state.auth.hasPin;
    },
  },
  watch: {
    layoutStatus: function (newStatus) {
      switch (newStatus) {
        case 'blackout-screen-on':
          return this.bodyFreeze()
        case 'blackout-screen-close':
          return this.bodyDefrost()
      }
    },
    newWorkshift: function (shift) {
      showToast(this.$toasted, `Смена назначена на ${moment(shift.period_date).format('dddd')}, ${shift.planned_start_at} - ${shift.planned_end_at}`);
    },
    scheduleStatus: function (newStatus) {
      if (newStatus === 'create-error')
        showToast(this.$toasted, this.requestErrors[0] && this.requestErrors[0].message || 'При добавление смены возникла ошибка', 'error')
    },
    isOperatorOrModel: function (newStatus) {
      if (newStatus && this.sidebarStatic) this.$store.dispatch('layout/toggleSidebar', false);
    },
    isUserLockedBehindPin(newStatus) {
      if (newStatus) this.$router.replace(`/enter-pin?backPage=${this.$router.currentRoute.fullPath}`);
    },
    hasPin(newHasPin) {
      if (!newHasPin) {
        clearTimeout(this.userActivityTimeout);
        this.removeListenersForUserEvents(this.resetUserActivityTimeout);
        this.removeListenersForUserEvents(this.logUserEventTimestamp);
      }
    },
  },
  beforeCreate() {
    // this.$store.dispatch('auth/setInitialTokens');
    this.$store.dispatch('tasks/getTasksQuantity', {status: 'active'});
  },
  created() {
    if (this.hasPin) {
      this.addListenersForUserEvents(this.resetUserActivityTimeout);
      this.addListenersForUserEvents(this.logUserEventTimestamp);
    }
    // window.addEventListener('beforeunload', this.removeTokens);

    this.$toasted.options.position = 'bottom-left';
    const staticSidebar = JSON.parse(localStorage.getItem('sidebarStatic'));
    if (staticSidebar && !this.isOperatorOrModel) this.$store.state.layout.sidebarStatic = true;
    else if (!this.sidebarClose) {
      this.switchSidebar(true);
      this.changeSidebarActive(null);
    }
    
    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize);
    this.$store.dispatch('auth/getUser');
    
    // this.$store.dispatch('tasks/getAllTasksQuantity', {type: 'all', filters: {status: 'active'}});
    this.$store.dispatch('dictionaries/fetchTaskTypes');
    this.$store.dispatch('centrifuge/connectToCentrifuge');
  },
  mounted() {
    
    // this.$tours['app-tour'].start();
    // fixes issue when sidebar is closing on initial entrance but user is on another tab and then returns back
    // and sees that first tour step has been misplaced
    document.body.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('permissionsError', this.showPermissionsError);
    window.addEventListener('keydown', this.onKeyPress);
    this.updateScreenHeight();
    this.$root.$on('showSuccessToast', this.showSuccessToast);
  },
  beforeDestroy() {
    if (this.hasPin) {
      clearTimeout(this.userActivityTimeout);
      this.removeListenersForUserEvents(this.resetUserActivityTimeout);
      this.removeListenersForUserEvents(this.logUserEventTimestamp);
    }
    // window.removeEventListener('beforeunload', this.removeTokens);

    clearTimeout(this.userActivityTimeout);
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('permissionsError', this.showPermissionsError);
    window.addEventListener('keydown', this.onKeyPress);
    document.body.removeEventListener('mouseup', this.handleMouseUp);
    this.$root.$off('showSuccessToast', this.showSuccessToast);
  },
  methods: {
    ...mapActions('layout', ['switchSidebar', 'handleSwipe', 'setStatusBeforeClose', 'changeSidebarActive', 'toggleSidebar', 'toggleHelper', 'applyTourStep', 'blackoutScreen']),
    resetUserActivityTimeout() {
      clearTimeout(this.userActivityTimeout);
      // 10 минут
      this.userActivityTimeout = setTimeout(this.lockUserBehindPin, 600000);
    },
    switchToggle() {
      if (this.statusBeforeClose === 'ask_close') this.setStatusBeforeClose('show_close')
      else this.toggleHelper(false)
    },
    handleWindowResize() {
      const width = window.innerWidth;
      this.$root.$emit('resize', width);
      this.updateScreenHeight();
      if (width <= 768 && this.sidebarStatic) {
        this.toggleSidebar();
        this.changeSidebarActive(null);
      }
    },
    clickEl() {
      this.$root.$emit('click');
    },
    bodyFreeze() {
      var element = document.body
      element.classList.add("freeze-body");
    },
    bodyDefrost() {
      var element = document.body
      element.classList.remove("freeze-body");
    },
    handleMouseUp(e) {
      window.dispatchEvent(new Event(e));
    },
    showPermissionsError() {
      this.$toasted.error('У вас нет доступа', {
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
    closeToast(e, toast) {
      toast.goAway(0);
    },
    updateScreenHeight() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    },
    onKeyPress(e) {
      if (!(e?.code === 'Escape')) return;
      this.toggleHelper(false);
    },
    showSuccessToast(message) {
      this.$toasted.success(message, {
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
    addListenersForUserEvents(handler) {
      if (!handler) return;
      handler();
      window.addEventListener("mousemove", handler);
      window.addEventListener("scroll", handler);
      window.addEventListener("keydown", handler);
      window.addEventListener("resize", handler);
    },
    removeListenersForUserEvents(handler) {
      if (!handler) return;
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("resize", handler);
    },
    logUserEventTimestamp() {
      this.removeListenersForUserEvents(this.logUserEventTimestamp);
      localStorage.setItem('lastActivityTimestamp', new Date().getTime().toString());
      // 1 минута
      setTimeout(() => this.addListenersForUserEvents(this.logUserEventTimestamp), 60000);
    },
    lockUserBehindPin() {
      this.$store.dispatch('auth/lockUserBehindPin');
    },
  },
};
</script>
