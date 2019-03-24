import Vue from 'vue'
import Vuex from 'vuex'
import { pieceColor} from "../constant/data";
import { pick,date,cloneDeep } from "../tools";
import createPersistedState from 'vuex-persistedstate'


Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

const defaultState = {
    // 玩家
    user: {},
    // 对手
    opponent: {},
    //是否是游戏发起者
    isHost : -1,
    // 轮到什么颜色下
    currentPieceRole : 1,
    // 结束1局
    isOver: false,
    // 下棋子数据
    boardRecord: [],
    allClients: [],
    //桌号
    deskId: 0,
    //是否在线
    online: false,
};

export default new Vuex.Store({
    state: cloneDeep(defaultState),
    mutations: {
        setUser(state, user){
            state.user = user;
        },
        setHost(state, isHost) {
            state.isHost = isHost;
        },
        setOpponent(state, playDesk) {
            let opponent = {
               name : playDesk.name,
               socketId : playDesk.socketId
            };
            state.opponent = opponent;
            state.deskId = playDesk.deskId;
        },
        // 重置数据
        reset (state) {
            let dState = cloneDeep(defaultState);
            for (const key in dState) {
                state[key] = dState[key];
            }
        },
        recordBoard (state, position) {
            state.boardRecord.push(position);
        },
        changeRole (state, fall) {
            state.currentPieceRole = fall;
        },
        setOver (state, isOver) {
            state.isOver = isOver
        },
        setOnline (state, isOnline) {
            state.online = isOnline;
        },
        resetBoard (state) {
            state.Boardrecord = [];
        }
    },
    actions: {
        joinLobby: ({commit}, user) => {
            console.log('swswswsjoinLobby:' + '   ' + user.name);
            commit('setUser', user);
        },
        setHost: ({commit}, isHost) => {
            console.log('set Host');
            commit('setHost', isHost);
        },
        setOpponent: ({commit}, playDesk) =>{
            commit('setOpponent', playDesk);
            console.log('对手姓名'+ playDesk.name);
        },
        reset: ({commit}) => {
            commit('reset');
        },
        recordBoard: ({commit}, position) => {
            commit('recordBoard', position);
        },
        changeRole: ({commit}, fall) => {
            commit('changeRole', fall);
        },
        gameOver: ({commit}, isOver) => {
            commit('setOver', isOver);
        },
        setOnline: ({commit}, isOnline) => {
            commit('setOnline', isOnline);
        },
        resetBoard: ({commit}) => {
            commit('resetBoard');
        }
    },
    plugins: [createPersistedState()]
});