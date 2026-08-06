// GameEngine.js
import { setUpTimer, showBoard, showBoardPieces } from "./ChessBoard.js";
import { Game } from "./ChessGame.js";
import {
  selectCell,
  showLastMove,
  showMoves,
  hideMoves,
  showCheck,
} from "./ChessUI.js";
import { cellCodeToIndex, indexToCellCode, isMove, log } from "./Helper.js";

export class GameEngine {
  constructor(boardElementId) {
    this.boardElementId = boardElementId;
    this.game = new Game();
    this.gameStatus = "continue";
  }

  resetGame() {
    this.game.resetPosition();
    this.isGameOver = false;
  }

  setCustomPosition(arr, playerTurn) {
    this.game.setCustomGamePosition(arr, playerTurn);
    this.game.playerTurn = playerTurn;
  }

  init() {
    // display game
    showBoard(this.boardElementId);
    showBoardPieces(this.game.gameBoardArr);
    setUpTimer();

    // Add event listeners to each cell
    document.querySelectorAll(".cell").forEach((cellElement) => {
      cellElement.addEventListener("click", () => {
        if (this.isGameOver) return;

        const cellId = cellElement.id;
        if (!cellId) return;

        // Check if this is a move (clicking on a highlighted square)
        if (isMove(cellId)) {
          this.game.playMove(cellId);
          showBoardPieces(this.game.gameBoardArr);
          showLastMove(this.game.lastMove);
          this.game.playerTurn = !this.game.playerTurn;
          this.checkGameState();
        } else {
          selectCell(cellId, this.game);
        }
      });
    });
  }

  checkGameState() {
    const kingPos = this.game.getKingCell();

    if (!kingPos) {
      // King was captured - game over
      this.isGameOver = true;
      this.game.isGameOver = true;
      this.game.gameResult = this.game.playerTurn ? "white" : "black";
      this.showGameOver();
      return;
    }

    const currentColor = this.game.playerTurn ? "w" : "b";
    const inCheck = this.game.inCheck(kingPos, currentColor);

    //checking insufficient material state

    // Check if the current player has any legal moves
    let hasLegalMoves = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.gameBoardArr[row][col];
        if (piece === "") continue;

        const isWhite = piece === piece.toUpperCase();
        if (
          (this.game.playerTurn && !isWhite) ||
          (!this.game.playerTurn && isWhite)
        ) {
          continue;
        }

        const cellCode = indexToCellCode([row, col]);
        const moves = this.game.getLegalMoves(cellCode);
        const legalMoves = moves.filter(([endRow, endCol]) => {
          return this.game.isMoveLegal(row, col, endRow, endCol);
        });

        if (legalMoves.length > 0) {
          hasLegalMoves = true;
          break;
        }
      }
      if (hasLegalMoves) break;
    }

    // Show check indicator
    if (inCheck) {
      showCheck(kingPos);
    }

    // Check for game over
    if (!hasLegalMoves) {
      this.isGameOver = true;
      this.game.isGameOver = true;

      if (inCheck) {
        // Checkmate
        this.game.gameResult = this.game.playerTurn ? "black" : "white";
        alert(`Checkmate! ${this.game.playerTurn ? "Black" : "White"} wins!`);
      } else {
        // Stalemate
        this.game.gameResult = "draw";
        alert("Stalemate! It's a draw!");
      }
    }
    console.log(kingPos);
  }

  showGameOverMessage() {}
}
