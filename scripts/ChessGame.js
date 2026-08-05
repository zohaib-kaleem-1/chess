import {
  cellCodeToIndex,
  getSlidingMoves,
  indexToCellCode,
  isEnemy,
  isLowerCase,
  isUpperCase,
} from "./Helper.js";

export class Game {
  constructor() {
    this.gameBoardArr = new Array(8).fill().map(() => new Array(8).fill(""));
    this.selectedCell = "";
    this.lastMove = [];
    this.whiteShortCastle = true;
    this.whiteLongCastle = true;
    this.blackShortCastle = true;
    this.blackLongCastle = true;
    this.enPessantCol = -2; //If any pawn can be played en-pessant
    this.playerTurn = true; //true for white and false for black
  }

  move(newPosition) {
    let startPositionIndex = cellCodeToIndex(this.selectedCell);
    let endPositionIndex = cellCodeToIndex(newPosition);

    this.gameBoardArr[endPositionIndex[0]][endPositionIndex[1]] =
      this.gameBoardArr[startPositionIndex[0]][startPositionIndex[1]];
    this.gameBoardArr[startPositionIndex[0]][startPositionIndex[1]] = "";

    this.lastMoveCell = [this.selectedCell, newPos];
  }

  resetPosition() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        //firstRow
        if (i == 0) {
          if (j == 0 || j == 7) {
            this.gameBoardArr[i][j] = "r";
          } else if (j == 1 || j == 6) {
            this.gameBoardArr[i][j] = "n";
          } else if (j == 2 || j == 5) {
            this.gameBoardArr[i][j] = "b";
          } else if (j == 3) {
            this.gameBoardArr[i][j] = "q";
          } else if (j == 4) {
            this.gameBoardArr[i][j] = "k";
          }
        } else if (i == 1) {
          this.gameBoardArr[i][j] = "p";
        } else if (i == 6) {
          this.gameBoardArr[i][j] = "P";
        } else if (i == 7) {
          if (j == 0 || j == 7) {
            this.gameBoardArr[i][j] = "R";
          } else if (j == 1 || j == 6) {
            this.gameBoardArr[i][j] = "N";
          } else if (j == 2 || j == 5) {
            this.gameBoardArr[i][j] = "B";
          } else if (j == 3) {
            this.gameBoardArr[i][j] = "Q";
          } else if (j == 4) {
            this.gameBoardArr[i][j] = "K";
          }
        } else {
          this.gameBoardArr[i][j] = "";
        }
      }
    }
  }

  setCustomGamePosition(arr, playerTurn) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.gameBoardArr[i][j] = arr[i][j];
      }
    }
  }

  getMoves(cellName) {
    const [r, c] = cellCodeToIndex(cellName);

    if (this.gameBoardArr[r][c] == "") return [];

    let pieceAtPosition = this.gameBoardArr[r][c];
    let availableMoves = [];

    switch (pieceAtPosition) {
      case "p":
        if (r == 1) {
          availableMoves = [
            [r + 2, c],
            [r + 1, c],
            [r + 1, c + 1],
            [r + 1, c - 1],
          ];
        } else {
          availableMoves = [
            [r + 1, c],
            [r + 1, c + 1],
            [r + 1, c - 1],
          ];
        }
        break;
      case "P":
        if (r == 6) {
          availableMoves = [
            [r - 2, c],
            [r - 1, c],
            [r - 1, c - 1],
            [r - 1, c + 1],
          ];
        } else {
          availableMoves = [
            [r - 1, c],
            [r - 1, c - 1],
            [r - 1, c + 1],
          ];
        }
        break;
      case "k":
        if (this.blackShortCastle) availableMoves.push([r, c + 2]);

        if (this.blackLongCastle) availableMoves.push([r, c - 2]);
      case "K":
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            if (i == 0 && j == 0) continue;
            availableMoves.push([r + i, c + j]);
          }
        }

        if (pieceAtPosition == "k") break;
        if (this.whiteLongCastle) availableMoves.push([r, c - 2]);
        if (this.whiteShortCastle) availableMoves.push([r, c + 2]);

        break;
      case "r":
      case "R":
      case "q":
      case "Q":
        for (let i = 0; i < 8; i++) {
          availableMoves.push([i, c]);
          availableMoves.push([r, i]);
        }
        if (pieceAtPosition.toLowerCase() == "r") break;
      case "b":
      case "B":
        for (let i = 0; i < 8; i++) {
          availableMoves.push([r + i, c + i]);
          availableMoves.push([r - i, c - i]);
          availableMoves.push([r - i, c + i]);
          availableMoves.push([r + i, c - i]);
        }
        break;
      case "n":
      case "N":
        availableMoves.push([r + 2, c - 1]);
        availableMoves.push([r + 2, c + 1]);

        availableMoves.push([r - 2, c - 1]);
        availableMoves.push([r - 2, c + 1]);

        availableMoves.push([r + 1, c + 2]);
        availableMoves.push([r - 1, c + 2]);

        availableMoves.push([r + 1, c - 2]);
        availableMoves.push([r - 1, c - 2]);
        break;
      default:
        return [];
    }

    //Remove out of board moves
    return availableMoves.filter(
      (moveIndex) =>
        moveIndex[0] >= 0 &&
        moveIndex[0] < 8 &&
        moveIndex[1] >= 0 &&
        moveIndex[1] < 8 &&
        !(moveIndex[0] == r && moveIndex[1] == c),
    );
  }

  inCheck(cellIndexToCheck, colourOfKing) {
    let defendingPiece = colourOfKing == "w" ? "P" : "p";
    let kingInCheck = false;

    for (let row = 0; !kingInCheck && row < 8; row++) {
      for (let col = 0; !kingInCheck && col < 8; col++) {
        let piece = this.gameBoardArr[row][col];

        if (piece == "") continue;

        //check moves of opponent piece
        if (this.isEnemy(piece, defendingPiece)) {
          let PieceCellName = indexToCellCode([row, col]);
          let PieceMoves = this.getLegalMoves(PieceCellName);

          if (
            PieceMoves.some(
              (index) =>
                index[0] == cellIndexToCheck[0] &&
                index[1] == cellIndexToCheck[1],
            )
          ) {
            kingInCheck = true;
          }
        }
      }
    }

    return kingInCheck;
  }

  getLegalMoves(cellCode) {
    let [r, c] = cellCodeToIndex(cellCode);
    let pieceAtPosition = this.gameBoardArr[r][c];
    let legalMoves = [];

    switch (pieceAtPosition) {
      case "q":
      case "Q":
      case "r":
      case "R":
      case "b":
      case "B":
        let direction = [];
        if (pieceAtPosition.toLowerCase() != "r") {
          direction.push([-1, -1], [1, 1], [-1, 1], [1, -1]);
        }

        if (pieceAtPosition.toLowerCase() != "b") {
          direction.push([-1, 0], [1, 0], [0, 1], [0, -1]);
        }

        getSlidingMoves(
          this.gameBoardArr,
          [r, c],
          direction,
          pieceAtPosition,
        ).forEach((move) => legalMoves.push(move));
        break;
      case "n":
      case "n":
        legalMoves.push([r + 2, c + 1]);
        legalMoves.push([r + 2, c - 1]);
        legalMoves.push([r - 2, c + 1]);
        legalMoves.push([r - 2, c - 1]);
        legalMoves.push([r - 1, c - 2]);
        legalMoves.push([r + 1, c - 2]);
        legalMoves.push([r - 1, c + 2]);
        legalMoves.push([r + 1, c + 2]);

        legalMoves = legalMoves.filter(
          (index) =>
            index[0] > -1 &&
            index[0] < 8 &&
            index[1] > -1 &&
            index[1] < 8 &&
            !(
              !isEnemy(
                this.gameBoardArr[index[0]][index[1]],
                pieceAtPosition,
              ) && this.gameBoardArr[index[0]][index[1]] != ""
            ),
        );
        break;

      case "p":
      case "P":
        //calculate if piece go up or down
        //if P mean white piece go up
        //if p mean black piece go down
        let pieceDirection = isUpperCase(pieceAtPosition) ? -1 : 1;

        //2 steps if on first line
        if (
          (pieceAtPosition == "P" && r == 6) ||
          (pieceAtPosition == "p" && r == 1)
        ) {
          if (
            this.gameBoardArr[r + pieceDirection][c] == "" &&
            this.gameBoardArr[r + pieceDirection + pieceDirection][c] == ""
          )
            legalMoves.push([r + 2 * pieceDirection, c]);
        }

        //move downward if no piece in front
        if (this.gameBoardArr[r + pieceDirection][c] == "")
          legalMoves.push([r + pieceDirection, c]);

        //if opponent piece in diagonal allow to catch that
        if (
          isEnemy(pieceAtPosition, this.gameBoardArr[r + pieceDirection][c + 1])
        )
          legalMoves.push([r + pieceDirection, c + 1]);
        if (
          isEnemy(pieceAtPosition, this.gameBoardArr[r + pieceDirection][c - 1])
        )
          legalMoves.push([r + pieceDirection, c - 1]);

        //Checking en-pessant pawn
        /**
         * there is enpessasnt column that says which column can pawn play en pessant
         * checking if that column is on left or right to it and it in on the specific row
         */

        //checking current pawn position
        if (
          (pieceAtPosition == "P" && r == 3) ||
          (pieceAtPosition == "p" && r == 4)
        ) {
          //can play enpessant see if it is valid
          console.log("");

          if (this.enPessantCol == c - 1)
            legalMoves.push([r + pieceDirection, c - 1]);
          if (this.enPessantCol == c + 1)
            legalMoves.push([r + pieceDirection, c + 1]);
        }
        break;
      case "k":
      case "K":
        break;
      default:
        return [];
    }

    return legalMoves;
  }

  getKingCell() {
    let kingToFind = "k";
    if (this.playerTurn) kingToFind = "K";

    for (let i = 0; i < this.gamBoardArr.length; i++) {
      for (let j = 0; j < this.gamBoardArr[i].length; j++) {
        if (this.gamBoardArr[i][j] == kingToFind) return [i, j];
      }
    }
  }
}
