// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Schedule from './Schedule.vue';
import axios from 'axios';
import config from './../config';
import Toasted from 'vue-toasted';

Vue.use(BootstrapVue);
Vue.use(Toasted, {duration: 10000});

/* eslint-disable no-new */

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common['Content-Type'] = "application/json";

new Vue({
  el: '#app',
  render: h => h(Schedule),
});
