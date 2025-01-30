const hostApi = process.env.VUE_APP_HOST_API || 'https://api.ins.redstart.pro/';
const host = process.env.NODE_ENV === "development" ? "http://studio.tk" : "https://instudio.im";
const portApi = process.env.NODE_ENV === "development" ? "" : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}`;
const wsUrlApi = process.env.VUE_APP_CENTRIFUGE_URL || 'wss://api.ins.redstart.pro/';
const finSystemHost = process.env.VUE_APP_FIN_SYSTEM_HOST || 'https://fin.ins.redstart.pro';

export default {
  hostApi,
  host,
  portApi,
  baseURLApi,
  finSystemHost,
  wsUrlApi,
  remote: "https://flatlogic-node-backend.herokuapp.com",
  isBackend: process.env.VUE_APP_BACKEND,
  auth: {
      email: 'user_superadmin@example.com',
      password: '1Q2w3e'
  },
  app: {
    sidebarTransitionTime: 300, //ms
    colors: {
      sidebar: "#002B49",
      navbar: "#ffffff",
      primary: "#005792",
      secondary: "#798892",
      success: "#21AE8C",
      info: "#1A86D0",
      warning: "#FDA700",
      danger: "#FD5F00",
      inverse: "#002B49",
      textColor: "#495057",
      gray: "#D7DFE6"
    },
    themeColors: [
      ['default','#002B49'],
      ['white', '#FFFFFF'],
      ['first','#004472'],
      ['second','#e9ebef'],
      ['third','#d1e7f5'],
      ['fourth','#ccdde9'],
      ['fifth','#d6dfe6'],
      ['sixth','#13191d'],
      ['seventh','#20ae8c'],
    ],
    chartColors: {
      axisColor: '#8EA1AB'
    }
  }
};
