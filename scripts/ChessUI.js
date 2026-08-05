import { indexToCellCode } from "./Helper.js";

export function showMoves(moves, arr) {
  if (moves == null || arr == null) {
    return;
  }

  hideMoves();
  moves.forEach((index) => {
    let cellCode = indexToCellCode(index);

    if (arr[index[0]][index[1]] == "") {
      document.getElementById(cellCode).innerHTML =
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
    document.getElementById(i).innerHTML += '<div id="last-move" ></div>';
  });
}
export function hideMoves() {
  let divToRemove = document.querySelectorAll(
    ".under-attack-dot, .under-attack-piece",
  );

  if (divToRemove) divToRemove.forEach((div) => div.remove());
}

export function selectCell(cellCode, game) {
  if (game.selectedCell == cellCode) return;
  if (game.selectedCell != "") hideMoves(game.arr);

  let row = 8 - parseInt(cellCode[1]);
  let col = cellCode[0].charCodeAt(0) - "a".charCodeAt(0);
  let PieceOnCell = game.arr[row][col].piece;

  if (
    (game.playerTurn && isLowerCase(PieceOnCell)) ||
    (!game.playerTurn && isUpperCase(PieceOnCell))
  )
    return;

  game.selectedCell = cellCode;
  const moves = game.getLegalMoves(cellCode);

  showMoves(moves, game.arr);
}
