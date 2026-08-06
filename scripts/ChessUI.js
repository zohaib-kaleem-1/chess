import {
  cellCodeToIndex,
  indexToCellCode,
  isLowerCase,
  isUpperCase,
} from "./Helper.js";

export function showMoves(moves, arr) {
  if (moves == null || arr == null) return;

  moves.forEach((index) => {
    let cellCode = indexToCellCode(index);
    if (!cellCode) return;

    if (arr[index[0]][index[1]] == "") {
      document.getElementById(cellCode).innerHTML +=
        '<div class="under-attack-dot"></div>';
    } else {
      document.getElementById(cellCode).innerHTML +=
        '<div class="under-attack-piece"></div>';
    }
  });
}

export function showLastMove(lastMoveCell) {
  let divToRemove = document.querySelectorAll("#last-move");
  divToRemove.forEach((div) => {
    div.remove();
  });

  lastMoveCell.forEach((i) => {
    const cell = document.getElementById(i);
    if (cell) {
      cell.innerHTML += '<div id="last-move"></div>';
    }
  });
}

export function hideMoves() {
  let divToRemove = document.querySelectorAll(
    ".under-attack-dot, .under-attack-piece",
  );

  if (divToRemove) divToRemove.forEach((div) => div.remove());
}

export function showCheck(kingPos) {
  // Remove existing check indicators
  document.querySelectorAll("#cell-check").forEach((el) => el.remove());

  const cellCode = indexToCellCode(kingPos);
  if (!cellCode) return;

  const cell = document.getElementById(cellCode);
  if (cell) {
    cell.innerHTML += '<div id="cell-check"></div>';
  }
}

export function selectCell(cellCode, game) {
  const [row, col] = cellCodeToIndex(cellCode);
  if (row === null || col === null) return;
  if (game.selectedCell == cellCode) return;

  if (game.selectedCell != "") hideMoves();

  const piece = game.gameBoardArr[row][col];

  // Check if it's the current player's piece
  const isWhite = piece === piece.toUpperCase();
  if ((game.playerTurn && !isWhite) || (!game.playerTurn && isWhite)) {
    return;
  }

  game.selectedCell = cellCode;
  const moves = game.getLegalMoves(cellCode);

  // Filter moves that are actually legal (king safety)
  const legalMoves = moves.filter(([endRow, endCol]) => {
    return game.isMoveLegal(row, col, endRow, endCol);
  });

  showMoves(legalMoves, game.gameBoardArr);
}
