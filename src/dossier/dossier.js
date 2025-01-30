// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Dossier from './Dossier.vue';
import axios from 'axios';
import config from './../config';

Vue.use(BootstrapVue);

/* eslint-disable no-new */

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common['Content-Type'] = "application/json";

new Vue({
    el: '#app',
    render: h => h(Dossier),
});
