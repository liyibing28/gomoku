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
	</div>
</template>

<script>
		const boardY = 15;
    const boardX = 15;
    export default {
        name: "Chess111",
        data() {
            return {
                isOver: true,
                board: null,
                currentPieceRole: 1,
                deskId: -1,
                serverRole: 0,
						}
        },
				sockets : {

				},
				computed : {
           user(){
               return this.$store.state.user;
					 },
						opponent(){
               return this.$store.state.opponent;
						},
				},
				mounted() {
					this.board = this.initBoard();
				},
        methods: {
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
            getBoardCellClass(y, x) {
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
            getPieceClass(y, x) {
                let classStr = ['piece'];
                let val = this.Board[y][x];
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
            clickPiece(y, x) {
                if (this.isOver) {
                    //msg.//msg('还未开始');
                    return;
                }

                if (this.serverRole !== this.CurrentPieceRole) {
                    //msg.//msg('未到您落子');
                    return;
                }

            },
        }
     }
</script>

<style scoped>
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
		background: url(../src/img/preview.jpg);
		padding-bottom: 40px;
	}

	table {
		margin: 0px auto 0px auto;
	}

	.user_ul li{
		cursor: pointer;
	}
</style>