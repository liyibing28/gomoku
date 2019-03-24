<template>
    <div>
        <ul>
            <div v-for="user in users" :key="user.socketId">
                <li> {{user.name}} </li>
                <li>{{user.isGaming}}</li>
                <button v-if="!user.isGaming" @click="applyGame(user.socketId)">请求对战</button>
            </div>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "Lobby",
        data() {
            return {
                users : [],
                opponentName: '',
            }
        },
        sockets: {
            queryAllUsers(users) {
                console.log('监听到返回值');
                console.log(users);
                this.users = users;
                console.log("sqhuxwnuxnuwx"+ this.users);
            },
            applyConnect: function (response) {
                this.opponentName = response.message;
                console.log('请求对战');
            }
        },
        mounted() {
            this.$socket.emit('queryAllUsers');
            console.log('一致性');
        },
        methods: {
            applyGame(socketId){
                console.log('msg: 请求已发送，等待对方同意');
                setTimeout(() =>{
                    this.$socket.emit('applyConnect', socketId);
                }, 500);
            }
        }
    }
</script>

<style scoped>

</style>