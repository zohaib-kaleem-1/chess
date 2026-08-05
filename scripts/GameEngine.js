import { showBoard, showBoardPieces } from "./ChessBoard.js";
import { Game } from "./ChessGame.js";
import { showMoves } from "./ChessUI.js";

export class GameEngine {
  constructor(boardElementId) {
    this.boardElementId = boardElementId;
    this.game = new Game();
  }

  showBoard() {
    showBoard(this.boardElementId);
    showBoardPieces(this.game.gameBoardArr);
  }

  resetGame() {
    this.game.resetPosition();
  }

  setCustomPosition(arr, playerTurn) {
    this.game.setCustomGamePosition(arr, playerTurn);
  }

  getMoves(cellId) {
    return this.game.getLegalMoves(cellId);
  }

  showMoves(moves) {
    showMoves(moves, this.game.gameBoardArr);
  }
}
