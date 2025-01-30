import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';
//Login
import Login from '@/pages/Login/Login';
import ChangePass from '@/pages/ChangePass/ChangePass';
import ErrorPage from '@/pages/Error/Error';

// Safety
import Pin from '@/pages/Pin/Pin';

//Roles
import Roles from '@/pages/Administration/Roles/Roles';
import Catalog from '@/pages/Catalog/Catalog';
import Templates from '@/pages/Dictionaries/Templates';
import Resources from '@/pages/Resources/Resources';
import GroupParameters from '@/pages/GroupParameters/GroupParameters';
import Communications from '@/pages/Dictionaries/Communications/Communications';
import CancellationReasons from "./pages/Dictionaries/CancelationReason/CancellationReasons";
import CancelWorkshiftReasons from '@/pages/Dictionaries/CancelWorkshiftReasons';
import AccBlockingReasons from '@/pages/Dictionaries/AccBlockingReasons';
import ResignReasons from '@/pages/Dictionaries/ResignReasons';
import Nationality from '@/pages/Dictionaries/Nationality';
import PostponementReasons from '@/pages/Dictionaries/PostponementReasons';
import JobDuties from '@/pages/Dictionaries/JobDuties/JobDuties';
import WorkshiftReportTemplates from '@/pages/Dictionaries/WorkshiftReportTemplates/WorkshiftReportTemplates';
import PaymentInfoTemplates from "@/pages/Dictionaries/PaymentInfoTemplates/PaymentInfoTemplates";
import PaymentResources from '@/pages/Dictionaries/PaymentResources/PaymentResources';
import Positions from '@/pages/Dictionaries/Positions/Positions';
import AuthHistory from '@/pages/Administration/AuthHistory';
import Vacancies from '@/pages/HR/Active/Active';
import Responses from '@/pages/HR/Responses';
import Archive from '@/pages/HR/Archive/Archive';
import HrStats from '@/pages/HR/HrStats';
//Organization
import Groups from '@/pages/Organization/Groups/Groups';
import FinSystem from '@/pages/Organization/FinSystem';
import RefUsersPercentages from "@/pages/Organization/RefUsersPercentages/RefUsersPercentages.vue";
//Tasks
//Schedule
import ModelSchedule from '@/pages/ModelSchedulePage/ModelSchedulePage';
//Schedule
import OperatorSchedule from '@/pages/Workshifts/WorkshiftsForOperator';
//Workshifts
import Workshifts from "./pages/Workshifts/RewriteWorkshifts";

//Profile
import ProfilePage from '@/pages/Profile/Profile';

//Dossier
import Dossier from '@/pages/Dossier/Dossier';

//Tasks
import Tasks from '@/pages/Tasks/components/List/List'

//Management
import Management from '@/pages/Management/Management'

//Calendar
import Calendar from '@/pages/Calendar/Calendar';

//Notifications
import Notifications from '@/pages/Notifications/Notifications';
import store from "@/store";

Vue.use(Router);
// const mainPage = localStorage.getItem('mainPage') || '/app/profile';

