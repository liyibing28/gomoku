<template>
	<el-container style="height: 700px; border: 1px solid #eee">
		<el-aside width="260px" style="background-color: rgb(238, 241, 246)">
			<el-row v-if="!online">
				<el-col :span="14"><el-input v-model="user.name" placeholder="请输入您的用户名"></el-input></el-col>
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
											:disabled="isGaming"
											size="mini"
											@click="apply1Play(scope.$index)">邀请</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-row>
		</el-aside>

		<el-container>
			<el-header style="text-align: center; font-size: 12px">
				<el-row v-if="isGaming">
					<el-col :span="6">我方 是: {{serverRole === -1? '黑' : '白'}}</el-col>
					<el-col :span="6">对方 是: {{0-serverRole === -1? '黑' : '白'}}</el-col>
					<el-col :span="5">当前 : {{currentPieceRole === -1? '黑' : '白'}}</el-col>
					<el-col :span="6" v-if="isGaming">
						<el-button @click="exitDesk">退出房间</el-button>
					</el-col>
				</el-row>
			</el-header>

			<el-main>
				<!--棋盘-->
				<div id="board_div">
					<table cellpadding="0" cellspacing="0">
						<tr v-for="(itemY,y) in board">
							<td v-for="(itemX,x) in itemY" :class="getBoardCellClass(y,x)" style="position: relative;">
								<div class="cell"></div>
								<div :class="getPieceClass(y,x)" @click="clickPiece(y,x)"></div>
							</td>
						</tr>
					</table>
				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
    const boardY = 15;
    const boardX = 15;
    export default {

        name: "Play",
        data() {
            return {
                clients : [],
                playDesk : {
                    AName : '',
                    ASocketId : '',
                    AIsReady: '',
                    BSocketId : '',
                    BIsReady : ''
                },
                board :  null,
								isGaming : false,
                serverRole : 0,
								currentPieceRole : -1,
            }
        },
				created() {
            this.$store.dispatch('reset');
            this.board = this.initBoard();
				},
        computed : {
            online() {
                return this.$store.state.online;
            },
            user() {
                return this.$store.state.user;
            },
            opponent() {
                return this.$store.state.opponent;
            },
            deskId() {
                return this.$store.state.deskId;
            },
            boardRecord() {
                return this.$store.state.boardRecord;
            },
        },
				sockets : {
            connection: function () {
                console.log('socket connected')
            },
            //加入游戏大厅回调
            joinLobby: function(socketId) {
                console.log('vue : ' + socketId);
                this.user.socketId = socketId;
                this.$store.dispatch('joinLobby', this.user).then(() =>{
                    this.isLog = true;
                });
                this.$store.dispatch('setOnline', true);
                //this.openAlertDialog();
            },
            //接收在线空闲玩家
            updateClients: function (clients) {
                this.clients = clients;
            },
						//收到对战请求
            applyConnect: function (playDesk) { //收到请求对战消息
                this.opponent.name = playDesk.AName;
                this.playDesk = playDesk;
                this.playRequest();
            },
						//双方确认加入游戏
            startPlay: function (playDesk) {
                if(playDesk !== false){
                    console.log('双方连接已经建立，可以跳转进入游戏'+ playDesk.name + playDesk.socketId);
                    this.isGaming = true;
                    this.$store.dispatch('setOpponent', playDesk).then(response => {

                    });
                }
            },
						//重置state状态
            reset: function () {
                this.$store.dispatch('reset');
            },
						//下子监听
            serverClickPiece: function (position) {
                this.click(position.y,position.x);
            },
            break: function() {
                //vueHander.breakConnect();
                this.$alert('对方已经断开连接,即将返回主页', '游戏在中断！', {
                    confirmButtonText: '确定',
                    callback: action => {
                        this.isGaming = !this.isGaming;
                        this.reloadBegin();
                        this.serverRole = 0;
                    }
                });
            },
				},
				methods : {
            //加入游戏大厅
            joinLobby(){
                this.$socket.emit('joinLobby', this.user.name);
                //this.$socket.emit('updateClients');
                //this.$router.push({name: 'Lobby'});
            },
						//申请对战
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
                this.serverRole = 1;
            },
						//收到对战请求之后弹出弹窗
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
						//同意加入对战
            agreePlay() {
                this.playDesk.BIsReady = true;
                this.serverRole = -1;
                this.$socket.emit('agreePlay', this.playDesk);
            },

						////关于下棋
            //下子
            clickPiece(y,x){
                //判断是不是游戏阶段
                if (!this.isGaming) {
                    console.log('还没有开始！');
                    return;
                }
                //判断是不是当前用户下棋
                if (this.serverRole !== this.currentPieceRole) {
                    //msg.msg('未到您落子');
										console.log('不该你下');
                    return;
                }

                if(this.click(y,x)){
                    this.$socket.emit('clickPiece', {
                        x: x,
                        y: y,
                        deskId: this.deskId,
                    });
                }
                console.log('currentPieceRole', this.currentPieceRole);

            },
            click(y,x){
                let currentVal = this.board[y][x];
                console.log('currentVak',currentVal);
                if (currentVal === 0) {
                    this.$set(this.board[y], x, this.currentPieceRole);
                    //this.board[y][x] = this.currentPieceRole;

                    this.$store.dispatch('recordBoard', {
                        y: y,
                        x: x,
                        role : this.currentPieceRole,
                    });

                    // boardRecord.push({
                    //     y: y,
                    //     x: x
                    // });
                    //

                    //判断是否胜利
                    if (!this.verifySuccess(y, x)) {
                        this.currentPieceRole = 0 - this.currentPieceRole;
                    } else {
                        //赢了结束游戏
                        console.log('赢了！！！！！！！！');
                        this.$confirm(this.getRoleName(this.currentPieceRole)+ '赢了', {
                            confirmButtonText: '再来一局',
                            cancelButtonText: '返回大厅',
                            type: 'warning'
                        }).then(() => {
                            this.reloadBegin();
                            this.over();
                        }).catch(() => {
														this.exitDesk();
                        });

                        //msg.msg(handler.getRoleName(this.currentPieceRole) + '赢了');
                        //vueHander.over();
                    }

                    return true;
                }
                return false;
            },
            getRoleName(role) {
                return role === 1 ? '白旗' : '黑旗';
            },
            //重新开始
            reloadBegin() {
								this.board = this.initBoard();
                this.currentPieceRole = -1;
            },
            //画棋盘
            getBoardCellClass: function (y, x) {
                let classStr = [];
                if (x === 0 && y > 0) {
                    classStr.push('left');
                }

                if (x < boardX - 1 && y > 0) {
                    classStr.push('right');
                }

                if (x < boardX - 1 && y < boardY) {
                    classStr.push('bottom');
                }
                return classStr.join(' ');
            },
            //获取棋子颜色
            getPieceClass(y,x){
                let classStr = ['piece'];
                let val = this.board[y][x];
                switch (val) {
                    case 1:
                        classStr.push('white');
                        break;
                    case -1:
                        classStr.push('black');
                        break;
                }
                return classStr.join(' ');
            },
            //初始化棋盘
            initBoard() {
                let tempY = [];
                for (let i = 0; i < boardY; i++) {
                    let tempX = [];
                    for (let z = 0; z < boardX; z++) {
                        tempX.push(0);
                    }
                    tempY.push(tempX);
                }
                return tempY;
            },
            verifySuccess(y, x) {
                function getContinuationPieceCount(callback) {
                    var count = 1;
                    for (let i = 1; i < 5; i++ , count++) {
                        if (!callback(i)) {
                            break;
                        }
                    }
                    for (let z = -1; z > -5; z-- , count++) {
                        if (!callback(z)) {
                            break;
                        }
                    }
                    return count === 5;
                }

                function legalY(i) {
                    return i > -1 && i < boardY;
                }

                function legalX(i) {
                    return i > -1 && i < boardX;
                }

                let yAxie = (() => {
                    return getContinuationPieceCount((i) => {
                        return legalY(y + i) && this.board[y + i][x] === this.currentPieceRole;
                    });
                });

                let xAxie = (() => {
                    return getContinuationPieceCount((i) => {
                        return legalX(x + i) && this.board[y][x + i] === this.currentPieceRole;
                    });
                });

                let yxAxie = (() => {
                    return getContinuationPieceCount((i) => {
                        return legalY(y + i) && legalX(x + i) && this.board[y + i][x + i] === this.currentPieceRole;
                    });
                });

                let xyAxie = (() => {
                    return getContinuationPieceCount((i) => {
                        return legalY(y - i) && legalX(x + i) && this.board[y - i][x + i] === this.currentPieceRole;
                    });
                });

                return xAxie() || yAxie() || yxAxie() || xyAxie();
            },
            over(){
                this.serverRole = 0-this.serverRole;
            },
            exitDesk(){
                this.isGaming = !this.isGaming;
                this.$socket.emit('exitDesk', this.deskId);
                this.reloadBegin();
                this.serverRole = 0;
						}

				}
    }
