<template>
  <div class="home">
    <el-row v-if="!online">
      <el-col :span="18"><el-input v-model="user.name" placeholder="请输入您的用户名"></el-input></el-col>
      <el-col :span="6"><el-button @click="joinLobby">加入游戏</el-button></el-col>
    </el-row>
    <el-row v-if="online">
      <el-col :span="24">当前玩家: {{user.name}}</el-col>
    </el-row>
    <el-row class="display" v-if="online">
      <el-table
              :data="clients"
              style="width: 100%">
        <el-table-column
                label="玩家姓名"
                prop="name">
        </el-table-column>
        <el-table-column align="right" label="操作">
          <template slot-scope="scope">
            <el-button
                    size="mini"
                    @click="apply1Play(scope.$index)">邀请</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Hello',
  data () {
    return {
      message: '',
      opponent: {
        name: '',
        socketId: '',
      },
      playDesk : {
        AName : '',
        ASocketId : '',
        AIsReady: '',
        BSocketId : '',
        BIsReady : ''
      },
      clients : [],
    }
  },
  computed : {
    online() {
      return this.$store.state.online;
    },
    user() {
      return this.$store.state.user;
    }
  },
  created () {
    if(this.online === true){
      this.isLog = true;
      this.$socket.emit('refreshSocket', this.user.socketId);
    }
    else {
      this.$store.dispatch('reset');
    }
    //this.$store.dispatch('reset');
  },
  sockets: {
    connection: function () {
      console.log('socket connected')
    },
    joinLobby: function(socketId) {
      console.log('vue : ' + socketId);
      this.user.socketId = socketId;
      this.$store.dispatch('joinLobby', this.user).then(() =>{
        this.isLog = true;
      });
      this.$store.dispatch('setOnline', true);
      //this.openAlertDialog();
    },
    applyConnect: function (playDesk) { //收到请求对战消息
      this.opponent.name = playDesk.AName;
      this.playDesk = playDesk;
      this.playRequest();
    },
    startPlay: function (playDesk) {
      if(playDesk !== false){
        console.log('双方连接已经建立，可以跳转进入游戏'+ playDesk.name + playDesk.socketId);
        this.$store.dispatch('setOpponent', playDesk).then(response => {
          this.$router.push('Chess');
        });
      }
    },
    updateClients: function (clients) {
      this.clients = clients;
    },
    reset: function () {
      this.$store.dispatch('reset');
    }
  },
  methods: {
    playRequest(){
      this.$confirm('请求与您对战', {
        confirmButtonText: '接受',
        cancelButtonText: '拒绝',
        type: 'warning'
      }).then(() => {
        this.agreePlay();
      }).catch(() => {

      });
    },
    joinLobby(){
      this.$socket.emit('joinLobby', this.user.name);
      //this.$socket.emit('updateClients');
      //this.$router.push({name: 'Lobby'});
    },
    openAlertDialog () {
      this.openAlert = true;
    },
    closeAlertDialog () {
      this.openAlert = false;
    },
    apply1Play (index) {
      console.log(index);
      let playDesk = {
        ASocketId : this.user.socketId,
        AIsReady: true,
        BSocketId : this.clients[index].socketId,
        BIsReady : false
      };
      this.$store.dispatch('setHost', 1);
      this.$socket.emit('applyConnect', playDesk);
    },
    agreePlay() {
      this.applyPlay = false;
      this.playDesk.BIsReady = true;
      this.$socket.emit('agreePlay', this.playDesk);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .home {
    width: 500px;
    margin: 0 auto;
    text-align: center;
  }
  .display {
    margin: 20px;
  }
</style>
