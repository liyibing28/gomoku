// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/index'
import VueSocketIO from  'vue-socket.io';
import Vuex from 'vuex';
import createPersistedState from "vuex-persistedstate"
import socketio from 'socket.io-client';
//import MuseUI from 'muse-ui';
//import 'muse-ui/dist/muse-ui.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

//Vue.config.productionTip = false;


Vue.use(Vuex);
Vue.use(ElementUI);
//Vue.use(MuseUI);
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
  //options: { path: "/my-app/" } //Optional options
}));


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  render: h => h(App)
});