const router = new Router({
  routes: [
    // {path: '/', redirect: mainPage},
    {
      path: '/documentation',
      redirect: '/documentation/getting-started/overview'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/changepass',
      name: 'ChangePass',
      component: ChangePass,
    },
    {
      path: '/error',
      name: 'Error',
      component: ErrorPage,
    },
    {
      path: '/enter-pin',
      name: 'EnterPin',
      component: Pin
    },
    {
      path: '/app',
      name: 'Layout',
      component: Layout, beforeEnter: (to, from, next) => {
        // const refreshToken = localStorage.getItem('refreshToken');
        // const accessToken = sessionStorage.getItem('token');
        // const email = store.state.auth.email;
        // const password = store.state.auth.password;
        //
        // if (!refreshToken && !email && !password && (to.path !== '/login')) next('/login');
        // if (!accessToken && refreshToken && (to.path !== '/enter-pin')) {
        //   if (to.name !== 'Login') next(`/enter-pin?backPage=${to.fullPath}`);
        //   else next(`/enter-pin`);
        // }
        next();
      },
      children: [
        // main pages
        {
          path: 'profile',
          name: 'ProfilePage',
          component: ProfilePage,
        },
        // profile of other user
        {
          path: 'profile/:id',
          name: 'ProfilePage',
          component: ProfilePage,
        },
        {
          path: 'roles',
          name: 'Roles',
          component: Roles,
        },
        {
          path: 'vacancies/active',
          name: 'Vacancies',
          component: Vacancies,
        },
        {
          path: 'responses',
          name: 'Responses',
          component: Responses,
        },
        {
          path: 'vacancies/archive',
          name: 'Archive',
          component: Archive,
        },
        {
          path: 'vacancies/stats',
          name: 'HrStats',
          component: HrStats,
        },
        {
          path: 'catalog',
          name: 'Catalog',
          component: Catalog,
        },
        {
          path: 'catalog/resources',
          name: 'Resources',
          component: Resources,
        },
        {
          path: 'catalog/communications',
          name: 'Communications',
          component: Communications,
        },
        {
          path: 'catalog/cancellation_reasons',
          name: 'CancellationReasons',
          component: CancellationReasons,
        },
        {
          path: 'catalog/cancel_workshift_reasons',
          name: 'CancelWorkshiftReasons',
          component: CancelWorkshiftReasons,
        },
        {
          path: 'catalog/acc_blocking_reasons',
          name: 'AccBlockingReasons',
          component: AccBlockingReasons,
        },
        {
          path: 'catalog/resign_reasons',
          name: 'ResignReasons',
          component: ResignReasons,
        },
        {
          path: 'catalog/nationality',
          name: 'Nationality',
          component: Nationality,
        },
        {
          path: 'catalog/postponement_reasons',
          name: 'PostponementReasons',
          component: PostponementReasons,
        },
        {
          path: 'catalog/job_duties',
          name: 'JobDuties',
          component: JobDuties,
        },
        {
          path: 'templates',
          name: 'Templates',
          component: Templates,
        },
        {
          path: 'templates/payment_info_templates',
          name: 'templates/payment_info_templates',
          component: PaymentInfoTemplates,
        },
        {
          path: 'templates/workshift_report_templates',

          name: 'WorkshiftReportTemplates',
          component: WorkshiftReportTemplates,
        },
        {
          path: 'catalog/paymentResources',
          name: 'PaymentResources',
          component: PaymentResources,
        },
        {
          path: 'catalog/positions',
          name: 'Positions',
          component: Positions,
        },
        {
          path: 'auth_history',
          name: 'AuthHistory',
          component: AuthHistory,
        },
        {
          path: 'templates/group_parameters',
          name: 'GroupParameters',
          component: GroupParameters,
        },
        {
          path: 'organization/groups',
          name: 'Groups',
          component: Groups,
        },
        {
          path: 'organization/fin_system',
          name: 'FinSystem',
          component: FinSystem,
        },
        {
          path: 'organization/ref_system_connections',
          name: 'RefUsersPercentages',
          component: RefUsersPercentages,
        },
        /*{
          path: 'tasks/all',

          name: 'All',
          component: All,
        },
        {
          path: 'tasks/my',

          name: 'My',
          component: My,
        },*/
        {
          path: 'workshifts',
          name: 'Workshifts',
          component: Workshifts
        },
        {
          path: 'tasks/:task_type',
          name: 'Task',
          component: Tasks,
        },
        {
          path: 'schedule',
          name: 'Schedule',
          component: ModelSchedule,
        },
        {
          path: 'operator_schedule',
          name: 'Schedule',
          component: OperatorSchedule,
        },
        {
          path: 'tasks/model_dossier/:link',
          name: 'Dossier',
          component: Dossier,
        },
        {
          path: 'management',
          name: 'Management',
          component: Management
        },
        {
          path: 'calendar',
          name: 'Calendar',
          component: Calendar
        },
        {
          path: 'notifications',
          name: 'Notifications',
          component: Notifications
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  store.dispatch('auth/setInitialTokens');

  if (['Login', 'ChangePass', 'EnterPin'].includes(to.name)) return next();

  if (!store.state.auth.accessToken) return next('/login');

  const lastActivityTimerCheck = await store.dispatch('auth/checkLastActivityTimer');
  if (store.state.auth.hasPin && !lastActivityTimerCheck) {
    try {
      await store.dispatch('auth/lockUserBehindPin');
      return next(`/enter-pin?backPage=${to}`);
    } catch (e) {
      return next();
    }
  }

  if (store.state.auth.isUserLockedBehindPin) return next(`/enter-pin?backPage=${to}`);

  if (to.matched.length === 0 || to.fullPath === '/') {
    await store.dispatch('auth/getUser');
    return next(store.state.auth.user?.role?.main_page || '/app/profile');
  }

  next();
});

export default router;
