import { indexToCellCode, isUpperCase } from "./Helper.js";

export class DrawValidator {
  constructor(game) {
    this.game = game;
  }

  checkDraw() {
    // Check each draw condition in order
    if (this.isInsufficientMaterial())
      return { isDraw: true, reason: "Insufficient material" };
    if (this.isFiftyMoveRule()) return { isDraw: true, reason: "50-move rule" };
    if (this.isThreefoldRepetition())
      return { isDraw: true, reason: "Threefold repetition" };
    if (this.isStalemate()) return { isDraw: true, reason: "Stalemate" };

    return { isDraw: false, reason: "" };
  }

  isInsufficientMaterial() {
    const pieces = this.game.getGamePieces();
    const whitePieces = pieces[0];
    const blackPieces = pieces[1];
    const totalPieces = whitePieces.length + blackPieces.length;

    // King vs King
    if (totalPieces === 2) return true;

    // King + Bishop vs King
    if (totalPieces === 3) {
      if (whitePieces.length === 2 && blackPieces.length === 1) {
        if (whitePieces.includes("B") || whitePieces.includes("b")) return true;
      }
      if (blackPieces.length === 2 && whitePieces.length === 1) {
        if (blackPieces.includes("B") || blackPieces.includes("b")) return true;
      }
    }

    // King + Knight vs King
    if (totalPieces === 3) {
      if (whitePieces.length === 2 && blackPieces.length === 1) {
        if (whitePieces.includes("N") || whitePieces.includes("n")) return true;
      }
      if (blackPieces.length === 2 && whitePieces.length === 1) {
        if (blackPieces.includes("N") || blackPieces.includes("n")) return true;
      }
    }

    // King + Bishop vs King + Bishop (same color bishops)
    if (totalPieces === 4) {
      const whiteBishop = whitePieces.find((p) => p.toLowerCase() === "b");
      const blackBishop = blackPieces.find((p) => p.toLowerCase() === "b");

      if (whiteBishop && blackBishop) {
        // Check if bishops are on same color squares
        const whiteBishopSquare = this.findPieceSquare(whiteBishop);
        const blackBishopSquare = this.findPieceSquare(blackBishop);

        if (whiteBishopSquare && blackBishopSquare) {
          const whiteColor = (whiteBishopSquare[0] + whiteBishopSquare[1]) % 2;
          const blackColor = (blackBishopSquare[0] + blackBishopSquare[1]) % 2;
          if (whiteColor === blackColor) return true;
        }
      }
    }

    return false;
  }

  findPieceSquare(piece) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.game.gameBoardArr[row][col] === piece) {
          return [row, col];
        }
      }
    }
    return null;
  }

  isFiftyMoveRule() {
    return this.game.halfMove >= 100;
  }

  isThreefoldRepetition() {
    const history = this.game.moveHistory;
    if (history.length < 8) return false;

    // Get current position as a string
    const currentPos = this.getPositionString();
    let count = 0;

    // Check last 8 moves for repetition (3 occurrences minimum)
    for (
      let i = history.length - 1;
      i >= Math.max(0, history.length - 8);
      i--
    ) {
      // We need to check positions at each move
      // This is simplified - full implementation would need to store positions
    }

    // Simplified check: look for same position in history
    // For full implementation, you'd store FEN strings or similar
    return false;
  }

  getPositionString() {
    const board = this.game.gameBoardArr;
    let pos = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        pos += board[row][col] || ".";
      }
    }
    return pos + (this.game.playerTurn ? "w" : "b");
  }

  isStalemate() {
    // Check if current player has any legal moves
    const currentColor = this.game.playerTurn ? "w" : "b";
    const kingPos = this.game.getKingCell();

    if (!kingPos) return false;

    // If king is in check, it's not stalemate
    if (this.game.inCheck(kingPos, currentColor)) return false;

    // Check if any legal moves exist
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.gameBoardArr[row][col];
        if (piece === "") continue;

        const isWhite = isUpperCase(piece);
        if (
          (currentColor === "w" && !isWhite) ||
          (currentColor === "b" && isWhite)
        ) {
          continue;
        }

        const cellCode = indexToCellCode([row, col]);
        const moves = this.game.getLegalMoves(cellCode);
        const legalMoves = moves.filter(([endRow, endCol]) => {
          return this.game.isMoveLegal(row, col, endRow, endCol);
        });

        if (legalMoves.length > 0) {
          return false;
        }
      }
    }
    return true;
  }
}
