import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import auth from './auth';
import changepass from './changepass';
import roles from './roles';
import directory from './directory';
import files from './files';
import dossier from './dossier';
import groups from './groups';
import dictionaries from './dictionaries';
import groupparameters from './groupparameters';
import users from './users';
import hr from './hr';
import responses from './responses';
import tasks from './tasks';
import comments from './comments';
import profile from './profile';
import schedule from './schedule';
import cancelWorkshiftReasons from './cancelWorkshiftReasons';
import communications from './communications';
import cancellationReasons from './cancellationReasons';
import accBlockingReasons from './accBlockingReasons';
import refresh from './refresh';
import resignReasons from './resignReasons';
import search from './search';
import management from './management';
import nationalities from './nationalities';
import calendar from './calendar';
import postponementReasons from './postponementReasons';
import jobDuties from './jobDuties';
import workshiftReportTemplates from './workshiftReportTemplates';
import authHistory from './authHistory';
import notifications from "@/store/notifications";
import paymentResource from './paymentResource';
import positions from './positions';
import utility from './utility';
import refUsersPercentages from "@/store/refUsersPercentages";
import paymentInfoTemplates from "@/store/paymentInfoTemplates";
import centrifuge from "@/store/centrifuge";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    layout,
    auth,
    changepass,
    roles,
    directory,
    files,
    dossier,
    groups,
    dictionaries,
    groupparameters,
    users,
    hr,
    responses,
    tasks,
    comments,
    profile,
    schedule,
    cancelWorkshiftReasons,
    communications,
    cancellationReasons,
    accBlockingReasons,
    refresh,
    resignReasons,
    search,
    management,
    nationalities,
    calendar,
    postponementReasons,
    jobDuties,
    workshiftReportTemplates,
    authHistory,
    notifications,
    paymentResource,
    positions,
    utility,
    refUsersPercentages,
    paymentInfoTemplates,
    centrifuge,
  },
});
