// ChessGame.js
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
    this.lastMove = ["", "", ""];
    this.whiteShortCastle = true;
    this.whiteLongCastle = true;
    this.blackShortCastle = true;
    this.blackLongCastle = true;
    this.enPassantCol = -2; //If any pawn can be played en-passant
    this.playerTurn = true; //true for white and false for black
    this.halfMove = 0;
    this.fullMoveCount = 0;
    this.moveHistory = [];
  }

  getGamePieces() {
    let GamePieces = [[], []];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = this.gameBoardArr[row][col];
        if (piece != "") {
          if (isUpperCase(piece)) GamePieces[0].push(piece);
          else if (isLowerCase(piece)) GamePieces[1].push(piece);
        }
      }
    }

    return GamePieces;
  }
  playMove(cellId) {
    const [startRow, startCol] = cellCodeToIndex(this.selectedCell);
    const [endRow, endCol] = cellCodeToIndex(cellId);

    //get the piece for special moves
    let pieceOnSelectedCell = this.gameBoardArr[startRow][startCol];
    let pieceOnReachingCell = this.gameBoardArr[endRow][endCol];

    if (
      pieceOnSelectedCell.toLowerCase() == "p" ||
      pieceOnReachingCell.toLowerCase() == "p"
    ) {
      this.halfMove = 0;
    } else {
      this.halfMove++;
    }

    if (!this.playerTurn) this.fullMoveCount++;

    this.lastMove = [this.selectedCell, cellId, pieceOnReachingCell];
    this.moveHistory.push(this.lastMove);

    //verify there is a piece on selected cell
    if (pieceOnSelectedCell == "") return;

    //checking for special moves like en-passant, castling, promotions
    //check the piece if it is pawn king or rook then adjust the game position
    switch (pieceOnSelectedCell) {
      case "p":
      case "P": {
        //checking en-passant
        if (Math.abs(startRow - endRow) == 2) {
          //pawn has moved two steps allowing en-passant
          //setting up en-passant col which other pawn piece can get legal move upon
          this.enPassantCol = startCol;
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
          endCol == this.enPassantCol &&
          ((pieceOnSelectedCell == "P" &&
            startRow == 3 &&
            Math.abs(startCol - endCol) == 1) ||
            (pieceOnSelectedCell == "p" &&
              startRow == 4 &&
              Math.abs(startCol - endCol) == 1))
        ) {
          //play en-passant
          //kill the pawn
          this.gameBoardArr[startRow][this.enPassantCol] = "";
          //move the pawn
          this.gameBoardArr[startRow][startCol] = "";
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        } else {
          //move the pawn
          this.gameBoardArr[startRow][startCol] = "";
          this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        }
        break;
      }

      case "k":
      case "K": {
        //checking if player has played castling move 2 steps
        if (Math.abs(startCol - endCol) == 2) {
          //playing two step mean it is castling
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
      }

      case "r":
      case "R": {
        //if rook moves king can't castle that way
        //checking rook was on which side
        // Black rooks are on row 0, White rooks are on row 7
        if (pieceOnSelectedCell == "r") {
          // Black rook
          if (startCol == 0) this.blackLongCastle = false;
          if (startCol == 7) this.blackShortCastle = false;
        } else {
          // White rook
          if (startCol == 0) this.whiteLongCastle = false;
          if (startCol == 7) this.whiteShortCastle = false;
        }

        //move the rook
        this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        this.gameBoardArr[startRow][startCol] = "";
        break;
      }

      default: {
        this.gameBoardArr[endRow][endCol] = pieceOnSelectedCell;
        this.gameBoardArr[startRow][startCol] = "";

        if (pieceOnReachingCell.toLowerCase() == "r") {
          //rook was taken castling lost on that side
          if (pieceOnReachingCell == "r") {
            // Black rook was captured
            if (endCol == 0) this.blackLongCastle = false;
            if (endCol == 7) this.blackShortCastle = false;
          } else {
            // White rook was captured
            if (endCol == 0) this.whiteLongCastle = false;
            if (endCol == 7) this.whiteShortCastle = false;
          }
        }
        break;
      }
    }
    this.selectedCell = "";
    this.enPassantCol = -2; //reset en-passant column it is available for that move only
  }

  resetPosition() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // Row 0: Black pieces (top)
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
        }
        // Row 1: Black pawns
        else if (i == 1) {
          this.gameBoardArr[i][j] = "p";
        }
        // Row 6: White pawns
        else if (i == 6) {
          this.gameBoardArr[i][j] = "P";
        }
        // Row 7: White pieces (bottom)
        else if (i == 7) {
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
    this.playerTurn = playerTurn;
  }

  getMoves(cellName) {
    const [r, c] = cellCodeToIndex(cellName);

    if (this.gameBoardArr[r][c] == "") return [];

    let pieceAtPosition = this.gameBoardArr[r][c];
    let availableMoves = [];

    switch (pieceAtPosition) {
      case "p": // Black pawn moves down (increasing row)
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
      case "P": // White pawn moves up (decreasing row)
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
        // Add king moves
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            if (i == 0 && j == 0) continue;
            availableMoves.push([r + i, c + j]);
          }
        }
        break;
      case "K":
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            if (i == 0 && j == 0) continue;
            availableMoves.push([r + i, c + j]);
          }
        }
        if (this.whiteLongCastle) availableMoves.push([r, c - 2]);
        if (this.whiteShortCastle) availableMoves.push([r, c + 2]);
        break;
      case "r":
      case "R":
        for (let i = 0; i < 8; i++) {
          availableMoves.push([i, c]);
          availableMoves.push([r, i]);
        }
        break;
      case "q":
      case "Q":
        for (let i = 0; i < 8; i++) {
          availableMoves.push([i, c]);
          availableMoves.push([r, i]);
        }
      // Fall through to bishop moves
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

  // Helper method to check if a piece can attack a specific square
  canPieceAttack(fromRow, fromCol, toRow, toCol) {
    const piece = this.gameBoardArr[fromRow][fromCol];
    if (piece === "") return false;

    const pieceLower = piece.toLowerCase();

    switch (pieceLower) {
      case "p": {
        // Black pawn attacks down (increasing row), White pawn attacks up (decreasing row)
        const direction = isUpperCase(piece) ? -1 : 1;
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        return rowDiff === direction && colDiff === 1;
      }

      case "n": {
        // Knight moves in L-shape
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return (
          (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
        );
      }

      case "b": {
        // Bishop moves diagonally
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        if (rowDiff !== colDiff) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
      }

      case "r": {
        // Rook moves straight
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
      }

      case "q": {
        // Queen moves like bishop or rook
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        if (rowDiff === colDiff) {
          return this.isPathClear(fromRow, fromCol, toRow, toCol);
        } else if (fromRow === toRow || fromCol === toCol) {
          return this.isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
      }

      case "k": {
        // King moves one square in any direction
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff > 0;
      }

      default:
        return false;
    }
  }

  // Helper to check if path is clear for sliding pieces
  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.gameBoardArr[currentRow][currentCol] !== "") {
        return false; // Path blocked
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  inCheck(cellIndexToCheck, colourOfKing) {
    const [kingRow, kingCol] = cellIndexToCheck;

    // Check all squares on the board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameBoardArr[row][col];
        if (piece === "") continue;

        // Only check enemy pieces (opposite color of the king)
        const isWhitePiece = isUpperCase(piece);
        const kingIsWhite = colourOfKing === "w";

        // Skip if same color as king
        if ((isWhitePiece && kingIsWhite) || (!isWhitePiece && !kingIsWhite)) {
          continue;
        }

        // Check if this piece can attack the king's position
        if (this.canPieceAttack(row, col, kingRow, kingCol)) {
          return true;
        }
      }
    }
    return false;
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
      case "B": {
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
      }

      case "n":
      case "N": {
        const knightMoves = [
          [r + 2, c + 1],
          [r + 2, c - 1],
          [r - 2, c + 1],
          [r - 2, c - 1],
          [r - 1, c - 2],
          [r + 1, c - 2],
          [r - 1, c + 2],
          [r + 1, c + 2],
        ];

        legalMoves = knightMoves.filter(
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
      }

      case "p":
      case "P": {
        // White pawn moves up (-1), Black pawn moves down (+1)
        const pieceDirection = isUpperCase(pieceAtPosition) ? -1 : 1;

        // 2 steps if on starting row (White: row 6, Black: row 1)
        if (
          (pieceAtPosition == "P" && r == 6) ||
          (pieceAtPosition == "p" && r == 1)
        ) {
          if (
            this.gameBoardArr[r + pieceDirection][c] == "" &&
            this.gameBoardArr[r + pieceDirection + pieceDirection][c] == ""
          ) {
            legalMoves.push([r + 2 * pieceDirection, c]);
          }
        }

        // Move forward if no piece in front
        if (this.gameBoardArr[r + pieceDirection]?.[c] == "") {
          legalMoves.push([r + pieceDirection, c]);
        }

        // Diagonal captures
        if (
          isEnemy(
            pieceAtPosition,
            this.gameBoardArr[r + pieceDirection]?.[c + 1],
          )
        ) {
          legalMoves.push([r + pieceDirection, c + 1]);
        }
        if (
          isEnemy(
            pieceAtPosition,
            this.gameBoardArr[r + pieceDirection]?.[c - 1],
          )
        ) {
          legalMoves.push([r + pieceDirection, c - 1]);
        }

        // En-passant (White: row 3, Black: row 4)
        if (
          (pieceAtPosition == "P" && r == 3) ||
          (pieceAtPosition == "p" && r == 4)
        ) {
          if (this.enPassantCol == c - 1)
            legalMoves.push([r + pieceDirection, c - 1]);
          if (this.enPassantCol == c + 1)
            legalMoves.push([r + pieceDirection, c + 1]);
        }
        break;
      }

      case "k":
      case "K": {
        const isWhiteKing = pieceAtPosition === "K";
        const kingColor = isWhiteKing ? "w" : "b";

        // First, check if king is currently in check
        const kingInCheck = this.inCheck([r, c], kingColor);

        // All possible king moves (one square in any direction)
        const possibleMoves = [];
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = r + i;
            const newCol = c + j;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8)
              continue;

            const targetPiece = this.gameBoardArr[newRow][newCol];
            // Can't move to square occupied by own piece
            if (targetPiece !== "" && !isEnemy(pieceAtPosition, targetPiece))
              continue;
            possibleMoves.push([newRow, newCol]);
          }
        }

        // Check each possible move for safety
        for (const move of possibleMoves) {
          const [newRow, newCol] = move;
          const capturedPiece = this.gameBoardArr[newRow][newCol];

          // Make the move temporarily
          this.gameBoardArr[newRow][newCol] = pieceAtPosition;
          this.gameBoardArr[r][c] = "";

          // Check if king is in check after the move
          const wouldBeInCheck = this.inCheck([newRow, newCol], kingColor);

          // Undo the move
          this.gameBoardArr[r][c] = pieceAtPosition;
          this.gameBoardArr[newRow][newCol] = capturedPiece;

          if (!wouldBeInCheck) {
            legalMoves.push(move);
          }
        }

        // Castling logic (only if king is not in check)
        if (!kingInCheck) {
          // White king on row 7, Black king on row 0
          const kingRow = isWhiteKing ? 7 : 0;

          // Short castle (king side) - to column 6
          if (
            (isWhiteKing && this.whiteShortCastle) ||
            (!isWhiteKing && this.blackShortCastle)
          ) {
            if (this.canCastle(kingRow, 4, 6, isWhiteKing)) {
              legalMoves.push([r, c + 2]);
            }
          }

          // Long castle (queen side) - to column 2
          if (
            (isWhiteKing && this.whiteLongCastle) ||
            (!isWhiteKing && this.blackLongCastle)
          ) {
            if (this.canCastle(kingRow, 4, 2, isWhiteKing)) {
              legalMoves.push([r, c - 2]);
            }
          }
        }
        break;
      }

      default:
        return [];
    }

    return legalMoves;
  }

  // Helper method for castling validation
  canCastle(row, kingCol, targetCol, isWhiteKing) {
    const rookCol = targetCol === 2 ? 0 : 7;
    const rookPiece = isWhiteKing ? "R" : "r";

    // Check if rook is in correct position
    if (this.gameBoardArr[row][rookCol] !== rookPiece) {
      return false;
    }

    // Check if path is clear
    const step = targetCol > kingCol ? 1 : -1;
    let currentCol = kingCol + step;
    while (currentCol !== targetCol + step) {
      if (this.gameBoardArr[row][currentCol] !== "") {
        return false;
      }
      currentCol += step;
    }

    // Check that king doesn't pass through check
    const kingColor = isWhiteKing ? "w" : "b";
    const squaresToCheck = [kingCol, kingCol + step, targetCol];

    for (const col of squaresToCheck) {
      if (this.inCheck([row, col], kingColor)) {
        return false;
      }
    }

    return true;
  }

  getKingCell() {
    const kingToFind = this.playerTurn ? "K" : "k";

    for (let i = 0; i < this.gameBoardArr.length; i++) {
      for (let j = 0; j < this.gameBoardArr[i].length; j++) {
        if (this.gameBoardArr[i][j] == kingToFind) return [i, j];
      }
    }
    return null; // King not found
  }

  // Check if a move is legal (doesn't leave king in check)
  isMoveLegal(startRow, startCol, endRow, endCol) {
    const piece = this.gameBoardArr[startRow][startCol];
    if (piece === "") return false;

    const isWhite = isUpperCase(piece);
    const kingColor = isWhite ? "w" : "b";

    // If moving the king, check its new position
    let kingPos;
    if (piece.toLowerCase() === "k") {
      kingPos = [endRow, endCol];
    } else {
      kingPos = this.getKingCell();
      if (!kingPos) return false;
    }

    // Make the move temporarily
    const capturedPiece = this.gameBoardArr[endRow][endCol];
    this.gameBoardArr[endRow][endCol] = piece;
    this.gameBoardArr[startRow][startCol] = "";

    // Check if king is in check
    const isInCheck = this.inCheck(kingPos, kingColor);

    // Undo the move
    this.gameBoardArr[startRow][startCol] = piece;
    this.gameBoardArr[endRow][endCol] = capturedPiece;

    return !isInCheck;
  }
}