</script>

<style scoped>
	.el-header {
		background-color: #B3C0D1;
		color: #333;
		line-height: 60px;
	}

	.el-aside {
		color: #333;
	},
	.el-row {
		margin-bottom: 1px;
	}
	.home {
		width: 500px;
		margin: 0 auto;
		text-align: center;
	}
	.display {
		margin: 20px;
	}
	.cell {
		width: 40px;
		height: 40px;
	}

	.piece {
		margin-top: -12px;
		margin-left: -12px;
		width: 60%;
		height: 60%;
		z-index: 90;
		position: absolute;
		border-radius: 50%;
	}

	.piece.white {
		background-color: #fff;
		-webkit-box-shadow: inset 0px 0px 0px 1px #000;
		-moz-box-shadow: inset 0px 0px 0px 1px #000;
		box-shadow: inset 0px 0px 0px 1px #000;
	}

	.piece.black {
		background-color: #000;
		-webkit-box-shadow: inset 0px 0px 0px 1px #000;
		-moz-box-shadow: inset 0px 0px 0px 1px #000;
		box-shadow: inset 0px 0px 0px 1px #000;
	}

	.bottom {
		border-bottom: 1px solid #000;
	}

	.left {
		border-left: 1px solid #000;
	}

	.top {
		border-top: 1px solid #000;
	}

	.right {
		border-right: 1px solid #000;
	}

	#board_div {
	//background: url(../img/preview.jpg);
		background: aliceblue;
		padding-bottom: 40px;
	}

	table {
		margin: 0px auto 0px auto;
	}

	.user_ul li{
		cursor: pointer;
	}
</style>