import { Centrifuge } from 'centrifuge';
import { requestHandler } from "@/tools/tools";
import config from '@/config';

export default {
    namespaced: true,
    state: {
        centrifugeConnection: null,
        centrifugeToken: undefined,
    },
    mutations: {
        SET_CENTIFUGE_CONNECTION(state, connection) {
            if (state.centrifugeConnection)
                state.centrifugeConnection.disconnect();
            state.centrifugeConnection = connection;
        },
        FETCH_CENTRIFUGE_TOKEN(state, centrifugeToken) {
            state.centrifugeToken = centrifugeToken;
        },
    },
    actions: {
        async connectToCentrifuge({ commit, dispatch, state, rootState }) {
            const ws = config.wsUrlApi;
            const centrifugeToken = state.centrifugeToken;

            const centrifugeConfig = {
                getToken: async () => {
                    if (rootState.auth.isUserLockedBehindPin) return null;
                    await dispatch('fetchCentrifugeToken');
                    return state.centrifugeToken;
                }
            };

            if (centrifugeToken) {
                centrifugeConfig.token = state.centrifugeToken;
            }

            const centrifuge = new Centrifuge(ws + "connection/websocket", centrifugeConfig);

            commit('SET_CENTIFUGE_CONNECTION', centrifuge);

            centrifuge.on('publication', async function (ctx) {
                dispatch('handleNewNotification', ctx.data.data);
            }).connect();
        },
        async fetchCentrifugeToken({commit, dispatch}) {
            try {
                const response = await requestHandler({
                    method: 'get',
                    url: '/messenger/token',
                }, {preventRequestAfterRefresh: true}, dispatch)
                commit('FETCH_CENTRIFUGE_TOKEN', response.data.token);
            } catch (error) {
                throw error;
            }
        },
        async handleNewNotification({ commit }, notification) {
            commit('notifications/SET_LAST_NOTIFICATION', notification, { root: true });
            commit('auth/INCREMENT_UNREAD_NOTIFICATIONS', null, { root: true });
        },
    }
}
