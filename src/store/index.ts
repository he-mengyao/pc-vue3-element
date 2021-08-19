import { createStore } from "vuex";

export default createStore({
  state: {
    list: localStorage.getItem('navlist'),
    path: localStorage.getItem('path')
  },
  mutations: {
    setList(state, data) {
      state.list = data
    },
    setPath(state, data) {
      state.path = data
    }
  },
  actions: {},
  modules: {},
});
