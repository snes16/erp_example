// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import * as VueGoogleMaps from 'vue2-google-maps';
import VueTouch from 'vue-touch';
import Trend from 'vuetrend';
import { ClientTable } from 'vue-tables-2';
import VueTextareaAutosize from 'vue-textarea-autosize';
import mavonEditor from 'mavon-editor';
import VueMask from 'v-mask';
import VeeValidate from 'vee-validate';
import VueFormWizard from 'vue-form-wizard';
import axios from 'axios';
import Toasted from 'vue-toasted';
import VCalendar from 'v-calendar';
import VueApexCharts from 'vue-apexcharts';
import CKEditor from '@ckeditor/ckeditor5-vue';
import bFormSlider from 'vue-bootstrap-slider';
import { component as VueCodeHighlight } from 'vue-code-highlight';
import VueTour from 'vue-tour';
import * as Sentry from "@sentry/vue";

import store from './store';
import router from './Routes';
import App from './App';
import layoutMixin from './mixins/layout';
import { AuthMixin } from './mixins/auth';
import config from './config';
import Widget from './components/Widget/Widget';

import { dateFormatInit } from './tools/date-format';
import VueInputAutowidth from 'vue-input-autowidth';

import TinyMCE from '@tinymce/tinymce-vue';
import 'tinymce/tinymce';
import 'tinymce/plugins/link/plugin';
import 'tinymce/plugins/image/plugin';
import 'tinymce/plugins/advlist/plugin';
import 'tinymce/plugins/autolink/plugin';
import 'tinymce/plugins/lists/plugin';
import 'tinymce/plugins/charmap/plugin';
import 'tinymce/plugins/print/plugin';
import 'tinymce/plugins/preview/plugin';
import 'tinymce/plugins/code/plugin';
import Theme from 'tinymce/themes/silver/theme';
// import 'tinymce/skins/content/default/content.min.css';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/icons/default';
import './packages/ru';

import VueRx from 'vue-rx';
import {showToast} from "@/tools/tools";

dateFormatInit();

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common['Content-Type'] = "application/json";

/*axios.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  if (error?.response?.status === 401) {
    // apiPublicRequest.get('/manager-oauth', { params: { grant_type: 'refresh', client_id: clientId, client_secret: clientSecret, refresh_token: localStorage.getItem('refresh_token') } });
    console.log(error.config);
    // localStorage.removeItem('refreshToken');
    // localStorage.removeItem('token');
    // location.reload();
  }
  return Promise.reject(error);
});*/

Vue.use(BootstrapVue);
Vue.use(VCalendar, {
  firstDayOfWeek: 2
});
Vue.use(VueTouch);
Vue.use(Trend);
Vue.component('vue-code-highlight', VueCodeHighlight);
Vue.component('Widget', Widget);
Vue.use(bFormSlider);
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyB7OXmzfQYua_1LEhRdqsoYzyJOPh9hGLg',
  },
});
Vue.use(ClientTable, { theme: 'bootstrap4' });
Vue.use(VueTextareaAutosize);
Vue.use(CKEditor);
Vue.use(mavonEditor);
Vue.component('apexchart', VueApexCharts);
Vue.use(VueMask);
Vue.use(VeeValidate, { fieldsBagName: 'fieldsbag' });
Vue.use(VueFormWizard);
Vue.mixin(layoutMixin);
Vue.mixin(AuthMixin);
Vue.use(Toasted, {duration: 10000});
Vue.use(VueTour);

Vue.use(VueInputAutowidth);

Vue.config.productionTip = false;

if (process.env.BROWSER) {
  window.Theme = Theme
}
Vue.component('tiny-mce', TinyMCE)

Vue.use(VueRx);

const sentryId = process.env.VUE_APP_SENTRY_ID;
const sentryKey = process.env.VUE_APP_SENTRY_KEY;
if (sentryId && sentryKey) {
  Sentry.init({
    Vue,
    dsn: 'https://' + sentryKey + '.ingest.sentry.io/' + sentryId,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
      new Sentry.Replay(),
    ],
    tracePropagationTargets: [process.env.VUE_APP_PROD_HOST],
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0
  });
}

Vue.config.errorHandler = (err, vm, info) => {
  if (vm.$parent.$vnode.componentOptions.tag === 'helper') vm.$store.dispatch('layout/toggleHelper', false);
  if (sentryId && sentryKey)
    Sentry.captureException(err);
  throw err;
};

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
