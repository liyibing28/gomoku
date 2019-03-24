<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){
    return{
    }
  },
  computed : {
    online(){
      return this.$store.state.online;
    }
  },
  created (){
  },
  mounted(){
    this.setState();
  },
  sockets: {
  },
  methods:{
    setState(){
      if (this.online === false){
        this.$store.dispatch('reset');
      }
    },
    exitGame(){
      this.$socket.emit('disconnects');
      this.$store.dispatch('reset');
      this.$router.push('/');
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
  margin: 0px auto;
}
.el-header {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
