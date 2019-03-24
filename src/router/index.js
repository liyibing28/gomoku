import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Game from '../page/Game'
import Chess from '../page/Chess';
import Play from '../page/Play';
import Lobby from "../page/Lobby";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Play',
      component: Play
    },
    {
      path: '/Lobby',
      name: 'Lobby',
      component: Lobby
    },
    {
      path: '/Chess',
      name: 'Chess',
      component: Chess
    },
  ]
})
