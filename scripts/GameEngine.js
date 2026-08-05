import { setUpTimer, showBoard, showBoardPieces } from "./ChessBoard.js";
import { Game } from "./ChessGame.js";
import { showMoves } from "./ChessUI.js";

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
    //Add event listners
    document.querySelectorAll(".cell").forEach((cellElement) =>
      cellElement.addEventListener("click", () => {
        let cellId = cellElement.id;
        let moves = game.getMoves(cellId);

        if (false) {
        } else {
          game.showMoves(moves);
        }
      }),
    );

    //display game
    showBoard(this.boardElementId);
    showBoardPieces(this.game.gameBoardArr);
    setUpTimer();
  }
}
