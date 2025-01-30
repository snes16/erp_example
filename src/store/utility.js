
export default {
    namespaced: true,
    state: {
        currentId: 0,
    },
    mutations: {
        INCREMENT_ID(state) {
            state.currentId++;
        },
    },
    actions: {
        incrementIndex({ commit }) {
            commit('INCREMENT_ID');
        },
    },
}