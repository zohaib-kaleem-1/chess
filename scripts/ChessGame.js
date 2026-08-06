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

  playMove(cellId) {
    const [startRow, startCol] = cellCodeToIndex(this.selectedCell);
    const [endRow, endCol] = cellCodeToIndex(cellId);

    //get the piece for special moves
    let pieceOnSelectedCell = this.gameBoardArr[startRow][startCol];
    let pieceOnReachingCell = this.gameBoardArr[endRow][endCol];

    this.lastMove = [this.selectedCell, cellId];
    //verify there is a piece on selected cell
    if (pieceOnSelectedCell == "") return;

    //checking for special moves like en-pessant, castling, promotions
    //check the piece if it is pawn king or rook then adjust the game position
    switch (pieceOnSelectedCell) {
      case "p":
      case "P":
        //there are two special moves castling and en-pessant
        //checking en-pessant
        if (Math.abs(startRow - endRow) == 2) {
          //pawn has moved two steps allowing en-pessant
          //setting up en-pessant col which other pawn piece can get legal move upon
          this.enPessantCol = startCol;
          this.selectedCell = "";
          this.gameBoardArr[startRow][startCol] = "";
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;

          return;
        }
        //promotion
        else if (endRow % 7 == 0) {
          //pawn has reached other side of board row 0 or 7
          //TODO: add other promotions too
          //play move and make it a queen for now
          this.gameBoardArr[startRow][startCol] = "";
          this.gameBoardArr[endRow][endCol] = "Q";
        } else if (
          endCol == this.enPessantCol &&
          ((pieceOnSelectedCell == "P" &&
            startRow == 3 &&
            Math.abs(startCol - endCol) == 1) ||
            (pieceOnSelectedCell == "p" &&
              startRow == 4 &&
              Math.abs(startCol - endCol) == 1))
        ) {
          //play en-pessant
          //kill the pawn
          this.gameBoardArr[startRow][this.enPessantCol] == "";

          //move the pawn
          this.gameBoardArr[startRow][startCol] = "";
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        } else {
          //move the pawn
          this.gameBoardArr[startRow][startCol] = "";
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        }

        break;

      case "k":
      case "K":
        //checking if player has played castling move 2 steps
        if (Math.abs(startCol - endCol) == 2) {
          //playing two step mean it is castling
          //? moves are showing because get legal moves checked it was not in check also had no piece between them also if player had moved the castling rights would have been lost

          //see if player is castling to king or queen side and store the rook index of that side
          //default queen side
          let rookIndex = [startRow, 0];
          if (startCol - endCol == -2) {
            //castling king side
            rookIndex = [startRow, 7];
          }

          //move the king to new position
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
          this.gameBoardArr[startRow][startCol] = "";

          //move the rook beside king
          this.gameBoardArr[rookIndex[0]][rookIndex[1]] = "";
          this.gameBoardArr[startRow][startCol + (endCol - startCol) / 2] =
            pieceOnSelectedCell == "k" ? "r" : "R";
        } else {
          //move the king to new position
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
          this.gameBoardArr[startRow][startCol] = "";
        }

        //set castling false for later
        if (pieceOnSelectedCell == "k") {
          this.blackLongCastle = false;
          this.blackShortCastle = false;
        } else {
          this.whiteLongCastle = false;
          this.whiteShortCastle = false;
        }
        break;

      case "r":
      case "R":
        //if rook moves king can't castle that way
        //checking rook was on which side
        if (startRow % 7 == 0) {
          if (startCol == 7) {
            if (pieceAtPosition == "r") this.blackShortCastle = false;
            else this.whiteShortCastle = false;
          }
          if (startCol == 0) {
            if (pieceAtPosition == "r") this.blackLongCastle = false;
            else this.whiteLongCastle = false;
          }
        }

        //move the rook
        this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        this.gameBoardArr[startRow][startCol] = "";
        break;
      default:
        this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        this.gameBoardArr[startRow][startCol] = "";

        if (pieceOnReachingCell.toLowerCase() == "r") {
          //rook was taken castling lost on that side
          if (pieceOnReachingCell == "r") {
            if (endCol == 7) this.blackShortCastle = false;
            else if (endCol == 0) this.blackLongCastle = false;
          } else {
            if (endCol == 7) this.whiteShortCastle = false;
            else if (endCol == 0) this.whiteLongCastle = false;
          }
        }
        break;
    }
    this.selectedCell = "";
    this.enPessantCol = -2; //reset en-pessant column it is available for that move only
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
        if (isEnemy(piece, defendingPiece)) {
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

    console.log("checked for checks");

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
      case "N":
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
          if (this.enPessantCol == c - 1)
            legalMoves.push([r + pieceDirection, c - 1]);
          if (this.enPessantCol == c + 1)
            legalMoves.push([r + pieceDirection, c + 1]);
        }
        break;
      case "k":
      case "K":
        //adding legal box moves of king
        for (let i = -1; i < 2 && i + r < 8 && i + r > -1; i++) {
          for (let j = -1; j < 2 && c + j < 8 && c + j > -1; j++) {
            if (i == 0 && j == 0) continue;

            if (
              (this.gameBoardArr[r + i][c + j] == "" ||
                isEnemy(pieceAtPosition, this.gameBoardArr[r + i][c + j])) &&
              !this.inCheck([r + i][j + c], pieceAtPosition == "k" ? "b" : "w")
            )
              legalMoves.push([r + i, c + j]);
          }
        }

        /**
         * Checking castling
         * castling rules:
         *  king or rook have not moved before
         *  king must no be in check
         *  the square king pass through should not be in check
         *
         * for that we have boolean variable short castle and long castle if king moves or rook gets killed or moves it become false
         * we just have to check for checks and no piece between
         */

        //getting current king colour and row if he has not moves his indexes are pre-defined
        let kingColour = pieceAtPosition == "k" ? "b" : "w";
        let kingRow = kingColour == "b" ? 0 : 7;

        //checking if king can short castle (not moved yet)
        if (
          (kingColour == "b" && this.blackShortCastle) ||
          (kingColour == "w" && this.whiteShortCastle)
        ) {
          //check if cells are empty
          if (
            this.gameBoardArr[kingRow][5] == "" &&
            this.gameBoardArr[kingRow][6] == ""
          ) {
            //check for checks for cell king has to move c, c+1, c+2 c is fixed for king not moved 4
            if (
              !this.inCheck([kingRow, 4], kingColour) &&
              !this.inCheck([kingRow, 5], kingColour) &&
              !this.inCheck([kingRow, 6], kingColour)
            ) {
              //Also check for empty squares
              legalMoves.push([r, c + 2]);
            }
          }
        }

        if (
          (kingColour == "b" && this.blackLongCastle) ||
          (kingColour == "w" && this.whiteLongCastle)
        ) {
          //check if cells are empty
          if (
            this.gameBoardArr[kingRow][3] == "" &&
            this.gameBoardArr[kingRow][2] == ""
          ) {
            //check for checks for cell king has to move c, c-1, c-2 c is fixed for king not moved 4
            if (
              !this.inCheck([kingRow, 3], kingColour) &&
              !this.inCheck([kingRow, 3], kingColour) &&
              !this.inCheck([kingRow, 2], kingColour)
            ) {
              //Also check for empty squares
              legalMoves.push([r, c - 2]);
            }
          }
        }
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
