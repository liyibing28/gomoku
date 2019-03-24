<template>
	<div>
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
		<div style="margin:0 auto;width:260px;">
			<span>当前在线用户: {{user.name}} 是: {{serverRole}}</span>
			<span>当前对战用户: {{opponent.name}} 是: {{0-serverRole}}</span>
		</div>

		<div :hidden="!isOver" style="margin:0 auto;width:150px;">
			<input type="button" value="重新开始" @click="reloadBegin" />
		</div>
	</div>
</template>

<script>
	  const boardY = 15;
  	const boardX = 15;
    export default {
        name: "Chess",
				data(){
            return {
                //isOver: false,
								board :  null,
                //currentPieceRole: 1, //是否应该是当前用户下棋
						}
				},
				created: function(){
            this.board = this.initBoard();
				},
				computed : {
            user() {
                return this.$store.state.user;
						},
						opponent() {
                return this.$store.state.opponent;
						},
						deskId() {
								return this.$store.state.deskId;
						},
						serverRole() {
                return this.$store.state.isHost;
						},
						boardRecord() {
                return this.$store.state.boardRecord;
						},
            currentPieceRole() {
                return this.$store.state.currentPieceRole;
						},
						isOver() {
                return this.$store.state.isOver;
						}
				},
				sockets : {
            serverClickPiece: function (position) {
								this.click(position.y,position.x);
            },
						break: function() {
								//vueHander.breakConnect();
                this.$alert('对方已经断开连接,即将返回主页', '游戏在中断！', {
                    confirmButtonText: '确定',
                    callback: action => {
                        this.$router.push('/');
                    }
                });
						},
				},
				methods : {
						//下子
            clickPiece(y,x){
                //判断是不是开始阶段
                if (this.IsOver) {
                    //msg.msg('还未开始');
                    return;
                }
								//判断是不是当前用户下棋
                if (this.serverRole !== this.currentPieceRole) {
                    //msg.msg('未到您落子');
                    return;
                }

                if(this.click(y,x)){
                    this.$socket.emit('clickPiece', {
                        x: x,
                        y: y,
                        deskId: this.deskId,
                        role: this.serverRole
                    });
								}
                console.log('currentPieceRole', this.currentPieceRole);

						},
						click(y,x){
                let currentVal = this.board[y][x];
                if (!this.IsOver && currentVal === 0) {
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
										let fall;
                    if (!this.verifySuccess(y, x)) {
                        fall = this.currentPieceRole;
                        fall = fall === 1 ? -1 : 1;
                        this.$store.dispatch('changeRole', fall);
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
                this.$store.dispatch('resetBoard').then(() =>{
                    this.board = this.initBoard();
								});

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

                console.log('computed已经计算！！！！');
                console.log(this.boardRecord);

                for(let index = 0; index < this.boardRecord.length; index++){
                    tempY[this.boardRecord[index].y][this.boardRecord[index].x] = this.boardRecord[index].role;
										//console.log(this.boardRecord[index].y);
                }

                this.$socket.emit('refreshSocket', this.user.socketId);

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
                this.$store.dispatch('gameOver', true);
                this.CurrentPieceRole = 1;
						}
				}
    }
</script>

<style>
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