import { setUpTimer, showBoard, showBoardPieces } from "./ChessBoard.js";
import { Game } from "./ChessGame.js";
import { selectCell, showLastMove, showMoves } from "./ChessUI.js";
import { cellCodeToIndex, isMove } from "./Helper.js";

export class GameEngine {
  constructor(boardElementId) {
    this.boardElementId = boardElementId;
    this.game = new Game();
  }

  resetGame() {
    this.game.resetPosition();
  }

  setCustomPosition(arr, playerTurn) {
    this.game.setCustomGamePosition(arr, playerTurn);
  }

  init() {
    // display game
    showBoard(this.boardElementId);
    showBoardPieces(this.game.gameBoardArr);
    setUpTimer();

    // Add event listeners to each cell: use this.game and UI showMoves
    document.querySelectorAll(".cell").forEach((cellElement) => {
      cellElement.addEventListener("click", () => {
        const cellId = cellElement.id;

        if (isMove(cellId)) {
          this.game.playMove(cellId);
          showBoardPieces(this.game.gameBoardArr);
          showLastMove(this.game.lastMove);
          this.game.playerTurn = !this.game.playerTurn;
        } else {
          selectCell(cellId, this.game);
        }
      });
    });
  }
}
